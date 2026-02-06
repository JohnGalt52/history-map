/**
 * Wonders of the World - Ancient, Modern, Natural, and Notable
 */

class WondersModule {
    constructor(map) {
        this.map = map;
        this.wondersLayer = L.layerGroup();
        this.wonders = [];
        this.loaded = false;
        this.visible = false;
        
        this.categoryStyles = {
            'ancient': { color: '#FFD700', label: 'Ancient Wonder' },
            'modern': { color: '#4169E1', label: 'New 7 Wonder' },
            'natural': { color: '#228B22', label: 'Natural Wonder' },
            'notable': { color: '#9932CC', label: 'Notable Monument' }
        };
        
        this.loadData();
    }
    
    async loadData() {
        try {
            const response = await fetch('data/wonders.json');
            const data = await response.json();
            this.wonders = data.wonders;
            this.loaded = true;
            console.log(`Loaded ${this.wonders.length} wonders`);
        } catch (error) {
            console.error('Failed to load wonders:', error);
        }
    }
    
    addTo(map) {
        this.wondersLayer.addTo(map);
    }
    
    draw(year) {
        this.wondersLayer.clearLayers();
        if (!this.visible || !this.loaded) return;
        
        this.wonders.forEach(wonder => {
            // Check if wonder exists at this year
            const built = wonder.built || -100000;
            const destroyed = wonder.destroyed || 9999;
            
            if (year < built) return; // Not built yet
            
            const isDestroyed = wonder.destroyed && year > wonder.destroyed;
            const style = this.categoryStyles[wonder.category];
            
            const icon = L.divIcon({
                className: 'wonder-marker',
                html: `<div class="wonder-icon ${isDestroyed ? 'destroyed' : ''}" style="background: ${style.color};">${wonder.icon}</div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
            
            const marker = L.marker([wonder.lat, wonder.lng], { icon });
            
            marker.bindTooltip(`${wonder.icon} ${wonder.name}${isDestroyed ? ' (ruins)' : ''}`, {
                permanent: false,
                direction: 'top'
            });
            
            marker.bindPopup(this.createPopup(wonder, year, isDestroyed, style));
            this.wondersLayer.addLayer(marker);
        });
    }
    
    createPopup(wonder, year, isDestroyed, style) {
        return `
            <div class="wonder-popup" style="min-width: 280px;">
                <h3 style="margin: 0 0 10px 0; color: ${style.color}; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 28px;">${wonder.icon}</span>
                    ${wonder.name}
                </h3>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <span style="background: ${style.color}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">
                        ${style.label}
                    </span>
                    <span style="background: ${isDestroyed ? '#666' : '#27ae60'}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">
                        ${wonder.status}
                    </span>
                </div>
                <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${wonder.location}</p>
                ${wonder.built ? `<p style="margin: 5px 0;"><strong>🔨 Built:</strong> ${this.formatYear(wonder.built)}</p>` : ''}
                ${wonder.destroyed ? `<p style="margin: 5px 0;"><strong>💥 Destroyed:</strong> ${this.formatYear(wonder.destroyed)}</p>` : ''}
                ${wonder.builder ? `<p style="margin: 5px 0;"><strong>👷 Builder:</strong> ${wonder.builder}</p>` : ''}
                <p style="margin: 10px 0; padding: 10px; background: rgba(0,0,0,0.05); border-radius: 5px; border-left: 3px solid ${style.color};">
                    ${wonder.description}
                </p>
            </div>
        `;
    }
    
    toggle(show) {
        this.visible = show;
        if (!show) this.wondersLayer.clearLayers();
    }
    
    clear() {
        this.visible = false;
        this.wondersLayer.clearLayers();
    }
    
    formatYear(year) {
        if (year < 0) return `${Math.abs(year)} BCE`;
        return `${year} CE`;
    }
}

// Styles
const wonderStyles = document.createElement('style');
wonderStyles.textContent = `
    .wonder-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.4);
        border: 3px solid rgba(255,255,255,0.8);
        transition: transform 0.2s;
    }
    .wonder-icon:hover {
        transform: scale(1.2);
    }
    .wonder-icon.destroyed {
        opacity: 0.6;
        filter: grayscale(50%);
    }
    .wonder-marker {
        background: transparent !important;
        border: none !important;
    }
`;
document.head.appendChild(wonderStyles);

window.WondersModule = WondersModule;
