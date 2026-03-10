# Uygulama Planı: Harem Altın Özelleştirme Sistemi

Bu proje, Harem Altın canlı piyasa sayfasını (canlipiyasalar.haremaltin.com) özelleştirmek için geliştirilecek bir tarayıcı eklentisi ve sunucu tabanlı (proxy) çözümü kapsar.

## Hedefler
1.  **Logo Değişimi**: Sitenin sol üstündeki logonun kullanıcı tarafından belirlenen bir görselle değiştirilmesi.
2.  **Fiyat Manipülasyonu**: Canlı veri akışı devam ederken, belirli ürünlerin fiyatlarına (Alış/Satış) manuel offset (ekleme/çıkarma) uygulanması.
3.  **Yönetim Paneli**: Tüm bu ayarların yönetileceği, sayfa içine gömülü bir admin paneli.
4.  **Paylaşılabilir Link**: Eklenti kurulumu gerektirmeyen, müşterilerle paylaşılabilecek ve özelleştirmeleri içeren bir web linki (Cloudflare Worker altyapısı önerilir).

## Kullanıcı İncelemesi Gerektiren Konular
> [!IMPORTANT]
> **Cloudflare Worker Kurulumu**: Sunucu tabanlı çözüm için bir Cloudflare hesabı ve Worker kurulumu gerekecektir. Bu işlem teknik bilgi gerektirse de, sağlayacağım script ile kopyala-yapıştır yapılabilecek düzeye indirilecektir.

> [!WARNING]
> **DOM Dayanıklılığı**: Hedef site (haremaltin.com) tasarımını değiştirirse, CSS seçicilerin güncellenmesi gerekebilir. Kod yapısı bu seçicileri tek bir konfigürasyon dosyasından alacak şekilde tasarlanacaktır.

## Önerilen Çözüm Mimarisi

Sistem "Çekirdek (Core)" ve "Dağıtım (Distribution)" olarak ikiye ayrılacaktır.

### 1. Çekirdek (Core JS)
Tüm mantığı barındıran tek bir JavaScript dosya seti. Hem eklenti hem de proxy çözümünde aynısı kullanılacaktır.

*   `Core.js`: Ana başlatıcı.
*   `DOMObserver.js`: Sayfa değişikliklerini izler (MutationObserver) ve fiyat tablolarını yakalar.
*   `PriceManipulator.js`: Yakalanan tablodaki değerleri, admin ayarlarıyla (Offset) işleyerek günceller.
*   `LogoManager.js`: Logoyu bulur ve değiştirir.
*   `AdminUI.js`: ekrana "Ayarlar" butonu ve panelini çizer. HTML/CSS JS içine gömülü olacaktır (Shadow DOM tercih edilebilir).
*   `StorageAdapter.js`: Verinin nereye yazılacağını belirler (Eklenti için `chrome.storage` veya `localStorage`, Proxy için `localStorage` veya sunucu tarafından inject edilen config).

### 2. Yönetim (Admin Panel)
Sayfanın sağ alt köşesinde yarı saydam bir "⚙️" ikonu olacak. Tıklandığında:
*   Logo Yükleme (URL veya Base64)
*   Logo Linki Düzenleme
*   Ürün Listesi (Sayfadan otomatik çekilen ürünler, örn: Gram Altın, Çeyrek)
*   Her ürün için "Alış Offset" ve "Satış Offset" inputları.
*   Kaydet butonu.

### 3. Dağıtım Yöntemleri

#### A. Tarayıcı Eklentisi (Chrome Extension)
*   Bir `manifest.json`, `background.js` (gerekirse) ve `content_script.js`.
*   Kullanıcı tarayıcısına kurar, kendi ekranında özelleşmiş hali görür.

#### B. Cloudflare Worker (Tavsiye Edilen Paylaşılabilir Çözüm)
*   Müşteri "ozel.sizin-domaininiz.com" adresine girer.
*   Cloudflare Worker, arka planda "canlipiyasalar.haremaltin.com" adresine istek atar.
*   Gelen HTML'i alır.
*   `<head>` içine bizim `Core.js` dosyamızı veya kod bloğumuzu enjekte eder.
*   Düzenlenmiş HTML'i müşteriye sunar.
*   Admin paneli şifre ile korunabilir veya sadece belirli query parametresi ile (?admin=true) açılabilir.

## Dosya Yapısı

### [EXTENSION]
#### [NEW] [manifest.json](file:///C:/Users/Fetih/.gemini/antigravity/brain/318f824c-2559-4d33-8538-97eb55270fc0/extension/manifest.json)
#### [NEW] [content.js](file:///C:/Users/Fetih/.gemini/antigravity/brain/318f824c-2559-4d33-8538-97eb55270fc0/extension/content.js)
#### [NEW] [styles.css](file:///C:/Users/Fetih/.gemini/antigravity/brain/318f824c-2559-4d33-8538-97eb55270fc0/extension/styles.css) (Admin panel stilleri)

### [WORKER]
#### [NEW] [worker.js](file:///C:/Users/Fetih/.gemini/antigravity/brain/318f824c-2559-4d33-8538-97eb55270fc0/worker/worker.js)

### [CORE] (Eklenti ve Worker içine gömülecek mantık)
#### [NEW] [harem_core.js](file:///C:/Users/Fetih/.gemini/antigravity/brain/318f824c-2559-4d33-8538-97eb55270fc0/core/harem_core.js)

## Doğrulama Planı

### Eklenti Testi (Manuel)
1.  Oluşturulan klasör Chrome -> Extensions -> Load Unpacked ile yüklenecek.
2.  Harem Altın sitesine gidilecek.
3.  Ayarlar butonuna basılıp bir logo URL'i girilecek -> Logo değişmeli.
4.  "Gram Altın" için Alış +10 girilecek -> Canlı fiyat 2000 ise 2010 olarak görünmeli ve arka plandaki canlı veri güncellemesinde de farkı korumalı (Örn: canlı veri 2005 olursa 2015 olmalı).

### Proxy Testi (Simülasyon)
Local ortamda çalışan bir HTML dosyası ile Harem Altın'ın HTML yapısı taklit edilip scriptin çalışıp çalışmadığı test edilecek.
Simülasyon için `mock_site.html` oluşturulacak.

### Automated Tests
Browser Subagent kullanılamadığı için testler manuel ve kullanıcı geri bildirimi ile yapılacaktır.
Kod içine `console.log` debug modları eklenecektir.
