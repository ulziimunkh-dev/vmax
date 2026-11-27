import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Building2,
  PlusCircle,
  ShieldCheck,
  Calculator,
  Phone,
  Mail,
  Sparkles,
  Layers,
  PartyPopper,
  Scale,
  Heart,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'general' | 'listings' | 'vip' | 'features' | 'tools' | 'safety';
  question: string;
  answer: string;
  links?: { label: string; to: string }[];
}

const FAQ_CATEGORIES = [
  { id: 'all', label: 'Бүх асуулт', icon: HelpCircle },
  { id: 'general', label: 'Ерөнхий', icon: Building2 },
  { id: 'listings', label: 'Зар нийтлэх', icon: PlusCircle },
  { id: 'vip', label: 'VIP & Багц', icon: Sparkles },
  { id: 'features', label: '3D, Тавилга, Эвент', icon: Layers },
  { id: 'tools', label: 'Зээл & Тооцоолуур', icon: Calculator },
  { id: 'safety', label: 'Аюулгүй байдал', icon: ShieldCheck },
] as const;

const FAQ_DATA: FAQItem[] = [
  // 1. General
  {
    id: 'gen-1',
    category: 'general',
    question: 'Vmax.mn гэж ямар платформ бэ? Бусад зарын сайтуудаас юугаараа ялгаатай вэ?',
    answer:
      'Vmax.mn нь Монголын үл хөдлөх хөрөнгийн зах зээлийг дижитал технологитой хослуулсан цогц экосистем юм. Энгийн зар байршуулахаас гадна 3D Virtual Tour бүхий шинэ төслүүд, дотоодын тавилга үйлдвэрлэгчдийн бодит видео танилцуулга (Реелүүд), ресторан, хүлээн авалтын заал захиалга, түүнчлэн ипотекийн 6% зээлийн автомат тооцоолуур, зар харьцуулах боломжуудыг нэг дор төвлөрүүлсэнээрээ онцлог давуу талтай.',
    links: [
      { label: 'Бидний тухай', to: '/about' },
      { label: 'Бүх зар үзэх', to: '/' },
    ],
  },
  {
    id: 'gen-2',
    category: 'general',
    question: 'Бүртгүүлэхэд ямар нэг хураамж, төлбөр төлөх шаардлагатай юу?',
    answer:
      'Үгүй, Vmax.mn-д хэрэглэгчээр бүртгүүлэх нь 100% үнэ төлбөргүй. Та утасны дугаар эсвэл Google хаягаараа хэдхэн секундэд хялбархан бүртгүүлж, зар нийтлэх, дуртай зараа хадгалах, харьцуулах боломжтой болно.',
    links: [{ label: 'Бүртгүүлэх', to: '/register' }],
  },
  {
    id: 'gen-3',
    category: 'general',
    question: 'Хэрхэн нэвтрэх вэ? Утасны дугаар болон Google-ээр нэвтэрч болох уу?',
    answer:
      'Тийм ээ. Та өөрийн бүртгэлтэй утасны дугаар болон нууц үгээр, эсвэл Google хаягаараа 1 товшилтоор шууд нэвтрэх боломжтой. Манай нэвтрэх цонх нь утас болон имэйлийг автоматаар ялган таньдаг тул тусгай горим сонгох шаардлагагүй.',
    links: [{ label: 'Нэвтрэх хуудас', to: '/login' }],
  },
  {
    id: 'gen-4',
    category: 'general',
    question: 'Нууц үгээ мартсан тохиолдолд хэрхэн сэргээх вэ?',
    answer:
      'Нэвтрэх хуудсан дээр байрлах "Нууц үгээ мартсан уу?" холбоос дээр дарж, бүртгэлтэй утасны дугаар эсвэл имэйлээ оруулан 6 оронтой баталгаажуулах код хүлээн авч шинэ нууц үгээ шууд үүсгэх боломжтой.',
    links: [{ label: 'Нууц үг сэргээх', to: '/login' }],
  },

  // 2. Listings
  {
    id: 'list-1',
    category: 'listings',
    question: 'Зар байршуулахад үнэ төлбөртэй юу? Үнэгүй зар оруулах боломж бий юу?',
    answer:
      'Хувь хүн орон сууц, хаус, газар болон оффисоо худалдах, түрээслүүлэх зорилгоор энгийн зарыг үнэ төлбөргүй нийтлэх бүрэн боломжтой. Харин зарынхаа үзэлтийг олон дахин өсгөж, хайлтын хамгийн дээр байршуулахыг хүсвэл VIP болон Онцлох багцуудыг сонгон идэвхжүүлж болно.',
    links: [{ label: 'Шинэ зар нийтлэх', to: '/create-listing' }],
  },
  {
    id: 'list-2',
    category: 'listings',
    question: 'Нийтэлсэн зар хэр хугацаанд идэвхтэй харагдах вэ? Хугацааг сунгаж болох уу?',
    answer:
      'Энгийн зар нь нийтлэгдсэн өдрөөс эхлэн 30 хоног системд идэвхтэй байршина. Хугацаа дуусах үед та "Хяналтын самбар (Dashboard)" руугаа орж зарынхаа хугацааг 1 товшилтоор сунгах, эсвэл зарагдсан тохиолдолд хаах боломжтой.',
    links: [{ label: 'Хяналтын самбар', to: '/dashboard' }],
  },
  {
    id: 'list-3',
    category: 'listings',
    question: 'Зар нийтлэхэд зураг, байршлыг хэрхэн зөв оруулах вэ?',
    answer:
      'Зар нийтлэх форм дээр өөрийн утас эсвэл компьютерээс 15 хүртэлх бодит чанартай фото зураг, байршил (Хот, дүүрэг, хороо, хотхоны нэр), барилгын нийт талбай (м.кв), давхар, өрөөний тоо, барилгын хийц болон төлбөрийн нөхцөлийг (бэлэн, бартер, банкны лизинг) үнэн зөв оруулснаар худалдан авагчдын хайлтад оновчтой илэрнэ.',
    links: [{ label: 'Зар нийтлэх заавар', to: '/create-listing' }],
  },
  {
    id: 'list-4',
    category: 'listings',
    question: 'Зарынхаа үзэлт, залгасан дуудлагын аудитыг хаанаас харах вэ?',
    answer:
      'Өөрийн бүртгэлээр нэвтэрч "Хяналтын самбар (Dashboard)" руу ороход таны оруулсан бүх заруудын үзэлтийн тоо, цахим сүлжээнд хуваалцсан тоо болон утасны дугаар үзсэн хүмүүсийн нарийвчилсан аудит бодит цагийн горимоор ил тод харагдана.',
    links: [{ label: 'Хяналтын самбар', to: '/dashboard' }],
  },

  // 3. VIP & Pricing
  {
    id: 'vip-1',
    category: 'vip',
    question: 'VIP онцлох зар нь энгийн зараас ямар давуу талтай вэ?',
    answer:
      'VIP зар нь нүүр хуудасны эхний эгнээнд болон бүх хайлтын илэрцийн дээд хэсэгт тод хүрээ, гэрэлтсэн VIP тэмдэгтэйгээр харагддаг. Статистик мэдээллээр VIP зар нь энгийн зартай харьцуулахад дунджаар 5-8 дахин олон үзэлт авч, үл хөдлөх хөрөнгөө богино хугацаанд борлуулах өндөр магадлалыг олгодог.',
    links: [{ label: 'VIP Багцууд үзэх', to: '/pricing' }],
  },
  {
    id: 'vip-2',
    category: 'vip',
    question: 'Төлбөр тооцоог хэрхэн хийх вэ? Ямар төлбөрийн хэрэгсэл ажилладаг вэ?',
    answer:
      'Бид QPay (бүх банкны аппликейшн), дебит/кредит карт, болон банкны дансны шууд шилжүүлгүүдийг дэмждэг. Төлбөр хийгдсэн даруйд систем таны сонгосон багцыг автоматаар шууд идэвхжүүлнэ.',
    links: [{ label: 'Үнийн тариф', to: '/pricing' }],
  },
  {
    id: 'vip-3',
    category: 'vip',
    question: 'Мэргэжлийн Агент (Pro Agent) болон Агентлагийн (Agency) эрх ямар ялгаатай вэ?',
    answer:
      'Pro Agent багц нь хувийн агентуудад зориулагдсан бөгөөд олон тооны зар зэрэг нийтлэх, профайл дээрээ "Баталгаажсан агент" цэнхэр тэмдэг байршуулах, дэлгэрэнгүй аналитик ашиглах боломжийг олгодог. Харин Agency багц нь 10 хүртэлх агентын багийг нэгдсэн эрхээр удирдаж, агентлагийн нэр, логогоор зар түгээх боломжийг олгодог.',
    links: [{ label: 'Багцууд харьцуулах', to: '/pricing' }],
  },

  // 4. Features (3D, Furniture, Events)
  {
    id: 'feat-1',
    category: 'features',
    question: '3D Virtual Tour бүхий шинэ төслийг хэрхэн бүртгүүлэх вэ?',
    answer:
      'Барилгын төсөл хэрэгжүүлэгч компаниуд өөрсдийн шинэ хотхон, орон сууцны төслийн 3D панорама болон концепц танилцуулгыг Vmax.mn-д бүртгүүлэх боломжтой. "Хяналтын самбар -> Шинэ төсөл бүртгэх" цэсээр орж төслийн мэдээлэл болон 3D виртуал линкээ оруулснаар олон нийтэд нээлттэй болно.',
    links: [{ label: 'Шинэ төслүүд үзэх', to: '/projects' }],
  },
  {
    id: 'feat-2',
    category: 'features',
    question: 'Тавилга бүтээгч урлан, интерьерийн реел хэрхэн байршуулах вэ?',
    answer:
      'Vmax.mn нь дотоодын тавилга үйлдвэрлэгчид болон урлан бүтээгчдийг дэмжин ажилладаг. Урлангийн профайл үүсгэж, хийсэн ажлынхаа бодит богино хэмжээний видео (Reel)-г оруулснаар шинэ байранд орж буй олон мянган оршин суугчдад бүтээгдэхүүнээ шууд танилцуулах боломжтой.',
    links: [{ label: 'Тавилга & Засал үзэх', to: '/furniture' }],
  },
  {
    id: 'feat-3',
    category: 'features',
    question: 'Ресторан, хүлээн авалтын заалны эзэд хэрхэн бүртгүүлж захиалга авах вэ?',
    answer:
      'Байгууллагын профайл үүсгэн хурим, найр, хүлээн авалт болон хурлын заалны багтаамж, үнэ тариф, зураг, цэсийн мэдээллээ оруулснаар хэрэглэгчид онлайнаар заалны бэлэн байдлыг шалгаж шууд захиалгын хүсэлт илгээх боломжтой.',
    links: [{ label: 'Эвент & Заал үзэх', to: '/events' }],
  },

  // 5. Tools & Calculator
  {
    id: 'tool-1',
    category: 'tools',
    question: 'Ипотекийн 6% зээлийн тооцоолуур хэрхэн ажилладаг вэ?',
    answer:
      'Vmax.mn-ийн зээлийн тооцоолуур нь Монголбанкны орон сууцны хөнгөлөлттэй ипотекийн 6% хөтөлбөрийн бодит стандартаар тооцоолдог. Та байрны нийт үнэ, урьдчилгаа төлбөр, зээлийн хугацаагаа оруулахад сар бүрийн тэнцүү төлөлт, нийт хүү болон шаардагдах өрхийн цэвэр орлогын доод хэмжээг график, хүснэгтээр нарийвчлан харуулна.',
    links: [{ label: 'Зээлийн тооцоолуур луу очих', to: '/calculator' }],
  },
  {
    id: 'tool-2',
    category: 'tools',
    question: 'Зар харьцуулах (Compare) горимоор хэдэн зар зэрэгцүүлж харах боломжтой вэ?',
    answer:
      'Та өөрт таалагдсан 4 хүртэлх зарыг "Харьцуулах" сагсанд нэмж, тэдгээрийн үнэ, м.кв-ын өртөг, өрөөний зохион байгуулалт, давхар, дүүрэг, барилгын хийцийг нэг дэлгэц дээр зэрэгцүүлэн нарийвчлан жишиж оновчтой шийдвэр гаргах боломжтой.',
    links: [{ label: 'Зар харьцуулах', to: '/compare' }],
  },

  // 6. Safety & Support
  {
    id: 'safe-1',
    category: 'safety',
    question: 'Хуурамч зарыг хэрхэн таних, залилангаас хэрхэн сэргийлэх вэ?',
    answer:
      'Vmax.mn нь нийтлэгдэж буй заруудыг утасны дугаар болон хиймэл оюуны шүүлтүүрээр давхар шалгадаг. Мөн "Баталгаажсан агент" (Verified) тэмдэглэгээтэй хэрэглэгчид нь хувийн мэдээллээ баталгаажуулсан байдаг. Хэрэв танд сэжигтэй, бодит бус үнэтэй зар таарвал зарын дэлгэрэнгүй дэх "Мэдэгдэх" товчийг дарж манай хяналтын багт даруй мэдэгдээрэй.',
  },
  {
    id: 'safe-2',
    category: 'safety',
    question: 'Хэрэглэгчийн тусламжийн албатай хэрхэн холбогдох вэ?',
    answer:
      'Та бидэнтэй +976 8976-7700 утсаар шууд холбогдох, contact@vmax.mn имэйл хаягаар хандах эсвэл сайтын баруун доод буланд байрлах Vmax AI ухаалаг туслахтай 24/7 цагаар чатлаж түргэн шуурхай хариулт авах боломжтой.',
  },
  {
    id: 'safe-3',
    category: 'safety',
    question: 'Vmax.mn төслийн багийг хэрхэн дэмжих (хандив өгөх) вэ?',
    answer:
      'Бид Монголын үл хөдлөх хөрөнгийн салбарыг ил тод, ухаалаг, хүн бүрд хүртээмжтэй болгохоор зорьж буй үндэсний хөгжүүлэгчдийн баг юм. Манай үйл ажиллагааг дэмжиж урам өгөхийг хүсвэл манай хандив, дэмжлэгийн хуудсаар орж дансны мэдээллийг харах боломжтой.',
    links: [{ label: 'Биднийг дэмжих хуудас', to: '/donate' }],
  },
];

