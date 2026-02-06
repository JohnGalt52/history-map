/**
 * Trade Routes - Visualize historical trade networks
 * 
 * Enhanced version loading from GeoJSON with 27 major routes,
 * academic sources, peak periods, and animated flow.
 */

class TradeRoutes {
    constructor(map) {
        this.map = map;
        this.routeLayers = L.layerGroup();
        this.markerLayers = L.layerGroup();
        this.animationFrames = [];
        this.isAnimating = false;
        this.routes = [];
        this.loaded = false;
        
        // Colors by route type
        this.colors = {
            land: {
                primary: '#e74c3c',
                secondary: '#c0392b',
                tertiary: '#a93226'
            },
            maritime: {
                primary: '#3498db',
                secondary: '#2980b9',
                tertiary: '#1f618d'
            }
        };
        
        // Load routes from GeoJSON
        this.loadRoutes();
    }
    
    async loadRoutes() {
        try {
            const response = await fetch('data/trade-routes.geojson');
            const data = await response.json();
            
            // Transform GeoJSON features to internal format
            this.routes = data.features.map((feature, index) => {
                const props = feature.properties;
                const coords = feature.geometry.coordinates;
                
                // Convert [lon, lat] to [lat, lon] for Leaflet
                const path = coords.map(c => [c[1], c[0]]);
                
                // Assign colors based on type and index
                const typeColors = this.colors[props.type] || this.colors.land;
                const colorKeys = Object.keys(typeColors);
                const color = typeColors[colorKeys[index % colorKeys.length]];
                
                return {
                    id: props.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    name: props.name,
                    type: props.type,
                    startYear: props.active_period.start,
                    endYear: props.active_period.end,
                    peakStart: props.peak_period?.start || props.active_period.start,
                    peakEnd: props.peak_period?.end || props.active_period.end,
                    color: color,
                    width: props.type === 'maritime' ? 3 : 4,
                    goods: props.goods,
                    cities: props.key_cities,
                    description: props.description,
                    sources: props.sources,
                    path: path
                };
            });
            
            this.loaded = true;
            console.log(`Loaded ${this.routes.length} trade routes from GeoJSON`);
        } catch (error) {
            console.error('Failed to load trade routes, using fallback:', error);
            this.loadFallbackRoutes();
        }
    }
    
    loadFallbackRoutes() {
        // Minimal fallback if GeoJSON fails to load
        this.routes = [
            {
                id: 'silk-road',
                name: 'Silk Road',
                type: 'land',
                startYear: -200,
                endYear: 1450,
                peakStart: 100,
                peakEnd: 250,
                color: '#e74c3c',
                width: 4,
                goods: ['Silk', 'Spices', 'Gold', 'Jade', 'Horses', 'Paper', 'Gunpowder'],
                cities: ["Chang'an", 'Kashgar', 'Samarkand', 'Baghdad', 'Constantinople'],
                description: 'Connected East and West for 1,600 years.',
                sources: ['Hansen, Valerie. The Silk Road: A New History (2012)'],
                path: [
                    [34.27, 108.95], [36.06, 103.83], [39.47, 75.99],
                    [39.65, 66.96], [37.58, 61.84], [35.69, 51.39],
                    [33.31, 44.37], [36.20, 37.16], [41.01, 28.98]
                ]
            }
        ];
        this.loaded = true;
    }
    
    toggle(show) {
        if (show) {
            this.routeLayers.addTo(this.map);
            this.markerLayers.addTo(this.map);
        } else {
            this.routeLayers.remove();
            this.markerLayers.remove();
            this.stopAnimation();
        }
    }
    
    drawRoutes(currentYear) {
        this.routeLayers.clearLayers();
        this.markerLayers.clearLayers();
        
        if (!this.loaded) return 0;
        
        const activeRoutes = this.routes.filter(route => 
            currentYear >= route.startYear && currentYear <= route.endYear
        );
        
        activeRoutes.forEach(route => {
            const isPeak = currentYear >= route.peakStart && currentYear <= route.peakEnd;
            const opacity = isPeak ? 0.9 : 0.5;
            const weight = isPeak ? route.width + 1 : route.width;
            
            // Draw route line
            const polyline = L.polyline(route.path, {
                color: route.color,
                weight: weight,
                opacity: opacity,
                dashArray: route.type === 'maritime' ? '10, 5' : null,
                lineCap: 'round',
                lineJoin: 'round'
            });
            
            // Rich popup with all metadata
            const popupContent = this.createPopup(route, currentYear, isPeak);
            polyline.bindPopup(popupContent, { maxWidth: 350 });
            
            // Hover effect
            polyline.on('mouseover', function() {
                this.setStyle({ weight: weight + 2, opacity: 1 });
            });
            polyline.on('mouseout', function() {
                this.setStyle({ weight: weight, opacity: opacity });
            });
            
            this.routeLayers.addLayer(polyline);
            
            // Add city markers for peak routes
            if (isPeak && route.cities) {
                this.addCityMarkers(route, opacity);
            }
        });
        
        return activeRoutes.length;
    }
    
