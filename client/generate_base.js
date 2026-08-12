const fs = require('fs');
const path = require('path');

const projectDir = 'c:/Users/dell/.gemini/antigravity/scratch/vmax/client';

const files = {
  'vite.config.ts': `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } } }
});
`,
  'tsconfig.app.json': `
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
`,
  'index.html': `
<!doctype html>
<html lang="mn">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vmax.mn | Монголын Үл Хөдлөх Хөрөнгийн Зах Зээл</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js"></script>
  </head>
  <body class="bg-[#0a0a0f] text-slate-200 antialiased overflow-x-hidden">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    <script>
      window.fbAsyncInit = function() {
        if (window.FB) {
          window.FB.init({
            appId      : 'YOUR_FACEBOOK_APP_ID',
            cookie     : true,
            xfbml      : true,
            version    : 'v19.0'
          });
        }
      };
    </script>
  </body>
</html>
`,
  'src/index.css': `
@import "tailwindcss";

@theme {
  --font-sans: "Inter", sans-serif;
  --font-heading: "Space Grotesk", sans-serif;

  --color-void: #0a0a0f;
  --color-nebula: #12121f;
  --color-cosmic: #1a1a2e;
  
  --color-plasma: #6c5ce7;
  --color-nova: #a855f7;
  --color-aurora: #22d3ee;
  
  --color-starlight: #e2e8f0;
  --color-nebula-text: #94a3b8;

  --animate-float: float 6s ease-in-out infinite;
  --animate-pulse-slow: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@layer utilities {
  .glass-card {
    @apply bg-nebula/60 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)];
  }
  .glass-card-hover {
    @apply hover:bg-nebula/80 hover:border-plasma/50 transition-all duration-300;
  }
  .text-glow { text-shadow: 0 0 20px rgba(168, 85, 247, 0.5); }
  .text-glow-aurora { text-shadow: 0 0 20px rgba(34, 211, 238, 0.5); }
  .border-glow { box-shadow: 0 0 15px rgba(108, 92, 231, 0.3), inset 0 0 20px rgba(168, 85, 247, 0.1); }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

.starfield {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: -1; background-color: var(--color-void); overflow: hidden;
}
.star {
  position: absolute; background: white; border-radius: 50%;
  animation: twinkle var(--duration, 4s) infinite ease-in-out alternate;
}
@keyframes twinkle {
  0% { opacity: 0.2; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 10px white; }
}

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #0a0a0f; }
::-webkit-scrollbar-thumb { background: #2d2d44; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #6c5ce7; }
`,
  'src/types/index.ts': `
export interface User { id: string; email: string; name: string; phone?: string; avatar?: string; }
export interface Listing {
  id: string; title: string; description: string; type: 'sale' | 'rent';
  category: 'apartment' | 'house' | 'land' | 'commercial';
  price: number; location: string; district: string; areaSqm: number;
  attributes: Record<string, any>; images: string[]; status: 'active' | 'expired' | 'closed';
  userId: string; createdAt: string; updatedAt: string;
}
export interface FilterState {
  type?: string; category?: string; location?: string; priceMin?: number;
  priceMax?: number; areaMin?: number; areaMax?: number; page?: number; limit?: number;
}
`,
  'src/services/api.ts': `
import axios from 'axios';
const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vmax_token');
  if (token && config.headers) { config.headers.Authorization = \`Bearer \${token}\`; }
  return config;
});
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  googleLogin: (token: string) => api.post('/auth/google', { token }),
  facebookLogin: (accessToken: string) => api.post('/auth/facebook', { accessToken }),
  getProfile: () => api.get('/auth/profile'),
};
export const listingsAPI = {
  getAll: (params: any) => api.get('/listings', { params }),
  getOne: (id: string) => api.get(\`/listings/\${id}\`),
  getMy: () => api.get('/listings/my'),
  create: (data: FormData) => api.post('/listings', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  close: (id: string) => api.patch(\`/listings/\${id}/close\`),
};
export default api;
`,
  'src/store/useAuthStore.ts': `
import { create } from 'zustand';
import { User } from '@/types';
interface AuthState { user: User | null; token: string | null; isAuthenticated: boolean; login: (user: User, token: string) => void; logout: () => void; setUser: (user: User) => void; }
export const useAuthStore = create<AuthState>((set) => ({
  user: null, token: localStorage.getItem('vmax_token') || null, isAuthenticated: !!localStorage.getItem('vmax_token'),
  login: (user, token) => { localStorage.setItem('vmax_token', token); set({ user, token, isAuthenticated: true }); },
  logout: () => { localStorage.removeItem('vmax_token'); set({ user: null, token: null, isAuthenticated: false }); },
  setUser: (user) => set({ user }),
}));
`,
  'src/hooks/useVoiceSearch.ts': `
import { useState, useCallback } from 'react';
export const useVoiceSearch = (onResult: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setError('Voice search is not supported in this browser.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'mn-MN'; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onstart = () => { setIsListening(true); setError(null); };
    recognition.onresult = (event: any) => { onResult(event.results[0][0].transcript); };
    recognition.onerror = (event: any) => { setError(event.error); setIsListening(false); };
    recognition.onend = () => { setIsListening(false); };
    recognition.start();
  }, [onResult]);
  return { isListening, error, startListening };
};
`,
  'src/components/layout/Starfield.tsx': `
import React, { useEffect, useState } from 'react';
const Starfield = () => {
  const [stars, setStars] = useState<{ id: number; left: string; top: string; size: string; duration: string }[]>([]);
  useEffect(() => {
    setStars(Array.from({ length: 150 }).map((_, i) => ({
      id: i, left: \`\${Math.random() * 100}%\`, top: \`\${Math.random() * 100}%\`,
      size: \`\${Math.random() * 3 + 1}px\`, duration: \`\${Math.random() * 5 + 2}s\`,
    })));
  }, []);
  return (
    <div className="starfield">
      {stars.map((star) => (
        <div key={star.id} className="star"
          style={{ left: star.left, top: star.top, width: star.size, height: star.size, '--duration': star.duration } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
export default Starfield;
`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(projectDir, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
}
console.log('Base files generated.');
