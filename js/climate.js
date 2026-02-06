/**
 * Climate Overlay - Historical climate events visualization
 * 
 * Shows ice ages, warming periods, droughts, and volcanic events
 * with their impacts on civilizations.
 */

class ClimateOverlay {
    constructor(map) {
        this.map = map;
        this.climateLayer = L.layerGroup();
        this.periods = [];
        this.loaded = false;
        this.visible = false;
        
        // Colors and styles by climate type
        this.typeStyles = {
            'ice-age': {
                color: '#74b9ff',
                fillColor: '#0984e3',
                icon: '🧊',
                label: 'Ice Age'
            },
            'cooling': {
                color: '#81ecec',
                fillColor: '#00cec9',
                icon: '❄️',
                label: 'Cooling Period'
            },
            'warming': {
                color: '#ffeaa7',
                fillColor: '#fdcb6e',
                icon: '☀️',
                label: 'Warming Period'
            },
            'drought': {
                color: '#e17055',
                fillColor: '#d63031',
                icon: '🏜️',
                label: 'Drought'
            },
            'volcanic': {
                color: '#636e72',
                fillColor: '#2d3436',
                icon: '🌋',
                label: 'Volcanic Winter'
            },
            'cold-snap': {
                color: '#a29bfe',
                fillColor: '#6c5ce7',
                icon: '🥶',
                label: 'Cold Snap'
            }
        };
        
        this.loadData();
    }
    
    async loadData() {
        try {
            const response = await fetch('data/climate.json');
            const data = await response.json();
            this.periods = data.periods;
            this.loaded = true;
            console.log(`Loaded ${this.periods.length} climate periods`);
        } catch (error) {
            console.error('Failed to load climate data:', error);
        }
    }
    
    addTo(map) {
        this.climateLayer.addTo(map);
    }
    
    draw(year) {
        this.climateLayer.clearLayers();
        
        if (!this.visible || !this.loaded) return null;
        
        // Find active climate events for this year
        const activeEvents = this.periods.filter(p => 
            year >= p.start && year <= p.end
        );
        
        activeEvents.forEach(event => {
            this.drawClimateEvent(event, year);
        });
        
        return activeEvents;
    }
    
