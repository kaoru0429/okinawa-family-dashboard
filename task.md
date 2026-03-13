# 沖繩家庭旅行動態面板 — 嚴謹版任務清單

## 說明規則

* ✅ = 已完成並通過驗收標準
* 🔲 = 待執行
* 每個項目皆附「通過標準」，打勾前必須對照確認

---

## Phase 0：開發前置決策（不可跳過）

* ✅ **確認旅行日期映射寫入設定檔**

  * 通過標準：專案內有一個明確的設定值 `TRIP_START_DATE = "2025-05-08"`，所有日期判斷邏輯皆引用此變數，不得各自硬寫日期字串
* ✅ **確認 Service Worker 策略為「出發前全量 precache，旅行中 Cache First」**

  * 通過標準：`sw.js` 的 precache 清單列出所有需離線存取的資源（HTML × 9、CSS、JS × 9、JSON × 5、Icons），不做動態快取以降低複雜度
* ✅ **確認推播冷卻時間定為 30 分鐘，並以 `localStorage` 存時間戳**

  * 通過標準：`notify.js` 內有 `localStorage.setItem('notify_dismissed_[id]', Date.now())` 的寫入，以及讀取後比對是否超過 1800000ms 的判斷

---

## Phase 1：專案初始化與結構設定

* ✅ 建立完整檔案結構（`images/icons/`、`data/`、`pages/`、`css/`、`js/`）

  * 通過標準：執行 `find . -type d` 可見所有資料夾，無遺漏
* ✅ 撰寫基礎 HTML 架構與 CSS 設計系統

  * 通過標準：CSS 變數正確定義 `--color-primary: #0077BE`、`--color-accent: #FF6B6B` 等 5 個色彩變數；所有元件引用變數而非直接寫色碼
* ✅ 引入 Noto Sans JP 字型

  * 通過標準：所有頁面 `font-family` 包含 `'Noto Sans JP'`，在 Android / iOS 兩平台日文字元顯示無亂碼
* ✅ 全域 CSS 加入 `touch-action: manipulation`

  * 通過標準：按鈕與可點擊元素均有此屬性，iOS Safari 點擊無明顯延遲
* ✅ 所有按鈕最小高度設為 56px

  * 通過標準：DevTools 元素面板量測任一按鈕，computed height ≥ 56px
* ✅ 設定 `manifest.json`（含 `start_url`、`scope`、`display: standalone`）

  * 通過標準：Chrome DevTools → Application → Manifest 無警告；`start_url` 與 `scope` 路徑一致
* ✅ 設定 `sw.js` precache 清單（依 Phase 0 決策）

  * 通過標準：DevTools → Application → Cache Storage 可見所有預期資源已快取
* ✅ 生成 PWA icon（192×192 與 512×512 PNG）

  * 通過標準：`manifest.json` 的 `icons` 欄位指向實際存在的檔案，DevTools 無 404

---

## Phase 2：資料模型建立（JSON Mock Data）

所有 JSON 必須：(a) 通過 `JSON.parse` 驗證，(b) 欄位結構與對應 JS 讀取邏輯一致

* ✅ 建立 `data/spots.json`

  * 必含欄位：`id`、`name`（日文）、`nameZh`（中文）、`day`、`type`、`parking`、`ticketJPY`、`childFriendly`（1–3）、`nursingRoom`（boolean）、`easyPlayTip`
  * 通過標準：涵蓋 Day 1–4 所有景點，`childFriendly` 無空值
* ✅ 建立 `data/places.json`

  * 必含路線：Day 2 北部（道の駅許田周邊、古宇利島橋頭）、Day 3 中部（兒童王國、AEON 北谷）、Day 3 おもろまち 還車前加油站
  * 必含欄位：`id`、`name`、`type`（toilet / convenience / pharmacy / gas）、`lat`、`lng`、`address`、`hours`
  * 通過標準：加油站資料的 `day` 欄位標記 `hideOnDay: 4`，供隱藏邏輯引用
* ✅ 建立 `data/emergency.json`

  * 必含欄位：醫院名稱、電話、地址、`hasPediatrics`（boolean）、`is24h`（boolean）；藥局清單；常用醫療日語（含羅馬拼音）
  * 通過標準：至少一間醫院的 `hasPediatrics: true`，且在 `emergency.html` 中有對應紅色標籤渲染
* ✅ 建立 `data/transport.json`

  * 必含：Day 4 單軌電車各站名（日文+中文）、票價、搭乘步驟（step-by-step array）、計程車備案（預估費用）
  * 通過標準：`day4-transport.html` 透過 `fetch('data/transport.json')` 讀取並渲染，Network 面板可見該請求；**資料不得寫死在 HTML**
* ✅ 建立 `data/weather.json`

  * 格式須模擬 OpenWeatherMap 回傳結構（含 `main.temp`、`weather[0].description`、`pop` 降雨機率、逐3小時 `list` 陣列）
  * 通過標準：`weather.js` 讀取後渲染正確，修改 JSON 數值後重整頁面結果跟著變

