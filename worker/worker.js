
const TARGET_URL = "https://canlipiyasalar.haremaltin.com";

// Harem Altın Özelleştirme Çekirdek Modülü v2.3 (Simplified Visibility)
const INJECTED_SCRIPT = `
(function () {
    console.log('HaremCore v2.3 Başlatılıyor...');

    // --- Konfigürasyon ve Sabitler ---
    const STORAGE_KEY = 'harem_custom_config';
    const DEFAULT_CONFIG = {
        logoUrl: '',
        logoLink: '',
        prices: {}, 
        visibility: {
            'Altın Fiyatları': true,
            'Sarrafiye Fiyatları': true,
            'Darphane İşçilik Fiyatları': true,
            'Çevirici': true,
            'Grafik': true
        }
    };

    let config = loadConfig();

    // --- Stil Tanımları (CSS Inject) ---
    function injectStyles() {
        if (document.getElementById('harem-core-styles')) return;
        const style = document.createElement('style');
        style.id = 'harem-core-styles';
        style.textContent = \`
            /* Admin Toggle Button (FAB) */
            #harem-admin-toggle {
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #FFD700 0%, #B8860B 100%);
                color: #000;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10000;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                font-size: 24px;
                border: 2px solid rgba(255,255,255,0.2);
            }
            #harem-admin-toggle:hover {
                transform: scale(1.1) rotate(90deg);
                box-shadow: 0 15px 35px rgba(255, 215, 0, 0.4);
            }

            /* Admin Modal Panel */
            #harem-admin-modal {
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 400px;
                max-width: 90vw;
                background: #1a1a1a;
                color: #e0e0e0;
                border-radius: 16px;
                padding: 0;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
                z-index: 10001;
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                overflow: hidden;
                border: 1px solid #333;
                animation: modalFadeIn 0.3s ease-out;
            }
            
            @keyframes modalFadeIn {
                from { opacity: 0; transform: translate(-50%, -45%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }

            .admin-header {
                background: #252525;
                padding: 20px;
                border-bottom: 1px solid #333;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .admin-header h3 { margin: 0; font-size: 18px; color: #FFD700; font-weight: 600; }
            .close-modal { cursor: pointer; font-size: 20px; color: #888; transition: color 0.2s; }
            .close-modal:hover { color: #fff; }

            .admin-body { padding: 20px; max-height: 60vh; overflow-y: auto; }
            .form-group { margin-bottom: 15px; }
            .form-label { display: block; font-size: 12px; color: #888; margin-bottom: 5px; }
            
            input[type="text"], input[type="number"] {
                width: 100%;
                padding: 10px;
                background: #0f0f0f;
                border: 1px solid #333;
                color: #fff;
                border-radius: 8px;
                font-size: 14px;
                box-sizing: border-box;
                transition: border-color 0.2s;
            }
            input[type="text"]:focus, input[type="number"]:focus { border-color: #FFD700; outline: none; }

            .checkbox-group {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
                background: #252525;
                padding: 10px;
                border-radius: 8px;
                border: 1px solid #333;
            }
            .checkbox-group input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
            .checkbox-group label { cursor: pointer; color: #e0e0e0; font-size: 14px; flex: 1; }

            .admin-product-item {
                background: #252525;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 10px;
                border: 1px solid #333;
            }
            .product-name { font-weight: 600; color: #fff; margin-bottom: 8px; display: block; }
            .offset-group { display: flex; gap: 10px; }

            .admin-footer {
                padding: 20px;
                background: #252525;
                border-top: 1px solid #333;
                display: flex;
                gap: 10px;
            }
            .btn {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.2s;
            }
            .btn:hover { opacity: 0.9; }
            .btn-primary { background: #FFD700; color: #000; }
            .btn-danger { background: #cf3535; color: #fff; }

            .admin-body::-webkit-scrollbar { width: 8px; }
            .admin-body::-webkit-scrollbar-track { background: #1a1a1a; }
            .admin-body::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
            .admin-body::-webkit-scrollbar-thumb:hover { background: #555; }

            /* --- RESPONSIVE TABLE CSS --- */
            /* Tablo içeren kutular için container query benzeri yaklaşım - Full Height & Width */
            .dashboard-grid .box .full-height-table {
                height: 100%;
                width: 100%;
                display: flex;
                flex-direction: column;
            }
            
            .dashboard-grid .box .full-height-table table {
                 width: 100% !important;
                 height: 100% !important;
                 table-layout: fixed; /* Hücrelerin eşit dağılması veya genişliğe uyması için */
            }

            @media (min-width: 768px) {
                /* Yazı boyutlarını viewport genişliğine göre ölçekle */
                .dashboard-grid .box .full-height-table .item.title,
                .dashboard-grid .box .full-height-table .item.price,
                .dashboard-grid .box .full-height-table .item.rate,
                .dashboard-grid .box .full-height-table td span,
                .dashboard-grid .box .full-height-table th span,
                .dashboard-grid .box .full-height-table a {
                     /* Base size + viewport dependent size */
                    font-size: calc(10px + 0.8vw) !important; 
                    line-height: 1.4 !important;
                    white-space: nowrap; /* Yazıların alt satıra geçmesini engelle (opsiyonel) */
                }
                
                .dashboard-grid .box .full-height-table th,
                .dashboard-grid .box .full-height-table td {
                    padding: 0.8vh 0.5vw !important; /* Dikey ve yatay padding de ölçeklensin */
                    vertical-align: middle !important;
                }
                
                /* SVG ikonları da büyüsün */
                .dashboard-grid .box .full-height-table svg {
                    width: 1.2vw !important;
                    height: 1.2vw !important;
                }
            }
        \`;
        document.head.appendChild(style);
    }

    // --- Yardımcı Fonksiyonlar ---
    function loadConfig() {
        const stored = localStorage.getItem(STORAGE_KEY);
        try {
            const parsed = stored ? JSON.parse(stored) : DEFAULT_CONFIG;
            return { 
                ...DEFAULT_CONFIG, 
                ...parsed, 
                visibility: { ...DEFAULT_CONFIG.visibility, ...parsed.visibility }
            };
        } catch (e) {
            return DEFAULT_CONFIG;
        }
    }

    function saveConfig() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        applyChanges();
    }

    function applyChanges() {
        updateLogo();
        applyVisibility();
        applyPriceOffsets();
    }
    
    // --- DOM Manipülasyonları ---

    function updateLogo() {
        if (!config.logoUrl) return;
        const logoContainer = document.querySelector('.left .logo');
        if (logoContainer) {
            if (config.logoLink) logoContainer.href = config.logoLink;
            const existingSvg = logoContainer.querySelector('svg#logo');
            let img = logoContainer.querySelector('img.custom-logo');
            if (!img) {
                img = document.createElement('img');
                img.className = 'custom-logo';
                img.style.cssText = 'max-height: 50px !important; max-width: 100% !important; display: block !important;';
                if (existingSvg) existingSvg.style.display = 'none';
                logoContainer.appendChild(img);
            }
            if (img.src !== config.logoUrl) img.src = config.logoUrl;
        }
    }
    
    function applyVisibility() {
        const boxes = document.querySelectorAll('.box');
        
        boxes.forEach(box => {
            const titleEl = box.querySelector('.head .title');
            let sectionName = null;
            
            if (titleEl) {
                const titleText = titleEl.innerText.trim();
                if (titleText.includes('Altın Fiyatları')) sectionName = 'Altın Fiyatları';
                else if (titleText.includes('Sarrafiye Fiyatları')) sectionName = 'Sarrafiye Fiyatları';
                else if (titleText.includes('Darphane İşçilik Fiyatları')) sectionName = 'Darphane İşçilik Fiyatları';
                else if (titleText.includes('Çevirici')) sectionName = 'Çevirici';
            } else if (box.querySelector('.chart-container')) {
                sectionName = 'Grafik';
            }

            if (sectionName && config.visibility.hasOwnProperty(sectionName)) {
                if (config.visibility[sectionName]) {
                     box.style.display = '';
                } else {
                     box.style.setProperty('display', 'none', 'important');
                }
            }
        });
    }

    function applyPriceOffsets() {
        if (observer) observer.disconnect();

        try {
            const rows = document.querySelectorAll('.dashboard-grid table tbody tr');

            rows.forEach(row => {
                const nameCell = row.querySelector('td:first-child');
                if (!nameCell) return;

                const productName = nameCell.innerText.trim();
                const productConfig = config.prices[productName];

                if (productConfig) {
                    const buyCell = row.querySelector('td:nth-child(2)');
                    const sellCell = row.querySelector('td:nth-child(3)');

                    if (buyCell) modifyPrice(buyCell, productConfig.buyOffset, productConfig.type);
                    if (sellCell) modifyPrice(sellCell, productConfig.sellOffset, productConfig.type);
                }
            });
        } finally {
            startOptimizedObserver();
        }
    }

    function modifyPrice(cell, offset, type) {
        if (!offset) return;

        function findPriceTextNode(node) {
            if (node.nodeType === 3) {
                if (/[0-9]/.test(node.nodeValue)) return node;
            }
            for (let i = 0; i < node.childNodes.length; i++) {
                const found = findPriceTextNode(node.childNodes[i]);
                if (found) return found;
            }
            return null;
        }

        const textNode = findPriceTextNode(cell);
        if (!textNode) return;

        const rawText = textNode.nodeValue.trim();
        const lastWritten = cell.getAttribute('data-harem-last');
        if (rawText === lastWritten) return;

        let originalValue = parseFloat(rawText.replace(/\./g, '').replace(',', '.'));
        if (isNaN(originalValue)) return;

        let newValue = originalValue;
        const numOffset = parseFloat(offset);

        if (type === 'percent') newValue += (originalValue * numOffset / 100);
        else newValue += numOffset;

        const parts = rawText.split(',');
        let decimals = 2;
        if (parts.length > 1) {
            decimals = parts[1].length;
            if (decimals > 3) decimals = 2; 
        }

        const formatted = newValue.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
        
        if (textNode.nodeValue !== formatted) {
             textNode.nodeValue = formatted;
             cell.setAttribute('data-harem-last', formatted);
        }
    }

    // --- Mutation Observer ---
    let observer;

    observer = new MutationObserver((mutations) => {
        applyChanges();
    });

    function startOptimizedObserver() {
        const targetNode = document.querySelector('.dashboard-grid');
        if (targetNode) {
            observer.disconnect();
            observer.observe(targetNode, { childList: true, subtree: true, characterData: true });
        } else {
            setTimeout(startOptimizedObserver, 1000);
        }
    }

    // --- Admin Paneli UI ---
    function createAdminPanel() {
        if (document.getElementById('harem-custom-admin')) return;

        const container = document.createElement('div');
        container.id = 'harem-custom-admin';

        container.innerHTML = \`
            <div id="harem-admin-toggle" title="Ayarları Düzenle">⚙️</div>
            
            <div id="harem-admin-modal">
                <div class="admin-header">
                    <h3>Panel Ayarları</h3>
                    <span class="close-modal" id="admin-close-btn">&times;</span>
                </div>
                
                <div class="admin-body">
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #FFD700; margin-bottom: 10px;">Görünüm Ayarları</h4>
                        <div class="checkbox-group"><input type="checkbox" id="show-gold-prices"><label for="show-gold-prices">Altın Fiyatları Göster</label></div>
                        <div class="checkbox-group"><input type="checkbox" id="show-sarrafiye"><label for="show-sarrafiye">Sarrafiye Fiyatları Göster</label></div>
                        <div class="checkbox-group"><input type="checkbox" id="show-darphane"><label for="show-darphane">Darphane İşçilik Göster</label></div>
                        <div class="checkbox-group"><input type="checkbox" id="show-converter"><label for="show-converter">Çevirici Göster</label></div>
                        <div class="checkbox-group"><input type="checkbox" id="show-chart"><label for="show-chart">Grafik Göster</label></div>
                    </div>
                
                    <div class="form-group">
                        <span class="form-label">Logo URL</span>
                        <input type="text" id="admin-logo-url" placeholder="https://ornek.com/logo.png">
                    </div>
                    <div class="form-group">
                        <span class="form-label">Logo Linki</span>
                        <input type="text" id="admin-logo-link" placeholder="Tıklanınca gidilecek adres">
                    </div>

                    <div style="margin-top: 20px; border-top: 1px solid #333; padding-top: 10px;">
                        <h4 style="color: #FFD700; margin-bottom: 10px;">Fiyat Yönetimi</h4>
                        <div id="admin-product-list">
                            <div style="text-align: center; color: #888; padding: 20px;">
                                Ürünler yükleniyor veya bulunamadı...
                            </div>
                        </div>
                    </div>
                </div>

                <div class="admin-footer">
                    <button id="admin-reset-btn" class="btn btn-danger">Sıfırla</button>
                    <button id="admin-save-btn" class="btn btn-primary">Kaydet & Uygula</button>
                </div>
            </div>
        \`;
        document.body.appendChild(container);

        document.getElementById('harem-admin-toggle').addEventListener('click', () => {
            const modal = document.getElementById('harem-admin-modal');
            modal.style.display = 'block';
            loadAdminValues();
        });

        document.getElementById('admin-close-btn').addEventListener('click', () => {
            document.getElementById('harem-admin-modal').style.display = 'none';
        });

        document.getElementById('admin-save-btn').addEventListener('click', () => {
            saveConfigFromUI();
        });

        document.getElementById('admin-reset-btn').addEventListener('click', () => {
             if (confirm('Sıfırlamak istiyor musunuz?')) {
                localStorage.removeItem(STORAGE_KEY);
                config = DEFAULT_CONFIG;
                location.reload();
            }
        });
    }

    function loadAdminValues() {
        document.getElementById('admin-logo-url').value = config.logoUrl || '';
        document.getElementById('admin-logo-link').value = config.logoLink || '';
        document.getElementById('show-gold-prices').checked = config.visibility['Altın Fiyatları'];
        document.getElementById('show-sarrafiye').checked = config.visibility['Sarrafiye Fiyatları'];
        document.getElementById('show-darphane').checked = config.visibility['Darphane İşçilik Fiyatları'];
        document.getElementById('show-converter').checked = config.visibility['Çevirici'];
        document.getElementById('show-chart').checked = config.visibility['Grafik'];

        const listContainer = document.getElementById('admin-product-list');
        listContainer.innerHTML = '';

        const rows = document.querySelectorAll('.dashboard-grid table tbody tr');
        if (rows.length === 0) {
            listContainer.innerHTML = '<div style="padding:10px; color:orange;">Tablo bulunamadı. Lütfen ana sayfada olduğunuzdan emin olun.</div>';
            return;
        }

        const seenProducts = new Set();
        rows.forEach(row => {
            const nameCell = row.querySelector('td:first-child');
            if (!nameCell) return;
            const name = nameCell.innerText.trim();

            if (seenProducts.has(name)) return;
            seenProducts.add(name);

            const conf = config.prices[name] || { buyOffset: 0, sellOffset: 0 };
            const item = document.createElement('div');
            item.className = 'admin-product-item';
            item.dataset.name = name;

            item.innerHTML = \`<span class="product-name">\${name}</span><div class="offset-group"><div style="flex:1"><span class="form-label">Alış Farkı</span><input type="number" class="buy-offset" value="\${conf.buyOffset}" step="0.01"></div><div style="flex:1"><span class="form-label">Satış Farkı</span><input type="number" class="sell-offset" value="\${conf.sellOffset}" step="0.01"></div></div>\`;
            listContainer.appendChild(item);
        });
    }

    function saveConfigFromUI() {
        config.logoUrl = document.getElementById('admin-logo-url').value;
        config.logoLink = document.getElementById('admin-logo-link').value;
        config.visibility['Altın Fiyatları'] = document.getElementById('show-gold-prices').checked;
        config.visibility['Sarrafiye Fiyatları'] = document.getElementById('show-sarrafiye').checked;
        config.visibility['Darphane İşçilik Fiyatları'] = document.getElementById('show-darphane').checked;
        config.visibility['Çevirici'] = document.getElementById('show-converter').checked;
        config.visibility['Grafik'] = document.getElementById('show-chart').checked;

        config.prices = {};
        document.querySelectorAll('.admin-product-item').forEach(item => {
            const name = item.dataset.name;
            const buy = parseFloat(item.querySelector('.buy-offset').value) || 0;
            const sell = parseFloat(item.querySelector('.sell-offset').value) || 0;
            if (buy !== 0 || sell !== 0) {
                config.prices[name] = { buyOffset: buy, sellOffset: sell, type: 'fixed' };
            }
        });

        saveConfig();
        const modal = document.getElementById('harem-admin-modal');
        modal.style.display = 'none';

        const toggleBtn = document.getElementById('harem-admin-toggle');
        const oldColor = toggleBtn.style.color;
        toggleBtn.style.color = '#fff';
        toggleBtn.innerHTML = '✅';
        setTimeout(() => {
            toggleBtn.innerHTML = '⚙️';
            toggleBtn.style.color = oldColor;
        }, 1500);
    }

    function init() {
        injectStyles();
        createAdminPanel();
        updateLogo();
        applyVisibility();
        applyPriceOffsets();
        startOptimizedObserver();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
`;

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const targetUrl = new URL(TARGET_URL);

        // Yolları (path) koru
        targetUrl.pathname = url.pathname;
        targetUrl.search = url.search;

        const originalResponse = await fetch(targetUrl.toString(), {
            headers: request.headers,
            method: request.method,
            body: request.body
        });

        // Sadece HTML yanıtlarını işle
        const contentType = originalResponse.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
            return new HTMLRewriter()
                .on("body", {
                    append(content) {
                        content.append(`<script>${INJECTED_SCRIPT}</script>`, { html: true });
                    }
                })
                .transform(originalResponse);
        }

        // Diğer tüm istekleri olduğu gibi ilet
        return originalResponse;
    },
};
