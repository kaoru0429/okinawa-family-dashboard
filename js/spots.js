document.addEventListener('DOMContentLoaded', () => {
    fetch('../data/spots.json')
        .then(res => res.json())
        .then(data => {
            const listContainer = document.getElementById('spots-list');
            const detailCard = document.getElementById('detail-card');
            const detailTitle = document.getElementById('detail-title');

            if (listContainer) {
                listContainer.innerHTML = '';
                data.forEach(spot => {
                    const item = document.createElement('div');
                    item.className = 'list-item';
                    item.style.cursor = 'pointer';
                    item.innerHTML = `
                        <div>
                            <div class="list-item-title">${spot.nameZh}</div>
                            <div class="list-item-desc">👶 適合度: ${'⭐'.repeat(spot.childFriendly)} | Day ${spot.day}</div>
                        </div>
                        <div style="font-size:1.5em;color:var(--primary-color);">➡️</div>
                    `;
                    item.onclick = () => {
                        window.location.href = `spot-detail.html?id=${spot.id}`;
                    };
                    listContainer.appendChild(item);
                });
            }

            if (detailCard && detailTitle) {
                const urlParams = new URLSearchParams(window.location.search);
                const id = urlParams.get('id');
                const spot = data.find(s => s.id === id);

                if (spot) {
                    detailTitle.textContent = spot.nameZh;
                    detailCard.innerHTML = `
                        <div style="margin-bottom:10px;"><strong style="color:var(--primary-color);">日文名稱：</strong>${spot.name}</div>
                        <div style="margin-bottom:10px;"><strong style="color:var(--primary-color);">預定日期：</strong>Day ${spot.day}</div>
                        <div style="margin-bottom:10px;"><strong style="color:var(--primary-color);">停車：</strong>${spot.parking}</div>
                        <div style="margin-bottom:10px;"><strong style="color:var(--primary-color);">門票：</strong>¥${spot.ticketJPY || '免費'}</div>
                        
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:16px;">
                            <div style="background:var(--bg-color); padding:10px; border-radius:8px; text-align:center;">
                                <div><span style="font-size:1.5em; display:block;">👶</span> 適合度</div>
                                <div style="font-weight:bold; color:var(--primary-color);">${spot.childFriendly}/5</div>
                            </div>
                            <div style="background:var(--bg-color); padding:10px; border-radius:8px; text-align:center;">
                                <div><span style="font-size:1.5em; display:block;">🍼</span> 哺乳室</div>
                                <div style="font-weight:bold; color:${spot.nursingRoom ? 'var(--success-color)' : 'var(--text-color)'}; opacity:${spot.nursingRoom ? '1' : '0.5'};">
                                    ${spot.nursingRoom ? '有' : '無'}
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin-top:16px; background:var(--bg-color); padding:12px; border-radius:8px; border-left:4px solid var(--success-color);">
                            <strong style="color:var(--success-color);">💡 輕鬆玩法建議：</strong>
                            <div style="margin-top:6px; color:var(--text-color); line-height:1.5;">${spot.easyPlayTip}</div>
                        </div>
                    `;

                    const navBtn = document.getElementById('nav-btn');
                    if (navBtn) {
                        // 使用座標導航
                        navBtn.href = spot.lat ? `https://maps.google.com/?q=${spot.lat},${spot.lng}` : `https://maps.google.com/?q=${encodeURIComponent(spot.name + ' 沖繩')}`;
                        navBtn.style.display = 'block';
                    }
                }
            }
        })
        .catch(err => console.error('Spots render fail:', err));
});
