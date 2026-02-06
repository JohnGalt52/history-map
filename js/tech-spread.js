/**
 * Technology Spread & Tech Tree Visualization
 * 
 * Shows how inventions spread across civilizations with a
 * Civilization-style tech tree showing prerequisites and unlocks.
 */

class TechSpread {
    constructor(map) {
        this.map = map;
        this.techLayer = L.layerGroup();
        this.spreadLayer = L.layerGroup();
        this.technologies = [];
        this.techMap = new Map(); // id -> tech for quick lookup
        this.currentYear = 0;
        this.selectedTech = null;
        this.loaded = false;
        this.visible = false;
        
        // Color by category
        this.categoryColors = {
            'fundamental': '#e74c3c',
            'metallurgy': '#f39c12',
            'crafts': '#9b59b6',
            'communication': '#3498db',
            'transport': '#1abc9c',
            'navigation': '#16a085',
            'military': '#c0392b',
            'science': '#2980b9',
            'medicine': '#27ae60',
            'power': '#d35400',
            'electronics': '#8e44ad'
        };
        
        this.loadTech();
        this.createTechTreePanel();
    }
    
    async loadTech() {
        try {
            const response = await fetch('data/tech-tree.json');
            const data = await response.json();
            this.technologies = data.technologies;
            
            // Build lookup map
            this.technologies.forEach(tech => {
                this.techMap.set(tech.id, tech);
            });
            
            this.loaded = true;
            console.log(`Loaded ${this.technologies.length} technologies`);
        } catch (error) {
            console.error('Failed to load tech tree:', error);
        }
    }
    
    createTechTreePanel() {
        // Create side panel for tech tree
        const panel = document.createElement('div');
        panel.id = 'techTreePanel';
        panel.className = 'tech-tree-panel';
        panel.innerHTML = `
            <div class="tech-tree-header">
                <h3>📜 Technology Tree</h3>
                <button class="tech-tree-close" onclick="techSpread.closePanel()">×</button>
            </div>
            <div class="tech-tree-content">
                <div class="tech-tree-section tech-requires">
                    <h4>⬆️ Required Technologies</h4>
                    <div class="tech-list" id="techRequires"></div>
                </div>
                <div class="tech-tree-selected" id="techSelected">
                    <p class="placeholder">Click a technology marker on the map</p>
                </div>
                <div class="tech-tree-section tech-enables">
                    <h4>⬇️ Enabled Technologies</h4>
                    <div class="tech-list" id="techEnables"></div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        
        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .tech-tree-panel {
                position: fixed;
                right: -400px;
                top: 60px;
                width: 380px;
                max-height: calc(100vh - 180px);
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border-radius: 10px 0 0 10px;
                box-shadow: -5px 0 20px rgba(0,0,0,0.4);
                z-index: 1001;
                transition: right 0.3s ease;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            .tech-tree-panel.active { right: 0; }
            
            .tech-tree-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: rgba(0,0,0,0.3);
                border-bottom: 1px solid rgba(255,215,0,0.3);
            }
            .tech-tree-header h3 {
                margin: 0;
                color: #ffd700;
                font-size: 18px;
            }
            .tech-tree-close {
                background: none;
                border: none;
                color: #888;
                font-size: 24px;
                cursor: pointer;
                padding: 0 5px;
            }
            .tech-tree-close:hover { color: #fff; }
            
            .tech-tree-content {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
            }
            
            .tech-tree-section {
                margin-bottom: 15px;
            }
            .tech-tree-section h4 {
                color: #888;
                font-size: 12px;
                text-transform: uppercase;
                margin: 0 0 10px 0;
                padding-bottom: 5px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .tech-requires h4 { color: #e74c3c; }
            .tech-enables h4 { color: #27ae60; }
            
            .tech-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .tech-node {
                background: rgba(255,255,255,0.1);
                padding: 8px 12px;
                border-radius: 5px;
                font-size: 13px;
                color: #ddd;
                cursor: pointer;
                transition: all 0.2s;
                border-left: 3px solid #666;
            }
            .tech-node:hover {
                background: rgba(255,255,255,0.2);
                transform: translateY(-2px);
            }
            .tech-node.unavailable {
                opacity: 0.5;
                border-left-color: #444;
            }
            .tech-node.available {
                border-left-color: #ffd700;
            }
            
            .tech-tree-selected {
                background: rgba(255,215,0,0.1);
                border: 2px solid rgba(255,215,0,0.3);
                border-radius: 10px;
                padding: 15px;
                margin: 15px 0;
            }
            .tech-tree-selected .placeholder {
                color: #666;
                text-align: center;
                font-style: italic;
            }
            .tech-tree-selected h3 {
                margin: 0 0 10px 0;
                color: #ffd700;
            }
            .tech-tree-selected .tech-meta {
                font-size: 12px;
                color: #888;
                margin-bottom: 10px;
            }
            .tech-tree-selected .tech-description {
                color: #ccc;
                font-size: 14px;
                line-height: 1.5;
                margin-bottom: 10px;
            }
            .tech-tree-selected .tech-impact {
                background: rgba(39,174,96,0.2);
                padding: 10px;
                border-radius: 5px;
                font-size: 13px;
                color: #27ae60;
                border-left: 3px solid #27ae60;
            }
            .tech-tree-selected .tech-goods {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-top: 10px;
            }
            .tech-tree-selected .tech-goods span {
                background: rgba(255,255,255,0.1);
                padding: 3px 8px;
                border-radius: 3px;
                font-size: 11px;
                color: #aaa;
            }
            .tech-independent {
                background: rgba(155,89,182,0.2);
                padding: 10px;
                border-radius: 5px;
                margin-top: 10px;
            }
            .tech-independent h5 {
                margin: 0 0 8px 0;
                color: #9b59b6;
                font-size: 12px;
            }
            .tech-independent .invention-item {
                font-size: 12px;
                color: #bbb;
                padding: 3px 0;
            }
            
            .tech-legend {
                position: fixed;
                left: 10px;
                top: 150px;
                background: rgba(26, 26, 46, 0.95);
                padding: 15px;
                border-radius: 8px;
                z-index: 1000;
                display: none;
            }
            .tech-legend.active { display: block; }
            .tech-legend h4 {
                margin: 0 0 10px 0;
                color: #ffd700;
                font-size: 14px;
            }
            .tech-legend-item {
                display: flex;
                align-items: center;
                margin: 5px 0;
                font-size: 12px;
                color: #ccc;
            }
            .tech-legend-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 8px;
            }
        `;
        document.head.appendChild(styles);
    }
    
