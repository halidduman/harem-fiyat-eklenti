/**
 * Fetih Analiz Motoru v2.0
 * Akıllı fiyat kıyaslama + Ani hareket uyarı sistemi.
 * AI yok | Harici API yok | Hafif ve stabil.
 */

(function () {
    'use strict';

    const CFG = {
        DB_NAME: 'FetihAnalyst', DB_VERSION: 1, STORE: 'prices',
        MAX_AGE_MS: 6 * 30 * 24 * 60 * 60 * 1000,
        ASSETS: ['HAS', 'CEYREK', 'ONS'],
        ROTATION_MS: 60000,   // Normal mesajlar dakikada bir gösterilsin
        VELOCITY_WINDOW: 20,  // Son 20 kayıt hız hesabı için
    };

    // Hareket seviyeleri (altın piyasası bazlı)
    const MOVE = {
        NORMAL_MAX: 1.0,   // %0-%1 → Normal seyir
        MEDIUM_MAX: 3.0,   // %1-%3 → Orta hızlı
        FAST_MAX: 5.0,     // %3-%5 → Hızlı
        // %5+ → Ekstrem
    };

    const ASSET_KEYS = {
        'HAS':    ['val-has-sell',  'Has Altın'],
        'CEYREK': ['val-ceyrek-sell', 'Çeyrek Altın'],
        'ATA':    ['val-ata-sell',  'Ata Altın'],
        'ONS':    ['val-ons-sell',  'Ons Altın'],
    };

    let db = null;
    let botTimer = null;
    let collectTimer = null;
    let commentTimer = null;
    let cachedAnalysis = { comments: [], idx: 0 };

    // ═══ ANI HAREKET DURUMU ═══
    // Her asset için aktif uyarı durumu
    const activeAlerts = {}; // { assetKey: { level, direction, pct, msg, ts } }
    let lastAlertMsg = '';   // Şu an ekranda gösterilen uyarı
    let startupCooldown = true; // İlk açılışta hatalı alarmı önle
    let lastGlobalChangeTs = Date.now();
    let lastPrices = {}; // asset -> price
    let lastStaleMsg = '';

    /* ═══════════════════════════════════════
       IndexedDB (değişmedi)
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
            const idx = tx.objectStore(CFG.STORE).index('asset_time');
            const req = idx.count(IDBKeyRange.bound([asset, 0], [asset, Date.now()]));
            req.onsuccess = (e) => resolve(e.target.result || 0);
            req.onerror = () => resolve(0);
        });
    }

    function getLastRecord() {
        return new Promise((resolve) => {
            if (!db) return resolve(null);
            const tx = db.transaction(CFG.STORE, 'readonly');
            const req = tx.objectStore(CFG.STORE).index('ts').openCursor(null, 'prev');
            req.onsuccess = (e) => resolve(e.target.result ? e.target.result.value : null);
            req.onerror = () => resolve(null);
        });
    }

    function getLevelRecords(asset, since) {
        return new Promise((resolve) => {
            if (!db) return resolve([]);
            const tx = db.transaction(CFG.STORE, 'readonly');
            const idx = tx.objectStore(CFG.STORE).index('asset_time');
            const req = idx.getAll(IDBKeyRange.bound([asset, since], [asset, Date.now()]));
            req.onsuccess = (e) => resolve(e.target.result || []);
            req.onerror = () => resolve([]);
        });
    }

    function pruneOldData() {
        if (!db) return;
        const tx = db.transaction(CFG.STORE, 'readwrite');
        const idx = tx.objectStore(CFG.STORE).index('ts');
        idx.openCursor(IDBKeyRange.upperBound(Date.now() - CFG.MAX_AGE_MS)).onsuccess = (e) => {
            const c = e.target.result;
            if (c) { c.delete(); c.continue(); }
        };
    }

    /* ═══════════════════════════════════════
       VERİ OKUMA
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
       HESAPLAMA YARDIMCILARI
    ═══════════════════════════════════════ */
    function calcPct(a, b) {
        if (!a || a === 0) return 0;
        return ((b - a) / a) * 100;
    }

    // Hareket seviyesini belirle
    function classifyMove(absPct) {
        if (absPct < MOVE.NORMAL_MAX)  return 'normal';
        if (absPct < MOVE.MEDIUM_MAX)  return 'medium';
        if (absPct < MOVE.FAST_MAX)    return 'fast';
        return 'extreme';
    }

    // Seviye önceliği (büyük = daha önemli)
    function levelPriority(level) {
        return { normal: 0, medium: 1, fast: 2, extreme: 3 }[level] || 0;
    }

    /* ═══════════════════════════════════════
       GEÇMİŞ VERİ KARŞILAŞTIRMA
    ═══════════════════════════════════════ */
    function findClosestRecord(records, msBack) {
        const now = Date.now();
        const target = now - msBack;
        const tolerance = Math.max(msBack * 0.25, 2 * 60 * 60 * 1000);
        let best = null, minDiff = Infinity;
        for (const r of records) {
            const diff = Math.abs(r.ts - target);
            if (diff < minDiff && diff < tolerance) {
                minDiff = diff;
                best = r;
            }
        }
        return best;
    }

    function buildComparison(records, currentPrice) {
        const day   = findClosestRecord(records, 24 * 60 * 60 * 1000);
        const week  = findClosestRecord(records, 7 * 24 * 60 * 60 * 1000);
        const month = findClosestRecord(records, 30 * 24 * 60 * 60 * 1000);

        const fmt = (rec) => {
            if (!rec) return null;
            const pct = +calcPct(rec.price, currentPrice).toFixed(2);
            const diffTL = +(currentPrice - rec.price).toFixed(2);
            return { price: rec.price, pct, diffTL };
        };

        return { yesterday: fmt(day), weekly: fmt(week), monthly: fmt(month) };
    }

    /* ═══════════════════════════════════════
       HIZ (VELOCITY) HESABI
       Son N kayıttaki değişim hızını ölçer
    ═══════════════════════════════════════ */
    function calcVelocity(records) {
        if (records.length < 3) return { speed: 0, direction: 'neutral', consecutiveUp: 0, consecutiveDown: 0 };

        const recent = records.slice(-CFG.VELOCITY_WINDOW);
        let ups = 0, downs = 0, consUp = 0, consDown = 0, maxConsUp = 0, maxConsDown = 0;

        for (let i = 1; i < recent.length; i++) {
            if (recent[i].price > recent[i-1].price) {
                ups++; consUp++; consDown = 0;
                maxConsUp = Math.max(maxConsUp, consUp);
            } else if (recent[i].price < recent[i-1].price) {
                downs++; consDown++; consUp = 0;
                maxConsDown = Math.max(maxConsDown, consDown);
            }
        }

        // Son 10dk'daki toplam % değişim
        const oldest = recent[0].price;
        const newest = recent[recent.length - 1].price;
        const totalPct = Math.abs(calcPct(oldest, newest));

        // Zaman bazlı hız (dk başına % değişim)
        const timeDiffMs = recent[recent.length-1].ts - recent[0].ts;
        const minutes = Math.max(timeDiffMs / 60000, 1);
        const speed = totalPct / minutes;

        const direction = newest > oldest ? 'up' : (newest < oldest ? 'down' : 'neutral');

        return { speed, direction, totalPct, consecutiveUp: maxConsUp, consecutiveDown: maxConsDown };
    }

    /* ═══════════════════════════════════════
       ANI HAREKET ALGILAMA VE UYARI
    ═══════════════════════════════════════ */
    async function checkSuddenMoves() {
        if (startupCooldown) return false; // Veri oturana kadar alarm verme
        let highestAlert = null;

        for (const asset of CFG.ASSETS) {
            const now = Date.now();
            // SADECE son 15dk verisiyle anlık hareket kontrolü
            const records = await getLevelRecords(asset, now - 15 * 60 * 1000);
            const current = readCurrentPrice(asset);
            if (!current || records.length < 3) continue;

            const label = ASSET_KEYS[asset][1];
            const velocity = calcVelocity(records);

            // Anlık: Son 1dk ve 5dk fiyat sıçraması
            const rec1m = findClosestRecord(records, 60 * 1000);
            const rec5m = findClosestRecord(records, 5 * 60 * 1000);

            const pct1m = rec1m ? Math.abs(calcPct(rec1m.price, current)) : 0;
            const pct5m = rec5m ? Math.abs(calcPct(rec5m.price, current)) : 0;

            // Anlık hız sinyali: kısa süreli sıçrama + velocity hızı
            const bestPct = Math.max(pct1m, pct5m, velocity.totalPct || 0);
            const level = classifyMove(bestPct);
            const dir = current > (rec1m?.price || rec5m?.price || current) ? 'up' : 'down';

            if (level === 'normal') {
                if (activeAlerts[asset]) delete activeAlerts[asset];
                continue;
            }

            const existing = activeAlerts[asset];
            if (!existing || levelPriority(level) >= levelPriority(existing.level) || existing.direction !== dir) {
                activeAlerts[asset] = { level, direction: dir, pct: bestPct, label, ts: now };
            }

            if (!highestAlert || levelPriority(level) > levelPriority(highestAlert.level)) {
                highestAlert = activeAlerts[asset];
            }
        }

        // ═══ ANLIK UYARI MESAJI ═══
        if (highestAlert) {
            const { level, direction, pct, label } = highestAlert;
            let text, icon, color;
            const sign = direction === 'up' ? '+' : '-';
            const pctStr = `${sign}${pct.toFixed(2)}%`;

            if (level === 'extreme') {
                text = `🚨 ACİL: ${label} sert ${direction === 'up' ? 'yükseliş' : 'düşüş'} başladı! ${pctStr}`;
                icon = 'emergency';
                color = direction === 'up' ? '#4ade80' : '#f87171';
            } else if (level === 'fast') {
                text = `🚀 ${label} çok hızlı ${direction === 'up' ? 'artıyor' : 'düşüyor'}! ${pctStr}`;
                icon = direction === 'up' ? 'rocket_launch' : 'crisis_alert';
                color = direction === 'up' ? '#4ade80' : '#f87171';
            } else {
                text = `⚠️ Dikkat: ${label} ${direction === 'up' ? 'hızlı artıyor' : 'hızlı düşüyor'}. ${pctStr}`;
                icon = 'warning';
                color = '#facc15';
            }

            if (text !== lastAlertMsg) {
                lastAlertMsg = text;
                if (window.fetihBotNotify) window.fetihBotNotify(text, icon, color);
            }
            return true; // Uyarı aktif, normal rotasyonu durdur
        }

        // Alarmlar temizlendiyse
        if (lastAlertMsg && Object.keys(activeAlerts).length === 0) {
            lastAlertMsg = '';
            const msg = document.getElementById('asst-msg');
            if (msg) setMessage(msg, 'Piyasa dengeleniyor. Normal seyre dönüldü.');
        }
        return false;
    }

    /* ═══════════════════════════════════════
       DURGUNLUK (STALE DATA) KONTROLÜ
    ═══════════════════════════════════════ */
    async function checkStaleData() {
        if (startupCooldown) return false;
        
        const now = new Date();
        const day = now.getDay(); 
        if (day === 0 || day === 6) return false; 

        // 1. İnternet Bağlantısı Kontrolü (Hemen kontrol et)
        if (!navigator.onLine) {
            const text = `🚨 Bağlantı Kesildi: İnternet bağlantınız yok! Veri akışı durdu.`;
            if (text !== lastStaleMsg) {
                lastStaleMsg = text;
                if (window.fetihBotNotify) window.fetihBotNotify(text, 'wifi_off', '#f87171', true);
            }
            return true;
        }

        // 2. Sunucu/Veri Kaynağı Kontrolü (Tüm varlıklar boş mu?)
        let allNull = true;
        for (const asset of CFG.ASSETS) {
            if (readCurrentPrice(asset) !== null) {
                allNull = false;
                break;
            }
        }
        if (allNull) {
            const text = `⚠️ Kaynak Hatası: Fiyat tablosu şu an boş. Veri alınamıyor!`;
            if (text !== lastStaleMsg) {
                lastStaleMsg = text;
                if (window.fetihBotNotify) window.fetihBotNotify(text, 'dns', '#f87171', true);
            }
            return true;
        }

        // 3. Zaman Bazlı Durgunluk Kontrolü
        const nowTs = now.getTime();
        const diffMs = nowTs - lastGlobalChangeTs;
        const minutes = Math.floor(diffMs / 60000);

        if (minutes < 1) {
            if (lastStaleMsg) {
                lastStaleMsg = '';
                const msg = document.getElementById('asst-msg');
                if (msg && (msg.innerHTML.includes('Veriler') || msg.innerHTML.includes('Bağlantı') || msg.innerHTML.includes('Kaynak'))) {
                    if (window.fetihBotNotify) window.fetihBotNotify('Veri akışı tekrar aktif.', 'wifi', '#4ade80', false);
                }
            }
            return false;
        }

        let text = '';
        let icon = 'sync_problem';
        let color = '#f87171';

        if (minutes >= 60) { 
            text = `⚠️ Veri Akışı Durdu: ${Math.floor(minutes/60)} saattir güncelleme yok!`;
        } else if (minutes >= 5) {
            text = `⚠️ Dikkat: Veriler ${minutes} dakikadır güncellenmiyor. Donma olabilir.`;
        } else if (minutes >= 1) {
            text = `ℹ️ Bilgi: Veriler ${minutes} dakikadır değişmedi.`;
            icon = 'info';
            color = '#facc15';
        }

        if (text && text !== lastStaleMsg) {
            lastStaleMsg = text;
            if (window.fetihBotNotify) window.fetihBotNotify(text, icon, color, true);
            return true;
        }
        return !!text;
    }

    /* ═══════════════════════════════════════
       BOT MESAJ ÜRETİMİ (Kıyaslama Odaklı)
    ═══════════════════════════════════════ */
    async function analyzeAsset(asset) {
        const now = Date.now();
        const records = await getLevelRecords(asset, now - 31 * 24 * 60 * 60 * 1000);

        const label = ASSET_KEYS[asset][1];
        const current = readCurrentPrice(asset);
        if (!current || records.length < 2) return [];

        records.sort((a, b) => a.ts - b.ts);
        const comp = buildComparison(records, current);
        const messages = [];

        // Kıyaslama mesajı oluşturucu (Premium stil)
        const periodIcons = { 'düne göre': 'today', '1 haftaya göre': 'date_range', '1 aya göre': 'calendar_month' };
        const buildMsg = (data, periodLabel) => {
            if (!data) return null;
            if (Math.abs(data.pct) < 0.01) return null;

            const sign = data.pct > 0 ? '+' : '';
            const pctColor = data.pct > 0 ? '#22c55e' : (data.pct < 0 ? '#ef4444' : '#888');
            const tlColor  = data.pct > 0 ? '#16a34a' : (data.pct < 0 ? '#dc2626' : '#888');
            const iconName = periodIcons[periodLabel] || 'schedule';

            let m = `${label}: <span style="color:var(--primary);font-weight:800">${current.toLocaleString('tr-TR')}</span>`;
            m += ` <span style="display:inline-block;width:1px;height:12px;background:rgba(255,255,255,0.15);margin:0 8px;vertical-align:middle"></span>`;
            m += `<span style="color:${pctColor};font-weight:700">${sign}${data.pct}%</span>`;
            m += ` <span style="color:${tlColor};font-weight:700;border-bottom:1px solid ${pctColor};padding-bottom:1px;margin-left:6px">${sign}${data.diffTL} TL</span>`;
            m += ` <span style="color:var(--outline);font-size:0.85em;margin-left:8px;display:inline-flex;align-items:center;gap:3px;vertical-align:middle">`;
            m += `<span class="material-symbols-outlined" style="font-size:13px;vertical-align:middle">${iconName}</span>${periodLabel}</span>`;

            return m;
        };

        const yMsg = buildMsg(comp.yesterday, 'düne göre');
        const wMsg = buildMsg(comp.weekly, '1 haftaya göre');
        const mMsg = buildMsg(comp.monthly, '1 aya göre');

        if (yMsg) messages.push(yMsg);
        if (wMsg) messages.push(wMsg);
        if (mMsg) messages.push(mMsg);

        return messages;
    }

    /* ═══════════════════════════════════════
       DASHBOARD API (değişmedi)
    ═══════════════════════════════════════ */
    window.getFetihAssetAnalysis = async function(asset) {
        const now = Date.now();
        const records = await getLevelRecords(asset, now - 31 * 24 * 60 * 60 * 1000);
        const current = readCurrentPrice(asset);
        if (!current && records.length === 0) return null;

        const price = current ?? records[records.length - 1]?.price;
        const comp = buildComparison(records, price);

        const levels = await (async () => {
            const [d, w, m] = await Promise.all([
                getLevelRecords(asset, now - 24*60*60*1000),
                getLevelRecords(asset, now - 7*24*60*60*1000),
                getLevelRecords(asset, now - 30*24*60*60*1000),
            ]);
            const mm = (arr) => { if (!arr.length) return null; const p = arr.map(r=>r.price); return { high: Math.max(...p), low: Math.min(...p) }; };
            return { daily: mm(d), weekly: mm(w), monthly: mm(m) };
        })();
        const range = levels.monthly || levels.weekly || levels.daily;

        let insight = `<b>${ASSET_KEYS[asset][1]}</b> şu anda stabilize olmuş durumda. `;
        if (comp.yesterday && Math.abs(comp.yesterday.pct) > 0.05) {
            const dir = comp.yesterday.pct > 0 ? 'yükseliş' : 'düşüş';
            const int = Math.abs(comp.yesterday.pct) > 1.0 ? 'belirgin bir' : 'hafif';
            insight = `<b>${ASSET_KEYS[asset][1]}</b> son 24 saatte ${int} ${dir} grafiği çiziyor. `;
        }
        if (range) {
            if (price >= range.high * 0.995) insight += "Periyodun en yüksek seviyelerinde (Zirve direnci).";
            else if (price <= range.low * 1.005) insight += "Periyodun dip seviyelerinde, destek arıyor.";
            else insight += `Periyodun orta bandında (${range.low} - ${range.high}) hareket ediyor.`;
        }

        return { current: price, yesterday: comp.yesterday, weekly: comp.weekly, monthly: comp.monthly, range, insight };
    };

    /* ═══════════════════════════════════════
       VERİ TOPLAMA & ANALİZ DÖNGÜSÜ
    ═══════════════════════════════════════ */
    async function collectSnapshot() {
        let anyChange = false;
        for (const asset of CFG.ASSETS) {
            const price = readCurrentPrice(asset);
            if (price !== null) {
                if (lastPrices[asset] !== undefined && lastPrices[asset] !== price) {
                    anyChange = true;
                }
                lastPrices[asset] = price;
                saveRecord(asset, price);
            }
        }
        
        if (anyChange) {
            lastGlobalChangeTs = Date.now();
        }

        pruneOldData();

        // ÖNCELİK 1: Durgunluk kontrolü
        const isStale = await checkStaleData();

        // ÖNCELİK 2: Ani hareket kontrolü
        const hasAlert = await checkSuddenMoves();

        // Eğer aktif uyarı veya durgunluk yoksa normal analizi çalıştır
        if (!hasAlert && !isStale) {
            await runAnalysis();
        }
    }

    async function runAnalysis() {
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
                if (comments?.length) results.push(...comments);
            } catch (_) {}
        }
        if (results.length) {
            // Sadece cache'i güncelle — gösterim rotateComment döngüsüne bırakılıyor
            cachedAnalysis.comments = results;
            // Rotasyon henüz başlamadıysa ilk mesajı göster ve döngüyü aç
            ensureRotationStarted();
        }
    }

    let rotationStarted = false;

    function rotateComment() {
        // Aktif uyarı veya durgunluk varsa rotasyonu durdur (uyarı ekranda kalsın)
        if (Object.keys(activeAlerts).length > 0 || lastStaleMsg) return;

        if (!cachedAnalysis.comments?.length) return;
        const msg = document.getElementById('asst-msg');
        if (!msg) return;

        const text = cachedAnalysis.comments[cachedAnalysis.idx % cachedAnalysis.comments.length];
        cachedAnalysis.idx++;
        setMessage(msg, text);
    }

    // İlk veri geldiğinde rotasyonu başlat
    function ensureRotationStarted() {
        if (rotationStarted || !cachedAnalysis.comments?.length) return;
        rotationStarted = true;
        // İlk mesajı hemen göster
        rotateComment();
        // 20sn döngü: 12sn gösterim + 8sn bekleme = 20sn periyot
        if (commentTimer) clearInterval(commentTimer);
        commentTimer = setInterval(rotateComment, 20000);
    }

    function startRotationCycle() {
        // init'ten çağrılır, verinin hazır olmasını bekleyecek
        // ensureRotationStarted collectSnapshot sonrası tetiklenecek
    }

    /* ═══════════════════════════════════════
       MESAJ GÖSTERİCİ
    ═══════════════════════════════════════ */
    function highlightMsg(text) {
        if (!text) return '';
        const GOLD = 'var(--primary)';
        let s = text;
        // Sadece Varlık isimlerini altın rengi yap (zaten tag varsa dokunma)
        ['Has Altın','Çeyrek Altın','Ons Altın','Ata Altın'].forEach(a => {
            const rx = new RegExp(`(?<![\\w\u00c0-\u017f])(${a})(?![\\w\u00c0-\u017f])`, 'gi');
            if (!s.includes(`style="color:${GOLD}`)) {
                s = s.replace(rx, `<span style="color:${GOLD};font-weight:700">$1</span>`);
            }
        });
        return s;
    }

    function setMessage(el, text, isUrgent = false) {
        if (!el || (el.innerHTML === text && !isUrgent)) return;
        el.innerHTML = highlightMsg(text);

        // Uyarı sesleri
        if (text.includes('🚨') || text.includes('🚀')) {
            const isDown = text.includes('düşüş') || text.includes('düşüyor');
            if (isDown && window._fetihPlayDown) window._fetihPlayDown();
            else if (!isDown && window._fetihPlayUp) window._fetihPlayUp();
        }

        const trigger = document.getElementById('fetih-bot-trigger');
        if (trigger) {
            trigger.classList.add('is-open');
            if (botTimer) clearTimeout(botTimer);
            const isAlert = isUrgent || text.includes('🚨') || text.includes('🚀') || text.includes('⚠️') || text.includes('ℹ️');
            if (isAlert) {
                // Uyarılar: ekranda kalsın, hareket bitene kadar kapanmasın
            } else {
                // Normal mesajlar: Stil sıfırla (Kırmızı/Yeşil kalmasın)
                const iconEl = document.querySelector('.siri-icon');
                const orbEl  = document.querySelector('.siri-orb');
                if (iconEl) {
                    const isCollecting = text.includes('toplanıyor') || text.includes('hazırlanıyor');
                    iconEl.textContent = isCollecting ? 'progress_activity' : 'smart_toy';
                    iconEl.style.color = '';
                    if (isCollecting) {
                        iconEl.classList.add('fetih-loader');
                    } else {
                        iconEl.classList.remove('fetih-loader');
                        iconEl.style.animation = '';
                    }
                }
                if (orbEl) orbEl.style.background = '';
                trigger.style.borderColor = '';

                // Normal mesajlar: 12sn göster, 8sn gizli kalsın
                botTimer = setTimeout(() => trigger.classList.remove('is-open'), 12000);
            }
        }
    }

    async function getProgressMessage() {
        const counts = await Promise.all(CFG.ASSETS.map(a => countRecords(a)));
        const minCount = Math.min(...counts);
        if (minCount >= 2) return null;
        return `Analiz için veri toplanıyor... (${minCount}/2 — ${2 - minCount} veri daha)`;
    }

    async function buildStartupMessage() {
        const last = await getLastRecord();
        if (!last) return 'İlk başlatılma. Veriler toplanıyor...';
        const gapMs = Date.now() - last.ts;
        const gapH = Math.floor(gapMs / 3600000);
        const gapMin = Math.floor((gapMs % 3600000) / 60000);
        let msg = '';
        if (gapH > 0) msg = `Son veri ${gapH}sa ${gapMin}dk önce. `;
        else if (gapMin > 2) msg = `Son veri ${gapMin}dk önce. `;
        msg += (await getProgressMessage()) || 'Analiz hazırlanıyor...';
        return msg;
    }

    /* ═══════════════════════════════════════
       YARDIMCI: Element ID Atama
    ═══════════════════════════════════════ */
    function patchAssetElements() {
        const tryFind = (keywords, assignId) => {
            if (document.getElementById(assignId)) return;
            document.querySelectorAll('#sync-tbody tr').forEach(row => {
                const nameCell = row.querySelector('td:first-child');
                if (!nameCell) return;
                const clean = nameCell.textContent.trim().toUpperCase().replace(/\s+/g, '');
                if (keywords.some(k => clean.includes(k))) {
                    const sellCell = row.querySelector('td:nth-child(3)');
                    if (sellCell && !sellCell.id) sellCell.id = assignId;
                }
            });
        };
        tryFind(['ÇEYREK', 'CEYREK', 'ESKICEYREK', 'ESKİÇEYREK', 'ÇEYREKALTIN'], 'val-ceyrek-sell');
        tryFind(['ATAALTIN', 'ATAALTINI', 'ESKIATA', 'ESKİATA', 'ATA'], 'val-ata-sell');
        tryFind(['ONS', 'ONSALTIN'], 'val-ons-sell');
    }

    /* ═══════════════════════════════════════
       DIŞ ENTEGRASYON
    ═══════════════════════════════════════ */
    window.fetihBotNotify = function(text, iconName = 'notifications_active', iconColor = '#f87171', persistent = false) {
        const msg = document.getElementById('asst-msg');
        if (!msg) return;
        setMessage(msg, text, true);

        const iconEl = document.querySelector('.siri-icon');
        const orbEl  = document.querySelector('.siri-orb');
        const trigger = document.getElementById('fetih-bot-trigger');

        if (iconEl) {
            const origIcon = 'smart_toy', origColor = '', origBg = orbEl?.style.background || '', origBorder = trigger?.style.borderColor || '';

            iconEl.textContent = iconName;
            iconEl.style.color = iconColor;

            if (orbEl) {
                if (iconColor === '#facc15') orbEl.style.background = '#3a3518';
                else if (iconColor === '#4ade80') orbEl.style.background = '#1b3a25';
                else orbEl.style.background = '#3a1b1b';
            }
            if (trigger) trigger.style.borderColor = iconColor;

            if (!persistent) {
                setTimeout(() => {
                    iconEl.textContent = origIcon;
                    iconEl.style.color = origColor;
                    if (orbEl) orbEl.style.background = origBg;
                    if (trigger) trigger.style.borderColor = origBorder;
                }, 12000);
            }
        }
    };

    /* ═══════════════════════════════════════
       BAŞLAT
    ═══════════════════════════════════════ */
    async function init() {
        try { db = await openDB(); } catch (e) {
            console.warn('[FetihAnalyst] IndexedDB açılamadı:', e);
        }

        setTimeout(async () => {
            const msg = document.getElementById('asst-msg');
            setMessage(msg, await buildStartupMessage());
        }, 2000);

        setTimeout(() => {
            startupCooldown = false; // 20 saniye sonra alarmları aktif et
        }, 20000);

        setTimeout(() => {
            patchAssetElements();
            collectSnapshot();
            collectTimer = setInterval(() => {
                patchAssetElements();
                collectSnapshot();
            }, 5000);
        }, 8000);

        // İnternet durumunu anlık yakala
        window.addEventListener('offline', checkStaleData);
        window.addEventListener('online', checkStaleData);

        startRotationCycle();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
