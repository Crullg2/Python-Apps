// VA Healthcare AI Chatbot - JavaScript Implementation with Voice & Analytics
class VAChatbot {    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.voiceButton = document.getElementById('voiceButton');
        this.speakerButton = document.getElementById('speakerButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.errorMessage = document.getElementById('errorMessage');
        this.voiceStatus = document.getElementById('voiceStatus');
        
        // Voice and TTS properties
        this.isRecording = false;
        this.recognition = null;
        this.speechSynthesis = window.speechSynthesis;
        this.isTTSEnabled = true;
        this.currentVoice = null;
        
        // Conversation context properties
        this.conversationHistory = [];
        this.currentTopic = null;
        this.lastQuestionCategory = null;
        this.contextMemory = {};
        this.followUpKeywords = ['how', 'what', 'when', 'where', 'why', 'explain', 'tell me more', 'how is it done', 'how does it work', 'can you explain'];
        
        // Analytics properties
        this.analytics = {
            sessionId: this.generateSessionId(),
            startTime: new Date(),
            questionCount: 0,
            topicInteractions: {},
            voiceUsage: 0,
            averageResponseTime: [],
            userSatisfaction: []
        };
        
        this.init();
        this.loadKnowledgeBase();
        this.initializeVoice();
        this.initializeAnalytics();
        this.setupTrainingIntegration();
    }init() {
        // Event listeners
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.chatInput.addEventListener('input', () => {
            this.clearError();
        });

        // Voice button event listener
        if (this.voiceButton) {
            this.voiceButton.addEventListener('click', () => {
                this.toggleVoiceRecording();
            });
        }

        // Speaker button event listener
        if (this.speakerButton) {
            this.speakerButton.addEventListener('click', () => {
                this.toggleTTS();
            });
        }

        // Auto-focus on input
        this.chatInput.focus();
    }

