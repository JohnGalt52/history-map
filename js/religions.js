/**
 * Religions - Origins and spread of major world religions
 */

class ReligionsModule {
    constructor(map) {
        this.map = map;
        this.religionsLayer = L.layerGroup();
        this.spreadLayer = L.layerGroup();
        this.religions = [];
        this.loaded = false;
        this.visible = false;
        
        this.loadData();
    }
    
    async loadData() {
        try {
            const response = await fetch('data/religions.json');
            const data = await response.json();
            this.religions = data.religions;
            this.loaded = true;
            console.log(`Loaded ${this.religions.length} religions`);
        } catch (error) {
            console.error('Failed to load religions:', error);
        }
    }
    
    addTo(map) {
        this.religionsLayer.addTo(map);
        this.spreadLayer.addTo(map);
    }
    
    draw(year) {
        this.religionsLayer.clearLayers();
        this.spreadLayer.clearLayers();
        if (!this.visible || !this.loaded) return;
        
        this.religions.forEach(religion => {
            if (year < religion.origin.date) return;
            
            const isNew = year - religion.origin.date < 200;
            
            // Origin marker
            const icon = L.divIcon({
                className: 'religion-marker',
                html: `<div class="religion-icon" style="background: ${religion.color};">${religion.icon}</div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            });
            
            const marker = L.marker([religion.origin.lat, religion.origin.lng], { icon });
            
            marker.bindTooltip(`${religion.icon} ${religion.name} (origin)`, {
                permanent: false,
                direction: 'top'
            });
            
            marker.bindPopup(this.createPopup(religion, year));
            this.religionsLayer.addLayer(marker);
            
            // Draw spread lines and markers
            if (religion.spread) {
                religion.spread.forEach(spread => {
                    if (spread.year > year) return;
                    
                    const timeSince = year - spread.year;
                    const opacity = Math.max(0.3, 0.8 - timeSince / 1000);
                    
                    // Line from origin to spread point
                    const line = L.polyline([
                        [religion.origin.lat, religion.origin.lng],
                        [spread.lat, spread.lng]
                    ], {
                        color: religion.color,
                        weight: 2,
                        opacity: opacity * 0.6,
                        dashArray: '5, 5'
                    });
                    
                    line.bindTooltip(`${religion.icon} ${religion.name} → ${spread.region} (${this.formatYear(spread.year)})`, {
                        permanent: false
                    });
                    
                    this.spreadLayer.addLayer(line);
                    
                    // Spread point marker
                    const spreadMarker = L.circleMarker([spread.lat, spread.lng], {
                        radius: 8,
                        fillColor: religion.color,
                        color: '#fff',
                        weight: 2,
                        fillOpacity: opacity,
                        opacity: opacity
                    });
                    
                    spreadMarker.bindTooltip(`${religion.icon} ${spread.region}<br>${spread.event}`, {
                        permanent: false,
                        direction: 'top'
                    });
                    
                    this.spreadLayer.addLayer(spreadMarker);
                });
            }
        });
    }
    
    createPopup(religion, year) {
        const age = year - religion.origin.date;
        
        const spreadHtml = religion.spread 
            ? religion.spread
                .filter(s => s.year <= year)
                .map(s => `<li><strong>${this.formatYear(s.year)}:</strong> ${s.region} - ${s.event}</li>`)
                .join('')
            : '';
        
        return `
            <div class="religion-popup" style="min-width: 300px;">
                <h3 style="margin: 0 0 10px 0; color: ${religion.color}; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 32px;">${religion.icon}</span>
                    ${religion.name}
                </h3>
                
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 5px 15px; font-size: 13px; margin-bottom: 10px;">
                    <span style="color: #888;">Founded:</span>
                    <span>${this.formatYear(religion.origin.date)}, ${religion.origin.region}</span>
                    
                    <span style="color: #888;">Age:</span>
                    <span>${age.toLocaleString()} years old (in ${this.formatYear(year)})</span>
                    
                    <span style="color: #888;">Founder:</span>
                    <span>${religion.founder}</span>
                    
                    <span style="color: #888;">Today:</span>
                    <span>${religion.adherents_today}</span>
                </div>
                
                <div style="background: rgba(0,0,0,0.05); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                    <strong>Core Beliefs:</strong><br>
                    <span style="font-size: 13px;">${religion.core_beliefs}</span>
                </div>
                
                <div style="background: rgba(0,0,0,0.05); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                    <strong>Sacred Texts:</strong><br>
                    <span style="font-size: 13px;">${religion.sacred_texts.join(', ')}</span>
                </div>
                
                ${spreadHtml ? `
                    <div style="padding: 10px; background: rgba(${this.hexToRgb(religion.color)}, 0.1); border-radius: 5px; border-left: 3px solid ${religion.color};">
                        <strong style="color: ${religion.color};">Spread (by ${this.formatYear(year)}):</strong>
                        <ul style="margin: 5px 0 0 20px; padding: 0; font-size: 12px; max-height: 150px; overflow-y: auto;">
                            ${spreadHtml}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result 
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '100, 100, 100';
    }
    
    toggle(show) {
        this.visible = show;
        if (!show) {
            this.religionsLayer.clearLayers();
            this.spreadLayer.clearLayers();
        }
    }
    
    clear() {
        this.visible = false;
        this.religionsLayer.clearLayers();
        this.spreadLayer.clearLayers();
    }
    
    formatYear(year) {
        if (year < 0) return `${Math.abs(year)} BCE`;
        return `${year} CE`;
    }
}

// Styles
const religionStyles = document.createElement('style');
religionStyles.textContent = `
    .religion-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid rgba(255,255,255,0.8);
    }
    .religion-marker {
        background: transparent !important;
        border: none !important;
    }
`;
document.head.appendChild(religionStyles);

window.ReligionsModule = ReligionsModule;