    addTo(map) {
        this.techLayer.addTo(map);
        this.spreadLayer.addTo(map);
    }
    
    draw(year) {
        this.currentYear = year;
        this.techLayer.clearLayers();
        this.spreadLayer.clearLayers();
        
        if (!this.visible || !this.loaded) return;
        
        // Get technologies invented by this year
        const inventedTechs = this.technologies.filter(tech => {
            const originDate = tech.origin.date;
            return originDate <= year;
        });
        
        inventedTechs.forEach(tech => {
            this.drawTechMarker(tech, year);
            this.drawSpreadLines(tech, year);
        });
        
        return inventedTechs.length;
    }
    
    drawTechMarker(tech, year) {
        const color = this.categoryColors[tech.category] || '#666';
        const isNew = year - tech.origin.date < 500;
        const size = isNew ? 12 : 8;
        
        const marker = L.circleMarker([tech.origin.lat, tech.origin.lng], {
            radius: size,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: isNew ? 0.9 : 0.6
        });
        
        // Tooltip
        marker.bindTooltip(`<strong>${tech.name}</strong><br>${this.formatYear(tech.origin.date)}`, {
            permanent: false,
            direction: 'top'
        });
        
        // Click to show tech tree
        marker.on('click', () => this.showTechTree(tech.id));
        
        this.techLayer.addLayer(marker);
        
        // Add pulse effect for recently invented
        if (isNew) {
            const pulseMarker = L.circleMarker([tech.origin.lat, tech.origin.lng], {
                radius: size + 5,
                fillColor: color,
                color: color,
                weight: 2,
                opacity: 0.5,
                fillOpacity: 0.2,
                className: 'tech-pulse'
            });
            this.techLayer.addLayer(pulseMarker);
        }
    }
    
    drawSpreadLines(tech, year) {
        if (!tech.spread) return;
        
        const color = this.categoryColors[tech.category] || '#666';
        const origin = [tech.origin.lat, tech.origin.lng];
        
        tech.spread.forEach(spread => {
            if (spread.date > year) return;
            
            const dest = [spread.lat, spread.lng];
            const timeSinceSpread = year - spread.date;
            const opacity = Math.max(0.2, 0.8 - timeSinceSpread / 2000);
            
            // Draw spread line
            const line = L.polyline([origin, dest], {
                color: color,
                weight: 2,
                opacity: opacity,
                dashArray: '5, 5'
            });
            
            line.bindTooltip(`${tech.name} → ${spread.region}<br>${this.formatYear(spread.date)}`, {
                permanent: false
            });
            
            this.spreadLayer.addLayer(line);
            
            // Draw destination marker
            const destMarker = L.circleMarker(dest, {
                radius: 5,
                fillColor: color,
                color: '#fff',
                weight: 1,
                opacity: opacity,
                fillOpacity: opacity * 0.8
            });
            destMarker.bindTooltip(spread.region);
            this.spreadLayer.addLayer(destMarker);
        });
    }
    
