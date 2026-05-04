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
        COLLECT_INTERVAL_MS: 60 * 60 * 1000,          // 1 saat (varsayılan)
        FAST_INTERVAL_MS: 30 * 60 * 1000,             // 30 dakika (performans uygunsa)
        SHORT_WINDOW: 3,
        LONG_WINDOW: 10,
        ASSETS: ['HAS', 'CEYREK', 'ATA', 'ONS'],
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
        return { pct: +pct.toFixed(2), price: bestRecord.price };
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
        // Son 6.5 saatlik tüm verileri çek (Çoklu zaman dilimi için)
        let records = await getLevelRecords(asset, Date.now() - 6.5 * 60 * 60 * 1000);
        
        // Eğer veritabanında çok az kayıt varsa, eski yöntemle son N adeti almayı garantile
        if (records.length < 3) {
            records = await getRecords(asset, CFG.LONG_WINDOW + 1);
        }

        const label = ASSET_KEYS[asset][1];

        if (records.length < 2) {
            return `${label}: Analiz için veri toplanıyor...`;
        }

        // Kronolojik sırala
        records.sort((a, b) => a.ts - b.ts);

        const first   = records[0].price;
        const prev    = records[records.length - 2].price;
        const current = readCurrentPrice(asset) ?? records[records.length - 1].price;

        // ── FARK HESABI ──
        const diffTL  = +(current - prev).toFixed(2);
        const diffPct = +calcPctChange(prev, current).toFixed(2);
        const absPct  = Math.abs(diffPct);

        // ── HAFTA SONU + SABİT KONTROL ──
        const allSame = records.every(r => r.price === first);
        if (allSame && isWeekend()) {
            return `${label} değişim yok. Piyasa kapalı, fiyatlar yatay seyrediyor.`;
        }
        if (diffTL === 0 || absPct < 0.001) {
            return `${label} değişmedi (0.00%). Piyasa yatay.`;
        }

        // ── DURUM ──
        const sign    = diffTL > 0 ? '+' : '';
        const dirWord = diffTL > 0 ? 'yükseldi' : 'geriledi';
        const pctColor = diffTL > 0 ? '#4ade80' : '#f87171'; // Yeşil veya kırmızı

        // ── ACİL HAREKET (≥ %1) ──
        if (absPct >= 1.0) {
            const emojiDir = diffTL > 0 ? 'Ani yükseliş' : 'Sert düşüş';
            return `⚠️ ${emojiDir}: ${label} ${sign}${diffTL} TL <span style="color:${pctColor}">%${sign}${diffPct}</span> hızlı ${diffTL > 0 ? 'arttı' : 'geriledi'}.`;
        }

        // Ana mesaj
        let msg = `${label} ${sign}${diffTL} TL <span style="color:${pctColor}">%${sign}${diffPct}</span> ${dirWord}.`;

        // ── İKİNCİ CÜMLE ──
        let comment = '';

        // Yön dönüşü tespiti
        if (records.length >= 3) {
            const pp = records[records.length - 3].price;
            const p  = records[records.length - 2].price;
            const c  = current;
            if (p > pp && c < p) { comment = '⚠️ <span style="border-bottom: 1px solid var(--primary); color: var(--primary);">Dalgalanma: Yükseliş sonrası geri çekilme başladı.</span>'; }
            else if (p < pp && c > p) { comment = '⚠️ <span style="border-bottom: 1px solid var(--primary); color: var(--primary);">Dalgalanma: Düşüş sonrası toparlanma başladı.</span>'; }
        }

        // Momentum
        if (!comment) {
            const momentum = detectMomentum(records);
            if (momentum === 'accelerating' && diffTL > 0) comment = 'Artış hızlanıyor.';
            if (momentum === 'accelerating' && diffTL < 0) comment = 'Düşüş hızlanıyor.';
            if (momentum === 'decelerating')                comment = 'Hareket yavaşlıyor.';
        }

        // Seviye analizi
        if (!comment) {
            const levels   = await calcLevels(asset);
            const levelMsg = buildLevelComment(current, levels);
            if (levelMsg) comment = levelMsg;
        }

        if (comment) msg += ` ${comment}`;
        return msg;
    }

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
                const comment = await analyzeAsset(asset);
                if (comment) results.push(comment);
            } catch (_) { /* sessiz geç */ }
        }
        if (results.length) {
            cachedAnalysis.comments = results;
            cachedAnalysis.idx = 0;
            rotateComment();
        }
    }

    function rotateComment() {
        if (!cachedAnalysis.comments || !cachedAnalysis.comments.length) return;
        const msg = document.getElementById('asst-msg');
        if (!msg) return;
        const text = cachedAnalysis.comments[cachedAnalysis.idx % cachedAnalysis.comments.length];
        cachedAnalysis.idx++;
        setMessage(msg, text);
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
            // Acil mesajlar 10 saniye kalsın, normal mesajlar 7 saniye
            const duration = isUrgent ? 10000 : 7000;
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
            }, interval);
        }, 8000);

        // Yorum rotasyonu: her 25 saniyede bir varlık değiştir
        commentTimer = setInterval(rotateComment, 25000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
