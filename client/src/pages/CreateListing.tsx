import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CreateListing = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8 border-glow">
        <h2 className="text-3xl font-heading font-bold text-glow mb-8 text-center">Шинэ зар оруулах</h2>
        
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-void -z-10 -translate-y-1/2">
            <div className="h-full bg-plasma transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${step >= i ? 'bg-plasma text-white' : 'bg-void text-nebula-text'}`}>
              {i}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl text-white font-bold mb-4">Ерөнхий мэдээлэл</h3>
            <select className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-plasma">
              <option value="">Төрөл сонгох</option>
              <option value="sale">Зарах</option>
              <option value="rent">Түрээслэх</option>
            </select>
            <select className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-plasma">
              <option value="">Ангилал сонгох</option>
              <option value="apartment">Орон сууц</option>
              <option value="house">Хаус</option>
              <option value="land">Газар</option>
            </select>
            <input type="text" placeholder="Гарчиг" className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-plasma" />
            <button onClick={() => setStep(2)} className="w-full bg-gradient-to-r from-plasma to-nova text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all mt-4">Дараах</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl text-white font-bold mb-4">Дэлгэрэнгүй</h3>
            <input type="number" placeholder="Үнэ (₮)" className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-plasma" />
            <input type="number" placeholder="Талбайн хэмжээ (м.кв)" className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-plasma" />
            <textarea placeholder="Тайлбар" rows={4} className="w-full bg-void/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-plasma resize-none"></textarea>
            <div className="flex space-x-4">
              <button onClick={() => setStep(1)} className="w-1/2 bg-void/50 border border-white/10 text-white font-medium py-3 rounded-xl hover:bg-void transition-all">Буцах</button>
              <button onClick={() => setStep(3)} className="w-1/2 bg-gradient-to-r from-plasma to-nova text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all">Дараах</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl text-white font-bold mb-4">Зураг оруулах</h3>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-plasma transition-colors cursor-pointer">
              <div className="text-plasma mb-2">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-sm text-nebula-text">Зураг сонгох эсвэл чирж оруулна уу</div>
            </div>
            <div className="flex space-x-4 mt-8">
              <button onClick={() => setStep(2)} className="w-1/2 bg-void/50 border border-white/10 text-white font-medium py-3 rounded-xl hover:bg-void transition-all">Буцах</button>
              <button className="w-1/2 bg-gradient-to-r from-plasma to-nova text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all">Нийтлэх</button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};
export default CreateListing;
