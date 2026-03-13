/* 
  notify.js - 溫和推播通知系統
  根據時間、定位等條件精準觸發推播。
*/

// 設為 false 即隱藏測試按鈕（旅行時切換）
const DEV_MODE = true;

// 景點座標（用來判斷「快到景點」）
const SPOT_COORDS = [
    { name: '美麗海水族館', lat: 26.6944, lng: 127.8778, radius: 3 },
    { name: '古宇利島', lat: 26.6940, lng: 128.0250, radius: 2 },
    { name: '沖繩兒童王國', lat: 26.3340, lng: 127.8050, radius: 2 },
    { name: '美國村', lat: 26.3270, lng: 127.7620, radius: 2 },
];

// 推播記錄（防止重複）
const notifyLog = {};

document.addEventListener('DOMContentLoaded', () => {
    // 建立推播容器
    const notifyContainer = document.createElement('div');
    notifyContainer.id = 'notify-container';
    notifyContainer.style.cssText = `
        position: fixed;
        bottom: -250px;
        left: 16px;
        right: 16px;
        background: white;
        box-shadow: 0 -4px 16px rgba(0,0,0,0.15);
        border-radius: 16px 16px 0 0;
        padding: 20px;
        transition: bottom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        z-index: 1000;
    `;
    document.body.appendChild(notifyContainer);

    // 只在首頁啟動推播邏輯
    const isIndex = window.location.pathname.endsWith('index.html') 
        || window.location.pathname === '/' 
        || window.location.pathname.endsWith('okinawa-family-dashboard/');

    if (!isIndex) return;

    // ===== 開發者測試按鈕 =====
    if (DEV_MODE) {
        const testPanel = document.createElement('div');
        testPanel.style.cssText = `
            position: fixed; top: 56px; right: 8px; z-index: 9999;
            display: flex; flex-direction: column; gap: 4px;
        `;
        const scenarios = [
            { label: '🚗 開車太久', msg: '好像開滿久了，前面有個不錯的休息站，要不要順便去看看？', link: 'pages/places.html' },
            { label: '🍽️ 用餐提醒', msg: '快到中午了，想不想找間店坐下來吃個飯？小朋友可能也餓了。', link: 'pages/spots.html' },
            { label: '⛽ 加油提醒', msg: '今天跑了不少路，等一下記得找加油站喔，おもろまち 附近有一間。', link: 'pages/gas-station.html' },
            { label: '🎡 快到景點', msg: '快到美麗海水族館了！要不要先看一下實用資訊？', link: 'pages/spot-detail.html?id=churaumi' },
        ];
        scenarios.forEach(s => {
            const btn = document.createElement('button');
            btn.textContent = s.label;
            btn.style.cssText = `
                padding: 4px 10px; font-size: 0.7em;
                background: var(--text-color); color: white;
                border: none; border-radius: 16px; opacity: 0.8; cursor: pointer;
            `;
            btn.onclick = () => showNotification(s.msg, s.link);
            testPanel.appendChild(btn);
        });
        document.body.appendChild(testPanel);
    }

    // ===== 自動情境觸發 =====
    startScenarioChecks();
});

// ===== 情境判斷引擎 =====
function startScenarioChecks() {
    // 1) 用餐時間提醒 — 每分鐘檢查一次
    setInterval(() => {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();

        // 午餐提醒 (11:30)
        if (h === 11 && m >= 25 && m <= 35 && !notifyLog['lunch']) {
            notifyLog['lunch'] = true;
            showNotification(
                '快到中午了，想不想找間店坐下來吃個飯？小朋友可能也餓了。',
                'pages/spots.html'
            );
        }

        // 晚餐提醒 (17:00)
        if (h === 17 && m >= 0 && m <= 10 && !notifyLog['dinner']) {
            notifyLog['dinner'] = true;
            showNotification(
                '差不多晚餐時間了，要不要看一下附近有什麼好吃的？',
                'pages/spots.html'
            );
        }

        // 下午休息提醒 (14:30) — 小孩可能累了
        if (h === 14 && m >= 25 && m <= 35 && !notifyLog['rest']) {
            notifyLog['rest'] = true;
            showNotification(
                '下午了，小朋友可能想睡一下。附近有便利店可以買飲料休息一下。',
                'pages/places.html'
            );
        }
    }, 60000); // 每分鐘檢查

    // 2) 開車太久提醒 — 30 分鐘後觸發
    setTimeout(() => {
        if (!notifyLog['driving_long']) {
            notifyLog['driving_long'] = true;
            showNotification(
                '開了一段路了，要不要在前面休息站停一下？讓小朋友下車走走。',
                'pages/places.html'
            );
        }
    }, 30 * 60 * 1000); // 30 分鐘

    // 3) 快到景點 — 定位後持續檢查
    if (window.GeoHelper) {
        setInterval(() => {
            if (!GeoHelper.ready) return;

            SPOT_COORDS.forEach(spot => {
                const dist = GeoHelper.distanceTo(spot.lat, spot.lng);
                const key = `near_${spot.name}`;

                if (dist <= spot.radius && !notifyLog[key]) {
                    notifyLog[key] = true;
                    showNotification(
                        `快到${spot.name}了！要不要先看一下實用資訊？`,
                        'pages/spots.html'
                    );
                }
            });
        }, 30000); // 每 30 秒檢查
    }

    // 4) 加油提醒 — Day 3 下午提醒還車前加油
    const currentDay = typeof getCurrentDay === 'function' ? getCurrentDay() : null;
    const now = new Date();
    const hour = now.getHours();

    if (currentDay === 3 && hour >= 15 && !notifyLog['gas_remind']) {
        notifyLog['gas_remind'] = true;
        setTimeout(() => {
            showNotification(
                '明天要還車了，今天記得找加油站把油加滿喔！おもろまち附近有ENEOS。',
                'pages/gas-station.html'
            );
        }, 5000);
    }
}

// ===== 推播顯示 =====
function showNotification(message, linkUrl) {
    const notifyId = btoa(message).substring(0, 16); // 簡易 ID
    const lastDismissed = localStorage.getItem(`notify_dismissed_${notifyId}`);
    
    // 冷卻時間 30 分鐘 (1800000ms)
    if (lastDismissed && (Date.now() - parseInt(lastDismissed)) < 1800000) {
        console.log('推播冷卻中:', message);
        return;
    }

    const container = document.getElementById('notify-container');
    container.innerHTML = `
        <div style="font-size:1.1em; font-weight:bold; color:var(--text-color); margin-bottom:16px; line-height:1.5;">
            💡 ${message}
        </div>
        <div style="display:flex; justify-content:space-between; gap:16px;">
            <button id="btn-dismiss" style="flex:1; padding:14px; border-radius:10px; border:none; background:var(--bg-color); color:var(--text-color); font-size:1em; font-weight:bold; cursor:pointer;">不用了</button>
            <button id="btn-check" style="flex:1; padding:14px; border-radius:10px; border:none; background:var(--primary-color); color:white; font-size:1em; font-weight:bold; cursor:pointer;">看一下 👀</button>
        </div>
    `;

    container.style.bottom = '0px';

    document.getElementById('btn-dismiss').onclick = () => {
        container.style.bottom = '-250px';
        localStorage.setItem(`notify_dismissed_${notifyId}`, Date.now().toString());
    };

    document.getElementById('btn-check').onclick = () => {
        window.location.href = linkUrl;
    };
}
