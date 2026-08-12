const mn = {
  nav: { home: 'Нүүр', listings: 'Зар үзэх', dashboard: 'Хянах самбар', createListing: 'Зар оруулах', login: 'Нэвтрэх', register: 'Бүртгүүлэх', logout: 'Гарах', profile: 'Профайл' },
  hero: { title: 'Монголын Үл Хөдлөх Хөрөнгийн Зах Зээл', subtitle: 'Хамгийн хялбар, хамгийн хурдан', search: 'Хайх' },
  listings: { newListings: 'Шинэ зарууд', viewAll: 'Бүгдийг үзэх', noResults: 'Одоогоор илэрц олдсонгүй', sale: 'Зарах', rent: 'Түрээслэх', sqm: 'м.кв', bedrooms: 'унтлагын', bathrooms: 'ариун цэврийн', daysLeft: 'өдөр үлдсэн', expired: 'Хугацаа дууссан', closed: 'Хаагдсан', price: 'Үнэ' },
  filters: { type: 'Төрөл', category: 'Ангилал', location: 'Байршил', priceRange: 'Үнийн хязгаар', areaRange: 'Талбай', apartment: 'Орон сууц', house: 'Хаус', land: 'Газар', commercial: 'Оффис', all: 'Бүгд', min: 'Доод', max: 'Дээд', apply: 'Шүүх', reset: 'Цэвэрлэх' },
  dashboard: { title: 'Хянах самбар', active: 'Идэвхтэй', expired: 'Хугацаа дууссан', closed: 'Хаагдсан', edit: 'Засах', delete: 'Устгах', renew: 'Сунгах', publish: 'Нийтлэх', unpublish: 'Нуух', close: 'Хаах', activeListings: 'Идэвхтэй зарууд', totalViews: 'Нийт үзэлт', saved: 'Хадгалсан', confirmDelete: 'Энэ зарыг устгахдаа итгэлтэй байна уу?', noListings: 'Танд одоогоор зар байхгүй байна.' },
  profile: { title: 'Профайл', editProfile: 'Засварлах', name: 'Нэр', email: 'Имэйл', phone: 'Утас', save: 'Хадгалах', cancel: 'Цуцлах', myAds: 'Миний зарууд', info: 'Хувийн мэдээлэл', updated: 'Амжилттай хадгалагдлаа' },
  auth: { login: 'Нэвтрэх', register: 'Бүртгүүлэх', email: 'Имэйл хаяг', password: 'Нууц үг', name: 'Нэр', phone: 'Утас', continueGoogle: 'Google-ээр нэвтрэх', continueFacebook: 'Facebook-ээр нэвтрэх', or: 'ЭСВЭЛ', newUser: 'Шинэ хэрэглэгч үү?', hasAccount: 'Бүртгэлтэй хэрэглэгч үү?' },
  createListing: { title: 'Шинэ зар', step1: 'Төрөл', step2: 'Мэдээлэл', step3: 'Дэлгэрэнгүй', step4: 'Зураг', step5: 'Баталгаажуулах', next: 'Дараах', prev: 'Буцах', submit: 'Нийтлэх' },
  common: { loading: 'Уншиж байна...', error: 'Алдаа гарлаа', success: 'Амжилттай', confirm: 'Баталгаажуулах', cancel: 'Цуцлах', save: 'Хадгалах', back: 'Буцах' },
};
export default mn;
export type Translations = typeof mn;
