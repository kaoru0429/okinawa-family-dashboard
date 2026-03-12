let allPlaces = [];

document.addEventListener('DOMContentLoaded', () => {
    const validTypes = window.currentPlaceType || ['all'];

    fetch('../data/places.json')
        .then(res => res.json())
        .then(data => {
            allPlaces = data;

            // 先渲染一次（未排序）
            renderPlaces(validTypes);

            // 定位完成後重新依距離排序
            if (window.GeoHelper) {
                GeoHelper.onReady((lat, lng) => {
                    sortByDistance(lat, lng);
                    renderPlaces(validTypes);
                });
            }
        })
        .catch(err => console.error('Error loading places:', err));
});

function sortByDistance(userLat, userLng) {
    allPlaces.forEach(p => {
        if (p.lat && p.lng) {
            p._distance = GeoHelper.distanceTo(p.lat, p.lng);
        } else {
            p._distance = Infinity;
        }
    });
    allPlaces.sort((a, b) => a._distance - b._distance);
}

function getIcon(type) {
    switch (type) {
        case 'toilet': return '🚻';
        case 'convenience': return '🏪';
        case 'nursing': return '🍼';
        case 'gas_station': return '⛽';
        default: return '📍';
    }
}

function formatDistance(km) {
    if (!km || km === Infinity) return '';
    if (km < 1) return `約 ${Math.round(km * 1000)}m`;
    return `約 ${km.toFixed(1)}km`;
}

function renderPlaces(types) {
    const list = document.getElementById('places-list');
    list.innerHTML = '';
    
    // Filter
    let filtered = allPlaces;
    if (!types.includes('all')) {
        filtered = allPlaces.filter(p => types.includes(p.type));
    }

    if (filtered.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding: 20px; color:#999;">目前沒有符合條件的設施</div>`;
        return;
    }

    filtered.forEach(p => {
        const distText = formatDistance(p._distance);
        const distBadge = distText 
            ? `<span style="background:var(--primary-color); color:white; padding:2px 8px; border-radius:12px; font-size:0.75em; margin-left:8px;">${distText}</span>` 
            : '';

        const dom = document.createElement('div');
        dom.className = 'list-item';
        dom.style.flexDirection = 'column';
        dom.style.alignItems = 'flex-start';
        dom.innerHTML = `
            <div style="font-weight:bold; font-size:1.1em; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <span>${getIcon(p.type)}</span>
                <span>${p.name} <span style="color:#999;font-size:0.8em;">[${p.location}]</span></span>
                ${distBadge}
            </div>
            <div class="list-item-desc" style="margin-top:8px;">📝 備註：${p.note}</div>
            <div style="margin-top:12px; width:100%;">
                <a href="https://maps.google.com/?q=${encodeURIComponent(p.name + ' 沖繩')}" target="_blank" class="btn btn-success" style="display:inline-block; width:100%; padding:10px; font-size:0.95em;">📍 導航前往</a>
            </div>
        `;
        list.appendChild(dom);
    });
}

function filterPlaces(type) {
    if (type === 'all') {
        renderPlaces(['toilet', 'convenience', 'nursing']);
    } else {
        renderPlaces([type]);
    }
}
