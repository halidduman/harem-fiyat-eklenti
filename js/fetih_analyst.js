/**
 * Fetih Analiz Motoru v1.0
 * Yerel kural tabanlı finans analiz sistemi.
 * AI yok | Harici API yok | Hafif ve stabil.
 */

(function () {
    'use strict';

    /* ─── YAPILANDIRMA ─── */
    const CFG = {
        DB_NAME: 'FetihAnalyst',
        DB_VERSION: 1,
        STORE: 'prices',
        MAX_AGE_MS: 6 * 30 * 24 * 60 * 60 * 1000,   // 6 ay
        COLLECT_INTERVAL_MS: 60 * 1000,               // 1 dakika
        FAST_INTERVAL_MS: 15 * 1000,                  // 15 saniye (aktif piyasada)
        SHORT_WINDOW: 3,
        LONG_WINDOW: 10,
        ASSETS: ['HAS', 'CEYREK', 'ONS'], // Has, Çeyrek ve Ons odaklı
        ROTATION_INTERVAL_MS: 30000, // Daha seyrek rotasyon (30 saniye)
    };

    /* ─── İZLENEN VARLIKLAR ─── */
    const ASSET_KEYS = {
        'HAS':    ['val-has-sell',  'Has Altın'],
        'CEYREK': ['val-ceyrek-sell', 'Çeyrek Altın'],
        'ATA':    ['val-ata-sell',  'Ata Altın'],
        'ONS':    ['val-ons-sell',  'Ons Altın'],
    };

    /* ─── DURUM ─── */
    let db = null;
    let botTimer = null;
    let collectTimer = null;
    let commentTimer = null;
    let cachedAnalysis = {}; // asset -> { comments, idx }

    /* ═══════════════════════════════════════
       IndexedDB
    ═══════════════════════════════════════ */
    function openDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(CFG.DB_NAME, CFG.DB_VERSION);
            req.onupgradeneeded = (e) => {
                const d = e.target.result;
                if (!d.objectStoreNames.contains(CFG.STORE)) {
                    const store = d.createObjectStore(CFG.STORE, { keyPath: 'id', autoIncrement: true });
                    store.createIndex('asset_time', ['asset', 'ts'], { unique: false });
                    store.createIndex('ts', 'ts', { unique: false });
                }
            };
            req.onsuccess = (e) => resolve(e.target.result);
            req.onerror = (e) => reject(e.target.error);
        });
    }

    function saveRecord(asset, price) {
        if (!db) return;
        const tx = db.transaction(CFG.STORE, 'readwrite');
        tx.objectStore(CFG.STORE).add({ asset, price, ts: Date.now() });
    }

    function countRecords(asset) {
        return new Promise((resolve) => {
            if (!db) return resolve(0);
            const tx = db.transaction(CFG.STORE, 'readonly');
            const store = tx.objectStore(CFG.STORE);
            const idx = store.index('asset_time');
            const range = IDBKeyRange.bound([asset, 0], [asset, Date.now()]);
            const req = idx.count(range);
            req.onsuccess = (e) => resolve(e.target.result || 0);
            req.onerror = () => resolve(0);
        });
    }

    function getLastRecord() {
        // Tüm asset'ler arasından en son kaydedilen veriyi bul
        return new Promise((resolve) => {
            if (!db) return resolve(null);
            const tx = db.transaction(CFG.STORE, 'readonly');
            const store = tx.objectStore(CFG.STORE);
            const idx = store.index('ts');
            const req = idx.openCursor(null, 'prev');
            req.onsuccess = (e) => resolve(e.target.result ? e.target.result.value : null);
            req.onerror = () => resolve(null);
        });
    }

    function getRecords(asset, limit) {
        return new Promise((resolve) => {
            if (!db) return resolve([]);
            const tx = db.transaction(CFG.STORE, 'readonly');
            const store = tx.objectStore(CFG.STORE);
            const idx = store.index('asset_time');
            const range = IDBKeyRange.bound([asset, 0], [asset, Date.now()]);
            const req = idx.openCursor(range, 'prev');
            const results = [];
            req.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor && results.length < limit) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results.reverse()); // eskiden yeniye
                }
            };
            req.onerror = () => resolve([]);
        });
    }

    function getLevelRecords(asset, since) {
        return new Promise((resolve) => {
            if (!db) return resolve([]);
            const tx = db.transaction(CFG.STORE, 'readonly');
            const store = tx.objectStore(CFG.STORE);
            const idx = store.index('asset_time');
            const range = IDBKeyRange.bound([asset, since], [asset, Date.now()]);
            const req = idx.getAll(range);
            req.onsuccess = (e) => resolve(e.target.result || []);
            req.onerror = () => resolve([]);
        });
    }

    function pruneOldData() {
        if (!db) return;
        const cutoff = Date.now() - CFG.MAX_AGE_MS;
        const tx = db.transaction(CFG.STORE, 'readwrite');
        const store = tx.objectStore(CFG.STORE);
        const idx = store.index('ts');
        const range = IDBKeyRange.upperBound(cutoff);
        idx.openCursor(range).onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) { cursor.delete(); cursor.continue(); }
        };
    }

    /* ═══════════════════════════════════════
       VERİ OKUMA – DOM'dan mevcut fiyatı al
    ═══════════════════════════════════════ */
    function readCurrentPrice(asset) {
        const [elId] = ASSET_KEYS[asset] || [];
        if (!elId) return null;
        const el = document.getElementById(elId);
        if (!el || !el.textContent || el.textContent === '--') return null;
        const num = parseFloat(el.textContent.replace(/\./g, '').replace(',', '.'));
        return isNaN(num) ? null : num;
    }

    /* ═══════════════════════════════════════
       ANALİZ
    ═══════════════════════════════════════ */
    function calcPctChange(a, b) {
        if (!a || a === 0) return 0;
        return ((b - a) / a) * 100;
    }

    function detectTrend(records) {
        if (records.length < 2) return 'neutral';
        let ups = 0, downs = 0;
        for (let i = 1; i < records.length; i++) {
            if (records[i].price > records[i - 1].price) ups++;
            else if (records[i].price < records[i - 1].price) downs++;
        }
        const total = records.length - 1;
        if (ups / total >= 0.7) return 'up';
        if (downs / total >= 0.7) return 'down';
        return 'neutral';
    }

    function detectMomentum(records) {
        if (records.length < 4) return 'stable';
        const changes = [];
        for (let i = 1; i < records.length; i++) {
            changes.push(Math.abs(calcPctChange(records[i - 1].price, records[i].price)));
        }
        const half = Math.floor(changes.length / 2);
        const early = changes.slice(0, half).reduce((a, b) => a + b, 0) / half;
        const late  = changes.slice(half).reduce((a, b) => a + b, 0) / (changes.length - half);
        if (late > early * 1.15) return 'accelerating';
        if (late < early * 0.85) return 'decelerating';
        return 'stable';
    }

    /* ─── ÇOKLU ZAMAN DİLİMİ (Multi-Timeframe) HESAPLAMA ─── */
    function getTimeframeChange(records, currentPrice, hoursBack) {
        if (!records || records.length === 0) return null;
        const now = Date.now();
        const targetMs = hoursBack * 60 * 60 * 1000;
        
        let bestRecord = null;
        let minDiff = Infinity;
        
        for (const r of records) {
            const age = now - r.ts;
            const diff = Math.abs(age - targetMs);
            // İstenen süreye en yakın kaydı bul (en az %50'si kadar geçmiş olmalı)
            if (diff < minDiff && age >= targetMs * 0.5) { 
                minDiff = diff;
                bestRecord = r;
            }
        }
        
        if (!bestRecord) return null;
        const pct = calcPctChange(bestRecord.price, currentPrice);
        const diffTL = +(currentPrice - bestRecord.price).toFixed(2);
        return { pct: +pct.toFixed(2), price: bestRecord.price, diffTL: diffTL };
    }

    async function calcLevels(asset) {
        const now = Date.now();
        const [daily, weekly, monthly] = await Promise.all([
            getLevelRecords(asset, now - 24 * 60 * 60 * 1000),
            getLevelRecords(asset, now - 7  * 24 * 60 * 60 * 1000),
            getLevelRecords(asset, now - 30 * 24 * 60 * 60 * 1000),
        ]);
        const minmax = (arr) => {
            if (!arr.length) return null;
            const prices = arr.map(r => r.price);
            return { high: Math.max(...prices), low: Math.min(...prices) };
        };
        return {
            daily:   minmax(daily),
            weekly:  minmax(weekly),
            monthly: minmax(monthly),
        };
    }

    /* ─── HAFTA SONU TESPİTİ ─── */
    function isWeekend() {
        const day = new Date().getDay();
        return day === 0 || day === 6;
    }

    /* ─── SEVİYE YORUMU ─── */
    function buildLevelComment(currentPrice, levels) {
        if (!currentPrice || !levels) return null;
        const PCT = 1.0; // ±1% yakınlık eşiği

        const check = (level, highMsg, lowMsg) => {
            if (!level) return null;
            const rangeH = level.high * (PCT / 100);
            const rangeL = level.low  * (PCT / 100);
            if (Math.abs(currentPrice - level.high) <= rangeH) return highMsg;
            if (Math.abs(currentPrice - level.low)  <= rangeL) return lowMsg;
            return null;
        };

        return (
            check(levels.daily,   'Günlük zirveye yakın.', 'Günlük dipte.')   ||
            check(levels.weekly,  'Haftalık zirveye yakın.', 'Haftalık dipte.') ||
            check(levels.monthly, 'Aylık zirveye yakın.', 'Aylık dipte.')     ||
            null
        );
    }

    /* ─── ANA ANALİZ FONKSİYONU ─── */
    async function analyzeAsset(asset) {
        const now = Date.now();
        // Tüm geçmişi çek (Aylık dahil)
        let records = await getLevelRecords(asset, now - 31 * 24 * 60 * 60 * 1000);
        
        if (records.length < 3) {
            records = await getRecords(asset, CFG.LONG_WINDOW + 1);
        }

        const label = ASSET_KEYS[asset][1];

        if (records.length < 2) {
            return [`${label}: Analiz için veri toplanıyor...`];
        }

        records.sort((a, b) => a.ts - b.ts);
        const current = readCurrentPrice(asset) ?? records[records.length - 1].price;
        const messages = [];

        // Yardımcı mesaj oluşturucu
        const createMsg = (rec, category) => {
            if (!rec) return null;
            const diffTL = +(current - rec.price).toFixed(2);
            const diffPct = +calcPctChange(rec.price, current).toFixed(2);
            // %1 altındaki "normal" değişimleri raporlama (USER REQUEST)
            if (Math.abs(diffPct) < 1.0) return null;

            const sign = diffTL > 0 ? '+' : '';
            const pctColor = diffTL > 0 ? '#4ade80' : (diffTL < 0 ? '#f87171' : '#9ca3af');
            const dirWord = diffTL > 0 ? 'yükselişte' : (diffTL < 0 ? 'düşüşte' : 'yatay');
            
            const gapMs = now - rec.ts;
            const gapMin = Math.floor(gapMs / 60000);
            const gapH = Math.floor(gapMin / 60);
            const gapD = Math.floor(gapH / 24);
            
            let timeStr = 'Az önce';
            if (gapD > 0) timeStr = `${gapD}g önce`;
            else if (gapH > 0) timeStr = gapMin % 60 > 0 ? `${gapH}sa ${gapMin % 60}dk` : `${gapH}sa`;
            else if (gapMin > 0) timeStr = `${gapMin}dk`;

            let m = `${label} <span style="display:inline-block;width:1px;height:12px;background:var(--primary);margin:0 10px;vertical-align:middle;opacity:0.5"></span> `;
            m += `${sign}${diffTL} TL <span style="color:${pctColor}">%${sign}${diffPct}</span> ${dirWord}.`;
            m += ` <span style="color:gray; opacity:0.85; font-size:0.9em; margin-left:6px; display:inline-flex; align-items:center; gap:4px; vertical-align:middle;">
                <span class="material-symbols-outlined" style="font-size:14px;">schedule</span>${timeStr}ye göre
            </span>`;
            
            // Sert Hareket Kontrolü (>= %1.5 değişim "Sert" kabul edilir)
            if (Math.abs(diffPct) >= 1.5) {
                const emojiDir = diffTL > 0 ? 'Hızlı yükseliş' : 'Hızlı düşüş';
                m = `🚀 ${emojiDir}: ${m}`;
            }

            return m;
        };

        const findBestRecord = (targetMsBack, fallback) => {
            const targetTs = now - targetMsBack;
            const limitTs = now - targetMsBack * 2; // tolerans
            let best = null;
            let minDiff = Infinity;
            for (let i = records.length - 1; i >= 0; i--) {
                const r = records[i];
                if (r.ts < limitTs && best) break;
                const diff = Math.abs(r.ts - targetTs);
                if (diff < minDiff) {
                    minDiff = diff;
                    best = r;
                }
            }
            return best || fallback;
        };

        // 1. Kısa Vade (1 dk öncesi)
        const shortRec = findBestRecord(60 * 1000, records[records.length - 2]);
        const shortMsg = createMsg(shortRec, 'Kısa Vade');
        if (shortMsg) messages.push(shortMsg);

        // 2. Günlük (24 saat)
        const dailyRec = findBestRecord(24 * 60 * 60 * 1000, null);
        const dailyMsg = createMsg(dailyRec, 'Günlük');
        if (dailyMsg) messages.push(dailyMsg);

        // 3. Haftalık (7 gün)
        const weeklyRec = findBestRecord(7 * 24 * 60 * 60 * 1000, null);
        const weeklyMsg = createMsg(weeklyRec, 'Haftalık');
        if (weeklyMsg) messages.push(weeklyMsg);

        // 4. Aylık (30 gün)
        const monthlyRec = findBestRecord(30 * 24 * 60 * 60 * 1000, null);
        const monthlyMsg = createMsg(monthlyRec, 'Aylık');
        if (monthlyMsg) messages.push(monthlyMsg);

        // Sadece önemli olanları veya trend değişimlerini filtrele (Gürültü azaltma)
        // Eğer çok fazla mesaj varsa, sadece önemli olanları (Spike veya >= %0.1 günlük değişim) tutabiliriz.
        return messages;
    }

    /* ─── DASHBOARD API ─── */
    window.getFetihAssetAnalysis = async function(asset) {
        const now = Date.now();
        const records = await getLevelRecords(asset, now - 31 * 24 * 60 * 60 * 1000);
        const current = readCurrentPrice(asset);
        if (!current && records.length === 0) return null;
        
        const price = current ?? records[records.length - 1]?.price;
        
        const findAt = (msBack) => {
            const target = now - msBack;
            let best = null;
            let minDiff = Infinity;
            // 2 saatlik tolerans (verinin seyrek olma ihtimaline karşı)
            const tolerance = Math.max(msBack * 0.2, 2 * 60 * 60 * 1000); 
            
            for (const r of records) {
                const diff = Math.abs(r.ts - target);
                if (diff < minDiff && diff < tolerance) {
                    minDiff = diff;
                    best = r;
                }
            }
            if (!best) return null;
            return { 
                price: best.price, 
                pct: +calcPctChange(best.price, price).toFixed(2),
                diffTL: +(price - best.price).toFixed(2)
            };
        };

        const levels = await calcLevels(asset);
        const range = levels.monthly || levels.weekly || levels.daily;

        // Gelişmiş Insight mantığı
        const day = findAt(24 * 60 * 60 * 1000);
        const week = findAt(7 * 24 * 60 * 60 * 1000);
        
        let insight = `<b>${ASSET_KEYS[asset][1]}</b> şu anda stabilize olmuş durumda. `;
        
        if (day) {
            const dir = day.pct > 0 ? 'yükseliş' : 'düşüş';
            const intensity = Math.abs(day.pct) > 0.5 ? 'belirgin bir' : 'hafif';
            if (Math.abs(day.pct) > 0.05) {
                insight = `<b>${ASSET_KEYS[asset][1]}</b> son 24 saatte ${intensity} ${dir} grafiği çiziyor. `;
            }
        }
        
        if (range) {
            if (price >= range.high * 0.995) insight += "Mevcut fiyat, periyodun en yüksek seviyelerinde seyrediyor (Zirve direnci).";
            else if (price <= range.low * 1.005) insight += "Fiyat şu an periyodun dip seviyelerinde, destek bulmaya çalışıyor.";
            else insight += `Varlık, periyodun orta bandında (${range.low} - ${range.high}) hareket ediyor.`;
        }

        return {
            current: price,
            yesterday: day,
            weekly: week,
            monthly: findAt(30 * 24 * 60 * 60 * 1000),
            range: range,
            insight: insight
        };
    };

    /* ═══════════════════════════════════════
       VERİ TOPLAMA
    ═══════════════════════════════════════ */
    async function collectSnapshot() {
        for (const asset of CFG.ASSETS) {
            const price = readCurrentPrice(asset);
            if (price !== null) saveRecord(asset, price);
        }
        pruneOldData();
        await runAnalysis();
    }

    async function runAnalysis() {
        // Önce yeterli veri var mı kontrol et
        const progressMsg = await getProgressMessage();
        if (progressMsg) {
            const msg = document.getElementById('asst-msg');
            setMessage(msg, progressMsg);
            return;
        }

        const results = [];
        for (const asset of CFG.ASSETS) {
            try {
                const comments = await analyzeAsset(asset);
                if (comments && comments.length) {
                    if (Array.isArray(comments)) results.push(...comments);
                    else results.push(comments);
                }
            } catch (_) { /* sessiz geç */ }
        }
        if (results.length) {
            // Sadece "Önemli" mesajlar varsa veya periyodik analiz yapılıyorsa güncelle
            // Kullanıcı gürültüden şikayetçi olduğu için rotasyonu seyreltiyoruz.
            cachedAnalysis.comments = results;
            cachedAnalysis.idx = 0;
            rotateComment();
        }
    }

    function rotateComment() {
        if (!cachedAnalysis.comments || !cachedAnalysis.comments.length) return;
        const msg = document.getElementById('asst-msg');
        if (!msg) return;
        
        // Eğer dashboard açıksa rotasyonu durdurabiliriz ama gerek yok.
        const text = cachedAnalysis.comments[cachedAnalysis.idx % cachedAnalysis.comments.length];
        
        // Sadece Önemli veya yüksek oranlı mesajları göster
        const isImportant = text.includes('🚀') || text.includes('🚨') || text.includes('⚠️');
        
        if (isImportant || Math.random() > 0.7) { // %30 şansla normal mesajlar çıksın
            cachedAnalysis.idx++;
            setMessage(msg, text);
        } else {
            // Eğer önemli değilse bir sonrakine geçmeyi dene
            cachedAnalysis.idx++;
            // Çok derin recursion olmasın diye sınırlı tutulabilir ama 15-30 sn'de bir çalıştığı için sorun olmaz.
        }
    }

    function highlightMsg(text) {
        if (!text) return '';
        const GOLD = '#e9c176';
        let s = text; // HTML tag'lerini escape ETME (manuel span kullanıyoruz)
        s = s.replace(/([+-]?\d+[,.]?\d*%)(?![\w])/g, `<span style="color:${GOLD};font-weight:700">$1</span>`);
        const assets = ['Has Altın','Çeyrek Altın','Ons Altın','Ata Altın','Has','Çeyrek','Ons','Ata'];
        assets.forEach(a => {
            const rx = new RegExp(`(?<![\\w\u00c0-\u017f])(${a})(?![\\w\u00c0-\u017f])`, 'gi');
            s = s.replace(rx, `<span style="color:${GOLD};font-weight:700">$1</span>`);
        });
        return s;
    }

    function setMessage(el, text, isUrgent = false) {
        if (!el || (el.innerHTML === text && !isUrgent)) return;
        el.innerHTML = highlightMsg(text);

        // Eğer acil uyarı varsa (hem canlı takipten hem botun kendisinden gelebilir) sesi çal
        if (text.includes('⚠️')) {
            const isDown = text.toLowerCase().includes('düşüş') || text.toLowerCase().includes('geriledi');
            if (isDown && window._fetihPlayDown) {
                window._fetihPlayDown();
            } else if (!isDown && window._fetihPlayUp) {
                window._fetihPlayUp();
            }
        }

        const trigger = document.getElementById('fetih-bot-trigger');
        if (trigger) {
            trigger.classList.add('is-open');
            if (botTimer) clearTimeout(botTimer);
            // Acil mesajlar 8 saniye kalsın, normal mesajlar 12 saniye (15sn rotasyon - 3sn boşluk)
            const duration = isUrgent ? 8000 : 12000;
            botTimer = setTimeout(() => trigger.classList.remove('is-open'), duration);
        }
    }

    async function getProgressMessage() {
        // Kaç veri puanı var ve analize kadar kaç gerekiyor
        const counts = await Promise.all(CFG.ASSETS.map(a => countRecords(a)));
        const minCount = Math.min(...counts);
        const needed = 2; // en az 2 nokta gerekli
        if (minCount >= needed) return null; // yeterli veri var
        const remaining = needed - minCount;
        return `Analiz için veri toplanıyor... (${minCount}/${needed} — ${remaining} veri daha)`;
    }

    async function buildStartupMessage() {
        const last = await getLastRecord();
        if (!last) {
            return 'İlk başlatılma. Veriler toplanıyor...';
        }
        const gapMs  = Date.now() - last.ts;
        const gapH   = Math.floor(gapMs / 3_600_000);
        const gapMin = Math.floor((gapMs % 3_600_000) / 60_000);

        let msg = '';
        if (gapH > 0)        msg = `Son veri ${gapH}sa ${gapMin}dk önce kaydedilmiş. `;
        else if (gapMin > 2) msg = `Son veri ${gapMin}dk önce kaydedilmiş. `;

        const progressMsg = await getProgressMessage();
        msg += progressMsg || 'Analiz hazırlanıyor...';
        return msg;
    }

    /* ═══════════════════════════════════════
       PERFORMANS KONTROLLERİ
    ═══════════════════════════════════════ */
    function getCollectInterval() {
        // Eğer cihazın cpu hızı uygunsa 30 dk, değilse 1 saat
        if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency >= 4) {
            return CFG.FAST_INTERVAL_MS;
        }
        return CFG.COLLECT_INTERVAL_MS;
    }

    /* ─── CEYREK ve ATA için yardımcı mapping ─── */
    function patchAssetElements() {
        // harem_core.js tabloyu her saniye günceller.
        // CEYREK ve ATA'nın sell hücresine id atamaya çalışırız.
        const tryFind = (keywords, assignId) => {
            if (document.getElementById(assignId)) return;
            const rows = document.querySelectorAll('#sync-tbody tr');
            rows.forEach(row => {
                const nameCell = row.querySelector('td:first-child');
                if (!nameCell) return;
                // harem_core cleanName: boşluk yok, büyük harf
                const clean = nameCell.textContent.trim().toUpperCase().replace(/\s+/g, '');
                if (keywords.some(k => clean.includes(k))) {
                    const sellCell = row.querySelector('td:nth-child(3)');
                    if (sellCell && !sellCell.id) sellCell.id = assignId;
                }
            });
        };

        // Çeyrek Altın — olası isimler
        tryFind(['ÇEYREK', 'CEYREK', 'ESKICEYREK', 'ESKİÇEYREK', 'ÇEYREKALTIN'], 'val-ceyrek-sell');
        // Ata Altın — olası isimler
        tryFind(['ATAALTIN', 'ATAALTINI', 'ESKIATA', 'ESKİATA', 'ATA'], 'val-ata-sell');
        // Ons — zaten val-ons-sell var, ama alternatif tablo satırından da deneyelim
        tryFind(['ONS', 'ONSALTIN'], 'val-ons-sell');
    }

    /* ═══════════════════════════════════════
       DIŞ ENTEGRASYON – Ani Hareket Bildirimi
    ═══════════════════════════════════════ */
    window.fetihBotNotify = function(text, iconName = 'notifications_active', iconColor = '#f87171') {
        const msg = document.getElementById('asst-msg');
        if (!msg) return;

        // Mesajı ayarla
        setMessage(msg, text, true);

        // İkonu ve rengini geçici olarak değiştir
        const iconEl = document.querySelector('.siri-icon');
        const orbEl  = document.querySelector('.siri-orb');
        const trigger = document.getElementById('fetih-bot-trigger');

        if (iconEl) {
            const originalIcon    = 'smart_toy';
            const originalColor   = '';
            const originalBg      = orbEl ? orbEl.style.background : '';
            const originalBorder  = trigger ? trigger.style.borderColor : '';

            iconEl.textContent  = iconName;
            iconEl.style.color  = iconColor;

            // Orb arka planını OPAK yap (arkadaki yazı görünmesin diye)
            if (orbEl) {
                orbEl.style.background = iconColor === '#4ade80' ? '#1b3a25' : '#3a1b1b'; // Koyu yeşil/kırmızı opak tonlar
            }

            // Dış border rengini değiştir
            if (trigger) {
                trigger.style.borderColor = iconColor;
            }

            setTimeout(() => {
                iconEl.textContent = originalIcon;
                iconEl.style.color = originalColor;
                if (orbEl) orbEl.style.background = originalBg;
                if (trigger) trigger.style.borderColor = originalBorder;
            }, 9000);
        }
    };

    /* ═══════════════════════════════════════
       BAŞlAT
    ═══════════════════════════════════════ */
    async function init() {
        try { db = await openDB(); } catch (e) {
            console.warn('[FetihAnalyst] IndexedDB açılamadı:', e);
        }

        const interval = getCollectInterval();

        // Sayfa yüklenir yüklenmez geçmiş veriden bekleme/boşluk mesajı göster
        setTimeout(async () => {
            const msg = document.getElementById('asst-msg');
            const startupMsg = await buildStartupMessage();
            setMessage(msg, startupMsg);
        }, 2000);

        // İlk snapshot'u harem_core yerleştikten sonra al
        setTimeout(() => {
            patchAssetElements();
            collectSnapshot();
            collectTimer = setInterval(() => {
                patchAssetElements();
                collectSnapshot();
            }, 5000); // 5 saniyede bir kontrol et (ID atamaları için önemli)
        }, 8000);

        // Yorum rotasyonu: 30 saniyede bir (Kullanıcı isteğiyle gürültü azaltıldı)
        commentTimer = setInterval(rotateComment, CFG.ROTATION_INTERVAL_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
