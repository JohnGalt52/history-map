/**
 * Rulers Module - Historical leaders and government information
 * 
 * Shows who ruled a region at any point in time, including
 * dynasty, government type, and historical notes.
 */

class RulersModule {
    constructor() {
        this.rulers = [];
        this.loaded = false;
        this.currentYear = 0;
        
        // Government type icons
        this.govIcons = {
            'Divine Monarchy': '👑',
            'Monarchy': '👑',
            'Hereditary Monarchy': '👑',
            'Feudal Monarchy': '🏰',
            'Absolute Monarchy': '👑',
            'Constitutional Monarchy': '🏛️',
            'Theocratic Monarchy': '⛪',
            'Zoroastrian Monarchy': '🔥',
            'Universal Monarchy': '🌍',
            'Empire': '🦅',
            'Imperial Province': '🏛️',
            'Principate': '🏛️',
            'Dominate': '👑',
            'Autocracy': '👑',
            'Republic': '🗳️',
            'Direct Democracy': '🗳️',
            'Oligarchy': '👥',
            'Military Oligarchy': '⚔️',
            'Military Dictatorship': '⚔️',
            'Sultanate': '☪️',
            'Islamic Caliphate': '☪️',
            'Islamic Emirate': '☪️',
            'Shia Theocracy': '☪️',
            'Khanate': '🏇',
            'Beylik': '🏇',
            'Communist State': '☭',
            'Communist Dictatorship': '☭',
            'Colonial': '🏴',
            'Confucian Bureaucracy': '📜',
            'Confucian Autocracy': '📜',
            'Civil Bureaucracy': '📜',
            'Legalist Autocracy': '⚖️',
            'Hellenistic Monarchy': '🏛️',
            'Elective Monarchy': '👑',
            'Principality': '🏰',
            'Tsardom': '👑',
            'City-States': '🏛️',
            'Successor Kingdoms': '⚔️',
            'Personal Union': '💍'
        };
        
        this.loadData();
        this.createPanel();
    }
    
