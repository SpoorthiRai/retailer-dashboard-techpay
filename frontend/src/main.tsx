// ============================================================
// MAIN ENTRY POINT
// This is the first file that runs when the app starts.
// QueryClientProvider wraps the whole app so every component
// can use React Query hooks (useMetrics, useInventory etc.)
// ============================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

// QueryClient is the brain of React Query —
// it manages all the caching and fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,           // retry failed requests once
      refetchOnWindowFocus: false, // don't refetch when switching tabs
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)