export const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('gen-1');

  // Filter items based on category and search query
  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const expandAll = () => {
    if (filteredFAQs.length > 0) {
      setExpandedId(filteredFAQs[0].id);
    }
  };

  const collapseAll = () => {
    setExpandedId(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-plasma/15 border border-plasma/30 text-plasma text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle size={14} />
            <span>Тусламжийн төв</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-starlight mb-4 leading-tight">
            Түгээмэл асуулт, <span className="text-transparent bg-clip-text bg-gradient-to-r from-plasma via-nova to-aurora">хариултууд</span>
          </h1>

          <p className="text-sm sm:text-base text-nebula-text leading-relaxed">
            Vmax.mn платформын зар нийтлэх, хайх, 3D төсөл, зээлийн тооцоолуур болон бусад бүх боломжуудын талаарх хариултууд.
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="mt-8 relative max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-nebula-text w-5 h-5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Асуултаа эндээс хайна уу... (Жишээ: үнэгүй зар, зээл, VIP)"
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-void/80 border border-white/10 text-sm text-starlight placeholder-nebula-text/60 focus:outline-none focus:border-plasma focus:ring-2 focus:ring-plasma/20 transition-all shadow-lg shadow-black/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 rounded-lg text-nebula-text hover:text-white hover:bg-white/10 transition-colors"
                title="Арилгах"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
        {FAQ_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          const count =
            cat.id === 'all'
              ? FAQ_DATA.length
              : FAQ_DATA.filter((i) => i.category === cat.id).length;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-plasma to-nova text-white shadow-md shadow-plasma/25 border border-plasma/40'
                  : 'bg-void/60 text-nebula-text hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-nebula-text/80'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search results summary bar */}
      <div className="flex items-center justify-between mb-4 px-1 text-xs text-nebula-text">
        <div>
          Илэрц: <span className="font-bold text-starlight">{filteredFAQs.length}</span> асуулт
          {searchQuery && (
            <span className="ml-1 text-plasma">("{searchQuery}" хайлтаар)</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={expandAll}
            className="hover:text-plasma transition-colors text-[11px] underline cursor-pointer"
          >
            Эхнийг нээх
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={collapseAll}
            className="hover:text-plasma transition-colors text-[11px] underline cursor-pointer"
          >
            Бүгдийг хумих
          </button>
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3 mb-16">
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((item, index) => {
            const isExpanded = expandedId === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'bg-cosmic/70 border-plasma/40 shadow-lg shadow-plasma/10'
                    : 'bg-void/60 hover:bg-white/[0.03] border-white/10'
                }`}
              >
                {/* Question Trigger */}
                <button
                  type="button"
                  onClick={() => toggleExpand(item.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono transition-colors ${
                        isExpanded
                          ? 'bg-plasma text-white'
                          : 'bg-white/5 text-nebula-text'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="font-bold text-sm sm:text-base text-starlight leading-snug">
                      {item.question}
                    </span>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isExpanded
                        ? 'rotate-180 bg-plasma/20 text-plasma'
                        : 'bg-white/5 text-nebula-text hover:text-white'
                    }`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                {/* Answer Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-white/5 text-sm text-nebula-text leading-relaxed">
                        <p>{item.answer}</p>

                        {/* Quick links related to this FAQ */}
                        {item.links && item.links.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/5">
                            <span className="text-xs text-starlight font-semibold">Холбоотой:</span>
                            {item.links.map((link) => (
                              <Link
                                key={link.to}
                                to={link.to}
                                className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-plasma/15 hover:bg-plasma/25 text-plasma text-xs font-semibold border border-plasma/20 transition-colors"
                              >
                                <span>{link.label}</span>
                                <ArrowRight size={12} />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-16 px-4 rounded-2xl bg-void/50 border border-white/10">
            <HelpCircle size={40} className="text-nebula-text/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-starlight mb-1">
              Хайлтад тохирох асуулт олдсонгүй
            </h3>
            <p className="text-xs text-nebula-text max-w-sm mx-auto mb-4">
              Та түлхүүр үгээ өөрчлөх эсвэл доорх тусламжийн албатай шууд холбогдоно уу.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-plasma text-white text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Бүх асуултыг харах
            </button>
          </div>
        )}
      </div>

      {/* Still Have Questions? Contact Box */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-plasma/30 bg-gradient-to-br from-void via-cosmic to-void relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-plasma/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <CheckCircle2 size={13} />
              <span>24/7 Дэмжлэг & Тусламж</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-starlight font-heading">
              Хайсан асуултаа олсонгүй юу?
            </h3>
            <p className="text-xs sm:text-sm text-nebula-text leading-relaxed">
              Манай хэрэглэгчийн үйлчилгээний мэргэжилтнүүд болон Vmax AI ухаалаг чат туслах танд туслахад үргэлж бэлэн байна.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5">
            <a
              href="tel:+97689767700"
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-plasma to-nova text-white text-xs font-bold shadow-md shadow-plasma/25 hover:shadow-plasma/40 active:scale-95 transition-all text-center"
            >
              <Phone size={15} />
              <span>+976 8976-7700</span>
            </a>

            <a
              href="mailto:contact@vmax.mn"
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-starlight border border-white/10 text-xs font-bold active:scale-95 transition-all text-center"
            >
              <Mail size={15} />
              <span>contact@vmax.mn</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
