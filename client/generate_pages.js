const fs = require('fs');
const path = require('path');
const projectDir = 'c:/Users/dell/.gemini/antigravity/scratch/vmax/client';

const files = {
  'src/components/hero/HeroSection.tsx': `
import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <div className="relative h-screen flex flex-col items-center justify-center px-4 overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void/50 to-void pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10 max-w-4xl"
      >
        <h1 className="text-5xl md:text-7xl font-heading font-bold text-starlight text-glow mb-6 leading-tight">
          Ирээдүйн <span className="text-transparent bg-clip-text bg-gradient-to-r from-plasma to-aurora">Үл Хөдлөх</span><br/>Хөрөнгийн Зах Зээл
        </h1>
        <p className="text-lg md:text-xl text-nebula-text mb-10 max-w-2xl mx-auto">
          Хамгийн орчин үеийн, хурдан, найдвартай платформ. Таны мөрөөдлийн гэр эндээс эхэлнэ.
        </p>
      </motion.div>
    </div>
  );
};
export default HeroSection;
`,
  'src/pages/Home.tsx': `
import React from 'react';
import HeroSection from '@/components/hero/HeroSection';

const Home = () => {
  return (
    <div className="w-full">
      <HeroSection />
      {/* Search Bar and Listings Grid will go here */}
    </div>
  );
};
export default Home;
`,
  'src/pages/Login.tsx': `
import React from 'react';
import { motion } from 'framer-motion';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-8 rounded-2xl border-glow">
        <h2 className="text-3xl font-heading font-bold text-center mb-8 text-glow">Нэвтрэх</h2>
        <div className="space-y-4">
          <input type="email" placeholder="Имэйл хаяг" className="w-full bg-void/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all" />
          <input type="password" placeholder="Нууц үг" className="w-full bg-void/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all" />
          <button className="w-full bg-gradient-to-r from-plasma to-nova text-white font-medium py-3 rounded-lg hover:shadow-lg hover:shadow-plasma/30 transition-all duration-300">
            Нэвтрэх
          </button>
        </div>
      </motion.div>
    </div>
  );
};
export default Login;
`,
  'src/pages/Register.tsx': `
import React from 'react';
import { motion } from 'framer-motion';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-8 rounded-2xl border-glow">
        <h2 className="text-3xl font-heading font-bold text-center mb-8 text-glow">Бүртгүүлэх</h2>
        <div className="space-y-4">
          <input type="text" placeholder="Нэр" className="w-full bg-void/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all" />
          <input type="email" placeholder="Имэйл хаяг" className="w-full bg-void/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all" />
          <input type="password" placeholder="Нууц үг" className="w-full bg-void/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-plasma focus:ring-1 focus:ring-plasma transition-all" />
          <button className="w-full bg-gradient-to-r from-plasma to-nova text-white font-medium py-3 rounded-lg hover:shadow-lg hover:shadow-plasma/30 transition-all duration-300">
            Бүртгүүлэх
          </button>
        </div>
      </motion.div>
    </div>
  );
};
export default Register;
`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(projectDir, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
}
console.log('Pages generated.');
