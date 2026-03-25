'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Check, X, AlertCircle } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-up border ${
              toast.type === 'success' 
                ? 'bg-green-500/90 border-green-400 text-white' 
                : toast.type === 'error'
                ? 'bg-red-500/90 border-red-400 text-white'
                : 'bg-[var(--pf-surface)] border-[var(--pf-border)] text-[var(--pf-text)]'
            }`}
          >
            {toast.type === 'success' && <Check size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            <span className="font-medium">{toast.message}</span>
            <button 
              onClick={() => dismissToast(toast.id)}
              className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
