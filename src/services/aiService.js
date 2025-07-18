import OpenAI from 'openai'
import debugLogger from '../utils/debugLogger.js'

// API Configuration (inlined to avoid import issues)
const API_CONFIG = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  IS_CONFIGURED: !!import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_OPENAI_API_KEY !== 'sk-YOUR-API-KEY-HERE'
}

// Configuration
const AI_SERVICE_CONFIG = {
  MODEL: 'gpt-4o',
  MAX_TOKENS: 200,
  TEMPERATURE: 0.5,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 10,
  DEBOUNCE_DELAY: 500
}

class AIService {
  constructor() {
    this.openai = null
    this.isInitialized = false
    this.requestCount = 0
    this.requestTimestamps = []
    this.lastError = null
  }

  // Initialize with embedded API key
  initialize() {
    try {
      // Check if API key is configured
      if (!API_CONFIG.IS_CONFIGURED || !API_CONFIG.OPENAI_API_KEY || API_CONFIG.OPENAI_API_KEY === 'sk-YOUR-API-KEY-HERE') {
        this.lastError = 'API key not configured. Please update src/config/apiConfig.js'
        return { success: false, error: 'API key not configured' }
      }

      // Initialize OpenAI client with embedded key
      this.openai = new OpenAI({
        apiKey: API_CONFIG.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // Required for browser usage
      })

      this.isInitialized = true
      this.lastError = null

      return { success: true }
    } catch (error) {
      console.error('Failed to initialize AI service:', error)
      this.lastError = error.message
      return { success: false, error: error.message }
    }
  }

  // Check if we're within rate limits
  checkRateLimit() {
    const now = Date.now()
    
    // Remove timestamps outside the window
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp < AI_SERVICE_CONFIG.RATE_LIMIT_WINDOW
    )

    // Check if we've exceeded the limit
    if (this.requestTimestamps.length >= AI_SERVICE_CONFIG.MAX_REQUESTS_PER_WINDOW) {
      const oldestTimestamp = this.requestTimestamps[0]
      const waitTime = AI_SERVICE_CONFIG.RATE_LIMIT_WINDOW - (now - oldestTimestamp)
      return { allowed: false, waitTime }
    }

    return { allowed: true }
  }

  // Generate contextual placeholder for empty nodes
  async generatePlaceholder(nodeType, connectedNodes) {
    if (!this.isInitialized) {
      return { success: false, error: 'AI service not initialized' }
    }

    // Check rate limit
    const rateCheck = this.checkRateLimit()
    if (!rateCheck.allowed) {
      return { success: false, placeholder: '' }
    }

    try {
      // Prepare context from connected nodes
      const context = connectedNodes
        .filter(node => node.data?.content?.trim())
        .map(node => ({
          type: node.type,
          content: node.data.content
        }))

      if (context.length === 0) {
        return { success: true, placeholder: '' }
      }

      // Make API call
      this.requestTimestamps.push(Date.now())
      
      const completion = await this.openai.chat.completions.create({
        model: AI_SERVICE_CONFIG.MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You generate helpful next-step placeholders. NEVER repeat, just nudge forward. Be specific and actionable.' 
          },
          { 
            role: 'user', 
            content: `Generate a placeholder for a ${nodeType} node connected to:\n${JSON.stringify(context, null, 2)}` 
          }
        ],
        temperature: 0.5,
        max_tokens: AI_SERVICE_CONFIG.MAX_TOKENS
      })

      const placeholder = completion.choices[0]?.message?.content || ''
      
      this.lastError = null
      
      return { success: true, placeholder }
    } catch (error) {
      console.error('AI placeholder error:', error)
      this.lastError = error.message
      
      // Log error
      debugLogger.logError('generatePlaceholder', error, { nodeType, connectedNodesCount: connectedNodes.length })
      
      // Handle specific OpenAI errors
      if (error.status === 401) {
        return { success: false, error: 'Invalid API key. Please check your settings.' }
      } else if (error.status === 429) {
        return { success: false, error: 'OpenAI rate limit exceeded. Please try again later.' }
      } else if (error.status === 500) {
        return { success: false, error: 'OpenAI service error. Please try again.' }
      }
      
      return { success: false, error: error.message || 'Failed to generate placeholder' }
    }
  }

  // Check if API key is configured
  hasApiKey() {
    return API_CONFIG.IS_CONFIGURED && API_CONFIG.OPENAI_API_KEY && API_CONFIG.OPENAI_API_KEY !== 'sk-YOUR-API-KEY-HERE'
  }

  // Get last error
  getLastError() {
    return this.lastError
  }
}

export default new AIService() 