import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Lock, AlertCircle, HelpCircle } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-plasma/20 border border-plasma/30 text-plasma text-xs font-bold uppercase tracking-wider mb-4">
          <FileText size={14} />
          <span>Баримт бичиг</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-starlight mb-4">
          Үйлчилгээний нөхцөл ба Зарын бодлого
        </h1>
        <p className="text-nebula-text text-sm">
          Сүүлчийн шинэчлэлт: 2026 оны 8 сарын 13. Энэхүү үйлчилгээний нөхцөл нь Vmax.mn веб сайтыг ашиглах журам болон хэрэглэгчдийн эрх, үүргийг зохицуулна.
        </p>
      </div>

      <div className="space-y-8 glass-card p-8 rounded-3xl border border-white/10 text-starlight">
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-plasma font-heading flex items-center space-x-2">
            <span>1. Ерөнхий зүйл</span>
          </h2>
          <p className="text-nebula-text text-sm leading-relaxed">
            1.1. Vmax.mn платформд бүртгүүлснээр эсвэл зарын мэдээлэл хайж, байршуулснаар хэрэглэгч та энэхүү үйлчилгээний нөхцөлийг бүрэн хүлээн зөвшөөрсөнд тооцогдоно.
          </p>
          <p className="text-nebula-text text-sm leading-relaxed">
            1.2. Vmax.mn систем нь үл хөдлөх хөрөнгө худалдах, түрээслэх зарын мэдээллийн нэгдсэн платформ бөгөөд хэрэглэгчдийн хооронд хийгдэх хэлцлийн шууд тал болохгүй.
          </p>
        </section>

        <div className="border-t border-white/10" />

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-plasma font-heading flex items-center space-x-2">
            <span>2. Зар байршуулах журам</span>
          </h2>
          <ul className="list-disc list-inside space-y-2 text-nebula-text text-sm leading-relaxed">
            <li>Зар байршуулагч нь үл хөдлөх хөрөнгийн үнэн зөв мэдээлэл, зураг, байршил болон үнийг оруулах үүрэгтэй.</li>
            <li>Хуурамч, бусдыг төөрөгдүүлсэн, давхардсан болон зохиогчийн эрх зөрчсөн контент байршуулахыг хатуу хориглоно.</li>
            <li>Яаралтай ба VIP онцлох заруудын үйлчилгээ нь сонгосон хугацаанд зарыг эхэнд байршуулах боломжийг олгоно.</li>
          </ul>
        </section>

        <div className="border-t border-white/10" />

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-plasma font-heading flex items-center space-x-2">
            <span>3. Нууцлал ба Мэдээллийн аюулгүй байдал</span>
          </h2>
          <p className="text-nebula-text text-sm leading-relaxed">
            3.1. Vmax.mn нь хэрэглэгчийн хувийн мэдээллийг чанд нууцалж, AWS cloud аюулгүй байдлын стандартад нийцүүлэн шифрлэгдсэн хэлбэрээр хадгална.
          </p>
          <p className="text-nebula-text text-sm leading-relaxed">
            3.2. Таны утасны дугаар болон цахим шуудангийн хаягийг зөвхөн үл хөдлөх хөрөнгийн сонирхогчидтой холбогдох зорилгоор ашиглана.
          </p>
        </section>

        <div className="border-t border-white/10" />

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-plasma font-heading flex items-center space-x-2">
            <span>4. Холбоо барих</span>
          </h2>
          <p className="text-nebula-text text-sm leading-relaxed">
            Үйлчилгээний нөхцөлтэй холбоотой санал хүсэлт, асуулт байвал манай дэмжлэгийн багтай <strong>info@vmax.mn</strong> болон <strong>+976 8888-8888</strong> дугаараар холбогдоно уу.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