    createPopup(route, currentYear, isPeak) {
        const peakStatus = isPeak 
            ? '<span style="color: #27ae60; font-weight: bold;">📈 PEAK PERIOD</span>' 
            : '<span style="color: #95a5a6;">Active</span>';
        
        const typeIcon = route.type === 'maritime' ? '⛵' : '🐪';
        const typeLabel = route.type === 'maritime' ? 'Maritime Route' : 'Land Route';
        
        return `
            <div class="route-popup" style="min-width: 280px;">
                <h3 style="margin: 0 0 8px 0; color: ${route.color}; border-bottom: 2px solid ${route.color}; padding-bottom: 5px;">
                    ${route.name}
                </h3>
                <p style="margin: 5px 0;">
                    <strong>${typeIcon} ${typeLabel}</strong> | ${peakStatus}
                </p>
                <p style="margin: 5px 0;">
                    <strong>Active:</strong> ${this.formatYear(route.startYear)} – ${this.formatYear(route.endYear)}
                </p>
                <p style="margin: 5px 0;">
                    <strong>Peak:</strong> ${this.formatYear(route.peakStart)} – ${this.formatYear(route.peakEnd)}
                </p>
                <p style="margin: 8px 0;">
                    <strong>Goods Traded:</strong><br>
                    <span style="color: #666;">${route.goods.join(' • ')}</span>
                </p>
                <p style="margin: 8px 0;">
                    <strong>Key Cities:</strong><br>
                    <span style="color: #666;">${route.cities ? route.cities.join(' → ') : 'N/A'}</span>
                </p>
                <p style="margin: 10px 0; font-style: italic; color: #555; border-left: 3px solid ${route.color}; padding-left: 10px;">
                    ${route.description}
                </p>
                <p style="margin: 10px 0 0 0; font-size: 11px; color: #888;">
                    <strong>Sources:</strong> ${route.sources ? route.sources.join('; ') : 'N/A'}
                </p>
            </div>
        `;
    }
    
    addCityMarkers(route, opacity) {
        if (!route.cities || route.cities.length === 0) return;
        
        // Add markers at start and end of route
        const startPoint = route.path[0];
        const endPoint = route.path[route.path.length - 1];
        
        const markerStyle = {
            radius: 6,
            fillColor: route.color,
            color: '#fff',
            weight: 2,
            opacity: opacity,
            fillOpacity: opacity * 0.8
        };
        
        const startMarker = L.circleMarker(startPoint, markerStyle)
            .bindTooltip(route.cities[0], { permanent: false, direction: 'top', offset: [0, -5] });
        
        const endMarker = L.circleMarker(endPoint, markerStyle)
            .bindTooltip(route.cities[route.cities.length - 1], { permanent: false, direction: 'top', offset: [0, -5] });
        
        this.markerLayers.addLayer(startMarker);
        this.markerLayers.addLayer(endMarker);
    }
    
    formatYear(year) {
        if (year < 0) return `${Math.abs(year)} BCE`;
        return `${year} CE`;
    }
    
    startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.animate();
    }
    
    stopAnimation() {
        this.isAnimating = false;
        this.animationFrames.forEach(id => cancelAnimationFrame(id));
        this.animationFrames = [];
    }
    
    animate() {
        if (!this.isAnimating) return;
        
        // Pulse effect on route lines
        this.routeLayers.eachLayer(layer => {
            if (layer instanceof L.Polyline) {
                const currentOpacity = layer.options.opacity;
                const pulse = 0.1 * Math.sin(Date.now() / 500);
                layer.setStyle({ opacity: Math.max(0.3, Math.min(1, currentOpacity + pulse)) });
            }
        });
        
        const frameId = requestAnimationFrame(() => this.animate());
        this.animationFrames.push(frameId);
    }
    
    getRouteSummary(currentYear) {
        if (!this.loaded) return { active: [], peak: [], total: 0 };
        
        const active = this.routes.filter(r => 
            currentYear >= r.startYear && currentYear <= r.endYear
        );
        
        const peak = active.filter(r => 
            currentYear >= r.peakStart && currentYear <= r.peakEnd
        );
        
        const landRoutes = active.filter(r => r.type === 'land');
        const maritimeRoutes = active.filter(r => r.type === 'maritime');
        
        return {
            active: active,
            peak: peak,
            total: active.length,
            peakCount: peak.length,
            landCount: landRoutes.length,
            maritimeCount: maritimeRoutes.length,
            allGoods: [...new Set(active.flatMap(r => r.goods))],
            routes: active.map(r => ({
                name: r.name,
                type: r.type,
                isPeak: currentYear >= r.peakStart && currentYear <= r.peakEnd,
                color: r.color
            }))
        };
    }
    
    // Get all unique goods traded across all routes in a year
    getGoodsTraded(currentYear) {
        const active = this.routes.filter(r => 
            currentYear >= r.startYear && currentYear <= r.endYear
        );
        return [...new Set(active.flatMap(r => r.goods))];
    }
    
    // Get routes by type
    getRoutesByType(type) {
        return this.routes.filter(r => r.type === type);
    }
    
    // Search routes by goods
    findRoutesByGoods(goodsName) {
        return this.routes.filter(r => 
            r.goods.some(g => g.toLowerCase().includes(goodsName.toLowerCase()))
        );
    }
}

// Export
window.TradeRoutes = TradeRoutes;