    loadKnowledgeBase() {
        this.knowledgeBase = {
            // General Questions
            "what is a vasectomy": {
                answer: "A vasectomy is a minor surgical procedure for male sterilization that prevents sperm from reaching semen. It's considered a permanent form of birth control.",
                category: "general"
            },
            
            "how effective is a vasectomy": {
                answer: "Vasectomies are over 99% effective at preventing pregnancy. They are one of the most reliable forms of contraception available.",
                category: "effectiveness"
            },
            
            "can a vasectomy fail": {
                answer: "Vasectomy failure is very rare, occurring in less than 1% of cases. When failures do occur, it's usually due to the tubes (vas deferens) reconnecting spontaneously, which typically happens within the first few months after the procedure.",
                category: "effectiveness"
            },

            // Preparation and Procedure
            "how should i prepare for a vasectomy": {
                answer: "To prepare for a vasectomy: avoid blood thinners for a week before the procedure (consult your doctor), shave the scrotal area as instructed by your healthcare provider, arrange for someone to drive you home, and follow any specific pre-procedure instructions from your doctor.",
                category: "preparation"
            },
            
            "what happens during a vasectomy": {
                answer: "During a vasectomy, the doctor makes small incisions or punctures in the scrotum to access the vas deferens (tubes that carry sperm). The vas deferens are then cut, sealed, or clipped to prevent sperm from mixing with semen. The procedure is typically done under local anesthesia.",
                category: "procedure"
            },
            
            "does it hurt during the procedure": {
                answer: "The procedure is usually painless when performed with local anesthetic. You may feel some mild discomfort, pressure, or tugging sensations, but significant pain is uncommon. Most patients report the procedure is much more comfortable than expected.",
                category: "procedure"
            },
            
            "how long does a vasectomy procedure take": {
                answer: "A vasectomy procedure typically takes 20-30 minutes to complete. The actual surgical time may be shorter, with additional time for preparation and post-procedure instructions.",
                category: "procedure"
            },

            // Recovery and Aftercare
            "what is the recovery like": {
                answer: "Recovery from a vasectomy typically involves mild swelling, discomfort, or bruising that may last a few days. Most men can return to desk work within 2-3 days and resume normal activities within a week. Ice packs and over-the-counter pain medication can help manage discomfort.",
                category: "recovery"
            },
            
            "how long until full recovery": {
                answer: "Most men experience initial recovery within a week, with complete healing typically occurring within 1-2 weeks. However, it's important to avoid heavy lifting and strenuous activities for about a week after the procedure.",
                category: "recovery"
            },
            
            "can i drive myself home after a vasectomy": {
                answer: "It's usually recommended to have someone else drive you home after a vasectomy. While you may feel fine immediately after the procedure, the local anesthetic can affect your comfort and reaction time, making driving potentially unsafe.",
                category: "recovery"
            },
            
            "when can i resume sexual activity": {
                answer: "You can typically resume sexual activity after one week or when you feel comfortable, but contraception is still necessary until cleared by a sperm test. It takes time for remaining sperm to clear from your system.",
                category: "recovery"
            },

            // Risks and Side Effects
            "are there any risks with a vasectomy": {
                answer: "Vasectomies have minimal risks. Potential complications include infection (rare), bleeding, bruising, or chronic pain (very rare, affecting less than 1% of men). Serious complications are extremely uncommon when performed by experienced healthcare providers.",
                category: "risks"
            },
            
            "can a vasectomy cause erectile dysfunction": {
                answer: "No, vasectomies do not cause erectile dysfunction or lower libido. The procedure doesn't affect testosterone production, hormone levels, or sexual performance. Your ability to have erections and orgasms remains unchanged.",
                category: "risks"
            },
            
            "does a vasectomy increase cancer risk": {
                answer: "No, there is no proven link between vasectomies and increased cancer risks. Extensive research has found no association between vasectomies and prostate cancer, testicular cancer, or any other cancers.",
                category: "risks"
            },

            // Effectiveness and Verification
            "how do i know the vasectomy worked": {
                answer: "A semen analysis confirms the absence of sperm, typically performed around 3 months after the procedure or after 20 ejaculations. This test ensures the vasectomy was successful and you can rely on it for contraception.",
                category: "verification"
            },
            
            "when can i stop using contraception": {
                answer: "You can stop using other forms of contraception only after a semen test confirms zero sperm in your sample. This typically occurs 2-3 months after the procedure, but the timing can vary by individual.",
                category: "verification"
            },

            // Reversal and Fertility Options
            "is a vasectomy reversible": {
                answer: "Vasectomies are often reversible through a more complex surgical procedure called vasovasostomy or vasoepididymostomy. Success rates vary widely, typically ranging from 40-90% for sperm return, though pregnancy rates may be lower.",
                category: "reversal"
            },
            
            "what if reversal isn't successful": {
                answer: "If vasectomy reversal isn't successful or isn't an option, assisted reproduction techniques like in vitro fertilization (IVF) with sperm extraction can still achieve pregnancy. These options should be discussed with a fertility specialist.",
                category: "reversal"
            },

            // Psychological and Relationship Impact
            "how might a vasectomy affect my relationship": {
                answer: "Many couples report that vasectomies positively impact their relationship and intimacy due to reduced worry about unplanned pregnancy. Open communication with your partner about the decision and any concerns is essential for relationship health.",
                category: "relationships"
            },
            
            "does a vasectomy change masculinity": {
                answer: "No, a vasectomy does not change masculinity or male identity. There are no physical or hormonal changes that affect masculine characteristics. The procedure only prevents sperm from mixing with semen during ejaculation.",
                category: "psychological"
            },

            // Financial and Insurance
            "how much does a vasectomy cost": {
                answer: "Vasectomy costs typically range from $300-$1,000 without insurance coverage. The exact cost varies by location, healthcare provider, and specific techniques used. Many insurance plans cover vasectomies as preventive care.",
                category: "financial"
            },
            
            "does insurance cover vasectomies": {
                answer: "Many insurance plans cover vasectomies partially or fully as they're considered preventive care. Coverage varies by plan, so it's important to confirm with your insurance provider about specific benefits and any required pre-authorization.",
                category: "financial"
            },

            // Comparisons to Other Methods
            "why choose vasectomy over female sterilization": {
                answer: "Vasectomy is generally safer, simpler, and less costly compared to tubal ligation (female sterilization). It's an outpatient procedure with lower risks and shorter recovery time, while tubal ligation requires general anesthesia and is more invasive.",
                category: "comparisons"
            },
            
            "is vasectomy safer than hormonal birth control": {
                answer: "Yes, vasectomies generally have fewer systemic side effects compared to long-term hormonal birth control methods. Once completed and verified, vasectomies provide permanent contraception without ongoing hormonal effects or daily maintenance.",
                category: "comparisons"
            },

            // Other Concerns
            "can i still ejaculate after a vasectomy": {
                answer: "Yes, you can still ejaculate normally after a vasectomy. Semen is produced normally by the prostate and seminal vesicles, but it will no longer contain sperm. The volume of ejaculate decreases by only about 2-5%.",
                category: "other"
            },
            
            "does a vasectomy affect orgasm": {
                answer: "No, a vasectomy does not affect orgasm or sexual pleasure. There are no changes in sensation, orgasm intensity, or sexual satisfaction. The physical and emotional aspects of sexual experience remain the same.",
                category: "other"
            },
              "are vasectomies age restricted": {
                answer: "Legally, there are no age restrictions for vasectomies. However, doctors may counsel younger men to carefully consider the decision, as life circumstances and desires for children may change over time. The procedure should be considered permanent.",
                category: "other"
            },

            // Mental Health Topics
            "what is ptsd": {
                answer: "Post-Traumatic Stress Disorder (PTSD) is a mental health condition triggered by experiencing or witnessing a traumatic event. Symptoms may include flashbacks, nightmares, severe anxiety, and uncontrollable thoughts about the event. VA provides comprehensive PTSD treatment and support services.",
                category: "mental_health"
            },

            "how do i get help for depression": {
                answer: "VA offers various depression treatment options including counseling, therapy, medication, and support groups. You can contact the Veterans Crisis Line at 988 (Press 1), visit your local VA medical center, or use the VA's online mental health resources. Help is available 24/7.",
                category: "mental_health"
            },

            "what is the veterans crisis line": {
                answer: "The Veterans Crisis Line provides 24/7 confidential support for veterans in crisis. Call 988 and press 1, text 838255, or chat online at VeteransCrisisLine.net. The service is available to all veterans, service members, National Guard, Reserve members, and their families.",
                category: "mental_health"
            },

            // Disability and Benefits
            "how do i file for disability benefits": {
                answer: "You can file for VA disability benefits online at VA.gov, by phone at 1-800-827-1000, by mail, or in person at a VA regional office. You'll need your military service records, medical evidence of your condition, and supporting documentation linking your condition to military service.",
                category: "benefits"
            },

            "what is va disability rating": {
                answer: "VA disability ratings range from 0% to 100% in 10% increments, representing the severity of your service-connected disability. Higher ratings result in higher monthly compensation. Ratings are based on how much your condition affects your ability to work and perform daily activities.",
                category: "benefits"
            },

            "how long does va claim take": {
                answer: "VA aims to complete disability claims within 125 days, though complex cases may take longer. You can check your claim status online at VA.gov, through the VA mobile app, or by calling 1-800-827-1000. Fully developed claims with all evidence typically process faster.",
                category: "benefits"
            },

            // Healthcare Services
            "how do i schedule va appointment": {
                answer: "You can schedule VA appointments online through My HealtheVet or VA.gov, by calling your VA medical center directly, using the VA mobile app, or visiting in person. For urgent care needs, you can also use VA's urgent care benefit at approved facilities.",
                category: "healthcare"
            },

            "what is my healthevet": {
                answer: "My HealtheVet is VA's online personal health record system. It allows you to view your health information, refill prescriptions, send secure messages to your healthcare team, schedule appointments, and track your health data. Registration is free for all veterans.",
                category: "healthcare"
            },

            "can i get prescriptions delivered": {
                answer: "Yes, VA offers prescription delivery through My HealtheVet. You can request prescription refills online and have them mailed to your home address. Most prescriptions are delivered within 3-5 business days. You can also pick up prescriptions at VA pharmacies.",
                category: "healthcare"
            },

            // Women Veterans Health
            "what health services are available for women veterans": {
                answer: "VA provides comprehensive healthcare for women veterans including primary care, gynecology, obstetrics, mammograms, cervical cancer screenings, maternity care, mental health services, and specialized programs for women veterans. Many VA facilities have dedicated women's health clinics.",
                category: "womens_health"
            },

            "does va cover maternity care": {
                answer: "Yes, VA provides maternity care for eligible women veterans including prenatal care, delivery, and postpartum care. VA also covers newborn care for up to 7 days after birth. Eligibility depends on your VA healthcare enrollment and service-connected conditions.",
                category: "womens_health"
            },

            // Substance Abuse
            "how do i get help for addiction": {
                answer: "VA offers comprehensive addiction treatment including detoxification, counseling, medication-assisted treatment, residential programs, and ongoing support. Contact your VA medical center, call the Veterans Crisis Line at 988 (Press 1), or visit VA.gov for substance abuse resources.",
                category: "substance_abuse"
            },

            "what is the vet center": {
                answer: "Vet Centers provide readjustment counseling and outreach services to combat veterans and their families. Services include individual and group counseling, family counseling, substance abuse counseling, employment counseling, and referrals to other VA services. No VA enrollment required.",
                category: "mental_health"
            },

            // Emergency and Urgent Care
            "when should i go to va emergency room": {
                answer: "Go to a VA emergency room for life-threatening conditions like chest pain, severe breathing problems, major injuries, stroke symptoms, or severe bleeding. For non-life-threatening urgent needs, consider VA urgent care or community urgent care facilities covered by VA.",
                category: "emergency"
            },

            "what is va urgent care benefit": {
                answer: "The VA urgent care benefit allows eligible veterans to receive urgent care at approved community providers when VA medical facilities aren't available. You can visit urgent care facilities for minor injuries, illnesses, or conditions that need prompt attention but aren't emergencies.",
                category: "healthcare"
            },

            // Specialty Care
            "how do i see a specialist": {
                answer: "To see a specialist, you typically need a referral from your VA primary care provider. Your provider will evaluate your condition and refer you to appropriate specialists within the VA system or to community providers if VA specialists aren't available or accessible.",
                category: "healthcare"
            },

            "what is choice program": {
                answer: "The VA Choice Program has been replaced by the VA MISSION Act Community Care program. This allows eligible veterans to receive care from community providers when VA can't provide care within reasonable timeframes or distances, or when it's in the veteran's best interest.",
                category: "healthcare"
            }        };

        // Load additional training data from training system
        this.loadTrainingData();

        // Create search index for better matching
        this.createSearchIndex();
    }    loadTrainingData() {
        // Load training data from the training system
        try {
            const trainingData = localStorage.getItem('va_chatbot_training_data');
            if (trainingData) {
                const parsed = JSON.parse(trainingData);
                if (parsed.qaPairs && Array.isArray(parsed.qaPairs)) {
                    // Add training Q&A pairs to knowledge base
                    parsed.qaPairs.forEach(qa => {
                        if (qa.question && qa.answer) {
                            // Create a unique key for the question
                            const key = qa.question.toLowerCase().trim();
                            this.knowledgeBase[key] = {
                                answer: qa.answer,
                                category: qa.category || 'training',
                                source: qa.source || 'training',
                                confidence: qa.confidence || 0.8
                            };
                        }
                    });
                    
                    console.log(`Loaded ${parsed.qaPairs.length} training Q&A pairs from training system`);
                }
                
                // Also load custom Q&A pairs
                const customQA = localStorage.getItem('va_chatbot_custom_qa');
                if (customQA) {
                    const customPairs = JSON.parse(customQA);
                    customPairs.forEach(qa => {
                        if (qa.question && qa.answer) {
                            const key = qa.question.toLowerCase().trim();
                            this.knowledgeBase[key] = {
                                answer: qa.answer,
                                category: qa.category || 'custom',
                                source: 'custom',
                                confidence: qa.confidence || 1.0
                            };
                        }
                    });
                    console.log(`Loaded ${customPairs.length} custom Q&A pairs`);
                }
            }
        } catch (error) {
            console.warn('Error loading training data:', error);
        }
    }

