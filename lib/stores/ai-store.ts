import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: {
    agentType?: string
    context?: string
    attachments?: string[]
  }
}

interface AIAgent {
  id: string
  name: string
  type: 'engineering' | 'procurement' | 'regulatory' | 'sustainability' | 'project-brain'
  status: 'idle' | 'thinking' | 'working' | 'error'
  capabilities: string[]
  lastUsed?: string
}

interface ProposalGeneration {
  id: string
  projectId: string
  type: 'Conceptual' | 'Technical' | 'Detailed'
  status: 'preparing' | 'generating' | 'completed' | 'error'
  progress: number
  startedAt: string
  completedAt?: string
  result?: any
  error?: string
}

interface AIState {
  // Chat state
  messages: ChatMessage[]
  currentContext: string
  isTyping: boolean

  // AI Agents
  agents: AIAgent[]
  activeAgent: string | null

  // Proposal generation
  proposalGenerations: ProposalGeneration[]
  activeGeneration: string | null

  // AI capabilities
  capabilities: {
    chatEnabled: boolean
    proposalGeneration: boolean
    fileAnalysis: boolean
    costOptimization: boolean
    regulatoryCheck: boolean
  }

  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearMessages: () => void
  setTyping: (typing: boolean) => void
  setContext: (context: string) => void

  // Agent actions
  setActiveAgent: (agentId: string | null) => void
  updateAgentStatus: (agentId: string, status: AIAgent['status']) => void

  // Proposal generation actions
  startProposalGeneration: (projectId: string, type: ProposalGeneration['type']) => string
  updateGenerationProgress: (id: string, progress: number) => void
  completeGeneration: (id: string, result: any) => void
  failGeneration: (id: string, error: string) => void

  // Utility actions
  clearHistory: () => void
}

export const useAIStore = create<AIState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      messages: [],
      currentContext: '',
      isTyping: false,

      agents: [
        {
          id: 'engineering-agent',
          name: 'Asistente de Ingeniería H2O',
          type: 'project-brain',
          status: 'idle',
          capabilities: [
            'Análisis de parámetros de agua',
            'Selección de tecnología',
            'Diseño conceptual',
            'Optimización de procesos',
            'Generación de propuestas',
            'Cálculos preliminares',
            'Verificación de normativas básicas',
            'Recomendaciones técnicas'
          ]
        }
      ],

      activeAgent: null,
      proposalGenerations: [],
      activeGeneration: null,

      capabilities: {
        chatEnabled: true,
        proposalGeneration: true,
        fileAnalysis: true,
        costOptimization: true,
        regulatoryCheck: true
      },

      // Actions
      addMessage: (message) => {
        set(state => {
          const newMessage: ChatMessage = {
            ...message,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
          }
          state.messages.push(newMessage)
        })
      },

      clearMessages: () => {
        set(state => {
          state.messages = []
        })
      },

      setTyping: (typing: boolean) => {
        set(state => {
          state.isTyping = typing
        })
      },

      setContext: (context: string) => {
        set(state => {
          state.currentContext = context
        })
      },

      setActiveAgent: (agentId: string | null) => {
        set(state => {
          state.activeAgent = agentId
          if (agentId) {
            const agent = state.agents.find(a => a.id === agentId)
            if (agent) {
              agent.lastUsed = new Date().toISOString()
            }
          }
        })
      },

      updateAgentStatus: (agentId: string, status: AIAgent['status']) => {
        set(state => {
          const agent = state.agents.find(a => a.id === agentId)
          if (agent) {
            agent.status = status
          }
        })
      },

      startProposalGeneration: (projectId: string, type: ProposalGeneration['type']) => {
        const id = crypto.randomUUID()

        set(state => {
          const generation: ProposalGeneration = {
            id,
            projectId,
            type,
            status: 'preparing',
            progress: 0,
            startedAt: new Date().toISOString()
          }
          state.proposalGenerations.push(generation)
          state.activeGeneration = id
        })

        return id
      },

      updateGenerationProgress: (id: string, progress: number) => {
        set(state => {
          const generation = state.proposalGenerations.find(g => g.id === id)
          if (generation) {
            generation.progress = progress
            if (progress > 0 && generation.status === 'preparing') {
              generation.status = 'generating'
            }
          }
        })
      },

      completeGeneration: (id: string, result: any) => {
        set(state => {
          const generation = state.proposalGenerations.find(g => g.id === id)
          if (generation) {
            generation.status = 'completed'
            generation.progress = 100
            generation.completedAt = new Date().toISOString()
            generation.result = result
          }
          if (state.activeGeneration === id) {
            state.activeGeneration = null
          }
        })
      },

      failGeneration: (id: string, error: string) => {
        set(state => {
          const generation = state.proposalGenerations.find(g => g.id === id)
          if (generation) {
            generation.status = 'error'
            generation.error = error
            generation.completedAt = new Date().toISOString()
          }
          if (state.activeGeneration === id) {
            state.activeGeneration = null
          }
        })
      },

      clearHistory: () => {
        set(state => {
          state.messages = []
          state.proposalGenerations = []
          state.activeGeneration = null
          state.currentContext = ''
        })
      }
    })),
    {
      name: 'h2o-ai-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        messages: state.messages.slice(-100), // Keep last 100 messages
        agents: state.agents,
        capabilities: state.capabilities,
        // Don't persist active states or generations
      })
    }
  )
)

// Selectors
export const useAIMessages = () => useAIStore(state => state.messages)
export const useAITyping = () => useAIStore(state => state.isTyping)
export const useAIContext = () => useAIStore(state => state.currentContext)
export const useAIAgents = () => useAIStore(state => state.agents)
export const useActiveAgent = () => useAIStore(state => state.activeAgent)
export const useProposalGenerations = () => useAIStore(state => state.proposalGenerations)
export const useActiveGeneration = () => useAIStore(state => state.activeGeneration)
export const useAICapabilities = () => useAIStore(state => state.capabilities)

// Actions
export const useAIActions = () => useAIStore(state => ({
  addMessage: state.addMessage,
  clearMessages: state.clearMessages,
  setTyping: state.setTyping,
  setContext: state.setContext,
  setActiveAgent: state.setActiveAgent,
  updateAgentStatus: state.updateAgentStatus,
  startProposalGeneration: state.startProposalGeneration,
  updateGenerationProgress: state.updateGenerationProgress,
  completeGeneration: state.completeGeneration,
  failGeneration: state.failGeneration,
  clearHistory: state.clearHistory
}))