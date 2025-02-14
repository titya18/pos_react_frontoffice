import React from "react";
import { createRoot } from 'react-dom/client';
    
import App from "./App";
import { QueryClient, QueryClientProvider } from 'react-query';

const container = document.getElementById('root');
const root = createRoot(container!);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 0,
        }
    }
});

root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>
);