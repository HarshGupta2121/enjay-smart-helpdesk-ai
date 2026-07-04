import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from 'react-error-boundary';

import { ThemeProvider } from '@/providers/ThemeProvider';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { router } from '@/routes';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md w-full bg-card border border-border p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-bold text-destructive mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-4 overflow-auto max-h-32 bg-muted p-2 rounded text-left">
          {error.message}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider defaultTheme="system" storageKey="enjay-ui-theme">
        <ReactQueryProvider>
          <RouterProvider router={router} />
          {/* Global Toast Notifications */}
          <Toaster position="top-right" richColors closeButton />
        </ReactQueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;