import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Trash2, Mail, Database, CheckCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-plasma/20 border border-plasma/30 text-plasma text-xs font-bold uppercase tracking-wider mb-4">
          <Shield size={14} />
          <span>Аюулгүй байдал & Нууцлал</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-starlight mb-4">
          Нууцлалын бодлого (Privacy Policy)
        </h1>
        <p className="text-nebula-text text-sm">
          Сүүлчийн шинэчлэлт: 2026 оны 9 сарын 12. Энэхүү нууцлалын бодлого нь Vmax.mn платформ таны хувийн мэдээллийг хэрхэн цуглуулж, ашиглаж, хамгаалж байгааг тайлбарлана.
        </p>
      </div>

      <div className="space-y-8 glass-card p-8 rounded-3xl border border-white/10 text-starlight">

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-plasma font-heading flex items-center space-x-2">
            <Database size={20} className="text-plasma" />
            <span>1. Цуглуулах мэдээлэл</span>
          </h2>
          <p className="text-nebula-text text-sm leading-relaxed">
            Vmax.mn платформд хэрэглэгч бүртгүүлэх, зарын мэдээлэл оруулах болон системтэй харилцах үед дараах мэдээллийг цуглуулна:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-nebula-text text-sm leading-relaxed pl-2">
            <li><strong>Хувийн мэдээлэл:</strong> Таны нэр, цахим шуудангийн хаяг (email), утасны дугаар, профайл зураг.</li>
            <li><strong>Нэвтрэх систем (OAuth):</strong> Google эсвэл Facebook-ээр нэвтрэх үед OAuth 2.0 протоколоор дамжин таны нийтийн профайл мэдээлэл (нэр, имэйл, профайл зураг).</li>
            <li><strong>Үл хөдлөх хөрөнгийн зар:</strong> Таны оруулсан зарын мэдээлэл, зураг, видео холбоос, байршил болон үнийн мэдээлэл.</li>
          </ul>
        </section>

        <div className="border-t border-white/10" />

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-plasma font-heading flex items-center space-x-2">
            <Eye size={20} className="text-plasma" />
            <span>2. Мэдээллийн ашиглалт</span>
          </h2>
          <p className="text-nebula-text text-sm leading-relaxed">
            Цуглуулсан мэдээллийг зөвхөн дараах зорилгоор ашиглана:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-nebula-text text-sm leading-relaxed pl-2">
            <li>Үл хөдлөх хөрөнгийн зарыг нийтлэх ба худалдан авагчидтай холбогдох боломж олгох.</li>
            <li>Хэрэглэгчийн аюулгүй байдал болон системийн баталгаажуулалтыг хангах.</li>
            <li>Зарын үзэлт болон сошиал хуваалцсан статистикийг зарын эзэнд харуулах.</li>
            <li>Хууль бус болон хуурамч зарыг илрүүлэх, урьдчилан сэргийлэх.</li>
          </ul>
        </section>

        <div className="border-t border-white/10" />

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-plasma font-heading flex items-center space-x-2">
            <Lock size={20} className="text-plasma" />
            <span>3. Мэдээллийн нууцлал ба Хамгаалалт</span>
          </h2>
          <p className="text-nebula-text text-sm leading-relaxed">
            Vmax.mn нь хэрэглэгчийн хувийн мэдээллийг гуравдагч этгээдэд худалдахгүй, түрээслэхгүй. Таны нууц үг болон нэвтрэх мэдээлэл криптограф шифрлэлтээр (bcrypt, JWT token) хамгаалагдсан серверт хадгалагдана.
          </p>
        </section>

        <div className="border-t border-white/10" />

        {/* Section 4: Facebook Data Deletion Instructions */}
        <section className="space-y-4 p-6 rounded-2xl bg-void/50 border border-plasma/30">
          <h2 className="text-xl font-bold text-aurora font-heading flex items-center space-x-2">
            <Trash2 size={20} className="text-aurora" />
            <span>4. Фэйсбүүк мэдээлэл устгах заавар (Facebook Data Deletion)</span>
          </h2>
          <p className="text-nebula-text text-sm leading-relaxed">
            Facebook-ийн Хэрэглэгчийн Мэдээллийн Бодлогын (Facebook Platform Terms) дагуу хэрэглэгч Vmax.mn системд Facebook-ээр нэвтэрсэн мэдээллээ хэзээ ч устгуулах эрхтэй.
          </p>
          <div className="space-y-2 text-sm text-starlight">
            <p className="font-semibold text-plasma">Мэдээллээ устгуулах 2 боломж:</p>
            <ol className="list-decimal list-inside space-y-2 text-nebula-text">
              <li>
                <strong>Facebook Тохиргоогоор устгах:</strong> Та өөрийн Facebook хуудасны <em>Settings & Privacy &gt; Settings &gt; Apps and Websites</em> хэсэг рүү орж <strong>Vmax.mn</strong> аппликейшныг сонгон <strong>Remove</strong> эсвэл <strong>Send Request</strong> товчийг дарж мэдээллээ устгуулж болно.
              </li>
              <li>
                <strong>Имэйлээр устгах хүсэлт гаргах:</strong> Та <strong>privacy@vmax.mn</strong> хаяг руу бүртгэлтэй цахим хаягаасаа <em>"Facebook Data Deletion Request"</em> гарчигтай хүсэлт илгээснээр манай систем таны мэдээллийг 24 цагийн дотор бүрэн устгах болно.
              </li>
            </ol>
          </div>
        </section>

        <div className="border-t border-white/10" />

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-plasma font-heading flex items-center space-x-2">
            <Mail size={20} className="text-plasma" />
            <span>5. Холбоо барих</span>
          </h2>
          <p className="text-nebula-text text-sm leading-relaxed">
            Нууцлалын бодлоготой холбоотой санал хүсэлт, асуулт эсвэл мэдээлэл устгуулах хүсэлт байвал дараах хаягаар холбогдоно уу:
          </p>
          <div className="text-sm text-starlight space-y-1">
            <div><strong>Имэйл:</strong> privacy@vmax.mn, info@vmax.mn</div>
            <div><strong>Утас:</strong> +976 8976-7700</div>
            <div><strong>Хаяг:</strong> Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо</div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
