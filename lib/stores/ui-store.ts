import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface UIState {
  // Theme and UI preferences
  sidebarOpen: boolean
  darkMode: boolean

  // Dashboard filters and search
  dashboardFilter: 'all' | 'active' | 'completed' | 'onhold'
  dashboardSearch: string

  // Project view preferences
  projectActiveTab: string

  // AI Assistant state
  aiChatOpen: boolean
  aiContext: string

  // Notifications
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    timestamp: string
    read: boolean
  }>

  // Actions
  setSidebarOpen: (open: boolean) => void
  setDarkMode: (dark: boolean) => void
  setDashboardFilter: (filter: UIState['dashboardFilter']) => void
  setDashboardSearch: (search: string) => void
  setProjectActiveTab: (tab: string) => void
  setAiChatOpen: (open: boolean) => void
  setAiContext: (context: string) => void
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      darkMode: false,
      dashboardFilter: 'all',
      dashboardSearch: '',
      projectActiveTab: 'overview',
      aiChatOpen: false,
      aiContext: '',
      notifications: [],

      // Actions
      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open })
      },

      setDarkMode: (dark: boolean) => {
        set({ darkMode: dark })
      },

      setDashboardFilter: (filter: UIState['dashboardFilter']) => {
        set({ dashboardFilter: filter })
      },

      setDashboardSearch: (search: string) => {
        set({ dashboardSearch: search })
      },

      setProjectActiveTab: (tab: string) => {
        set({ projectActiveTab: tab })
      },

      setAiChatOpen: (open: boolean) => {
        set({ aiChatOpen: open })
      },

      setAiContext: (context: string) => {
        set({ aiContext: context })
      },

      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          read: false
        }

        set(state => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50) // Keep max 50 notifications
        }))
      },

      markNotificationRead: (id: string) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          )
        }))
      },

      clearNotifications: () => {
        set({ notifications: [] })
      }
    }),
    {
      name: 'h2o-ui-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        darkMode: state.darkMode,
        dashboardFilter: state.dashboardFilter,
        // Don't persist search, active tab, or notifications
      })
    }
  )
)

// Selectors
export const useSidebarOpen = () => useUIStore(state => state.sidebarOpen)
export const useDarkMode = () => useUIStore(state => state.darkMode)
export const useDashboardFilter = () => useUIStore(state => state.dashboardFilter)
export const useDashboardSearch = () => useUIStore(state => state.dashboardSearch)
export const useProjectActiveTab = () => useUIStore(state => state.projectActiveTab)
export const useAiChatOpen = () => useUIStore(state => state.aiChatOpen)
export const useAiContext = () => useUIStore(state => state.aiContext)
export const useNotifications = () => useUIStore(state => state.notifications)

// Actions
export const useUIActions = () => useUIStore(state => ({
  setSidebarOpen: state.setSidebarOpen,
  setDarkMode: state.setDarkMode,
  setDashboardFilter: state.setDashboardFilter,
  setDashboardSearch: state.setDashboardSearch,
  setProjectActiveTab: state.setProjectActiveTab,
  setAiChatOpen: state.setAiChatOpen,
  setAiContext: state.setAiContext,
  addNotification: state.addNotification,
  markNotificationRead: state.markNotificationRead,
  clearNotifications: state.clearNotifications
}))