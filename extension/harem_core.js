/**
 * Harem Altin Ozellestirme Cekirdek Modulu (harem_core.js)
 * v3.2 - Satir Sirasi Kayit, Debounce, Fiyat Kaybetme Duzeltme
 */

(function () {
    console.log('HaremCore v3.2 Baslatiliyor...');

    const STORAGE_KEY = 'harem_custom_config';
    const DEFAULT_CONFIG = {
        logoUrl: '',
        logoLink: '',
        prices: {},
        hiddenRows: {},     // { 'YENI CEYREK': true } => gizli
        rowOrder: {},       // { 'Altin Fiyatlari': ['HAS ALTIN', 'ONS', ...] }
        visibility: {}      // { 'Altin Fiyatlari': true/false }
    };

    let config = loadConfig();

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
                display:flex; align-items:center; justify-content:center;
                padding:12px 24px;
                background:linear-gradient(135deg,#1a1a1a,#2a2a2a);
                border-bottom:1px solid rgba(255,215,0,.2);
                box-shadow:0 4px 20px rgba(0,0,0,.4);
            }
            #harem-custom-navbar .nl { display:flex;align-items:center;text-decoration:none;cursor:pointer; }
            #harem-custom-navbar .nl-img {
                max-height:54px;max-width:220px;object-fit:contain;
                filter:drop-shadow(0 2px 8px rgba(255,215,0,.25));
                transition:filter .3s,transform .3s;
            }
            #harem-custom-navbar .nl-img:hover { filter:drop-shadow(0 4px 16px rgba(255,215,0,.5));transform:scale(1.04); }
            #harem-custom-navbar .nl-text {
                color:#FFD700;font-family:'Segoe UI',Arial,sans-serif;
                font-size:22px;font-weight:700;letter-spacing:2px;
                padding:8px 16px;border-radius:8px;transition:background .2s;
            }
            #harem-custom-navbar .nl-text:hover { background:rgba(255,215,0,.1); }

            section.dashboard-content,.dashboard-content.container-fluid {
                padding-left:80px!important;padding-right:80px!important;padding-top:24px!important;
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

            .adm-hdr { background:#252525;padding:18px 28px;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;flex-shrink:0; }
            .adm-hdr h3 { margin:0;font-size:19px;color:#FFD700;font-weight:600; }
            .adm-close { cursor:pointer;font-size:24px;color:#888;transition:color .2s;line-height:1; }
            .adm-close:hover { color:#fff; }

            .adm-tabs { display:flex;background:#1f1f1f;border-bottom:1px solid #333;flex-shrink:0; }
            .adm-tab { padding:11px 20px;cursor:pointer;color:#888;font-size:13px;font-weight:500;border-bottom:2px solid transparent;transition:color .2s,border-color .2s;user-select:none; }
            .adm-tab:hover { color:#ccc; }
            .adm-tab.active { color:#FFD700;border-bottom-color:#FFD700; }

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
            #harem-admin-modal input:focus { border-color:#FFD700;outline:none; }

            .sc {
                display:flex;align-items:center;gap:12px;background:#252525;padding:12px 14px;
                border-radius:10px;margin-bottom:8px;border:1px solid #333;
                cursor:grab;transition:background .15s,border-color .15s;user-select:none;
            }
            .sc:hover { background:#2d2d2d; }
            .sc.dot { border-top:2px solid #FFD700; }
            .dh { color:#555;font-size:18px;cursor:grab;flex-shrink:0; }
            .sc-lbl { flex:1;font-size:14px;color:#e0e0e0; }

            .tgl { position:relative;width:42px;height:22px;flex-shrink:0; }
            .tgl input { display:none; }
            .ts { position:absolute;inset:0;background:#444;border-radius:22px;cursor:pointer;transition:background .2s; }
            .ts::before { content:'';position:absolute;width:16px;height:16px;background:#fff;border-radius:50%;top:3px;left:3px;transition:transform .2s; }
            .tgl input:checked+.ts { background:#FFD700; }
            .tgl input:checked+.ts::before { transform:translateX(20px); }

            .rsg { margin-bottom:18px; }
            .rsg-ttl { font-size:11px;color:#FFD700;font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;padding:4px 0;border-bottom:1px solid #333; }
            .rc {
                display:flex;align-items:center;gap:10px;background:#252525;padding:10px 14px;
                border-radius:8px;margin-bottom:6px;border:1px solid #333;
                cursor:grab;user-select:none;transition:background .15s,border-color .15s;
            }
            .rc:hover { background:#2d2d2d; }
            .rc.dot { border-top:2px solid #FFD700; }
            .rc-lbl { flex:1;font-size:13px;color:#e0e0e0; }

            .apg { display:grid;grid-template-columns:1fr 1fr;gap:10px; }
            .api { background:#252525;padding:13px;border-radius:10px;border:1px solid #333; }
            .apn { font-weight:600;color:#fff;margin-bottom:8px;display:block;font-size:12px; }
            .og { display:flex;gap:8px; }

            .adm-ftr { padding:16px 28px;background:#252525;border-top:1px solid #333;display:flex;gap:10px;justify-content:flex-end;flex-shrink:0; }
            .hb { padding:10px 22px;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:13px;transition:opacity .2s,transform .1s; }
            .hb:hover { opacity:.9; }
            .hb:active { transform:scale(.98); }
            .hb-p { background:#FFD700;color:#000; }
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
            return {
                logoUrl: parsed.logoUrl || '',
                logoLink: parsed.logoLink || '',
                prices: parsed.prices || {},
                hiddenRows: parsed.hiddenRows || {},
                rowOrder: parsed.rowOrder || {},
                visibility: parsed.visibility || {}
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
        const a = document.createElement('a');
        a.className = 'nl';
        a.href = 'javascript:void(0)';
        a.title = 'Ayarlari Ac';
        a.addEventListener('click', e => { e.preventDefault(); openModal(); });
        buildLogoEl(a);
        nav.appendChild(a);
        document.body.insertBefore(nav, document.body.firstChild);
    }

    function buildLogoEl(link) {
        link.innerHTML = '';
        if (config.logoUrl) {
            const img = document.createElement('img');
            img.className = 'nl-img';
            img.src = config.logoUrl;
            img.alt = 'Logo';
            link.appendChild(img);
        } else {
            const svgEl = document.querySelector('header svg#logo, .header svg#logo');
            if (svgEl) {
                const clone = svgEl.cloneNode(true);
                clone.style.cssText = 'width:50px;height:50px;fill:#FFD700;';
                link.appendChild(clone);
            } else {
                const span = document.createElement('span');
                span.className = 'nl-text';
                span.textContent = '\u2736 HAREM ALTIN';
                link.appendChild(span);
            }
        }
    }

    /* ───────────── VISIBILITY ───────────── */
    function getBoxName(box) {
        // Önce standart .head .title icinden aramayi dener (textContent sayfayı dondurmaz)
        let t = box.querySelector('.head .title');
        let titleText = t ? t.textContent.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim() : '';

        // Eger title bulunduysa dondur, yoksa ozel box'lari kontrol et
        if (titleText) return titleText;

        // Cevirici ve Grafik icin fallback kontroller
        if (box.querySelector('.translate') || box.querySelector('.tabTranslate')) return 'Çevirici';
        if (box.querySelector('.chart-container')) return 'Grafik';

        return null;
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
            const nc = row.querySelector('td:first-child');
            if (!nc) return;
            // innerText taranmasi anlik reflow/render'a sebep olup titremeye yol acar.
            const rawName = nc.textContent.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
            let name = nc.textContent.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();

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
            const nc = row.querySelector('td:first-child');
            if (nc) {
                let name = nc.textContent.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim().replace(/\\s+/g, '');
                sarrafNames.add(name);
            }
        });

        altinBox.querySelectorAll('table tbody tr').forEach(row => {
            const nc = row.querySelector('td:first-child');
            if (nc) {
                let name = nc.textContent.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim().replace(/\\s+/g, '');
                if (sarrafNames.has(name)) {
                    row.remove();
                }
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
                    const nc = r.querySelector('td:first-child');
                    if (nc) {
                        // textContent ile hizli okuma (flicker yapmamasi icin innerText kullanmiyoruz)
                        const rawName = nc.textContent.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
                        // isimleri boşlukları silerek eşleştir
                        nameMap[rawName.replace(/\\s+/g, '')] = r;
                    }
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
                const nc = row.querySelector('td:first-child');
                if (nc) {
                    names.push(nc.textContent.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim());
                }
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
  <h3>&#9881;&#65039; Panel Ayarlari</h3>
  <span class="adm-close" id="adm-x">&times;</span>
</div>
<div class="adm-tabs">
  <div class="adm-tab active" data-tab="sections">&#128203; Bolumler</div>
  <div class="adm-tab" data-tab="rows">&#128200; Satirlar</div>
  <div class="adm-tab" data-tab="logo">&#128444; Logo</div>
  <div class="adm-tab" data-tab="prices">&#128176; Fiyatlar</div>
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
    <span class="fl">Logo URL</span>
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
                const nc = row.querySelector('td:first-child');
                if (!nc) return;
                // Ekranda okunabilir, ayni zamanda DOM'da da ayni okunan format
                const name = nc.textContent.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();

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
                const nc = r.querySelector('td:first-child');
                if (!nc) return;
                const n = nc.textContent.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
                if (n.replace(/\\s+/g, '') === srcName.replace(/\\s+/g, '')) sr = r;
                if (n.replace(/\\s+/g, '') === dstName.replace(/\\s+/g, '')) dr = r;
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
            const nc = row.querySelector('td:first-child');
            if (!nc) return;
            const name = nc.textContent.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
            if (!name || seen.has(name)) return;
            seen.add(name);
            const c = config.prices[name] || { buyOffset: 0, sellOffset: 0 };
            const item = document.createElement('div');
            item.className = 'api';
            item.dataset.n = name;
            item.innerHTML = `
<span class="apn">${name}</span>
<div class="og">
  <div style="flex:1"><span class="fl">Alis Farki</span><input type="number" class="bo" value="${c.buyOffset}" step="0.01"></div>
  <div style="flex:1"><span class="fl">Satis Farki</span><input type="number" class="so" value="${c.sellOffset}" step="0.01"></div>
</div>`;
            el.appendChild(item);
        });
    }

    function loadAdminValues() {
        const lu = document.getElementById('adm-logo-url');
        const ll = document.getElementById('adm-logo-link');
        if (lu) lu.value = config.logoUrl || '';
        if (ll) ll.value = config.logoLink || '';
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
        // Collect current row order from admin list
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

        // Fiyatlar
        config.prices = {};
        document.querySelectorAll('.api').forEach(item => {
            const name = item.dataset.n;
            const buy = parseFloat(item.querySelector('.bo').value) || 0;
            const sell = parseFloat(item.querySelector('.so').value) || 0;
            if (buy !== 0 || sell !== 0) config.prices[name] = { buyOffset: buy, sellOffset: sell, type: 'fixed' };
        });

        saveConfig();
        closeModal();

        // Apply immediately without page reload
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
                const nc = row.querySelector('td:first-child');
                if (!nc) return;

                // Hızlı okuma içi textContent
                const rawName = nc.textContent.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
                const safeDom = rawName.replace(/\\s+/g, '');

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
        // Anında uygula (Ekran titremesi / görünüp kaybolmayı engeller)
        applyVisibility();
        applyRowVisibility();

        // Daha ağır işlemleri 300ms debounce ile yap
        if (debTimer) clearTimeout(debTimer);
        debTimer = setTimeout(() => {
            removeDuplicateRows();
            applyPriceOffsets();
        }, 300);
    });

    function startObserver() {
        const target = document.querySelector('.dashboard-grid');
        if (target) {
            observer.disconnect();
            observer.observe(target, { childList: true, subtree: true, characterData: true });
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
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

})();
