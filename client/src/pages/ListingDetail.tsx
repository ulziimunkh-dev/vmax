import React from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Maximize, BedDouble, Bath, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const ListingDetail = () => {
  const { id } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl overflow-hidden h-[400px] flex items-center justify-center bg-gradient-to-br from-void to-cosmic">
            <span className="text-plasma opacity-50 font-bold text-3xl">Зураг {id}</span>
          </div>
          
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="inline-block px-3 py-1 bg-plasma/20 text-plasma rounded-full text-sm font-semibold mb-3 border border-plasma/30">Зарах</div>
                <h1 className="text-3xl font-heading font-bold text-white mb-2">Тансаг зэрэглэлийн хаус</h1>
                <div className="flex items-center text-nebula-text">
                  <MapPin size={18} className="mr-2 text-plasma" /> Улаанбаатар, Хан-Уул дүүрэг
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-heading font-bold text-aurora text-glow-aurora">850,000,000 ₮</div>
                <div className="text-nebula-text mt-1">3,400,000 ₮ / м.кв</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/10 my-6">
              <div className="flex flex-col items-center p-4 bg-void/50 rounded-xl border border-white/5">
                <Maximize size={24} className="mb-2 text-plasma" />
                <span className="text-lg font-bold text-white">250 м.кв</span>
                <span className="text-xs text-nebula-text">Талбай</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-void/50 rounded-xl border border-white/5">
                <BedDouble size={24} className="mb-2 text-plasma" />
                <span className="text-lg font-bold text-white">5</span>
                <span className="text-xs text-nebula-text">Унтлагын өрөө</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-void/50 rounded-xl border border-white/5">
                <Bath size={24} className="mb-2 text-plasma" />
                <span className="text-lg font-bold text-white">3</span>
                <span className="text-xs text-nebula-text">Ариун цэврийн өрөө</span>
              </div>
            </div>

            <h3 className="text-xl font-heading font-bold text-white mb-3">Дэлгэрэнгүй мэдээлэл</h3>
            <p className="text-nebula-text leading-relaxed">
              Хан-Уул дүүрэгт байрлалтай, цэвэр агаарт, бүрэн цутгамал, маш дулаахан 5 өрөө тансаг зэрэглэлийн хаус зарна. Гадна тохижилт бүрэн хийгдсэн, 2 машины дулаан зогсоолтой.
            </p>
          </div>
        </div>

        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl sticky top-24">
            <h3 className="text-xl font-heading font-bold text-white mb-6">Холбоо барих</h3>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-plasma to-nova p-1">
                <div className="w-full h-full rounded-full bg-cosmic flex items-center justify-center">
                  <span className="text-xl font-bold text-white">Б</span>
                </div>
              </div>
              <div>
                <div className="font-bold text-lg text-white">Батболд</div>
                <div className="text-sm text-nebula-text">Зуучлагч</div>
              </div>
            </div>

            <button className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-plasma to-nova text-white font-medium py-3 rounded-xl hover:shadow-lg hover:shadow-plasma/30 transition-all mb-3">
              <Phone size={18} /> <span>Залгах</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 bg-void/50 border border-white/10 text-white font-medium py-3 rounded-xl hover:bg-void transition-all">
              <Mail size={18} /> <span>Имэйл илгээх</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
export default ListingDetail;
