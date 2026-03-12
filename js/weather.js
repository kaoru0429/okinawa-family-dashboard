document.addEventListener('DOMContentLoaded', () => {
    // Check if we are in the weather subpage or index
    const isSubpage = document.getElementById('weather-current') !== null;
    
    // Path to data might differ if we are in /pages vs root
    const dataPath = isSubpage ? '../data/weather.json' : 'data/weather.json';

    fetch(dataPath)
        .then(res => res.json())
        .then(data => {
            if (isSubpage) {
                // Render detailed weather page
                document.getElementById('weather-current').textContent = `${data.current.temp}°C`;
                document.getElementById('weather-desc').textContent = `${data.current.description} - ${data.current.suggestion}`;
                
                // Forecast
                const fcContainer = document.getElementById('weather-forecast');
                data.forecast.forEach(f => {
                    const item = document.createElement('div');
                    item.className = 'list-item';
                    item.innerHTML = `
                        <span class="list-item-title">${f.time}</span>
                        <span>${f.weather}</span>
                        <span style="font-weight:bold;">${f.temp}°C</span>
                    `;
                    fcContainer.appendChild(item);
                });

                // Outfit
                document.getElementById('outfit-adult').textContent = data.outfit.adult;
                document.getElementById('outfit-child').textContent = data.outfit.child;
            } else {
                // Render index widget (handled in app.js, this is just a safeguard or separated logic)
                const tempEl = document.getElementById('current-temp');
                const suggEl = document.getElementById('weather-suggestion');
                if (tempEl && data.current) tempEl.textContent = `${data.current.temp}°C`;
                if (suggEl && data.current) suggEl.textContent = data.current.suggestion;
            }
        })
        .catch(err => console.error('Error loading weather data:', err));
});
