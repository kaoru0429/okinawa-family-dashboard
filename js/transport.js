document.addEventListener('DOMContentLoaded', () => {
    fetch('../data/transport.json')
        .then(res => res.json())
        .then(data => {
            // Header Info
            const info = document.getElementById('transport-info');
            if (info) info.innerHTML = `<strong>${data.day} (${data.date})</strong> / ${data.transport_type}`;

            // Stations (橫向捲動或列表)
            const stationsList = document.getElementById('stations-list');
            if (stationsList && data.stations) {
                data.stations.forEach(s => {
                    const chip = document.createElement('span');
                    chip.style.display = 'inline-block';
                    chip.style.padding = '4px 12px';
                    chip.style.margin = '4px';
                    chip.style.background = '#eee';
                    chip.style.borderRadius = '20px';
                    chip.style.fontSize = '0.9em';
                    chip.textContent = s.name;
                    stationsList.appendChild(chip);
                });
            }

            // Steps
            const slist = document.getElementById('steps-list');
            if (slist) {
                data.steps.forEach(s => {
                    const dom = document.createElement('div');
                    dom.className = 'step-container';
                    dom.innerHTML = `
                        <div style="z-index:1;"><span class="step-num">${s.step}</span></div>
                        <div style="flex:1; padding-top:4px;">
                            <div style="font-weight:bold; font-size:1.1em; margin-bottom:4px; color:var(--text-color);">${s.title}</div>
                            <div style="color:#666; font-size:0.95em; line-height:1.4;">${s.detail}</div>
                        </div>
                    `;
                    slist.appendChild(dom);
                });
            }

            // Backup Plan
            if (data.backup_plan) {
                const bTitle = document.getElementById('backup-title');
                const bDesc = document.getElementById('backup-desc');
                const bCost = document.getElementById('backup-cost');
                if (bTitle) bTitle.textContent = data.backup_plan.title;
                if (bDesc) bDesc.textContent = data.backup_plan.description;
                if (bCost) bCost.textContent = `預估費用: ${data.backup_plan.estimated_cost}`;
            }
        })
        .catch(err => console.error('Transport render fail:', err));
});
