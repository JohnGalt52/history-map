/**
 * Population Heatmap - Historical demographics visualization
 * 
 * Shows population distribution across time with intensity-based
 * circles representing population centers.
 */

class PopulationMap {
    constructor(map) {
        this.map = map;
        this.popLayer = L.layerGroup();
        this.snapshots = [];
        this.loaded = false;
        this.visible = false;
        
        // Color scale for density
        this.densityColors = {
            'low': { fill: '#3498db', opacity: 0.3 },
            'medium': { fill: '#f39c12', opacity: 0.5 },
            'high': { fill: '#e74c3c', opacity: 0.7 }
        };
        
        this.loadData();
    }
    
    async loadData() {
        try {
            const response = await fetch('data/population.json');
            const data = await response.json();
            this.snapshots = data.snapshots;
            this.loaded = true;
            console.log(`Loaded ${this.snapshots.length} population snapshots`);
        } catch (error) {
            console.error('Failed to load population data:', error);
        }
    }
    
    addTo(map) {
        this.popLayer.addTo(map);
    }
    
    draw(year) {
        this.popLayer.clearLayers();
        
        if (!this.visible || !this.loaded) return null;
        
        // Find closest snapshot
        const snapshot = this.findClosestSnapshot(year);
        if (!snapshot) return null;
        
        // Draw population circles
        snapshot.regions.forEach(region => {
            const sizeScale = this.getRadiusScale(region.population, snapshot.total);
            const colors = this.densityColors[region.density] || this.densityColors['medium'];
            
            // Main population circle
            const circle = L.circleMarker([region.lat, region.lng], {
                radius: sizeScale,
                fillColor: colors.fill,
                color: colors.fill,
                weight: 1,
                opacity: colors.opacity + 0.2,
                fillOpacity: colors.opacity
            });
            
            // Format population for tooltip
            const popFormatted = this.formatPopulation(region.population);
            const percentOfWorld = ((region.population / snapshot.total) * 100).toFixed(1);
            
            circle.bindTooltip(`
                <strong>${region.name}</strong><br>
                👥 ${popFormatted}<br>
                📊 ${percentOfWorld}% of world<br>
                📈 Density: ${region.density}
            `, { permanent: false, direction: 'top' });
            
            // Click for detailed popup
            circle.bindPopup(`
                <div style="min-width: 200px;">
                    <h3 style="margin: 0 0 10px 0; color: ${colors.fill};">${region.name}</h3>
                    <p><strong>Population:</strong> ${popFormatted}</p>
                    <p><strong>Share of world:</strong> ${percentOfWorld}%</p>
                    <p><strong>Density:</strong> ${this.getDensityLabel(region.density)}</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;">
                    <p style="font-size: 12px; color: #666;">
                        Year: ${this.formatYear(snapshot.year)}<br>
                        World total: ${this.formatPopulation(snapshot.total)}
                    </p>
                </div>
            `);
            
            this.popLayer.addLayer(circle);
            
            // Add glow effect for high density
            if (region.density === 'high') {
                const glow = L.circleMarker([region.lat, region.lng], {
                    radius: sizeScale + 8,
                    fillColor: colors.fill,
                    color: colors.fill,
                    weight: 0,
                    opacity: 0,
                    fillOpacity: 0.15
                });
                this.popLayer.addLayer(glow);
            }
        });
        
        return {
            year: snapshot.year,
            total: snapshot.total,
            notes: snapshot.notes
        };
    }
    
    findClosestSnapshot(year) {
        if (!this.snapshots.length) return null;
        
        let closest = this.snapshots[0];
        let minDiff = Math.abs(year - closest.year);
        
        for (const snapshot of this.snapshots) {
            const diff = Math.abs(year - snapshot.year);
            if (diff < minDiff) {
                minDiff = diff;
                closest = snapshot;
            }
        }
        
        return closest;
    }
    
    getRadiusScale(population, total) {
        // Scale radius based on population percentage
        const percent = population / total;
        // Min 8px, max 50px, scaled by sqrt for visual balance
        return Math.max(8, Math.min(50, Math.sqrt(percent) * 150));
    }
    
    formatPopulation(thousands) {
        if (thousands >= 1000000) {
            return (thousands / 1000000).toFixed(2) + ' billion';
        } else if (thousands >= 1000) {
            return (thousands / 1000).toFixed(1) + ' million';
        } else {
            return thousands.toLocaleString() + ' thousand';
        }
    }
    
    getDensityLabel(density) {
        const labels = {
            'low': '🟢 Low (sparse settlement)',
            'medium': '🟡 Medium (agricultural)',
            'high': '🔴 High (urban centers)'
        };
        return labels[density] || density;
    }
    
    formatYear(year) {
        if (year < 0) return `${Math.abs(year).toLocaleString()} BCE`;
        return `${year} CE`;
    }
    
    toggle(show) {
        this.visible = show;
        if (!show) {
            this.popLayer.clearLayers();
        }
    }
    
    clear() {
        this.visible = false;
        this.popLayer.clearLayers();
    }
    
    getSummary(year) {
        const snapshot = this.findClosestSnapshot(year);
        if (!snapshot) return null;
        
        return {
            year: snapshot.year,
            total: snapshot.total,
            formatted: this.formatPopulation(snapshot.total),
            regionCount: snapshot.regions.length,
            notes: snapshot.notes
        };
    }
    
    // Get population growth rate between two years
    getGrowthRate(year1, year2) {
        const snap1 = this.findClosestSnapshot(year1);
        const snap2 = this.findClosestSnapshot(year2);
        
        if (!snap1 || !snap2) return null;
        
        const years = snap2.year - snap1.year;
        const growth = snap2.total / snap1.total;
        const annualRate = Math.pow(growth, 1 / years) - 1;
        
        return {
            from: snap1.year,
            to: snap2.year,
            startPop: snap1.total,
            endPop: snap2.total,
            totalGrowth: ((growth - 1) * 100).toFixed(1) + '%',
            annualRate: (annualRate * 100).toFixed(3) + '%'
        };
    }
    
    // Get top regions by population for a year
    getTopRegions(year, limit = 5) {
        const snapshot = this.findClosestSnapshot(year);
        if (!snapshot) return [];
        
        return snapshot.regions
            .sort((a, b) => b.population - a.population)
            .slice(0, limit)
            .map(r => ({
                name: r.name,
                population: this.formatPopulation(r.population),
                percent: ((r.population / snapshot.total) * 100).toFixed(1) + '%'
            }));
    }
}

// Export
window.PopulationMap = PopulationMap;
