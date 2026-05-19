# Japan Smoking Map 🇯🇵🚬

Japonya'daki sigara içme alanlarını ve sigara içilebilen kafeleri haritada
gösteren, konumundan en yakın noktaya yürüyüş rotası çıkartabilen bir Next.js
uygulaması.

## Özellikler

- Tokyo, Osaka ve Kyoto için seçilmiş POI listesi (`data/spots.ts`)
- Açık/kapalı alan ve şehir filtreleri, arama
- Tarayıcı geolokasyonu ile "konumumu kullan"
- OSRM üzerinden ücretsiz yürüyüş rotası ve süre / mesafe bilgisi
- OpenStreetMap karoları – API anahtarı gerektirmez

## Yerel çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda http://localhost:3000 adresini aç.

## Vercel'e deploy

1. Repoyu GitHub'a push'la (bu repoda halihazırda yapılıyor).
2. https://vercel.com/new üzerinden "Import Git Repository" → repoyu seç.
3. Framework otomatik olarak Next.js algılanır, ortam değişkenine gerek yok.
4. Deploy'a bas.

## Veri sorumluluğu

Veriler topluluk kaynaklı ve elle derlenmiştir. Japonya'da kurallar
sıklıkla değişir; her noktayı yerinde doğrulamak iyi olur.
