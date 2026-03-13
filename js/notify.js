/* 
  notify.js - 溫和推播通知系統
  讀取 data/events.json 動態註冊時間、地點、狀態事件，並嚴謹控管觸發冷卻防重複。
*/

const DEV_MODE = true;

document.addEventListener('DOMContentLoaded', () => {
    // 掛載通知容器 (所有頁面共用體驗)
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

    const isIndex = window.location.pathname.endsWith('index.html') 
        || window.location.pathname === '/' 
        || window.location.pathname.endsWith('okinawa-family-dashboard/');

    const dataPath = isIndex ? './data/events.json' : '../data/events.json';

    fetch(dataPath)
        .then(res => res.json())
        .then(events => {
            if (DEV_MODE && isIndex) {
                setupDevPanel(events);
            }
            scheduleNotifications(events);
            setupStateListeners(events);
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

function triggerNotification(id, message, linkUrl, cooldownMinutes = 30) {
    if (cooldownMinutes > 0 && isCoolingDown(id, cooldownMinutes)) {
        return;
    }

    const container = document.getElementById('notify-container');
    if (!container) return;

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

    // 將按鈕文字更換為溫和式用語
    container.innerHTML = `
        <div style="font-size:1.05em; font-weight:bold; color:var(--text-color); margin-bottom:18px; line-height:1.6;">
            💡 ${message}
        </div>
        <div style="display:flex; justify-content:space-between; gap:16px;">
            <button id="btn-dismiss-${id}" style="flex:1; padding:16px; border-radius:12px; border:none; background:var(--bg-color); color:var(--text-color); font-size:1em; font-weight:bold; cursor:pointer;">等一下再說</button>
            <button id="btn-check-${id}" style="flex:1; padding:16px; border-radius:12px; border:none; background:var(--primary-color); color:white; font-size:1em; font-weight:bold; cursor:pointer; box-shadow:0 4px 6px rgba(0,0,0,0.1);">好啊，看一下</button>
        </div>
    `;

    container.style.bottom = '0px';

    document.getElementById(`btn-dismiss-${id}`).onclick = () => {
        dismissNotification(id);
    };

    document.getElementById(`btn-check-${id}`).onclick = () => {
        dismissNotification(id);
        if (targetLink) {
            window.location.href = targetLink;
        }
    };
}

window.triggerNotification = triggerNotification;

function dismissNotification(id) {
    const container = document.getElementById('notify-container');
    if (container) {
        container.style.bottom = '-250px';
    }
    localStorage.setItem(`notify_dismissed_${id}`, Date.now().toString());
}

window.dismissNotification = dismissNotification;