    async loadData() {
        try {
            const response = await fetch('data/rulers.json');
            const data = await response.json();
            this.rulers = data.rulers;
            this.loaded = true;
            console.log(`Loaded rulers for ${this.rulers.length} regions`);
        } catch (error) {
            console.error('Failed to load rulers data:', error);
        }
    }
    
    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'rulerPanel';
        panel.className = 'ruler-panel';
        panel.innerHTML = `
            <div class="ruler-header">
                <h3>👑 Ruler Information</h3>
                <button class="ruler-close" onclick="rulersModule.closePanel()">×</button>
            </div>
            <div class="ruler-content" id="rulerContent">
                <p class="placeholder">Click a region on the map to see who ruled it</p>
            </div>
        `;
        document.body.appendChild(panel);
        
        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .ruler-panel {
                position: fixed;
                left: -380px;
                top: 60px;
                width: 360px;
                max-height: calc(100vh - 180px);
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border-radius: 0 10px 10px 0;
                box-shadow: 5px 0 20px rgba(0,0,0,0.4);
                z-index: 1001;
                transition: left 0.3s ease;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            .ruler-panel.active { left: 0; }
            
            .ruler-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: rgba(0,0,0,0.3);
                border-bottom: 1px solid rgba(255,215,0,0.3);
            }
            .ruler-header h3 {
                margin: 0;
                color: #ffd700;
                font-size: 18px;
            }
            .ruler-close {
                background: none;
                border: none;
                color: #888;
                font-size: 24px;
                cursor: pointer;
            }
            .ruler-close:hover { color: #fff; }
            
            .ruler-content {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
            }
            .ruler-content .placeholder {
                color: #666;
                text-align: center;
                font-style: italic;
                padding: 20px;
            }
            
            .ruler-region-name {
                font-size: 24px;
                color: #ffd700;
                margin: 0 0 5px 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .ruler-year {
                color: #888;
                font-size: 14px;
                margin-bottom: 15px;
            }
            
            .ruler-card {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 15px;
                border-left: 4px solid #ffd700;
            }
            .ruler-card.no-data {
                border-left-color: #666;
                color: #888;
            }
            
            .ruler-name {
                font-size: 20px;
                color: #fff;
                margin: 0 0 5px 0;
            }
            .ruler-title {
                color: #ffd700;
                font-size: 14px;
                margin-bottom: 10px;
            }
            
            .ruler-meta {
                display: grid;
                grid-template-columns: auto 1fr;
                gap: 5px 15px;
                font-size: 13px;
                margin-bottom: 10px;
            }
            .ruler-meta-label {
                color: #888;
            }
            .ruler-meta-value {
                color: #ccc;
            }
            
            .ruler-gov {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                background: rgba(255,215,0,0.2);
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 13px;
                color: #ffd700;
                margin-bottom: 10px;
            }
            
            .ruler-notes {
                background: rgba(0,0,0,0.2);
                padding: 10px;
                border-radius: 5px;
                font-size: 13px;
                color: #aaa;
                font-style: italic;
                margin-top: 10px;
            }
            
            .ruler-timeline {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid rgba(255,255,255,0.1);
            }
            .ruler-timeline h4 {
                color: #888;
                font-size: 12px;
                text-transform: uppercase;
                margin: 0 0 10px 0;
            }
            .timeline-item {
                display: flex;
                align-items: center;
                padding: 8px;
                margin: 3px 0;
                border-radius: 5px;
                cursor: pointer;
                transition: background 0.2s;
                font-size: 12px;
                color: #aaa;
            }
            .timeline-item:hover {
                background: rgba(255,255,255,0.1);
            }
            .timeline-item.active {
                background: rgba(255,215,0,0.2);
                color: #ffd700;
            }
            .timeline-item .dates {
                width: 120px;
                flex-shrink: 0;
            }
            .timeline-item .dynasty {
                flex: 1;
            }
        `;
        document.head.appendChild(styles);
    }
    
    findRuler(regionName, year) {
        if (!this.loaded) return null;
        
        // Normalize region name
        const normalizedName = regionName.toLowerCase().trim();
        
        // Find matching region
        const region = this.rulers.find(r => {
            if (r.region.toLowerCase() === normalizedName) return true;
            if (r.aliases) {
                return r.aliases.some(a => 
                    normalizedName.includes(a.toLowerCase()) ||
                    a.toLowerCase().includes(normalizedName)
                );
            }
            return false;
        });
        
        if (!region) return null;
        
        // Find period for this year
        const period = region.periods.find(p => year >= p.start && year <= p.end);
        
        return {
            region: region.region,
            period: period,
            allPeriods: region.periods
        };
    }
    
    showRuler(regionName, year) {
        this.currentYear = year;
        const panel = document.getElementById('rulerPanel');
        const content = document.getElementById('rulerContent');
        
        const result = this.findRuler(regionName, year);
        
        if (!result) {
            content.innerHTML = `
                <h2 class="ruler-region-name">${regionName}</h2>
                <p class="ruler-year">Year: ${this.formatYear(year)}</p>
                <div class="ruler-card no-data">
                    <p>No ruler data available for this region and time period.</p>
                    <p style="font-size: 12px; margin-top: 10px;">
                        Data coverage focuses on major civilizations and empires.
                    </p>
                </div>
            `;
            panel.classList.add('active');
            return;
        }
        
        const period = result.period;
        
        if (!period) {
            // Show region but no ruler for this specific year
            content.innerHTML = `
                <h2 class="ruler-region-name">${result.region}</h2>
                <p class="ruler-year">Year: ${this.formatYear(year)}</p>
                <div class="ruler-card no-data">
                    <p>No specific ruler data for this year.</p>
                    <p style="font-size: 12px; margin-top: 10px;">
                        This region may have been in a period of fragmentation,
                        foreign occupation, or the data doesn't cover this era.
                    </p>
                </div>
                ${this.renderTimeline(result.allPeriods, year)}
            `;
            panel.classList.add('active');
            return;
        }
        
        const govIcon = this.govIcons[period.government] || '🏛️';
        
        content.innerHTML = `
            <h2 class="ruler-region-name">
                <span>${govIcon}</span>
                ${result.region}
            </h2>
            <p class="ruler-year">Year: ${this.formatYear(year)}</p>
            
            <div class="ruler-card">
                <h3 class="ruler-name">${period.ruler}</h3>
                <div class="ruler-title">${period.title}</div>
                
                <div class="ruler-gov">
                    ${govIcon} ${period.government}
                </div>
                
                <div class="ruler-meta">
                    <span class="ruler-meta-label">Dynasty:</span>
                    <span class="ruler-meta-value">${period.dynasty}</span>
                    
                    <span class="ruler-meta-label">Period:</span>
                    <span class="ruler-meta-value">${this.formatYear(period.start)} – ${this.formatYear(period.end)}</span>
                    
                    ${period.capital ? `
                        <span class="ruler-meta-label">Capital:</span>
                        <span class="ruler-meta-value">${period.capital}</span>
                    ` : ''}
                </div>
                
                ${period.notes ? `
                    <div class="ruler-notes">
                        📜 ${period.notes}
                    </div>
                ` : ''}
            </div>
            
            ${this.renderTimeline(result.allPeriods, year)}
        `;
        
        panel.classList.add('active');
    }
    
    renderTimeline(periods, currentYear) {
        if (!periods || periods.length <= 1) return '';
        
        const items = periods.map(p => {
            const isActive = currentYear >= p.start && currentYear <= p.end;
            return `
                <div class="timeline-item ${isActive ? 'active' : ''}" 
                     onclick="rulersModule.jumpToYear(${Math.max(p.start, -10000)})">
                    <span class="dates">${this.formatYear(p.start)} – ${this.formatYear(p.end)}</span>
                    <span class="dynasty">${p.dynasty}</span>
                </div>
            `;
        }).join('');
        
        return `
            <div class="ruler-timeline">
                <h4>Dynasty Timeline</h4>
                ${items}
            </div>
        `;
    }
    
    jumpToYear(year) {
        // Find the closest available year in the timeline
        if (window.availableYears) {
            let closest = window.availableYears[0];
            let minDiff = Math.abs(year - closest.year);
            
            window.availableYears.forEach((y, idx) => {
                const diff = Math.abs(year - y.year);
                if (diff < minDiff) {
                    minDiff = diff;
                    closest = y;
                    window.currentYearIndex = idx;
                }
            });
            
            // Trigger year change
            if (window.loadYear) {
                window.loadYear(window.currentYearIndex);
            }
        }
    }
    
    closePanel() {
        document.getElementById('rulerPanel').classList.remove('active');
    }
    
    formatYear(year) {
        if (year < 0) return `${Math.abs(year).toLocaleString()} BCE`;
        return `${year} CE`;
    }
}

// Create global instance
window.rulersModule = new RulersModule();

// Export
window.RulersModule = RulersModule;