---

## Phase 3：核心 UI 與首頁

* ✅ 實作 `index.html` 頂部天氣面板

  * 通過標準：顯示當前位置名稱（mock）、溫度、一句話建議，資料來自 `weather.json`，非寫死
* ✅ 實作 `index.html` 6個大型導航按鈕

  * 通過標準：按鈕文字清晰，icon 與功能一致；在 iPhone SE（375px）視圖中每排最多 2 個，無溢出
* ✅ 實作「找加油站」按鈕的日期自動隱藏邏輯

  * 通過標準：

    * 將系統時間改為 2025-05-10（Day 3），按鈕可見
    * 將系統時間改為 2025-05-11（Day 4），按鈕消失且不佔空間（`display: none` 而非透明）
    * 日期判斷基於 `TRIP_START_DATE` 設定值，不寫死 `"2025-05-11"`

---

## Phase 4：子頁面開發

每個子頁面須滿足：(a) 資料由 JS 動態渲染，(b) 無 JS 時至少顯示靜態提示文字，不得白畫面

* ✅ 詳細天氣頁面 (`pages/weather.html`)

  * 通過標準：顯示 09:00, 12:00 等時分的天氣圖示與溫度；「穿衣建議」欄位根據 `pop` 降雨機率動態加入「建議帶傘」字樣
* ✅ 匯率換算頁面 (`pages/exchange.html`)

  * 通過標準：輸入 1000 顯示約 2xx TWD（根據 0.211 換算）；輸入非數字或空值時，結果處顯示「請輸入金額」而非 0
* ✅ 景點指南列表 (`pages/spots.html`)

  * 通過標準：從 `spots.json` 讀取並渲染。需顯示 `childFriendly` 的星級評分
* ✅ 景點指南詳情 (`pages/spot-detail.html`)

  * 通過標準：顯示哺乳室/停車資訊；導航按鈕點擊後開啟 Google Maps，網址參數必須包含該景點的座標 `{lat},{lng}`，而非純名稱
* ✅ 緊急醫療頁面 (`pages/emergency.html`)

  * 通過標準：

    * 醫院列表：有「小児科」標籤（符合 `hasPediatrics`）與「24H」標籤（符合 `is24h`）
    * 對話卡片：以卡片形式呈現「哪裡痛？」等中日對照與羅馬拼音
* ✅ Day 4 交通指南頁面 (`pages/day4-transport.html`)

  * 通過標準：呈現單軌電車各站名；下方「備案」區塊明確標示計程車預估費用來自 `transport.json` 的 fetch 請求；step-by-step 步驟由 JSON array 渲染（修改 JSON 步驟數，頁面步驟數跟著變）；計程車備案費用顯示正確

---

## ✅ Phase 5：JavaScript 邏輯

* ✅ `app.js` — 日期映射與核心邏輯

  * 通過標準：`getCurrentDay()` 函式回傳 1–4 的整數，基於 `TRIP_START_DATE`；旅行範圍外的日期（5/7 或 5/12）回傳 `null` 並有對應的 fallback 處理；PWA Service Worker 註冊成功（DevTools → Application → Service Workers 顯示 activated）
* ✅ `weather.js`

  * 通過標準：fetch `data/weather.json` 成功，渲染穿搭建議時根據 `pop > 50` 顯示「建議帶傘」
* ✅ 建立 `js/geo.js` 地理計算工具

  * 通過標準：包含 Haversine 公式函數；實作 `GeoHelper.distanceTo(lat, lng)` 供其他模組呼叫
* ✅ 實作「找設施」由近到遠排序

  * 通過標準：`places.js` 加載 `places.json` 後，調用 `GeoHelper` 測距並執行 `sort()`；頁面清單首項應為距離最近者
* ✅ 設施列表顯示距離標籤

  * 通過標準：每個地點標題旁顯示「約 0.5km」或「約 300m」字樣；若無定位權限則隱藏該標籤，不顯示 NaN
* ✅ `places.js`

  * 通過標準：手動修改 mock 定位座標後，距離標籤數值跟著重新排序；Haversine 公式計算結果誤差 < 100m（可與 Google Maps 量測比對）
* ✅ `spots.js`

  * 通過標準：景點詳情頁的導航連結格式為 `https://maps.google.com/?q={lat},{lng}`，帶入 spots.json 的正確座標
* ✅ `exchange.js`

  * 通過標準：匯率常數定義於檔案頂部；輸入非數字時顯示提示而非 NaN
* ✅ `emergency.js`

  * 通過標準：渲染函式從 `emergency.json` 讀取，`hasPediatrics: true` 的項目 class 包含 `has-pediatrics`，CSS 對應紅色樣式
* ✅ 實作「溫和推播」模擬系統 (`js/notify.js`)

  * 通過標準：推播以底部卡片形式浮出，非系統 `alert()`；包含一個「開發者測試面板」可在首頁直接點擊模擬情境
