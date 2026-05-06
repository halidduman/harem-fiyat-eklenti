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
                --primary: #CDA860;
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
            .fetih-loader { animation: spin 1s linear infinite !important; color: #CDA860 !important; }
            
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
            .mini-card { padding: 20px 24px; background: var(--card-bg); border: 1px solid rgba(233,193,118,0.2); border-radius: 24px; text-align: left; position: relative; }
            
            /* Gremse ile Ata arasına dik çizgi ve ekstra mesafe */
            .overview-grid > div:nth-child(5) {
                margin-left: 14px; /* Ekstra boşluk */
            }
            .overview-grid > div:nth-child(5)::before {
                content: "";
                position: absolute;
                left: -16px; /* (16px gap + 14px margin) / 2 = 15px, +1px offset */
                top: 15px;
                bottom: 15px;
                width: 2px;
                background: #CDA860;
                opacity: 0.8;
                border-radius: 2px;
            }
            
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
                will-change: width, border-color;
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
                transition: max-width 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease, margin 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: max-width, opacity, margin;
                margin-left: 0; margin-right: 0;
            }

            #fetih-bot-trigger.is-open .bot-msg-text {
                max-width: 800px; /* Sabit bir üst sınır takılmayı azaltır */
                opacity: 1;
                margin-left: 10px; margin-right: 20px; /* Padding yerine margin */
            }

            #asst-msg {
                display: inline-block;
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
                background: rgba(255, 255, 255, 0.15);
                border-radius: 10px;
                border: 3px solid transparent; 
                background-clip: content-box;
                transition: background 0.4s ease, box-shadow 0.4s ease;
            }
            #fetih-root::-webkit-scrollbar-thumb:hover {
                background: #CDA860;
                background-clip: content-box; /* Boyutun değişmemesi için sabit tutuyoruz */
                box-shadow: 0 0 8px rgba(205, 168, 96, 0.4);
            }

            /* ── COMPARISON DASHBOARD ── */
            #fetih-dash-modal {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
                z-index: 2147483647; display: none; align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.4s ease;
            }
            #fetih-dash-modal.active { display: flex; opacity: 1; }

            .dash-container {
                width: 90%; max-width: 850px; height: 520px; /* Daha da kompakt boyut */
                background: #111; border: 1px solid rgba(233,193,118,0.3);
                border-radius: 32px; display: flex; flex-direction: column; overflow: hidden;
                box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            }

            .dash-header {
                padding: 30px 40px; border-bottom: 1px solid rgba(233,193,118,0.1);
                display: flex; justify-content: space-between; align-items: center;
            }

            .dash-tabs { display: flex; gap: 20px; padding: 20px 40px; background: rgba(0,0,0,0.2); }
            .dash-tab {
                padding: 10px 20px; border-radius: 12px; cursor: pointer;
                font-weight: 800; font-size: 13px; color: var(--outline);
                transition: all 0.3s; border: 1px solid transparent;
            }
            .dash-tab.active {
                background: rgba(233,193,118,0.1); color: var(--primary);
                border-color: rgba(233,193,118,0.3);
            }

            .dash-content { flex: 1; padding: 20px 30px; overflow: hidden; }

            .comparison-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
            .comp-card {
                padding: 20px; background: rgba(255,255,255,0.03); border-radius: 24px;
                border: 1px solid rgba(255,255,255,0.05); transition: transform 0.3s;
            }
            .comp-card:hover { transform: translateY(-5px); border-color: rgba(233,193,118,0.2); }

            .price-indicator-bar {
                width: 100%; height: 6px; background: rgba(255,255,255,0.1);
                border-radius: 10px; margin: 40px 0; position: relative;
                overflow: hidden;
            }
            .price-progress {
                position: absolute; top: 0; left: 0; height: 100%;
                background: linear-gradient(90deg, var(--error), var(--primary), var(--success));
                width: 100%; opacity: 0.8;
            }
            .price-marker {
                position: absolute; top: -6px; width: 4px; height: 18px;
                background: #fff; border-radius: 2px; transform: translateX(-50%);
                box-shadow: 0 0 10px #fff; transition: left 1s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .stat-label { font-size: 10px; font-weight: 900; color: var(--outline); text-transform: uppercase; margin-bottom: 8px; display: block; }
            .stat-val { font-family: 'Manrope', sans-serif; font-size: 20px; font-weight: 900; }
            .stat-diff { font-size: 13px; font-weight: 700; margin-top: 2px; }
            .stat-detail { font-size: 9px; opacity: 0.5; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px; display: flex; flex-direction: column; gap: 1px; }
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
        link.href = chrome.runtime.getURL('assets/f-logo.svg');
        document.getElementsByTagName('head')[0].appendChild(link);

        const root = document.createElement('div');
        root.id = 'fetih-root';
        root.innerHTML = `
            <nav>
                <img src="${chrome.runtime.getURL('assets/fetih.svg')}" style="height:32px; width:auto; display:block;" alt="Fetih Logo">
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
                                <span style="font-size:10px; font-weight:900; text-transform:uppercase; opacity:0.6; letter-spacing:2px; display:block; margin-bottom:10px">Fetih Kuyumculuk</span>
                                <h2 class="font-headline" style="font-size:38px; font-weight:900; margin:0">Has Altın (24K)</h2>
                            </div>
                            <div style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.1); padding:8px 14px; border-radius:100px; font-size:11px; font-weight:900; border: 1px solid rgba(0,0,0,0.25);">
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

            <!-- Comparison Dashboard Modal -->
            <div id="fetih-dash-modal">
                <div class="dash-container">
                    <div class="dash-header">
                        <div style="display:flex; align-items:center; gap:15px">
                            <div class="siri-orb" style="width:48px; height:48px">
                                <span class="material-symbols-outlined siri-icon" style="font-size:24px">analytics</span>
                            </div>
                            <div>
                                <h2 class="font-headline" style="margin:0; font-size:22px">Fetih Piyasa Analizi</h2>
                                <span style="font-size:12px; opacity:0.6; font-weight:700">Canlı Karşılaştırmalı Veri Paneli</span>
                            </div>
                        </div>
                        <button id="fetih-dash-close" style="background:none; border:none; color:var(--outline); cursor:pointer">
                            <span class="material-symbols-outlined" style="font-size:32px">close</span>
                        </button>
                    </div>

                    <div class="dash-tabs" id="dash-tabs-list">
                        <div class="dash-tab active" data-asset="HAS">HAS ALTIN</div>
                        <div class="dash-tab" data-asset="CEYREK">ÇEYREK ALTIN</div>
                        <div class="dash-tab" data-asset="ONS">ONS ALTIN</div>
                    </div>

                    <div class="dash-content">
                        <!-- Horizontal Indicator -->
                        <div style="margin-bottom: 25px">
                            <div style="display:flex; justify-content:space-between; margin-bottom:10px">
                                <span class="stat-label">30 Günlük Aralık (Dip - Zirve)</span>
                                <span id="dash-current-price" class="t-val" style="color:var(--primary); font-size:16px">-- TL</span>
                            </div>
                            <div class="price-indicator-bar" style="margin: 20px 0">
                                <div class="price-progress"></div>
                                <div id="price-marker" class="price-marker" style="left: 50%"></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; opacity:0.5">
                                <span id="dash-range-low">-- TL</span>
                                <span id="dash-range-high">-- TL</span>
                            </div>
                        </div>

                        <!-- Comparison Cards -->
                        <div class="comparison-grid">
                            <div class="comp-card">
                                <span class="stat-label">Düne Göre</span>
                                <div id="comp-yesterday-diff" class="stat-diff">--</div>
                                <div class="stat-detail" id="comp-yesterday-detail">
                                    <span>Henüz veri yok</span>
                                </div>
                            </div>
                            <div class="comp-card">
                                <span class="stat-label">Geçen Haftaya Göre</span>
                                <div id="comp-weekly-diff" class="stat-diff">--</div>
                                <div class="stat-detail" id="comp-weekly-detail">
                                    <span>Henüz veri yok</span>
                                </div>
                            </div>
                            <div class="comp-card">
                                <span class="stat-label">1 Ay Önceye Göre</span>
                                <div id="comp-monthly-diff" class="stat-diff">--</div>
                                <div class="stat-detail" id="comp-monthly-detail">
                                    <span>Henüz veri yok</span>
                                </div>
                            </div>
                        </div>

                        <!-- Analysis Insights -->
                        <div id="dash-insight" style="margin-top:25px; padding:15px 20px; background:rgba(233,193,118,0.05); border-radius:16px; border-left:4px solid var(--primary)">
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px">
                                <span class="material-symbols-outlined" style="color:var(--primary); font-size:18px">lightbulb</span>
                                <span style="font-weight:900; font-size:12px; text-transform:uppercase">Bot Analizi</span>
                            </div>
                            <p id="dash-insight-text" style="margin:0; font-size:13px; line-height:1.5; opacity:0.85">Veriler yükleniyor...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(root);

        // Event Listener'ları bağla (Isolated World hatasını önlemek için)
        const botTrigger = document.getElementById('fetih-bot-trigger');
        if (botTrigger) botTrigger.addEventListener('click', () => window.openFetihDash());

        const closeBtn = document.getElementById('fetih-dash-close');
        if (closeBtn) closeBtn.addEventListener('click', () => window.closeFetihDash());

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

        // Dashboard Tabs Listeners (UI enjekte edildikten sonra bağlanmalı)
        document.querySelectorAll('.dash-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentDashAsset = tab.dataset.asset;
                updateDashData();
            });
        });
    }

    /* ───────────── NOTIFICATIONS & SOUND ───────────── */
    let audioCtx = null;
    const NOTIFY_CONFIG = {
        min_report_pct: 1.0,  // %1.0 - Raporlama Alt Sınırı (Normal piyasayı yoksay)
        fast_move_pct: 3.0,   // %3.0 - Hızlı Hareket
        extreme_pct: 5.0,     // %5.0 - Ekstrem/Kriz Durumu
        cooldown: 300000,     // 5 dakika cooldown (Stabilizasyon süresi)
    };
    const lastNotify = {};
    const stableTrack = {}; // Stabilizasyon takibi için
    const lastStepPrice = {}; // Fiyat adımlarını takip etmek için
    let startupCooldown = true; // Başlangıçta hatalı alarmları önlemek için
    const TL_STEP_CONFIG = {
        'HASALTIN': 50,
        'YENICEKREK': 50,
        'YENIATA': 50
    };
    let soundEnabled = localStorage.getItem('fetihSoundEnabled') === 'true';

    function playSingleBeep(isUp = true) {
        if (!soundEnabled || !audioUnlocked || !audioCtx) return;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => { });
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isUp ? 880 : 440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.5);
    }

    function initAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { }
    }

    function playBeep(freq, duration, type = 'sine', volume = 0.8) {
        if (!soundEnabled || !audioUnlocked || !audioCtx) return;
        try {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume().catch(() => { });
            }

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
        } catch (e) { }
    }

    function playUpSequence() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                playBeep(987.77, 0.2, 'triangle', 0.6);
                setTimeout(() => playBeep(1318.51, 0.25, 'triangle', 0.6), 150);
            }, i * 600); // Her dizi arasında 600ms bekle (toplam 3 kez)
        }
    }

    function playDownSequence() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                playBeep(440, 0.2, 'sine', 0.8);
                setTimeout(() => playBeep(329.63, 0.3, 'sine', 0.8), 150);
            }, i * 600);
        }
    }

    function notifySuddenMove(assetName, direction, pct) {
        if (startupCooldown) return; // Başlangıçta veri oturana kadar sus
        const now = Date.now();

        // Stabilizasyon Kontrolü: 5 dakika içinde benzer bir hareket olduysa ve fiyat yerinde sayıyorsa sus
        if (lastNotify[assetName] && (now - lastNotify[assetName] < NOTIFY_CONFIG.cooldown)) {
            // Eğer yeni değişim eskisine çok yakınsa (%0.2'den az fark varsa), piyasa "stabilize" olmuş demektir
            if (Math.abs(pct - (stableTrack[assetName] || 0)) < 0.2) {
                return;
            }
        }

        // %1 altındaki "normal" hareketleri tamamen yoksay
        if (pct < NOTIFY_CONFIG.min_report_pct) return;

        lastNotify[assetName] = now;
        stableTrack[assetName] = pct; // Son raporlanan oranı kaydet

        const isExtreme = pct >= NOTIFY_CONFIG.extreme_pct;
        const isFast = pct >= NOTIFY_CONFIG.fast_move_pct;

        if (window.fetihBotNotify) {
            let dirText, icon, color;

            if (isExtreme) {
                dirText = direction === 'up' ? '🚨 EKSTREM YÜKSELİŞ (KRİZ/HABER)' : '🚨 EKSTREM DÜŞÜŞ (KRİZ/HABER)';
                icon = 'emergency';
                color = direction === 'up' ? '#4ade80' : '#f87171';
            } else if (isFast) {
                dirText = direction === 'up' ? '🚀 Hızlı Artış' : '📉 Hızlı Azalış';
                icon = direction === 'up' ? 'rocket_launch' : 'trending_down';
                color = direction === 'up' ? '#4ade80' : '#f87171';
            } else {
                // %1 - %3 arası
                dirText = direction === 'up' ? '📈 Belirgin Artış' : '📉 Belirgin Azalış';
                icon = direction === 'up' ? 'trending_up' : 'trending_down';
                color = direction === 'up' ? '#4ade80' : '#f87171';
            }

            window.fetihBotNotify(
                `${dirText}: ${assetName} %${pct.toFixed(2)} seviyesine ulaştı.`,
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
                const osc = audioCtx.createOscillator();
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
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });

    window._fetihUnlockAudio = unlockAudio; // Geriye dönük uyumluluk
    window._fetihPlayUp = playUpSequence;
    window._fetihPlayDown = playDownSequence;
    window._fetihToggleSound = function () {
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
    window.toggleFetihBot = function () {
        unlockAudio(); // Her etkileşimde ses aktive et
        const trigger = document.getElementById('fetih-bot-trigger');
        if (!trigger) return;
        trigger.classList.toggle('is-open');
    };

    /* ─── DASHBOARD LOGIC ─── */
    let currentDashAsset = 'HAS';
    window.openFetihDash = function () {
        unlockAudio();
        const modal = document.getElementById('fetih-dash-modal');
        if (modal) {
            modal.classList.add('active');
            updateDashData();
        }
    };
    window.closeFetihDash = function () {
        const modal = document.getElementById('fetih-dash-modal');
        if (modal) modal.classList.remove('active');
    };

    async function updateDashData() {
        if (typeof window.getFetihAssetAnalysis !== 'function') return;

        const data = await window.getFetihAssetAnalysis(currentDashAsset);
        if (!data) return;

        // Current Price
        document.getElementById('dash-current-price').textContent = data.current + ' TL';

        // Range & Marker
        if (data.range) {
            document.getElementById('dash-range-low').textContent = data.range.low + ' TL';
            document.getElementById('dash-range-high').textContent = data.range.high + ' TL';

            const total = data.range.high - data.range.low;
            const current = data.current - data.range.low;
            const pct = Math.min(100, Math.max(0, (current / total) * 100));
            document.getElementById('price-marker').style.left = pct + '%';
        }

        // Comparison Cards
        const setComp = (idPrefix, compData, label) => {
            const diffEl = document.getElementById(`comp-${idPrefix}-diff`);
            const detailEl = document.getElementById(`comp-${idPrefix}-detail`);

            if (!compData) {
                diffEl.textContent = 'Veri yok';
                diffEl.style.color = 'var(--outline)';
                detailEl.innerHTML = `<span>Henüz geçmiş veri toplanmadı.</span>`;
                return;
            }

            const sign = compData.pct > 0 ? '+' : '';
            const color = compData.pct > 0 ? 'var(--success)' : (compData.pct < 0 ? 'var(--error)' : 'var(--outline)');
            const diffTL = (data.current - compData.price).toFixed(2);

            diffEl.innerHTML = `${sign}${compData.pct}% <span style="font-size:0.8em; opacity:0.6; margin-left:5px">(${sign}${diffTL} TL)</span>`;
            diffEl.style.color = color;

            detailEl.innerHTML = `
                <span>${label}: ${compData.price} TL</span>
                <span>Bugün: ${data.current} TL</span>
            `;
        };

        setComp('yesterday', data.yesterday, 'Dün');
        setComp('weekly', data.weekly, 'Geçen Hafta');
        setComp('monthly', data.monthly, '1 Ay Önce');

        // Insight Text
        document.getElementById('dash-insight-text').innerHTML = data.insight || 'Seçilen varlık için analiz hazırlanıyor...';
    }

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

                const upPct = ((newNum - minPrice) / minPrice) * 100;
                const downPct = ((maxPrice - newNum) / maxPrice) * 100;

                if (upPct >= NOTIFY_CONFIG.min_report_pct) {
                    notifySuddenMove(assetName, 'up', upPct);
                    priceHistory[assetName] = [{ price: newNum, time: now }];
                } else if (downPct >= NOTIFY_CONFIG.min_report_pct) {
                    notifySuddenMove(assetName, 'down', downPct);
                    priceHistory[assetName] = [{ price: newNum, time: now }];
                }
            }
        }
    }

    /* ───────────── OPTIMIZED SYNC & OBSERVER ───────────── */
    let lastDataString = "";

    function sync() {
        const data = {};
        const sourceRows = document.querySelectorAll('.dashboard-grid table tbody tr, .market-data table tbody tr, .full-height-table tr, .full-height-table a.item.title');

        if (!sourceRows.length) return;

        sourceRows.forEach(el => {
            let name, buy, sell, rate, dir;
            if (el.tagName === 'A') {
                name = el.textContent.trim().toUpperCase();
                const bEl = el.nextElementSibling;
                const sEl = bEl?.nextElementSibling;
                const rEl = sEl?.nextElementSibling;
                buy = bEl?.textContent.trim();
                sell = sEl?.textContent.trim();
                rate = rEl?.textContent.trim() || '0.00';

                // Sayısal kontrol ile kesin yön tespiti
                const cleanRate = rate.replace(',', '.');
                const match = cleanRate.match(/[+-]?\d+(\.\d+)?/);
                const numRate = match ? parseFloat(match[0]) : 0;

                dir = '';
                if (numRate > 0) dir = 'up';
                else if (numRate < 0) dir = 'down';
            } else {
                name = el.querySelector('td:first-child, a.title, .item-name')?.textContent.trim().toUpperCase();
                buy = el.querySelector('.buy, .price:nth-child(2), td:nth-child(2)')?.textContent.trim();
                sell = el.querySelector('.sell, .price:nth-child(3), td:nth-child(3)')?.textContent.trim();
                const rateEl = el.querySelector('.rate, .item.rate');
                rate = rateEl ? rateEl.textContent.trim() : '0.00';

                // Rakamı ayıkla (Örn: "▼ %-0.15" -> -0.15)
                const cleanRate = rate.replace(',', '.');
                const match = cleanRate.match(/[+-]?\d+(\.\d+)?/);
                const numRate = match ? parseFloat(match[0]) : 0;

                dir = '';
                if (numRate > 0) dir = 'up';
                else if (numRate < 0) dir = 'down';
            }

            // ─── YENİ: TL BAREM TAKİBİ (Step Filter) ───
            const cleanName = (name || '').replace(/\s+/g, '');
            const stepThreshold = TL_STEP_CONFIG[cleanName];
            if (stepThreshold && buy && buy !== '-') {
                const currentPrice = parseFloat(buy.replace('.', '').replace(',', '.'));
                if (!lastStepPrice[cleanName]) {
                    lastStepPrice[cleanName] = currentPrice;
                } else {
                    const diff = Math.abs(currentPrice - lastStepPrice[cleanName]);
                    if (diff >= stepThreshold) {
                        const isUp = currentPrice > lastStepPrice[cleanName];
                        lastStepPrice[cleanName] = currentPrice; // Yeni baremi sabitle

                        // Uyarı ver
                        playSingleBeep(isUp);
                        if (window._fetihSetMessage) {
                            window._fetihSetMessage(`🎯 Barem Aşıldı: ${name} ${isUp ? 'yükselerek' : 'düşerek'} ${currentPrice} TL seviyesine ulaştı!`, true);
                        }
                    }
                }
            }

            if (name && buy && sell) {
                data[cleanName] = { name, buy, sell, rate, dir };

                const numRate = parseFloat(rate.replace('%', '').replace(',', '.'));
                if (!isNaN(numRate)) {
                    if (!this.lastSiteRates) this.lastSiteRates = {};
                    if (this.lastSiteRates[cleanName] !== undefined) {
                        const diff = Math.abs(numRate - this.lastSiteRates[cleanName]);
                        if (diff >= NOTIFY_CONFIG.min_report_pct) {
                            notifySuddenMove(name, numRate > this.lastSiteRates[cleanName] ? 'up' : 'down', diff);
                        }
                    }
                    this.lastSiteRates[cleanName] = numRate;
                }
            }
        });

        // Veri değişmediyse UI güncellemesini atla (CPU tasarrufu)
        const currentDataString = JSON.stringify(data);
        if (currentDataString === lastDataString) return;
        lastDataString = currentDataString;

        // Big Boxes
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

        // Overview & Table - Sadece içerik değiştiğinde DOM'a dokun
        requestAnimationFrame(() => {
            renderOverview(data);
            renderTable(data);
        });
    }

    function renderOverview(data) {
        const overview = document.getElementById('overview-grid');
        if (!overview) return;
        const requested = [
            { key: 'ESKİÇEYREK', label: 'Çeyrek', mult: '1x' },
            { key: 'ESKİYARIM', label: 'Yarım', mult: '×2' },
            { key: 'ESKİTAM', label: 'Tam', mult: '×4' },
            { key: 'ESKİGREMSE', label: 'Gremse', mult: '×10' },
            { key: 'ESKİATA', label: 'Ata', star: true }
        ];

        overview.innerHTML = requested.map(item => {
            const v = data[item.key] || { buy: '-', sell: '-', rate: '%0.00', dir: '' };
            const isAta = item.key === 'ESKİATA';
            const accentColor = isAta ? '#ff9800' : 'var(--primary)'; // Slightly orange for Eski Ata

            const badge = item.mult ? `<span class="mult-badge" style="${isAta ? 'color:#ff9800; border-color:rgba(255,152,0,0.3); background:rgba(255,152,0,0.1);' : ''}">${item.mult}</span>` :
                (item.star ? `<span class="star-badge" style="${isAta ? 'border-color:rgba(255,152,0,0.4); background:rgba(255,152,0,0.1);' : ''}"><span class="material-symbols-outlined" style="font-size:12px;color:${accentColor}">star</span></span>` : '');

            const arrow = v.dir === 'up' ? `<span class="material-symbols-outlined" style="color:var(--success);font-size:16px;vertical-align:text-bottom">arrow_upward</span>` :
                (v.dir === 'down' ? `<span class="material-symbols-outlined" style="color:var(--error);font-size:16px;vertical-align:text-bottom">arrow_downward</span>` : '');

            const dBuy = (v.buy && v.buy !== '-' && v.buy !== 'NaN') ? `${arrow} ${v.buy}` : '<span class="material-symbols-outlined loading-icon" style="font-size:16px">sync</span>';
            const dSell = (v.sell && v.sell !== '-' && v.sell !== 'NaN') ? `${arrow} ${v.sell}` : '<span class="material-symbols-outlined loading-icon" style="font-size:16px">sync</span>';

            const sellId = item.key === 'ESKİÇEYREK' ? 'id="val-ceyrek-sell"' : (item.key === 'ESKİATA' ? 'id="val-ata-sell"' : '');

            return `
                <div class="mini-card" style="${isAta ? 'border-color:rgba(255,152,0,0.4);' : ''}">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <div style="font-size:11px; font-weight:900; color:${accentColor}; opacity:0.9; letter-spacing:1px">${item.label}</div>
                        ${badge}
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
                        <span style="font-size:9px; opacity:0.5; font-weight:900; color:#fff">AL</span>
                        <span class="t-val" style="font-size:17px; font-weight:800">${dBuy}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1)">
                        <span style="font-size:9px; opacity:0.5; font-weight:900; color:#fff">SAT</span>
                        <span ${sellId} class="t-val" style="font-size:17px; font-weight:900; color:${accentColor}">${dSell}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderTable(data) {
        const tbody = document.getElementById('sync-tbody');
        if (!tbody) return;
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

    /* ───────────── BOOT ───────────── */
    function boot() {
        const titleText = document.title.toLowerCase();
        if (titleText.includes('bir dakika') || titleText.includes('cloudflare')) {
            setTimeout(boot, 3000);
            return;
        }

        const dataExists = document.querySelector('.dashboard-grid table tr, .market-data table tr, .full-height-table tr');
        if (!dataExists) {
            setTimeout(boot, 1500);
            return;
        }

        if (!document.getElementById('fetih-root')) {
            injectStyles();
            injectUI();

            // 20 saniye boyunca alarm çalma (veri oturana kadar)
            setTimeout(() => { startupCooldown = false; }, 20000);

            // MutationObserver: Sitedeki değişiklikleri izle, timer'ı kapat ve DEBOUNCE ekle
            let syncTimeout;
            const observer = new MutationObserver(() => {
                if (syncTimeout) clearTimeout(syncTimeout);
                syncTimeout = setTimeout(sync, 100); // 100ms Debounce (Performans artışı)
            });

            const target = document.querySelector('.dashboard-grid') || document.body;
            observer.observe(target, { childList: true, subtree: true, characterData: true });

            sync(); // İlk yüklemede çalıştır

            // Backup Timer: Sadece her şeyin yolunda olduğundan emin olmak için 5 saniyede bir
            setInterval(sync, 5000);
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();

})();