    setupTrainingIntegration() {
        // Listen for training updates
        window.addEventListener('storage', (e) => {
            if (e.key === 'va_chatbot_training_data' || e.key === 'va_chatbot_custom_qa') {
                console.log('Training data updated, reloading knowledge base...');
                this.loadKnowledgeBase();
                this.createSearchIndex();
            }
        });
        
        // Auto-refresh every 30 seconds to catch training updates
        setInterval(() => {
            this.loadTrainingData();
            this.createSearchIndex();
        }, 30000);
    }

    createSearchIndex() {
        this.searchIndex = [];
        
        Object.entries(this.knowledgeBase).forEach(([key, value]) => {
            // Add main question
            this.searchIndex.push({
                question: key,
                answer: value.answer,
                category: value.category,
                keywords: this.extractKeywords(key + " " + value.answer)
            });
            
            // Add variations and synonyms
            const variations = this.generateQuestionVariations(key);
            variations.forEach(variation => {
                this.searchIndex.push({
                    question: variation,
                    answer: value.answer,
                    category: value.category,
                    keywords: this.extractKeywords(variation + " " + value.answer)
                });
            });
        });
    }

    extractKeywords(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2)
            .filter(word => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'but', 'use', 'how', 'may', 'say', 'she', 'his', 'has', 'its'].includes(word));
    }

    generateQuestionVariations(question) {
        const variations = [];
        
        // Add common question starters
        const starters = ['what', 'how', 'when', 'where', 'why', 'is', 'are', 'can', 'will', 'does', 'do'];
        
        starters.forEach(starter => {
            if (!question.startsWith(starter)) {
                variations.push(starter + ' ' + question);
            }
        });
        
        // Add question mark versions
        if (!question.endsWith('?')) {
            variations.push(question + '?');
        }
        
        return variations;
    }    async sendMessage() {
        const message = this.chatInput.value.trim();
        
        if (!message) {
            this.showError('Please enter a question.');
            return;
        }

        this.clearError();
        this.trackAnalytics('question_asked', { question: message });
        
        // Add to conversation history
        this.conversationHistory.push({
            type: 'user',
            message: message,
            timestamp: new Date(),
            category: null
        });
        
        const startTime = Date.now();
        this.addUserMessage(message);
        this.chatInput.value = '';
        this.showTyping();
        
        // Simulate thinking time
        await this.delay(1000 + Math.random() * 1000);
        
        const response = this.generateResponse(message);
        const responseTime = Date.now() - startTime;
        this.analytics.averageResponseTime.push(responseTime);
        
        // Add response to conversation history
        this.conversationHistory.push({
            type: 'bot',
            message: response.text || response,
            timestamp: new Date(),
            category: response.category || this.lastQuestionCategory
        });
        
        // Keep only last 10 conversation turns
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
        
        this.hideTyping();
        this.addBotMessage(response.text || response);
        
        // Speak the response if TTS is enabled
        this.speakText(response.text || response);
        
        this.trackAnalytics('response_generated', { 
            responseTime, 
            responseLength: (response.text || response).length,
            question: message
        });
    }    generateResponse(userMessage) {
        const normalizedMessage = userMessage.toLowerCase().trim();
        
        // Check if this is a follow-up question
        const isFollowUp = this.isFollowUpQuestion(normalizedMessage);
        
        if (isFollowUp && this.currentTopic) {
            const contextualResponse = this.generateContextualResponse(normalizedMessage, this.currentTopic);
            if (contextualResponse) {
                return contextualResponse;
            }
        }
        
        // Direct match first
        if (this.knowledgeBase[normalizedMessage]) {
            const response = this.knowledgeBase[normalizedMessage];
            this.updateContext(response.category, normalizedMessage, response.answer);
            this.trackAnalytics('direct_match', { 
                question: userMessage,
                category: response.category 
            });
            return this.simplifyLanguage(response.answer, response.category);
        }

        // Fuzzy matching
        let bestMatch = null;
        let bestScore = 0;

        this.searchIndex.forEach(item => {
            const score = this.calculateSimilarity(normalizedMessage, item.question, item.keywords);
            if (score > bestScore && score > 0.3) {
                bestScore = score;
                bestMatch = item;
            }
        });

        if (bestMatch) {
            this.updateContext(bestMatch.category, normalizedMessage, bestMatch.answer);
            this.trackAnalytics('fuzzy_match', { 
                question: userMessage,
                matchedQuestion: bestMatch.question,
                score: bestScore,
                category: bestMatch.category 
            });
            return this.simplifyLanguage(bestMatch.answer, bestMatch.category);
        }

        // Fallback responses
        this.trackAnalytics('no_match', { question: userMessage });
        return this.getFallbackResponse(normalizedMessage);
    }

    isFollowUpQuestion(message) {
        // Check for follow-up keywords
        const followUpIndicators = [
            'how is it done', 'how does it work', 'how do i do that', 'how do you do that',
            'what does that mean', 'can you explain', 'tell me more', 'more details',
            'what about', 'how about', 'what if', 'why is that', 'how come',
            'explain that', 'what exactly', 'how exactly', 'what happens then',
            'how', 'what', 'when', 'where', 'why', 'explain', 'clarify'
        ];
        
        // Short questions are often follow-ups
        if (message.split(' ').length <= 3) {
            return followUpIndicators.some(indicator => message.includes(indicator));
        }
        
        return followUpIndicators.some(indicator => message.startsWith(indicator));
    }

    generateContextualResponse(message, topic) {
        // Generate follow-up responses based on current topic
        const contextResponses = {
            'procedure': {
                'how is it done': `The vasectomy procedure I mentioned involves making small incisions in the scrotum to access the vas deferens (sperm tubes). The doctor then cuts or blocks these tubes to prevent sperm from mixing with semen. It's done under local anesthesia and typically takes 20-30 minutes.`,
                'how': `The procedure works by cutting the vas deferens tubes that carry sperm from the testicles. This prevents sperm from reaching the semen during ejaculation, making the man sterile.`,
                'explain': `Let me break down the vasectomy procedure: First, you'll receive local anesthesia to numb the area. Then the doctor makes small openings in your scrotum to reach the vas deferens tubes. These tubes are cut and either sealed, tied, or a small section is removed. The openings are then closed with stitches or surgical glue.`
            },
            'recovery': {
                'how long': `Recovery time varies, but most men feel back to normal within a week. Initial healing takes 2-3 days, and you can usually return to work within 2-3 days if you have a desk job. Complete healing takes about 1-2 weeks.`,
                'what to expect': `After the procedure, expect some mild swelling, bruising, and discomfort for a few days. You can manage this with ice packs and over-the-counter pain medication. Avoid heavy lifting and strenuous activities for about a week.`,
                'how is it done': `Recovery involves following your doctor's aftercare instructions: keep the area clean and dry, wear supportive underwear, apply ice to reduce swelling, take prescribed pain medication, and avoid heavy lifting for a week.`
            },
            'effectiveness': {
                'how effective': `Vasectomies are over 99% effective - they're one of the most reliable forms of birth control. Failures are extremely rare, occurring in less than 1% of cases.`,
                'how': `The procedure works by permanently blocking sperm from reaching semen. Since sperm can't mix with semen anymore, pregnancy becomes virtually impossible.`,
                'why so effective': `Vasectomies are so effective because they physically block the pathway for sperm. Unlike other birth control methods that can fail due to user error or hormonal changes, a vasectomy creates a permanent physical barrier.`
            },
            'mental_health': {
                'how to get help': `You can get mental health support through VA by calling your local VA medical center, using the Veterans Crisis Line at 988 (Press 1), or visiting VA.gov to find mental health resources. Many services are available 24/7.`,
                'what treatment': `VA offers various treatments including individual counseling, group therapy, medication management, PTSD-specific therapies, and specialized programs for different conditions.`,
                'how does it work': `Mental health treatment typically starts with an assessment to understand your needs, then develops a treatment plan which might include therapy, medication, or both, with regular follow-ups to track progress.`
            },
            'benefits': {
                'how to apply': `You can apply for VA benefits online at VA.gov, by calling 1-800-827-1000, visiting a VA office in person, or working with a Veterans Service Organization representative.`,
                'how long': `VA aims to process disability claims within 125 days, but complex cases may take longer. You can track your claim's progress online or through the VA mobile app.`,
                'how does it work': `The VA disability system works by evaluating your medical condition and how it affects your daily life and work ability, then assigns a rating from 0% to 100% that determines your compensation.`
            }
        };
        
        if (contextResponses[topic]) {
            for (const [key, response] of Object.entries(contextResponses[topic])) {
                if (message.includes(key)) {
                    return {
                        text: response,
                        category: topic,
                        isContextual: true
                    };
                }
            }
        }
        
        return null;
    }

    updateContext(category, question, answer) {
        this.currentTopic = category;
        this.lastQuestionCategory = category;
        
        // Store context information
        this.contextMemory[category] = {
            lastQuestion: question,
            lastAnswer: answer,
            timestamp: new Date()
        };
    }

    simplifyLanguage(answer, category) {
        // Add context-aware explanations and simplifications
        let simplified = answer;
        
        // Add simple explanations for medical terms
        const medicalTerms = {
            'vas deferens': 'tubes that carry sperm',
            'scrotum': 'the sac that holds the testicles',
            'anesthesia': 'medicine to prevent pain',
            'ejaculation': 'when semen comes out during orgasm',
            'testosterone': 'the main male hormone',
            'prostate': 'a gland that helps make semen',
            'erectile dysfunction': 'trouble getting or keeping an erection',
            'vasovasostomy': 'surgery to reconnect the vas deferens tubes',
            'semen analysis': 'a test to check for sperm in your semen'
        };
        
        // Replace complex terms with simpler explanations
        for (const [term, explanation] of Object.entries(medicalTerms)) {
            if (simplified.includes(term)) {
                simplified = simplified.replace(new RegExp(term, 'gi'), `${term} (${explanation})`);
            }
        }
        
        // Add helpful follow-up suggestions
        const followUpSuggestions = {
            'procedure': `\n\n💡 You might also want to ask: "How should I prepare?" or "Does it hurt during the procedure?"`,
            'recovery': `\n\n💡 You might also want to ask: "When can I return to work?" or "What activities should I avoid?"`,
            'effectiveness': `\n\n💡 You might also want to ask: "How do I know it worked?" or "Can a vasectomy fail?"`,
            'mental_health': `\n\n💡 You might also want to ask: "What types of therapy are available?" or "Is help available 24/7?"`,
            'benefits': `\n\n💡 You might also want to ask: "What documents do I need?" or "How do I check my claim status?"`
        };
          if (followUpSuggestions[category]) {
            simplified += followUpSuggestions[category];
        }
        
        return {
            text: simplified,
            category: category,
            isSimplified: true
        };
    }

    calculateSimilarity(userMessage, questionText, keywords) {
        const userWords = this.extractKeywords(userMessage);
        const questionWords = this.extractKeywords(questionText);
        
        let score = 0;
        
        // Keyword matching
        userWords.forEach(userWord => {
            if (keywords.includes(userWord)) {
                score += 0.8;
            }
            questionWords.forEach(qWord => {
                if (userWord === qWord) {
                    score += 1.0;
                } else if (userWord.includes(qWord) || qWord.includes(userWord)) {
                    score += 0.5;
                }
            });
        });

        // Normalize by length
        const maxLength = Math.max(userWords.length, questionWords.length);
        return maxLength > 0 ? score / maxLength : 0;
    }

    getFallbackResponse(message) {
        const fallbacks = [
            "I'm sorry, I don't have specific information about that question. Could you try rephrasing or asking about vasectomy procedures, recovery, effectiveness, or risks?",
            "I don't have information on that specific topic. I can help you with questions about vasectomies, including preparation, procedure details, recovery, and potential risks.",
            "That's not something I can answer right now. I specialize in vasectomy-related questions. Try asking about effectiveness, recovery time, or preparation for the procedure.",
            "I'm not sure about that particular question. I'm designed to help with vasectomy information. Would you like to know about the procedure, recovery, or effectiveness instead?"
        ];

        // Check for medical emergency keywords
        const emergencyKeywords = ['emergency', 'urgent', 'help', 'pain', 'bleeding', 'infection'];
        if (emergencyKeywords.some(keyword => message.includes(keyword))) {
            return "⚠️ If you're experiencing a medical emergency or severe symptoms, please contact your healthcare provider immediately or call emergency services. I can only provide general information and cannot diagnose or treat medical conditions.";
        }

        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message user';
        messageElement.innerHTML = `
            <div class="message-content">${this.sanitizeHTML(message)}</div>
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
        `;
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }    addBotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot';
        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-user-md"></i>
            </div>
            <div class="message-content">
                ${this.sanitizeHTML(message)}
                <div class="message-feedback" style="margin-top: 10px; font-size: 12px;">
                    <span style="color: #666;">Was this helpful?</span>
                    <button onclick="provideFeedback(this, 'thumbs-up')" style="background: none; border: none; color: #28a745; cursor: pointer; margin: 0 5px;">
                        <i class="fas fa-thumbs-up"></i>
                    </button>
                    <button onclick="provideFeedback(this, 'thumbs-down')" style="background: none; border: none; color: #dc3545; cursor: pointer;">
                        <i class="fas fa-thumbs-down"></i>
                    </button>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    showTyping() {
        this.typingIndicator.style.display = 'flex';
        this.sendButton.disabled = true;
        this.scrollToBottom();
    }

    hideTyping() {
        this.typingIndicator.style.display = 'none';
        this.sendButton.disabled = false;
    }

    showError(message) {
        this.errorMessage.textContent = message;
        setTimeout(() => this.clearError(), 3000);
    }

    clearError() {
        this.errorMessage.textContent = '';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    initializeVoice() {
        // Check for speech recognition support
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                this.voiceButton.classList.add('recording');
                this.voiceStatus.textContent = 'Listening... Speak now';
                this.trackAnalytics('voice_start');
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.chatInput.value = transcript;
                this.voiceStatus.textContent = `Heard: "${transcript}"`;
                this.trackAnalytics('voice_recognized', { transcript });
                
                // Auto-send after 1 second
                setTimeout(() => {
                    if (this.chatInput.value.trim()) {
                        this.sendMessage();
                    }
                }, 1000);
            };
            
            this.recognition.onerror = (event) => {
                this.isRecording = false;
                this.voiceButton.classList.remove('recording');
                this.voiceStatus.textContent = `Voice error: ${event.error}`;
                this.trackAnalytics('voice_error', { error: event.error });
                
                setTimeout(() => {
                    this.voiceStatus.textContent = '';
                }, 3000);
            };
            
            this.recognition.onend = () => {
                this.isRecording = false;
                this.voiceButton.classList.remove('recording');
                if (!this.voiceStatus.textContent.startsWith('Heard:')) {
                    this.voiceStatus.textContent = '';
                }
            };
        } else {
            // Hide voice button if not supported
            if (this.voiceButton) {
                this.voiceButton.style.display = 'none';
            }
            console.log('Speech recognition not supported');
        }

        // Initialize text-to-speech voices
        this.loadVoices();
        
        // Voice loading event
        this.speechSynthesis.onvoiceschanged = () => {
            this.loadVoices();
        };
    }

    loadVoices() {
        const voices = this.speechSynthesis.getVoices();
        // Prefer US English female voice for healthcare context
        this.currentVoice = voices.find(voice => 
            voice.lang.includes('en-US') && voice.name.toLowerCase().includes('female')
        ) || voices.find(voice => voice.lang.includes('en-US')) || voices[0];
    }

    toggleVoiceRecording() {
        if (!this.recognition) {
            this.showError('Voice recognition not supported in this browser');
            return;
        }

        if (this.isRecording) {
            this.recognition.stop();
            this.voiceStatus.textContent = 'Voice recording stopped';
        } else {
            try {
                this.recognition.start();
                this.analytics.voiceUsage++;
            } catch (error) {
                this.showError('Could not start voice recognition');
                console.error('Voice recognition error:', error);
            }
        }
    }

    toggleTTS() {
        this.isTTSEnabled = !this.isTTSEnabled;
        
        if (this.isTTSEnabled) {
            this.speakerButton.classList.remove('muted');
            this.speakerButton.innerHTML = '<i class="fas fa-volume-up"></i>';
            this.speakerButton.title = 'Disable Text-to-Speech';
        } else {
            this.speakerButton.classList.add('muted');
            this.speakerButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
            this.speakerButton.title = 'Enable Text-to-Speech';
            this.speechSynthesis.cancel(); // Stop any current speech
        }
        
        this.trackAnalytics('tts_toggle', { enabled: this.isTTSEnabled });
    }

    speakText(text) {
        if (!this.isTTSEnabled || !this.speechSynthesis) return;
        
        // Cancel any ongoing speech
        this.speechSynthesis.cancel();
        
        // Clean text for speech (remove emojis and special characters)
        const cleanText = text.replace(/[^\w\s.,!?-]/g, '').trim();
        
        if (cleanText.length === 0) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.voice = this.currentVoice;
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        this.speechSynthesis.speak(utterance);
        this.trackAnalytics('tts_used', { textLength: cleanText.length });
    }

    initializeAnalytics() {
        // Track session start
        this.trackAnalytics('session_start', {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            hasVoiceSupport: !!this.recognition,
            hasTTSSupport: !!this.speechSynthesis
        });

        // Track session end when page unloads
        window.addEventListener('beforeunload', () => {
            this.trackAnalytics('session_end', {
                duration: Date.now() - this.analytics.startTime.getTime(),
                questionCount: this.analytics.questionCount,
                voiceUsage: this.analytics.voiceUsage
            });
        });

        // Periodic analytics summary (every 5 minutes)
        setInterval(() => {
            this.sendAnalyticsSummary();
        }, 5 * 60 * 1000);
    }

    generateSessionId() {
        return 'va-chat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    trackAnalytics(event, data = {}) {
        const analyticsEvent = {
            sessionId: this.analytics.sessionId,
            event: event,
            timestamp: new Date().toISOString(),
            data: data
        };

        // Store in localStorage for persistence
        const analyticsKey = 'va_chatbot_analytics';
        let analytics = JSON.parse(localStorage.getItem(analyticsKey) || '[]');
        analytics.push(analyticsEvent);
        
        // Keep only last 1000 events
        if (analytics.length > 1000) {
            analytics = analytics.slice(-1000);
        }
        
        localStorage.setItem(analyticsKey, JSON.stringify(analytics));

        // Update session analytics
        if (event === 'question_asked') {
            this.analytics.questionCount++;
            if (data.category) {
                this.analytics.topicInteractions[data.category] = 
                    (this.analytics.topicInteractions[data.category] || 0) + 1;
            }
        }

        // Console log for development
        console.log('Analytics:', analyticsEvent);
    }

    sendAnalyticsSummary() {
        const summary = {
            sessionId: this.analytics.sessionId,
            duration: Date.now() - this.analytics.startTime.getTime(),
            questionCount: this.analytics.questionCount,
            topicInteractions: this.analytics.topicInteractions,
            voiceUsage: this.analytics.voiceUsage,
            averageResponseTime: this.analytics.averageResponseTime.length > 0 
                ? this.analytics.averageResponseTime.reduce((a, b) => a + b) / this.analytics.averageResponseTime.length 
                : 0
        };

        // In a real implementation, send to analytics service
        console.log('Analytics Summary:', summary);
        
        // Could send to VA analytics endpoint:
        // fetch('/api/analytics/chatbot', { method: 'POST', body: JSON.stringify(summary) })
    }

    getAnalyticsReport() {
        const analyticsKey = 'va_chatbot_analytics';
        const analytics = JSON.parse(localStorage.getItem(analyticsKey) || '[]');
        
        const report = {
            totalSessions: new Set(analytics.map(e => e.sessionId)).size,
            totalQuestions: analytics.filter(e => e.event === 'question_asked').length,
            voiceUsage: analytics.filter(e => e.event === 'voice_start').length,
            commonTopics: {},
            averageSessionDuration: 0,
            errorRate: analytics.filter(e => e.event.includes('error')).length / analytics.length
        };

        // Calculate common topics
        analytics.filter(e => e.event === 'question_asked' && e.data.category)
            .forEach(e => {
                const category = e.data.category;
                report.commonTopics[category] = (report.commonTopics[category] || 0) + 1;
            });

        return report;
    }
}