* ✅ 實作推播冷卻機制 (Cooldown)

  * 通過標準：點擊「不用了」後，`localStorage` 存入時間戳；30 分鐘內即使符合觸發條件，該 ID 的推播也不得再次出現
* ✅ 實作「加油提醒」自動導向

  * 通過標準：模擬旅行時間為 Day 3 15:00 後，頁面自動彈出提醒「明天要還車了，建議去加油」；點擊「看一下」應跳轉至 `gas-station.html`
* ✅ `notify.js`

  * 通過標準：觸發推播後，卡片從底部滑入動畫正常；點「不用了」後卡片消失，`localStorage` 寫入對應的 key 與時間戳；30 分鐘內再次觸發同一則通知，卡片不出現；30 分鐘後可再次出現

---

## ✅ Phase 6：全頁錯誤狀態與邊界條件

* ✅ 定位失敗 fallback

  * 通過標準：拒絕定位權限後，頁面不報錯，`GeoHelper` 自動改用 Naha 市中心座標，設施列表依然能顯示距離（雖然是從 Naha 計算）
* ✅ 資料加載失敗提示

  * 通過標準：手動將 `spots.json` 重新命名使其失效，頁面應顯示「無法取得資料」等友善提示，而非留白
* ✅ PWA 全量離線驗證

  * 通過標準：`sw.js` 預快取清單包含全部 9 個 HTML、CSS、所有 JS (含 `geo.js`)、5 個 JSON 與 Icon。啟動飛航模式後，重新整理各頁面皆能正常呈現舊有資料，不出現小恐龍或無法連線畫面拋出未捕捉的 Promise rejection

---

## ✅ Phase 7：語法與格式驗證

* ✅ 所有 9 個 JS 檔案通過 `node --check` 語法檢查（零錯誤）
* ✅ 所有 5 個 JSON 檔案通過 `JSON.parse` 驗證（零錯誤）
* ✅ 所有 HTML 標籤正確閉合且關鍵 ID（`current-temp`, `btn-gas-station` 等）無重複與衝突
* ✅ 專案目錄結構清理：刪除所有 `.tmp` 或測試用的冗餘檔案，保持 `css/`, `js/`, `data/`, `pages/`, `images/` 分類清晰

---

## ✅ Phase 8：瀏覽器模擬驗收（需使用者自行操作）

使用 Chrome DevTools，裝置設定為 **iPhone 12 Pro（390×844）**

| 驗收項目        | 操作步驟                                          | 通過標準                                                  |
| ----------- | --------------------------------------------- | ----------------------------------------------------- |
| 版面無溢出       | 各頁面捲動檢查                                       | 無橫向 scrollbar，文字無截斷                                   |
| 按鈕可點擊性      | 點擊所有按鈕                                        | 無誤觸、點擊區域符合視覺範圍                                        |
| Day 4 加油站隱藏 | 修改 `TRIP_START_DATE` 使 `getCurrentDay()` 回傳 4 | 首頁加油站按鈕消失且不佔版面空間                                      |
| JSON 動態渲染   | Network 面板觀察 `day4-transport.html`            | 可見 `transport.json` 的 fetch 請求                        |
| 推播冷卻        | 觸發通知 → 點「不用了」→ 立即再觸發                          | 第二次不出現；DevTools → Application → Local Storage 有對應 key |
| 離線存取        | Network → Offline → 重整所有頁面                    | 所有頁面正常載入，無白畫面                                         |
| 小兒科標示       | 開啟 `emergency.html`                           | 有小兒科的醫院有紅色標籤，視覺明顯                                     |
| 距離排序        | 修改 mock 定位座標 → 重整 `places.html`               | 排序結果改變，距離標籤數值更新                                       |
| 日語卡片        | 開啟 `emergency.html` 卡片區                       | 三欄（中文、日文、羅馬拼音）對齊顯示                                    |

---

## ✅ Phase 9：出發前一週實機驗收（獨立於開發之外）

**執行裝置：真實 iPhone，Safari 瀏覽器**

* ✅ 在 Safari 開啟網址，點「加入主畫面」，確認 icon 顯示正確（非白色空白）
* ✅ 從主畫面 icon 開啟，確認以 standalone 模式啟動（無 Safari 網址列）
* ✅ Wi-Fi 環境：瀏覽所有 9 個頁面，功能正常
* ✅ 切換至行動數據：重複瀏覽，功能正常
* ✅ 開啟飛航模式（完全離線）：重複瀏覽，確認 Service Worker 離線快取生效，**所有頁面內容可見**
* ✅ 離線狀態下點擊「導航到下一站」，確認頁面不崩潰，有適當的「需要網路連線」提示

---

**整份清單共 Phase 0–9，總計 50 個驗收項目。Phase 0–7 為開發者可自行完成的項目；Phase 8 需開啟瀏覽器逐一手動確認；Phase 9 需在真實 iPhone 上執行，不可用模擬器替代。**
