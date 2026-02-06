/**
 * Rabbit Holes - AI-powered knowledge exploration
 * 
 * Click any topic to explore related concepts.
 * Uses AI to generate connections and explanations.
 */

class RabbitHoles {
    constructor(options = {}) {
        this.apiEndpoint = options.apiEndpoint || '/api/explore';
        this.useAI = options.useAI !== false;
        this.cache = new Map();
        this.history = [];
        this.onUpdate = options.onUpdate || (() => {});
        
        // Pre-built knowledge connections (fallback/seed data)
        this.knowledgeGraph = {
            "Pyramids of Giza": {
                summary: "Ancient Egyptian tomb complexes built around 2560 BC",
                connections: [
                    { topic: "Ancient Engineering", type: "engineering", question: "How were 2.3 million stone blocks moved without modern machinery?" },
                    { topic: "Egyptian Mathematics", type: "math", question: "What mathematical principles enabled such precise construction?" },
                    { topic: "Astronomy Alignment", type: "science", question: "Why do the pyramids align with Orion's Belt?" },
                    { topic: "Pharaoh Khufu", type: "people", question: "Who commissioned the Great Pyramid and why?" },
                    { topic: "Ancient Slavery Myths", type: "society", question: "Were the pyramids really built by slaves?" },
                    { topic: "Tomb Robbing", type: "history", question: "Why were most pyramids emptied within centuries?" }
                ]
            },
            "Ancient Engineering": {
                summary: "Construction techniques used before modern technology",
                connections: [
                    { topic: "Ramps and Levers", type: "engineering", question: "How did simple machines enable massive construction?" },
                    { topic: "Stone Cutting", type: "engineering", question: "How did ancient peoples cut granite with bronze tools?" },
                    { topic: "Roman Concrete", type: "engineering", question: "Why does Roman concrete last longer than modern concrete?" },
                    { topic: "Egyptian Mathematics", type: "math", question: "How did geometry enable architectural precision?" },
                    { topic: "Labor Organization", type: "society", question: "How were thousands of workers coordinated?" }
                ]
            },
            "Egyptian Mathematics": {
                summary: "Mathematical knowledge of ancient Egypt, including geometry and fractions",
                connections: [
                    { topic: "Rhind Papyrus", type: "artifact", question: "What does our oldest math textbook reveal?" },
                    { topic: "Unit Fractions", type: "math", question: "Why did Egyptians only use fractions with 1 as numerator?" },
                    { topic: "Seked (Slope)", type: "math", question: "How did Egyptians calculate pyramid angles?" },
                    { topic: "Greek Mathematics", type: "math", question: "How did Egyptian math influence Pythagoras and Euclid?" },
                    { topic: "Nilometer", type: "science", question: "How did math help predict the Nile floods?" }
                ]
            },
            "Roman Empire": {
                summary: "Ancient civilization centered on Rome, 27 BC - 476 AD",
                connections: [
                    { topic: "Roman Roads", type: "engineering", question: "How did 250,000 miles of roads unite an empire?" },
                    { topic: "Roman Law", type: "society", question: "Why is Roman law still the basis of modern legal systems?" },
                    { topic: "Roman Military", type: "military", question: "What made the Roman legions nearly unbeatable?" },
                    { topic: "Fall of Rome", type: "history", question: "Why did the greatest empire collapse?" },
                    { topic: "Roman Concrete", type: "engineering", question: "What's the secret of 2000-year-old Roman buildings?" },
                    { topic: "Latin Language", type: "culture", question: "How does a 'dead' language still shape our world?" }
                ]
            },
            "Mongol Empire": {
                summary: "Largest contiguous land empire in history, founded by Genghis Khan",
                connections: [
                    { topic: "Genghis Khan", type: "people", question: "How did an orphan become history's greatest conqueror?" },
                    { topic: "Mongol Military Tactics", type: "military", question: "What made Mongol cavalry invincible?" },
                    { topic: "Silk Road", type: "trade", question: "How did Mongol peace enable global trade?" },
                    { topic: "Black Death", type: "science", question: "Did the Mongols accidentally spread the plague?" },
                    { topic: "Pax Mongolica", type: "history", question: "What was life like under Mongol rule?" },
                    { topic: "Mongol Decline", type: "history", question: "Why did the empire fragment after Kublai Khan?" }
                ]
            },
            "Battle of Thermopylae": {
                summary: "480 BC battle where 300 Spartans held off Persian army",
                connections: [
                    { topic: "Spartan Military", type: "military", question: "What made Spartans the ancient world's elite warriors?" },
                    { topic: "Persian Empire", type: "history", question: "Why did Xerxes invade Greece?" },
                    { topic: "Greek Phalanx", type: "military", question: "How did the phalanx formation work?" },
                    { topic: "Leonidas", type: "people", question: "Who was the Spartan king who chose death over retreat?" },
                    { topic: "Hot Gates Geography", type: "geography", question: "Why was Thermopylae such a strategic chokepoint?" }
                ]
            },
            "Columbus reaches Americas": {
                summary: "1492 voyage that initiated sustained European contact with the Americas",
                connections: [
                    { topic: "Navigation Technology", type: "engineering", question: "How did 15th century sailors cross oceans?" },
                    { topic: "Columbian Exchange", type: "science", question: "How did two worlds' plants and diseases transform both?" },
                    { topic: "Indigenous Civilizations", type: "history", question: "What advanced civilizations existed before contact?" },
                    { topic: "Spanish Colonization", type: "history", question: "How did Spain build a global empire?" },
                    { topic: "Columbus Controversy", type: "society", question: "Should Columbus be celebrated or condemned?" }
                ]
            }
        };
    }
    