    showTechTree(techId) {
        const tech = this.techMap.get(techId);
        if (!tech) return;
        
        this.selectedTech = tech;
        const panel = document.getElementById('techTreePanel');
        panel.classList.add('active');
        
        // Populate requires section
        const requiresDiv = document.getElementById('techRequires');
        if (tech.requires && tech.requires.length > 0) {
            requiresDiv.innerHTML = tech.requires.map(reqId => {
                const reqTech = this.techMap.get(reqId);
                if (!reqTech) return `<div class="tech-node unavailable">${reqId}</div>`;
                const color = this.categoryColors[reqTech.category] || '#666';
                return `<div class="tech-node available" style="border-left-color: ${color}" onclick="techSpread.showTechTree('${reqId}')">${reqTech.name}</div>`;
            }).join('');
        } else {
            requiresDiv.innerHTML = '<div style="color: #666; font-size: 12px;">No prerequisites (foundational technology)</div>';
        }
        
        // Populate selected tech
        const selectedDiv = document.getElementById('techSelected');
        const color = this.categoryColors[tech.category] || '#666';
        
        let independentHtml = '';
        if (tech.independent_inventions && tech.independent_inventions.length > 1) {
            independentHtml = `
                <div class="tech-independent">
                    <h5>🔄 Independent Inventions</h5>
                    ${tech.independent_inventions.map(inv => 
                        `<div class="invention-item">• ${inv.region}: ${this.formatYear(inv.date)}${inv.inventor ? ` (${inv.inventor})` : ''}</div>`
                    ).join('')}
                </div>
            `;
        }
        
        selectedDiv.innerHTML = `
            <h3 style="border-left: 4px solid ${color}; padding-left: 10px;">${tech.name}</h3>
            <div class="tech-meta">
                📍 ${tech.origin.region} · 📅 ${this.formatYear(tech.origin.date)} · 🏷️ ${tech.category}
            </div>
            <div class="tech-description">${tech.description}</div>
            <div class="tech-impact">💡 ${tech.impact}</div>
            ${independentHtml}
            <div style="margin-top: 10px; font-size: 11px; color: #666;">
                📚 ${tech.sources.join('; ')}
            </div>
        `;
        
        // Populate enables section
        const enablesDiv = document.getElementById('techEnables');
        if (tech.enables && tech.enables.length > 0) {
            enablesDiv.innerHTML = tech.enables.map(enableId => {
                const enableTech = this.techMap.get(enableId);
                if (!enableTech) return `<div class="tech-node unavailable">${enableId}</div>`;
                const color = this.categoryColors[enableTech.category] || '#666';
                const invented = enableTech.origin.date <= this.currentYear;
                return `<div class="tech-node ${invented ? 'available' : 'unavailable'}" style="border-left-color: ${color}" onclick="techSpread.showTechTree('${enableId}')">${enableTech.name}${invented ? '' : ' 🔒'}</div>`;
            }).join('');
        } else {
            enablesDiv.innerHTML = '<div style="color: #666; font-size: 12px;">Modern technology (no further unlocks tracked)</div>';
        }
        
        // Center map on tech origin
        this.map.panTo([tech.origin.lat, tech.origin.lng]);
    }
    
    closePanel() {
        document.getElementById('techTreePanel').classList.remove('active');
        this.selectedTech = null;
    }
    
    toggle(show) {
        this.visible = show;
        if (!show) {
            this.techLayer.clearLayers();
            this.spreadLayer.clearLayers();
            this.closePanel();
        }
    }
    
    formatYear(year) {
        if (year < 0) return `${Math.abs(year).toLocaleString()} BCE`;
        return `${year} CE`;
    }
    
    // Get all techs available at a given year
    getAvailableTechs(year) {
        return this.technologies.filter(tech => tech.origin.date <= year);
    }
    
    // Get tech by category
    getTechsByCategory(category) {
        return this.technologies.filter(tech => tech.category === category);
    }
    
    // Search techs
    searchTech(query) {
        const q = query.toLowerCase();
        return this.technologies.filter(tech => 
            tech.name.toLowerCase().includes(q) ||
            tech.description.toLowerCase().includes(q)
        );
    }
}

// Backwards compatibility methods for existing UI
    getAllTech() {
        return this.technologies.map(tech => ({
            id: tech.id,
            name: tech.name,
            icon: this.getCategoryIcon(tech.category),
            originYear: tech.origin.date,
            category: tech.category
        }));
    }
    
    getCategoryIcon(category) {
        const icons = {
            'fundamental': '🔥',
            'metallurgy': '⚒️',
            'crafts': '🏺',
            'communication': '📜',
            'transport': '🛞',
            'navigation': '🧭',
            'military': '⚔️',
            'science': '🔬',
            'medicine': '💊',
            'power': '⚡',
            'electronics': '💻'
        };
        return icons[category] || '💡';
    }
    
    showTech(techId, year) {
        const tech = this.techMap.get(techId);
        if (!tech) return null;
        
        this.visible = true;
        this.draw(year);
        this.showTechTree(techId);
        
        return {
            name: tech.name,
            description: tech.description,
            impact: tech.impact,
            origin: tech.origin.region,
            originYear: tech.origin.date,
            spread: tech.spread || [],
            requires: tech.requires || [],
            enables: tech.enables || []
        };
    }
    
    clear() {
        this.visible = false;
        this.techLayer.clearLayers();
        this.spreadLayer.clearLayers();
        this.closePanel();
    }
}

// Export
window.TechSpread = TechSpread;
