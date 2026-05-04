importScripts('indexeddb-helper.js');

const db = new GoldMarketDB();

const CONSTANTS = {
    CEYREK_HAS: 1.606,
    YARIM_HAS: 3.210,
    TAM_HAS: 6.420,
    ATA_HAS: 6.600,
};

chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.get('fetchGoldData', (alarm) => {
        if (!alarm) {
            chrome.alarms.create('fetchGoldData', { periodInMinutes: 15 });
        }
    });
    // Run immediately on install
    fetchAndAnalyzeData();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'fetchGoldData') {
        fetchAndAnalyzeData();
    }
});

async function fetchAndAnalyzeData() {
    try {
        const response = await fetch('https://canlidoviz.com/altin-fiyatlari/kapali-carsi?_t=' + Date.now());
        if (!response.ok) throw new Error('API isteği başarısız');
        const text = await response.text();

        // Parse HTML to get prices
        const priceData = parsePricesFromHTML(text);
        if (!priceData || !priceData.hasAltin) return;

        // Save to DB
        await db.savePriceData(priceData);

        // Prune old data
        await db.pruneOldData();

        // Run Analysis
        await analyzeData(priceData);
    } catch (error) {
        console.error('Data fetch error:', error);
    }
}

function parsePricesFromHTML(html) {
    const data = {};
    const regex = /<tr[^>]*>[\s\S]*?<span[^>]*itemprop="name"[^>]*>(.*?)<\/span>[\s\S]*?<td[^>]*data-column="buy"[^>]*>([\d,.]+)<\/td>[\s\S]*?<td[^>]*data-column="sell"[^>]*>([\d,.]+)<\/td>/gi;
    
    // Altın fiyatları sayfasındaki regex'in çalışması zordur (HTML çok değişkendir). 
    // Daha güvenilir bir regex veya parsing gerekir ama background'da DOMParser yoktur.
    // Bu yüzden Regex ile belli değerleri yakalayacağız:
    
    const lines = html.split('\n');
    let currentName = '';
    
    // DOMParser is not available in ServiceWorker. We can use a regex approach to extract values.
    const extractVal = (name) => {
        const blockRegex = new RegExp(`<span[^>]*>(?:\\s*)?${name}(?:\\s*)?<\\/span>[\\s\\S]*?<span dt="amount">(.*?)<\\/span>[\\s\\S]*?<span dt="amount">(.*?)<\\/span>`, 'i');
        const match = html.match(blockRegex);
        if (match) {
            return parseFloat(match[2].replace('.', '').replace(',', '.')); // Sell price
        }
        return null;
    };

    data.hasAltin = extractVal('Has Altın');
    data.ceyrek = extractVal('Çeyrek Altın Eski');
    if(!data.ceyrek) data.ceyrek = extractVal('Çeyrek Altın \\(Eski\\)');
    data.yarim = extractVal('Yarım Altın Eski');
    data.tam = extractVal('Tam Altın Eski');
    data.ata = extractVal('Ata Altın Eski');

    // Fallback parsing if structure is different
    if(!data.hasAltin) {
       // Just mock data extraction if regex fails for this example, 
       // but ideally we should fetch an API. Since we use HTML, we will try best effort regex.
       const matchHas = html.match(/Has Altın[\s\S]*?dt="amount">([\d,.]+)</i);
       if(matchHas) data.hasAltin = parseFloat(matchHas[1].replace('.','').replace(',','.'));
       
       const matchCeyrek = html.match(/Çeyrek Altın (?:Eski)?[\s\S]*?dt="amount">([\d,.]+)</i);
       if(matchCeyrek) data.ceyrek = parseFloat(matchCeyrek[1].replace('.','').replace(',','.'));
    }

    return data;
}

async function analyzeData(currentData) {
    const reports = [];

    // 1. İşçilik (Premium) Analizi
    if (currentData.ceyrek && currentData.hasAltin) {
        const teorikDeger = CONSTANTS.CEYREK_HAS * currentData.hasAltin;
        const iscilikBedeli = currentData.ceyrek - teorikDeger;
        const makasOrani = (iscilikBedeli / currentData.ceyrek) * 100;

        if (makasOrani > 3) {
            reports.push({
                type: 'iscilik',
                msg: `Dikkat: Çeyrek altın işçiliği normal altınlardan daha pahalı, piyasada fiziki prim yüksek. (İşçilik: %${makasOrani.toFixed(1)})`
            });
        }
    }

    // 2. Zaman Serisi ve Trend Analizi (RoC)
    // 1 gün = 24 * 60 * 60 * 1000
    const oneDayMs = 24 * 60 * 60 * 1000;
    const pastRecords = await db.getHistoryByTime(oneDayMs * 1.5); // Get last 1.5 days

    if (pastRecords && pastRecords.length > 0 && currentData.hasAltin) {
        // Find record closest to 24h ago
        const targetTime = Date.now() - oneDayMs;
        let bestRecord = pastRecords[0];
        let minDiff = Math.abs(bestRecord.timestamp - targetTime);

        for (const record of pastRecords) {
            const diff = Math.abs(record.timestamp - targetTime);
            if (diff < minDiff) {
                minDiff = diff;
                bestRecord = record;
            }
        }

        if (bestRecord && bestRecord.hasAltin) {
            const P_t_n = bestRecord.hasAltin;
            const P_guncel = currentData.hasAltin;
            const roc = ((P_guncel - P_t_n) / P_t_n) * 100;
            const fark = Math.abs(P_guncel - P_t_n).toFixed(2);

            let trendMsg = '';
            if (roc >= -0.5 && roc <= 0.5) {
                trendMsg = 'Altın fiyatları düne göre stabil.';
            } else if (roc > 1.5) {
                trendMsg = `Şu an hızlı bir artış görünüyor! Fiyatlar düne göre ${fark} TL fazla.`;
            } else if (roc < -1.5) {
                trendMsg = `Fiyatlarda sert bir düşüş var, dünden bu yana ${fark} TL değer kaybı yaşandı.`;
            } else {
                trendMsg = roc > 0 ? `Düne göre ılımlı bir yükseliş var (+%${roc.toFixed(2)}).` : `Düne göre hafif bir geri çekilme var (-%${Math.abs(roc).toFixed(2)}).`;
            }

            reports.push({
                type: 'gunluk',
                msg: trendMsg
            });
        }
    }

    // Save generated reports to session storage for popup to read
    chrome.storage.session.set({
        'fetih_reports': reports,
        'fetih_current_price': currentData.hasAltin,
        'fetih_last_update': Date.now()
    });
}
