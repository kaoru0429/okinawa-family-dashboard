document.addEventListener('DOMContentLoaded', () => {
    fetch('../data/spots.json')
        .then(res => res.json())
        .then(data => {
            const listContainer = document.getElementById('spots-list');
            const detailCard = document.getElementById('detail-card');
            const detailTitle = document.getElementById('detail-title');

            if (listContainer) {
                // Render list
                listContainer.innerHTML = '';
                data.forEach(spot => {
                    const item = document.createElement('div');
                    item.className = 'list-item';
                    item.style.cursor = 'pointer';
                    item.innerHTML = `
                        <div>
                            <div class="list-item-title">${spot.name} <span style="color:#999;font-size:0.8em;">[${spot.region}]</span></div>
                            <div class="list-item-desc">👶 友善度: ${'⭐'.repeat(spot.kid_friendly)}</div>
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
                // Render detail based on URL parameter
                const urlParams = new URLSearchParams(window.location.search);
                const id = urlParams.get('id');
                const spot = data.find(s => s.id === id);

                if (spot) {
                    detailTitle.textContent = spot.name;
                    detailCard.innerHTML = `
                        <div style="margin-bottom:10px;"><strong style="color:var(--primary-color);">區域：</strong>${spot.region}</div>
                        <div style="margin-bottom:10px;"><strong style="color:var(--primary-color);">介紹：</strong>${spot.description}</div>
                        <div style="margin-bottom:10px;"><strong style="color:var(--primary-color);">門票：</strong>${spot.ticket_info}</div>
                        
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:16px;">
                            <div style="background:#f0f8ff; padding:10px; border-radius:8px; text-align:center;">
                                <div><span style="font-size:1.5em; display:block;">🅿️</span> 停車</div>
                                <div style="font-weight:bold; color:${spot.has_parking ? 'var(--success-color)' : 'var(--danger-color)'};">
                                    ${spot.has_parking ? '有' : '無'}
                                </div>
                            </div>
                            <div style="background:#f0f8ff; padding:10px; border-radius:8px; text-align:center;">
                                <div><span style="font-size:1.5em; display:block;">🍼</span> 哺乳室</div>
                                <div style="font-weight:bold; color:${spot.has_nursing_room ? 'var(--success-color)' : 'var(--danger-color)'};">
                                    ${spot.has_nursing_room ? '有' : '無'}
                                </div>
                            </div>
                        </div>
                        <div style="margin-top:16px; font-weight:bold;">
                            幼童友善度：${'⭐'.repeat(spot.kid_friendly)}
                        </div>
                        ${spot.easy_tip ? `
                        <div style="margin-top:16px; background:#E8F5E9; padding:12px; border-radius:8px; border-left:4px solid var(--success-color);">
                            <strong style="color:var(--success-color);">💡 輕鬆玩法建議：</strong>
                            <div style="margin-top:6px; color:#333; line-height:1.5;">${spot.easy_tip}</div>
                        </div>` : ''}
                    `;

                    // 設定動態導航按鈕
                    const navBtn = document.getElementById('nav-btn');
                    if (navBtn) {
                        navBtn.href = `https://maps.google.com/?q=${encodeURIComponent(spot.name + ' 沖繩')}`;
                        navBtn.style.display = 'block';
                    }
                } else {
                    detailTitle.textContent = "找不到該景點";
                    detailCard.innerHTML = "返回上一頁重試";
                }
            }
        })
        .catch(err => console.error('Error loading spots data:', err));
});
