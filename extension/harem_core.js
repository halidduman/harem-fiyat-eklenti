/**
 * Harem Altin Ozellestirme Cekirdek Modulu (harem_core.js)
 * v3.2 - Satir Sirasi Kayit, Debounce, Fiyat Kaybetme Duzeltme
 */

(function () {
    console.log('HaremCore v3.2 Baslatiliyor...');

    const STORAGE_KEY = 'harem_custom_config';
    const ASSISTANT_SETTINGS_KEY = 'harem_assistant_v1';
    const DEFAULT_ASST = {
        fetchInterval: 10,    // sn
        autoMode: false,
        msgType: 'medium',    // 'short'|'medium'|'detailed'
        criticalAlerts: true,
        soundAlert: false,
        dynamicColors: true,
        showFace: true,
        animations: true,
        retentionDays: 30,
        dataDensity: 'balanced', // 'high'|'balanced'|'low'
        smartMode: false,
        notifyRise: true,
        notifyFall: true,
        notifyTrend: false,
        notifyVolatility: false,
        devMode: false,
        analysisDaily: true,
        analysisWeekly: false,
        analysisMonthly: false,
        volatilityAnalysis: true,
        trendAnalysis: true
    };
    let asstSettings = {}; // loaded later
    const DEFAULT_CONFIG = {
        logoUrl: '',
        logoLink: '',
        logoBase64: '',
        prices: {},
        hiddenRows: {},
        rowOrder: {},
        visibility: {},
        botSettings: {
            enabled: true,
            intervalSec: 60,
            mildTL: 20,
            moderateTL: 50,
            extremeTL: 70,
            mode: 'recent'
        }
    };

    const DEFAULT_LOGO_STR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><text x="5" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="24" fill="#e9907a" letter-spacing="2">FETİH</text><text x="82" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="600" font-size="16" fill="#888" letter-spacing="1">YAZILIM</text><path d="M142 12 L152 20 L142 28" fill="none" stroke="#e9907a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="136" cy="20" r="2.5" fill="#e9907a" /></svg>`;

    function loadConfig() {
        let conf = { ...DEFAULT_CONFIG };
        const str = localStorage.getItem(STORAGE_KEY);
        if (str) {
            try {
                const parsed = JSON.parse(str);
                Object.assign(conf, parsed);
                if (!conf.visibility) conf.visibility = {};
                if (!conf.rowOrder) conf.rowOrder = {};
                if (!conf.hiddenRows) conf.hiddenRows = {};
            } catch(e) { console.error('Harem custom ayarlar bozuk', e); }
        }

        const asstStr = localStorage.getItem(ASSISTANT_SETTINGS_KEY);
        if (asstStr) {
            try {
                asstSettings = { ...DEFAULT_ASST, ...JSON.parse(asstStr) };
            } catch(e) { asstSettings = { ...DEFAULT_ASST }; }
        } else {
            asstSettings = { ...DEFAULT_ASST };
        }
        return conf;
    }

    function saveConfig() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }

    function saveAsstSettings() {
        localStorage.setItem(ASSISTANT_SETTINGS_KEY, JSON.stringify(asstSettings));
    }

    let config = loadConfig();

    /* ───────────── INDEXED DB (Fiyat Geçmişi) ───────────── */
    const DB_NAME = 'HaremAIAssistantDB';
    const STORE_NAME = 'priceHistory';
    let dbPromise = null;

    function initDB() {
        if (!dbPromise) {
            dbPromise = new Promise((resolve, reject) => {
                const req = indexedDB.open(DB_NAME, 1);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                        store.createIndex('key', 'key', { unique: false });
                        store.createIndex('t', 't', { unique: false });
                    }
                };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
        }
        return dbPromise;
    }

    function saveToIDB(key, priceObj) {
        initDB().then(db => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).add({ key, ...priceObj });
        }).catch(e => console.error('IDB save error', e));
    }

    function loadHistoryFromIDB() {
        return initDB().then(db => {
            return new Promise((resolve) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.getAll();
                req.onsuccess = () => {
                    const data = req.result;
                    // Grupla: { 'HASALTIN': [{t,v}, ...], ... }
                    const hist = {};
                    data.forEach(item => {
                        if (!hist[item.key]) hist[item.key] = [];
                        hist[item.key].push({ t: item.t, v: item.v });
                    });
                    // Her anahtar için zamana göre sırala
                    for (let k in hist) hist[k].sort((a,b) => a.t - b.t);
                    resolve(hist);
                };
                req.onerror = () => resolve({});
            });
        }).catch(() => ({}));
    }

    function clearHistoryFromIDB() {
        initDB().then(db => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).clear();
            // RAM'i de temizle
            for (let k in _priceHistory) _priceHistory[k] = [];
        });
    }

    // Seçili saklama süresinden (retentionDays) eski olanları sil
    function pruneIDB() {
        const days = asstSettings.retentionDays || 30;
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        initDB().then(db => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const index = store.index('t');
            const range = IDBKeyRange.upperBound(cutoff);
            const req = index.openCursor(range);
            req.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    store.delete(cursor.primaryKey);
                    cursor.continue();
                }
            };
        });
    }

    /* ───────────── CSS ───────────── */
    function injectStyles() {
        if (document.getElementById('harem-core-styles')) return;
        const s = document.createElement('style');
        s.id = 'harem-core-styles';
        s.textContent = `
            html,body { overflow-x:hidden !important; max-width:100vw; }
            html::-webkit-scrollbar,body::-webkit-scrollbar { width:0!important;display:none; }
            html { scrollbar-width:none; -ms-overflow-style:none; }

            header,.header,.exchange-slider,.loop { display:none!important; }
            #harem-admin-toggle { display:none!important; }

            #harem-custom-navbar {
                position:sticky; top:0; left:0; right:0; z-index:9000;
                display:flex; align-items:center; justify-content:space-between;
                padding:8px 24px;
                background:#141414;
                box-shadow:0 4px 20px rgba(0,0,0,.4);
            }
            #harem-custom-navbar .nl { flex:0 0 auto; display:flex; align-items:center; text-decoration:none; cursor:pointer; }

            /* === ASİSTAN BAR === */
            #harem-custom-navbar {
                transition: background 1.4s ease !important;
            }
            #harem-assistant-bar {
                display:flex; align-items:center; gap:14px; width:100%;
            }

            /* === SVG YÜZ === */
            #harem-face {
                flex-shrink:0; width:56px; height:56px;
                cursor:pointer;
                filter:drop-shadow(0 2px 8px rgba(0,0,0,.5));
                transition:transform .3s;
            }
            #harem-face:hover { transform:scale(1.1); }
            #harem-face svg { width:56px; height:56px; }

            /* Yüz durum renkleri */
            #harem-face.face-happy    circle.face-bg { fill:#1e3a2f; }
            #harem-face.face-neutral  circle.face-bg { fill:#1f2937; }
            #harem-face.face-worried  circle.face-bg { fill:#2d1f0e; }
            #harem-face.face-panic    circle.face-bg { fill:#2d0e0e; }
            #harem-face.face-rocket   circle.face-bg { fill:#0e2d1a; }

            /* === MESAJ BALONU === */
            #harem-msg-wrap {
                flex:1; min-width:0;
            }
            #harem-msg {
                display:inline-block;
                background:rgba(0,0,0,.28);
                border-radius:12px 12px 12px 4px;
                padding:8px 14px;
                font-size:12.5px; color:#f0f0f0;
                font-family:'Segoe UI',Arial,sans-serif;
                line-height:1.5;
                max-width:100%;
                transition: opacity .4s ease;
            }
            #harem-msg .msg-label {
                font-size:10px; font-weight:700; letter-spacing:.6px;
                text-transform:uppercase; color:#aaa; margin-bottom:2px;
                display:block;
            }
            #harem-msg .msg-main {
                font-size:13px; font-weight:600;
            }
            #harem-msg .msg-sub {
                font-size:11px; color:#ccc; display:block; margin-top:1px;
            }

            /* === YÜZ ANİMASYONLARI === */
            @keyframes faceShake {
                0%,100%{transform:translateX(0) scale(1)} 25%{transform:translateX(-4px) scale(1.02)} 75%{transform:translateX(4px) scale(1.02)}
            }
            @keyframes faceFloat {
                0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)}
            }
            @keyframes faceGlow {
                0%,100%{filter:drop-shadow(0 0 6px var(--face-glow,rgba(156,163,175,.3)));}
                50%{filter:drop-shadow(0 0 14px var(--face-glow,rgba(156,163,175,.6)));}
            }
            @keyframes eyeBlink {
                0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.08)}
            }
            @keyframes rocketPop {
                0%{transform:scale(1)} 30%{transform:scale(1.12) rotate(3deg)} 60%{transform:scale(0.97) rotate(-2deg)} 100%{transform:scale(1) rotate(0deg)}
            }
            #harem-face { animation: faceFloat 3.5s ease-in-out infinite; }
            #harem-face.face-panic { animation: faceShake .5s ease-in-out, faceGlow 1s ease-in-out infinite; --face-glow: rgba(248,113,113,.6); }
            #harem-face.face-rocket { animation: rocketPop .6s ease-out, faceGlow .8s ease-in-out infinite; --face-glow: rgba(134,239,172,.7); }
            #harem-face.face-happy  { animation: faceFloat 3s ease-in-out infinite, faceGlow 2.5s ease-in-out infinite; --face-glow: rgba(74,222,128,.4); }
            #harem-face.face-worried{ animation: faceFloat 4s ease-in-out infinite, faceGlow 2s ease-in-out infinite; --face-glow: rgba(251,146,60,.4); }
            /* göz kırpma — SVG içi .eye-group elemanlarına uygulanır */
            .eye-blink { transform-origin: center; animation: eyeBlink 4s ease-in-out infinite; }
            .eye-blink-r { animation: eyeBlink 4s ease-in-out 0.15s infinite; }
            /* Asistan bot tab section başlıkları */
            .abot-section { margin-bottom:18px; }
            .abot-section-title {
                font-size:11px;font-weight:700;color:#e9907a;text-transform:uppercase;
                letter-spacing:.5px;padding:4px 0;border-bottom:1px solid #2a2a2a;margin-bottom:10px;
            }
            .abot-row {
                display:flex;align-items:center;justify-content:space-between;
                margin-bottom:8px;
            }
            .abot-label { font-size:13px;color:#d0d0d0; }
            .abot-sub { font-size:10px;color:#666;display:block; }
            .abot-radio-group { display:flex;gap:6px;flex-wrap:wrap;margin-top:4px; }
            .abot-radio-group label {
                display:flex;align-items:center;gap:4px;color:#ccc;font-size:12px;
                background:#1f1f1f;border:1px solid #333;border-radius:6px;
                padding:4px 10px;cursor:pointer;transition:border-color .2s;
            }
            .abot-radio-group label:hover { border-color:#e9907a; }
            .abot-radio-group input[type=radio]:checked + span { color:#e9907a; }
            .abot-grid-3 { display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:6px; }
            .abot-stat { background:#1f1f1f;border:1px solid #2a2a2a;border-radius:8px;padding:10px;text-align:center; }
            .abot-stat-val { font-size:16px;font-weight:700;color:#e9907a; }
            .abot-stat-lbl { font-size:10px;color:#666;margin-top:2px; }

            /* === EKRAN KENAR ANIMASYONU === */
            #harem-edge-flash {
                position:fixed; inset:0; z-index:99999;
                pointer-events:none; border-radius:0;
                box-shadow:inset 0 0 0 0 transparent;
                transition:box-shadow .3s;
                opacity:0;
            }
            #harem-edge-flash.flash-up   { opacity:1; animation:edgePulse 1.8s ease-in-out 3; box-shadow:inset 0 0 80px 20px rgba(74,222,128,.45); }
            #harem-edge-flash.flash-down { opacity:1; animation:edgePulse 1.8s ease-in-out 3; box-shadow:inset 0 0 80px 20px rgba(239,68,68,.45); }
            @keyframes edgePulse { 0%,100%{opacity:0} 50%{opacity:1} }

            #harem-custom-navbar .nl-img {
                max-height:90px;max-width:400px;object-fit:contain;
            }
            /* Color Theme #e9907a */
            #harem-custom-navbar .nl-text {
                color:#e9907a;font-family:'Segoe UI',Arial,sans-serif;
                font-size:22px;font-weight:700;letter-spacing:2px;
                padding:8px 16px;border-radius:8px;transition:background .2s;
            }
            #harem-custom-navbar .nl-text:hover { background:rgba(233,144,122,.1); }

            /* Basliklar icin ozel modern font */
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&display=swap');
            .dashboard-grid .box tbody td .item.title, .box .head .title, .adm-hdr h3, .rsg-ttl {
                font-family: 'Plus Jakarta Sans', sans-serif !important;
            }

            section.dashboard-content,.dashboard-content.container-fluid {
                padding-left:80px!important;padding-right:80px!important;padding-top:24px!important;
            }
            .dashboard-grid .box {
                padding-bottom: 12px !important; /* Kutu altinin kesilmemesi icin ekstra bosluk */
            }
            .dashboard-grid .box,
            .dashboard-grid .box .list-table,
            .dashboard-grid .box .full-height-table,
            .dashboard-grid .box .full-height-table.table-responsive,
            .dashboard-grid .box .overflow-x {
                height:auto!important;max-height:none!important;overflow:visible!important;
            }
            .dashboard-grid .box .full-height-table table { width:100%!important;height:auto!important;table-layout:fixed; }

            /* ── ADMIN ── */
            #harem-admin-overlay {
                display:none;position:fixed;inset:0;
                background:rgba(0,0,0,.65);z-index:10000;backdrop-filter:blur(3px);
            }
            #harem-admin-modal {
                position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
                width:860px;max-width:95vw;max-height:90vh;
                background:#1a1a1a;color:#e0e0e0;border-radius:16px;
                box-shadow:0 25px 60px rgba(0,0,0,.85);z-index:10001;
                font-family:'Segoe UI',Roboto,Arial,sans-serif;
                border:1px solid #333;display:none;flex-direction:column;
            }
            #harem-admin-modal.open { display:flex; }

            .dashboard-grid .box table { border-collapse: separate !important; border-spacing: 0 8px !important; width: 100%; }
            .dashboard-grid .box tbody tr { background: #1a1a1a; transition: transform 0.2s, background 0.2s, color 0.2s; border-radius: 8px; }
            .dashboard-grid .box tbody tr:hover { transform: translateY(-1px); background: #222; }
            
            /* Harem altinin default span veya div hoverlari yuzunden cikan renkleri iptal et */
            .dashboard-grid .box table tr:hover td, 
            .dashboard-grid .box table tr:hover th, 
            .dashboard-grid .box table tr:hover span,
            .dashboard-grid .box table th:hover span,
            .dashboard-grid .box table a:hover,
            .dashboard-grid .box table td a.item:hover,
            .dashboard-grid .box table td .item.title:hover { background-color: transparent !important; background: transparent !important; }
            .dashboard-grid .box table td,
            .dashboard-grid .box table th,
            .dashboard-grid .box table td a.item,
            .dashboard-grid .box table td .item.title { background-color: transparent !important; background: transparent !important; }

            .dashboard-grid .box tbody td {
                border-top: 1px solid #333 !important;
                border-bottom: 1px solid #333 !important;
            }
            .dashboard-grid .box tbody td:first-child {
                border-left: 1px solid #333 !important;
                border-top-left-radius: 8px;
                border-bottom-left-radius: 8px;
            }
            .dashboard-grid .box tbody td:last-child {
                border-right: 1px solid #333 !important;
                border-top-right-radius: 8px;
                border-bottom-right-radius: 8px;
            }

            .adm-hdr { background:#252525;padding:18px 28px;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;flex-shrink:0; border-radius: 16px 16px 0 0; }
            .adm-hdr h3 { margin:0;font-size:19px;color:#e9907a;font-weight:600; display:flex; align-items:center; }
            .adm-close { cursor:pointer;font-size:24px;color:#888;transition:color .2s;line-height:1; }
            .adm-close:hover { color:#fff; }

            .adm-tabs { display:flex;background:#1f1f1f;border-bottom:1px solid #333;flex-shrink:0; }
            .adm-tab { padding:11px 20px;cursor:pointer;color:#888;font-size:13px;font-weight:500;border-bottom:2px solid transparent;transition:color .2s,border-color .2s;user-select:none; }
            .adm-tab:hover { color:#ccc; }
            .adm-tab.active { color:#e9907a;border-bottom-color:#e9907a; }

            .adm-pane { display:none;padding:20px 28px;overflow-y:auto;flex:1; }
            .adm-pane::-webkit-scrollbar { width:6px; }
            .adm-pane::-webkit-scrollbar-track { background:#1a1a1a; }
            .adm-pane::-webkit-scrollbar-thumb { background:#444;border-radius:3px; }
            .adm-pane.active { display:block; }

            .fg { margin-bottom:14px; }
            .fl { display:block;font-size:11px;color:#888;margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px; }
            #harem-admin-modal input[type="text"],
            #harem-admin-modal input[type="number"] {
                width:100%;padding:9px 12px;background:#0f0f0f;border:1px solid #333;
                color:#fff;border-radius:8px;font-size:13px;box-sizing:border-box;transition:border-color .2s;
            }
            #harem-admin-modal input:focus { border-color:#e9907a;outline:none; }

            .sc {
                display:flex;align-items:center;gap:12px;background:#252525;padding:12px 14px;
                border-radius:10px;margin-bottom:8px;border:1px solid #333;
                cursor:grab;transition:background .15s,border-color .15s;user-select:none;
            }
            .sc:hover { background:#2d2d2d; }
            .sc.dot { border-top:2px solid #e9907a; }
            .dh { color:#555;font-size:18px;cursor:grab;flex-shrink:0; }
            .sc-lbl { flex:1;font-size:14px;color:#e0e0e0; }

            .tgl { position:relative;width:42px;height:22px;flex-shrink:0; }
            .tgl input { display:none; }
            .ts { position:absolute;inset:0;background:#444;border-radius:22px;cursor:pointer;transition:background .2s; }
            .ts::before { content:'';position:absolute;width:16px;height:16px;background:#fff;border-radius:50%;top:3px;left:3px;transition:transform .2s; }
            .tgl input:checked+.ts { background:#e9907a; }
            .tgl input:checked+.ts::before { transform:translateX(20px); }

            .rsg { margin-bottom:18px; }
            .rsg-ttl { font-size:11px;color:#e9907a;font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;padding:4px 0;border-bottom:1px solid #333; }
            .rc {
                display:flex;align-items:center;gap:10px;background:#252525;padding:10px 14px;
                border-radius:8px;margin-bottom:6px;border:1px solid #333;
                cursor:grab;user-select:none;transition:background .15s,border-color .15s;
            }
            .rc:hover { background:#2d2d2d; }
            .rc.dot { border-top:2px solid #e9907a; }
            .rc-lbl { flex:1;font-size:13px;color:#e0e0e0; }

            .apg { display:grid;grid-template-columns:1fr 1fr;gap:10px; }
            .api { background:#252525;padding:13px;border-radius:10px;border:1px solid #333; }
            .apn { font-weight:600;color:#fff;margin-bottom:8px;display:block;font-size:12px; }
            .og { display:flex;gap:8px; }

            .adm-ftr { padding:16px 28px;background:#252525;border-top:1px solid #333;display:flex;gap:10px;justify-content:flex-end;flex-shrink:0; border-radius: 0 0 16px 16px; }
            .pcl { display:flex; gap:4px; margin-top:2px; flex-wrap:wrap; }
            .pc { width:16px; height:16px; border-radius:50%; cursor:pointer; border:1px solid #333; }
            .pc:hover { transform:scale(1.1); }
            .hb { padding:10px 22px;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:13px;transition:opacity .2s,transform .1s; }
            .hb:hover { opacity:.9; }
            .hb:active { transform:scale(.98); }
            .hb-p { background:#e9907a;color:#000; }
            .hb-d { background:#cf3535;color:#fff; }
            .hb-s { background:#333;color:#ccc; }

            @media (min-width:768px) {
                .dashboard-grid .box .full-height-table .item.title,
                .dashboard-grid .box .full-height-table .item.price,
                .dashboard-grid .box .full-height-table .item.rate,
                .dashboard-grid .box .full-height-table td span,
                .dashboard-grid .box .full-height-table th span,
                .dashboard-grid .box .full-height-table a {
                    font-size:calc(10px + 0.8vw)!important;line-height:1.4!important;white-space:nowrap;
                }
                .dashboard-grid .box .full-height-table th,
                .dashboard-grid .box .full-height-table td { padding:.8vh .5vw!important;vertical-align:middle!important; }
                .dashboard-grid .box .full-height-table svg { width:1.2vw!important;height:1.2vw!important; }
            }

            /* Hızlı Gizleme CSS Kuralı (Flicker Engeller) */
            tr[data-harem-hidden="true"] { display: none !important; }
            tr[data-harem-hidden="true"] * { display: none !important; }
            .box[data-harem-box-hidden="true"] { display: none !important; }
        `;
        document.head.appendChild(s);
    }

    /* ───────────── CONFIG ───────────── */
    function loadConfig() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const parsed = stored ? JSON.parse(stored) : {};
            const defBot = DEFAULT_CONFIG.botSettings;
            const storedBot = parsed.botSettings || {};
            return {
                logoUrl: parsed.logoUrl || '',
                logoLink: parsed.logoLink || '',
                logoBase64: parsed.logoBase64 || '',
                prices: parsed.prices || {},
                hiddenRows: parsed.hiddenRows || {},
                rowOrder: parsed.rowOrder || {},
                visibility: parsed.visibility || {},
                botSettings: {
                    enabled:     storedBot.enabled     !== undefined ? storedBot.enabled     : defBot.enabled,
                    intervalSec: storedBot.intervalSec !== undefined ? storedBot.intervalSec : defBot.intervalSec,
                    mildTL:      storedBot.mildTL      !== undefined ? storedBot.mildTL      : defBot.mildTL,
                    moderateTL:  storedBot.moderateTL  !== undefined ? storedBot.moderateTL  : defBot.moderateTL,
                    extremeTL:   storedBot.extremeTL   !== undefined ? storedBot.extremeTL   : defBot.extremeTL,
                    mode:        storedBot.mode        || defBot.mode
                }
            };
        } catch (e) { return Object.assign({}, DEFAULT_CONFIG); }
    }

    function saveConfig() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }

    /* ───────────── NAVBAR ───────────── */
    function injectNavbar() {
        if (document.getElementById('harem-custom-navbar')) return;
        const nav = document.createElement('div');
        nav.id = 'harem-custom-navbar';

        // Asistan bar (tüm içerik buraya)
        const bar = document.createElement('div');
        bar.id = 'harem-assistant-bar';

        // Sol: Modern Yüz
        const faceWrap = document.createElement('div');
        faceWrap.id = 'harem-face';
        faceWrap.className = 'face-neutral';
        faceWrap.title = 'Piyasa asistanı';
        faceWrap.style.display = 'flex';
        faceWrap.style.justifyContent = 'center';
        faceWrap.style.alignItems = 'center';
        faceWrap.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${getModernFaceIcon('neutral')}</div>`;
        bar.appendChild(faceWrap);

        // Orta: Mesaj
        const msgWrap = document.createElement('div');
        msgWrap.id = 'harem-msg-wrap';
        const msg = document.createElement('div');
        msg.id = 'harem-msg';
        msg.innerHTML = '<span class="msg-label">Piyasa Asistanı</span><span class="msg-main">⏳ Fiyatlar yükleniyor...</span>';
        msgWrap.appendChild(msg);
        bar.appendChild(msgWrap);

        // Sağ: Logo
        const a = document.createElement('a');
        a.className = 'nl';
        a.href = 'javascript:void(0)';
        a.title = 'Ayarlari Ac';
        a.addEventListener('click', e => { e.preventDefault(); openModal(); });
        buildLogoEl(a);
        bar.appendChild(a);

        nav.appendChild(bar);

        // Ekran kenar flash div
        const edgeFlash = document.createElement('div');
        edgeFlash.id = 'harem-edge-flash';
        document.body.appendChild(edgeFlash);

        document.body.insertBefore(nav, document.body.firstChild);
    }

    function buildLogoEl(link) {
        link.innerHTML = '';
        if (config.logoBase64) {
            const img = document.createElement('img');
            img.className = 'nl-img';
            img.src = config.logoBase64;
            img.alt = 'Logo';
            link.appendChild(img);
        } else if (config.logoUrl) {
            const img = document.createElement('img');
            img.className = 'nl-img';
            img.src = config.logoUrl;
            img.alt = 'Logo';
            link.appendChild(img);
        } else {
            // "fetih-logo" varsayılan (SVG encoded)
            const img = document.createElement('img');
            img.className = 'nl-img';
            img.src = encodeURI('data:image/svg+xml;utf8,' + DEFAULT_LOGO_STR);
            img.alt = 'Logo';
            link.appendChild(img);
        }
    }

    /* ───────────── VISIBILITY ───────────── */
    function getBoxName(box) {
        // Önce standart .head .title icinden aramayi dener (textContent sayfayı dondurmaz)
        let t = box.querySelector('.head .title');
        let titleText = t ? t.textContent.replace(/\s+/g, ' ').trim() : '';

        // Eger title bulunduysa dondur, yoksa ozel box'lari kontrol et
        if (titleText) return titleText;

        // Cevirici ve Grafik icin fallback kontroller
        if (box.querySelector('.translate') || box.querySelector('.tabTranslate')) return 'Çevirici';
        if (box.querySelector('.chart-container')) return 'Grafik';

        return null;
    }

    function getOriginalName(row) {
        let orig = row.getAttribute('data-tr-orig');
        if (orig) return orig;
        const nc = row.querySelector('td:first-child');
        if (!nc) return '';
        orig = nc.textContent.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        row.setAttribute('data-tr-orig', orig);
        return orig;
    }

    function applyVisibility() {
        document.querySelectorAll('.box').forEach(box => {
            const name = getBoxName(box);
            if (!name) return;
            // Default: visible unless explicitly set false
            const vis = config.visibility.hasOwnProperty(name) ? config.visibility[name] : true;
            if (vis) {
                box.removeAttribute('data-harem-box-hidden');
            } else {
                box.setAttribute('data-harem-box-hidden', 'true');
            }
        });
    }

    function applyRowVisibility() {
        document.querySelectorAll('.dashboard-grid table tbody tr').forEach(row => {
            const origName = getOriginalName(row);
            if (!origName) return;
            const rawName = origName;

            // Eğer ismin içinde bitişik kelime kaldıysa (örn: Hasyerine HAS ALTIN), düzeltmek zor olabilir.
            // Daha garanti bir yöntem için config'deki isimlerle kaba bir eşleşme yapıyoruz:
            let isHidden = false;
            for (let hiddenName in config.hiddenRows) {
                if (config.hiddenRows[hiddenName]) {
                    // hiddenName = "HAS ALTIN", name = "HAS ALTIN"
                    let safeHidden = hiddenName.replace(/\\s+/g, '');
                    let safeDom = rawName.replace(/\\s+/g, '');
                    if (safeDom === safeHidden) {
                        isHidden = true;
                        break;
                    }
                }
            }

            if (isHidden) {
                row.setAttribute('data-harem-hidden', 'true');
            } else {
                row.removeAttribute('data-harem-hidden');
                // Kayıtlı renkleri uygula
                for (let k in config.prices) {
                    if (k.replace(/\s+/g, '') === rawName.replace(/\s+/g, '')) {
                        const pc = config.prices[k];
                        if (pc.bgColor) {
                            // Hex to RGB
                            let r = 0, g = 0, b = 0;
                            let hex = pc.bgColor.replace('#', '');
                            if (hex.length === 3) {
                                r = parseInt(hex[0] + hex[0], 16);
                                g = parseInt(hex[1] + hex[1], 16);
                                b = parseInt(hex[2] + hex[2], 16);
                            } else if (hex.length === 6) {
                                r = parseInt(hex.substring(0, 2), 16);
                                g = parseInt(hex.substring(2, 4), 16);
                                b = parseInt(hex.substring(4, 6), 16);
                            }

                            // Arka plani ekstra koyulastir (esas rengin cok kucuk bir yuzdesini karanlik griye ekle)
                            const baseDark = 22; // ~#161616 base
                            const tintFactor = 0.15; // 15% tint
                            row.style.backgroundColor = `rgba(${baseDark + r * tintFactor}, ${baseDark + g * tintFactor}, ${baseDark + b * tintFactor}, 1)`;

                            const borderColor = `rgba(${Math.min(r * 0.9, 255)}, ${Math.min(g * 0.9, 255)}, ${Math.min(b * 0.9, 255)}, 0.4)`;

                            row.querySelectorAll('td').forEach(td => {
                                // Sadece alt ve uste cizgi cek
                                td.style.setProperty('border-top', `1px solid ${borderColor}`, 'important');
                                td.style.setProperty('border-bottom', `1px solid ${borderColor}`, 'important');
                            });
                            // Ilk ve son hucrelerde yan cizgiler
                            const firstTd = row.querySelector('td:first-child');
                            const lastTd = row.querySelector('td:last-child');
                            if (firstTd) firstTd.style.setProperty('border-left', `1px solid ${borderColor}`, 'important');
                            if (lastTd) lastTd.style.setProperty('border-right', `1px solid ${borderColor}`, 'important');
                        } else {
                            row.style.removeProperty('background-color');
                            // Resets
                            row.querySelectorAll('td').forEach(td => {
                                td.style.removeProperty('border-top');
                                td.style.removeProperty('border-bottom');
                            });
                            const firstTd = row.querySelector('td:first-child');
                            const lastTd = row.querySelector('td:last-child');
                            if (firstTd) firstTd.style.removeProperty('border-left');
                            if (lastTd) lastTd.style.removeProperty('border-right');
                        }

                        // Text color sadece TITLE (Baslik) icin uygulansin, 
                        // bylece artis dusus oklarinin yesil/kirmizi renkleri bozulmaz
                        const titleEl = row.querySelector('.item.title');
                        if (titleEl) {
                            if (pc.textColor) titleEl.style.setProperty('color', pc.textColor, 'important');
                            else titleEl.style.removeProperty('color');
                        }

                        // row text color temizle
                        row.style.removeProperty('color');

                        break;
                    }
                }
            }
        });
    }

    /* ───────────── ROW DUPLICATES CLEANUP ───────────── */
    function removeDuplicateRows() {
        const sarrafBox = findBox('Sarrafiye Fiyatları');
        const altinBox = findBox('Altın Fiyatları');
        if (!sarrafBox || !altinBox) return;

        const sarrafNames = new Set();
        sarrafBox.querySelectorAll('table tbody tr').forEach(row => {
            const name = getOriginalName(row);
            if (name) sarrafNames.add(name.replace(/\s+/g, ''));
        });

        altinBox.querySelectorAll('table tbody tr').forEach(row => {
            const name = getOriginalName(row);
            if (name && sarrafNames.has(name.replace(/\s+/g, ''))) {
                row.remove();
            }
        });
    }

    /* ───────────── ROW ORDER ───────────── */
    function applyRowOrder() {
        if (!config.rowOrder || !Object.keys(config.rowOrder).length) return;

        document.querySelectorAll('.dashboard-left .box, .dashboard-grid .box').forEach(box => {
            const boxName = getBoxName(box);
            if (!boxName || !config.rowOrder[boxName]) return;
            const order = config.rowOrder[boxName]; // array of row names

            // Apply to ALL tbodies in this box (header tbody may be empty)
            box.querySelectorAll('table tbody').forEach(tbody => {
                const rows = Array.from(tbody.querySelectorAll('tr'));
                if (rows.length === 0) return;

                // Build a name→row map
                const nameMap = {};
                rows.forEach(r => {
                    const origName = getOriginalName(r);
                    if (origName) nameMap[origName.replace(/\s+/g, '')] = r;
                });

                // Re-insert in saved order
                order.forEach(name => {
                    const safeName = name.replace(/\\s+/g, '');
                    if (nameMap[safeName]) tbody.appendChild(nameMap[safeName]);
                });
            });
        });
    }

    function collectRowOrder() {
        const order = {};
        document.querySelectorAll('.dashboard-left .box, .dashboard-grid .box').forEach(box => {
            const boxName = getBoxName(box);
            if (!boxName) return;
            const names = [];
            box.querySelectorAll('table tbody tr').forEach(row => {
                const origName = getOriginalName(row);
                if (origName) names.push(origName);
            });
            if (names.length) order[boxName] = names;
        });
        return order;
    }

    /* ───────────── ADMIN MODAL ───────────── */
    function openModal() {
        const modal = document.getElementById('harem-admin-modal');
        const ov = document.getElementById('harem-admin-overlay');
        if (!modal) return;
        modal.classList.add('open');
        ov.style.display = 'block';
        loadAdminValues();
    }

    function closeModal() {
        const modal = document.getElementById('harem-admin-modal');
        const ov = document.getElementById('harem-admin-overlay');
        if (!modal) return;
        modal.classList.remove('open');
        ov.style.display = 'none';
    }

    function createAdminPanel() {
        if (document.getElementById('harem-admin-modal')) return;

        const ov = document.createElement('div');
        ov.id = 'harem-admin-overlay';
        ov.addEventListener('click', closeModal);
        document.body.appendChild(ov);

        const fab = document.createElement('div');
        fab.id = 'harem-admin-toggle';
        fab.textContent = '\u2699\uFE0F';
        document.body.appendChild(fab);

        const modal = document.createElement('div');
        modal.id = 'harem-admin-modal';
        modal.innerHTML = `
<div class="adm-hdr">
  <h3><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="margin-right:8px;"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.06-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.73,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.06,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.49-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg> Panel Ayarlari</h3>
  <span class="adm-close" id="adm-x">&times;</span>
</div>
<div class="adm-tabs">
  <div class="adm-tab active" data-tab="sections"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align:text-bottom;margin-right:4px;"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg> Bolumler</div>
  <div class="adm-tab" data-tab="rows"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align:text-bottom;margin-right:4px;"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg> Satirlar</div>
  <div class="adm-tab" data-tab="logo"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align:text-bottom;margin-right:4px;"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg> Logo</div>
  <div class="adm-tab" data-tab="prices"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align:text-bottom;margin-right:4px;"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg> Fiyatlar</div>
  <div class="adm-tab" data-tab="bot">🤖 Bot</div>
</div>
<div class="adm-pane active" id="adm-sections">
  <p style="color:#888;font-size:12px;margin:0 0 12px;">Bolümleri gizle/göster veya surükleyerek sirala.</p>
  <div id="adm-sl"></div>
</div>
<div class="adm-pane" id="adm-rows">
  <p style="color:#888;font-size:12px;margin:0 0 12px;">Fiyat satirlarini gizle/göster veya surükleyerek sirala. Kaydet ile kalici olur.</p>
  <div id="adm-rl"></div>
</div>
<div class="adm-pane" id="adm-logo">
  <div class="fg">
    <span class="fl">Logo Dosyasi (SVG/PNG)</span>
    <input type="file" id="adm-logo-file" accept="image/svg+xml,image/png,image/jpeg">
    <div id="adm-logo-preview" style="margin-top:10px;text-align:center;"></div>
  </div>
  <div class="fg">
    <span class="fl">Veya Logo URL</span>
    <input type="text" id="adm-logo-url" placeholder="https://ornek.com/logo.png">
  </div>
  <div class="fg">
    <span class="fl">Logo Linki</span>
    <input type="text" id="adm-logo-link" placeholder="https://www.haremaltin.com">
  </div>
</div>
<div class="adm-pane" id="adm-prices">
  <p style="color:#888;font-size:12px;margin:0 0 12px;">Urun fiyatlarina sabit fark ekle/cikar.</p>
  <div class="apg" id="adm-pl"><div style="color:#888;padding:20px;grid-column:1/-1;text-align:center;">Yukleniyor...</div></div>
</div>
<div class="adm-pane" id="adm-bot">

  <!-- 1. GENEL -->
  <div class="abot-section">
    <div class="abot-section-title">1 — Genel Ayarlar</div>
    <div class="abot-row">
      <div><span class="abot-label">Veri çekme sıklığı</span><span class="abot-sub">Piyasa güncellenme hızı</span></div>
    </div>
    <div class="abot-radio-group">
      <label><input type="radio" name="asst-interval" value="10"><span>10 sn — Yüksek</span></label>
      <label><input type="radio" name="asst-interval" value="30"><span>30 sn — Önerilen</span></label>
      <label><input type="radio" name="asst-interval" value="60"><span>60 sn — Performans</span></label>
    </div>
    <div class="abot-row" style="margin-top:12px">
      <div><span class="abot-label">Otomatik mod</span><span class="abot-sub">Yoğunluğa göre süreyi otomatik ayarlar</span></div>
      <label class="tgl"><input type="checkbox" id="asst-automode"><span class="ts"></span></label>
    </div>
    <div class="abot-row">
      <div><span class="abot-label">Akıllı Mod</span><span class="abot-sub">Tüm parametreleri otomatik yönetir</span></div>
      <label class="tgl"><input type="checkbox" id="asst-smartmode"><span class="ts"></span></label>
    </div>
  </div>

  <!-- 2. ANALİZ -->
  <div class="abot-section">
    <div class="abot-section-title">2 — Analiz Ayarları</div>
    <div class="abot-row"><span class="abot-label">Günlük analiz (24 saat)</span>
      <label class="tgl"><input type="checkbox" id="asst-daily"><span class="ts"></span></label></div>
    <div class="abot-row"><span class="abot-label">Haftalık analiz (7 gün)</span>
      <label class="tgl"><input type="checkbox" id="asst-weekly"><span class="ts"></span></label></div>
    <div class="abot-row"><span class="abot-label">Aylık analiz (30 gün)</span>
      <label class="tgl"><input type="checkbox" id="asst-monthly"><span class="ts"></span></label></div>
    <div class="abot-row"><span class="abot-label">Volatilite analizi</span>
      <label class="tgl"><input type="checkbox" id="asst-volatility"><span class="ts"></span></label></div>
    <div class="abot-row"><span class="abot-label">Trend analizi</span>
      <label class="tgl"><input type="checkbox" id="asst-trend"><span class="ts"></span></label></div>
  </div>

  <!-- 3. MESAJ -->
  <div class="abot-section">
    <div class="abot-section-title">3 — Mesaj Ayarları</div>
    <div class="abot-row">
      <div><span class="abot-label">Mesaj tipi</span></div>
    </div>
    <div class="abot-radio-group">
      <label><input type="radio" name="asst-msgtype" value="short"><span>Kısa</span></label>
      <label><input type="radio" name="asst-msgtype" value="medium"><span>Orta</span></label>
      <label><input type="radio" name="asst-msgtype" value="detailed"><span>Detaylı</span></label>
    </div>
    <div class="abot-row" style="margin-top:12px">
      <span class="abot-label">Kritik uyarılar</span>
      <label class="tgl"><input type="checkbox" id="asst-critical"><span class="ts"></span></label>
    </div>
    <div class="abot-row">
      <div><span class="abot-label">Sesli uyarı</span><span class="abot-sub">Ani hareket olduğunda bip sesi</span></div>
      <label class="tgl"><input type="checkbox" id="asst-sound"><span class="ts"></span></label>
    </div>
  </div>

  <!-- 4. GÖRSEL -->
  <div class="abot-section">
    <div class="abot-section-title">4 — Görsel Ayarlar</div>
    <div class="abot-row">
      <span class="abot-label">Dinamik renkler</span>
      <label class="tgl"><input type="checkbox" id="asst-dyncolor"><span class="ts"></span></label>
    </div>
    <div class="abot-row">
      <span class="abot-label">Yüz ifadeleri</span>
      <label class="tgl"><input type="checkbox" id="asst-showface"><span class="ts"></span></label>
    </div>
    <div class="abot-row">
      <span class="abot-label">Animasyonlar</span>
      <label class="tgl"><input type="checkbox" id="asst-anim"><span class="ts"></span></label>
    </div>
  </div>

  <!-- 5. VERİ -->
  <div class="abot-section">
    <div class="abot-section-title">5 — Veri Ayarları</div>
    <div class="abot-row">
      <div><span class="abot-label">Veri saklama süresi</span></div>
    </div>
    <div class="abot-radio-group">
      <label><input type="radio" name="asst-retention" value="7"><span>7 gün</span></label>
      <label><input type="radio" name="asst-retention" value="14"><span>14 gün</span></label>
      <label><input type="radio" name="asst-retention" value="30"><span>30 gün</span></label>
    </div>
    <div class="abot-row" style="margin-top:12px">
      <div><span class="abot-label">Veri yoğunluğu</span></div>
    </div>
    <div class="abot-radio-group">
      <label><input type="radio" name="asst-density" value="high"><span>Yüksek</span></label>
      <label><input type="radio" name="asst-density" value="balanced"><span>Dengeli</span></label>
      <label><input type="radio" name="asst-density" value="low"><span>Düşük</span></label>
    </div>
    <div style="margin-top:12px">
      <button class="hb hb-d" id="asst-cleardata" style="width:100%">🗑️ Tüm Geçmiş Verileri Temizle</button>
    </div>
  </div>

  <!-- 6. BİLDİRİM -->
  <div class="abot-section">
    <div class="abot-section-title">6 — Bildirim Ayarları</div>
    <div class="abot-row">
      <span class="abot-label">Ani yükseliş (%2+)</span>
      <label class="tgl"><input type="checkbox" id="asst-nrise"><span class="ts"></span></label>
    </div>
    <div class="abot-row">
      <span class="abot-label">Sert düşüş (%2+)</span>
      <label class="tgl"><input type="checkbox" id="asst-nfall"><span class="ts"></span></label>
    </div>
    <div class="abot-row">
      <span class="abot-label">Trend değişimi</span>
      <label class="tgl"><input type="checkbox" id="asst-ntrend"><span class="ts"></span></label>
    </div>
  </div>

  <!-- 7. GELİŞMİŞ ANALİZ -->
  <div class="abot-section">
    <div class="abot-section-title">7 — Analiz Raporu</div>
    <div class="abot-grid-3" id="abot-stats">
      <div class="abot-stat"><div class="abot-stat-val" id="astat-daily">-</div><div class="abot-stat-lbl">Günlük Ort.</div></div>
      <div class="abot-stat"><div class="abot-stat-val" id="astat-weekly">-</div><div class="abot-stat-lbl">Haftalık Ort.</div></div>
      <div class="abot-stat"><div class="abot-stat-val" id="astat-change">-</div><div class="abot-stat-lbl">Toplam Değişim</div></div>
    </div>
    <div class="abot-row" style="margin-top:12px">
      <div><span class="abot-label">Geliştirici Modu</span><span class="abot-sub">Ham veri tablosunu göster</span></div>
      <label class="tgl"><input type="checkbox" id="asst-devmode"><span class="ts"></span></label>
    </div>
    <div id="abot-devdata" style="display:none;margin-top:8px;max-height:160px;overflow-y:auto;font-size:10px;color:#888;font-family:monospace;background:#0f0f0f;padding:8px;border-radius:6px;"></div>
  </div>

</div>
<div class="adm-ftr">
  <button class="hb hb-d" id="adm-reset">Sifirla</button>
  <button class="hb hb-s" id="adm-cancel">Iptal</button>
  <button class="hb hb-p" id="adm-save">Kaydet &amp; Uygula</button>
</div>`;
        document.body.appendChild(modal);

        modal.querySelectorAll('.adm-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                modal.querySelectorAll('.adm-tab').forEach(t => t.classList.remove('active'));
                modal.querySelectorAll('.adm-pane').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('adm-' + tab.dataset.tab).classList.add('active');
            });
        });

        document.getElementById('adm-x').addEventListener('click', closeModal);
        document.getElementById('adm-cancel').addEventListener('click', closeModal);
        document.getElementById('adm-save').addEventListener('click', saveFromUI);
        document.getElementById('adm-reset').addEventListener('click', () => {
            if (confirm('Tüm ayarlari sifirlamak istiyor musunuz?')) {
                localStorage.removeItem(STORAGE_KEY);
                // Form yeniden gonderme uyarisi (POST) almamak icin:
                window.location.href = window.location.pathname + window.location.search;
            }
        });
    }

    /* ── Bolumler sekmesi ── */
    let sdSrc = null;
    function loadSectionsTab() {
        const el = document.getElementById('adm-sl');
        if (!el) return;
        el.innerHTML = '';
        const boxes = document.querySelectorAll('.dashboard-left .box, .dashboard-grid .box');
        if (!boxes.length) { el.innerHTML = '<div style="color:#888;text-align:center;padding:20px;">Bulunamadi.</div>'; return; }
        boxes.forEach((box, i) => {
            const name = getBoxName(box) || ('Bolum ' + (i + 1));
            const vis = config.visibility.hasOwnProperty(name) ? config.visibility[name] : true;
            const card = document.createElement('div');
            card.className = 'sc';
            card.dataset.n = name;
            card.draggable = true;
            card.innerHTML = `<span class="dh">&#8998;</span><span class="sc-lbl">${name}</span><label class="tgl"><input type="checkbox" class="scb"${vis ? ' checked' : ''}><span class="ts"></span></label>`;
            addCardDrag(card, el, sdSrc, n => { sdSrc = n; }, (a, b) => moveDomBox(a, b));
            el.appendChild(card);
        });
    }

    function moveDomBox(srcName, dstName) {
        const src = findBox(srcName), dst = findBox(dstName);
        if (!src || !dst) return;
        const p = dst.parentNode;
        const si = [...p.children].indexOf(src);
        const di = [...p.children].indexOf(dst);
        if (si < di) p.insertBefore(src, dst.nextSibling);
        else p.insertBefore(src, dst);
    }

    function findBox(name) {
        for (const b of document.querySelectorAll('.dashboard-left .box, .dashboard-grid .box')) {
            // Tam esleme veya icerik eslesmesi (Darphane İscilik Fiyatları (Has) gibi durumlari da yakalamak icin)
            const boxName = getBoxName(b);
            if (boxName === name || (boxName && boxName.includes(name))) return b;
        }
        return null;
    }

    /* ── Satirlar sekmesi ── */
    let rdSrc = null;
    function loadRowsTab() {
        const el = document.getElementById('adm-rl');
        if (!el) return;
        el.innerHTML = '';
        let found = false;

        document.querySelectorAll('.dashboard-left .box, .dashboard-grid .box').forEach(box => {
            const boxName = getBoxName(box) || '?';
            // Only use the DATA tbody (not the header one) - find the largest tbody
            const tbodies = box.querySelectorAll('table tbody');
            let dataRows = [];
            tbodies.forEach(tb => {
                const rows = tb.querySelectorAll('tr');
                if (rows.length > dataRows.length) dataRows = Array.from(rows);
            });
            if (!dataRows.length) return;

            found = true;
            const group = document.createElement('div');
            group.className = 'rsg';
            group.innerHTML = `<div class="rsg-ttl">${boxName}</div>`;

            // Track seen names to avoid duplicates within same box
            const seenInBox = new Set();

            dataRows.forEach(row => {
                const name = getOriginalName(row);
                if (!name || seenInBox.has(name)) return;
                seenInBox.add(name);

                // Admin panelindeki ad ile config'deki adı doğru eşlemek için 
                // kaba kontrol denemesi (bir önceki sürümden kalan uyumsuz kayıtları düzeltmek için)
                let isHidden = false;
                for (let k in config.hiddenRows) {
                    if (config.hiddenRows[k] && k.replace(/\\s+/g, '') === name.replace(/\\s+/g, '')) {
                        isHidden = true;
                        break;
                    }
                }
                const vis = !isHidden;
                const card = document.createElement('div');
                card.className = 'rc';
                card.dataset.n = name;
                card.dataset.box = boxName;
                card.draggable = true;
                card.innerHTML = `<span class="dh">&#8998;</span><span class="rc-lbl">${name}</span><label class="tgl"><input type="checkbox" class="rcb"${vis ? ' checked' : ''}><span class="ts"></span></label>`;

                // Row drag within same box group
                card.addEventListener('dragstart', e => { rdSrc = card; card.style.opacity = '.5'; e.dataTransfer.effectAllowed = 'move'; });
                card.addEventListener('dragend', () => { card.style.opacity = ''; group.querySelectorAll('.dot').forEach(x => x.classList.remove('dot')); });
                card.addEventListener('dragover', e => { e.preventDefault(); if (rdSrc && rdSrc !== card && rdSrc.dataset.box === card.dataset.box) card.classList.add('dot'); });
                card.addEventListener('dragleave', () => card.classList.remove('dot'));
                card.addEventListener('drop', e => {
                    e.preventDefault();
                    if (rdSrc && rdSrc !== card && rdSrc.dataset.box === card.dataset.box) {
                        moveRowOnPage(box, rdSrc.dataset.n, card.dataset.n);
                        const p = card.parentNode;
                        const si = [...p.children].indexOf(rdSrc);
                        const di = [...p.children].indexOf(card);
                        if (si < di) p.insertBefore(rdSrc, card.nextSibling);
                        else p.insertBefore(rdSrc, card);
                    }
                    card.classList.remove('dot');
                });

                group.appendChild(card);
            });
            el.appendChild(group);
        });

        if (!found) el.innerHTML = '<div style="color:#888;text-align:center;padding:20px;">Satir bulunamadi.</div>';
    }

    function moveRowOnPage(box, srcName, dstName) {
        box.querySelectorAll('table tbody').forEach(tbody => {
            const rows = Array.from(tbody.querySelectorAll('tr'));
            let sr = null, dr = null;
            rows.forEach(r => {
                const n = getOriginalName(r);
                if (!n) return;
                if (n.replace(/\s+/g, '') === srcName.replace(/\s+/g, '')) sr = r;
                if (n.replace(/\s+/g, '') === dstName.replace(/\s+/g, '')) dr = r;
            });
            if (!sr || !dr) return;
            const si = rows.indexOf(sr), di = rows.indexOf(dr);
            if (si < di) tbody.insertBefore(sr, dr.nextSibling);
            else tbody.insertBefore(sr, dr);
        });
    }

    /* ── Drag helper ── */
    function addCardDrag(card, container, srcRef, setSrc, onDrop) {
        let localSrc = null;
        card.addEventListener('dragstart', e => { localSrc = card; setSrc(card); card.style.opacity = '.5'; e.dataTransfer.effectAllowed = 'move'; });
        card.addEventListener('dragend', () => { card.style.opacity = ''; container.querySelectorAll('.dot').forEach(x => x.classList.remove('dot')); });
        card.addEventListener('dragover', e => { e.preventDefault(); if (localSrc !== card) card.classList.add('dot'); });
        card.addEventListener('dragleave', () => card.classList.remove('dot'));
        card.addEventListener('drop', e => {
            e.preventDefault();
            const src = container.querySelector('[style*="opacity"]') || null;
            // use dataset comparison
            const cards = Array.from(container.querySelectorAll('.sc'));
            const srcCard = cards.find(c => c.style.opacity === '0.5');
            if (srcCard && srcCard !== card) {
                onDrop(srcCard.dataset.n, card.dataset.n);
                const p = card.parentNode;
                const si = [...p.children].indexOf(srcCard);
                const di = [...p.children].indexOf(card);
                if (si < di) p.insertBefore(srcCard, card.nextSibling);
                else p.insertBefore(srcCard, card);
            }
            card.classList.remove('dot');
        });
    }

    /* ── Fiyatlar sekmesi ── */
    function loadPricesTab() {
        const el = document.getElementById('adm-pl');
        if (!el) return;
        el.innerHTML = '';
        const rows = document.querySelectorAll('.dashboard-grid table tbody tr');
        if (!rows.length) { el.innerHTML = '<div style="color:orange;grid-column:1/-1;padding:10px;">Ana sayfada oldugunuzdan emin olun.</div>'; return; }
        const seen = new Set();
        rows.forEach(row => {
            // Sadece gorunen ve aktif satirlari listele
            if (row.getAttribute('data-harem-hidden') === 'true') return;

            const name = getOriginalName(row);
            if (!name || seen.has(name)) return;

            // Ayrica, gizli rows arasinda var mi kontrol et
            let isHidden = false;
            for (let k in config.hiddenRows) {
                if (config.hiddenRows[k] && k.replace(/\s+/g, '') === name.replace(/\s+/g, '')) {
                    isHidden = true; break;
                }
            }
            if (isHidden) return;

            seen.add(name);
            const c = config.prices[name] || { buyOffset: 0, sellOffset: 0, bgColor: '', textColor: '', customName: '' };
            const item = document.createElement('div');
            item.className = 'api';
            item.dataset.n = name;
            item.innerHTML = `
<span class="apn">${name}</span>
<div class="og" style="flex-direction:column;gap:10px;">
  <div style="display:flex;gap:8px;">
    <div style="flex:1"><span class="fl">Alis Farki</span><input type="number" class="bo" value="${c.buyOffset}" step="0.01"></div>
    <div style="flex:1"><span class="fl">Satis Farki</span><input type="number" class="so" value="${c.sellOffset}" step="0.01"></div>
  </div>
  <div style="display:flex;gap:8px;">
    <div style="flex:1"><span class="fl">Arka Plan</span>
        <div style="display:flex; align-items:center; gap:8px;">
            <input type="color" class="bg-col" value="${c.bgColor || '#1a1a1a'}" style="width:30px;height:30px;padding:0;border:none;">
            <div class="pcl">
               <div class="pc" style="background:#DEE5D4" onclick="this.parentNode.previousElementSibling.value='#DEE5D4';"></div>
               <div class="pc" style="background:#F6E9DF" onclick="this.parentNode.previousElementSibling.value='#F6E9DF';"></div>
               <div class="pc" style="background:#E2CEB1" onclick="this.parentNode.previousElementSibling.value='#E2CEB1';"></div>
               <div class="pc" style="background:#DED6D1" onclick="this.parentNode.previousElementSibling.value='#DED6D1';"></div>
               <div class="pc" style="background:#E8EAE6" onclick="this.parentNode.previousElementSibling.value='#E8EAE6';"></div>
               <div class="pc" style="background:#CFDAC8" onclick="this.parentNode.previousElementSibling.value='#CFDAC8';"></div>
               <div class="pc" style="background:#D0B8A8" onclick="this.parentNode.previousElementSibling.value='#D0B8A8';"></div>
               <div class="pc" style="background:#DFE0E2" onclick="this.parentNode.previousElementSibling.value='#DFE0E2';"></div>
            </div>
        </div>
    </div>
    <div style="flex:1"><span class="fl">Yazi Rengi</span><input type="color" class="txt-col" value="${c.textColor || '#e0e0e0'}"></div>
    <div style="width:40px;display:flex;align-items:center;justify-content:center;">
       <button class="hb hb-s" style="padding:4px 8px;font-size:10px;margin-top:20px;" onclick="this.parentNode.parentNode.querySelectorAll('input[type=color]').forEach(i=>{i.value=i.defaultValue;});return false;">X</button>
    </div>
  </div>
</div>`;
            el.appendChild(item);
        });
    }

    // Admin panelinden mevcut degerleri yukle
    function loadAdminValues() {
        if (lu) lu.value = config.logoUrl || '';
        if (ll) ll.value = config.logoLink || '';

        if (lpv) {
            lpv.innerHTML = '';
            const testSrc = config.logoBase64 || config.logoUrl || encodeURI('data:image/svg+xml;utf8,' + DEFAULT_LOGO_STR);
            const img = document.createElement('img');
            img.style.maxHeight = '60px';
            img.src = testSrc;
            lpv.appendChild(img);
        }

        // Logo file listener
        const lf = document.getElementById('adm-logo-file');
        if (lf) {
            lf.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (re) => {
                    config.logoBase64 = re.target.result;
                    if (lpv) lpv.querySelector('img').src = config.logoBase64;
                };
                reader.readAsDataURL(file);
            };
        }

        // Bot / Asistan ayarları yükle
        const s = asstSettings;
        const setR = (name, val) => { const el = document.querySelector(`[name="${name}"][value="${val}"]`); if(el) el.checked=true; };
        const setC = (id, val)  => { const el = document.getElementById(id); if(el) el.checked = !!val; };
        setR('asst-interval', s.fetchInterval || 10);
        setR('asst-msgtype', s.msgType || 'medium');
        setR('asst-retention', s.retentionDays || 30);
        setR('asst-density', s.dataDensity || 'balanced');
        setC('asst-automode', s.autoMode);
        setC('asst-smartmode', s.smartMode);
        setC('asst-daily', s.analysisDaily);
        setC('asst-weekly', s.analysisWeekly);
        setC('asst-monthly', s.analysisMonthly);
        setC('asst-volatility', s.volatilityAnalysis);
        setC('asst-trend', s.trendAnalysis);
        setC('asst-critical', s.criticalAlerts);
        setC('asst-sound', s.soundAlert);
        setC('asst-dyncolor', s.dynamicColors);
        setC('asst-showface', s.showFace);
        setC('asst-anim', s.animations);
        setC('asst-nrise', s.notifyRise);
        setC('asst-nfall', s.notifyFall);
        setC('asst-ntrend', s.notifyTrend);
        setC('asst-devmode', s.devMode);

        // Analiz raporu istatistikleri güncelle
        updateStatDisplay();

        // Temizle butonu
        const clearBtn = document.getElementById('asst-cleardata');
        if (clearBtn) clearBtn.onclick = () => {
            if (confirm('Tüm fiyat geçmişi silinecek. Emin misiniz?')) {
                clearHistoryFromIDB();
                updateStatDisplay();
            }
        };

        // Geçmiş modu toggle
        const devChk = document.getElementById('asst-devmode');
        if (devChk) devChk.onchange = () => toggleDevData(devChk.checked);
        toggleDevData(s.devMode);

        loadSectionsTab();
        loadRowsTab();
        loadPricesTab();
    }

    function saveFromUI() {
        // Logo
        const lu = document.getElementById('adm-logo-url');
        const ll = document.getElementById('adm-logo-link');
        if (lu) config.logoUrl = lu.value;
        if (ll) config.logoLink = ll.value;

        // Bolum gorunurlugu
        document.querySelectorAll('#adm-sl .sc').forEach(card => {
            const name = card.dataset.n;
            const cb = card.querySelector('.scb');
            if (name && cb) config.visibility[name] = cb.checked;
        });

        // Satir gorunurlugu + sira kaydet
        config.hiddenRows = {};
        document.querySelectorAll('#adm-rl .rsg').forEach(group => {
            const boxName = group.querySelector('.rsg-ttl').textContent;
            config.rowOrder[boxName] = [];
            group.querySelectorAll('.rc').forEach(card => {
                const name = card.dataset.n;
                const cb = card.querySelector('.rcb');
                if (cb && !cb.checked) config.hiddenRows[name] = true;
                if (name) config.rowOrder[boxName].push(name);
            });
        });

        // Keep existing prices not currently in screen
        const oldPrices = config.prices || {};
        config.prices = { ...oldPrices };

        document.querySelectorAll('.api').forEach(item => {
            const name = item.dataset.n;
            const buy = parseFloat(item.querySelector('.bo').value) || 0;
            const sell = parseFloat(item.querySelector('.so').value) || 0;
            const bg = item.querySelector('.bg-col').value;
            const txt = item.querySelector('.txt-col').value;

            if (buy !== 0 || sell !== 0 || bg !== '#1a1a1a' || txt !== '#e0e0e0') {
                config.prices[name] = {
                    buyOffset: buy, sellOffset: sell,
                    bgColor: bg === '#1a1a1a' ? '' : bg,
                    textColor: txt === '#e0e0e0' ? '' : txt,
                    type: 'fixed'
                };
            } else {
                delete config.prices[name];
            }
        });

        saveConfig();

        // Asistan ayarlarını kaydet
        const getR = (name) => { const el = document.querySelector(`[name="${name}"]:checked`); return el ? el.value : null; };
        const getC = (id)   => { const el = document.getElementById(id); return el ? el.checked : false; };
        const iv = parseInt(getR('asst-interval')) || 10;
        asstSettings = {
            fetchInterval: iv,
            autoMode:          getC('asst-automode'),
            smartMode:         getC('asst-smartmode'),
            msgType:           getR('asst-msgtype') || 'medium',
            criticalAlerts:    getC('asst-critical'),
            soundAlert:        getC('asst-sound'),
            dynamicColors:     getC('asst-dyncolor'),
            showFace:          getC('asst-showface'),
            animations:        getC('asst-anim'),
            retentionDays:     parseInt(getR('asst-retention')) || 30,
            dataDensity:       getR('asst-density') || 'balanced',
            notifyRise:        getC('asst-nrise'),
            notifyFall:        getC('asst-nfall'),
            notifyTrend:       getC('asst-ntrend'),
            notifyVolatility:  false,
            analysisDaily:     getC('asst-daily'),
            analysisWeekly:    getC('asst-weekly'),
            analysisMonthly:   getC('asst-monthly'),
            volatilityAnalysis:getC('asst-volatility'),
            trendAnalysis:     getC('asst-trend'),
            devMode:           getC('asst-devmode')
        };
        saveAsstSettings();

        // Asistanı hemen yeniden başlat
        restartAssistantInterval();

        closeModal();
        buildLogoEl(document.querySelector('#harem-custom-navbar .nl'));
        applyVisibility();
        removeDuplicateRows();
        applyRowOrder();
        applyRowVisibility();
    }

    /* ───────────── FIYAT MANIPULASYONU ───────────── */
    function applyPriceOffsets() {
        if (observer) observer.disconnect();
        try {
            document.querySelectorAll('.dashboard-grid table tbody tr').forEach(row => {
                const origName = getOriginalName(row);
                if (!origName) return;

                const safeDom = origName.replace(/\s+/g, '');

                let pName = null;
                for (let k in config.prices) {
                    if (k.replace(/\\s+/g, '') === safeDom) {
                        pName = k;
                        break;
                    }
                }

                if (!pName) return;
                const pc = config.prices[pName];

                const bc = row.querySelector('td:nth-child(2)');
                const sc = row.querySelector('td:nth-child(3)');
                if (bc) modifyPrice(bc, pc.buyOffset, pc.type);
                if (sc) modifyPrice(sc, pc.sellOffset, pc.type);
            });
        } finally {
            startObserver();
        }
    }

    function modifyPrice(cell, offset, type) {
        if (!offset) return;
        function findNum(node) {
            if (node.nodeType === 3 && /[0-9]/.test(node.nodeValue)) return node;
            for (let i = 0; i < node.childNodes.length; i++) {
                const f = findNum(node.childNodes[i]);
                if (f) return f;
            }
            return null;
        }
        const tn = findNum(cell);
        if (!tn) return;
        const raw = tn.nodeValue.trim();
        const last = cell.getAttribute('data-harem-last');
        if (raw === last) return;
        const orig = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
        if (isNaN(orig)) return;
        let val = orig + (type === 'percent' ? orig * parseFloat(offset) / 100 : parseFloat(offset));
        const parts = raw.split(',');
        let dec = (parts.length > 1 && parts[1].length <= 3) ? parts[1].length : 2;
        const fmt = val.toLocaleString('tr-TR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
        if (tn.nodeValue !== fmt) {
            tn.nodeValue = fmt;
            cell.setAttribute('data-harem-last', fmt);
        }
    }

    /* ───────────── OBSERVER (debounced) ───────────── */
    let observer;
    let debTimer = null;

    observer = new MutationObserver(() => {
        // Görünürlük + fiyatları ANINDA uygula (titreme engeller)
        applyVisibility();
        applyRowVisibility();
        // Fiyat ofsetlerini de hemen uygula — 300ms bekleme titreme yaratıyordu
        applyPriceOffsets();

        // Sadece ağır temizlik işlemlerini debounce ile yap
        if (debTimer) clearTimeout(debTimer);
        debTimer = setTimeout(() => {
            removeDuplicateRows();
        }, 300);
    });

    function startObserver() {
        const target = document.querySelector('.dashboard-grid');
        if (target) {
            observer.disconnect();
            // characterData:true KALDIRILDI — kendi fiyat yazımımız observer'ı tekrar tetiklemesin
            observer.observe(target, { childList: true, subtree: true });
        } else {
            setTimeout(startObserver, 1000);
        }
    }

    /* ───────────── BOX DRAG ON PAGE ───────────── */
    let bds = null;
    function enableBoxDragDrop() {
        const grid = document.querySelector('.dashboard-left') || document.querySelector('.dashboard-grid');
        if (!grid) return;
        grid.querySelectorAll(':scope > .box, :scope > div > .box').forEach(box => {
            if (box.dataset.hd) return;
            box.dataset.hd = '1';
            box.draggable = true;
            box.addEventListener('dragstart', e => { bds = box; box.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
            box.addEventListener('dragend', () => { box.classList.remove('dragging'); document.querySelectorAll('.dot').forEach(x => x.classList.remove('dot')); });
            box.addEventListener('dragover', e => { e.preventDefault(); if (bds !== box) box.classList.add('dot'); });
            box.addEventListener('dragleave', () => box.classList.remove('dot'));
            box.addEventListener('drop', e => {
                e.preventDefault();
                if (bds && bds !== box) {
                    const p = box.parentNode;
                    const si = [...p.children].indexOf(bds);
                    const di = [...p.children].indexOf(box);
                    if (si < di) p.insertBefore(bds, box.nextSibling);
                    else p.insertBefore(bds, box);
                }
                box.classList.remove('dot');
            });
        });
    }

    /* ───────────── FİYAT OKUMA ───────────── */
    const _priceHistory = {};
    const _dailyStats = { HASALTIN:0, ÇEYREK:0, ONS:0, count:0 };

    function readDomPrice(rowKeyword) {
        function findNumNode(node) {
            if (node.nodeType === 3 && /[0-9]/.test(node.nodeValue) && node.nodeValue.trim().length > 0) return node;
            for (let i = 0; i < node.childNodes.length; i++) {
                const f = findNumNode(node.childNodes[i]);
                if (f) return f;
            }
            return null;
        }
        let found = null;
        const kw = rowKeyword.toUpperCase().replace(/[\s\-_]/g, '');
        document.querySelectorAll('table tbody tr').forEach(row => {
            if (found !== null) return;
            const name = getOriginalName(row);
            if (!name) return;
            const domKw = name.toUpperCase().replace(/[\s\-_]/g, '');
            const isMatch = domKw === kw || domKw.startsWith(kw) || domKw.endsWith(kw) || (kw.length >= 5 && domKw.includes(kw));
            if (!isMatch) return;
            const buyCell = row.querySelector('td:nth-child(2)');
            if (!buyCell) return;
            const tn = findNumNode(buyCell);
            if (tn) {
                const raw = tn.nodeValue.trim().replace(/\./g, '').replace(',', '.');
                const v = parseFloat(raw);
                if (!isNaN(v) && v > 0) found = v;
            }
        });
        return found;
    }

    let lastRecordTime = 0;
    function recordPrice(key) {
        const price = readDomPrice(key);
        if (price === null) return null;
        if (!_priceHistory[key]) _priceHistory[key] = [];
        const hist = _priceHistory[key];

        // Veri yoğunluğu ayarı (high: hep kaydet, balanced: 30sn'de bir, low: 60sn'de bir)
        let minDelay = 0;
        if (asstSettings.dataDensity === 'balanced') minDelay = 30000;
        if (asstSettings.dataDensity === 'low') minDelay = 60000;

        const now = Date.now();
        const shouldSaveDB = (now - lastRecordTime >= minDelay);

        if (!hist.length || hist[hist.length - 1].v !== price || shouldSaveDB) {
            const entry = { t: now, v: price };
            hist.push(entry);
            // RAM'de max 1000 kayıt tut (uzun oturumlar için)
            if (hist.length > 1000) hist.shift();

            if (shouldSaveDB) {
                saveToIDB(key, entry);
                lastRecordTime = now;
            }
        }
        return price;
    }

    function getPct(key) {
        const hist = _priceHistory[key];
        if (!hist || hist.length < 2) return null;
        const old = hist[0].v, cur = hist[hist.length - 1].v;
        return ((cur - old) / old) * 100;
    }

    /* ───────────── MODERN SVG İKONLAR (Lucide) ───────────── */
    function getModernFaceIcon(state) {
        let path = '';
        let color = '#9ca3af'; // neutral
        
        if (state === 'happy') {
            color = '#4ade80';
            path = '<circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>';
        } else if (state === 'worried') {
            color = '#fb923c';
            path = '<circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>';
        } else if (state === 'panic') {
            color = '#f87171'; // dizzy face
            path = '<circle cx="12" cy="12" r="10"></circle><path d="M8 15h8"></path><path d="m9 8 2 2-2 2"></path><path d="m15 8-2 2 2 2"></path>';
        } else if (state === 'rocket') {
            color = '#86efac';
            path = '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline>';
        } else {
            // neutral default kalır
            path = '<circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>';
        }

        return `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 6px ${color}55);">${path}</svg>`;
    }

    /* ───────────── İSTATİSTİK & GELİŞTİRİCİ ───────────── */
    function updateStatDisplay() {
        const dEl = document.getElementById('astat-daily');
        const wEl = document.getElementById('astat-weekly');
        const cEl = document.getElementById('astat-change');
        if (!dEl || !wEl || !cEl) return;

        // Örnek: HASALTIN üzerinden analiz
        const hist = _priceHistory['HASALTIN'];
        if (!hist || hist.length < 2) {
            dEl.innerText = '-'; wEl.innerText = '-'; cEl.innerText = '-';
            return;
        }

        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;

        const dailyData = hist.filter(h => now - h.t <= oneDay);
        const weeklyData = hist.filter(h => now - h.t <= oneWeek);

        const getAvg = (arr) => arr.length ? (arr.reduce((s, a) => s + a.v, 0) / arr.length).toFixed(2) : '-';
        const getChg = (arr) => arr.length > 1 ? (((arr[arr.length-1].v - arr[0].v) / arr[0].v) * 100).toFixed(2) + '%' : '-';

        dEl.innerText = dailyData.length ? getAvg(dailyData) + ' ₺' : '-';
        wEl.innerText = weeklyData.length ? getAvg(weeklyData) + ' ₺' : '-';
        cEl.innerText = getChg(hist);
    }

    function toggleDevData(show) {
        const dEl = document.getElementById('abot-devdata');
        if (!dEl) return;
        dEl.style.display = show ? 'block' : 'none';
        if (show) {
            const hist = _priceHistory['HASALTIN'] || [];
            let html = '<div style="margin-bottom:4px;color:#ccc">HAS ALTIN SON 20 KAYIT:</div>';
            html += '<table style="width:100%;text-align:left;border-collapse:collapse;"><tr><th>Zaman</th><th>Fiyat</th></tr>';
            const recent = hist.slice(-20).reverse();
            recent.forEach(h => {
                const d = new Date(h.t);
                html += `<tr><td style="border-top:1px solid #333;padding:2px 0;">${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}</td><td style="border-top:1px solid #333;color:#4ade80">${h.v}</td></tr>`;
            });
            html += '</table>';
            dEl.innerHTML = html;
        }
    }

    /* ───────────── ASİSTAN ANALİZ ───────────── */
    function analyzeMarket() {
        const hasPrice    = recordPrice('HASALTIN');
        const ceyrekPrice = recordPrice('ÇEYREK');
        const onsPrice    = recordPrice('ONS');
        const gramPrice   = recordPrice('GRAM');

        // Henüz veri yok
        if (!hasPrice && !ceyrekPrice && !onsPrice) {
            return { state:'neutral', bg:'#141414', varlik:'—', durum:'Yükleniyor', mesaj:'⏳ Fiyatlar yükleniyor...', pctStr:'', pct: 0 };
        }

        const hasPct    = getPct('HASALTIN');
        const ceyrekPct = getPct('ÇEYREK');
        const onsPct    = getPct('ONS');

        // İlk kayıt (tek nokta)
        if (hasPct === null && ceyrekPct === null && onsPct === null) {
            const hasFmt = hasPrice ? hasPrice.toLocaleString('tr-TR', {minimumFractionDigits:2,maximumFractionDigits:2}) + ' ₺' : '?';
            return { state:'happy', bg:'#0f2318', varlik:'Has Altın', durum:'Takip Başladı',
                     mesaj:'🙂 Takip başladı, izliyorum.', pctStr: hasFmt, pct: 0 };
        }

        // En çok değişeni bul
        const candidates = [
            { key:'HASALTIN',  label:'Has Altın',   pct: hasPct },
            { key:'ÇEYREK',    label:'Çeyrek',       pct: ceyrekPct },
            { key:'ONS',       label:'Ons Altın',    pct: onsPct },
        ].filter(c => c.pct !== null);

        if (!candidates.length) {
            return { state:'neutral', bg:'#141414', varlik:'—', durum:'Stabil', mesaj:'😐 Piyasa şu an sakin.', pctStr:'', pct: 0 };
        }

        // Mutlak değerce en büyük değişim
        candidates.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
        const top = candidates[0];
        const pct = top.pct;
        const pctStr = (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';

        // Ekstra zeka
        const allUp   = candidates.every(c => c.pct > 0.05);
        const allDown = candidates.every(c => c.pct < -0.05);
        const mixed   = candidates.some(c => c.pct > 0.1) && candidates.some(c => c.pct < -0.1);

        let trendNote = '';
        if (asstSettings.trendAnalysis) {
            if (allUp && candidates.length >= 2)    trendNote = ' (Genel Yükseliş Eğilimi)';
            else if (allDown && candidates.length >= 2) trendNote = ' (Genel Düşüş Eğilimi)';
            else if (mixed)                         trendNote = ' (Karmaşık Yönlü Trend)';
        }

        // Varlığa Göre Arka Plan Temel Rengi
        let baseBg = '#141414';
        if (top.key === 'HASALTIN') baseBg = '#142018'; // HasAltın -> Daha Yeşilimsi Karanlık
        if (top.key === 'ÇEYREK')   baseBg = '#101422'; // Çeyrek -> Daha Mavimsi Karanlık
        if (top.key === 'ONS')      baseBg = '#22141c'; // Ons -> Daha Pembemsi/Mor Karanlık

        // Durum tespiti (Tavsiyesiz, objektif)
        let state, bg, durum, mesaj;

        if (pct >= 2) {
            state='rocket'; bg = top.key === 'HASALTIN' ? '#0b3d1f' : (top.key === 'ÇEYREK' ? '#0d2d47' : '#4d1e3d');
            durum='Hızlı Yükseliş';
            mesaj=`${top.label} ${pctStr} oranında yükseliş gösterdi.${trendNote}`;
        } else if (pct >= 1) {
            state='panic'; bg = top.key === 'HASALTIN' ? '#14301c' : (top.key === 'ÇEYREK' ? '#142a40' : '#3d1a2c');
            durum='Güçlü Yükseliş';
            mesaj=`${top.label} ${pctStr} seviyesinde bir artış kaydetti.${trendNote}`;
        } else if (pct >= 0.3) {
            state='worried'; bg = top.key === 'HASALTIN' ? '#1a2e20' : (top.key === 'ÇEYREK' ? '#161d2d' : '#2b141d');
            durum='Orta Yükseliş';
            mesaj=`${top.label} fiyatında ${pctStr} kısmi artış gözlemlendi.${trendNote}`;
        } else if (pct >= 0.0) {
            state='happy'; bg=baseBg;
            durum='Hafif Yükseliş / Sabit';
            mesaj=`${top.label} stabil ve hafif pozitif (${pctStr}).${trendNote}`;
        } else if (pct > -0.1) {
            state='neutral'; bg=baseBg;
            durum='Stabil';
            mesaj=`${top.label} fiyatında yatay seyir sürüyor (${pctStr}).${trendNote}`;
        } else if (pct > -0.3) {
            state='worried'; bg = top.key === 'HASALTIN' ? '#2e251a' : (top.key === 'ÇEYREK' ? '#2a1717' : '#301815');
            durum='Hafif Düşüş';
            mesaj=`${top.label} fiyatında ufak bir azalma oldu (${pctStr}).${trendNote}`;
        } else if (pct > -1) {
            state='worried'; bg = top.key === 'HASALTIN' ? '#3d261a' : (top.key === 'ÇEYREK' ? '#3b1818' : '#3d1c15');
            durum='Orta Düşüş';
            mesaj=`${top.label} fiyatında ${pctStr} oranında gerileme mevcut.${trendNote}`;
        } else if (pct > -2) {
            state='panic'; bg = top.key === 'HASALTIN' ? '#4a1a14' : (top.key === 'ÇEYREK' ? '#421212' : '#4f1a18');
            durum='Güçlü Düşüş';
            mesaj=`${top.label} şu an ${pctStr} belirgin düşüşte.${trendNote}`;
        } else {
            state='panic'; bg = top.key === 'HASALTIN' ? '#5c0f0f' : (top.key === 'ÇEYREK' ? '#570a0a' : '#5c1010');
            durum='Sert Düşüş';
            mesaj=`${top.label} yüksek oranda değer kaybetti (${pctStr}).${trendNote}`;
        }

        return { state, bg, varlik: top.label, durum, mesaj, pctStr, pct };
    }

    let lastNotifTime = 0;
    function checkAndNotify(state, durum, mesaj, pct) {
        if (!window.Notification) return;

        // Ayar kontrolü
        let shouldNotify = false;
        if (asstSettings.notifyRise && pct >= 2) shouldNotify = true;
        if (asstSettings.notifyFall && pct <= -2) shouldNotify = true;
        
        // Zırt pırt bildirim atmasın (en az 5 dk ara)
        const now = Date.now();
        if (shouldNotify && (now - lastNotifTime > 300000)) {
            if (Notification.permission === 'granted') {
                new Notification('Harem Altın Asistanı: ' + durum, {
                    body: mesaj,
                    icon: config.logoBase64 || config.logoUrl || ''
                });
                lastNotifTime = now;
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(p => {
                    if (p === 'granted') checkAndNotify(state, durum, mesaj, pct);
                });
            }
        }
    }

    function updateAssistant() {
        const faceEl = document.getElementById('harem-face');
        const msgEl  = document.getElementById('harem-msg');
        const nav    = document.getElementById('harem-custom-navbar');
        if (!faceEl || !msgEl || !nav) return;

        const { state, bg, varlik, durum, mesaj, pctStr, pct } = analyzeMarket();

        // Bildirim kontrolü
        checkAndNotify(state, durum, mesaj, pct);

        // Dinamik renk ayarı ZORLA AÇIK
        nav.style.background = bg;
        nav.style.boxShadow  = '0 4px 20px rgba(0,0,0,.4)';

        // Yüz ikonunu güncelle (Lucide)
        if (!faceEl.dataset.state || faceEl.dataset.state !== state) {
            faceEl.dataset.state = state;
            faceEl.className = 'face-' + state;
            
            faceEl.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${getModernFaceIcon(state)}</div>`;
        }

        // Ekran çerçevesi uyarı (Flash Edge)
        const edgeFlash = document.getElementById('harem-edge-flash');
        if (edgeFlash) {
            // Animasyonu sıfırlamak için void trick
            edgeFlash.style.animation = 'none';
            edgeFlash.offsetHeight;
            edgeFlash.style.animation = '';

            if (pct >= 2) {
                edgeFlash.className = 'flash-up';
            } else if (pct <= -2) {
                edgeFlash.className = 'flash-down';
            } else {
                edgeFlash.className = '';
            }
        }

        // Mesaj güncelle (fade)
        msgEl.style.opacity = '0';
        setTimeout(() => {
            msgEl.innerHTML = `<span class="msg-label">Piyasa Asistanı — ${varlik}</span><span class="msg-main">${mesaj}</span>`;
            msgEl.style.opacity = '1';
        }, 300);
    }

    let asstIntervalTimer = null;
    function initAssistant() {
        // Asistan yüzünü BAŞLANGIÇTA ZORLA GÖSTER (Eski ayarlar false kalsa bile görünsün)
        const faceEl = document.getElementById('harem-face');
        if (faceEl) {
            faceEl.style.display = 'flex'; // Her zaman göster
        }

        // Mesaj balonunu ayarla
        const msgEl = document.getElementById('harem-msg');
        if (msgEl) {
            if (asstSettings.msgType === 'short') msgEl.style.fontSize = '11px';
            else if (asstSettings.msgType === 'detailed') msgEl.style.fontSize = '14px';
        }

        // Önce IDB'den geçmiş yükle
        loadHistoryFromIDB().then(history => {
            Object.assign(_priceHistory, history);
            pruneIDB(); // Eski verileri temizle

            // Düzenli veri çekme/analiz başlat
            restartAssistantInterval();
        });
    }

    function restartAssistantInterval() {
        if (asstIntervalTimer) clearInterval(asstIntervalTimer);

        let iv = asstSettings.fetchInterval * 1000 || 10000;
        if (asstSettings.autoMode || asstSettings.smartMode) {
            const h = new Date().getHours();
            // Sabah 10 ile akşam 18 arası daha sık, gece daha yavaş (Otomatik Mod)
            iv = (h > 9 && h < 18) ? 10000 : 30000;
        }

        // Yüz BAŞLANGIÇTA ZORLA GÖSTER
        const faceEl = document.getElementById('harem-face');
        if (faceEl) {
            faceEl.style.display = 'flex'; // Her zaman göster
        }

        if (!asstSettings.animations) {
            document.documentElement.style.setProperty('--face-glow', 'transparent');
            const style = document.createElement('style');
            style.innerHTML = '#harem-face { animation: none !important; }';
            document.head.appendChild(style);
        }

        // İlk kez hemen çalıştır (IDB yüklendiği için artık hazırdır)
        updateAssistant();

        asstIntervalTimer = setInterval(updateAssistant, iv);
    }

    function safelySwapSvgSymbols() {
        const upPath = '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>';
        const downPath = '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline>';

        let attempts = 0;
        const iv = setInterval(() => {
            attempts++;
            const upArrow = document.getElementById('upArrow');
            const downArrow = document.getElementById('downArrow');
            if (upArrow && downArrow) {
                if (!upArrow.hasAttribute('data-harem-swapped')) {
                    upArrow.innerHTML = upPath;
                    upArrow.setAttribute('viewBox', '0 0 24 24');
                    upArrow.setAttribute('fill', 'none');
                    upArrow.setAttribute('stroke', 'currentColor');
                    upArrow.setAttribute('stroke-width', '2.5');
                    upArrow.setAttribute('stroke-linecap', 'round');
                    upArrow.setAttribute('stroke-linejoin', 'round');
                    upArrow.setAttribute('data-harem-swapped', 'true');
                }
                if (!downArrow.hasAttribute('data-harem-swapped')) {
                    downArrow.innerHTML = downPath;
                    downArrow.setAttribute('viewBox', '0 0 24 24');
                    downArrow.setAttribute('fill', 'none');
                    downArrow.setAttribute('stroke', 'currentColor');
                    downArrow.setAttribute('stroke-width', '2.5');
                    downArrow.setAttribute('stroke-linecap', 'round');
                    downArrow.setAttribute('stroke-linejoin', 'round');
                    downArrow.setAttribute('data-harem-swapped', 'true');
                }
                clearInterval(iv);
            }
            if (attempts > 20) clearInterval(iv);
        }, 500);
    }

    /* ───────────── INIT ───────────── */
    function init() {
        injectStyles();
        injectNavbar();
        createAdminPanel();
        buildLogoEl(document.querySelector('#harem-custom-navbar .nl'));
        applyVisibility();
        removeDuplicateRows();
        // Apply saved row order BEFORE visibility so order is correct
        applyRowOrder();
        applyRowVisibility();
        applyPriceOffsets();
        startObserver();
        setTimeout(enableBoxDragDrop, 1500);
        initAssistant(); // Piyasa asistanını başlat
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

})();