    drawClimateEvent(event, year) {
        const style = this.typeStyles[event.type] || this.typeStyles['cooling'];
        
        // Calculate intensity based on position within event
        const eventDuration = event.end - event.start;
        const yearsSinceStart = year - event.start;
        const progress = yearsSinceStart / eventDuration;
        
        // Peak intensity in middle of event
        const temporalIntensity = Math.sin(progress * Math.PI);
        
        // Draw affected regions
        event.affected_regions.forEach(region => {
            const intensity = region.intensity * temporalIntensity;
            const radius = 80 + (intensity * 120); // 80-200px radius
            
            // Outer glow
            const glow = L.circle([region.lat, region.lng], {
                radius: radius * 1500, // Convert to meters roughly
                fillColor: style.fillColor,
                fillOpacity: intensity * 0.15,
                color: style.color,
                weight: 0
            });
            
            // Inner circle
            const circle = L.circle([region.lat, region.lng], {
                radius: radius * 800,
                fillColor: style.fillColor,
                fillOpacity: intensity * 0.3,
                color: style.color,
                weight: 2,
                opacity: intensity * 0.6,
                dashArray: event.type === 'drought' ? '10, 5' : null
            });
            
            // Popup with event info
            circle.bindPopup(this.createPopup(event, style));
            
            this.climateLayer.addLayer(glow);
            this.climateLayer.addLayer(circle);
        });
        
        // Add event marker at centroid
        const centroid = this.calculateCentroid(event.affected_regions);
        const marker = L.marker([centroid.lat, centroid.lng], {
            icon: L.divIcon({
                className: 'climate-marker',
                html: `<div class="climate-icon" style="background: ${style.fillColor};">${style.icon}</div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            })
        });
        
        marker.bindTooltip(`${style.icon} ${event.name}`, {
            permanent: false,
            direction: 'top'
        });
        
        marker.bindPopup(this.createPopup(event, style));
        this.climateLayer.addLayer(marker);
    }
    
    createPopup(event, style) {
        const impactsList = event.impacts.map(i => `<li>${i}</li>`).join('');
        
        return `
            <div class="climate-popup" style="min-width: 280px;">
                <h3 style="margin: 0 0 10px 0; color: ${style.fillColor}; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 24px;">${style.icon}</span>
                    ${event.name}
                </h3>
                <div style="background: rgba(0,0,0,0.05); padding: 8px; border-radius: 5px; margin-bottom: 10px;">
                    <strong>Type:</strong> ${style.label}<br>
                    <strong>Period:</strong> ${this.formatYear(event.start)} – ${this.formatYear(event.end)}<br>
                    <strong>Severity:</strong> ${this.getSeverityBadge(event.severity)}
                </div>
                <p style="margin: 10px 0; line-height: 1.5;">${event.description}</p>
                <div style="background: rgba(231, 76, 60, 0.1); padding: 10px; border-radius: 5px; border-left: 3px solid ${style.fillColor};">
                    <strong style="color: ${style.fillColor};">Historical Impacts:</strong>
                    <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px;">
                        ${impactsList}
                    </ul>
                </div>
            </div>
        `;
    }
    
    calculateCentroid(regions) {
        const sumLat = regions.reduce((sum, r) => sum + r.lat, 0);
        const sumLng = regions.reduce((sum, r) => sum + r.lng, 0);
        return {
            lat: sumLat / regions.length,
            lng: sumLng / regions.length
        };
    }
    
    getSeverityBadge(severity) {
        const badges = {
            'extreme': '<span style="background: #c0392b; color: white; padding: 2px 8px; border-radius: 3px;">Extreme</span>',
            'severe': '<span style="background: #e74c3c; color: white; padding: 2px 8px; border-radius: 3px;">Severe</span>',
            'moderate': '<span style="background: #f39c12; color: white; padding: 2px 8px; border-radius: 3px;">Moderate</span>',
            'beneficial': '<span style="background: #27ae60; color: white; padding: 2px 8px; border-radius: 3px;">Beneficial</span>'
        };
        return badges[severity] || severity;
    }
    
    formatYear(year) {
        if (year < 0) return `${Math.abs(year).toLocaleString()} BCE`;
        return `${year} CE`;
    }
    
    toggle(show) {
        this.visible = show;
        if (!show) {
            this.climateLayer.clearLayers();
        }
    }
    
    clear() {
        this.visible = false;
        this.climateLayer.clearLayers();
    }
    
    getSummary(year) {
        const activeEvents = this.periods.filter(p => 
            year >= p.start && year <= p.end
        );
        
        if (activeEvents.length === 0) {
            return {
                status: 'stable',
                label: '🌍',
                name: 'Stable Climate',
                events: []
            };
        }
        
        // Return most severe event
        const severityOrder = ['extreme', 'severe', 'moderate', 'beneficial'];
        activeEvents.sort((a, b) => 
            severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
        );
        
        const primary = activeEvents[0];
        const style = this.typeStyles[primary.type];
        
        return {
            status: primary.type,
            label: style.icon,
            name: primary.name,
            events: activeEvents
        };
    }
    
    // Get all events of a specific type
    getEventsByType(type) {
        return this.periods.filter(p => p.type === type);
    }
    
    // Get events affecting a specific region (by lat/lng proximity)
    getEventsNearLocation(lat, lng, radius = 20) {
        return this.periods.filter(event => 
            event.affected_regions.some(r => 
                Math.abs(r.lat - lat) < radius && Math.abs(r.lng - lng) < radius
            )
        );
    }
    
    // Get correlation between climate and civilization collapse
    getCollapseCorrelations() {
        const collapseEvents = this.periods.filter(p => 
            p.severity === 'severe' || p.severity === 'extreme'
        );
        
        return collapseEvents.map(e => ({
            name: e.name,
            period: `${this.formatYear(e.start)} – ${this.formatYear(e.end)}`,
            type: e.type,
            impacts: e.impacts.filter(i => 
                i.toLowerCase().includes('collapse') || 
                i.toLowerCase().includes('fell') ||
                i.toLowerCase().includes('destroyed')
            )
        }));
    }
}

// Add CSS for climate markers
const climateStyles = document.createElement('style');
climateStyles.textContent = `
    .climate-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid rgba(255,255,255,0.5);
    }
    .climate-marker {
        background: transparent !important;
        border: none !important;
    }
    .climate-popup h3 {
        border-bottom: 2px solid currentColor;
        padding-bottom: 8px;
    }
    .climate-popup ul li {
        margin: 4px 0;
        line-height: 1.4;
    }
`;
document.head.appendChild(climateStyles);

// Export
window.ClimateOverlay = ClimateOverlay;
