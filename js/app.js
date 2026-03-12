if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // 判斷是否在子頁面目錄
    const swPath = window.location.pathname.includes('/pages/') ? '../sw.js' : './sw.js';
    navigator.serviceWorker.register(swPath)
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// ===== 全域定位模組 =====
const GeoHelper = {
    lat: null,
    lng: null,
    ready: false,
    callbacks: [],

    init() {
        if (!('geolocation' in navigator)) {
            console.log('Geolocation not supported');
            this._fallback();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                this.lat = pos.coords.latitude;
                this.lng = pos.coords.longitude;
                this.ready = true;
                console.log(`定位成功: ${this.lat}, ${this.lng}`);
                this._notifyCallbacks();
                this._updateStatus('已定位');
            },
            (err) => {
                console.warn('Geolocation error:', err.message);
                this._fallback();
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
        );
    },

    _fallback() {
        // 預設座標：沖繩那霸市中心 (供離線或拒絕定位時使用)
        this.lat = 26.3344;
        this.lng = 127.8056;
        this.ready = true;
        console.log('使用預設座標（那霸）');
        this._notifyCallbacks();
        this._updateStatus('使用預設位置');
    },

    _notifyCallbacks() {
        this.callbacks.forEach(cb => cb(this.lat, this.lng));
        this.callbacks = [];
    },

    _updateStatus(text) {
        const el = document.getElementById('status-bar');
        if (el) el.textContent = text;
    },

    // 計算兩點距離 (Haversine formula, 回傳公里)
    distanceTo(targetLat, targetLng) {
        if (!this.lat || !this.lng) return Infinity;
        const R = 6371;
        const dLat = (targetLat - this.lat) * Math.PI / 180;
        const dLng = (targetLng - this.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.lat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    // 註冊回呼：定位完成後執行
    onReady(callback) {
        if (this.ready) {
            callback(this.lat, this.lng);
        } else {
            this.callbacks.push(callback);
        }
    }
};

// 將 GeoHelper 暴露給其他 JS
window.GeoHelper = GeoHelper;

document.addEventListener('DOMContentLoaded', () => {
    // 啟動定位
    GeoHelper.init();

    // Check date to hide gas station button on Day 4 (May 11)
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    
    if (month === 5 && date === 11) {
        const gasBtn = document.getElementById('btn-gas-station');
        if (gasBtn) {
            gasBtn.style.display = 'none';
        }
    }
});
