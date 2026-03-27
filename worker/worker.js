// ============================================================================
// HAREM ALTIN ASİSTAN - AKILLI ANALİZ WORKER'I (worker.js)
// Bu dosya, ana UI thread'ini dondurmamak için IndexedDB üzerinden tüm 
// geçmişi asenkron okur ve Günlük, Haftalık, Aylık analizleri hesaplar.
// ============================================================================

const DB_NAME = 'HaremAIAssistantDB';
const STORE_NAME = 'priceHistory';

function getDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

self.onmessage = async (e) => {
    if (e.data === 'analyze') {
        try {
            const db = await getDB();
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.getAll();

            req.onsuccess = () => {
                const data = req.result;
                const results = processSmartAnalysis(data);
                self.postMessage({ status: 'success', data: results });
            };

            req.onerror = () => {
                self.postMessage({ status: 'error', error: 'IDB Okuma Hatasi' });
            };
        } catch (err) {
            self.postMessage({ status: 'error', error: err.message });
        }
    }
};

function processSmartAnalysis(items) {
    const hist = {};
    items.forEach(itm => {
        if (!hist[itm.key]) hist[itm.key] = [];
        hist[itm.key].push(itm);
    });

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    
    const analysis = {};

    for (let key in hist) {
        // Zaman siralamasi
        hist[key].sort((a, b) => a.t - b.t);
        const arr = hist[key];
        
        analysis[key] = {
            daily: calcPeriodData(arr, now, 1 * DAY),
            day3:  calcPeriodData(arr, now, 3 * DAY),
            weekly: calcPeriodData(arr, now, 7 * DAY),
            monthly: calcPeriodData(arr, now, 30 * DAY)
        };
    }
    
    return analysis;
}

function calcPeriodData(arr, now, ms) {
    const cutoff = now - ms;
    const filtered = arr.filter(x => x.t >= cutoff);
    if (filtered.length < 2) return null;
    
    const first = filtered[0].v;
    const last = filtered[filtered.length - 1].v;
    const pct = ((last - first) / first) * 100;
    
    let sum = 0, min = filtered[0].v, max = filtered[0].v;
    for (let i = 0; i < filtered.length; i++) {
        const v = filtered[i].v;
        sum += v;
        if (v < min) min = v;
        if (v > max) max = v;
    }
    
    // Volatilite (Oynaklik): (En Yüksek - En Düşük) / En Düşük %
    const volatility = min > 0 ? ((max - min) / min) * 100 : 0;
    const avg = sum / filtered.length;
    
    // Trend Tespiti
    let trend = 'yatay';
    // Gunluk veya ufak surelerde +-0.3%
    let thr = 0.3; 
    // Daha uzun periyotlarda threshold'u arttiriyoruz
    if (ms >= 3 * 24 * 60 * 60 * 1000) thr = 1.0; 
    if (ms >= 7 * 24 * 60 * 60 * 1000) thr = 2.0; 

    if (pct > thr) trend = 'yukari';
    else if (pct < -thr) trend = 'asagi';
    
    return {
        pct: Number(pct.toFixed(2)),
        avg: Number(avg.toFixed(2)),
        min: min,
        max: max,
        volatility: Number(volatility.toFixed(2)),
        trend: trend
    };
}
