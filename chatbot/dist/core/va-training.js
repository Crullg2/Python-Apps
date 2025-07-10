// VA Healthcare AI Chatbot Training System
class VAChatbotTraining {
    constructor() {
        this.uploadedFiles = [];
        this.knowledgeBase = this.loadKnowledgeBase();
        this.customQAPairs = this.loadCustomQA();
        this.trainingData = this.loadTrainingData();
        this.processingQueue = [];
        this.isTraining = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabNavigation();
        this.loadInitialData();
        this.refreshStats();
    }

    setupEventListeners() {
        // File upload events
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        const importInput = document.getElementById('importInput');

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (uploadArea) {
            uploadArea.addEventListener('click', () => fileInput?.click());
            uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            uploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
        }

        if (importInput) {
            importInput.addEventListener('change', (e) => this.handleImportSelect(e));
        }

        // Form events
        const questionInput = document.getElementById('questionInput');
        const answerInput = document.getElementById('answerInput');
        
        if (questionInput) {
            questionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addQAPair();
                }
            });
        }

        if (answerInput) {
            answerInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    this.addQAPair();
                }
            });
        }
    }

    setupTabNavigation() {
        const tabs = document.querySelectorAll('.nav-tab');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // Remove active from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                // Add active to clicked tab and corresponding content
                tab.classList.add('active');
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.add('active');
                }

                // Load tab-specific data
                this.loadTabData(targetTab);
            });
        });
    }

    loadTabData(tabName) {
        switch (tabName) {
            case 'upload':
                this.refreshFileList();
                break;
            case 'qa':
                this.refreshQAList();
                break;
            case 'training':
                this.refreshTrainingStatus();
                break;
            case 'knowledge':
                this.refreshStats();
                this.refreshKnowledgePreview();
                break;
        }
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.addFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        event.target.closest('.upload-area').classList.add('dragover');
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.target.closest('.upload-area').classList.remove('dragover');
    }

    handleFileDrop(event) {
        event.preventDefault();
        event.target.closest('.upload-area').classList.remove('dragover');
        
        const files = Array.from(event.dataTransfer.files);
        this.addFiles(files);
    }

    addFiles(files) {
        const validExtensions = ['.pdf', '.txt', '.doc', '.docx', '.md'];
        const maxFileSize = 10 * 1024 * 1024; // 10MB

        files.forEach(file => {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            
            if (!validExtensions.includes(extension)) {
                this.showAlert(`File "${file.name}" has an unsupported format. Supported formats: PDF, TXT, DOC, DOCX, MD`, 'error');
                return;
            }

            if (file.size > maxFileSize) {
                this.showAlert(`File "${file.name}" is too large. Maximum size is 10MB.`, 'error');
                return;
            }

            // Check if file already exists
            if (this.uploadedFiles.find(f => f.name === file.name && f.size === file.size)) {
                this.showAlert(`File "${file.name}" is already uploaded.`, 'info');
                return;
            }

            const fileData = {
                id: this.generateId(),
                name: file.name,
                size: file.size,
                type: file.type,
                extension: extension,
                uploadDate: new Date(),
                status: 'uploaded',
                content: null,
                extractedText: null,
                qaPairs: []
            };

            this.uploadedFiles.push(fileData);
            this.readFileContent(file, fileData);
        });

        this.refreshFileList();
        this.showAlert(`${files.length} file(s) uploaded successfully!`, 'success');
    }

    readFileContent(file, fileData) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            fileData.content = e.target.result;
            
            // Extract text based on file type
            if (fileData.extension === '.txt' || fileData.extension === '.md') {
                fileData.extractedText = e.target.result;
                fileData.status = 'ready';
            } else {
                // For other formats, we'll simulate text extraction
                fileData.extractedText = this.simulateTextExtraction(fileData.name);
                fileData.status = 'ready';
            }
            
            this.saveUploadedFiles();
            this.refreshFileList();
        };

        reader.onerror = () => {
            fileData.status = 'error';
            this.showAlert(`Error reading file "${file.name}"`, 'error');
            this.refreshFileList();
        };

        reader.readAsText(file);
    }

    simulateTextExtraction(filename) {
        // Simulate text extraction for demo purposes
        const sampleTexts = {
            'medical-guidelines': `
                VA Medical Guidelines for Healthcare Providers
                
                Patient Care Standards:
                - All patients must be treated with dignity and respect
                - Medical records must be maintained according to HIPAA standards
                - Emergency cases have priority in all situations
                
                Mental Health Services:
                - PTSD screening required for all combat veterans
                - Depression assessments should be conducted annually
                - Crisis intervention available 24/7 via Veterans Crisis Line
                
                Medication Management:
                - All prescriptions must be reviewed for drug interactions
                - Patient allergies must be verified before prescribing
                - Generic medications should be used when available
            `,
            'benefits-guide': `
                VA Benefits Comprehensive Guide
                
                Disability Compensation:
                - Veterans with service-connected disabilities are eligible
                - Ratings range from 0% to 100% in 10% increments
                - Claims can be filed online through VA.gov
                
                Healthcare Benefits:
                - Enrolled veterans receive comprehensive medical care
                - Priority groups determine cost of care
                - Specialists available through referral system
                
                Education Benefits:
                - GI Bill provides education funding
                - Vocational rehabilitation available for disabled veterans
                - On-the-job training programs supported
            `,
            'appointment-procedures': `
                VA Appointment Scheduling Procedures
                
                Scheduling Methods:
                - Online through My HealtheVet portal
                - Phone calls to local VA medical center
                - In-person at patient registration desk
                
                Appointment Types:
                - Primary care visits
                - Specialty consultations
                - Mental health appointments
                - Laboratory and imaging services
                
                Cancellation Policy:
                - 24-hour notice required for cancellations
                - No-shows may result in scheduling restrictions
                - Emergency situations are always accommodated
            `
        };

        // Return sample text based on filename keywords
        for (const [key, text] of Object.entries(sampleTexts)) {
            if (filename.toLowerCase().includes(key.split('-')[0])) {
                return text.trim();
            }
        }

        // Default sample text
        return `Sample medical document content for ${filename}. This would contain extracted text from the uploaded document including medical procedures, guidelines, patient care instructions, and other relevant healthcare information.`;
    }

    processFile(fileId) {
        const file = this.uploadedFiles.find(f => f.id === fileId);
        if (!file || !file.extractedText) {
            this.showAlert('File not ready for processing', 'error');
            return;
        }

        file.status = 'processing';
        this.refreshFileList();

        // Simulate processing with progress
        let progress = 0;
        const processInterval = setInterval(() => {
            progress += 10;
            
            if (progress >= 100) {
                clearInterval(processInterval);
                file.status = 'processed';
                file.qaPairs = this.extractQAPairs(file.extractedText);
                
                // Add to knowledge base
                this.addToKnowledgeBase(file);
                
                this.refreshFileList();
                this.showAlert(`File "${file.name}" processed successfully!`, 'success');
            }
        }, 200);
    }

    extractQAPairs(text) {
        // Simple Q&A extraction algorithm
        const lines = text.split('\n').filter(line => line.trim());
        const qaPairs = [];
        
        // Look for headings that can become questions
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            // If line ends with colon or is a heading
            if (trimmedLine.endsWith(':') || trimmedLine.match(/^[A-Z][^.]*[^:]$/)) {
                const question = trimmedLine.replace(':', '');
                
                // Get the next few lines as answer
                const answerLines = [];
                for (let i = index + 1; i < Math.min(index + 4, lines.length); i++) {
                    const nextLine = lines[i].trim();
                    if (nextLine && !nextLine.endsWith(':')) {
                        answerLines.push(nextLine);
                    } else {
                        break;
                    }
                }
                
                if (answerLines.length > 0) {
                    qaPairs.push({
                        id: this.generateId(),
                        question: question,
                        answer: answerLines.join(' '),
                        category: this.detectCategory(question + ' ' + answerLines.join(' ')),
                        source: 'document',
                        confidence: 0.8
                    });
                }
            }
        });

        return qaPairs;
    }

    detectCategory(text) {
        const categories = {
            'mental-health': ['ptsd', 'depression', 'anxiety', 'mental', 'crisis', 'counseling'],
            'benefits': ['disability', 'compensation', 'pension', 'education', 'gi bill'],
            'healthcare': ['medical', 'doctor', 'clinic', 'hospital', 'treatment'],
            'appointments': ['appointment', 'scheduling', 'visit', 'clinic'],
            'prescriptions': ['medication', 'prescription', 'pharmacy', 'drug'],
            'emergency': ['emergency', 'urgent', 'crisis', '911', 'immediate']
        };

        const lowerText = text.toLowerCase();
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                return category;
            }
        }
        
        return 'general';
    }

    addToKnowledgeBase(file) {
        if (!this.knowledgeBase.documents) {
            this.knowledgeBase.documents = [];
        }
        
        if (!this.knowledgeBase.qaPairs) {
            this.knowledgeBase.qaPairs = [];
        }

        // Add document info
        this.knowledgeBase.documents.push({
            id: file.id,
            name: file.name,
            uploadDate: file.uploadDate,
            processDate: new Date(),
            qaPairCount: file.qaPairs.length
        });

        // Add Q&A pairs
        this.knowledgeBase.qaPairs.push(...file.qaPairs);
        
        this.saveKnowledgeBase();
    }    processAllFiles() {
        const readyFiles = this.uploadedFiles.filter(f => f.status === 'ready');
        
        if (readyFiles.length === 0) {
            this.showAlert('No files ready for processing', 'info');
            return;
        }

        this.showAlert(`Processing ${readyFiles.length} files...`, 'info');
        
        let processedCount = 0;
        readyFiles.forEach((file, index) => {
            setTimeout(() => {
                this.processFile(file.id);
                processedCount++;
                
                // Auto-sync when all files are processed
                if (processedCount === readyFiles.length) {
                    setTimeout(() => {
                        this.syncWithMainChatbot();
                        this.showAlert('All files processed and synced with chatbot!', 'success');
                    }, 1000);
                }
            }, index * 1000); // Stagger processing
        });
    }

    clearAllFiles() {
        if (confirm('Are you sure you want to clear all uploaded files? This action cannot be undone.')) {
            this.uploadedFiles = [];
            this.saveUploadedFiles();
            this.refreshFileList();
            this.showAlert('All files cleared', 'info');
        }
    }

    deleteFile(fileId) {
        if (confirm('Are you sure you want to delete this file?')) {
            this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId);
            this.saveUploadedFiles();
            this.refreshFileList();
            this.showAlert('File deleted', 'info');
        }
    }

    addQAPair() {
        const questionInput = document.getElementById('questionInput');
        const answerInput = document.getElementById('answerInput');
        const categoryInput = document.getElementById('categoryInput');

        const question = questionInput?.value.trim();
        const answer = answerInput?.value.trim();
        const category = categoryInput?.value || 'general';

        if (!question || !answer) {
            this.showAlert('Please enter both question and answer', 'error');
            return;
        }

        const qaPair = {
            id: this.generateId(),
            question: question,
            answer: answer,
            category: category,
            source: 'manual',
            dateAdded: new Date(),
            confidence: 1.0
        };        this.customQAPairs.push(qaPair);
        this.saveCustomQA();

        // Clear form
        if (questionInput) questionInput.value = '';
        if (answerInput) answerInput.value = '';
        if (categoryInput) categoryInput.value = '';

        this.refreshQAList();
        this.showAlert('Q&A pair added successfully!', 'success');
        
        // Auto-sync with main chatbot
        this.syncWithMainChatbot();
    }

    deleteQAPair(id) {
        if (confirm('Are you sure you want to delete this Q&A pair?')) {
            this.customQAPairs = this.customQAPairs.filter(qa => qa.id !== id);
            this.saveCustomQA();
            this.refreshQAList();
            this.showAlert('Q&A pair deleted', 'info');
        }
    }

    startTraining() {
        if (this.isTraining) {
            this.showAlert('Training is already in progress', 'info');
            return;
        }

        this.isTraining = true;
        this.updateTrainingStatus('Training...', 0);
        
        // Simulate training process
        let progress = 0;
        const trainingInterval = setInterval(() => {
            progress += 5;
            this.updateTrainingStatus('Training...', progress);
            
            if (progress >= 100) {
                clearInterval(trainingInterval);
                this.isTraining = false;
                this.updateTrainingStatus('Completed', 100);
                this.updateLastUpdated();
                this.showAlert('Training completed successfully!', 'success');
                
                // Update the main chatbot's knowledge base
                this.syncWithMainChatbot();
            }
        }, 100);
    }    syncWithMainChatbot() {
        // Combine all Q&A pairs
        const allQAPairs = [
            ...this.knowledgeBase.qaPairs || [],
            ...this.customQAPairs || []
        ];

        // Process Q&A pairs to add simple language alternatives
        const processedQAPairs = allQAPairs.map(qa => {
            return {
                ...qa,
                simplifiedAnswer: this.simplifyLanguage(qa.answer),
                alternativeQuestions: this.generateAlternativeQuestions(qa.question)
            };
        });

        // Save to localStorage for main chatbot to use
        localStorage.setItem('va_chatbot_training_data', JSON.stringify({
            qaPairs: processedQAPairs,
            lastUpdated: new Date(),
            version: '1.0'
        }));

        // Trigger storage event for real-time sync
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'va_chatbot_training_data',
            newValue: JSON.stringify({
                qaPairs: processedQAPairs,
                lastUpdated: new Date(),
                version: '1.0'
            })
        }));

        this.showAlert('Knowledge base synchronized with main chatbot', 'success');
        console.log(`Synchronized ${processedQAPairs.length} Q&A pairs with main chatbot`);
    }

    simplifyLanguage(text) {
        // Convert complex medical language to simpler terms
        const simplifications = {
            'procedure': 'operation or surgery',
            'contraception': 'birth control',
            'sterilization': 'permanent birth control',
            'anesthesia': 'medicine to stop pain',
            'vas deferens': 'tubes that carry sperm',
            'scrotum': 'sac that holds testicles',
            'ejaculation': 'when sperm comes out',
            'testosterone': 'male hormone',
            'erectile dysfunction': 'trouble getting an erection',
            'post-traumatic stress disorder': 'PTSD - a condition caused by traumatic events',
            'compensation': 'monthly payment',
            'service-connected': 'related to military service',
            'disability rating': 'percentage showing how much your disability affects you'
        };

        let simplified = text;
        for (const [complex, simple] of Object.entries(simplifications)) {
            const regex = new RegExp(`\\b${complex}\\b`, 'gi');
            simplified = simplified.replace(regex, `${complex} (${simple})`);
        }

        return simplified;
    }

    generateAlternativeQuestions(question) {
        // Generate common ways the same question might be asked
        const alternatives = [];
        const lowerQuestion = question.toLowerCase();
        
        // Add casual versions
        if (lowerQuestion.includes('what is')) {
            alternatives.push(lowerQuestion.replace('what is', 'what\'s'));
            alternatives.push(lowerQuestion.replace('what is', 'tell me about'));
            alternatives.push(lowerQuestion.replace('what is', 'explain'));
        }
        
        if (lowerQuestion.includes('how do i')) {
            alternatives.push(lowerQuestion.replace('how do i', 'how can i'));
            alternatives.push(lowerQuestion.replace('how do i', 'how to'));
        }
        
        // Add question mark variations
        if (!question.endsWith('?')) {
            alternatives.push(question + '?');
        }
        
        // Add "how is it done" variations for procedures
        if (lowerQuestion.includes('procedure') || lowerQuestion.includes('surgery') || lowerQuestion.includes('operation')) {
            alternatives.push('how is it done');
            alternatives.push('how does it work');
            alternatives.push('what happens');
        }
        
        return alternatives;
    }

    exportKnowledgeBase() {
        const exportData = {
            knowledgeBase: this.knowledgeBase,
            customQAPairs: this.customQAPairs,
            trainingData: this.trainingData,
            exportDate: new Date(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `va-chatbot-knowledge-base-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showAlert('Knowledge base exported successfully!', 'success');
    }

    importKnowledgeBase() {
        document.getElementById('importInput')?.click();
    }

    handleImportSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (importData.knowledgeBase) {
                    this.knowledgeBase = importData.knowledgeBase;
                    this.saveKnowledgeBase();
                }
                
                if (importData.customQAPairs) {
                    this.customQAPairs = importData.customQAPairs;
                    this.saveCustomQA();
                }
                
                if (importData.trainingData) {
                    this.trainingData = importData.trainingData;
                    this.saveTrainingData();
                }

                this.refreshStats();
                this.refreshQAList();
                this.refreshKnowledgePreview();
                this.showAlert('Knowledge base imported successfully!', 'success');
                
            } catch (error) {
                this.showAlert('Error importing knowledge base: Invalid file format', 'error');
            }
        };

        reader.readAsText(file);
    }

    refreshFileList() {
        const fileList = document.getElementById('fileList');
        const fileItems = document.getElementById('fileItems');
        
        if (!fileItems) return;

        if (this.uploadedFiles.length === 0) {
            if (fileList) fileList.style.display = 'none';
            return;
        }

        if (fileList) fileList.style.display = 'block';

        fileItems.innerHTML = this.uploadedFiles.map(file => `
            <div class="file-item">
                <div class="file-info">
                    <div class="file-icon">
                        <i class="fas ${this.getFileIcon(file.extension)}"></i>
                    </div>
                    <div class="file-details">
                        <div class="file-name">${file.name}</div>
                        <div class="file-meta">
                            ${this.formatFileSize(file.size)} • 
                            ${file.status} • 
                            ${file.uploadDate.toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div class="file-actions">
                    ${file.status === 'ready' ? 
                        `<button class="btn btn-small" onclick="trainingBot.processFile('${file.id}')">
                            <i class="fas fa-play"></i> Process
                        </button>` : ''
                    }
                    <button class="btn btn-danger btn-small" onclick="trainingBot.deleteFile('${file.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    refreshQAList() {
        const qaItems = document.getElementById('qaItems');
        if (!qaItems) return;

        if (this.customQAPairs.length === 0) {
            qaItems.innerHTML = '<p class="text-center">No Q&A pairs added yet.</p>';
            return;
        }

        qaItems.innerHTML = this.customQAPairs.map(qa => `
            <div class="qa-item">
                <div class="qa-question">Q: ${qa.question}</div>
                <div class="qa-answer">A: ${qa.answer}</div>
                <div class="qa-meta" style="margin-top: 10px; font-size: 12px; color: #6c757d;">
                    Category: ${qa.category} • Added: ${new Date(qa.dateAdded).toLocaleDateString()}
                    <button class="btn btn-danger btn-small" style="float: right;" onclick="trainingBot.deleteQAPair('${qa.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    refreshTrainingStatus() {
        // Status is updated during training process
    }

    refreshStats() {
        const totalQAElement = document.getElementById('totalQA');
        const totalDocumentsElement = document.getElementById('totalDocuments');
        const totalCategoriesElement = document.getElementById('totalCategories');
        const knowledgeSizeElement = document.getElementById('knowledgeSize');

        const allQAPairs = [
            ...(this.knowledgeBase.qaPairs || []),
            ...this.customQAPairs
        ];

        const categories = new Set(allQAPairs.map(qa => qa.category));
        const totalSize = JSON.stringify(this.knowledgeBase).length / (1024 * 1024);

        if (totalQAElement) totalQAElement.textContent = allQAPairs.length;
        if (totalDocumentsElement) totalDocumentsElement.textContent = this.uploadedFiles.length;
        if (totalCategoriesElement) totalCategoriesElement.textContent = categories.size;
        if (knowledgeSizeElement) knowledgeSizeElement.textContent = totalSize.toFixed(2);
    }

    refreshKnowledgePreview() {
        const preview = document.getElementById('knowledgePreview');
        if (!preview) return;

        const allQAPairs = [
            ...(this.knowledgeBase.qaPairs || []),
            ...this.customQAPairs
        ].slice(0, 5); // Show first 5

        if (allQAPairs.length === 0) {
            preview.innerHTML = '<p class="text-center">No knowledge base entries yet.</p>';
            return;
        }

        preview.innerHTML = allQAPairs.map(qa => `
            <div class="qa-item">
                <div class="qa-question">Q: ${qa.question}</div>
                <div class="qa-answer">A: ${qa.answer}</div>
                <div class="qa-meta" style="margin-top: 10px; font-size: 12px; color: #6c757d;">
                    Category: ${qa.category} • Source: ${qa.source}
                </div>
            </div>
        `).join('');
    }

    testKnowledge() {
        const testQuestions = [
            "What are the hours for mental health services?",
            "How do I schedule an appointment?",
            "What benefits am I eligible for?",
            "How do I refill my prescription?",
            "What should I do in an emergency?"
        ];

        const results = testQuestions.map(question => {
            const answer = this.findAnswer(question);
            return { question, answer: answer ? answer.answer : 'No answer found' };
        });

        const resultsHtml = results.map(r => `
            <div class="qa-item">
                <div class="qa-question">Q: ${r.question}</div>
                <div class="qa-answer">A: ${r.answer}</div>
            </div>
        `).join('');

        // Show results in a modal or new section
        this.showAlert('Knowledge test completed. Check console for results.', 'info');
        console.log('Knowledge Test Results:', results);
    }

    findAnswer(question) {
        const allQAPairs = [
            ...(this.knowledgeBase.qaPairs || []),
            ...this.customQAPairs
        ];

        const lowerQuestion = question.toLowerCase();
        
        // Simple keyword matching
        return allQAPairs.find(qa => 
            qa.question.toLowerCase().includes(lowerQuestion) ||
            lowerQuestion.includes(qa.question.toLowerCase()) ||
            qa.answer.toLowerCase().includes(lowerQuestion)
        );
    }

    optimizeKnowledge() {
        // Remove duplicates and low-confidence entries
        const allQAPairs = [
            ...(this.knowledgeBase.qaPairs || []),
            ...this.customQAPairs
        ];

        const originalCount = allQAPairs.length;
        
        // Remove duplicates based on similar questions
        const optimized = allQAPairs.filter((qa, index, array) => {
            return !array.slice(0, index).some(other => 
                this.calculateSimilarity(qa.question, other.question) > 0.8
            );
        });

        // Update knowledge base
        this.knowledgeBase.qaPairs = optimized.filter(qa => qa.source !== 'manual');
        this.customQAPairs = optimized.filter(qa => qa.source === 'manual');
        
        this.saveKnowledgeBase();
        this.saveCustomQA();
        
        const savedCount = originalCount - optimized.length;
        this.showAlert(`Knowledge base optimized! Removed ${savedCount} duplicate entries.`, 'success');
        this.refreshStats();
    }

    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    updateTrainingStatus(status, progress) {
        const statusElement = document.getElementById('trainingStatus');
        const progressElement = document.getElementById('processingProgress');
        const progressFill = document.getElementById('progressFill');

        if (statusElement) statusElement.textContent = status;
        if (progressElement) progressElement.textContent = `${progress}%`;
        if (progressFill) progressFill.style.width = `${progress}%`;
    }

    updateLastUpdated() {
        const lastUpdatedElement = document.getElementById('lastUpdated');
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = new Date().toLocaleString();
        }
    }

    getFileIcon(extension) {
        const icons = {
            '.pdf': 'fa-file-pdf',
            '.txt': 'fa-file-alt',
            '.doc': 'fa-file-word',
            '.docx': 'fa-file-word',
            '.md': 'fa-file-code'
        };
        return icons[extension] || 'fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            max-width: 400px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        alert.innerHTML = `
            ${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 18px; cursor: pointer;">&times;</button>
        `;

        alertContainer.appendChild(alert);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    }

    // Storage methods
    saveUploadedFiles() {
        localStorage.setItem('va_chatbot_uploaded_files', JSON.stringify(this.uploadedFiles));
    }

    loadUploadedFiles() {
        const stored = localStorage.getItem('va_chatbot_uploaded_files');
        return stored ? JSON.parse(stored) : [];
    }

    saveKnowledgeBase() {
        localStorage.setItem('va_chatbot_knowledge_base', JSON.stringify(this.knowledgeBase));
    }

    loadKnowledgeBase() {
        const stored = localStorage.getItem('va_chatbot_knowledge_base');
        return stored ? JSON.parse(stored) : { documents: [], qaPairs: [] };
    }

    saveCustomQA() {
        localStorage.setItem('va_chatbot_custom_qa', JSON.stringify(this.customQAPairs));
    }

    loadCustomQA() {
        const stored = localStorage.getItem('va_chatbot_custom_qa');
        return stored ? JSON.parse(stored) : [];
    }

    saveTrainingData() {
        localStorage.setItem('va_chatbot_training_data', JSON.stringify(this.trainingData));
    }

    loadTrainingData() {
        const stored = localStorage.getItem('va_chatbot_training_data');
        return stored ? JSON.parse(stored) : { version: '1.0', lastUpdated: null };
    }

    loadInitialData() {
        this.uploadedFiles = this.loadUploadedFiles();
        this.refreshFileList();
        this.refreshQAList();
    }
}

// Initialize the training system when page loads
let trainingBot;
document.addEventListener('DOMContentLoaded', () => {
    trainingBot = new VAChatbotTraining();
});