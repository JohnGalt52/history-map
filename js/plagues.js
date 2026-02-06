/**
 * Plagues & Pandemics - Major disease outbreaks throughout history
 */

class PlaguesModule {
    constructor(map) {
        this.map = map;
        this.plaguesLayer = L.layerGroup();
        this.plagues = [];
        this.loaded = false;
        this.visible = false;
        
        this.loadData();
    }
    
    async loadData() {
        try {
            const response = await fetch('data/plagues.json');
            const data = await response.json();
            this.plagues = data.plagues;
            this.loaded = true;
            console.log(`Loaded ${this.plagues.length} plagues/pandemics`);
        } catch (error) {
            console.error('Failed to load plagues:', error);
        }
    }
    
    addTo(map) {
        this.plaguesLayer.addTo(map);
    }
    
    draw(year) {
        this.plaguesLayer.clearLayers();
        if (!this.visible || !this.loaded) return;
        
        this.plagues.forEach(plague => {
            const endYear = plague.end || 2100;
            const isActive = year >= plague.start && year <= endYear;
            const isPast = year > endYear;
            const isFuture = year < plague.start;
            
            if (isFuture) return;
            
            // Draw origin marker
            const origin = plague.origin;
            
            const icon = L.divIcon({
                className: 'plague-marker',
                html: `<div class="plague-icon ${isActive ? 'active' : ''}" style="background: ${plague.color};">${plague.icon}</div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
            
            const marker = L.marker([origin.lat, origin.lng], { icon });
            
            marker.bindTooltip(`${plague.icon} ${plague.name}${isActive ? ' (ACTIVE)' : ''}`, {
                permanent: false,
                direction: 'top'
            });
            
            marker.bindPopup(this.createPopup(plague, isActive));
            this.plaguesLayer.addLayer(marker);
            
            // Draw spread regions if active
            if (isActive || isPast) {
                plague.spread_regions.forEach(region => {
                    const spreadOpacity = isActive ? 0.4 : 0.15;
                    const spreadRadius = isActive ? 300000 : 150000;
                    
                    const circle = L.circle([region.lat, region.lng], {
                        radius: spreadRadius,
                        fillColor: plague.color,
                        color: plague.color,
                        weight: isActive ? 2 : 1,
                        fillOpacity: spreadOpacity,
                        opacity: isActive ? 0.6 : 0.3
                    });
                    
                    circle.bindTooltip(`${plague.icon} ${plague.name}<br>${region.region}: ${region.deaths}`, {
                        permanent: false
                    });
                    
                    this.plaguesLayer.addLayer(circle);
                });
            }
            
            // Pulsing death zone for active plagues
            if (isActive) {
                plague.spread_regions.forEach(region => {
                    const pulse = L.circle([region.lat, region.lng], {
                        radius: 400000,
                        fillColor: plague.color,
                        color: plague.color,
                        weight: 0,
                        fillOpacity: 0.15,
                        className: 'plague-pulse'
                    });
                    this.plaguesLayer.addLayer(pulse);
                });
            }
        });
    }
    
    createPopup(plague, isActive) {
        const statusBadge = isActive 
            ? '<span style="background: #e74c3c; color: white; padding: 3px 8px; border-radius: 3px; animation: blink 1s infinite;">☠️ PANDEMIC ACTIVE</span>'
            : '<span style="background: #666; color: white; padding: 3px 8px; border-radius: 3px;">📜 Historical</span>';
        
        const spreadHtml = plague.spread_regions.map(r => 
            `<li><strong>${r.region}:</strong> ${r.deaths}</li>`
        ).join('');
        
        return `
            <div class="plague-popup" style="min-width: 300px;">
                <h3 style="margin: 0 0 10px 0; color: ${plague.color}; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 28px;">${plague.icon}</span>
                    ${plague.name}
                </h3>
                <div style="margin-bottom: 10px;">
                    ${statusBadge}
                </div>
                
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 5px 15px; font-size: 13px; margin-bottom: 10px;">
                    <span style="color: #888;">Period:</span>
                    <span>${this.formatYear(plague.start)} – ${plague.end ? this.formatYear(plague.end) : 'Ongoing'}</span>
                    
                    <span style="color: #888;">Pathogen:</span>
                    <span>${plague.pathogen}</span>
                    
                    <span style="color: #888;">Origin:</span>
                    <span>${plague.origin.region}</span>
                    
                    <span style="color: #888;">Deaths:</span>
                    <span style="color: #e74c3c; font-weight: bold;">${plague.deaths}</span>
                    
                    <span style="color: #888;">Mortality:</span>
                    <span style="color: #e74c3c;">${plague.mortality_rate}</span>
                </div>
                
                <div style="background: rgba(0,0,0,0.05); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                    <strong>Description:</strong><br>
                    <span style="font-size: 13px;">${plague.description}</span>
                </div>
                
                <div style="background: rgba(231, 76, 60, 0.1); padding: 10px; border-radius: 5px; margin-bottom: 10px; border-left: 3px solid ${plague.color};">
                    <strong style="color: ${plague.color};">Affected Regions:</strong>
                    <ul style="margin: 5px 0 0 20px; padding: 0; font-size: 12px;">
                        ${spreadHtml}
                    </ul>
                </div>
                
                <div style="background: rgba(52, 152, 219, 0.1); padding: 10px; border-radius: 5px; border-left: 3px solid #3498db;">
                    <strong>Historical Impact:</strong><br>
                    <span style="font-size: 13px;">${plague.historical_impact}</span>
                </div>
                
                <div style="margin-top: 10px; font-size: 11px; color: #888;">
                    📚 ${plague.sources.join(', ')}
                </div>
            </div>
        `;
    }
    
    toggle(show) {
        this.visible = show;
        if (!show) this.plaguesLayer.clearLayers();
    }
    
    clear() {
        this.visible = false;
        this.plaguesLayer.clearLayers();
    }
    
    formatYear(year) {
        if (year < 0) return `${Math.abs(year)} BCE`;
        return `${year} CE`;
    }
    
    getActivePlagues(year) {
        return this.plagues.filter(p => {
            const endYear = p.end || 2100;
            return year >= p.start && year <= endYear;
        });
    }
}

// Styles
const plagueStyles = document.createElement('style');
plagueStyles.textContent = `
    .plague-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
        border: 3px solid rgba(255,255,255,0.6);
    }
    .plague-icon.active {
        animation: plague-glow 1.5s infinite;
    }
    @keyframes plague-glow {
        0%, 100% { box-shadow: 0 0 10px rgba(231, 76, 60, 0.8); }
        50% { box-shadow: 0 0 25px rgba(231, 76, 60, 1); }
    }
    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
    .plague-marker {
        background: transparent !important;
        border: none !important;
    }
    .plague-pulse {
        animation: plague-spread 3s infinite;
    }
    @keyframes plague-spread {
        0% { opacity: 0.3; }
        50% { opacity: 0.1; }
        100% { opacity: 0.3; }
    }
`;
document.head.appendChild(plagueStyles);

window.PlaguesModule = PlaguesModule;