    /**
     * Explore a topic - get summary and related rabbit holes
     */
    async explore(topic) {
        // Check cache
        if (this.cache.has(topic)) {
            return this.cache.get(topic);
        }
        
        // Check pre-built knowledge
        if (this.knowledgeGraph[topic]) {
            const result = this.knowledgeGraph[topic];
            this.cache.set(topic, result);
            this.history.push(topic);
            return result;
        }
        
        // If AI is enabled, generate dynamically
        if (this.useAI) {
            try {
                const result = await this.generateWithAI(topic);
                this.cache.set(topic, result);
                this.history.push(topic);
                return result;
            } catch (err) {
                console.error('AI generation failed:', err);
            }
        }
        
        // Fallback: generate from Wikipedia API
        return this.generateFromWikipedia(topic);
    }
    
    /**
     * Generate rabbit holes using AI
     */
    async generateWithAI(topic) {
        // This would call your AI endpoint
        // For now, return a placeholder structure
        const prompt = `
            Topic: "${topic}"
            
            Generate a brief summary (2-3 sentences) and 5-6 related "rabbit hole" topics 
            that someone curious about ${topic} might want to explore next.
            
            For each rabbit hole, include:
            - Topic name
            - Type (engineering, math, science, history, people, society, military, culture, trade)
            - A compelling question that makes people want to click
            
            Return as JSON:
            {
                "summary": "...",
                "connections": [
                    {"topic": "...", "type": "...", "question": "..."}
                ]
            }
        `;
        
        // Placeholder - in production, call your AI API
        return {
            summary: `Exploring: ${topic}. This topic connects to many fascinating areas of history and knowledge.`,
            connections: [
                { topic: "Related History", type: "history", question: "What historical context shaped this?" },
                { topic: "Key People", type: "people", question: "Who were the major figures involved?" },
                { topic: "Technology & Engineering", type: "engineering", question: "What technical innovations were involved?" },
                { topic: "Cultural Impact", type: "culture", question: "How did this shape society?" },
                { topic: "Modern Connections", type: "society", question: "How does this still affect us today?" }
            ],
            aiGenerated: true
        };
    }
    
    /**
     * Generate from Wikipedia API
     */
    async generateFromWikipedia(topic) {
        try {
            // Get Wikipedia extract
            const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
            const response = await fetch(searchUrl);
            const data = await response.json();
            
            return {
                summary: data.extract || `Information about ${topic}`,
                wikiUrl: data.content_urls?.desktop?.page,
                connections: [
                    { topic: "Historical Context", type: "history", question: "What was happening in the world at this time?" },
                    { topic: "Key Figures", type: "people", question: "Who were the important people involved?" },
                    { topic: "Consequences", type: "history", question: "What were the lasting effects?" }
                ],
                fromWikipedia: true
            };
        } catch (err) {
            return {
                summary: `Explore ${topic} and its connections to history.`,
                connections: [],
                error: true
            };
        }
    }
    
    /**
     * Get breadcrumb trail
     */
    getHistory() {
        return [...this.history];
    }
    
    /**
     * Go back in history
     */
    goBack() {
        if (this.history.length > 1) {
            this.history.pop();
            return this.history[this.history.length - 1];
        }
        return null;
    }
    
    /**
     * Clear history
     */
    clearHistory() {
        this.history = [];
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RabbitHoles;
}
