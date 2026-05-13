/**
 * Harem Altin Premium Overhaul v5.9 - Fetih Kuyumculuk Edition
 * Floating bot analyst and ultra-spacious table UI for maximum readability.
 */

(function () {
    if (window._fetihOverhaulActive) {
        console.log('Fetih Premium Overhaul already active.');
        return;
    }
    window._fetihOverhaulActive = true;

    console.log('Fetih Premium Overhaul v5.9 Starting...');

    /* ───────────── GLOBAL STATE & EFFECTS ───────────── */
    window._GLASS_CLASSES = window._GLASS_CLASSES || ['glass-frost', 'glass-liquid', 'glass-gold', 'glass-none'];
    window._TEX_CLASSES = window._TEX_CLASSES || ['tex-p1', 'tex-p2', 'tex-p3', 'tex-p4', 'tex-p5', 'tex-p6', 'tex-p7', 'tex-p8', 'tex-p9', 'tex-p10', 'tex-p11', 'tex-p12', 'tex-p13', 'tex-p14', 'tex-p15'];
    window._GLOW_CLASSES = window._GLOW_CLASSES || ['glow-soft', 'glow-neon', 'glow-pulse', 'glow-halo', 'glow-orbit', 'glow-drift', 'glow-aurora', 'glow-edges', 'glow-corners', 'glow-diagonal', 'glow-cinema', 'glow-matrix'];
    window._NAV_CLASSES = window._NAV_CLASSES || ['nav-normal', 'nav-shadow', 'nav-theme', 'nav-invisible'];
    window._isPMode = window._isPMode || false;
    window.applyEffect = function (type, value) {
        const r = document.getElementById('fetih-root');
        const pools = { glass: window._GLASS_CLASSES, tex: window._TEX_CLASSES, glow: window._GLOW_CLASSES, nav: window._NAV_CLASSES, navGlass: ['nav-liquid'] };
        const keys = { glass: 'fetihGlass', tex: 'fetihTex', glow: 'fetihGlow', nav: 'fetihNav', navGlass: 'fetihNavGlass' };

        if (type === 'navGlass') {
            const nav = document.querySelector('#fetih-root nav');
            if (nav) {
                nav.classList.remove('nav-liquid');
                if (value) nav.classList.add(value);
            }
        } else if (type === 'nav') {
            const nav = document.querySelector('#fetih-root nav');
            if (nav) {
                nav.classList.remove(...window._NAV_CLASSES, 'nav-liquid');
                if (value) nav.classList.add(value);
            }
        } else if (r) {
            r.classList.remove(...(pools[type] || []));
            if (value) r.classList.add(value);
        }
        localStorage.setItem(keys[type], value || '');
        document.querySelectorAll(`.${type}-btn`).forEach(b => b.classList.toggle('active', b.dataset[type] === value));
    };


    /* ───────────── CSS INJECTION ───────────── */
    function injectStyles() {
        if (document.getElementById('fetih-overhaul-styles')) return;

        // SVG filters removed for performance optimization (feTurbulence/DisplacementMap cause lag)


        const style = document.createElement('style');
        style.id = 'fetih-overhaul-styles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Inter:wght@400;500;600;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&display=swap');

            :root {
                --primary: #CDA860;
                --primary-rgb: 205, 168, 96;
                --primary-dark: #9a7840;
                --surface: #000000;
                --surface-container: #121212;
                --card-bg: #1e1e1e;
                --on-surface: #e5e2e1;
                --outline: #6a6254;
                --error: #f87171;
                --success: #4ade80;
                --card-border: rgba(var(--primary-rgb), 0.6);
                --card-surface: #1e1e1e;
                --glow-intensity: 1;
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
                scrollbar-gutter: stable;
            }
            #fetih-root * { box-sizing: border-box !important; }
            .section-width { width: 100% !important; max-width: 1240px !important; margin: 0 auto !important; }

            .glass-card, .fetih-card {
                background: var(--card-surface);
                border-radius: 16px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
                border: 1px solid var(--card-border);
                transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .glass-classic {
                background: var(--card-surface);
                border-radius: 16px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
                border: 1px solid var(--card-border);
                transition: transform 0.2s ease;
                position: relative;
                overflow: hidden;
            }
            #fetih-root tr.glass-classic:hover { background: rgba(255,255,255,0.04); }

            .font-headline { font-family: 'Manrope', sans-serif; }
            
            #fetih-root.is-fullscreen #fetih-hero-section {
                min-height: calc(100vh - 90px);
                justify-content: center;
                margin-bottom: 15vh;
            }

            nav {
                width: 100%; padding: 8px 40px; display: flex; align-items: center; justify-content: space-between;
                background: #000; position: sticky; top: 0; z-index: 1000;
                border-bottom: 1px solid rgba(var(--primary-rgb), 0.1); box-sizing: border-box;
                padding-right: 50px !important;
            }
            nav.nav-liquid {
                background: transparent !important;
                border-bottom: none !important;
            }
            nav.nav-liquid::before {
                content: ''; position: absolute; inset: 0; z-index: -1;
                background: #000;
                border-bottom: 1px solid rgba(var(--primary-rgb), 0.2);
            }
            /* Hide the ::before element for custom nav modes to allow true transparency */
            nav.nav-shadow::before, nav.nav-theme::before, nav.nav-invisible::before { display: none !important; }
            
            #fetih-settings-btn span.material-symbols-outlined { transition: transform 0.5s ease; }
            #fetih-settings-btn:hover span.material-symbols-outlined { transform: rotate(180deg); }

            .live-dot { width: 10px; height: 10px; background: var(--primary); border-radius: 50%; animation: live-pulse 2.5s infinite ease-in-out; display: inline-block; vertical-align: middle; }
            @keyframes live-pulse { 
                0% { background: color-mix(in srgb, var(--primary), white 40%); transform: scale(1); box-shadow: 0 0 8px rgba(var(--primary-rgb), 0.5); } 
                50% { background: #ffffff; transform: scale(1.4); box-shadow: 0 0 15px 8px rgba(255, 255, 255, 0.5); } 
                100% { background: color-mix(in srgb, var(--primary), white 40%); transform: scale(1); box-shadow: 0 0 8px rgba(var(--primary-rgb), 0.5); } 
            }
            @keyframes spin { 100% { transform: rotate(360deg); } }
            .loading-icon { animation: spin 2s linear infinite; color: var(--outline); font-size: 24px; }
            .loading-icon.stop-spin { animation: none !important; color: var(--error) !important; }
            .fetih-loader { animation: spin 1s linear infinite !important; color: var(--primary) !important; }
            
            /* Navbar View Modes */
            nav.nav-normal { background: #000 !important; border-bottom: 1px solid rgba(var(--primary-rgb), 0.1) !important; }
            #fetih-root.light-mode nav.nav-normal { background: #fff !important; border-bottom: 1px solid rgba(0,0,0,0.1) !important; }
            
            nav.nav-shadow { 
                background: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0) 100%) !important; 
                border-bottom: none !important; 
                box-shadow: none !important;
            }
            #fetih-root.light-mode nav.nav-shadow {
                background: linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 20%, rgba(255,255,255,0) 100%) !important;
            }

            nav.nav-theme { background: var(--primary) !important; border-bottom: 1px solid rgba(255,255,255,0.2) !important; }
            nav.nav-theme * { color: var(--primary-contrast) !important; }
            
            nav.nav-invisible { background: transparent !important; border-bottom: none !important; box-shadow: none !important; }
            
            .bento-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
            .card-6 { grid-column: span 6; }
            .card-3 { grid-column: span 3; }

            .card-visual {
                position: absolute;
                bottom: -20px;
                left: -20px;
                width: 140px;
                height: 140px;
                opacity: 0.7;
                pointer-events: none;
                z-index: 0;
                transform: rotate(-12deg);
                display: none;
                filter: brightness(1.1) contrast(1.1);
                object-fit: contain;
            }
            #fetih-root.light-mode.show-visuals .card-visual { display: block !important; }

            /* Table Styles - UNIFIED FLEX SLABS */
            #fetih-root .fetih-table-box { background: transparent; border: none; }
            #fetih-root table { display: block; width: 100% !important; border-collapse: collapse !important; border-spacing: 0 !important; }
            #fetih-root thead { display: block; width: 100%; margin-bottom: 16px; }
            #fetih-root tbody { display: flex; flex-direction: column; gap: 16px; width: 100%; }
            #fetih-root tr { 
                display: flex; align-items: center; width: 100%; position: relative;
            }
            #fetih-root th, #fetih-root td { 
                display: flex; align-items: center; border: none !important; padding: 22px 0 !important;
                background: transparent !important; box-shadow: none !important; backdrop-filter: none !important;
            }
            #fetih-root th:nth-child(1), #fetih-root td:nth-child(1) { width: 35%; padding-left: 40px !important; }
            #fetih-root th:nth-child(2), #fetih-root td:nth-child(2) { width: 20%; }
            #fetih-root th:nth-child(3), #fetih-root td:nth-child(3) { width: 25%; }
            #fetih-root th:nth-child(4), #fetih-root td:nth-child(4) { width: 20%; justify-content: flex-end; padding-right: 50px !important; }


            
            .t-val { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 0.9em; }

            @keyframes up { 0% { color: var(--success); text-shadow: 0 0 15px rgba(74, 222, 128, 0.4); } 100% { color: inherit; } }
            @keyframes down { 0% { color: var(--error); text-shadow: 0 0 15px rgba(248, 113, 113, 0.4); } 100% { color: inherit; } }
            .up { animation: up 1.2s ease; }
            .down { animation: down 1.2s ease; }

            .overview-grid { display: grid !important; grid-template-columns: repeat(5, 1fr) !important; gap: 12px !important; position: relative; }
            .mini-card { 
                padding: 16px 14px; 
                background: var(--card-surface);
                border-radius: 16px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
                border: 1px solid var(--card-border);
                text-align: left; position: relative; min-width: 0; 
            }
            
            /* --- GLASS OFF OVERRIDES --- */
            #fetih-root.glass-off .glass-card,
            #fetih-root.glass-off .fetih-card:not(.has-card-active),
            #fetih-root.glass-off .glass-classic,
            #fetih-root.glass-off .mini-card {
                background: var(--card-surface) !important;
                border: 1px solid var(--card-border) !important;
                box-shadow: 0 4px 15px rgba(0,0,0,0.6) !important;
            }
            
            #fetih-root.light-mode.glass-off .glass-card,
            #fetih-root.light-mode.glass-off .fetih-card:not(.has-card-active),
            #fetih-root.light-mode.glass-off .glass-classic,
            #fetih-root.light-mode.glass-off .mini-card {
                background: var(--card-surface) !important;
                border: 1px solid var(--card-border) !important;
                box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important;
            }

            #fetih-root.glass-off tr.glass-classic:hover { background: #1a1a1a !important; }
            #fetih-root.light-mode.glass-off tr.glass-classic:hover { background: #f0f0f0 !important; }
            #fetih-root.glass-off nav.nav-liquid::before { background: #000 !important; }
            #fetih-root.light-mode.glass-off nav.nav-liquid::before { background: #fff !important; border-bottom: 1px solid rgba(0,0,0,0.1) !important; }
            
            /* Gremse-Ata Separator - Fixed Positioning */
            .overview-grid { position: relative; }
            .overview-grid > div:nth-child(5)::after {
                content: ''; position: absolute; left: -8px; top: 20%; height: 60%; width: 2px; 
                background: var(--primary); opacity: 0.4; border-radius: 2px;
                z-index: 10; pointer-events: none;
            }
            @media (max-width: 900px) { .overview-grid > div:nth-child(5)::after { display: none; } }
            
            /* ── NAVBAR BOT ── */
            #fetih-bot-trigger {
                display: flex; align-items: center;
                height: 42px;
                border-radius: 999px;
                background: #0a0a0a;
                border: 1px solid rgba(var(--primary-rgb), 0.4);
                cursor: pointer;
                overflow: hidden; 
                flex-shrink: 0;
                transition: all 0.4s ease;
                box-shadow: none !important;
            }
            #fetih-bot-trigger:hover { border-color: rgba(var(--primary-rgb), 0.5); }

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
                transition: max-width 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease, margin 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: max-width, opacity, margin;
                margin-left: 0; margin-right: 0;
            }

            #fetih-bot-trigger.is-open .bot-msg-text {
                max-width: 500px; /* Daha gerçekçi bir sınır animasyon gecikmesini önler */
                opacity: 1;
                margin-left: 10px; margin-right: 20px;
            }

            #asst-msg {
                display: inline-block;
            }

            .has-card-active {
                background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%) !important;
                border: 1px solid rgba(255,255,255,0.4) !important;
                opacity: 1 !important;
                box-shadow: 0 15px 40px rgba(var(--primary-rgb), 0.3) !important;
            }
            #fetih-root.light-mode .has-card-active {
                background: linear-gradient(135deg, var(--primary) 0%, #fff 250%) !important;
                box-shadow: 0 15px 40px rgba(var(--primary-rgb), 0.15) !important;
            }
            #fetih-root .has-card-active * { color: var(--primary-contrast) !important; }
            #fetih-root .has-card-active .t-val { color: var(--primary-contrast) !important; text-shadow: none !important; }
            #fetih-root .has-card-active .live-dot { box-shadow: 0 0 12px rgba(255,255,255,0.4) !important; }
            
            .mult-badge {
                font-size: 10px; font-weight: 900; letter-spacing: 0.05em; color: var(--primary);
                background: rgba(var(--primary-rgb),0.10); border: 1px solid rgba(var(--primary-rgb),0.25);
                border-radius: 999px; padding: 1px 7px; line-height: 1.6;
            }
            .star-badge {
                display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px;
                border-radius: 50%; background: rgba(var(--primary-rgb),0.10); border: 1px solid rgba(var(--primary-rgb),0.30);
            }

            /* Custom Scrollbar for Fetih UI */
            #fetih-root::-webkit-scrollbar, #fetih-root *::-webkit-scrollbar {
                width: 10px; height: 10px;
            }
            #fetih-root::-webkit-scrollbar-track, #fetih-root *::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.2); border-radius: 10px;
            }
            #fetih-root::-webkit-scrollbar-thumb, #fetih-root *::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 10px;
                border: 3px solid transparent; 
                background-clip: content-box;
                transition: background 0.4s ease;
            }
            #fetih-root::-webkit-scrollbar-thumb:hover, #fetih-root *::-webkit-scrollbar-thumb:hover {
                background: var(--primary);
                background-clip: content-box; /* Boyutun değişmemesi için sabit tutuyoruz */
                box-shadow: 0 0 8px rgba(var(--primary-rgb), 0.4);
            }

            /* ── LIGHT THEME OVERRIDES ── */
            #fetih-root.light-mode {
                --surface: #f4f4f4;
                --surface-container: #ffffff;
                --card-bg: #fff;
                --on-surface: #1a1a1a;
                --outline: #666666;
                --card-border: rgba(0, 0, 0, 0.15);
                --card-surface: #ffffff;
            }
            #fetih-root.light-mode nav:not(.nav-shadow):not(.nav-theme):not(.nav-invisible) { background: #ffffff; border-bottom: 1px solid rgba(0,0,0,0.05); }
            #fetih-root.light-mode .glass-card, #fetih-root.light-mode .mini-card { 
                background: #fff !important; 
                border: 1px solid rgba(var(--primary-rgb), 0.5) !important; 
                box-shadow: 0 10px 40px rgba(0,0,0,0.05) !important; 
            }
            #fetih-root.light-mode .mini-card .card-title { color: #000 !important; }
            #fetih-root.light-mode .mini-card .label-text { color: var(--primary) !important; opacity: 1 !important; }
            #fetih-root.light-mode .mini-card-sep { border-top: 1px solid #000 !important; }

            #fetih-root.light-mode .glass-card { box-shadow: 0 10px 40px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.8), inset 0 -1px 1px rgba(0,0,0,0.05) !important; }
            #fetih-root.light-mode th { color: #555 !important; border-bottom: 1px solid rgba(0,0,0,0.1) !important; }
            #fetih-root.light-mode td { background: #fff !important; border-bottom: 1px solid rgba(0,0,0,0.05) !important; color: #111 !important; box-shadow: 0 4px 15px rgba(0,0,0,0.02) !important; }
            #fetih-root.light-mode td .t-val { color: #111 !important; }
            #fetih-root.light-mode td .t-val[style*="color:var(--primary)"] { color: #a57c2a !important; }
            #fetih-root.light-mode h3.font-headline { color: #111 !important; }
            #fetih-root.light-mode h2.font-headline { color: #111 !important; }
            #fetih-root.light-mode .settings-container { background: rgba(255,255,255,0.95); border: 1px solid rgba(0,0,0,0.1); box-shadow: 0 40px 80px rgba(0,0,0,0.1); }
            #fetih-root.light-mode .settings-title h2 { color: #111; }
            #fetih-root.light-mode .settings-card { background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.05); }
            #fetih-root.light-mode .settings-info h3 { color: #111; }
            #fetih-root.light-mode .settings-info p { color: #555; }
            #fetih-root.light-mode .settings-close-btn { color: #111; }
            #fetih-root.light-mode .settings-close-btn:hover { background: rgba(0,0,0,0.1); }
            #fetih-root.light-mode #fetih-dash-modal { background: rgba(255,255,255,0.6); }
            #fetih-root.light-mode #fetih-bot-trigger { background: rgba(240,240,240,0.95) !important; border-color: rgba(var(--primary-rgb),0.3) !important; }
            #fetih-root.light-mode .siri-orb { background: #f0f0f0 !important; }
            #fetih-root.light-mode .bot-msg-text { color: #1a1a1a !important; }
            #fetih-root.light-mode #analysis-modal-box { background: rgba(248,248,248,0.98) !important; border-color: rgba(0,0,0,0.1) !important; }
            #fetih-root.light-mode .am-comp-card { background: rgba(0,0,0,0.03) !important; border-color: rgba(0,0,0,0.08) !important; }
            #fetih-root.light-mode #am-current-price { color: var(--primary) !important; }
            #fetih-root.light-mode #am-insight { color: #555 !important; }
            #fetih-root.light-mode #analysis-modal-box div[style*="color:var(--outline)"] { color: #777 !important; }

            /* Light Mode Scrollbars */
            #fetih-root.light-mode::-webkit-scrollbar-track, #fetih-root.light-mode *::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
            #fetih-root.light-mode::-webkit-scrollbar-thumb, #fetih-root.light-mode *::-webkit-scrollbar-thumb { background: rgba(var(--primary-rgb),0.4); border: 3px solid transparent; background-clip: content-box; }
            #fetih-root.light-mode::-webkit-scrollbar-thumb:hover, #fetih-root.light-mode *::-webkit-scrollbar-thumb:hover { background: rgba(var(--primary-rgb),0.8); background-clip: content-box; }

            /* ── CHART OVERRIDES ── */
            #fetih-chart-modal.active { display: flex !important; opacity: 1 !important; }
            #fetih-chart-modal.active .chart-modal-container { transform: translateY(0) scale(1); }
            
            .custom-chart-btn {
                background: transparent; border: 1px solid rgba(255,255,255,0.1); color: var(--outline);
                padding: 8px 16px; border-radius: 12px; font-size: 13px; font-weight: 800; cursor: pointer; transition: all 0.2s;
            }
            .custom-chart-btn:hover { background: rgba(255,255,255,0.05); color: var(--on-surface); }
            .custom-chart-btn.active { background: rgba(var(--primary-rgb), 0.15); border-color: rgba(var(--primary-rgb), 0.5); color: var(--primary); }

            /* Hide original dropdowns */
            #chart-injection-zone .chart-container .d-flex { display: none !important; }

            /* Style original chart info to look like our bento grid */
            #chart-injection-zone .chart-info {
                display: flex !important; justify-content: space-around !important; width: 100% !important; margin-bottom: 20px !important;
                background: rgba(0,0,0,0.2) !important; padding: 20px !important; border-radius: 20px !important; box-sizing: border-box !important;
            }
            #chart-injection-zone .chart-info ul {
                display: flex !important; width: 100% !important; justify-content: space-around !important; list-style: none !important; margin: 0 !important; padding: 0 !important;
            }
            #chart-injection-zone .chart-info li {
                display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important;
            }
            #chart-injection-zone .chart-info h5 {
                font-size: 13px !important; font-weight: 800 !important; color: var(--outline) !important; text-transform: uppercase !important; margin-bottom: 10px !important;
            }
            #chart-injection-zone .chart-info li:nth-child(3) h5 { display: none !important; }
            #chart-injection-zone .chart-info li:nth-child(3)::before {
                content: 'NET DEĞİŞİM (TL)';
                font-size: 13px !important; font-weight: 800 !important; color: var(--outline) !important; text-transform: uppercase !important; margin-bottom: 10px !important; display: block !important;
            }
            #chart-injection-zone .chart-info span {
                font-size: 32px !important; font-weight: 900 !important; color: var(--on-surface) !important; font-family: 'Manrope', sans-serif !important; letter-spacing: -1px !important;
            }
            #chart-injection-zone .chart-info span.rise { color: var(--success) !important; }
            #chart-injection-zone .chart-info span.fall { color: var(--error) !important; }

            #chart-injection-zone .chart-container {
                display: flex !important; flex-direction: column !important; height: auto !important; background: transparent !important; box-shadow: none !important; padding: 0 !important;
            }
            #chart-injection-zone .chart {
                height: 550px !important; width: 100% !important; position: relative !important;
            }

            /* ── SETTINGS MODAL ── */
            #fetih-dash-modal {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.4); /* 40% opacity black */
                backdrop-filter: blur(8px);
                z-index: 2147483647; display: none; align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.3s ease;
            }
            #fetih-dash-modal.active { display: flex; opacity: 1; }

            .settings-container {
                width: 90%; max-width: 480px; 
                background: rgba(18, 18, 18, 0.85); /* Transparent container to see background */
                backdrop-filter: blur(20px);
                border: 1px solid rgba(var(--primary-rgb),0.3);
                border-radius: 32px; display: flex; flex-direction: column; 
                overflow-y: auto; overflow-x: hidden;
                box-shadow: none !important;
                padding: 40px;
                transform: translateY(20px) scale(0.95);
                transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.4s ease;
                will-change: transform, opacity;
                box-sizing: border-box;
            }
            .settings-card { transition: opacity 0.4s ease; }
            #fetih-dash-modal.active .settings-container {
                transform: translateY(0) scale(1);
            }

            .settings-header {
                display: flex; justify-content: space-between; align-items: center;
                margin-bottom: 40px;
            }
            .settings-title {
                display: flex; align-items: center; gap: 12px;
            }
            .settings-title span.material-symbols-outlined {
                font-size: 28px; color: var(--primary);
            }
            .settings-title h2 {
                margin: 0; font-size: 24px; font-weight: 800; color: #fff; letter-spacing: 1px;
            }

            .settings-close-btn {
                background: rgba(255,255,255,0.05); border: none; color: var(--outline); cursor: pointer;
                width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
                transition: all 0.2s;
            }
            .settings-close-btn:hover { background: rgba(255,255,255,0.1); color: #fff; transform: rotate(90deg); }

            .settings-card {
                background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px;
                padding: 24px; display: flex; justify-content: space-between; align-items: center;
                margin-bottom: 20px; transition: all 0.3s ease;
            }
            .settings-card:hover { border-color: rgba(var(--primary-rgb),0.3); background: rgba(var(--primary-rgb),0.05); }

            .settings-info {
                display: flex; flex-direction: column; gap: 6px;
            }
            .settings-info h3 { margin: 0; font-size: 16px; color: #e5e5e5; font-weight: 700; }
            .settings-info p { margin: 0; font-size: 13px; color: var(--outline); font-weight: 500; }

            .themed-svg path {
                fill: var(--primary) !important;
                transition: fill 0.3s ease;
            }

            .theme-color-grid {
                display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;
            }
            .color-dot {
                width: 32px; height: 32px; border-radius: 50%; cursor: pointer;
                border: 2px solid transparent; transition: all 0.2s;
                position: relative;
            }
            .color-dot.active { border-color: #fff; transform: scale(1.1); box-shadow: 0 0 15px rgba(255,255,255,0.2); }
            .color-dot.active::after {
                content: 'check'; font-family: 'Material Symbols Outlined';
                position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                color: #000; font-size: 18px; font-weight: 900;
            }



            /* ── EFFECTS: TEXTURE (arka planda camın altında kalır) ── */
            /* ── EFFECTS: TEXTURE ── */
            #fetih-bg-tex { 
                background-size: var(--tex-size, 100%) var(--tex-size, 100%);
                background-repeat: repeat !important;
                opacity: var(--tex-opacity, 0.8) !important;
                transition: opacity 0.3s ease;
            }
            #fetih-root.tex-fade-active #fetih-bg-tex {
                position: absolute;
                height: 150vh;
                mask-image: linear-gradient(to bottom, black 0%, black 50%, transparent 100%);
                -webkit-mask-image: linear-gradient(to bottom, black 0%, black 50%, transparent 100%);
                opacity: var(--tex-opacity, 0.8) !important;
            }
            .tex-preview, #fetih-bg-tex { background-repeat: repeat; }
            
            /* Pattern Definitions */
            .p-1, #fetih-root.tex-p1 #fetih-bg-tex { 
                background-color: var(--surface);
                background-image: repeating-radial-gradient( circle at 0 0, transparent 0, var(--surface) var(--tex-size, 10px) ), repeating-linear-gradient( rgba(var(--primary-rgb), 0.1), var(--primary) );
                background-size: 100% 100% !important; background-repeat: no-repeat !important;
            }
            .p-1.tex-preview { 
                background-image: repeating-radial-gradient( circle at 0 0, transparent 0, var(--surface) 10px ), repeating-linear-gradient( rgba(var(--primary-rgb), 0.1), var(--primary) ) !important;
                background-size: 12px 12px !important; background-repeat: repeat !important; opacity: 1 !important; 
            }

            .p-2, #fetih-root.tex-p2 #fetih-bg-tex {
                background-color: var(--surface);
                background-image: radial-gradient(circle at center center, var(--primary), var(--surface)), repeating-radial-gradient(circle at center center, var(--primary), var(--primary), var(--tex-size, 36px), transparent calc(var(--tex-size, 36px) * 2), transparent var(--tex-size, 36px));
                background-blend-mode: multiply;
                background-size: 100% 100% !important; background-repeat: no-repeat !important;
            }
            .p-2.tex-preview { 
                background-image: radial-gradient(circle at center center, var(--primary), var(--surface)), repeating-radial-gradient(circle at center center, var(--primary), var(--primary), 24px, transparent 48px, transparent 24px) !important;
                background-size: 100% 100% !important; background-repeat: no-repeat !important; opacity: 1 !important; 
            }

            .p-3, #fetih-root.tex-p3 #fetih-bg-tex {
                background-color: var(--surface);
                background: repeating-linear-gradient( 45deg, var(--primary), var(--primary) var(--tex-size, 18px), var(--surface) calc(var(--tex-size, 18px) - 0.5px), var(--surface) calc(var(--tex-size, 18px) * 5) );
                background-repeat: repeat !important;
            }
            .p-3.tex-preview { background-size: 100% 100% !important; background-repeat: repeat !important; opacity: 1 !important; background-image: repeating-linear-gradient( 45deg, var(--primary), var(--primary) 4.5px, var(--surface) 4px, var(--surface) 20px ) !important; }

            .p-4, #fetih-root.tex-p4 #fetih-bg-tex {
                background-color: var(--surface);
                background: repeating-linear-gradient( -45deg, var(--primary), var(--primary) var(--tex-size, 18px), var(--surface) calc(var(--tex-size, 18px) - 0.5px), var(--surface) calc(var(--tex-size, 18px) * 5) );
                background-repeat: repeat !important;
            }
            .p-4.tex-preview { background-size: 100% 100% !important; background-repeat: repeat !important; opacity: 1 !important; background-image: repeating-linear-gradient( -45deg, var(--primary), var(--primary) 4.5px, var(--surface) 4px, var(--surface) 20px ) !important; }

            .p-5, #fetih-root.tex-p5 #fetih-bg-tex {
                background-color: var(--surface);
                background-image: linear-gradient(30deg, var(--primary) 12.5%, transparent 12.5%, transparent 87.5%, var(--primary) 87.5%, var(--primary)), linear-gradient(150deg, var(--primary) 12.5%, transparent 12.5%, transparent 87.5%, var(--primary) 87.5%, var(--primary)), linear-gradient(30deg, var(--primary) 12.5%, transparent 12.5%, transparent 87.5%, var(--primary) 87.5%, var(--primary)), linear-gradient(150deg, var(--primary) 12.5%, transparent 12.5%, transparent 87.5%, var(--primary) 87.5%, var(--primary)), linear-gradient(60deg, rgba(var(--primary-rgb),0.4) 25.5%, transparent 25.5%, transparent 75.5%, rgba(var(--primary-rgb),0.4) 75.5%, rgba(var(--primary-rgb),0.4)), linear-gradient(60deg, rgba(var(--primary-rgb),0.4) 25.5%, transparent 25.5%, transparent 75.5%, rgba(var(--primary-rgb),0.4) 75.5%, rgba(var(--primary-rgb),0.4));
                background-size: var(--tex-size, 72px) calc(var(--tex-size, 72px) * 1.75);
                background-position: 0 0, 0 0, calc(var(--tex-size, 72px) * 0.5) calc(var(--tex-size, 72px) * 0.875), calc(var(--tex-size, 72px) * 0.5) calc(var(--tex-size, 72px) * 0.875), 0 0, calc(var(--tex-size, 72px) * 0.5) calc(var(--tex-size, 72px) * 0.875);
                background-repeat: repeat !important;
            }
            .p-5.tex-preview { 
                background-image: linear-gradient(30deg, var(--primary) 12%, transparent 12.5%, transparent 87%, var(--primary) 87.5%, var(--primary)), linear-gradient(150deg, var(--primary) 12%, transparent 12.5%, transparent 87%, var(--primary) 87.5%, var(--primary)), linear-gradient(30deg, var(--primary) 12%, transparent 12.5%, transparent 87%, var(--primary) 87.5%, var(--primary)), linear-gradient(150deg, var(--primary) 12%, transparent 12.5%, transparent 87%, var(--primary) 87.5%, var(--primary)), linear-gradient(60deg, rgba(var(--primary-rgb),0.4) 25%, transparent 25.5%, transparent 75%, rgba(var(--primary-rgb),0.4) 75%, rgba(var(--primary-rgb),0.4)), linear-gradient(60deg, rgba(var(--primary-rgb),0.4) 25%, transparent 25.5%, transparent 75%, rgba(var(--primary-rgb),0.4) 75%, rgba(var(--primary-rgb),0.4)) !important;
                background-size: 12px 21px !important; background-position: 0 0, 0 0, 6px 10.5px, 6px 10.5px, 0 0, 6px 10.5px !important; opacity: 1 !important; 
            }

            .p-6, #fetih-root.tex-p6 #fetih-bg-tex {
                background-color: var(--surface);
                background-image: radial-gradient(var(--primary) 1.8px, var(--surface) 1.8px);
                background-size: var(--tex-size, 36px) var(--tex-size, 36px);
                background-repeat: repeat !important;
            }
            .p-6.tex-preview { background-size: 10px 10px !important; opacity: 1 !important; }

            .p-7, #fetih-root.tex-p7 #fetih-bg-tex {
                background-color: var(--surface);
                background-image: radial-gradient(var(--primary) 1.8px, transparent 1.8px), radial-gradient(var(--primary) 1.8px, var(--surface) 1.8px);
                background-size: var(--tex-size, 72px) var(--tex-size, 72px);
                background-position: 0 0, calc(var(--tex-size, 72px) * 0.5) calc(var(--tex-size, 72px) * 0.5);
                background-repeat: repeat !important;
            }
            .p-7.tex-preview { background-size: 16px 16px !important; background-position: 0 0, 8px 8px !important; opacity: 1 !important; }

            .p-8, #fetih-root.tex-p8 #fetih-bg-tex {
                background-color: var(--surface);
                background-image: linear-gradient(0deg, var(--surface) 50%, var(--primary) 50%);
                background-size: var(--tex-size, 36px) var(--tex-size, 36px);
                background-repeat: repeat !important;
            }
            .p-8.tex-preview { background-size: 12px 12px !important; opacity: 1 !important; }

            .p-9, #fetih-root.tex-p9 #fetih-bg-tex {
                background-color: var(--surface);
                background-image: linear-gradient(to right, var(--primary), var(--primary) calc(var(--tex-size, 36px) * 0.5), var(--surface) calc(var(--tex-size, 36px) * 0.5), var(--surface) );
                background-size: var(--tex-size, 36px) 100%;
                background-repeat: repeat !important;
            }
            .p-9.tex-preview { background-size: 12px 100% !important; opacity: 1 !important; }

            .p-10, #fetih-root.tex-p10 #fetih-bg-tex {
                background-color: var(--surface);
                background-image: repeating-linear-gradient(45deg, var(--primary) 0, var(--primary) 3.6px, var(--surface) 0, var(--surface) 50%);
                background-size: var(--tex-size, 36px) var(--tex-size, 36px);
                background-repeat: repeat !important;
            }
            .p-10.tex-preview { background-size: 12px 12px !important; opacity: 1 !important; }

            .p-11, #fetih-root.tex-p11 #fetih-bg-tex {
                background-color: var(--surface);
                background-image: linear-gradient(var(--primary) 3.6px, transparent 3.6px), linear-gradient(to right, var(--primary) 3.6px, var(--surface) 3.6px);
                background-size: var(--tex-size, 72px) var(--tex-size, 72px);
                background-repeat: repeat !important;
            }
            .p-11.tex-preview { background-size: 16px 16px !important; opacity: 1 !important; }

            .p-12, #fetih-root.tex-p12 #fetih-bg-tex {
                background-color: var(--surface);
                background-image: repeating-linear-gradient(0deg, var(--primary), var(--primary) 3.6px, var(--surface) 3.6px, var(--surface));
                background-size: var(--tex-size, 72px) var(--tex-size, 72px);
                background-repeat: repeat !important;
            }
            .p-12.tex-preview { background-size: 16px 16px !important; opacity: 1 !important; }

            .p-13, #fetih-root.tex-p13 #fetih-bg-tex {
                background-color: var(--surface);
                background-image: repeating-linear-gradient(to right, var(--primary), var(--primary) 3.6px, var(--surface) 3.6px, var(--surface));
                background-size: var(--tex-size, 72px) var(--tex-size, 72px);
                background-repeat: repeat !important;
            }
            .p-13.tex-preview { background-size: 16px 16px !important; opacity: 1 !important; }

            .p-14, #fetih-root.tex-p14 #fetih-bg-tex {
                background-color: var(--surface);
                background-image: repeating-linear-gradient(45deg, var(--primary) 25.5%, transparent 25.5%, transparent 75.5%, var(--primary) 75.5%, var(--primary)), repeating-linear-gradient(45deg, var(--primary) 25.5%, var(--surface) 25.5%, var(--surface) 75.5%, var(--primary) 75.5%, var(--primary));
                background-position: 0 0, calc(var(--tex-size, 72px) * 0.5) calc(var(--tex-size, 72px) * 0.5);
                background-size: var(--tex-size, 72px) var(--tex-size, 72px);
                background-repeat: repeat !important;
            }
            .p-14.tex-preview { background-size: 16px 16px !important; background-position: 0 0, 8px 8px !important; opacity: 1 !important; }

            .p-15, #fetih-root.tex-p15 #fetih-bg-tex {
                background: radial-gradient(circle, transparent 20%, var(--surface) 20%, var(--surface) 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, var(--surface) 20%, var(--surface) 80%, transparent 80%, transparent) calc(var(--tex-size, 180px) * 0.5) calc(var(--tex-size, 180px) * 0.5), linear-gradient(var(--primary) calc(var(--tex-size, 180px) * 0.04), transparent calc(var(--tex-size, 180px) * 0.04)) 0 calc(var(--tex-size, 180px) * -0.02), linear-gradient(90deg, var(--primary) calc(var(--tex-size, 180px) * 0.04), var(--surface) calc(var(--tex-size, 180px) * 0.04)) calc(var(--tex-size, 180px) * -0.02) 0;
                background-size: var(--tex-size, 180px) var(--tex-size, 180px), var(--tex-size, 180px) var(--tex-size, 180px), calc(var(--tex-size, 180px) * 0.5) calc(var(--tex-size, 180px) * 0.5), calc(var(--tex-size, 180px) * 0.5) calc(var(--tex-size, 180px) * 0.5);
                background-repeat: repeat !important;
            }
            .p-15.tex-preview { background-size: 30px 30px, 30px 30px, 15px 15px, 15px 15px !important; background-position: 0 0, 15px 15px, 0 -1px, -1px 0 !important; opacity: 1 !important; }

            .tex-preview {
                width: 100% !important; aspect-ratio: 1/1 !important; border-radius: 12px;
                background-color: rgba(var(--primary-rgb), 0.05);
                border: 1px solid rgba(var(--primary-rgb), 0.2) !important;
                cursor: pointer; position: relative; overflow: hidden;
                transition: all 0.2s ease;
                display: flex; align-items: center; justify-content: center;
                box-sizing: border-box; padding: 0 !important; margin: 0 !important;
                opacity: 1 !important;
                min-width: 0;
            }
            .tex-preview:hover { border-color: rgba(var(--primary-rgb), 0.5) !important; background-color: rgba(var(--primary-rgb), 0.1); }
            .tex-preview.active { border-color: var(--primary) !important; box-shadow: 0 0 15px rgba(var(--primary-rgb), 0.4); background-color: rgba(var(--primary-rgb), 0.15); }
            .tex-preview.no-tex { background: rgba(255,255,255,0.02); }
            .tex-preview.no-tex::after { content: 'block'; font-family: 'Material Symbols Outlined'; font-size: 22px; color: var(--outline); opacity: 0.6; }

            /* SVG Filter for Liquid Glass */
            #fetih-glass-svg { position: absolute; width: 0; height: 0; pointer-events: none; }

            /* ── EFFECTS: GLOW (Arka Plan I&#351;&#305;k Sistemi) ── */
            #fetih-root.glow-soft #fetih-bg-glow { background-image: radial-gradient(ellipse at 50% 30%, rgba(var(--primary-rgb),calc(0.15 * var(--glow-intensity))) 0%, transparent 60%); }
            #fetih-root.glow-neon #fetih-bg-glow { background-image: radial-gradient(ellipse at 50% 20%, rgba(var(--primary-rgb),calc(0.25 * var(--glow-intensity))) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(var(--primary-rgb),calc(0.12 * var(--glow-intensity))) 0%, transparent 40%); }
            #fetih-root.glow-pulse #fetih-bg-glow { background: radial-gradient(ellipse at 50% 30%, rgba(var(--primary-rgb),calc(0.2 * var(--glow-intensity))) 0%, transparent 55%); animation: bgPulse 4s ease-in-out infinite; }
            @keyframes bgPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
            #fetih-root.glow-orbit #fetih-bg-glow { 
                background: radial-gradient(circle at center, transparent 0%, transparent 100%),
                            radial-gradient(circle at 30% 30%, rgba(var(--primary-rgb),0.2) 0%, transparent 40%),
                            radial-gradient(circle at 70% 70%, rgba(var(--primary-rgb),0.15) 0%, transparent 40%);
                animation: bgOrbit 12s linear infinite;
            }
            @keyframes bgOrbit { 0% { transform: rotate(0deg); scale: 1; } 50% { transform: rotate(180deg); scale: 1.2; } 100% { transform: rotate(360deg); scale: 1; } }
            
            #fetih-root.glow-drift #fetih-bg-glow { 
                background: radial-gradient(circle at 20% 20%, rgba(var(--primary-rgb),0.15) 0%, transparent 35%),
                            radial-gradient(circle at 80% 40%, rgba(var(--primary-rgb),0.12) 0%, transparent 35%),
                            radial-gradient(circle at 40% 80%, rgba(var(--primary-rgb),0.1) 0%, transparent 35%);
                animation: bgDrift 20s ease-in-out infinite alternate;
            }
            @keyframes bgDrift { 0% { transform: translate(-5%, -5%); } 100% { transform: translate(5%, 5%); } }
            
            #fetih-root.glow-aurora #fetih-bg-glow { 
                background: linear-gradient(120deg, transparent 30%, rgba(var(--primary-rgb),0.1) 45%, rgba(var(--primary-rgb),0.15) 50%, rgba(var(--primary-rgb),0.1) 55%, transparent 70%);
                background-size: 200% 100%;
                animation: bgAurora 8s linear infinite;
            }
            @keyframes bgAurora { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            
            #fetih-root.glow-halo #fetih-bg-glow { box-shadow: inset 0 0 150px rgba(var(--primary-rgb),calc(0.12 * var(--glow-intensity))), inset 0 0 400px rgba(var(--primary-rgb),calc(0.06 * var(--glow-intensity))); }
            #fetih-root.glow-edges #fetih-bg-glow { box-shadow: inset 0 0 120px rgba(var(--primary-rgb),calc(0.3 * var(--glow-intensity))); }
            #fetih-root.glow-corners #fetih-bg-glow { 
                background: 
                    radial-gradient(circle at top left, rgba(var(--primary-rgb), 0.3) 0%, transparent 40%),
                    radial-gradient(circle at bottom right, rgba(var(--primary-rgb), 0.3) 0%, transparent 40%),
                    radial-gradient(circle at top right, rgba(var(--primary-rgb), 0.2) 0%, transparent 35%),
                    radial-gradient(circle at bottom left, rgba(var(--primary-rgb), 0.2) 0%, transparent 35%); 
            }
            #fetih-root.glow-diagonal #fetih-bg-glow { 
                background: linear-gradient(45deg, transparent 30%, rgba(var(--primary-rgb), 0.2) 50%, transparent 70%);
                background-size: 200% 200%;
                animation: diagonalSweep 5s infinite linear;
            }
            @keyframes diagonalSweep { 0% { background-position: 100% 100%; } 100% { background-position: 0% 0%; } }
            #fetih-root.glow-cinema #fetih-bg-glow { 
                background: linear-gradient(to bottom, rgba(var(--primary-rgb),0.3) 0%, transparent 15%, transparent 85%, rgba(var(--primary-rgb),0.3) 100%); 
            }
            #fetih-root.glow-matrix #fetih-bg-glow { 
                background: linear-gradient(to bottom, transparent, rgba(var(--primary-rgb), 0.4) 50%, transparent);
                background-size: 100% 20%;
                background-repeat: no-repeat;
                animation: scanline 4s infinite linear;
            }
            @keyframes scanline { 0% { background-position: 0% -50%; } 100% { background-position: 0% 150%; } }

            /* Background Elements Base Styles */
            #fetih-bg-tex, #fetih-bg-glow { position: fixed; inset: -100px; z-index: -1; pointer-events: none; transition: all 0.5s ease; }
            #fetih-bg-glow { opacity: 0.15; }

            /* ── EFFECTS: FX BUTTONS ── */
            .fx-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); color: var(--outline); border-radius: 10px; padding: 9px 11px; font-size: 12px; font-weight: 700; cursor: pointer; text-align: left; transition: all 0.2s; width: 100%; display: block; }
            .fx-btn:hover { background: rgba(255,255,255,0.09); color: var(--on-surface); }
            .fx-btn.active { background: rgba(var(--primary-rgb),0.14); border-color: rgba(var(--primary-rgb),0.38); color: var(--primary); }

            /* ── SETTINGS SCROLLBAR ── */
            .settings-container { max-height: 88vh; overflow-y: auto; }
            .settings-container::-webkit-scrollbar { width: 5px; }
            .settings-container::-webkit-scrollbar-track { background: transparent; }
            .settings-container::-webkit-scrollbar-thumb { background: rgba(var(--primary-rgb),0.25); border-radius: 6px; }
            .settings-container::-webkit-scrollbar-thumb:hover { background: rgba(var(--primary-rgb),0.55); }

            /* ── LIGHT MODE: BOT TEXT FIX ── */
            #fetih-root.light-mode .bot-msg-text { color: #1a1a1a !important; }

            /* ── RESPONSIVE DESIGN ── */
            @media (max-width: 1240px) {
                .section-width { max-width: 1100px; }
            }

            @media (max-width: 1080px) {
                .section-width { max-width: 950px; }
                .font-headline { font-size: 32px !important; }
            }

            @media (max-width: 900px) {
                .bento-grid { grid-template-columns: repeat(12, 1fr); }
                .overview-grid { grid-template-columns: repeat(3, 1fr); }
                .card-6, .card-3 { grid-column: span 12; }
            }

            @media (max-width: 992px) {
                .card-6, .card-3 { grid-column: span 12; }
                .overview-grid { grid-template-columns: repeat(2, 1fr); }
                nav { padding: 8px 20px; }
            }

            @media (max-width: 768px) {
                #fetih-root { padding-bottom: 80px; }
                main { padding: 20px 15px; }
                .overview-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
                #fetih-root td { padding: 16px 20px !important; font-size: 13px !important; }
                #fetih-root th:first-child, #fetih-root td:first-child { padding-left: 24px !important; }
                #fetih-root th:last-child, #fetih-root td:last-child { padding-right: 24px !important; }
                .font-headline { font-size: 28px !important; }
                .t-val { font-size: 22px !important; }
            }

            @media (max-width: 480px) {
                .overview-grid { grid-template-columns: 1fr; }
                nav { flex-direction: column; gap: 10px; padding: 12px; }
                #fetih-bot-trigger { width: 100%; }
                .settings-container { width: 95%; padding: 20px; }
                #fetih-root table { font-size: 12px !important; }
                #fetih-root td { padding: 12px 15px !important; }
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
        link.href = chrome.runtime.getURL('assets/f-logo.svg');
        document.getElementsByTagName('head')[0].appendChild(link);

        const root = document.createElement('div');
        root.id = 'fetih-root';
        root.innerHTML = `
            <div id="fetih-bg-tex"></div>
            <div id="fetih-bg-glow"></div>
            <nav>
                <div id="fetih-main-logo" style="height:32px; width:auto; display:block; cursor:pointer;">
                    <svg class="themed-svg" width="120" height="32" viewBox="0 0 187.5 75" preserveAspectRatio="xMidYMid meet">
                        <g transform="translate(0.8, 57.3)">
                            <path d="M 47.3 -35.7 L 44.1 -50.9 L 41.9 -50.3 C 41.7 -50.2 41.5 -50.2 41.3 -50.2 C 41.1 -50.1 40.9 -50.1 40.6 -50.1 L 1.3 -50.1 L 1.4 -48.0 L 3.8 -47.7 L 5.3 -46.6 L 5.6 -45.4 C 5.6 -45.4 5.6 -45.2 5.7 -44.9 L 5.8 -7.0 L 5.5 1.7 L 4.9 5.5 L 4.1 9.0 L 2.9 11.6 L 1.3 14.0 L 23.4 -0.2 L 21.6 -1.2 C 21.3 -1.4 20.8 -1.8 20.1 -2.4 L 19.3 -4.4 L 18.9 -6.9 L 19.0 -19.5 L 21.2 -21.8 L 23.4 -23.6 L 25.3 -24.4 L 27.2 -24.7 L 28.5 -24.2 L 29.8 -23.3 L 30.4 -21.6 L 30.7 -19.4 L 39.7 -28.3 L 37.9 -31.7 L 36.4 -33.0 L 34.7 -34.1 L 33.5 -34.5 L 30.8 -34.5 L 28.7 -33.4 L 26.5 -32 L 18.9 -22.5 L 19.0 -48.0 L 25.0 -47.5 L 30.2 -46.2 L 33.0 -45.2 L 35.2 -44.1 L 37.8 -42.7 L 40.0 -41.2 L 43.2 -38.2 L 44.5 -36.1 L 45.5 -34.2 Z"/>
                        </g>
                        <g transform="translate(49.2, 57.3)">
                            <path d="M 39.2 -12.7 L 37.2 -13.8 L 33.9 -11.9 L 30.6 -10.2 L 27.7 -9.2 L 24.6 -8.5 L 19.8 -8.5 L 17.5 -9.0 L 15.8 -9.7 L 14.3 -10.9 L 13.2 -12.3 L 19.3 -14.7 L 25.0 -17.7 L 29.8 -20.7 L 32.0 -22.4 L 33.7 -23.8 L 35.2 -25.3 L 36.3 -26.7 L 34.4 -29.1 L 32.6 -30.9 L 30.3 -32.2 L 27.6 -33.5 L 24.6 -34.3 L 22.0 -34.7 L 20.9 -34.7 L 18.7 -34.6 L 16.3 -34.4 L 13.1 -33.5 L 10.1 -32.4 L 8.0 -31.1 L 5.7 -29.2 L 4.1 -27.2 L 2.6 -24.5 L 1.9 -22.0 L 1.2 -18.6 C 1.2 -17.1 1.3 -16.1 1.5 -15.5 L 2.4 -11.6 L 4.0 -8.5 L 5.6 -5.8 L 7.6 -3.8 L 9.9 -2.1 L 12.5 -1.1 C 12.8 -1.0 13.0 -0.9 13.3 -0.8 C 13.6 -0.7 13.8 -0.7 14.0 -0.6 C 15.0 -0.4 15.7 -0.3 15.9 -0.2 L 19.0 -0.2 L 20.9 -0.3 L 23.8 -0.9 L 26.5 -1.7 L 29.2 -2.9 L 31.7 -4.4 L 34.1 -6.2 L 36.1 -8.1 L 37.6 -10.1 Z M 25.1 -24.7 L 24.5 -23.4 L 23.6 -22.1 L 22.2 -20.8 L 20.7 -19.6 L 18.5 -18.3 L 16.4 -17.2 L 11.3 -15.7 L 10.3 -18.3 L 9.6 -20.9 L 9.6 -25.5 L 10.1 -27.3 L 10.7 -29.0 L 11.6 -30.0 L 12.6 -30.9 L 15.5 -31.3 L 16.5 -31.3 L 17.7 -31.3 L 20.1 -30.2 L 22.2 -29.2 L 24.4 -26.9 L 25.0 -26.1 C 25.1 -25.7 25.1 -25.3 25.1 -24.7 Z"/>
                        </g>
                        <g transform="translate(89.7, 57.3)">
                            <path d="M 28.9 -12.0 C 28.2 -11.2 27.6 -10.6 27.2 -10.2 L 25.5 -9.1 L 23.7 -9.0 C 23.1 -9.2 22.6 -9.3 22.1 -9.3 C 21.6 -9.4 21.2 -9.5 21.0 -9.5 C 20.1 -10.3 19.6 -10.8 19.4 -11.1 L 18.7 -13.0 L 18.7 -33.1 L 24.6 -33.1 L 24.6 -37.6 L 18.7 -37.6 L 18.8 -52.2 L 13.9 -50.9 L 7.7 -48.8 L 5.3 -47.7 L 2.7 -46.5 L 5.0 -46.2 L 6.5 -45.0 L 6.9 -43.6 L 7.0 -41.8 L 7.0 -37.6 L 1.1 -37.6 L 1.1 -33.1 L 7.0 -33.1 L 7.1 -13.1 L 7.3 -9.5 L 8.4 -5.9 L 9.8 -3.6 L 11.4 -1.8 L 13.8 -0.5 L 16.1 -0.1 C 17.3 -0.1 18.3 -0.2 19.0 -0.4 L 21.2 -1.2 L 23.3 -2.8 L 25.4 -4.9 C 26.0 -5.8 26.4 -6.6 26.7 -7.2 C 27.1 -7.7 27.3 -8.1 27.4 -8.4 Z"/>
                        </g>
                        <g transform="translate(119.7, 57.3)">
                            <path d="M 17.5 -44.9 L 17.0 -46.7 C 17 -46.9 16.8 -47.3 16.6 -47.7 C 16.4 -48.1 16.2 -48.5 16 -49.0 L 13.9 -50.3 C 13.7 -50.4 13.4 -50.5 13.0 -50.6 C 12.6 -50.7 12.1 -50.8 11.4 -51.0 L 8.8 -50.3 L 7.0 -49.0 L 5.9 -47.1 L 5.5 -44.9 L 6.0 -42.7 L 7.0 -40.8 L 8.9 -39.5 L 11.4 -38.9 L 13.9 -39.5 L 16 -40.8 L 17.0 -42.9 Z M 21.8 -2.4 L 19.3 -2.6 L 18.5 -3.0 L 17.9 -3.8 L 17.5 -5.0 L 17.4 -35.4 L 12.5 -34.6 L 6.5 -32.6 L 3.8 -31.3 L 1.2 -29.8 L 3.6 -29.5 L 5.1 -28.3 L 5.5 -27.0 L 5.6 -7.0 L 5.2 -4.5 L 4.5 -3.0 L 2.6 -2.3 L 1.2 -2.3 L 1.2 -0.1 L 21.7 -0.1 Z"/>
                        </g>
                        <g transform="translate(142.8, 57.3)">
                            <path d="M 42.1 -17.0 L 41.9 -19.7 L 41.7 -22.2 L 40.8 -24.6 L 39.9 -26.8 L 38.5 -28.8 L 36.5 -30.9 L 34.1 -32.4 L 31.0 -33.9 L 17.3 -26.7 L 17.4 -51.9 L 12.5 -51.2 L 9.7 -50.3 L 6.5 -49.3 L 3.8 -48.1 L 1.2 -46.5 L 3.6 -46.2 L 5.1 -45.0 L 5.5 -43.6 L 5.6 -7.0 L 5.2 -4.5 L 4.5 -3.0 L 2.6 -2.3 L 1.2 -2.3 L 1.2 -0.1 L 21.7 -0.1 L 21.8 -2.4 L 19.3 -2.6 L 18.5 -3.0 L 17.9 -3.8 L 17.5 -5.0 L 17.3 -6.9 L 17.3 -23.6 L 25.5 -26.3 L 28.5 -23.9 C 29.1 -23.3 29.9 -22.5 30.9 -21.4 C 31.0 -21.1 31.2 -20.7 31.3 -20.2 C 31.5 -19.8 31.6 -19.4 31.8 -18.9 L 32.3 -16.4 L 32 -14.7 L 31.1 -11.3 L 28.5 -6.1 L 25.5 -1.0 C 25.2 -0.5 25 -0.1 24.8 0.2 C 24.6 0.5 24.5 0.9 24.4 1.2 L 23.5 3.8 L 23.3 6.4 L 23.5 9.0 L 24.8 11.4 L 26.9 14.0 L 26.6 12.4 C 26.5 11.6 26.4 11.1 26.5 10.9 L 26.7 8.4 L 27.4 6.8 C 28.0 5.9 28.5 5.1 29.1 4.4 L 36.7 -2.2 L 38.7 -5.2 L 40.8 -9.5 L 41.8 -12.8 Z"/>
                        </g>
                    </svg>
                </div>
                <div style="display:flex;align-items:center;gap:10px">
                    <div id="fetih-bot-trigger">
                        <div class="siri-orb">
                            <span class="material-symbols-outlined siri-icon">smart_toy</span>
                        </div>
                        <span id="asst-msg" class="bot-msg-text"></span>
                    </div>
                    <button id="fetih-chart-btn" title="Geçmiş Veriler ve Grafik" style="background:rgba(255,255,255,0.06);border:1px solid rgba(var(--primary-rgb),0.25);border-radius:50%;width:42px;height:42px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s; margin-left:8px;">
                        <span class="material-symbols-outlined" style="font-size:22px;color:var(--primary)">show_chart</span>
                    </button>
                </div>
            </nav>

            <main style="width:100%; max-width:1440px; padding:15px 40px 30px 40px; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; gap:25px;">

                <!-- F11 Fullscreen Wrapper -->
                <div id="fetih-hero-section" style="width:100%; display:flex; flex-direction:column; align-items:center; gap:25px; transition: min-height 0.4s ease;">

                <!-- Featured Bento Grid -->
                <div class="bento-grid section-width">
                    <div class="fetih-card card-6 has-card-active" style="padding:35px 45px; position:relative; overflow:hidden">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:35px">
                            <div>
                                <span style="font-size:10px; font-weight:900; color:var(--primary-dark); text-transform:uppercase; opacity:0.9; letter-spacing:2px; display:block; margin-bottom:10px">Fetih Kuyumculuk</span>
                                <h2 class="font-headline" style="font-size:38px; color:var(--primary-dark); font-weight:900; margin:0">Has Altın (24K)</h2>
                            </div>
                            <div style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.1); padding:8px 14px; border-radius:100px; font-size:11px; font-weight:900; border: 1px solid rgba(0,0,0,0.25); color:var(--primary);">
                                <div class="live-dot"></div>
                                <span id="live-text-span">CANLI</span>
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:minmax(180px, 1fr) minmax(180px, 1fr); gap:50px; position:relative; z-index:1;">
                            <div>
                                <span style="font-size:11px; font-weight:800; color:var(--primary-dark); opacity:0.9; text-transform:uppercase; display:block; margin-bottom:10px">ALIŞ</span>
                                <div id="val-has-buy" class="t-val" style="font-size:48px; font-weight:900; letter-spacing:-2px; color:var(--primary-dark);">--</div>
                            </div>
                            <div>
                                <span style="font-size:11px; font-weight:800; color:var(--primary-dark); opacity:0.9; text-transform:uppercase; display:block; margin-bottom:10px">SATIŞ</span>
                                <div id="val-has-sell" class="t-val" style="font-size:48px; font-weight:900; letter-spacing:-2px; color:var(--primary-dark);">--</div>
                            </div>
                        </div>
                    </div>

                    <div class="fetih-card card-3" style="padding:28px; position:relative; overflow:hidden;">
                        <img class="card-visual" src="${chrome.runtime.getURL('image/gram-24.png')}" alt="Gold Bar" style="width: 260px; height: 260px; bottom: -60px; right: -120px; left:auto; transform: rotate(0deg); opacity: 0.8;">
                        <div style="position:relative; z-index:1;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px">
                                <h3 class="font-headline" style="font-size:16px; font-weight:900; color:var(--primary); text-transform:uppercase; letter-spacing:1px; margin:0">Gram Altın</h3>
                                <span class="material-symbols-outlined" style="font-size:24px; color:var(--primary)">workspace_premium</span>
                            </div>
                            <div style="display:flex; flex-direction:column; gap:24px">
                                <div>
                                    <span style="font-size:11px; font-weight:900; color:var(--primary); opacity:0.8; text-transform:uppercase; display:block; margin-bottom:8px">ALIŞ</span>
                                    <div id="val-gram-buy" class="t-val" style="font-size:32px; font-weight:900; color:var(--on-surface);">--</div>
                                </div>
                                <div class="mini-card-sep" style="padding-top:20px; border-top:1px solid rgba(255,255,255,0.1)">
                                    <span style="font-size:11px; font-weight:900; color:var(--primary); opacity:0.8; text-transform:uppercase; display:block; margin-bottom:8px">SATIŞ</span>
                                    <div id="val-gram-sell" class="t-val" style="font-size:32px; font-weight:900; color:var(--primary);">--</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="fetih-card card-3" style="padding:28px">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px">
                            <h3 class="font-headline" style="font-size:16px; font-weight:900; color:var(--primary); text-transform:uppercase; letter-spacing:1px; margin:0">ONS Altın</h3>
                            <span class="material-symbols-outlined" style="font-size:18px; color:var(--primary)">show_chart</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:24px">
                            <div>
                                <span style="font-size:11px; font-weight:900; color:var(--primary); opacity:0.8; text-transform:uppercase; display:block; margin-bottom:8px">USD / ONS</span>
                                <div id="val-ons-buy" class="t-val" style="font-size:32px; font-weight:900; color:var(--on-surface);">--</div>
                            </div>
                            <div class="mini-card-sep" style="padding-top:20px; border-top:1px solid rgba(255,255,255,0.1)">
                                <span style="font-size:11px; font-weight:900; color:var(--primary); opacity:0.8; text-transform:uppercase; display:block; margin-bottom:8px">SATIŞ</span>
                                <div id="val-ons-sell" class="t-val" style="font-size:32px; font-weight:900; color:var(--primary);">--</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sarrafiye Overview Grid -->
                <div id="overview-grid" class="overview-grid section-width"></div>

                </div> <!-- End of F11 Hero Wrapper -->

                <!-- Market Table Section -->
                <div class="section-width" style="margin-top: 80px;">
                    <div style="margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:flex-end; width:100%;">
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <h3 class="font-headline" style="font-size:24px; font-weight:700; text-transform:uppercase; color:var(--primary); letter-spacing:1px; margin:0">TÜM PİYASA FİYATLARI</h3>
                            <div style="width:80px; height:3px; background:var(--primary); border-radius:2px;"></div>
                        </div>
                        <a href="#" id="fetih-settings-btn" style="font-size:13px; font-weight:800; color:var(--primary); text-decoration:none; text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; gap:8px; padding: 10px 22px; background: rgba(var(--primary-rgb), 0.1); border-radius: 999px; border: 1px solid rgba(var(--primary-rgb), 0.2); transition: all 0.3s; margin-bottom: 4px;">
                            <span class="material-symbols-outlined" style="font-size:18px">settings</span>
                            AYARLAR
                        </a>
                    </div>

                    <div class="fetih-table-box" style="width:100%;">
                        <table style="width:100% !important;">
                            <thead>
                                <tr>
                                    <th style="width:30%">VARLIK</th>
                                    <th>ALIŞ</th>
                                    <th>SATIŞ</th>
                                    <th style="text-align:right">DEĞİŞİM</th>
                                </tr>
                            </thead>
                            <tbody id="sync-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </main>

            <!-- Chart Modal -->
            <div id="fetih-chart-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); z-index:2147483648; display:none; flex-direction:column; align-items:center; justify-content:center; opacity:0; transition:opacity 0.4s ease;">
                <div class="chart-modal-container" style="width:95%; max-width:1200px; background:var(--surface-container); border:1px solid rgba(var(--primary-rgb),0.2); border-radius:32px; padding:30px; display:flex; flex-direction:column; transform:translateY(20px) scale(0.95); transition:transform 0.4s; box-shadow:none !important;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span class="material-symbols-outlined" style="font-size:32px; color:var(--primary)">monitoring</span>
                            <h2 style="margin:0; font-size:28px; font-weight:800; color:var(--on-surface);">Piyasa Grafiği</h2>
                        </div>
                        <button id="fetih-chart-close" style="background:rgba(255,255,255,0.05); border:none; border-radius:50%; width:40px; height:40px; color:var(--outline); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s;">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    <!-- Scroll Wrapper -->
                    <div id="chart-scroll-wrapper" style="overflow-y:auto; overflow-x:hidden; max-height:75vh; padding-right:15px;">
                        <!-- Custom Controls -->
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:15px; margin-bottom:20px; background:rgba(0,0,0,0.2); padding:15px 25px; border-radius:20px; border:1px solid rgba(255,255,255,0.05);">
                            <div id="custom-time-controls" style="display:flex; flex-wrap:wrap; gap:10px;">
                                ${['Gün', 'Hafta', 'Ay', '6 Ay', 'Yıl', '5 Yıl', 'Max'].map(t => `<button class="custom-chart-btn time-btn ${t === 'Hafta' ? 'active' : ''}" data-val="${t}">${t}</button>`).join('')}
                            </div>
                            <div style="display:flex; gap:10px; align-items:center;">
                                <span style="font-size:12px; font-weight:800; color:var(--outline); text-transform:uppercase;">Varlık:</span>
                                <select id="custom-asset-select" style="background:rgba(255,255,255,0.05); border:1px solid rgba(var(--primary-rgb),0.3); color:var(--primary); font-size:14px; font-weight:700; padding:8px 16px; border-radius:12px; outline:none; cursor:pointer;">
                                    <option value="Altın">Altın</option>
                                    <option value="ONS">ONS</option>
                                    <option value="USD / Kg">USD / Kg</option>
                                    <option value="EUR / Kg">EUR / Kg</option>
                                    <option value="14 Ayar">14 Ayar</option>
                                    <option value="22 Ayar">22 Ayar</option>
                                    <option value="Gümüş">Gümüş</option>
                                    <option value="Yeni Çeyrek">Yeni Çeyrek</option>
                                    <option value="Eski Çeyrek">Eski Çeyrek</option>
                                    <option value="Yeni Yarım">Yeni Yarım</option>
                                    <option value="Eski Yarım">Eski Yarım</option>
                                    <option value="Yeni Tam">Yeni Tam</option>
                                    <option value="Eski Tam">Eski Tam</option>
                                    <option value="Yeni Ata">Yeni Ata</option>
                                    <option value="Eski Ata">Eski Ata</option>
                                    <option value="Yeni Ata5">Yeni Ata5</option>
                                    <option value="Eski Ata5">Eski Ata5</option>
                                    <option value="Yeni Gremese">Yeni Gremese</option>
                                    <option value="Eski Gremese">Eski Gremese</option>
                                </select>
                            </div>
                        </div>

                        <!-- The Original Chart Container goes here -->
                        <div id="chart-injection-zone" style="width:100%; min-height:550px; position:relative; overflow:visible; padding-bottom:20px;">
                            <div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--outline);">Orijinal grafik bekleniyor...</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bot Analysis Modal -->
            <div id="fetih-analysis-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:2147483647;display:none;align-items:center;justify-content:center;opacity:0;transition:opacity 0.4s ease;">
                <div style="width:92%;max-width:560px;background:rgba(18,18,18,0.95);border:1px solid rgba(var(--primary-rgb),0.25);border-radius:32px;padding:36px;box-shadow:0 40px 80px rgba(0,0,0,0.9);transform:translateY(20px) scale(0.95);transition:transform 0.4s cubic-bezier(0.19,1,0.22,1);" id="analysis-modal-box">
                    <!-- Header -->
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;">
                        <div style="display:flex;align-items:center;gap:12px;">
                            <div style="width:40px;height:40px;border-radius:50%;background:rgba(var(--primary-rgb),0.15);border:1px solid rgba(var(--primary-rgb),0.3);display:flex;align-items:center;justify-content:center;">
                                <span class="material-symbols-outlined" style="font-size:22px;color:var(--primary)">smart_toy</span>
                            </div>
                            <div>
                                <div style="font-size:18px;font-weight:900;color:#fff;font-family:'Manrope',sans-serif;">Fetih Analiz</div>
                                <div style="font-size:11px;color:var(--outline);font-weight:600;text-transform:uppercase;letter-spacing:1px;">Piyasa Raporu</div>
                            </div>
                        </div>
                        <button id="analysis-modal-close" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);color:var(--outline);cursor:pointer;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:all 0.2s;">
                            <span class="material-symbols-outlined" style="font-size:22px;">close</span>
                        </button>
                    </div>

                    <!-- Asset Tabs -->
                    <div style="display:flex;gap:8px;margin-bottom:24px;background:rgba(0,0,0,0.3);border-radius:16px;padding:6px;">
                        <button class="analysis-tab active" data-asset="HAS" style="flex:1;padding:10px;border-radius:12px;border:none;cursor:pointer;font-weight:800;font-size:13px;transition:all 0.3s;">Has Altın</button>
                        <button class="analysis-tab" data-asset="CEYREK" style="flex:1;padding:10px;border-radius:12px;border:none;cursor:pointer;font-weight:800;font-size:13px;transition:all 0.3s;">Çeyrek</button>
                        <button class="analysis-tab" data-asset="ONS" style="flex:1;padding:10px;border-radius:12px;border:none;cursor:pointer;font-weight:800;font-size:13px;transition:all 0.3s;">ONS</button>
                    </div>

                    <!-- Current Price -->
                    <div style="background:rgba(var(--primary-rgb),0.08);border:1px solid rgba(var(--primary-rgb),0.2);border-radius:20px;padding:24px;margin-bottom:16px;text-align:center;">
                        <div style="font-size:12px;font-weight:700;color:var(--outline);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">GÜNCEL FİYAT</div>
                        <div id="am-current-price" style="font-size:42px;font-weight:900;color:var(--primary);font-family:'Manrope',sans-serif;letter-spacing:-1px;">--</div>
                        <div id="am-insight" style="font-size:13px;color:var(--outline);margin-top:10px;line-height:1.5;">Analiz yükleniyor...</div>
                    </div>

                    <!-- Comparison Cards -->
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
                        <div class="am-comp-card" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:16px;">
                            <div style="font-size:10px;font-weight:800;color:var(--outline);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;display:flex;align-items:center;gap:4px;"><span class="material-symbols-outlined" style="font-size:13px;">today</span>Dün</div>
                            <div id="am-comp-y" style="font-size:20px;font-weight:900;font-family:'Manrope',sans-serif;">--</div>
                            <div id="am-comp-y-tl" style="font-size:11px;color:var(--outline);margin-top:4px;">--</div>
                        </div>
                        <div class="am-comp-card" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:16px;">
                            <div style="font-size:10px;font-weight:800;color:var(--outline);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;display:flex;align-items:center;gap:4px;"><span class="material-symbols-outlined" style="font-size:13px;">date_range</span>Hafta</div>
                            <div id="am-comp-w" style="font-size:20px;font-weight:900;font-family:'Manrope',sans-serif;">--</div>
                            <div id="am-comp-w-tl" style="font-size:11px;color:var(--outline);margin-top:4px;">--</div>
                        </div>
                        <div class="am-comp-card" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:16px;">
                            <div style="font-size:10px;font-weight:800;color:var(--outline);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;display:flex;align-items:center;gap:4px;"><span class="material-symbols-outlined" style="font-size:13px;">calendar_month</span>Ay</div>
                            <div id="am-comp-m" style="font-size:20px;font-weight:900;font-family:'Manrope',sans-serif;">--</div>
                            <div id="am-comp-m-tl" style="font-size:11px;color:var(--outline);margin-top:4px;">--</div>
                        </div>
                    </div>

                    <!-- Range Bar -->
                    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:16px;">
                        <div style="font-size:10px;font-weight:800;color:var(--outline);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">30 GÜNLÜK RANGE</div>
                        <div style="position:relative;height:6px;background:rgba(255,255,255,0.08);border-radius:99px;margin-bottom:10px;">
                            <div id="am-range-bar" style="position:absolute;left:0;top:-3px;width:12px;height:12px;background:var(--primary);border-radius:50%;box-shadow:0 0 8px rgba(var(--primary-rgb),0.6);transform:translateX(-50%);transition:left 0.5s ease;"></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;">
                            <span id="am-range-low" style="font-size:12px;font-weight:700;color:var(--outline);">-- TL</span>
                            <span id="am-range-high" style="font-size:12px;font-weight:700;color:var(--outline);">-- TL</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Settings Modal -->
            <div id="fetih-dash-modal">
                <div class="settings-container">
                    <div class="settings-header">
                        <div class="settings-title">
                            <span class="material-symbols-outlined">settings</span>
                            <h2>Ayarlar</h2>
                        </div>
                        <button id="fetih-dash-close" class="settings-close-btn">
                            <span class="material-symbols-outlined" style="font-size:24px">close</span>
                        </button>
                    </div>

                    <div class="settings-content">
                        <div class="settings-card">
                            <div class="settings-info">
                                <h3>Sistem Sesleri</h3>
                                <p>Fiyat değişimlerindeki uyarı sesleri</p>
                            </div>
                            <button id="fetih-sound-btn"
                                title="Sesi Aç/Kapat"
                                style="background:rgba(255,255,255,0.06);border:1px solid rgba(var(--primary-rgb),0.25);border-radius:50%;width:48px;height:48px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s; flex-shrink:0;">
                                <span class="material-symbols-outlined" style="font-size:24px;color:var(--outline)">volume_off</span>
                            </button>
                        </div>
                        <div class="settings-card" id="fetih-theme-btn" style="cursor: pointer;">
                            <div class="settings-info">
                                <h3>Görünüm Modu</h3>
                                <p>Açık ve Koyu tema arasında geçiş yap</p>
                            </div>
                            <button style="background:rgba(255,255,255,0.06);border:1px solid rgba(var(--primary-rgb),0.25);border-radius:50%;width:48px;height:48px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s; flex-shrink:0; pointer-events:none;">
                                <span class="material-symbols-outlined" id="fetih-theme-icon" style="font-size:24px;color:var(--outline)">light_mode</span>
                            </button>
                        </div>

                        <!-- Navbar Appearance Section (NEW) -->
                        <div class="settings-card" style="flex-direction: column; align-items: stretch; margin-top: 10px;">
                            <div id="fetih-nav-toggle" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 4px 0;">
                                <div class="settings-info">
                                    <h3 style="display: flex; align-items: center; gap: 8px;">
                                        <span class="material-symbols-outlined" style="font-size: 20px; color: var(--primary);">menu</span> 
                                        Navbar Görünümü
                                    </h3>
                                    <p>Üst menü çubuğunun stilini değiştirin</p>
                                </div>
                                <span class="material-symbols-outlined" id="fetih-nav-chevron" style="transition: transform 0.3s;">expand_more</span>
                            </div>
                            <div id="fetih-nav-panel" style="display: none; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                                <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">
                                    <button class="fx-btn nav-btn" data-nav="nav-normal">Standart</button>
                                    <button class="fx-btn nav-btn" data-nav="nav-shadow">Gölge & Blur</button>
                                    <button class="fx-btn nav-btn" data-nav="nav-theme">Tema Rengi</button>
                                    <button class="fx-btn nav-btn" data-nav="nav-invisible">Görünmez</button>
                                </div>
                            </div>
                        </div>

                        <!-- Card Visuals Toggle (NEW) -->
                        <div class="settings-card">
                            <div class="settings-info">
                                <h3>Kart Görselleri</h3>
                                <p>Altın kutularında ikonları göster/gizle</p>
                            </div>
                            <button id="fetih-visuals-btn"
                                title="Görselleri Aç/Kapat"
                                style="background:rgba(255,255,255,0.06);border:1px solid rgba(var(--primary-rgb),0.25);border-radius:50%;width:48px;height:48px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s; flex-shrink:0;">
                                <span class="material-symbols-outlined" style="font-size:24px;color:var(--outline)">image</span>
                            </button>
                        </div>



                        <!-- Theme Color Selection (Collapsible) -->
                        <div class="settings-card" style="flex-direction: column; align-items: stretch; margin-top: 10px;">
                            <div id="fetih-color-toggle" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 4px 0;">
                                <div class="settings-info">
                                    <h3 style="display: flex; align-items: center; gap: 8px;">
                                        <span class="material-symbols-outlined" style="font-size: 20px; color: var(--primary);">palette</span> 
                                        Tema Rengi
                                    </h3>
                                    <p>Arayüzün ana renk tonunu özelleştir</p>
                                </div>
                                <span class="material-symbols-outlined" id="fetih-color-chevron" style="transition: transform 0.3s;">expand_more</span>
                            </div>
                            <div id="fetih-color-panel" style="display: none; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                                <div class="theme-color-grid" id="fetih-color-picker">
                                    <!-- Colors will be injected here -->
                                </div>
                            </div>
                        </div>



                        <!-- Dedicated Glow Section (Collapsible) -->
                        <div class="settings-card" style="flex-direction: column; align-items: stretch; margin-top: 10px;">
                            <div id="fetih-glow-toggle" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 4px 0;">
                                <div class="settings-info">
                                    <h3 style="display: flex; align-items: center; gap: 8px;">
                                        <span class="material-symbols-outlined" style="font-size: 20px; color: var(--primary);">flare</span> 
                                        I&#351;&#305;k (Glow) Ayarlar&#305;
                                    </h3>
                                    <p>Arka plan ayd&#305;nlatma ve animasyon efektleri</p>
                                </div>
                                <span class="material-symbols-outlined" id="fetih-glow-chevron" style="transition: transform 0.3s;">expand_more</span>
                            </div>
                            
                            <div id="fetih-glow-panel" style="display: none; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                                <div style="margin-bottom: 20px;">
                                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                        <span style="font-size:11px; font-weight:800; color:var(--outline);">&#9889; ŞİDDET</span>
                                        <span id="glow-intensity-val" style="font-size:11px; font-weight:900; color:var(--primary);">100%</span>
                                    </div>
                                    <input type="range" id="glow-intensity-input" min="0" max="300" value="100" style="width:100%; accent-color:var(--primary);">
                                </div>
                                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
                                    <button class="fx-btn glow-btn" data-glow="">Yok</button>
                                    <button class="fx-btn glow-btn" data-glow="glow-soft">Sabit Soft</button>
                                    <button class="fx-btn glow-btn" data-glow="glow-neon">Sabit Neon</button>
                                    <button class="fx-btn glow-btn" data-glow="glow-pulse">&#128171; Puls (Nab&#305;z)</button>
                                    <button class="fx-btn glow-btn" data-glow="glow-orbit">&#128304; Orbit (D&#246;nen)</button>
                                    <button class="fx-btn glow-btn" data-glow="glow-drift">&#127787;&#65039; Drift (S&#252;z&#252;len)</button>
                                    <button class="fx-btn glow-btn" data-glow="glow-aurora">&#127752; Aurora (Dalga)</button>
                                    <button class="fx-btn glow-btn" data-glow="glow-halo">Halo (Hale)</button>
                                    <button class="fx-btn glow-btn" data-glow="glow-edges">&#128306; Kenarlar</button>
                                    <button class="fx-btn glow-btn" data-glow="glow-corners">&#128308; K&#246;&#351;eler</button>
                                    <button class="fx-btn glow-btn" data-glow="glow-diagonal">&#128260; &#199;apraz Ge&#231;i&#351;</button>
                                    <button class="fx-btn glow-btn" data-glow="glow-cinema">&#127916; Sinematik</button>
                                    <button class="fx-btn glow-btn" data-glow="glow-matrix">&#128187; Taray&#305;c&#305; (Matrix)</button>
                                </div>
                            </div>
                        </div>

                        <!-- Dedicated Texture Section (Collapsible) -->
                        <div class="settings-card" style="flex-direction: column; align-items: stretch; margin-top: 10px;">
                            <div id="fetih-tex-toggle" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 4px 0;">
                                <div class="settings-info">
                                    <h3 style="display: flex; align-items: center; gap: 8px;">
                                        <span class="material-symbols-outlined" style="font-size: 20px; color: var(--primary);">texture</span> 
                                        Doku Ayarlar&#305;
                                    </h3>
                                    <p>Arka plan desenini ve g&#246;r&#252;n&#252;m&#252;n&#252; &#246;zelle&#351;tir</p>
                                </div>
                                <span class="material-symbols-outlined" id="fetih-tex-chevron" style="transition: transform 0.3s;">expand_more</span>
                            </div>
                            
                            <div id="fetih-tex-panel" style="display: none; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                                <!-- Live Preview Box -->
                                <div style="margin-bottom: 24px; border-radius: 16px; overflow: hidden; position: relative; height: 80px; border: 1px solid rgba(var(--primary-rgb), 0.3);">
                                    <div id="tex-live-preview" style="position: absolute; inset: 0; background-color: var(--surface); opacity: var(--tex-opacity, 0.8); background-size: var(--tex-size, 40px) var(--tex-size, 40px); background-repeat: repeat;"></div>
                                    <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: #fff; mix-blend-mode: overlay; letter-spacing: 2px;">CANLI ÖNİZLEME</div>
                                </div>
                                <!-- Sliders -->
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
                                    <div>
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                            <span style="font-size: 11px; font-weight: 800; color: var(--outline);">BOYUT</span>
                                            <span id="tex-size-val" style="font-size: 11px; font-weight: 800; color: var(--primary);">40px</span>
                                        </div>
                                        <input type="range" id="fetih-tex-size" min="5" max="150" value="40" style="width: 100%; accent-color: var(--primary);">
                                    </div>
                                    <div>
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                            <span style="font-size: 11px; font-weight: 800; color: var(--outline);">OPAKLIK</span>
                                            <span id="tex-op-val" style="font-size: 11px; font-weight: 800; color: var(--primary);">40%</span>
                                        </div>
                                        <input type="range" id="fetih-tex-opacity" min="0" max="100" value="40" style="width: 100%; accent-color: var(--primary);">
                                    </div>
                                </div>

                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
                                    <div class="settings-info">
                                        <h4 style="margin:0; font-size:13px; color:#fff;">Doku Geçişi (Fade)</h4>
                                        <p style="font-size:11px;">Alta doğru yavaşça yok olsun</p>
                                    </div>
                                    <button id="fetih-tex-fade-btn" class="fx-btn" style="width: auto; padding: 8px 16px;">Pasif</button>
                                </div>

                                <!-- Pattern Selection Grid -->
                                <div style="font-size: 10px; font-weight: 900; color: var(--outline); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">DESEN SE&#199;&#304;M&#304;</div>
                                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; width: 100%; box-sizing: border-box;" id="fetih-tex-grid">
                                    <button class="tex-preview tex-btn no-tex" data-tex="" title="Yok"></button>
                                    ${Array.from({ length: 15 }, (_, i) => `<button class="tex-preview tex-btn p-${i + 1}" data-tex="tex-p${i + 1}" title="P${i + 1}"></button>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(root);

        // Event Listener'ları bağla (Isolated World hatasını önlemek için)
        const botTrigger = document.getElementById('fetih-bot-trigger');
        if (botTrigger) botTrigger.addEventListener('click', () => window.openFetihAnalysis());

        const settingsBtn = document.getElementById('fetih-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.openFetihDash();
            });
        }

        // Analysis modal tab styles
        const analysisStyleEl = document.createElement('style');
        analysisStyleEl.textContent = `
            .analysis-tab { background: transparent; color: var(--outline); }
            .analysis-tab.active { background: rgba(var(--primary-rgb),0.15); color: var(--primary); border: 1px solid rgba(var(--primary-rgb),0.3) !important; }
            .analysis-tab:hover { background: rgba(255,255,255,0.05); color: #fff; }
            #analysis-modal-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
            #fetih-analysis-modal.active { display: flex; opacity: 1; }
            #fetih-analysis-modal.active #analysis-modal-box { transform: translateY(0) scale(1); }
        `;
        document.head.appendChild(analysisStyleEl);

        // Analysis modal close
        const analysisClose = document.getElementById('analysis-modal-close');
        if (analysisClose) analysisClose.addEventListener('click', () => window.closeFetihAnalysis());

        // Analysis modal backdrop close
        const analysisModal = document.getElementById('fetih-analysis-modal');
        if (analysisModal) {
            analysisModal.addEventListener('click', (e) => {
                if (e.target === analysisModal) window.closeFetihAnalysis();
            });
        }

        // Analysis tabs
        document.querySelectorAll('.analysis-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.analysis-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentAnalysisAsset = tab.dataset.asset;
                updateAnalysisModal();
            });
        });

        const closeBtn = document.getElementById('fetih-dash-close');
        if (closeBtn) closeBtn.addEventListener('click', () => window.closeFetihDash());

        // Remoting conflicting internal key listener


        const soundBtn = document.getElementById('fetih-sound-btn');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => window._fetihToggleSound());
            // Başlangıç durumunu yükle
            if (soundEnabled) {
                soundBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:24px;color:#4ade80">volume_up</span>';
                soundBtn.title = 'Ses: AÇIK';
                soundBtn.style.borderColor = 'rgba(74, 222, 128, 0.5)';
                soundBtn.style.background = 'rgba(74, 222, 128, 0.1)';
            }
        }

        // Glow Panel Toggle
        const glowToggle = document.getElementById('fetih-glow-toggle');
        const glowPanel = document.getElementById('fetih-glow-panel');
        const glowChevron = document.getElementById('fetih-glow-chevron');
        if (glowToggle && glowPanel) {
            glowToggle.addEventListener('click', () => {
                const isOpen = glowPanel.style.display === 'grid' || glowPanel.style.display === 'block';
                glowPanel.style.display = isOpen ? 'none' : 'block';
                glowChevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            });
        }

        // Navbar Panel Toggle
        const navToggle = document.getElementById('fetih-nav-toggle');
        const navPanel = document.getElementById('fetih-nav-panel');
        const navChevron = document.getElementById('fetih-nav-chevron');
        if (navToggle && navPanel) {
            navToggle.addEventListener('click', () => {
                const isOpen = navPanel.style.display === 'block';
                navPanel.style.display = isOpen ? 'none' : 'block';
                navChevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            });
        }

        // Visuals Toggle
        const visualsBtn = document.getElementById('fetih-visuals-btn');
        let visualsEnabled = localStorage.getItem('fetihVisualsEnabled') === 'true';

        const updateVisualsUI = () => {
            if (visualsEnabled) {
                root.classList.add('show-visuals');
                if (visualsBtn) {
                    visualsBtn.style.borderColor = 'rgba(var(--primary-rgb), 0.5)';
                    visualsBtn.style.background = 'rgba(var(--primary-rgb), 0.1)';
                    visualsBtn.querySelector('span').style.color = 'var(--primary)';
                }
            } else {
                root.classList.remove('show-visuals');
                if (visualsBtn) {
                    visualsBtn.style.borderColor = 'rgba(255,255,255,0.1)';
                    visualsBtn.style.background = 'rgba(255,255,255,0.05)';
                    visualsBtn.querySelector('span').style.color = 'var(--outline)';
                }
            }
        };

        if (visualsBtn) {
            visualsBtn.addEventListener('click', () => {
                visualsEnabled = !visualsEnabled;
                localStorage.setItem('fetihVisualsEnabled', visualsEnabled);
                updateVisualsUI();
            });
        }
        updateVisualsUI();

        // Color Panel Toggle
        const colorToggle = document.getElementById('fetih-color-toggle');
        const colorPanel = document.getElementById('fetih-color-panel');
        const colorChevron = document.getElementById('fetih-color-chevron');
        if (colorToggle && colorPanel) {
            colorToggle.addEventListener('click', () => {
                const isOpen = colorPanel.style.display === 'block';
                colorPanel.style.display = isOpen ? 'none' : 'block';
                colorChevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            });
        }

        // Glass Panel Toggle
        const glassToggle = document.getElementById('fetih-glass-toggle');
        const glassPanel = document.getElementById('fetih-glass-panel');
        const glassChevron = document.getElementById('fetih-glass-chevron');
        if (glassToggle && glassPanel) {
            glassToggle.addEventListener('click', () => {
                const isOpen = glassPanel.style.display === 'block';
                glassPanel.style.display = isOpen ? 'none' : 'block';
                glassChevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            });
        }

        // Theme Toggle
        let isLightMode = localStorage.getItem('fetihLightMode') === 'true';
        const themeIcon = document.getElementById('fetih-theme-icon');

        if (isLightMode) {
            root.classList.add('light-mode');
            if (themeIcon) themeIcon.textContent = 'dark_mode';
        }

        const themeBtn = document.getElementById('fetih-theme-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                isLightMode = !isLightMode;
                localStorage.setItem('fetihLightMode', isLightMode);
                if (isLightMode) {
                    root.classList.add('light-mode');
                    if (themeIcon) themeIcon.textContent = 'dark_mode';
                } else {
                    root.classList.remove('light-mode');
                    if (themeIcon) themeIcon.textContent = 'light_mode';
                }
            });
        }

        // --- THEME EFFECTS (Glass / Texture / Glow) ---

        // --- TEXTURE CONTROLS ---
        const texToggle = document.getElementById('fetih-tex-toggle');
        const texPanel = document.getElementById('fetih-tex-panel');
        const texChevron = document.getElementById('fetih-tex-chevron');
        const texSizeInput = document.getElementById('fetih-tex-size');
        const texOpInput = document.getElementById('fetih-tex-opacity');

        if (texToggle) {
            texToggle.addEventListener('click', () => {
                const isOpen = texPanel.style.display === 'block';
                texPanel.style.display = isOpen ? 'none' : 'block';
                texChevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            });
        }

        function updateTexParams() {
            const size = texSizeInput?.value || 40;
            const opacity = (texOpInput?.value || 40) / 100;
            root.style.setProperty('--tex-size', `${size}px`);
            root.style.setProperty('--tex-opacity', opacity);
            const sizeValEl = document.getElementById('tex-size-val');
            const opValEl = document.getElementById('tex-op-val');
            if (sizeValEl) sizeValEl.textContent = `${size}px`;
            if (opValEl) opValEl.textContent = `${Math.round(opacity * 100)}%`;
            localStorage.setItem('fetihTexSize', size);
            localStorage.setItem('fetihTexOpacity', opacity);
        }

        if (texSizeInput) texSizeInput.addEventListener('input', updateTexParams);
        if (texOpInput) texOpInput.addEventListener('input', updateTexParams);



        // --- GLASS CONTROLS ---
        const glassBlurInput = document.getElementById('glass-blur-input');
        const glassBgInput = document.getElementById('glass-bg-input');
        const glassBorderInput = document.getElementById('glass-border-input');
        const glassRefractionInput = document.getElementById('glass-refraction-input');

        const glassRefractionAngleInput = document.getElementById('glass-refraction-angle-input');
        const glassGlitchInput = document.getElementById('glass-glitch-input');
        const glassLightAngleInput = document.getElementById('glass-light-angle-input');

        function updateGlassParams() {
            const blur = glassBlurInput?.value || 10.8;
            const bgOp = (glassBgInput?.value || 0) / 100;
            const borderOp = (glassBorderInput?.value || 100) / 100;
            const refraction = glassRefractionInput?.value || 0;
            const refAngle = glassRefractionAngleInput?.value || 0;
            const glitch = glassGlitchInput?.value || 0;
            const lightAngle = glassLightAngleInput?.value || 135;

            root.style.setProperty('--fetih-glass-blur', `${blur}px`);
            root.style.setProperty('--fetih-glass-bg', bgOp);
            root.style.setProperty('--fetih-glass-border', borderOp);

            const rad = lightAngle * Math.PI / 180;
            const lx = Math.cos(rad) * 3;
            const ly = Math.sin(rad) * 3;
            root.style.setProperty('--fetih-glass-light-x', `${lx}px`);
            root.style.setProperty('--fetih-glass-light-y', `${ly}px`);

            const blurValEl = document.getElementById('glass-blur-val');
            const bgValEl = document.getElementById('glass-bg-val');
            const borderValEl = document.getElementById('glass-border-val');
            const refAngleValEl = document.getElementById('glass-refraction-angle-val');
            const glitchValEl = document.getElementById('glass-glitch-val');
            const lightAngleValEl = document.getElementById('glass-light-angle-val');

            if (blurValEl) blurValEl.textContent = `${blur}px`;
            if (bgValEl) bgValEl.textContent = `${Math.round(bgOp * 100)}%`;
            if (borderValEl) borderValEl.textContent = `${Math.round(borderOp * 100)}%`;
            if (refAngleValEl) refAngleValEl.textContent = `${refAngle}°`;
            if (glitchValEl) glitchValEl.textContent = glitch;
            if (lightAngleValEl) lightAngleValEl.textContent = `${lightAngle}°`;

            const refrMap = document.getElementById('glass-refraction-map');
            if (refrMap) refrMap.setAttribute('scale', refraction);

            const glassNoise = document.getElementById('glass-noise');
            if (glassNoise) {
                // Interpolate base frequency based on angle (0 to 90)
                const ratio = refAngle / 90;
                const fx = 0.005 + (0.1 - 0.005) * ratio;
                const fy = 0.1 - (0.1 - 0.005) * ratio;
                glassNoise.setAttribute('baseFrequency', `${fx} ${fy}`);
            }

            const glitchRed = document.getElementById('glitch-red');
            const glitchBlue = document.getElementById('glitch-blue');
            if (glitchRed) glitchRed.setAttribute('dx', glitch);
            if (glitchBlue) glitchBlue.setAttribute('dx', -glitch);

            const refrValEl = document.getElementById('glass-refraction-val');
            if (refrValEl) refrValEl.textContent = refraction;

            localStorage.setItem('fetihGlassBlur', blur);
            localStorage.setItem('fetihGlassBg', bgOp);
            localStorage.setItem('fetihGlassBorder', borderOp);
            localStorage.setItem('fetihGlassRefraction', refraction);
            localStorage.setItem('fetihGlassRefAngle', refAngle);
            localStorage.setItem('fetihGlassGlitch', glitch);
            localStorage.setItem('fetihGlassLightAngle', lightAngle);
        }

        if (glassBlurInput) glassBlurInput.addEventListener('input', updateGlassParams);
        if (glassBgInput) glassBgInput.addEventListener('input', updateGlassParams);
        if (glassBorderInput) glassBorderInput.addEventListener('input', updateGlassParams);
        if (glassRefractionInput) glassRefractionInput.addEventListener('input', updateGlassParams);
        if (glassRefractionAngleInput) glassRefractionAngleInput.addEventListener('input', updateGlassParams);
        if (glassGlitchInput) glassGlitchInput.addEventListener('input', updateGlassParams);
        if (glassLightAngleInput) glassLightAngleInput.addEventListener('input', updateGlassParams);

        // --- GLASS ON/OFF & RANDOM LOGIC ---
        const btnGlassRandom = document.getElementById('btn-glass-random');
        const btnGlassOff = document.getElementById('btn-glass-off');
        const slidersContainer = document.getElementById('glass-sliders-container');
        const navbarFxContainer = document.getElementById('glass-navbar-fx-container');

        function toggleGlassOff(force) {
            const rootEl = document.getElementById('fetih-root');
            if (!rootEl) return;
            const isOff = typeof force !== 'undefined' ? force : !rootEl.classList.contains('glass-off');
            if (isOff) {
                rootEl.classList.add('glass-off');
                if (slidersContainer) { slidersContainer.style.opacity = '0.3'; slidersContainer.style.pointerEvents = 'none'; }
                if (navbarFxContainer) { navbarFxContainer.style.opacity = '0.3'; navbarFxContainer.style.pointerEvents = 'none'; }
                if (btnGlassOff) {
                    btnGlassOff.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">visibility</span> Aç';
                    btnGlassOff.style.background = 'rgba(74,222,128,0.1)';
                    btnGlassOff.style.borderColor = '#4ade80';
                    btnGlassOff.style.color = '#4ade80';
                }
            } else {
                rootEl.classList.remove('glass-off');
                if (slidersContainer) { slidersContainer.style.opacity = '1'; slidersContainer.style.pointerEvents = 'auto'; }
                if (navbarFxContainer) { navbarFxContainer.style.opacity = '1'; navbarFxContainer.style.pointerEvents = 'auto'; }
                if (btnGlassOff) {
                    btnGlassOff.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px;">visibility_off</span> Kapat';
                    btnGlassOff.style.background = 'rgba(248,113,113,0.1)';
                    btnGlassOff.style.borderColor = '#f87171';
                    btnGlassOff.style.color = '#f87171';
                }
            }
            localStorage.setItem('fetihGlassIsOff', isOff ? '1' : '0');
        }

        if (btnGlassOff) btnGlassOff.addEventListener('click', () => toggleGlassOff());

        if (btnGlassRandom) {
            btnGlassRandom.addEventListener('click', () => {
                if (document.getElementById('fetih-root').classList.contains('glass-off')) {
                    toggleGlassOff(false);
                }
                if (glassBlurInput) glassBlurInput.value = (Math.random() * 40).toFixed(1);
                if (glassBgInput) glassBgInput.value = Math.floor(Math.random() * 100);
                if (glassBorderInput) glassBorderInput.value = Math.floor(Math.random() * 100);
                if (glassRefractionInput) glassRefractionInput.value = Math.floor(Math.random() * 100);
                if (glassRefractionAngleInput) glassRefractionAngleInput.value = Math.floor(Math.random() * 90);
                if (glassGlitchInput) glassGlitchInput.value = (Math.random() * 20).toFixed(1);
                if (glassLightAngleInput) glassLightAngleInput.value = Math.floor(Math.random() * 360);
                updateGlassParams();
            });
        }

        // Bind effect buttons
        document.querySelectorAll('.navGlass-btn').forEach(b => b.addEventListener('click', () => window.applyEffect('navGlass', b.dataset.navGlass)));

        function updateTexLivePreview(texClass) {
            const preview = document.getElementById('tex-live-preview');
            if (!preview) return;

            // Background color always matches theme surface
            preview.style.backgroundColor = 'var(--surface)';

            if (!texClass) {
                preview.style.backgroundImage = 'none';
                return;
            }

            // Get background image from the preview button
            const btn = document.querySelector(`.tex-btn[data-tex="${texClass}"]`) || document.querySelector('.tex-btn[data-tex=""]');
            if (btn) preview.style.backgroundImage = getComputedStyle(btn).backgroundImage;
        }

        document.querySelectorAll('.tex-btn').forEach(b => b.addEventListener('click', () => {
            window.applyEffect('tex', b.dataset.tex);
            updateTexLivePreview(b.dataset.tex);
        }));

        document.querySelectorAll('.glow-btn').forEach(b => b.addEventListener('click', () => window.applyEffect('glow', b.dataset.glow)));

        // --- GLOW INTENSITY SLIDER ---
        const glowIntensityInput = document.getElementById('glow-intensity-input');
        const glowIntensityVal = document.getElementById('glow-intensity-val');
        function updateGlowIntensity() {
            const val = glowIntensityInput?.value || 100;
            const intensity = val / 100;
            root.style.setProperty('--glow-intensity', intensity);
            if (glowIntensityVal) glowIntensityVal.textContent = `${val}%`;
            localStorage.setItem('fetihGlowIntensity', val);
        }
        if (glowIntensityInput) glowIntensityInput.addEventListener('input', updateGlowIntensity);
        const savedGlowIntensity = localStorage.getItem('fetihGlowIntensity') || '100';
        if (glowIntensityInput) glowIntensityInput.value = savedGlowIntensity;
        updateGlowIntensity();

        // --- FADE SETTINGS CONTAINER ON SLIDER DRAG ---
        const allSliders = document.querySelectorAll('#fetih-dash-modal input[type="range"]');
        const dashModal = document.getElementById('fetih-dash-modal');
        const settingsContainer = document.querySelector('.settings-container');

        allSliders.forEach(slider => {
            const startPreview = () => {
                if (dashModal) {
                    dashModal.style.backdropFilter = 'blur(0px)';
                    dashModal.style.webkitBackdropFilter = 'blur(0px)';
                }
                if (settingsContainer) {
                    settingsContainer.style.background = 'rgba(20, 20, 20, 0.2)';
                    settingsContainer.style.boxShadow = 'none';
                    settingsContainer.style.borderColor = 'transparent';
                    Array.from(settingsContainer.children).forEach(child => {
                        if (child.classList.contains('settings-card') && !child.contains(slider)) {
                            child.style.opacity = '0.1';
                            child.style.pointerEvents = 'none';
                        }
                    });
                }
            };
            const stopPreview = () => {
                if (dashModal) {
                    dashModal.style.backdropFilter = '';
                    dashModal.style.webkitBackdropFilter = '';
                }
                if (settingsContainer) {
                    settingsContainer.style.background = '';
                    settingsContainer.style.boxShadow = '';
                    settingsContainer.style.borderColor = '';
                    Array.from(settingsContainer.children).forEach(child => {
                        child.style.opacity = '';
                        child.style.pointerEvents = '';
                    });
                }
            };
            slider.addEventListener('mousedown', startPreview);
            slider.addEventListener('touchstart', startPreview, { passive: true });
            slider.addEventListener('mouseup', stopPreview);
            slider.addEventListener('touchend', stopPreview);
            slider.addEventListener('blur', stopPreview);
        });

        // Restore params & effects
        const savedSize = localStorage.getItem('fetihTexSize') || '40';
        const savedOp = localStorage.getItem('fetihTexOpacity') || '0.4';
        if (texSizeInput) texSizeInput.value = savedSize;
        if (texOpInput) texOpInput.value = savedOp * 100;
        updateTexParams();

        const savedGlassBlur = localStorage.getItem('fetihGlassBlur') || '10.8';
        const savedGlassBg = localStorage.getItem('fetihGlassBg') || '0';
        const savedGlassBorder = localStorage.getItem('fetihGlassBorder') || '1';
        const savedGlassRefraction = localStorage.getItem('fetihGlassRefraction') || '0';
        const savedGlassRefAngle = localStorage.getItem('fetihGlassRefAngle') || '0';
        const savedGlassGlitch = localStorage.getItem('fetihGlassGlitch') || '0';
        const savedGlassLightAngle = localStorage.getItem('fetihGlassLightAngle') || '135';

        // Cam efektleri varsayılan olarak kapalı
        if (localStorage.getItem('fetihGlassIsOff') !== '0') {
            toggleGlassOff(true);
        }

        if (glassBlurInput) glassBlurInput.value = savedGlassBlur;
        if (glassBgInput) glassBgInput.value = savedGlassBg * 100;
        if (glassBorderInput) glassBorderInput.value = savedGlassBorder * 100;
        if (glassRefractionInput) glassRefractionInput.value = savedGlassRefraction;
        if (glassRefractionAngleInput) glassRefractionAngleInput.value = savedGlassRefAngle;
        if (glassGlitchInput) glassGlitchInput.value = savedGlassGlitch;
        if (glassLightAngleInput) glassLightAngleInput.value = savedGlassLightAngle;
        updateGlassParams();

        window.applyEffect('nav', localStorage.getItem('fetihNav') || 'nav-normal');
        window.applyEffect('navGlass', localStorage.getItem('fetihNavGlass') || '');
        const currentTex = localStorage.getItem('fetihTex') || '';
        window.applyEffect('tex', currentTex);
        updateTexLivePreview(currentTex);
        window.applyEffect('glow', localStorage.getItem('fetihGlow') || '');

        // Navbar buttons binding
        document.querySelectorAll('.nav-btn').forEach(b => b.addEventListener('click', () => window.applyEffect('nav', b.dataset.nav)));



        const texFadeBtn = document.getElementById('fetih-tex-fade-btn');
        if (texFadeBtn) {
            const updateTexFade = (active) => {
                root.classList.toggle('tex-fade-active', active);
                texFadeBtn.textContent = active ? 'Aktif' : 'Pasif';
                texFadeBtn.classList.toggle('active', active);
                localStorage.setItem('fetihTexFade', active ? '1' : '0');
                if (!active) {
                    root.style.setProperty('--scroll-fade', '1');
                } else {
                    // Trigger initial update
                    root.dispatchEvent(new Event('scroll'));
                }
            };

            const savedFade = localStorage.getItem('fetihTexFade') === '1';
            updateTexFade(savedFade);

            texFadeBtn.addEventListener('click', () => {
                const isNowActive = !root.classList.contains('tex-fade-active');
                updateTexFade(isNowActive);
            });

            // Scroll listener for texture fade
            root.addEventListener('scroll', () => {
                if (root.classList.contains('tex-fade-active')) {
                    const scrollY = root.scrollTop;
                    const fadeEnd = 600; // More aggressive fade (fully gone at 600px)
                    const fadeAmount = Math.max(0, Math.min(1, 1 - (scrollY / fadeEnd)));
                    root.style.setProperty('--scroll-fade', fadeAmount.toFixed(3));
                }
            }, { passive: true });
        }

        // --- THEME COLOR PICKER ---
        const themeColors = [
            '#CDA860', // Orijinal Altın
            '#E2B247', // Parlak Altın
            '#5D9CEC', // Soft Mavi
            '#48CFAD', // Nane Yeşili
            '#AC92EC', // Lavanta
            '#ED5565', // Gül Kurusu
            '#F6BB42', // Gün Çiçeği
            '#AAB2BD', // Gümüş / Platin
            '#3BAFDA', // Gökyüzü Mavisi
            '#8CC152', // Yaprak Yeşili
            '#D35400', // Gün Batımı Turuncusu
            '#967ADC', // Açık Mor
            '#4A89DC', // İndigo
            '#D770AD', // Allık Pembesi
            '#37BC9B', // Akuamarin
            '#656D78'  // Koyu Kurşun
        ];

        const colorPicker = document.getElementById('fetih-color-picker');
        let activeColor = localStorage.getItem('fetihThemeColor') || '#CDA860';

        function hexToRgb(hex) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `${r}, ${g}, ${b}`;
        }

        function darkenHex(hex, amount) {
            let r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
            let g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
            let b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
            return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
        }

        function applyThemeColor(color) {
            root.style.setProperty('--primary', color);
            root.style.setProperty('--primary-rgb', hexToRgb(color));
            root.style.setProperty('--primary-dark', darkenHex(color, 55));

            // Calculate Contrast Color
            let r = parseInt(color.slice(1, 3), 16);
            let g = parseInt(color.slice(3, 5), 16);
            let b = parseInt(color.slice(5, 7), 16);
            let brightness = (r * 299 + g * 587 + b * 114) / 1000;
            let contrast = brightness > 140 ? '#000000' : '#ffffff';
            root.style.setProperty('--primary-contrast', contrast);

            let ataR = 255, ataG = 152, ataB = 0; // #ff9800 default
            if (color.toUpperCase() !== '#CDA860') {
                let r = parseInt(color.slice(1, 3), 16);
                let g = parseInt(color.slice(3, 5), 16);
                let b = parseInt(color.slice(5, 7), 16);

                ataR = 255 - r;
                ataG = 255 - g;
                ataB = 255 - b;

                if (ataR < 80 && ataG < 80 && ataB < 80) {
                    ataR = Math.min(255, ataR + 100);
                    ataG = Math.min(255, ataG + 100);
                    ataB = Math.min(255, ataB + 100);
                }
            }
            root.style.setProperty('--ata-accent', `rgb(${ataR}, ${ataG}, ${ataB})`);
            root.style.setProperty('--ata-accent-rgb', `${ataR}, ${ataG}, ${ataB}`);

            localStorage.setItem('fetihThemeColor', color);
            activeColor = color;
            updateColorDots();
            updateFavicon(color);

            // Diğer dinamik yerleri güncelle (varsa)
            document.querySelectorAll('[style*="#CDA860"]').forEach(el => {
                el.style.color = el.style.color.replace(/#CDA860/gi, color);
                el.style.borderColor = el.style.borderColor.replace(/#CDA860/gi, color);
                el.style.background = el.style.background.replace(/#CDA860/gi, color);
            });
        }

        function updateColorDots() {
            if (!colorPicker) return;
            colorPicker.innerHTML = themeColors.map(c => `
                <div class="color-dot ${c.toLowerCase() === activeColor.toLowerCase() ? 'active' : ''}" 
                     style="background: ${c}" 
                     data-color="${c}"></div>
            `).join('');

            colorPicker.querySelectorAll('.color-dot').forEach(dot => {
                dot.addEventListener('click', () => applyThemeColor(dot.dataset.color));
            });
        }

        // İlk yükleme
        applyThemeColor(activeColor);
        updateColorDots();

        function updateFavicon(color) {
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 1500 1500" preserveAspectRatio="xMidYMid meet"><g transform="matrix(1, 0, 0, 1, 398, 123)"><g fill="${color}"><g transform="translate(0.786776, 991.992386)"><path d="M 686.546875 -518.875 L 639.90625 -739.125 L 609.15625 -730.1875 C 606.507812 -729.53125 603.695312 -729.035156 600.71875 -728.703125 C 597.738281 -728.367188 594.269531 -728.203125 590.3125 -728.203125 L 19.84375 -728.203125 L 20.828125 -697.453125 L 55.5625 -693.484375 L 77.390625 -676.625 L 81.359375 -658.765625 C 81.359375 -659.421875 82.019531 -657.101562 83.34375 -651.8125 L 84.328125 -102.1875 L 80.359375 24.796875 L 71.4375 80.359375 L 60.515625 130.953125 L 42.65625 168.65625 L 19.84375 204.375 L 340.296875 -2.96875 L 314.5 -17.859375 C 309.207031 -20.503906 301.929688 -26.457031 292.671875 -35.71875 L 280.765625 -64.484375 L 274.8125 -101.1875 L 276.796875 -283.75 L 308.546875 -316.484375 L 340.296875 -343.265625 L 368.078125 -354.1875 L 394.859375 -359.140625 L 414.703125 -351.203125 L 432.5625 -338.3125 L 441.484375 -313.5 L 446.453125 -282.75 L 576.421875 -410.734375 L 550.625 -461.328125 L 528.796875 -480.1875 L 504.984375 -495.0625 L 486.140625 -501.015625 L 447.4375 -501.015625 L 416.6875 -485.140625 L 385.9375 -464.3125 L 274.8125 -327.390625 L 276.796875 -697.453125 L 363.109375 -689.515625 L 439.5 -671.65625 L 480.1875 -655.78125 L 511.921875 -640.90625 L 548.640625 -621.0625 L 581.375 -599.234375 L 628 -554.59375 L 645.859375 -524.828125 L 660.75 -497.046875 Z M 686.546875 -518.875 "/></g></g></g></svg>`;
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            let link = document.querySelector("link[rel*='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'shortcut icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = url;
        }

        // --- FULLSCREEN F11 LOGIC ---
        let manualFullscreen = false;
        function checkFullscreen() {
            const rootEl = document.getElementById('fetih-root');
            if (!rootEl) return;

            // Check if window is very close to screen height (F11 mode) or manual toggle
            const heightRatio = window.innerHeight / window.screen.height;
            const isFull = manualFullscreen || heightRatio > 0.98 || document.fullscreenElement;

            if (isFull) {
                rootEl.classList.add('is-fullscreen');
            } else {
                rootEl.classList.remove('is-fullscreen');
            }
        }

        window.addEventListener('resize', checkFullscreen);
        window.addEventListener('keydown', (e) => {
            if (e.key === 'F11') {
                manualFullscreen = !manualFullscreen;
                checkFullscreen();
                // Check again after browser applies F11 resizing
                setTimeout(checkFullscreen, 300);
            }
        });
        checkFullscreen();

        // Chart Modal Logic
        const chartBtn = document.getElementById('fetih-chart-btn');
        const chartModal = document.getElementById('fetih-chart-modal');
        const chartClose = document.getElementById('fetih-chart-close');
        const injectionZone = document.getElementById('chart-injection-zone');

        if (chartBtn && chartModal) {
            chartBtn.addEventListener('click', () => {
                const originalChartContainer = document.querySelector('.chart-container');
                if (originalChartContainer && !injectionZone.contains(originalChartContainer)) {
                    injectionZone.innerHTML = '';
                    injectionZone.appendChild(originalChartContainer);
                    // Force resize for Chart.js
                    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
                }
                chartModal.classList.add('active');
            });

            chartClose.addEventListener('click', () => {
                chartModal.classList.remove('active');
            });
        }

        // Hijack Dropdowns
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const val = btn.dataset.val;
                const dropItems = injectionZone.querySelectorAll('.dropdown-item');
                for (let item of dropItems) {
                    if (item.textContent.trim() === val) {
                        item.click();
                        break;
                    }
                }
            });
        });

        const assetSelect = document.getElementById('custom-asset-select');
        if (assetSelect) {
            assetSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                const dropItems = injectionZone.querySelectorAll('.dropdown-item');
                for (let item of dropItems) {
                    if (item.textContent.trim() === val) {
                        item.click();
                        break;
                    }
                }
            });
        }
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
            });
        } else {
            updateBtn();
        }
        audioUnlocked = true;
    }

    window._fetihUnlockAudio = unlockAudio;
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

    // Klavye kısayolları
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const code = e.code;

        if (code === 'Escape') {
            window.closeFetihDash();
            window.closeFetihAnalysis();
            const chartModal = document.getElementById('fetih-chart-modal');
            if (chartModal) chartModal.classList.remove('active');
            return;
        }
        if (code === 'KeyA') {
            const modal = document.getElementById('fetih-dash-modal');
            if (modal && modal.classList.contains('active')) {
                window.closeFetihDash();
            } else {
                window.openFetihDash();
            }
            return;
        }
        if (code === 'KeyP') {
            // Toggle Ultra-Aesthetic Mode
            if (!window._isPMode) {
                // 1. Apply the "Ultra" combination
                window.applyEffect('glow', 'glow-aurora');
                window.applyEffect('tex', 'tex-p1');
                window.applyEffect('glass', '');

                window._isPMode = true;
                if (window._fetihSetMessage) window._fetihSetMessage("✨ Ultra Estetik Modu: AÇIK", true);
            } else {
                // 2. Turn EVERYTHING OFF (Clean State)
                window.applyEffect('glow', '');
                window.applyEffect('tex', '');
                window.applyEffect('glass', 'glass-none');

                window._isPMode = false;
                if (window._fetihSetMessage) window._fetihSetMessage("🌑 Tüm Efektler Kapatıldı", true);
            }
            return;
        }
        if (code === 'KeyH') {
            const root = document.getElementById('fetih-root');
            if (root) {
                const isHidden = root.style.display === 'none';
                root.style.display = isHidden ? 'flex' : 'none';
                document.body.style.overflow = isHidden ? 'hidden' : 'auto';
            }
            return;
        }
        if (code === 'KeyK') {
            const modal = document.getElementById('fetih-dash-modal');
            if (modal) {
                // If modal is not active, open it
                if (!modal.classList.contains('active')) {
                    window.openFetihDash();
                }

                // Focus on Texture Panel
                const texPanel = document.getElementById('fetih-tex-panel');
                const texChevron = document.getElementById('fetih-tex-chevron');
                const glowPanel = document.getElementById('fetih-glow-panel');
                const glowChevron = document.getElementById('fetih-glow-chevron');

                // Expand Texture, Collapse Glow
                if (texPanel) {
                    texPanel.style.display = 'block';
                    if (texChevron) texChevron.style.transform = 'rotate(180deg)';
                    // Scroll to it
                    texPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                if (glowPanel) {
                    glowPanel.style.display = 'none';
                    if (glowChevron) glowChevron.style.transform = 'rotate(0deg)';
                }
            }
            return;
        }
        if (code === 'KeyS') {
            const isUp = Math.random() > 0.5;
            if (isUp) playUpSequence();
            else playDownSequence();
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

    /* ─── ANALYSIS MODAL LOGIC ─── */
    let currentAnalysisAsset = 'HAS';

    window.openFetihAnalysis = function () {
        unlockAudio();
        const modal = document.getElementById('fetih-analysis-modal');
        if (modal) {
            modal.style.display = 'flex';
            // Force reflow so transition plays
            void modal.offsetWidth;
            modal.style.opacity = '1';
            const box = document.getElementById('analysis-modal-box');
            if (box) box.style.transform = 'translateY(0) scale(1)';
            updateAnalysisModal();
        }
    };

    window.closeFetihAnalysis = function () {
        const modal = document.getElementById('fetih-analysis-modal');
        if (!modal) return;
        modal.style.opacity = '0';
        const box = document.getElementById('analysis-modal-box');
        if (box) box.style.transform = 'translateY(20px) scale(0.95)';
        setTimeout(() => { modal.style.display = 'none'; }, 400);
    };

    async function updateAnalysisModal() {
        if (typeof window.getFetihAssetAnalysis !== 'function') return;

        const setComp = (elId, tlId, compData, current) => {
            const el = document.getElementById(elId);
            const tlEl = document.getElementById(tlId);
            if (!el) return;
            if (!compData) {
                el.textContent = '--';
                el.style.color = 'var(--outline)';
                if (tlEl) tlEl.textContent = 'Veri yok';
                return;
            }
            const sign = compData.pct > 0 ? '+' : '';
            const color = compData.pct > 0 ? 'var(--success)' : (compData.pct < 0 ? 'var(--error)' : 'var(--outline)');
            el.textContent = `${sign}${compData.pct}%`;
            el.style.color = color;
            if (tlEl) {
                const diffTL = (current - compData.price).toFixed(2);
                tlEl.textContent = `${sign}${diffTL} TL`;
                tlEl.style.color = color;
            }
        };

        const data = await window.getFetihAssetAnalysis(currentAnalysisAsset);
        const priceEl = document.getElementById('am-current-price');
        const insightEl = document.getElementById('am-insight');

        if (!data) {
            if (priceEl) priceEl.textContent = '--';
            if (insightEl) insightEl.textContent = 'Veri toplanıyor, lütfen bekleyin.';
            return;
        }

        if (priceEl) priceEl.textContent = data.current ? data.current.toLocaleString('tr-TR') + ' TL' : '--';
        if (insightEl) insightEl.innerHTML = data.insight || 'Analiz hazırlanıyor...';

        setComp('am-comp-y', 'am-comp-y-tl', data.yesterday, data.current);
        setComp('am-comp-w', 'am-comp-w-tl', data.weekly, data.current);
        setComp('am-comp-m', 'am-comp-m-tl', data.monthly, data.current);

        // Range bar
        if (data.range && data.current) {
            document.getElementById('am-range-low').textContent = data.range.low.toLocaleString('tr-TR') + ' TL';
            document.getElementById('am-range-high').textContent = data.range.high.toLocaleString('tr-TR') + ' TL';
            const total = data.range.high - data.range.low;
            const pos = total > 0 ? Math.min(100, Math.max(0, ((data.current - data.range.low) / total) * 100)) : 50;
            const bar = document.getElementById('am-range-bar');
            if (bar) bar.style.left = pos + '%';
        }
    }

    /* ─── DASHBOARD LOGIC (Settings) ─── */
    let currentDashAsset = 'HAS';
    window.openFetihDash = function () {
        unlockAudio();
        const modal = document.getElementById('fetih-dash-modal');
        if (modal) {
            modal.classList.add('active');
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
            const isError = val === 'NaN' || val === '-';
            el.innerHTML = `<span class="material-symbols-outlined loading-icon ${isError ? 'stop-spin' : ''}" style="font-size:32px">${isError ? 'error' : 'sync'}</span>`;
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
    let lastUpdateTimestamp = Date.now();

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
        lastUpdateTimestamp = Date.now();

        // Restore CANLI if it was DURDU
        const liveText = document.getElementById('live-text-span');
        if (liveText && liveText.textContent === 'DURDU') {
            liveText.textContent = 'CANLI';
            liveText.style.color = 'var(--primary)';
            const dot = document.querySelector('.live-dot');
            if (dot) {
                dot.style.animationPlayState = 'running';
                dot.style.background = 'var(--primary)';
                dot.style.boxShadow = '';
            }
        }

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
            const accentColor = isAta ? 'var(--ata-accent)' : 'var(--primary)';
            const accentRgb = isAta ? 'var(--ata-accent-rgb)' : 'var(--primary-rgb)';

            const badge = item.mult ? `<span class="mult-badge" style="${isAta ? `color:${accentColor}; border-color:rgba(${accentRgb},0.3); background:rgba(${accentRgb},0.1);` : ''}">${item.mult}</span>` :
                (item.star ? `<span class="star-badge" style="${isAta ? `border-color:rgba(${accentRgb},0.4); background:rgba(${accentRgb},0.1);` : ''}"><span class="material-symbols-outlined" style="font-size:12px;color:${accentColor}">star</span></span>` : '');

            const arrow = v.dir === 'up' ? `<span class="material-symbols-outlined" style="color:var(--success);font-size:16px;vertical-align:text-bottom">arrow_upward</span>` :
                (v.dir === 'down' ? `<span class="material-symbols-outlined" style="color:var(--error);font-size:16px;vertical-align:text-bottom">arrow_downward</span>` : '');

            const dBuy = (v.buy && v.buy !== '-' && v.buy !== 'NaN') ? `${arrow} ${v.buy}` : '<span class="material-symbols-outlined loading-icon" style="font-size:16px">sync</span>';
            const dSell = (v.sell && v.sell !== '-' && v.sell !== 'NaN') ? `${arrow} ${v.sell}` : '<span class="material-symbols-outlined loading-icon" style="font-size:16px">sync</span>';

            const sellId = item.key === 'ESKİÇEYREK' ? 'id="val-ceyrek-sell"' : (item.key === 'ESKİATA' ? 'id="val-ata-sell"' : '');

            const isCoin = ['ESKİÇEYREK', 'ESKİYARIM', 'ESKİTAM', 'ESKİGREMSE'].includes(item.key);
            const isAtaCoin = item.key === 'ESKİATA';

            let coinImg = '';
            if (isCoin) {
                coinImg = `<img class="card-visual" style="width:230px; height:230px; bottom:-70px; left:-70px; opacity:0.7;" src="${chrome.runtime.getURL('image/ceyrek.jpg')}" alt="Gold Coin">`;
            } else if (isAtaCoin) {
                coinImg = `<img class="card-visual" style="width:230px; height:230px; bottom:-70px; left:-70px; opacity:0.7;" src="${chrome.runtime.getURL('image/ata.PNG')}" alt="Ata Gold">`;
            }

            return `
                <div class="mini-card" style="overflow:hidden; ${isAta ? `border: 1px solid var(--ata-accent); box-shadow: 0 0 10px rgba(${accentRgb}, 0.2);` : ''}">
                    ${coinImg}
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; position:relative; z-index:1;">
                        <div class="card-title" style="font-size:11px; font-weight:900; color:${accentColor}; opacity:0.9; letter-spacing:1px">${item.label}</div>
                        ${badge}
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; position:relative; z-index:1;">
                        <span class="label-text" style="font-size:9px; opacity:0.8; font-weight:900; color:var(--on-surface)">AL</span>
                        <span class="t-val" style="font-size:17px; font-weight:800">${dBuy}</span>
                    </div>
                    <div class="mini-card-sep" style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid rgba(var(--primary-rgb), 0.2); position:relative; z-index:1;">
                        <span class="label-text" style="font-size:9px; opacity:0.8; font-weight:900; color:var(--on-surface)">SAT</span>
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
            const arrowIcon = v.dir === 'down' ? 'arrow_downward' : 'arrow_upward';
            const iconBg = 'rgba(255,255,255,0.08)';
            const iconColor = v.dir === 'down' ? 'var(--error)' : 'var(--success)';
            const iconHTML = `<div style="display:flex; align-items:center; justify-content:center; width:48px; height:48px; border-radius:50%; background:${iconBg}; margin-right:24px; flex-shrink:0;">
                                <span class="material-symbols-outlined" style="font-size:28px !important; color:${iconColor} !important; font-weight:bold !important;">${arrowIcon}</span>
                              </div>`;

            const tBuy = (v.buy && v.buy !== '-' && v.buy !== 'NaN') ? v.buy : '--';
            const tSell = (v.sell && v.sell !== '-' && v.sell !== 'NaN') ? v.sell : '--';
            const safeName = (v.name || '').replace('ALTIN', ' ALTIN').replace('ESKI', 'ESKİ ').trim();

            const changeVal = v.rate ? (String(v.rate).includes('%') ? String(v.rate) : `%${v.rate}`) : '%0.00';
            const changeColor = changeVal.includes('-') ? 'var(--error)' : 'var(--success)';

            return `
            <tr class="glass-classic">
                <td style="font-weight:700 !important; color:var(--on-surface) !important; letter-spacing:1px !important; font-size:19px !important;">
                    <div style="display:flex; align-items:center;">
                        ${iconHTML}
                        ${safeName}
                    </div>
                </td>
                <td class="t-val" style="font-size:25px !important; color:var(--on-surface) !important;">${tBuy}</td>
                <td class="t-val" style="color:var(--primary) !important; font-size:25px !important; font-weight:900 !important;">${tSell}</td>
                <td class="t-val" style="font-size:24px !important; color:${changeColor} !important; text-align:right !important;">${changeVal}</td>
            </tr>
            `;
        }).join('');
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

            // Connection Monitor (1 dk = 60000 ms)
            setInterval(() => {
                const liveText = document.getElementById('live-text-span');
                if (!liveText) return;

                // Original site might show a warning modal
                const siteModal = document.querySelector('.sweet-alert.showSweetAlert, .swal-modal, .swal2-container');
                const isStale = Date.now() - lastUpdateTimestamp > 60000;

                if (isStale || siteModal) {
                    if (liveText.textContent !== 'DURDU') {
                        liveText.textContent = 'DURDU';
                        liveText.style.color = 'var(--error)';
                        const dot = document.querySelector('.live-dot');
                        if (dot) {
                            dot.style.animationPlayState = 'paused';
                            dot.style.background = 'var(--error)';
                            dot.style.boxShadow = 'none';
                        }
                    }
                }
            }, 2000);
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();

})();
