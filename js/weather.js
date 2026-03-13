document.addEventListener('DOMContentLoaded', () => {
    const isSubpage = document.getElementById('weather-current') !== null;
    const dataPath = isSubpage ? '../data/weather.json' : 'data/weather.json';

    fetch(dataPath)
        .then(res => res.json())
        .then(data => {
            if (isSubpage) {
                // 詳細頁面渲染
                document.getElementById('weather-current').textContent = `${data.main.temp}°C`;
                document.getElementById('weather-desc').textContent = data.weather[0].description;
                
                // 動態建議 (基於 pop 降雨機率)
                let extraTip = data.pop > 0.5 ? " ⚠️ 降雨機率高，出門記得帶傘！" : "";
                document.getElementById('weather-desc').textContent += extraTip;

                // 預報渲染 (list 陣列)
                const fcContainer = document.getElementById('weather-forecast');
                if (data.list) {
                    data.list.forEach(f => {
                        const timeStr = f.dt_txt.split(' ')[1].substring(0, 5);
                        const item = document.createElement('div');
                        item.className = 'list-item';
                        item.innerHTML = `
                            <span class="list-item-title">${timeStr}</span>
                            <span>${f.pop > 0.3 ? '🌦️' : '☀️'} (${Math.round(f.pop * 100)}%)</span>
                            <span style="font-weight:bold;">${f.main.temp}°C</span>
                        `;
                        fcContainer.appendChild(item);
                    });
                }

                document.getElementById('outfit-adult').textContent = data.outfit.adult + (data.pop > 0.5 ? " (建議帶傘)" : "");
                document.getElementById('outfit-child').textContent = data.outfit.child + (data.pop > 0.5 ? " (建議帶推車雨罩)" : "");
            } else {
                // 首頁 Widget 渲染
                const tempEl = document.getElementById('current-temp');
                const suggEl = document.getElementById('weather-suggestion');
                if (tempEl) tempEl.textContent = `${data.main.temp}°C`;
                if (suggEl) {
                    let text = data.custom_suggestion;
                    if (data.pop > 0.5) text = "☔ 今天降雨機率高，帶傘比較保險喔！";
                    suggEl.textContent = text;
                }
            }
        })
        .catch(err => {
            console.error('Weather load fail:', err);
            const suggEl = document.getElementById('weather-suggestion');
            if (suggEl) suggEl.textContent = "天氣資訊暫時無法取得，請參考預報。";
        });
});
