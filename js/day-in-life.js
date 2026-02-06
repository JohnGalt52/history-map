/**
 * Day in the Life - Experience history through ordinary people
 * 
 * Shows what daily life was like for different social classes
 * in any region and time period.
 */

class DayInLife {
    constructor() {
        // Pre-built daily life descriptions (AI can expand these)
        this.lifeData = {
            "Egypt": {
                "-3000": {
                    farmer: {
                        title: "Egyptian Farmer (Fellah)",
                        wake: "Before dawn, with the sun god Ra",
                        morning: "Walk to fields along irrigation canals. The Nile's flood has left rich black soil. Use wooden hoe and sickle to tend emmer wheat and barley.",
                        midday: "Rest in shade during brutal heat. Eat bread, onions, and beer (safer than water). Children help chase birds from crops.",
                        afternoon: "Pay portion of harvest to Pharaoh's tax collectors. Repair mud-brick home. Wife weaves linen and grinds grain.",
                        evening: "Simple meal with family on reed mats. Tell stories of gods. Sleep on roof when hot.",
                        concerns: "Nile flood - too little means famine, too much means destruction. Conscription for pyramid building.",
                        lifeExpectancy: "35 years",
                        diet: "Bread, beer, onions, fish, dates, honey occasionally"
                    },
                    noble: {
                        title: "Egyptian Noble",
                        wake: "Servants wake you with music. Bathe in perfumed water.",
                        morning: "Scribes read reports. Oversee estate of 1000 acres. Meet with Pharaoh's officials.",
                        midday: "Lavish meal: roast goose, figs, wine, honey cakes. Entertained by dancers and musicians.",
                        afternoon: "Hunt hippos on the Nile. Or inspect tomb construction - your afterlife home.",
                        evening: "Banquet with other nobles. Wear gold jewelry, wigs, kohl eyeliner. Discuss politics and trade.",
                        concerns: "Maintaining Pharaoh's favor. Ensuring proper burial for the afterlife.",
                        lifeExpectancy: "45 years",
                        diet: "Meat, wine, exotic fruits, honey, fine bread"
                    }
                },
                "-1500": {
                    farmer: {
                        title: "New Kingdom Egyptian Farmer",
                        wake: "Dawn prayers to Amun-Ra",
                        morning: "Tend fields using shaduf (water lever) for irrigation. Empire brings new crops: pomegranates, olives.",
                        midday: "Rest and eat. Children attend village school if lucky - learning hieratics means escape from farming.",
                        afternoon: "May be conscripted for temple construction or military campaign. Women brew beer, bake bread.",
                        evening: "Village festivals more common now. Music, dancing, storytelling about Pharaoh's victories.",
                        concerns: "Hittite wars, tomb robbers, drought years",
                        lifeExpectancy: "36 years",
                        diet: "More variety now - grapes, pomegranates, better beer"
                    }
                }
            },
            "Roman Empire": {
                "100": {
                    farmer: {
                        title: "Roman Peasant Farmer",
                        wake: "First light. Say prayers to household gods (Lares).",
                        morning: "Work small plot or as tenant on wealthy estate (latifundia). Grow wheat, olives, grapes.",
                        midday: "Simple meal: bread dipped in olive oil, cheese, olives. Wine diluted with water.",
                        afternoon: "Tend animals. Wife spins wool. Try to avoid debt that leads to selling yourself into slavery.",
                        evening: "Village tavern occasionally. Dice games. Local festivals to gods.",
                        concerns: "Taxes to Rome, military conscription, competition from slave labor",
                        lifeExpectancy: "35 years",
                        diet: "Bread, olive oil, wine, vegetables, meat rarely"
                    },
                    citizen: {
                        title: "Roman Citizen (Urban)",
                        wake: "Slaves wake you at dawn in your apartment (insula) or house (domus).",
                        morning: "Visit patron for morning greeting (salutatio) and daily handout. Business in Forum.",
                        midday: "Light lunch. Romans eat main meal in evening.",
                        afternoon: "Public baths (thermae) - exercise, swim, socialize, business deals. Free for citizens!",
                        evening: "Dinner party (cena) with multiple courses, reclining on couches. Entertainment, poetry, debate.",
                        concerns: "Political connections, maintaining status, lead in the wine pipes",
                        lifeExpectancy: "40 years in city (disease), 45 in countryside",
                        diet: "Wheat bread, pork, fish sauce (garum), wine, exotic imports"
                    },
                    slave: {
                        title: "Roman Slave",
                        wake: "Before masters, prepare household.",
                        morning: "Duties vary: domestic work, mining (brutal), teaching (Greek slaves), gladiator training.",
                        midday: "Eat what masters allow. Mine slaves may not see sunlight for weeks.",
                        afternoon: "No rest. Household slaves better off. Skilled slaves (doctors, teachers) live well.",
                        evening: "Sleep in slave quarters. Family can be sold apart. Some save to buy freedom.",
                        concerns: "Punishment, family separation, hope of manumission",
                        lifeExpectancy: "25-30 years (varies wildly by role)",
                        diet: "Whatever is given - bread, grain porridge, scraps"
                    }
                }
            },
            "Mongol Empire": {
                "1250": {
                    nomad: {
                        title: "Mongol Herder",
                        wake: "Dawn in felt tent (ger/yurt). Fire kept burning overnight.",
                        morning: "Women milk mares (up to 21 times daily for airag). Men check herds: horses, sheep, goats, camels.",
                        midday: "Airag (fermented mare's milk) and dried meat. Move camp if grazing depleted - everything packs in hours.",
                        afternoon: "Boys practice archery from horseback from age 3. Girls learn tent management, felt-making.",
                        evening: "Gather in ger. Elders tell stories of Genghis Khan. Throat singing. Airag flows freely.",
                        concerns: "Harsh winters (dzud) that kill herds, raids, being conscripted for western campaigns",
                        lifeExpectancy: "40 years (healthy diet, active life)",
                        diet: "Meat, dairy (airag, cheese, yogurt), very little grain or vegetables"
                    },
                    warrior: {
                        title: "Mongol Warrior",
                        wake: "Camp stirs at dawn. Check horse (each warrior has 3-5).",
                        morning: "Drill formations. Practice shooting while riding. Each man carries: 2 bows, 60 arrows, lasso, axe.",
                        midday: "Eat dried meat and curd from saddlebags. Can ride for days without stopping.",
                        afternoon: "Scouts report. Plan tomorrow's feigned retreat or encirclement. Siege engineers prepare.",
                        evening: "Share loot from conquered cities. Send portion to Great Khan. Write home via yam (postal system).",
                        concerns: "Surviving the next siege, plague from Chinese cities, succession conflicts",
                        lifeExpectancy: "35 years (combat)",
                        diet: "Dried meat, blood from horse's vein on long rides, airag, looted food"
                    }
                }
            },
            "Medieval Europe": {
                "1200": {
                    serf: {
                        title: "Medieval Serf",
                        wake: "Church bells at dawn. Whole family in one-room cottage with animals.",
                        morning: "Work lord's fields 3 days/week (corvée). Own strip-fields other days. Plow with oxen if lucky.",
                        midday: "Pottage (vegetable stew) with dark bread. Ale is safer than water.",
                        afternoon: "More field work. Wife tends garden, chickens, brews ale. Cannot leave manor without permission.",
                        evening: "Exhausted sleep. Church on Sundays is only break. Festivals tied to harvest and saints' days.",
                        concerns: "Famine (every few years), plague, lord's demands, salvation of soul",
                        lifeExpectancy: "30-35 years",
                        diet: "Bread, pottage, ale, cheese, eggs, meat only on feast days"
                    },
                    knight: {
                        title: "Medieval Knight",
                        wake: "Squire helps you dress. Morning prayers in castle chapel.",
                        morning: "Train with sword, lance, mace. Practice mounted combat. Armor weighs 50+ pounds.",
                        midday: "Feast in great hall. Meat, wine, bread. Minstrels play. Dogs eat scraps from floor.",
                        afternoon: "Administer justice on manor. Collect rents. Hunt deer in forest (commoners forbidden).",
                        evening: "Courtly entertainment. Chess. Flirtation with ladies (courtly love). Plan for Crusade or tournament.",
                        concerns: "Honor, ransom if captured, affording armor and horses, Crusading vows",
                        lifeExpectancy: "40 years (if survives combat)",
                        diet: "Meat, meat, more meat, wine, white bread, spices show wealth"
                    },
                    monk: {
                        title: "Medieval Monk",
                        wake: "2 AM for Matins prayers. Sleep again. 6 AM for Prime.",
                        morning: "Copy manuscripts in scriptorium. Illuminate texts with gold leaf. Preserve ancient knowledge.",
                        midday: "Simple meal in silence while Scripture read. Vegetarian except feast days.",
                        afternoon: "Tend monastery gardens, brew beer, make medicine. Teach noble children.",
                        evening: "Vespers, then Compline prayers. Early to bed on straw mattress. Silence until morning.",
                        concerns: "Salvation, monastery politics, Viking/Saracen raids on wealthy abbeys",
                        lifeExpectancy: "45+ years (better diet, healthcare, shelter)",
                        diet: "Bread, fish, vegetables, beer/wine, cheese - healthier than nobles"
                    }
                }
            },
            "China": {
                "100": {
                    farmer: {
                        title: "Han Dynasty Farmer",
                        wake: "Dawn. Kowtow to ancestral tablets.",
                        morning: "Rice paddies in south, millet/wheat in north. Iron tools now common. Pay taxes in grain.",
                        midday: "Rice or millet porridge, pickled vegetables, tea. Family eats together, elders first.",
                        afternoon: "Maintain irrigation. Wife raises silkworms - extra income. Children study if family can afford.",
                        evening: "Village elders settle disputes. Respect for scholars. Hope son passes exams, escapes farming.",
                        concerns: "Floods, drought, barbarian raids from north, tax collectors",
                        lifeExpectancy: "35 years",
                        diet: "Rice/millet, vegetables, tofu, fish, pork rarely"
                    }
                },
                "1400": {
                    farmer: {
                        title: "Ming Dynasty Farmer",
                        wake: "Dawn. Brief prayers to ancestors and local gods.",
                        morning: "New crops from Americas arriving: corn, sweet potatoes. Population booming. Land getting scarce.",
                        midday: "Rice, vegetables, tea. Footbinding daughters for marriage prospects (painful status symbol).",
                        afternoon: "May work in local porcelain workshop or silk production for extra money.",
                        evening: "Traveling opera troupes visit. Stories of heroes and demons. Matchmaker visits for children.",
                        concerns: "Land subdivision among sons, Japanese pirates on coast, examination system",
                        lifeExpectancy: "40 years",
                        diet: "More variety now - rice, pork, vegetables, soy sauce, tea"
                    }
                }
            }
        };
    }
    