// Global function for feedback (accessible from HTML)
function provideFeedback(button, type) {
    const feedbackDiv = button.parentElement;
    const buttons = feedbackDiv.querySelectorAll('button');
    
    // Disable all buttons and show selected
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
    
    button.style.opacity = '1';
    button.style.color = type === 'thumbs-up' ? '#28a745' : '#dc3545';
    
    // Track feedback
    if (window.chatbot) {
        window.chatbot.trackAnalytics('feedback_provided', { 
            type: type,
            timestamp: new Date().toISOString()
        });
        window.chatbot.analytics.userSatisfaction.push(type === 'thumbs-up' ? 1 : 0);
    }
    
    // Show thank you message
    setTimeout(() => {
        feedbackDiv.innerHTML = '<span style="color: #28a745; font-size: 11px;"><i class="fas fa-check"></i> Thank you for your feedback!</span>';
    }, 500);
}

// Enhanced askQuestion function
function askQuestion(question) {
    const chatInput = document.getElementById('chatInput');
    chatInput.value = question;
    chatInput.focus();
    
    // Track quick question usage
    if (window.chatbot) {
        window.chatbot.trackAnalytics('quick_question_used', { question });
    }
    
    // Auto-send the question
    setTimeout(() => {
        if (window.chatbot) {
            window.chatbot.sendMessage();
        }
    }, 100);
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new VAChatbot();
    
    // Add welcome message after a short delay
    setTimeout(() => {
        const welcomeMsg = `💡 <strong>Enhanced Features Available:</strong><br/>
        • 🎤 <em>Voice Input:</em> Click the microphone to speak your questions<br/>
        • 🔊 <em>Text-to-Speech:</em> Toggle the speaker icon to hear responses<br/>
        • 📊 <em>Analytics:</em> Your interactions help improve our service<br/>
        • 🏥 <em>Expanded Topics:</em> Ask about mental health, benefits, appointments, and more!<br/><br/>
        Try asking: "How do I schedule a VA appointment?" or "What is PTSD?"`;
        
        window.chatbot.addBotMessage(welcomeMsg);
    }, 2000);
      // Add analytics link
    setTimeout(() => {
        const analyticsMsg = `📈 <strong>For Administrators:</strong> <a href="analytics.html" target="_blank" style="color: #0078d4;">View Analytics Dashboard</a>`;
        window.chatbot.addBotMessage(analyticsMsg);
    }, 4000);
    
    // Add training portal link
    setTimeout(() => {
        const trainingMsg = `🎓 <strong>Training Portal:</strong> <a href="training.html" target="_blank" style="color: #0078d4;">Upload Documents & Train Knowledge Base</a>`;
        window.chatbot.addBotMessage(trainingMsg);
    }, 6000);
});

// Export for potential integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VAChatbot;
}
