# 沖繩家庭旅行動態面板 — 修正版實作計畫

## 專案目標

為一家四口（2大2小，幼童皆未滿6歲）的四天三夜沖繩旅行打造一個 PWA 網頁儀表板。Day 1-3 自駕，Day 4 單軌電車。核心理念是「安靜的助手」，不催促、不施壓，功能直覺、大按鈕、支援單手操作。

---

## 專案架構與檔案

- **根目錄：** `C:\Users\yusei\OneDrive\桌面\我的專案\okinawa-family-dashboard`
- **結構：**
  - `index.html`, `manifest.json`, `sw.js`
  - `css/style.css`
  - `js/app.js`, `js/weather.js`, `js/places.js`, `js/spots.js`, `js/exchange.js`, `js/emergency.js`, `js/notify.js`
  - `data/spots.json`, `data/emergency.json`, `data/transport.json`, `data/weather.json`, `data/places.json`
  - `images/icons/` (包含 192x192 及 512x512 PWA 佔位圖標)
  - `pages/weather.html`, `pages/exchange.html`, `pages/spots.html`, `pages/spot-detail.html`, `pages/emergency.html`, `pages/day4-transport.html`

---

## 核心設計原則

1. **視覺系統：**
   - 主色：海洋藍 `#0077BE`
   - 強調：珊瑚橙 `#FF6B6B`
   - 背景：淺灰白 `#F5F5F5`
   - 文字：深灰 `#333333`
   - 狀態色：綠色 `#4CAF50`，橙色 `#FF9800`，紅色 `#F44336`
2. **無壓力互動：**
   - 所有的推播都是建議。格式為「一句話 + 兩個按鈕 [看一下] [不用了]」。
   - 使用引導式語氣（如：要不要...、順便看一下...）。
   - 按下「不用了」即隱藏且短期內不重複騷擾。
3. **介面友善：**
   - 全程手機大小設計（Mobile-first）。
   - 按鈕極大化，確保爸爸開車導航時，媽媽單手抱小孩也能輕鬆操作。
   - 包含小兒科明確標示，解決父母帶幼童最大的痛點。
   - 動態邏輯：例如 Day 4 (5/11) 找加油站功能自動隱藏。

---

## 開發與測試計畫

1. **靜態資源與 HTML/CSS：** 建立基礎的視覺皮囊，確保 PWA 清單與快取邏輯正確（包含準備好 Icons）。
2. **模擬資料 (Mock Data)：** 
   - 完整建立 JSON，模擬實體 API 回傳，供後續快速串接 Google API 及 OpenWeatherMap。
   - `data/places.json` 必須涵蓋：Day 2 北部路線（道の駅許田周邊、古宇利島橋頭）、Day 3 中部路線（兒童王國、AEON 北谷附近），以及 Day 3 おもろまち 還車前的加油站。
3. **動態邏輯與渲染：** 將 `data/*.json` 動態讀取打入對應的 HTML (例如 `pages/day4-transport.html` 必須去讀取 `data/transport.json` 渲染內容，不可寫死)。包含日期過濾器（加油站隱藏邏輯）、匯率換算、定位模擬等功能。
4. **驗證：**
   - **裝置模擬：** 使用 Chrome DevTools (iPhone 尺寸) 確認佈局防呆且按鈕易用。
   - **離線測試：** 關閉網路，確認 Service Worker 能提供離線存取，這對沖繩網路不佳的區域極度重要。
   - **推播情境：** 開發環境下，透過按鈕或主控台手動觸發 `notify.js`，確認視覺和互動順暢自然。

## 出發前最終驗收
此階段獨立於開發階段之外，在旅行前一週進行。
因為 iOS Safari 的 PWA 行為與 Chrome 模擬器有差異，必須在真實 iPhone 上安裝到主畫面，實際切換 Wi-Fi／行動數據／離線各測一次。
