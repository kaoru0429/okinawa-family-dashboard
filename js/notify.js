/* 
  notify.js - 溫和推播通知系統
  讀取 data/events.json 動態註冊時間、地點、狀態事件，並嚴謹控管觸發冷卻防重複。
*/

const DEV_MODE = true;

let globalEvents = [];

document.addEventListener('DOMContentLoaded', () => {
    // 掛載通知容器 (所有頁面共用體驗)
    const notifyContainer = document.createElement('div');
    notifyContainer.id = 'notify-container';
    notifyContainer.style.cssText = `
        position: fixed;
        top: -150px;
        left: 16px;
        right: 16px;
        background: white;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        border-radius: 12px;
        padding: 16px;
        transition: top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        z-index: 1000;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    document.body.appendChild(notifyContainer);

    // 建立訊息專區面板與按鈕
    setupMessageCenter();

    const isIndex = window.location.pathname.endsWith('index.html') 
        || window.location.pathname === '/' 
        || window.location.pathname.endsWith('okinawa-family-dashboard/');

    const dataPath = isIndex ? './data/events.json' : '../data/events.json';

    fetch(dataPath)
        .then(res => res.json())
        .then(events => {
            globalEvents = events; // 存入全域供訊息中心讀取
            if (DEV_MODE && isIndex) {
                setupDevPanel(events);
            }
            scheduleNotifications(events);
            setupStateListeners(events);
            updateMessageCenterBadge(); // 初始化未讀數量
        })
        .catch(err => console.log('Notice: events.json load failed.', err));
});

let stateEvents = [];

function setupStateListeners(events) {
    stateEvents = events.filter(e => e.triggerType === 'STATE');
    
    // 網路狀態監聽
    window.addEventListener('offline', () => checkStateEvents('offline'));
    window.addEventListener('online', () => checkStateEvents('online'));

    // 電量狀態監聽
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            battery.addEventListener('levelchange', () => {
                if (battery.level <= 0.2 && !battery.charging) {
                    checkStateEvents('battery');
                }
            });
        });
    }
}

function checkStateEvents(val) {
    if (!stateEvents.length) return;
    const ev = stateEvents.find(e => e.triggerValue === val);
    if (ev && ev.enabled) {
        triggerNotification(ev.id, ev.message, ev.link, ev.cooldownMinutes);
    }
}

function setupDevPanel(events) {
    const testPanel = document.createElement('div');
    testPanel.style.cssText = `
        position: fixed; top: 60px; right: 16px; z-index: 9999;
        display: flex; flex-direction: column; gap: 6px;
        max-height: 80vh; overflow-y: auto;
    `;
    
    // 只挑選數個代表性事件到面板
    const devEvents = events.slice(0, 5).concat(events.filter(e => e.triggerType === 'GEO').slice(0, 3));

    devEvents.forEach(s => {
        const btn = document.createElement('button');
        btn.textContent = `[Test] ` + s.id;
        btn.style.cssText = `
            padding: 6px 10px; font-size: 0.75em;
            background: var(--text-color); color: white;
            border: none; border-radius: 8px; opacity: 0.85; cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        btn.onclick = () => triggerNotification(s.id, s.message, s.link, 0); // 測試模式無 cooldown
        testPanel.appendChild(btn);
    });
    
    document.body.appendChild(testPanel);
}

