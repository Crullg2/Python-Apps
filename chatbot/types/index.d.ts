// TypeScript Definitions for VA Healthcare AI Chatbot
// Version: 1.0.0

export interface ChatbotMessage {
    id: string;
    type: 'user' | 'bot';
    content: string;
    timestamp: Date;
    category?: string;
}

export interface TrainingData {
    qaPairs: QAPair[];
    lastUpdated: Date;
    version: string;
}

export interface QAPair {
    id?: string;
    question: string;
    answer: string;
    category: string;
    keywords?: string[];
    alternatives?: string[];
    confidence?: number;
    timestamp?: number;
}

export interface ContextMemory {
    currentTopic: string | null;
    lastQuestionCategory: string | null;
    conversationHistory: ChatbotMessage[];
    contextMemory: Map<string, any>;
}

export interface VoiceConfig {
    enabled: boolean;
    language: string;
    voice?: SpeechSynthesisVoice;
    rate: number;
    pitch: number;
    volume: number;
}

export interface AnalyticsData {
    sessionId: string;
    startTime: Date;
    questionCount: number;
    topicInteractions: Record<string, number>;
    voiceUsage: number;
    averageResponseTime: number[];
    userSatisfaction: number[];
}

export declare class VAChatbot {
    // Core properties
    chatMessages: HTMLElement;
    chatInput: HTMLInputElement;
    sendButton: HTMLButtonElement;
    voiceButton: HTMLButtonElement;
    speakerButton: HTMLButtonElement;
    typingIndicator: HTMLElement;
    errorMessage: HTMLElement;
    voiceStatus: HTMLElement;

    // Voice and TTS properties
    isRecording: boolean;
    recognition: SpeechRecognition | null;
    speechSynthesis: SpeechSynthesis;
    isTTSEnabled: boolean;
    currentVoice: SpeechSynthesisVoice | null;

    // Context properties
    conversationHistory: ChatbotMessage[];
    currentTopic: string | null;
    lastQuestionCategory: string | null;
    contextMemory: Map<string, any>;
    followUpKeywords: string[];

    // Analytics properties
    analytics: AnalyticsData;

    /**
     * Initialize the VA Healthcare AI Chatbot
     */
    constructor();

    /**
     * Initialize core functionality
     */
    init(): void;

    /**
     * Setup training system integration
     */
    setupTrainingIntegration(): void;

    /**
     * Load training data from localStorage
     */
    loadTrainingData(): Promise<void>;

    /**
     * Send a message to the chatbot
     * @param message - The message text (optional, will use input value if not provided)
     */
    sendMessage(message?: string): Promise<void>;

    /**
     * Generate a response based on the user's question
     * @param question - The user's question
     * @returns Promise resolving to the bot's response
     */
    generateResponse(question: string): Promise<string>;

    /**
     * Check if a question is a follow-up question
     * @param question - The question to check
     * @returns True if it's a follow-up question
     */
    isFollowUpQuestion(question: string): boolean;

    /**
     * Generate a contextual response for follow-up questions
     * @param question - The follow-up question
     * @returns Contextual response string
     */
    generateContextualResponse(question: string): string;

    /**
     * Update conversation context
     * @param topic - The current topic
     * @param category - The question category
     */
    updateContext(topic: string, category: string): void;

    /**
     * Simplify language by explaining medical terms
     * @param text - The text to simplify
     * @returns Simplified text with explanations
     */
    simplifyLanguage(text: string): string;

    /**
     * Initialize voice recognition and text-to-speech
     */
    initializeVoice(): void;

    /**
     * Start voice recording
     */
    startVoiceRecording(): void;

    /**
     * Stop voice recording
     */
    stopVoiceRecording(): void;

    /**
     * Speak text using text-to-speech
     * @param text - The text to speak
     */
    speak(text: string): void;

    /**
     * Load the knowledge base
     */
    loadKnowledgeBase(): Promise<void>;

    /**
     * Initialize analytics tracking
     */
    initializeAnalytics(): void;

    /**
     * Clear the conversation
     */
    clearConversation(): void;

    /**
     * Add a message to the chat interface
     * @param message - The message to add
     * @param type - The message type ('user' or 'bot')
     */
    addMessage(message: string, type: 'user' | 'bot'): void;

    /**
     * Show typing indicator
     */
    showTypingIndicator(): void;

    /**
     * Hide typing indicator
     */
    hideTypingIndicator(): void;

    /**
     * Show error message
     * @param message - The error message to display
     */
    showError(message: string): void;

    /**
     * Generate a unique session ID
     * @returns Unique session identifier
     */
    generateSessionId(): string;
}

export declare class VAChatbotTraining {
    uploadedFiles: any[];
    knowledgeBase: any;
    customQAPairs: QAPair[];
    trainingData: TrainingData;
    processingQueue: any[];
    isTraining: boolean;

    /**
     * Initialize the training system
     */
    constructor();

    /**
     * Initialize the training interface
     */
    init(): void;

    /**
     * Add files to the training system
     * @param files - FileList of files to add
     */
    addFiles(files: FileList): void;

    /**
     * Process a specific file
     * @param fileId - The ID of the file to process
     */
    processFile(fileId: string): void;

    /**
     * Process all uploaded files
     */
    processAllFiles(): void;

    /**
     * Add a Q&A pair manually
     */
    addQAPair(): void;

    /**
     * Sync training data with main chatbot
     */
    syncWithMainChatbot(): void;

    /**
     * Export knowledge base
     */
    exportKnowledgeBase(): void;

    /**
     * Import knowledge base
     */
    importKnowledgeBase(): void;

    /**
     * Simplify language for training content
     * @param text - Text to simplify
     * @returns Simplified text
     */
    simplifyLanguage(text: string): string;
}

// Global declarations
declare global {
    interface Window {
        VAChatbot: typeof VAChatbot;
        VAChatbotTraining: typeof VAChatbotTraining;
    }
}

export default VAChatbot;