    /**
     * Get daily life for a region and time period
     */
    getLife(region, year) {
        // Normalize region name
        const regionKey = this.findRegion(region);
        if (!regionKey) return null;
        
        // Find closest time period
        const periods = Object.keys(this.lifeData[regionKey]).map(Number).sort((a, b) => a - b);
        let closestPeriod = periods[0];
        for (const period of periods) {
            if (period <= year) closestPeriod = period;
        }
        
        return {
            region: regionKey,
            year: closestPeriod,
            lives: this.lifeData[regionKey][closestPeriod.toString()]
        };
    }
    
    /**
     * Find matching region
     */
    findRegion(regionName) {
        const name = regionName.toLowerCase();
        
        if (name.includes('egypt')) return 'Egypt';
        if (name.includes('roman') || name.includes('rome') || name.includes('italia')) return 'Roman Empire';
        if (name.includes('mongol')) return 'Mongol Empire';
        if (name.includes('francia') || name.includes('france') || name.includes('england') || 
            name.includes('germany') || name.includes('holy roman')) return 'Medieval Europe';
        if (name.includes('china') || name.includes('han') || name.includes('ming') || 
            name.includes('song') || name.includes('tang')) return 'China';
        
        return null;
    }
    
    /**
     * Generate HTML for daily life display
     */
    renderLife(lifeData) {
        if (!lifeData || !lifeData.lives) {
            return `<p class="no-data">Daily life data not yet available for this region and time period. 
                    <br><br>AI integration would generate this dynamically.</p>`;
        }
        
        let html = `<div class="life-period">📅 Life around ${Math.abs(lifeData.year)} ${lifeData.year < 0 ? 'BC' : 'AD'}</div>`;
        
        html += '<div class="life-roles">';
        
        for (const [role, data] of Object.entries(lifeData.lives)) {
            html += `
                <div class="life-card" onclick="this.classList.toggle('expanded')">
                    <div class="life-card-header">
                        <span class="life-role-icon">${this.getRoleIcon(role)}</span>
                        <span class="life-role-title">${data.title}</span>
                        <span class="life-expand-icon">▼</span>
                    </div>
                    <div class="life-card-body">
                        <div class="life-schedule">
                            <div class="life-time"><span>🌅 Dawn:</span> ${data.wake}</div>
                            <div class="life-time"><span>☀️ Morning:</span> ${data.morning}</div>
                            <div class="life-time"><span>🌞 Midday:</span> ${data.midday}</div>
                            <div class="life-time"><span>🌤️ Afternoon:</span> ${data.afternoon}</div>
                            <div class="life-time"><span>🌙 Evening:</span> ${data.evening}</div>
                        </div>
                        <div class="life-stats">
                            <div class="life-stat">
                                <span class="stat-label">⏳ Life Expectancy:</span>
                                <span class="stat-value">${data.lifeExpectancy}</span>
                            </div>
                            <div class="life-stat">
                                <span class="stat-label">🍞 Diet:</span>
                                <span class="stat-value">${data.diet}</span>
                            </div>
                            <div class="life-stat">
                                <span class="stat-label">😰 Main Worries:</span>
                                <span class="stat-value">${data.concerns}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }
    
    getRoleIcon(role) {
        const icons = {
            farmer: '👨‍🌾',
            noble: '👑',
            citizen: '🏛️',
            slave: '⛓️',
            nomad: '🏕️',
            warrior: '⚔️',
            serf: '🌾',
            knight: '🛡️',
            monk: '📿',
            merchant: '💰',
            craftsman: '🔨'
        };
        return icons[role] || '👤';
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DayInLife;
}
