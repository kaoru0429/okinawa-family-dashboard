document.addEventListener('DOMContentLoaded', () => {
    fetch('../data/emergency.json')
        .then(res => res.json())
        .then(data => {
            // Contacts
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

            // Hospitals
            const hlist = document.getElementById('hospitals-list');
            if (hlist) {
                data.hospitals.forEach(h => {
                    const dom = document.createElement('div');
                    dom.className = 'list-item';
                    dom.style.flexDirection = 'column';
                    dom.style.alignItems = 'flex-start';
                    
                    const pedLabel = h.hasPediatrics ? '<span style="background:var(--danger-color); color:white; padding:2px 8px; border-radius:4px; font-size:0.75em; margin-left:8px;">小児科</span>' : '';
                    const h24Label = h.is24h ? '<span style="background:var(--text-color); color:white; padding:2px 8px; border-radius:4px; font-size:0.75em; margin-left:4px;">24H</span>' : '';

                    const mapLink = h.lat ? `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}&travelmode=driving` : `https://maps.google.com/?q=${encodeURIComponent(h.name + ' 沖繩')}`;

                    dom.innerHTML = `
                        <div style="font-weight:bold; font-size:1.1em; color:var(--text-color);">
                            ${h.name} ${pedLabel}${h24Label}
                        </div>
                        <div class="list-item-desc">📍 ${h.address}</div>
                        <div class="list-item-desc" style="margin-top:4px; font-size:0.85em; color:var(--text-color); opacity:0.9;">ℹ️ ${h.support || ''}</div>
                        <div style="display:flex; gap:8px; margin-top:12px; width:100%;">
                            <a href="tel:${h.phone}" class="btn btn-primary" style="flex:1; padding:8px; text-decoration:none; text-align:center; display:flex; justify-content:center; align-items:center; border-radius:6px; font-weight:bold;">📞 撥打</a>
                            <a href="${mapLink}" target="_blank" class="btn btn-success" style="flex:1; padding:8px; text-decoration:none; text-align:center; display:flex; justify-content:center; align-items:center; border-radius:6px; font-weight:bold;">📍 導航</a>
                        </div>
                    `;
                    hlist.appendChild(dom);
                });
            }

            // Pharmacies
            const plist = document.getElementById('pharmacies-list');
            if (plist) {
                data.pharmacies.forEach(p => {
                    const dom = document.createElement('div');
                    dom.className = 'list-item';
                    dom.style.flexDirection = 'column';
                    dom.style.alignItems = 'flex-start';
                    const mapLink = p.lat ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=driving` : `https://maps.google.com/?q=${encodeURIComponent(p.name + ' 沖繩')}`;
                    dom.innerHTML = `
                        <div style="font-weight:bold; font-size:1.05em; color:var(--text-color);">
                            💊 ${p.name}
                        </div>
                        <div class="list-item-desc">${p.note}</div>
                        <div style="margin-top:10px; width:100%;">
                            <a href="${mapLink}" target="_blank" class="btn btn-success" style="display:inline-block; width:100%; padding:8px; text-decoration:none; text-align:center; border-radius:6px; font-weight:bold;">📍 導航前往</a>
                        </div>
                    `;
                    plist.appendChild(dom);
                });
            }

            // Language Cards
            const cards = document.getElementById('cards-list');
            if (cards) {
                data.cards.forEach(c => {
                    const dom = document.createElement('div');
                    dom.style.padding = '14px';
                    dom.style.background = 'var(--bg-color)';
                    dom.style.borderRadius = '10px';
                    dom.style.marginBottom = '10px';
                    dom.innerHTML = `
                        <div style="color:var(--text-color); opacity:0.8; font-size:0.9em; margin-bottom:4px;">🇹🇼 ${c.chinese}</div>
                        <div style="font-weight:bold; font-size:1.3em; margin-bottom:4px;">🇯🇵 ${c.japanese}</div>
                        <div style="color:var(--primary-color); font-size:0.95em; font-family:monospace;">🔊 ${c.romaji}</div>
                    `;
                    cards.appendChild(dom);
                });
            }
        })
        .catch(err => console.error('Emergency render fail:', err));
});