function scheduleNotifications(events) {
    const timeEvents = events.filter(e => e.triggerType === 'TIME');
    const geoEvents = events.filter(e => e.triggerType === 'GEO');

    // 定期檢查時間 (每分鐘)
    setInterval(() => {
        const currentDay = typeof window.getCurrentDay === 'function' ? window.getCurrentDay() : null;
        if (!currentDay) return;

        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

        timeEvents.forEach(ev => {
            if (ev.enabled && ev.day === currentDay && ev.triggerValue === timeStr) {
                triggerNotification(ev.id, ev.message, ev.link, ev.cooldownMinutes);
            }
        });
    }, 60000);

    // 定期檢查定位 (每 30 秒)
    if (window.GeoHelper) {
        setInterval(() => {
            if (!window.GeoHelper.ready) return;
            const currentDay = typeof window.getCurrentDay === 'function' ? window.getCurrentDay() : null;
            if (!currentDay) return;
            
            geoEvents.forEach(ev => {
                if (ev.enabled && ev.day === currentDay) {
                    const tv = ev.triggerValue;
                    const distKm = window.GeoHelper.distanceTo(tv.lat, tv.lng);
                    if (distKm * 1000 <= tv.radiusMeters) {
                        triggerNotification(ev.id, ev.message, ev.link, ev.cooldownMinutes);
                    }
                }
            });
        }, 30000);
    }
}

function isCoolingDown(id, cooldownMinutes) {
    const lastDismissed = localStorage.getItem(`notify_dismissed_${id}`);
    if (lastDismissed) {
        const cooldownMs = cooldownMinutes * 60 * 1000;
        if ((Date.now() - parseInt(lastDismissed, 10)) < cooldownMs) {
            return true;
        }
    }
    return false;
}

window.isCoolingDown = isCoolingDown;

let notifyAutoOffTimer = null;

function triggerNotification(id, message, linkUrl, cooldownMinutes = 30) {
    if (cooldownMinutes > 0 && isCoolingDown(id, cooldownMinutes)) {
        return;
    }

    const container = document.getElementById('notify-container');
    if (!container) return;

    if (notifyAutoOffTimer) {
        clearTimeout(notifyAutoOffTimer);
    }

    // 判斷是否為子頁面，需切換連結前綴
    const isIndex = window.location.pathname.endsWith('index.html') 
        || window.location.pathname === '/' 
        || window.location.pathname.endsWith('okinawa-family-dashboard/');
    
    let targetLink = linkUrl;
    if (!isIndex && targetLink && targetLink.startsWith('pages/')) {
        targetLink = targetLink.replace('pages/', '');
    } else if (!isIndex && targetLink === 'index.html') {
        targetLink = '../index.html';
    }

    container.innerHTML = `
        <div style="font-size:1.5em; flex-shrink:0;">💡</div>
        <div style="flex:1;">
            <div style="font-size:0.95em; font-weight:bold; color:var(--text-color); line-height:1.4;">
                ${message}
            </div>
            ${targetLink ? '<div style="font-size:0.75em; color:var(--primary-color); margin-top:4px; font-weight:bold;">點擊查看 ➔</div>' : ''}
        </div>
    `;

    container.style.top = '16px';

    container.onclick = () => {
        hideNotificationOnly(id);
        if (targetLink) {
            window.location.href = targetLink;
        }
    };

    notifyAutoOffTimer = setTimeout(() => {
        hideNotificationOnly(id);
    }, 7000);
    
    // 寫入 localStorage 代表已觸發，開始計算任務有效(冷卻)期
    localStorage.setItem(`notify_dismissed_${id}`, Date.now().toString());
    updateMessageCenterBadge();
}

window.triggerNotification = triggerNotification;

// 只隱藏畫面上方的 Toast，不影響 localStorage
function hideNotificationOnly(id) {
    const container = document.getElementById('notify-container');
    if (container) {
        container.style.top = '-150px';
    }
}

