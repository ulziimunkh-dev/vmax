import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ShieldCheck, Zap, Users, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-plasma/20 border border-plasma/30 text-plasma text-xs font-bold uppercase tracking-wider mb-4">
            <Building2 size={14} />
            <span>Vmax.mn Платформ</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-black text-starlight mb-6 leading-tight">
            Монголын ирээдүйн үл хөдлөх хөрөнгийн ухаалаг платформ
          </h1>
          <p className="text-lg text-nebula-text leading-relaxed">
            Vmax.mn нь худалдан авагч, түрээслэгч болон үл хөдлөх хөрөнгийн агентлагуудыг хамгийн хурдан, найдвартай технологиор холбох зорилготой шинэлэг платформ юм.
          </p>
        </motion.div>
      </div>

      {/* Core Competitive Advantages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="glass-card p-8 rounded-2xl border border-white/10 hover:border-plasma/40 transition-all group">
          <div className="p-3 bg-plasma/20 text-plasma rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="text-xl font-bold text-starlight mb-3">Байнга шинэчлэгдэх бодит зарууд</h3>
          <p className="text-nebula-text text-sm leading-relaxed">
            Энд зарагдсан болон түрээслэгдсэн хуучин зар харагдахгүй. Та идэвхигүй заранд цагаа үрэх шаардлагагүйгээр зөвхөн бодит, бэлэн байгаа үл хөдлөх хөрөнгүүдийг харах болно.
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl border border-white/10 hover:border-plasma/40 transition-all group">
          <div className="p-3 bg-aurora/20 text-aurora rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
            <Zap size={28} />
          </div>
          <h3 className="text-xl font-bold text-starlight mb-3">Аянга мэт хурдан хайлт</h3>
          <p className="text-nebula-text text-sm leading-relaxed">
            Системийн өндөр хурдны индексжүүлэлт болон ухаалаг шүүлтүүрийн тусламжтайгаар хайлтын илэрц агшин зуурт гарч, таны цагийг дээд цэгт нь хэмнэнэ.
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl border border-white/10 hover:border-plasma/40 transition-all group">
          <div className="p-3 bg-nova/20 text-nova rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
            <Award size={28} />
          </div>
          <h3 className="text-xl font-bold text-starlight mb-3">Зэрэгцүүлэн харьцуулах боломж</h3>
          <p className="text-nebula-text text-sm leading-relaxed">
            Сонирхсон хэд хэдэн үл хөдлөх хөрөнгийг сонгон үнэ, 1м.кв-ын өртөг, өрөөний тоо, барилгын хийцээр нь нэг дор зэрэгцүүлэн харьцуулж оновчтой сонголт хийгээрэй.
          </p>
        </div>
      </div>


      {/* Platform Statistics Section */}
      <div className="glass-card p-10 rounded-3xl border border-plasma/30 bg-gradient-to-r from-void via-cosmic to-void mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-black text-plasma font-heading mb-2">10,000+</div>
            <div className="text-nebula-text text-sm font-semibold">Идэвхитэй Зар</div>
          </div>
          <div>
            <div className="text-4xl font-black text-aurora font-heading mb-2">50,000+</div>
            <div className="text-nebula-text text-sm font-semibold">Сар бүрийн хэрэглэгчид</div>
          </div>
          <div>
            <div className="text-4xl font-black text-nova font-heading mb-2">500+</div>
            <div className="text-nebula-text text-sm font-semibold">Баталгаажсан Агентууд</div>
          </div>
          <div>
            <div className="text-4xl font-black text-starlight font-heading mb-2">99.9%</div>
            <div className="text-nebula-text text-sm font-semibold">Системийн Найдвартай ажиллагаа</div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-starlight mb-4 font-heading">
          Үл хөдлөх хөрөнгөө өнөөдөр үнэгүй байршуулаарай
        </h2>
        <p className="text-nebula-text mb-8 max-w-xl mx-auto">
          Та орон сууц, хаус болон оффисоо худалдах эсвэл түрээслүүлэх гэж байгаа бол Vmax.mn платформд зар байршуулан олон мянган худалдан авагчид хүрнэ үү.
        </p>
        <Link
          to="/create-listing"
          className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-plasma to-aurora text-white font-bold rounded-2xl shadow-lg shadow-plasma/30 hover:scale-105 transition-all"
        >
          <span>Зар нэмэх</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default AboutUs;
