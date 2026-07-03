import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              Enjay Smart HelpDesk AI
            </h1>
            <p className="text-muted-foreground">
              Production-ready SaaS foundation is set up successfully.
            </p>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;