// ===== 訊息專區 (Message Center) 邏輯 =====
function setupMessageCenter() {
    // 建立右下角浮動鈴鐺按鈕
    const fab = document.createElement('div');
    fab.id = 'message-center-fab';
    fab.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 50px;
        height: 50px;
        background: var(--primary-color);
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5em;
        z-index: 998;
        cursor: pointer;
        transition: transform 0.2s;
    `;
    fab.innerHTML = `🔔 <span id="mc-badge" style="display:none; position:absolute; top:-4px; right:-4px; background:var(--danger-color); color:white; font-size:12px; font-weight:bold; padding:2px 6px; border-radius:10px; border:2px solid white;">0</span>`;
    
    // 建立面板
    const panel = document.createElement('div');
    panel.id = 'message-center-panel';
    panel.style.cssText = `
        position: fixed;
        bottom: -100%;
        left: 0;
        right: 0;
        height: 70vh;
        background: var(--bg-color);
        border-radius: 20px 20px 0 0;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.2);
        z-index: 999;
        transition: bottom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        display: flex;
        flex-direction: column;
    `;

    panel.innerHTML = `
        <div style="padding: 20px; background: white; border-radius: 20px 20px 0 0; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h3 style="margin:0; color:var(--text-color); font-size:1.2em;">通知中心</h3>
            <button id="mc-close" style="background:none; border:none; font-size:1.5em; color:var(--text-color); cursor:pointer;">&times;</button>
        </div>
        <div id="mc-list" style="padding: 16px; overflow-y: auto; flex:1; display:flex; flex-direction:column; gap:12px;"></div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    fab.onclick = () => {
        renderMessageList();
        panel.style.bottom = '0';
        fab.style.transform = 'scale(0)';
    };

    document.getElementById('mc-close').onclick = () => {
        panel.style.bottom = '-100%';
        fab.style.transform = 'scale(1)';
    };
}

function getActiveMessages() {
    if (!globalEvents || globalEvents.length === 0) return [];
    
    const active = [];
    const now = Date.now();
    
    globalEvents.forEach(ev => {
        const stored = localStorage.getItem(`notify_dismissed_${ev.id}`);
        if (stored) {
            const timePassed = now - parseInt(stored, 10);
            const cooldownMs = (ev.cooldownMinutes || 30) * 60 * 1000;
            if (timePassed < cooldownMs) {
                active.push({
                    ev: ev,
                    timePassed: timePassed
                });
            }
        }
    });

    // 依據時間排序，最新的在最前面
    active.sort((a, b) => a.timePassed - b.timePassed);
    return active;
}

function updateMessageCenterBadge() {
    const badge = document.getElementById('mc-badge');
    if (!badge) return;
    const activeCount = getActiveMessages().length;
    if (activeCount > 0) {
        badge.textContent = activeCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }
}

function renderMessageList() {
    const listEl = document.getElementById('mc-list');
    const activeMessages = getActiveMessages();

    if (activeMessages.length === 0) {
        listEl.innerHTML = `<div style="text-align:center; color:#888; padding: 40px 0; font-size:0.9em;">目前沒有進行中的任務或通知</div>`;
        return;
    }

    const isIndex = window.location.pathname.endsWith('index.html') 
        || window.location.pathname === '/' 
        || window.location.pathname.endsWith('okinawa-family-dashboard/');

    listEl.innerHTML = activeMessages.map(item => {
        const ev = item.ev;
        const minsPassed = Math.floor(item.timePassed / 60000);
        const timeText = minsPassed < 1 ? '剛剛' : `${minsPassed} 分鐘前`;
        
        let targetLink = ev.link;
        if (!isIndex && targetLink && targetLink.startsWith('pages/')) {
            targetLink = targetLink.replace('pages/', '');
        } else if (!isIndex && targetLink === 'index.html') {
            targetLink = '../index.html';
        }

        return `
            <div onclick="window.location.href='${targetLink}'" style="background:white; padding:16px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05); cursor:pointer;">
                <div style="font-size:0.8em; color:#888; margin-bottom:6px; display:flex; justify-content:space-between;">
                    <span>⏳ 任務有效中</span>
                    <span>${timeText}</span>
                </div>
                <div style="font-size:0.95em; color:var(--text-color); font-weight:bold; line-height:1.4;">
                    ${ev.message}
                </div>
            </div>
        `;
    }).join('');
}
