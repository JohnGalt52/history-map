/**
 * Wars & Conflicts - Major historical wars with battles and outcomes
 */

class WarsModule {
    constructor(map) {
        this.map = map;
        this.warsLayer = L.layerGroup();
        this.wars = [];
        this.loaded = false;
        this.visible = false;
        
        this.loadData();
    }
    
    async loadData() {
        try {
            const response = await fetch('data/wars.json');
            const data = await response.json();
            this.wars = data.wars;
            this.loaded = true;
            console.log(`Loaded ${this.wars.length} wars`);
        } catch (error) {
            console.error('Failed to load wars:', error);
        }
    }
    
    addTo(map) {
        this.warsLayer.addTo(map);
    }
    
    draw(year) {
        this.warsLayer.clearLayers();
        if (!this.visible || !this.loaded) return;
        
        this.wars.forEach(war => {
            const isActive = year >= war.start && year <= war.end;
            const isPast = year > war.end;
            const isFuture = year < war.start;
            
            if (isFuture) return;
            
            const color = isActive ? '#e74c3c' : '#888';
            const radius = isActive ? 25 : 15;
            
            // War zone marker
            const marker = L.circleMarker([war.location.lat, war.location.lng], {
                radius: radius,
                fillColor: color,
                color: isActive ? '#fff' : '#666',
                weight: isActive ? 3 : 1,
                fillOpacity: isActive ? 0.6 : 0.3,
                className: isActive ? 'war-active' : ''
            });
            
            marker.bindTooltip(`⚔️ ${war.name}${isActive ? ' (ONGOING)' : ''}`, {
                permanent: false,
                direction: 'top'
            });
            
            marker.bindPopup(this.createPopup(war, isActive, isPast));
            this.warsLayer.addLayer(marker);
            
            // Pulsing effect for active wars
            if (isActive) {
                const pulse = L.circleMarker([war.location.lat, war.location.lng], {
                    radius: radius + 15,
                    fillColor: '#e74c3c',
                    color: '#e74c3c',
                    weight: 2,
                    fillOpacity: 0.2,
                    opacity: 0.4
                });
                this.warsLayer.addLayer(pulse);
            }
        });
    }
    
    createPopup(war, isActive, isPast) {
        const statusBadge = isActive 
            ? '<span style="background: #e74c3c; color: white; padding: 3px 8px; border-radius: 3px;">⚔️ ACTIVE</span>'
            : isPast 
                ? '<span style="background: #666; color: white; padding: 3px 8px; border-radius: 3px;">📜 Historical</span>'
                : '';
        
        const battlesHtml = war.battles 
            ? war.battles.map(b => `<li>${b}</li>`).join('')
            : '';
        
        return `
            <div class="war-popup" style="min-width: 300px; max-width: 350px;">
                <h3 style="margin: 0 0 10px 0; color: #e74c3c;">
                    ⚔️ ${war.name}
                </h3>
                <div style="margin-bottom: 10px;">
                    ${statusBadge}
                </div>
                
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 5px 15px; font-size: 13px; margin-bottom: 10px;">
                    <span style="color: #888;">Period:</span>
                    <span>${this.formatYear(war.start)} – ${this.formatYear(war.end)}</span>
                    
                    <span style="color: #888;">Belligerents:</span>
                    <span>${war.belligerents.join(' vs ')}</span>
                    
                    <span style="color: #888;">Victor:</span>
                    <span style="color: #27ae60; font-weight: bold;">${war.victor}</span>
                    
                    <span style="color: #888;">Casualties:</span>
                    <span style="color: #e74c3c;">${war.casualties}</span>
                    
                    <span style="color: #888;">Theater:</span>
                    <span>${war.theater}</span>
                </div>
                
                ${battlesHtml ? `
                    <div style="background: rgba(0,0,0,0.05); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                        <strong style="color: #e74c3c;">Major Battles:</strong>
                        <ul style="margin: 5px 0 0 20px; padding: 0; font-size: 12px;">
                            ${battlesHtml}
                        </ul>
                    </div>
                ` : ''}
                
                <div style="padding: 10px; background: rgba(231, 76, 60, 0.1); border-radius: 5px; border-left: 3px solid #e74c3c;">
                    <strong>Outcome:</strong><br>
                    <span style="font-size: 13px;">${war.outcome}</span>
                </div>
                
                <div style="margin-top: 10px; padding: 10px; background: rgba(52, 152, 219, 0.1); border-radius: 5px; border-left: 3px solid #3498db;">
                    <strong>Historical Significance:</strong><br>
                    <span style="font-size: 13px;">${war.significance}</span>
                </div>
            </div>
        `;
    }
    
    toggle(show) {
        this.visible = show;
        if (!show) this.warsLayer.clearLayers();
    }
    
    clear() {
        this.visible = false;
        this.warsLayer.clearLayers();
    }
    
    formatYear(year) {
        if (year < 0) return `${Math.abs(year)} BCE`;
        return `${year} CE`;
    }
    
    getActiveWars(year) {
        return this.wars.filter(w => year >= w.start && year <= w.end);
    }
}

// Styles
const warStyles = document.createElement('style');
warStyles.textContent = `
    .war-active {
        animation: war-pulse 2s infinite;
    }
    @keyframes war-pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 0.9; }
    }
`;
document.head.appendChild(warStyles);

window.WarsModule = WarsModule;
