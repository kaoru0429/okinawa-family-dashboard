document.addEventListener('DOMContentLoaded', () => {
    fetch('../data/emergency.json')
        .then(res => res.json())
        .then(data => {
            // Contacts - 一鍵撥打
            const clist = document.getElementById('contacts-list');
            if (clist) {
                data.contacts.forEach(c => {
                    const btn = document.createElement('a');
                    btn.className = 'btn btn-danger';
                    btn.href = `tel:${c.number}`;
                    btn.style.textAlign = 'center';
                    btn.style.padding = '16px';
                    btn.innerHTML = `${c.type}<br><span style="font-size:1.8em; font-weight:bold;">${c.number}</span>`;
                    clist.appendChild(btn);
                });
            }

            // Hospitals - 醫院清單
            const hlist = document.getElementById('hospitals-list');
            if (hlist) {
                data.hospitals.forEach(h => {
                    const dom = document.createElement('div');
                    dom.className = 'list-item';
                    dom.style.flexDirection = 'column';
                    dom.style.alignItems = 'flex-start';
                    dom.innerHTML = `
                        <div style="font-weight:bold; font-size:1.1em; color:var(--text-color);">
                            ${h.name} 
                            ${h.has_pediatrics ? '<span style="background:var(--success-color); color:white; padding:2px 8px; border-radius:4px; font-size:0.75em; margin-left:8px;">★ 設有小兒科</span>' : ''}
                        </div>
                        <div class="list-item-desc">📍 ${h.address}</div>
                        <a href="tel:${h.phone}" style="display:inline-block; margin-top:8px; padding:8px 16px; background:var(--bg-color); color:var(--primary-color); text-decoration:none; border-radius:6px; border:1px solid var(--primary-color); font-weight:bold;">📞 撥打 ${h.phone}</a>
                    `;
                    hlist.appendChild(dom);
                });
            }

            // Pharmacies - 藥局清單
            const plist = document.getElementById('pharmacies-list');
            if (plist) {
                data.pharmacies.forEach(p => {
                    const dom = document.createElement('div');
                    dom.className = 'list-item';
                    dom.style.flexDirection = 'column';
                    dom.style.alignItems = 'flex-start';
                    dom.innerHTML = `
                        <div style="font-weight:bold; font-size:1.05em; color:var(--text-color);">
                            💊 ${p.name}
                        </div>
                        <div class="list-item-desc">${p.note}</div>
                    `;
                    plist.appendChild(dom);
                });
            }

            // Language Cards - 日語發音卡片
            const cards = document.getElementById('cards-list');
            if (cards) {
                data.cards.forEach(c => {
                    const dom = document.createElement('div');
                    dom.style.padding = '14px';
                    dom.style.background = '#f9f9f9';
                    dom.style.border = '1px solid #eee';
                    dom.style.borderRadius = '10px';
                    dom.style.marginBottom = '10px';
                    dom.innerHTML = `
                        <div style="color:#666; font-size:0.9em; margin-bottom:4px;">🇹🇼 ${c.chinese}</div>
                        <div style="font-weight:bold; font-size:1.3em; margin-bottom:4px;">🇯🇵 ${c.japanese}</div>
                        <div style="color:var(--primary-color); font-size:0.95em; font-family:monospace;">🔊 ${c.romaji}</div>
                    `;
                    cards.appendChild(dom);
                });
            }
        })
        .catch(err => console.error('Error loading emergency data:', err));
});
