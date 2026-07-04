import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';

import { ThemeProvider } from '@/providers/ThemeProvider';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { router } from '@/routes';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="enjay-ui-theme">
      <ReactQueryProvider>
        <RouterProvider router={router} />
        {/* Global Toast Notifications */}
        <Toaster position="top-right" richColors closeButton />
      </ReactQueryProvider>
    </ThemeProvider>
  );
}

export default App;