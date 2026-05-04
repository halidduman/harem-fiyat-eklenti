/**
 * Harem Altin Premium Overhaul v5.9 - Fetih Kuyumculuk Edition
 * Floating bot analyst and ultra-spacious table UI for maximum readability.
 */

(function () {
    console.log('Fetih Premium Overhaul v5.9 Starting...');

    /* ───────────── CSS INJECTION ───────────── */
    function injectStyles() {
        if (document.getElementById('fetih-overhaul-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'fetih-overhaul-styles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Inter:wght@400;500;600;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap');

            :root {
                --primary: #e9c176;
                --surface: #0f0f0f;
                --surface-container: #1a1a1a;
                --card-bg: rgba(35, 35, 35, 0.9);
                --on-surface: #e5e2e1;
                --outline: #6a6254;
                --error: #f87171;
                --success: #4ade80;
            }

            body {
                margin: 0; padding: 0;
            }

            #fetih-root {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: var(--surface); z-index: 2147483647; display: flex; flex-direction: column; align-items: center;
                padding-bottom: 120px; overflow-y: auto; overflow-x: hidden;
                color: var(--on-surface) !important;
                font-family: 'Inter', sans-serif !important;
            }

            .glass-card {
                background: var(--card-bg);
                backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(233, 193, 118, 0.2);
                border-radius: 28px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                transition: all 0.3s ease;
            }

            .font-headline { font-family: 'Manrope', sans-serif; }

            nav {
                width: 100%; padding: 8px 40px; display: flex; align-items: center; justify-content: space-between;
                background: #000; position: sticky; top: 0; z-index: 1000;
                border-bottom: 1px solid rgba(233, 193, 118, 0.1); box-sizing: border-box;
            }

            .live-dot { width: 8px; height: 8px; background: var(--primary); border-radius: 50%; animation: pulse 2s infinite; }
            @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
            @keyframes spin { 100% { transform: rotate(360deg); } }
            .loading-icon { animation: spin 2s linear infinite; color: var(--outline); font-size: 24px; }
            
            .bento-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; width: 100%; max-width: 1240px; margin: 0 auto; }
            .card-6 { grid-column: span 6; }
            .card-3 { grid-column: span 3; }

            /* Table Styles - SPACIOUS & READABLE */
            .fetih-table-box { width: 100%; background: var(--surface-container); border-radius: 8px; overflow: hidden; border: 1px solid rgba(233, 193, 118, 0.2); }
            table { width: 100%; border-collapse: separate; border-spacing: 0; }
            th { padding: 30px 60px; text-align: left; font-size: 11px; font-weight: 900; text-transform: uppercase; color: var(--outline); letter-spacing: 3px; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(233,193,118,0.1); }
            td { padding: 30px 60px; font-size: 20px; font-weight: 500; border-bottom: 1px solid rgba(255,255,255,0.04); }
            th:first-child, td:first-child { padding-left: 80px; }
            th:last-child, td:last-child { padding-right: 80px; text-align: right; }
            tr:nth-child(even) { background: rgba(255,255,255,0.02); }
            tr:hover { background: rgba(233, 193, 118, 0.05); }
            .t-val { font-family: 'Manrope', sans-serif; font-weight: 800; }

            @keyframes up { 0% { color: var(--success); text-shadow: 0 0 15px rgba(74, 222, 128, 0.4); } 100% { color: inherit; } }
            @keyframes down { 0% { color: var(--error); text-shadow: 0 0 15px rgba(248, 113, 113, 0.4); } 100% { color: inherit; } }
            .up { animation: up 1.2s ease; }
            .down { animation: down 1.2s ease; }

            .overview-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; width: 100%; max-width: 1240px; }
            .mini-card { padding: 20px 24px; background: var(--card-bg); border: 1px solid rgba(233,193,118,0.2); border-radius: 24px; text-align: left; }
            
            /* ── NAVBAR BOT ── */
            #fetih-bot-trigger {
                display: flex; align-items: center;
                height: 42px;
                border-radius: 999px;
                background: rgba(10, 10, 10, 0.9);
                border: 1px solid rgba(233, 193, 118, 0.25);
                cursor: pointer;
                overflow: hidden; /* Kesin clipping */
                flex-shrink: 0;
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            }
            #fetih-bot-trigger:hover { border-color: rgba(233, 193, 118, 0.5); }

            .siri-orb {
                width: 40px; height: 40px; flex-shrink: 0;
                border-radius: 50%;
                background: #000;
                display: flex; align-items: center; justify-content: center;
                position: relative;
                z-index: 10; /* Yazının üstünde kalması için */
            }

            .siri-icon { color: var(--primary); font-size: 20px; position: relative; }

            .bot-msg-text {
                font-size: 13px; font-weight: 700; color: #fff;
                white-space: nowrap; 
                overflow: hidden;
                max-width: 0; opacity: 0;
                padding: 0;
                display: flex; align-items: center;
                transition:
                    max-width 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                    opacity 0.4s ease;
                /* İkon hizasından itibaren görünmezlik maskesi */
                -webkit-mask-image: linear-gradient(to right, transparent, black 10px, black calc(100% - 15px), transparent);
                mask-image: linear-gradient(to right, transparent, black 10px, black calc(100% - 15px), transparent);
            }

            #fetih-bot-trigger.is-open .bot-msg-text {
                max-width: calc(100vw - 350px);
                opacity: 1;
                padding-left: 10px; padding-right: 20px;
            }

            #asst-msg {
                display: inline-block;
            }

            /* Marquee Animasyonu */
            #fetih-bot-trigger.is-open #asst-msg {
                animation: marquee 20s linear infinite;
                animation-delay: 3s;
            }
            
            @keyframes marquee {
                0% { transform: translateX(0); }
                20% { transform: translateX(0); } 
                80% { transform: translateX(-35%); } 
                100% { transform: translateX(0); }
            }

            .has-card-active {
                background: linear-gradient(135deg, var(--primary) 0%, #c5a059 100%) !important;
                border: none !important;
            }
            .has-card-active * { color: #2a2200 !important; }
            .has-card-active .t-val { color: #000 !important; }

            /* Multiplier badges */
            .mult-badge {
                font-size: 10px; font-weight: 900; letter-spacing: 0.05em; color: #e9c176;
                background: rgba(233,193,118,0.10); border: 1px solid rgba(233,193,118,0.25);
                border-radius: 999px; padding: 1px 7px; line-height: 1.6;
            }
            .star-badge {
                display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px;
                border-radius: 50%; background: rgba(233,193,118,0.10); border: 1px solid rgba(233,193,118,0.30);
            }
            .has-card-active .mult-badge, .has-card-active .star-badge {
                background: rgba(0,0,0,0.1); border-color: rgba(0,0,0,0.2); color: #000;
            }
            .has-card-active .star-badge span { color: #000 !important; }

            /* Custom Scrollbar for Fetih UI */
            #fetih-root::-webkit-scrollbar {
                width: 10px;
            }
            #fetih-root::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.2);
            }
            #fetih-root::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.1); /* Koyu Gri */
                border-radius: 10px;
                border: 2px solid transparent; 
                background-clip: content-box;
                transition: all 0.3s ease;
            }
            #fetih-root::-webkit-scrollbar-thumb:hover {
                background: #CBA65F; /* İstenen Altın Tonu */
                box-shadow: 0 0 10px rgba(203, 166, 95, 0.4);
            }
        `;

        document.head.appendChild(style);
    }

    /* ───────────── UI INJECTION ───────────── */
    function injectUI() {
        if (document.getElementById('fetih-root')) return;

        // Sekme başlığı ve logoyu güncelle
        document.title = "Fetih Kuyumculuk";
        let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/svg+xml';
        link.rel = 'shortcut icon';
        link.href = chrome.runtime.getURL('f-logo.svg');
        document.getElementsByTagName('head')[0].appendChild(link);

        const root = document.createElement('div');
        root.id = 'fetih-root';
        root.innerHTML = `
            <nav>
                <img src="${chrome.runtime.getURL('fetih.svg')}" style="height:32px; width:auto; display:block;" alt="Fetih Logo">
                <div style="display:flex;align-items:center;gap:10px">
                    <div id="fetih-bot-trigger">
                        <div class="siri-orb">
                            <span class="material-symbols-outlined siri-icon">smart_toy</span>
                        </div>
                        <span id="asst-msg" class="bot-msg-text"></span>
                    </div>
                    <button id="fetih-sound-btn"
                        title="Sesi Aç/Kapat"
                        style="background:rgba(255,255,255,0.06);border:1px solid rgba(233,193,118,0.25);border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s">
                        <span class="material-symbols-outlined" style="font-size:18px;color:var(--outline)">volume_off</span>
                    </button>
                </div>
            </nav>

            <main style="width:100%; max-width:1440px; padding:30px 60px; box-sizing:border-box">

                <!-- Featured Bento Grid -->
                <div class="bento-grid">
                    <div class="glass-card card-6 has-card-active" style="padding:35px 45px; position:relative; overflow:hidden">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:35px">
                            <div>
                                <span style="font-size:10px; font-weight:900; text-transform:uppercase; opacity:0.6; letter-spacing:2px; display:block; margin-bottom:10px">Ana Varlık</span>
                                <h2 class="font-headline" style="font-size:38px; font-weight:900; margin:0">Has Altın (24K)</h2>
                            </div>
                            <div style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.1); padding:8px 14px; border-radius:100px; font-size:11px; font-weight:900; border: 2px solid #c6a059;">
                                <div class="live-dot"></div>
                                CANLI
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:minmax(180px, 1fr) minmax(180px, 1fr); gap:50px">
                            <div>
                                <span style="font-size:11px; font-weight:800; opacity:0.6; text-transform:uppercase; display:block; margin-bottom:10px">ALIŞ</span>
                                <div id="val-has-buy" class="t-val" style="font-size:48px; font-weight:900; letter-spacing:-2px">--</div>
                            </div>
                            <div>
                                <span style="font-size:11px; font-weight:800; opacity:0.6; text-transform:uppercase; display:block; margin-bottom:10px">SATIŞ</span>
                                <div id="val-has-sell" class="t-val" style="font-size:48px; font-weight:900; letter-spacing:-2px">--</div>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card card-3" style="padding:28px">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px">
                            <h3 class="font-headline" style="font-size:16px; font-weight:900; text-transform:uppercase; letter-spacing:1px; margin:0">Gram Altın</h3>
                            <span class="material-symbols-outlined" style="font-size:24px; color:#c6a059">workspace_premium</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:24px">
                            <div>
                                <span style="font-size:11px; font-weight:900; color:var(--outline); text-transform:uppercase; display:block; margin-bottom:8px">ALIŞ</span>
                                <div id="val-gram-buy" class="t-val" style="font-size:32px; font-weight:900">--</div>
                            </div>
                            <div style="padding-top:20px; border-top:1px solid rgba(255,255,255,0.1)">
                                <span style="font-size:11px; font-weight:900; color:var(--outline); text-transform:uppercase; display:block; margin-bottom:8px">SATIŞ</span>
                                <div id="val-gram-sell" class="t-val" style="font-size:32px; font-weight:900; color:var(--primary)">--</div>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card card-3" style="padding:28px">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px">
                            <h3 class="font-headline" style="font-size:16px; font-weight:900; text-transform:uppercase; letter-spacing:1px; margin:0">ONS Altın</h3>
                            <span class="material-symbols-outlined text-primary" style="font-size:18px">show_chart</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:24px">
                            <div>
                                <span style="font-size:11px; font-weight:900; color:var(--outline); text-transform:uppercase; display:block; margin-bottom:8px">USD / ONS</span>
                                <div id="val-ons-buy" class="t-val" style="font-size:32px; font-weight:900">--</div>
                            </div>
                            <div style="padding-top:20px; border-top:1px solid rgba(255,255,255,0.1)">
                                <span style="font-size:11px; font-weight:900; color:var(--outline); text-transform:uppercase; display:block; margin-bottom:8px">SATIŞ</span>
                                <div id="val-ons-sell" class="t-val" style="font-size:32px; font-weight:900; color:var(--primary)">--</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sarrafiye Overview Grid -->
                <div style="margin-top:30px; margin-bottom: 40px">
                    <div id="overview-grid" class="overview-grid"></div>
                </div>

                <!-- Market Table -->
                <div style="margin-top:50px">
                    <h3 class="font-headline" style="font-size:28px; font-weight:900; text-transform:uppercase; margin-bottom:40px; padding-left:30px; color:#fff; letter-spacing:1px">Tüm Piyasa Fiyatları</h3>
                    <div class="fetih-table-box">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width:40%">Varlık</th>
                                    <th>Alış Fiyatı</th>
                                    <th>Satış Fiyatı</th>
                                    <th>Trend</th>
                                </tr>
                            </thead>
                            <tbody id="sync-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </main>
        `;
        document.body.appendChild(root);

        // Event Listener'ları bağla (Isolated World hatasını önlemek için)
        const botTrigger = document.getElementById('fetih-bot-trigger');
        if (botTrigger) botTrigger.addEventListener('click', () => window.toggleFetihBot());

        const soundBtn = document.getElementById('fetih-sound-btn');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => window._fetihToggleSound());
            // Başlangıç durumunu yükle
            if (soundEnabled) {
                soundBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;color:#4ade80">volume_up</span>';
                soundBtn.title = 'Ses: AÇIK';
                soundBtn.style.borderColor = 'rgba(74, 222, 128, 0.5)';
                soundBtn.style.background = 'rgba(74, 222, 128, 0.1)';
            }
        }
    }

    /* ───────────── NOTIFICATIONS & SOUND ───────────── */
    let audioCtx = null;
    const NOTIFY_CONFIG = {
        threshold: 0.08, // % change threshold for sudden movement
        cooldown: 5000,  // ms between notifications for the same asset
    };
    const lastNotify = {};
    let soundEnabled = localStorage.getItem('fetihSoundEnabled') === 'true'; 

    function initAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {}
    }

    function playBeep(freq, duration, type = 'sine', volume = 0.8) {
        if (!soundEnabled) return;
        try {
            initAudio();
            if (!audioCtx) return;
            if (audioCtx.state === 'suspended') audioCtx.resume();
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            
            gain.gain.setValueAtTime(volume, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {}
    }

    function playUpSequence() {
        for(let i=0; i<3; i++) {
            setTimeout(() => {
                playBeep(987.77, 0.2, 'triangle', 0.6);
                setTimeout(() => playBeep(1318.51, 0.25, 'triangle', 0.6), 150);
            }, i * 600); // Her dizi arasında 600ms bekle (toplam 3 kez)
        }
    }

    function playDownSequence() {
        for(let i=0; i<3; i++) {
            setTimeout(() => {
                playBeep(440, 0.2, 'sine', 0.8);
                setTimeout(() => playBeep(329.63, 0.3, 'sine', 0.8), 150);
            }, i * 600);
        }
    }

    function notifySuddenMove(assetName, direction, pct) {
        const now = Date.now();
        if (lastNotify[assetName] && (now - lastNotify[assetName] < NOTIFY_CONFIG.cooldown)) return;
        lastNotify[assetName] = now;

        // Ses çalma işlemi artık mesaj görüntüleyiciye (setMessage) devredildi.
        // Böylece hem canlı fiyat takibinden hem de analiz botundan gelen uyarılar ses çıkaracak.

        // Inform the Bot — yeşil=yükseliş, kırmızı=düşüş
        if (window.fetihBotNotify) {
            const dirText  = direction === 'up' ? 'Ani yükseliş' : 'Sert düşüş';
            const icon     = direction === 'up' ? 'trending_up'  : 'trending_down';
            const color    = direction === 'up' ? '#4ade80'       : '#f87171';
            window.fetihBotNotify(
                `⚠️ ${dirText}: ${assetName} %${pct.toFixed(2)} hareket etti.`,
                icon,
                color
            );
        }
    }

    /* ─── SES AKTİVASYONU: İlk kullanıcı etkileşiminde AudioContext'i aç ─── */
    let audioUnlocked = false;
    function unlockAudio() {
        initAudio();
        if (!audioCtx) return;

        const updateBtn = () => {
            const btn = document.getElementById('fetih-sound-btn');
            if (btn) {
                btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;color:#4ade80">volume_up</span>';
                btn.title = 'Ses aktif';
                btn.style.borderColor = 'rgba(74, 222, 128, 0.5)';
            }
        };

        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
                // Sessiz bir test sesi çal — aktif hale getirmek için
                const osc  = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + 0.01);
                
                updateBtn();
                audioUnlocked = true;
            }).catch(e => console.warn('Audio resume failed:', e));
        } else if (audioCtx.state === 'running') {
            updateBtn();
            audioUnlocked = true;
        }
    }
    document.addEventListener('click',   unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
    
    window._fetihUnlockAudio = unlockAudio; // Geriye dönük uyumluluk
    window._fetihPlayUp = playUpSequence;
    window._fetihPlayDown = playDownSequence;
    window._fetihToggleSound = function() {
        if (!audioUnlocked) {
            unlockAudio();
        }
        soundEnabled = !soundEnabled;
        localStorage.setItem('fetihSoundEnabled', soundEnabled);
        
        const btn = document.getElementById('fetih-sound-btn');
        if (btn) {
            if (soundEnabled) {
                btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;color:#4ade80">volume_up</span>';
                btn.title = 'Ses: AÇIK';
                btn.style.borderColor = 'rgba(74, 222, 128, 0.5)';
                btn.style.background = 'rgba(74, 222, 128, 0.1)';
            } else {
                btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;color:#f87171">volume_off</span>';
                btn.title = 'Ses: KAPALI';
                btn.style.borderColor = 'rgba(248, 113, 113, 0.3)';
                btn.style.background = 'rgba(248, 113, 113, 0.05)';
            }
        }
    };

    // "s" tuşu ile gizli ses testi (Bota müdahale etmez)
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key.toLowerCase() === 's') {
            const isUp = Math.random() > 0.5;
            if (isUp) {
                playUpSequence();
            } else {
                playDownSequence();
            }
        }
    });

    /* ───────────── DATA SYNC ───────────── */
    // Tıklanınca aç/kapat — zamanlayıcı fetih_analyst.js tarafından yönetilir
    window.toggleFetihBot = function() {
        unlockAudio(); // Her etkileşimde ses aktive et
        const trigger = document.getElementById('fetih-bot-trigger');
        if (!trigger) return;
        trigger.classList.toggle('is-open');
    };

    const priceHistory = {};
    const HISTORY_WINDOW_MS = 10000; // 10 saniye momentum penceresi

    function updateValue(id, val, assetName = '') {
        const el = document.getElementById(id);
        if (!el || el.textContent === val) return;
        
        if (!val || val === '-' || val === 'NaN') {
            el.innerHTML = '<span class="material-symbols-outlined loading-icon" style="font-size:32px">sync</span>';
            return;
        }

        const oldNum = parseFloat(el.textContent.replace(/\./g, '').replace(',', '.'));
        const newNum = parseFloat(val.replace(/\./g, '').replace(',', '.'));
        el.textContent = val;

        if (!isNaN(newNum) && assetName) {
            const now = Date.now();
            if (!priceHistory[assetName]) priceHistory[assetName] = [];
            
            // Yeni fiyatı ekle
            priceHistory[assetName].push({ price: newNum, time: now });
            
            // 10 saniyeden eski verileri temizle
            priceHistory[assetName] = priceHistory[assetName].filter(h => now - h.time <= HISTORY_WINDOW_MS);
            
            const direction = newNum > oldNum ? 'up' : (newNum < oldNum ? 'down' : '');
            
            if (direction) {
                el.classList.remove('up', 'down');
                void el.offsetWidth;
                el.classList.add(direction);
            }

            // Kümülatif 10-saniye momentum analizi
            if (priceHistory[assetName].length >= 2) {
                const prices = priceHistory[assetName].map(h => h.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                
                // En düşükten tepeye değişim %si (Yükseliş momentumu)
                const upPct = ((newNum - minPrice) / minPrice) * 100;
                // En yüksekten dibe değişim %si (Düşüş momentumu)
                const downPct = ((maxPrice - newNum) / maxPrice) * 100;

                // Öncelikli Uyarı (10 saniyelik birikimli değişime bakıyoruz)
                if (upPct >= NOTIFY_CONFIG.threshold) {
                    notifySuddenMove(assetName, 'up', upPct);
                    priceHistory[assetName] = [{ price: newNum, time: now }]; // Tetiklendiğinde sıfırla
                } else if (downPct >= NOTIFY_CONFIG.threshold) {
                    notifySuddenMove(assetName, 'down', downPct);
                    priceHistory[assetName] = [{ price: newNum, time: now }];
                }
            }
        }
    }

    function sync() {
        const data = {};
        document.querySelectorAll('.dashboard-grid table tbody tr, .market-data table tbody tr, .full-height-table tr, .full-height-table a.item.title').forEach(el => {
            let name, buy, sell, rate, dir;
            if (el.tagName === 'A') {
                name = el.textContent.trim().toUpperCase();
                const bEl = el.nextElementSibling;
                const sEl = bEl?.nextElementSibling;
                const rEl = sEl?.nextElementSibling;
                buy = bEl?.textContent.trim();
                sell = sEl?.textContent.trim();
                rate = rEl?.textContent.trim() || '%0.00';
                dir = rEl?.classList.contains('drop') ? 'down' : (rEl?.classList.contains('rise') ? 'up' : '');
            } else {
                name = el.querySelector('td:first-child, a.title, .item-name')?.textContent.trim().toUpperCase();
                buy = el.querySelector('.buy, .price:nth-child(2), td:nth-child(2)')?.textContent.trim();
                sell = el.querySelector('.sell, .price:nth-child(3), td:nth-child(3)')?.textContent.trim();
                const rateEl = el.querySelector('.rate, .item.rate');
                rate = rateEl ? rateEl.textContent.trim() : '%0.00';
                dir = rateEl ? (rateEl.classList.contains('drop') ? 'down' : (rateEl.classList.contains('rise') ? 'up' : '')) : '';
            }
            if (name && buy && sell) {
                const cleanName = name.replace(/\s+/g, '');
                data[cleanName] = { name, buy, sell, rate, dir };
            }
        });

        if (Object.keys(data).length === 0) return;

        // Big Boxes Mapping
        const mapping = {
            'HASALTIN': ['val-has-buy', 'val-has-sell'],
            'HAS': ['val-has-buy', 'val-has-sell'],
            'GRAMALTIN': ['val-gram-buy', 'val-gram-sell'],
            'ONS': ['val-ons-buy', 'val-ons-sell'],
            'ONSALTIN': ['val-ons-buy', 'val-ons-sell']
        };

        Object.entries(mapping).forEach(([key, ids]) => {
            if (data[key]) {
                const assetLabel = key.includes('HAS') ? 'Has Altın' : (key.includes('GRAM') ? 'Gram Altın' : 'ONS');
                updateValue(ids[0], data[key].buy);
                updateValue(ids[1], data[key].sell, assetLabel);
            }
        });

        // Overview
        const overview = document.getElementById('overview-grid');
        if (overview) {
            const requested = [
                { key: 'ESKİÇEYREK', label: 'Eski Çeyrek', mult: '1x' },
                { key: 'ESKİYARIM',  label: 'Eski Yarım', mult: '×2' },
                { key: 'ESKİTAM',    label: 'Eski Tam',   mult: '×4' },
                { key: 'ESKİATA',    label: 'Eski Ata',   star: true },
                { key: 'ESKİGREMSE', label: 'Eski Gremse', mult: '×10' }
            ];
            overview.innerHTML = requested.map(item => {
                const v = data[item.key] || { buy: '-', sell: '-', rate: '%0.00', dir: '' };
                const badge = item.mult ? `<span class="mult-badge">${item.mult}</span>` : 
                             (item.star ? `<span class="star-badge"><span class="material-symbols-outlined" style="font-size:12px;color:#e9c176">star</span></span>` : '');
                
                const arrow = v.dir === 'up' ? `<span class="material-symbols-outlined" style="color:var(--success);font-size:16px;vertical-align:text-bottom">arrow_upward</span>` : 
                             (v.dir === 'down' ? `<span class="material-symbols-outlined" style="color:var(--error);font-size:16px;vertical-align:text-bottom">arrow_downward</span>` : '');
                const rateColor = v.dir === 'up' ? 'var(--success)' : (v.dir === 'down' ? 'var(--error)' : 'var(--outline)');

                const dBuy = (v.buy && v.buy !== '-' && v.buy !== 'NaN') ? `${arrow} ${v.buy}` : '<span class="material-symbols-outlined loading-icon" style="font-size:16px">sync</span>';
                const dSell = (v.sell && v.sell !== '-' && v.sell !== 'NaN') ? `${arrow} ${v.sell}` : '<span class="material-symbols-outlined loading-icon" style="font-size:16px">sync</span>';

                return `
                    <div class="mini-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                            <div style="font-size:11px; font-weight:900; color:var(--primary); opacity:0.9; letter-spacing:1px">${item.label}</div>
                            ${badge}
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
                            <span style="font-size:9px; opacity:0.5; font-weight:900; color:#fff">AL</span>
                            <span class="t-val" style="font-size:17px; font-weight:800">${dBuy}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1)">
                            <span style="font-size:9px; opacity:0.5; font-weight:900; color:#fff">SAT</span>
                            <span class="t-val" style="font-size:17px; font-weight:900; color:var(--primary)">${dSell}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Table update
        const tbody = document.getElementById('sync-tbody');
        if (tbody) {
            tbody.innerHTML = Object.values(data).map(v => {
                const arrow = v.dir === 'up' ? `<span class="material-symbols-outlined" style="color:var(--success);font-size:20px;vertical-align:bottom">arrow_drop_up</span>` : 
                             (v.dir === 'down' ? `<span class="material-symbols-outlined" style="color:var(--error);font-size:20px;vertical-align:bottom">arrow_drop_down</span>` : '');
                const rateColor = v.dir === 'up' ? 'var(--success)' : (v.dir === 'down' ? 'var(--error)' : 'var(--outline)');

                const tBuy = (v.buy && v.buy !== '-' && v.buy !== 'NaN') ? `${arrow}${v.buy}` : '<span class="material-symbols-outlined loading-icon">sync</span>';
                const tSell = (v.sell && v.sell !== '-' && v.sell !== 'NaN') ? `${arrow}${v.sell}` : '<span class="material-symbols-outlined loading-icon">sync</span>';
                const safeName = (v.name || '').replace('ALTIN', ' ALTIN').replace('ESKI', 'ESKİ ').trim();
                
                return `
                <tr>
                    <td style="font-weight:800; color:#fff; letter-spacing:2px">${safeName}</td>
                    <td class="t-val" style="font-size:22px">${tBuy}</td>
                    <td class="t-val" style="color:var(--primary); font-size:22px">${tSell}</td>
                    <td style="text-align:right">
                        <div style="display:inline-flex; align-items:center; gap:4px; font-weight:900; font-size:16px; color:${rateColor}; background:rgba(255,255,255,0.05); padding:6px 12px; border-radius:8px">
                            ${v.rate}
                        </div>
                    </td>
                </tr>
            `}).join('');
        }

        // Bot mesajı artık fetih_analyst.js tarafından yönetiliyor.
    }

    /* ───────────── BOOT ───────────── */
    function boot() {
        // Cloudflare veya güvenlik doğrulaması ekranındaysak (Örn: "Bir dakika lütfen") bekle
        const titleText = document.title.toLowerCase();
        const bodyText = document.body ? document.body.innerText.toLowerCase() : '';
        
        if (titleText.includes('bir dakika') || 
            titleText.includes('just a moment') || 
            titleText.includes('cloudflare') ||
            bodyText.includes('güvenlik doğrulaması') ||
            bodyText.includes('bot olmadığınızı') ||
            document.querySelector('#challenge-running') ||
            document.querySelector('#cf-challenge-running')) {
            
            console.log('Güvenlik ekranı tespit edildi, bekleniyor...');
            setTimeout(boot, 3000);
            return;
        }

        // Sayfada fiyat tabloları ve en az bir veri satırı henüz yüklenmediyse bekle
        const dataExists = document.querySelector('.dashboard-grid table tr, .market-data table tr, .full-height-table tr');
        if (!dataExists) {
            console.log('Veri satırları aranıyor...');
            setTimeout(boot, 1500);
            return;
        }

        // Veriler geldiğinde arayüzü enjekte et
        if (!document.getElementById('fetih-root')) {
            injectStyles();
            injectUI();
            setInterval(sync, 1000);
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();

})();
