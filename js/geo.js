const GeoHelper = (() => {
    let currentPos = null;
    let readyCallbacks = [];

    const init = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    currentPos = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    };
                    readyCallbacks.forEach(cb => cb(currentPos.lat, currentPos.lng));
                    console.log('Geo set:', currentPos);
                },
                (err) => {
                    console.warn('Geolocation failed, use fallback (Naha):', err);
                    // 預設為那霸市中心某點
                    currentPos = { lat: 26.2124, lng: 127.6809 };
                    readyCallbacks.forEach(cb => cb(currentPos.lat, currentPos.lng));
                },
                { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
            );
        }
    };

    const distanceTo = (lat, lng) => {
        if (!currentPos) return Infinity;
        return calculateDistance(currentPos.lat, currentPos.lng, lat, lng);
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const onReady = (cb) => {
        if (currentPos) {
            cb(currentPos.lat, currentPos.lng);
        } else {
            readyCallbacks.push(cb);
        }
    };

    init();

    return {
        distanceTo,
        onReady,
        getPos: () => currentPos
    };
})();

// 全域註冊
window.GeoHelper = GeoHelper;
