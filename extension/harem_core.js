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
        logoBase64: '',     // Yeni: Yerel dosya için base64 logo
        prices: {},         // { 'HAS ALTIN': { buyOffset: 0, sellOffset: 0, bgColor: '', textColor: '' } }
        hiddenRows: {},
        rowOrder: {},
        visibility: {}
    };

    const DEFAULT_LOGO_B64 = 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgMTU1OSAxMDgwIiBzaGFwZS1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgdGV4dC1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiI+PHBhdGggZmlsbD0iI2RjZGNkYyIgZD0iTSA2OTMuODI4MTI1IDY5NC4xMDE1NjIgTCA2NDAuNjI1IDY5My44MjgxMjUgTCA3MTguMzM1OTM4IDY5NC4xMDE1NjIgQyA3MTcuMzg2NzE5IDY5Ni44MTI1IDcxMi4yMzgyODEgNzA2LjE2NDA2MiA3MDkuMzkwNjI1IDcxMC43Njk1MzEgQyA3MDYuMjczNDM4IDcwNS40ODQzNzUgNzAxLjkzNzUgNjk3LjQ4ODI4MSA3MDAuNDQ1MzEyIDY5My42OTUzMTIgTCA2OTYuMjQ2MDk0IDY5NC4xMDE1NjIgQyA2OTkuNjMyODEyIDY5OC45ODA0NjkgNzA0LjUxMTcxOSA3MDcuNzg5MDYyIDcwNi45NTMxMjUgNzEzLjA3NDIxOSBDIDcwNi45NTMxMjUgNzEzLjg4NjcxOSA3MDcuMDg1OTM4IDcxNC44MzU5MzggNzA3LjA4NTkzOCA3MTUuNzg1MTU2IEMgNzA3LjA4NTkzOCA3MTkuNTgyMDMxIDcwNi44MTY0MDYgNzI0LjU5Mzc1IDcwNi41NDY4NzUgNzI4LjUyNzM0NCBMIDcxMC4zMzk4NDQgNzI4LjUyNzM0NCBDIDcxMC4wNzAzMTIgNzI0LjQ2MDkzOCA3MDkuNzk2ODc1IDcxOS41ODIwMzEgNzA5Ljc5Njg3NSA3MTUuNzg1MTU2IEMgNzA5Ljc5Njg3NSA3MTQuNTY2NDA2IDcwOS43OTY4NzUgNzEzLjM0NzY1NiA3MDkuNzk2ODc1IDcxMi4zOTg0MzggQyA3MTMuNDU3MDMxIDcwNS4zNTE1NjIgNzE4LjYwOTM3NSA2OTYuMTMyODEyIDcyMC42NDA2MjUgNjkzLjgyODEyNSBaIE0gNzIwLjY0MDYyNSA2OTMuODI4MTI1ICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjZGNkY2RjIiBkPSJNIDc2Ny42MTMyODEgNjk0LjEwMTU2MiBDIDc2OC4wMTk1MzEgNjk3LjQ4ODI4MSA3NjguMDE5NTMxIDcwMy44NTkzNzUgNzY4LjAxOTUzMSA3MDkuODI0MjE5IEMgNzY4LjAxOTUzMSA3MTEuOTkyMTg4IDc2OC4wMTk1MzEgNzE0LjE2MDE1NiA3NjguMDE5NTMxIDcxNi4wNTg1OTQgQyA3NjguMDE5NTMxIDcyMy4zNzUgNzY0LjIyNjU2MiA3MjguNTI3MzQ0IDc1OC4yNjE3MTkgNzI4LjUyNzM0NCBDIDc1MS4wNzgxMjUgNzI4LjUyNzM0NCA3NDcuODI4MTI1IDcyMi45Njg3NSA3NDcuODI4MTI1IDcxNS43ODUxNTYgQyA3NDcuODI4MTI1IDcwOC40Njg3NSA3NDcuNjkxNDA2IDcwMS40MTc5NjkgNzQ4LjM2NzE4OCA2OTQuMTAxNTYyIEwgNzQ0LjU3NDIxOSA2OTQuMTAxNTYyIEMgNzQ0Ljg0Mzc1IDY5NiA3NDQuODQzNzUgNjk5LjExNzE4OCA3NDQuODQzNzUgNzAyLjc3MzQzOCBDIDt0NDQuODQzNzUgNzA2LjcwNzAzMSA3NDQuODQzNzUgNzExLjE3NTc4MSA3NDQuODQzNzUgNzE0Ljk3MjY1NiBDIDt0NDQuODQzNzUgNzI1LjI3MzQzOCA3NTAuNDAyMzQ0IDcyOS40NzI2NTYgNzU3LjE3OTY4OCA3MjkuNDcyNjU2IEMgNzY0LjA4OTg0NCA3MjkuNDcyNjU2IDc2OS4xMDU0NjkgNzI1LjQxMDE1NiA3NjkuMTA1NDY5IDcxNS4xMDkzNzUgQyA3NjkuMTA1NDY5IDcwOC4xOTUzMTIgNzY5LjEwNTQ2OSA2OTcuNzYxNzcxIDc2OS4zNzUgNjk0LjEwMTU2MiBaIE0gNzY3LjYxMzI4MSA2OTQuMTAxNTYyICIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBmaWxsPSIjZGNkY2RjIiBkPSJNIDgyMS41NjI1IDY5NC41MDc4MTIgQyA4MTkuMjU3ODEyIDcwMy41ODU5MzggODE1LjA1ODU5NCA3MTYuNDY0ODQ0IDgxMi40ODA0NjkgNzI0LjMyNDIxOSBDIDgwOS4yMzA0NjkgNzE1LjEwOTM3NSA4MDQuODkwNjI1IDcwMC4wNjI1IDgwMy41MzUxNTYgNjkzLjU1ODU5NCBMIDgwMC4wMTE3MTkgNjk0LjUwNzgxMiBDIDc5OC4zODY3MTkgNzA1Ljg5MDYyNSA3OTQuODYzMjgxIDcyNC4xODc1IDc5My4zNzEwOTQgNzI4Ljc5Njg3NSBMIDc5NS41MzkwNjIgNzI4LjUyNzM0NCBDIDc5Ni4zNTU0NjkgNzIyLjgzMjAzMSA3OTguOTI5Njg4IDcwNi4yOTY4NzUgODAwLjk2MDkzOCA2OTcuMjE4NzUgQyA4MDIuODU5Mzc1IDcwMS41NTQ2ODggODA4LjY4NzUgNzIyLjI5Mjk2OSA4MTAuMDQyOTY5IDcyOS4wNjY0MDYgTCA4MTMuMDIzNDM4IDcyOC4yNTM5MDYgQyA4MTQuNjUyMzQ0IDcyMS40NzY1NjIgODE5LjI1NzgxMiA3MDUuNDg0Mzc1IDgyMi4zNzUgNjk3LjIxODc1IEMgODIzLjczMDQ2OSA3MDEuNjkxNDA2IDgyNy4xMjEwOTQgNzIyLjQyNTc4MSA4MjcuNjYwMTU2IDcyOS4wNjY0MDYgTCA4MzEuNzI2NTYyIDcyOC41MjczNDQgQyA4MjkuMTUyMzQ0IDcyMC4xMTIxMDk0IDgyNi4zMDQ2ODggNzAxLjI4NTE1NiA4MjUuMDg1OTM4IDY5My41NTg1OTQgWiBNIDgyMS41NjI1IDY5NC41MDc4MTIgIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNkY2RjZGMiIGQ9Ik0gODgyLjAxOTUzMSA2OTUuNTg5ODQ0IEMgODc5LjU3ODEyNSA2OTQuMTAxNTYyIDg3Ni4xOTE0MDYgNjkzLjE1MjM0NCA4NzIuMjU3ODEyIDY5My4xNTIzNDQgQyA4NjcuMTA5Mzc1IDY5My4xNTIzNDQgODU0LjkxMDE1NiA2OTUuMTgzNTk0IDg1NC45MTAxNTYgNzExLjcxODc1IEMgODU0LjkxMDE1NiA3MjIuNTYyNSA4NjIuMzY3MTg4IDcyOS4zMzk4NDQgODcxLjk4ODI4MSA3MjkuMzM5ODQ0IEMgODc2LjQ2MDkzOCA3MjkuMzM5ODQ0IDg3OS40NDE0MDYgNzI4LjUyNzM0NCA4ODEuMjAzMTI1IDcyNy41NzgxMjUgTCA4ODAuNTI3MzQ0IDcyNS45NDkyMTkgQyA4NzkuMTcxODc1IDcyNy41NzgxMjUgODc2LjczMDQ2OSA3MjguNTI3MzQ0IDg3Mi44MDA3ODEgNzI4LjUyNzM0NCBDIDg2NS4zNDc2NTYgNzI4LjUyNzM0NCA4NTguNzA3MDMxIDcyMi4yOTI5NjkgODU4LjcwNzAzMSA3MTAuNjM2NzE5IEMgODU4LjcwNzAzMSA2OTguNTc0MjE5IDg2NC41MzUxNTYgNjkzLjk2NDg0NCA4NzIuMjU3ODEyIDY5My45NjQ4NDQgQyA4NzYuMzI0MjE5IDY5My45NjQ4NDQgODc4Ljc2NTYyNSA2OTUuODYzMjgxIDg4MC41MjczNDQgNjk4LjAzMTI1IFogTSA4ODIuMDE5NTMxIDY5NS41ODk4NDQgIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGZpbGw9IiNkY2RjZGMiIGQ9Ik0gOTI5Ljk3NjU2MiA2OTQuMTAxNTYyIEMgOTMwLjM4MjgxMiA2OTcuNDg4MjgxIDkzMC4zODI4MTIgNzAzLjg1OTM3NSA5MzAuMzgyODEyIDcwOS44MjQyMTkgQyA5MzAuMzgyODEyIDcxMS45OTIxODggOTMwLjM4MjgxMiA3MTQuMTYwMTU2IDkzMC4zODI4MTIgNzE2LjA1ODU5NCBDIDkzMC4zODI4MTIgNzIzLjM3NSA5MjYuNTg1OTM4IDcyOC41MjczNDQgOTIwLjYyNSA3MjguNTI3MzQ0IEMgOTEzLjQ0MTQwNiA3MjguNTI3MzQ0IDkxMC4xODc1IDcyMi45Njg3NSA5MTAuMTg3NSA3MTUuNzg1MTU2IEMgOTEwLjE4NzUgNzA4LjQ2ODc1IDkxMC4wNTA3ODEgNzAxLjQxNzk2OSA5MTAuNzMwNDY5IDY5NC4xMDE1NjIgTCA5MDYuOTMzNTk0IDY5NC4xMDE1NjIgQyA5MDcuMjA3MDMxIDY5NiA5MDcuMjA3MDMxIDY5OS4xMTcxODggOTA3LjIwNzAzMSA3MDIuNzczNDM4IEMgOTA3LjIwNzAzMSA3MDYuNzA3MDMxIDkxMC43MDcwMzEgNzExLjE3NTc4MSA5MDcuMjA3MDMxIDcxNC45NzI2NTYgQyA5MDcuMjA3MDMxIDcyNS4yNzM0MzggOTEyLjc2MTcxOSA3MjkuNDcyNjU2IDkxOS41MzkwNjIgNzI5LjQ3MjY1NiBDIDkyNi40NTMxMjUgNzI5LjQ3MjY1NiA5MzEuNDY0ODQ0IDcyNS40MTAxNTYgOTMxLjQ2NDg0NCA3MTUuMTA5Mzc1IEMgOTMxLjQ2NDg0NCA3MDguMTk1MzEyIDkzMS40NjQ4NDQgNjk3Ljc2MTcxOSA5MzEuNzM4MjgxIDY5NC4xMDE1NjIgWiBNIDkyOS45NzY1NjIgNjk0LjEwMTU2MiAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2RjZGNkYyIgZD0iTSA5NTguNzIyNjU2IDcyOC41MjczNDQgQyA5NjIuMTEzMjgxIDcyOC41MjczNDQgOTY0LjY4NzUgNzI4LjUyNzM0NCA5NjYuOTkyMTg4IDcyOC41MjczNDQgQyA5NzAuMjQyMTg4IDcyOC41MjczNDQgOTcyLjk1MzEyNSA3MjguNTI3MzQ0IDk3Ni4wNzAzMTIgNzI4LjY2MDE1NiBMIDk3Ni42MTMyODEgNzI2LjQ5MjE4OCBDIDk3Mi45NTMxMjUgNzI3LjQ0MTQwNiA5NjkuNzAzMTI1IDcyNy43MTA5MzggOTY1Ljc2OTUzMSA3MjcuNzEwOTM4IEMgOTY0LjY4NzUgNzI3LjcxMDkzOCA5NjMuNDY4NzUgNzI3LjcxMDkzOCA5NjIuMjQ2MDk0IDcyNy43MTA5MzggQyA5NjIuMTEzMjgxIDcyNC4xODc1IDk2MS45NzY1NjIgNzE4LjYzMjgxMiA5NjEuOTc2NTYyIDcxMi44MDQ2ODggQyA5NjEuOTc2NTYyIDcwNi4wMjczNDQgOTYyLjExMzI4MSA2OTguOTgwNDY5IDk2Mi4zODI4MTIgNjk0LjEwMTU2MiBMIDk1OC43MjI2NTYgNjk0LjEwMTU2MiBDIDk1OC45OTYwOTQgNjk4Ljk4MDQ2OSA5NTkuMTI4OTA2IDcwNi4yOTY4NzUgOTU5LjEyODkwNiA3MTMuMDc0MjE5IEMgOTU5LjEyODkwNiA3MTkuODUxNTYyIDk1OC45OTYwOTQgNzI2LjA4NTkzOCA5NTguNzIyNjU2IDcyOC41MjczNDQgWiBNIDk1OC43MjI2NTYgNzI4LjUyNzM0NCAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2RjZGNkYyIgZD0iTSAxMDIzLjcxNDg0NCA2OTQuMTAxNTYyIEMgMTAyNC4xMjEwOTQgNjk3LjQ4ODI4MSAxMDI0LjEyMTA5NCA3MDMuODU5Mzc1IDEwMjQuMTIxMDk0IDcwOS44MjQyMTkgQyAxMDI0LjEyMTA5NCA3MTEuOTkyMTg4IDEwMjQuMTIxMDk0IDcxNC4xNjAxNTYgMTAyNC4xMjEwOTQgNzE2LjA1ODU5NCBDIDEwMjQuMTIxMDk0IDcyMy4zNzUgMTAyMC4zMjgxMjUgNzI4LjUyNzM0NCAxMDE0LjM2MzI4MSA3MjguNTI3MzQ0IEMgMTAwNy4xNzk2ODggNzI4LjUyNzM0NCAxMDAzLjkyOTY4OCA3MjIuOTY4NzUgMTAwMy45Mjk2ODggNzE1Ljc4NTE1NiBDIDEwMDMuOTI5Njg4IDcwOC40Njg3NSAxMDAzLjc5Mjk2OSA3MDEuNDE3OTY5IDEwMDQuNDY4NzUgNjk0LjEwMTU2MiBMIDEwMDAuNjc1NzgxIDY5NC4xMDE1NjIgQyAxMDAwLjk0NTMxMiA2OTYgMTAwMC45NDUzMTIgNjk5LjExNzE4OCAxMDAwLjk0NTMxMiA3MDIuNzczNDM4IEMgMTAwMC45NDUzMTIgNzA2LjcwNzAzMSAxMDAwLjk0NTMxMiA3MTEuMTc1NzgxIDEwMDAuOTQ1MxEyIDcxNC45NzI2NTYgQyAxMDAwLjk0NTMxMiA3MjUuMjczNDM4IDEwMDYuNTAzOTA2IDcyOS40NzI2NTYgMTAxMy4yODEyNSA3MjkuNDcyNjU2IEMgMTAyMC4xOTE0MDYgNzI5LjQ3MjY1NiAxMDI1LjIwNzAzMSA3MjUuNDEwMTU2IDEwMjUuMjA3MDMxIDcxNS4xMDkzNzUgQyAxMDI1LjIwNzAzMSA3MDguMTk1MzEyIDEwMjUuMjA3MDMxIDY5Ny43NjE3MTkgMTAyNS40NzY1NjIgNjk0LjEwMTU2MiBaIE0gMTAyMy43MTQ4NDQgNjk0LjEwMTU2MiAiIGZpbGwtb3BhY2l0eT0iMSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZmlsbD0iI2RjZGNkYyIgZD0iTSAxMDUyLjQ1NzAzMSA2OTQuMTAxNTYyIEMgMTA1Mi41ODk4NDQgNzAxLjE0ODQzOCAxMDUyLjcyNjU2MiA3MDYuNzA3MDMxIDEwNTIuNzI2NTYyIDcxMi4yNjE3MTkgQyAxMDUyLjcyNjU2MiA3MTcuNDE0MDYyIDEwNTIuNTg5ODQ0IDcyMi41NjI1IDEwNTIuNDU3MDMxIDcyOC41MjczNDQgTCAxMDU1LjcwNzAzMSA3MjguNTI3MzQ0IEMgMTA1NS40Mzc1IDcyMi40MjU3ODEgMTA1NS4zMDA3ODEgNzE3LjI3NzM0NCAxMDU1LjMwMDc4MSA3MTIuMTI1IEMgMTA1NS4zMDA3ODEgNzA2LjU3MDMxMiAxMDU1LjQzNzUgNzAxLjAxMTcxOSAxMDU1LjcwNzAzMSA2OTQuMTAxNTYyIFogTSAxMDU3LjMzNTkzOCA3MTAuNSBDIDEwNTcuNDY4NzUgNzEwLjUgMTA1OC42OTE0MDYgNzEwLjM2MzI4MSAxMDU5LjYzNjcxOSA3MTAuNjM2NzE5IEMgMTA2NS4wNTg1OTQgNzExLjcxODc1IDEwNjkuODA0Njg4IDcxOC4wODk4NDQgMTA3MS4wMjM0MzggNzI4Ljc5Njg3NSBMIDEwNzUuMjI2NTYyIDcyOC4zOTA2MjUgQyAxMDc0LjE0MDYyNSA3MjQuMzI0MjE5IDEwNzAuNjE3MTg4IDcxMS45OTIxODggMTA2MC45OTIxODggNzEwLjIzMDQ2OSBDIDEwNjguNDQ5MjE5IDcwOS45NTcwMzEgMTA3Mi45MjE4NzUgNzAxLjU1NDY4OCAxMDU5LjM2NzE4OSA2OTQuMTAxNTYyIEwgMTA2OS41MzEyNSA2OTQuMTAxNTYyIEMgMTA3MC40ODA0NjkgNzAyLjA5NzY1NiAxMDY2LjY4NzUgNzA5LjgyNDIxOSAxMDU5LjM2NzE4OCA3MDkuNjg3NSBDIDEwNTguODI0MjE5IDcwOS42ODc1IDEwNTguMTQ4NDM4IDcwOS42ODc1IDEwNTcuNDY4NzUgNzA5LjU1MDc4MSBaIE0gMTA1Ny4zMzU5MzggNzEwLjUgIiBmaWxsLW9wYWNpdHk9IjEiIGZpbGwtcnVsZT0ibm9uemVybyIvPjwvc3ZnPg==';

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
                logoBase64: parsed.logoBase64 || '',
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
            // "fetih-logo.svg" varsayılan (B64 icinde)
            const img = document.createElement('img');
            img.className = 'nl-img';
            img.src = 'data:image/svg+xml;base64,' + DEFAULT_LOGO_B64;
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
            const rawName = nc.textContent.replace(/\s+/g, ' ').trim();
            let name = nc.textContent.replace(/\s+/g, ' ').trim();

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
                        if (pc.bgColor) row.style.backgroundColor = pc.bgColor;
                        else row.style.removeProperty('background-color');

                        if (pc.textColor) row.style.color = pc.textColor;
                        else row.style.removeProperty('color');
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
            const nc = row.querySelector('td:first-child');
            if (nc) {
                let name = nc.textContent.replace(/\s+/g, ' ').trim().replace(/\s+/g, '');
                sarrafNames.add(name);
            }
        });

        altinBox.querySelectorAll('table tbody tr').forEach(row => {
            const nc = row.querySelector('td:first-child');
            if (nc) {
                let name = nc.textContent.replace(/\s+/g, ' ').trim().replace(/\s+/g, '');
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
                        const rawName = nc.textContent.replace(/\s+/g, ' ').trim();
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
                    names.push(nc.textContent.replace(/\s+/g, ' ').trim());
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
                const name = nc.textContent.replace(/\s+/g, ' ').trim();

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
                const n = nc.textContent.replace(/\s+/g, ' ').trim();
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
            const c = config.prices[name] || { buyOffset: 0, sellOffset: 0, bgColor: '', textColor: '' };
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
    <div style="flex:1"><span class="fl">Arka Plan</span><input type="color" class="bg-col" value="${c.bgColor || '#1a1a1a'}"></div>
    <div style="flex:1"><span class="fl">Yazi Rengi</span><input type="color" class="txt-col" value="${c.textColor || '#e0e0e0'}"></div>
    <div style="width:40px;display:flex;align-items:center;justify-content:center;">
       <button class="hb hb-s" style="padding:4px 8px;font-size:10px;" onclick="this.parentNode.parentNode.querySelectorAll('input[type=color]').forEach(i=>i.value=i.defaultValue);return false;">X</button>
    </div>
  </div>
</div>`;
            el.appendChild(item);
        });
    }

    function loadAdminValues() {
        const lu = document.getElementById('adm-logo-url');
        const ll = document.getElementById('adm-logo-link');
        const lpv = document.getElementById('adm-logo-preview');

        if (lu) lu.value = config.logoUrl || '';
        if (ll) ll.value = config.logoLink || '';

        if (lpv) {
            lpv.innerHTML = '';
            const testSrc = config.logoBase64 || config.logoUrl || ('data:image/svg+xml;base64,' + DEFAULT_LOGO_B64);
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

        // Fiyatlar & Renkler
        config.prices = {};
        document.querySelectorAll('.api').forEach(item => {
            const name = item.dataset.n;
            const buy = parseFloat(item.querySelector('.bo').value) || 0;
            const sell = parseFloat(item.querySelector('.so').value) || 0;
            const bg = item.querySelector('.bg-col').value;
            const txt = item.querySelector('.txt-col').value;

            // Default olmayan renkleri veya farklari kaydet
            if (buy !== 0 || sell !== 0 || bg !== '#1a1a1a' || txt !== '#e0e0e0') {
                config.prices[name] = {
                    buyOffset: buy,
                    sellOffset: sell,
                    bgColor: bg === '#1a1a1a' ? '' : bg,
                    textColor: txt === '#e0e0e0' ? '' : txt,
                    type: 'fixed'
                };
            }
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
                const rawName = nc.textContent.replace(/\s+/g, ' ').trim();
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
