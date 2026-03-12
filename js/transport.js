document.addEventListener('DOMContentLoaded', () => {
    fetch('../data/transport.json')
        .then(res => res.json())
        .then(data => {
            // Header Info
            const info = document.getElementById('transport-info');
            info.innerHTML = `<strong>${data.day} (${data.date})</strong> / ${data.transport_type}`;

            // Steps
            const slist = document.getElementById('steps-list');
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

            // Backup Plan
            if (data.backup_plan) {
                document.getElementById('backup-title').textContent = data.backup_plan.title;
                document.getElementById('backup-desc').textContent = data.backup_plan.description;
                document.getElementById('backup-cost').textContent = `預估費用: ${data.backup_plan.estimated_cost}`;
            }
        })
        .catch(err => console.error('Error loading transport data:', err));
});
