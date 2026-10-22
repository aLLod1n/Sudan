// Static seed data: cities, neighbourhoods, sample users and listings.

import type { Currency, DealType, PropertyType } from "../generated/prisma/enums";

type SeedNeighbourhood = { slug: string; nameAr: string; nameEn: string };
type SeedCity = { slug: string; nameAr: string; nameEn: string; neighbourhoods: SeedNeighbourhood[] };

export const cities: SeedCity[] = [
  {
    slug: "khartoum",
    nameAr: "الخرطوم",
    nameEn: "Khartoum",
    neighbourhoods: [
      { slug: "riyadh", nameAr: "الرياض", nameEn: "Al Riyadh" },
      { slug: "amarat", nameAr: "العمارات", nameEn: "Al Amarat" },
      { slug: "khartoum-2", nameAr: "الخرطوم 2", nameEn: "Khartoum 2" },
      { slug: "manshiya", nameAr: "المنشية", nameEn: "Al Manshiya" },
      { slug: "taif", nameAr: "الطائف", nameEn: "Al Taif" },
      { slug: "arkaweet", nameAr: "أركويت", nameEn: "Arkaweet" },
      { slug: "burri", nameAr: "بري", nameEn: "Burri" },
      { slug: "jabra", nameAr: "جبرة", nameEn: "Jabra" },
      { slug: "sahafa", nameAr: "الصحافة", nameEn: "Al Sahafa" },
      { slug: "mamoura", nameAr: "المعمورة", nameEn: "Al Mamoura" },
      { slug: "garden-city", nameAr: "جاردن سيتي", nameEn: "Garden City" },
      { slug: "soba", nameAr: "سوبا", nameEn: "Soba" },
      { slug: "kalakla", nameAr: "الكلاكلة", nameEn: "Al Kalakla" },
      { slug: "shajara", nameAr: "الشجرة", nameEn: "Al Shajara" },
      { slug: "deim", nameAr: "الديم", nameEn: "Al Deim" },
    ],
  },
  {
    slug: "omdurman",
    nameAr: "أم درمان",
    nameEn: "Omdurman",
    neighbourhoods: [
      { slug: "mulazmin", nameAr: "الملازمين", nameEn: "Al Mulazmin" },
      { slug: "thawra", nameAr: "الثورة", nameEn: "Al Thawra" },
      { slug: "wad-nubawi", nameAr: "ود نوباوي", nameEn: "Wad Nubawi" },
      { slug: "abbasiya", nameAr: "العباسية", nameEn: "Al Abbasiya" },
      { slug: "beit-al-mal", nameAr: "بيت المال", nameEn: "Beit Al Mal" },
      { slug: "mohandiseen", nameAr: "المهندسين", nameEn: "Al Mohandiseen" },
      { slug: "arda", nameAr: "العرضة", nameEn: "Al Arda" },
      { slug: "murada", nameAr: "الموردة", nameEn: "Al Murada" },
      { slug: "abu-rouf", nameAr: "أبوروف", nameEn: "Abu Rouf" },
      { slug: "fitihab", nameAr: "الفتيحاب", nameEn: "Al Fitihab" },
      { slug: "salha", nameAr: "الصالحة", nameEn: "Al Salha" },
      { slug: "ombadda", nameAr: "أمبدة", nameEn: "Ombadda" },
    ],
  },
  {
    slug: "bahri",
    nameAr: "الخرطوم بحري",
    nameEn: "Khartoum Bahri",
    neighbourhoods: [
      { slug: "kafouri", nameAr: "كافوري", nameEn: "Kafouri" },
      { slug: "mazad", nameAr: "المزاد", nameEn: "Al Mazad" },
      { slug: "shambat", nameAr: "شمبات", nameEn: "Shambat" },
      { slug: "halfaya", nameAr: "الحلفايا", nameEn: "Al Halfaya" },
      { slug: "safiya", nameAr: "الصافية", nameEn: "Al Safiya" },
      { slug: "droshab", nameAr: "الدروشاب", nameEn: "Al Droshab" },
      { slug: "kadaru", nameAr: "الكدرو", nameEn: "Al Kadaru" },
      { slug: "shaabiya", nameAr: "الشعبية", nameEn: "Al Shaabiya" },
      { slug: "amlak", nameAr: "الأملاك", nameEn: "Al Amlak" },
      { slug: "hillat-khojali", nameAr: "حلة خوجلي", nameEn: "Hillat Khojali" },
    ],
  },
  {
    slug: "port-sudan",
    nameAr: "بورتسودان",
    nameEn: "Port Sudan",
    neighbourhoods: [
      { slug: "deim-madina", nameAr: "ديم مدينة", nameEn: "Deim Madina" },
      { slug: "deim-arab", nameAr: "ديم عرب", nameEn: "Deim Arab" },
      { slug: "thawra", nameAr: "الثورة", nameEn: "Al Thawra" },
      { slug: "salabona", nameAr: "سلبونا", nameEn: "Salabona" },
      { slug: "mirghaniya", nameAr: "المرغنية", nameEn: "Al Mirghaniya" },
      { slug: "transit", nameAr: "ترانزيت", nameEn: "Transit" },
      { slug: "matar", nameAr: "حي المطار", nameEn: "Al Matar" },
      { slug: "uzma", nameAr: "العظمة", nameEn: "Al Uzma" },
      { slug: "salalab", nameAr: "سلالاب", nameEn: "Salalab" },
      { slug: "iskan", nameAr: "الإسكان", nameEn: "Al Iskan" },
    ],
  },
];

export type SeedUserKey = "agentNile" | "agentRedSea" | "ownerAhmed" | "ownerFatima";

export const users: Record<
  SeedUserKey,
  {
    phone: string;
    name: string;
    agent?: { slug: string; officeName: string; bio: string; cities: string[] };
  }
> = {
  agentNile: {
    phone: "+249911000001",
    name: "مكتب النيل للعقارات",
    agent: {
      slug: "nile-real-estate",
      officeName: "مكتب النيل للعقارات",
      bio: "مكتب عقاري في الخرطوم منذ 2009. بيع وإيجار الشقق والمنازل في الخرطوم وبحري، مع معاينة مجانية.",
      cities: ["khartoum", "bahri"],
    },
  },
  agentRedSea: {
    phone: "+249911000002",
    name: "عقارات البحر الأحمر",
    agent: {
      slug: "red-sea-properties",
      officeName: "عقارات البحر الأحمر",
      bio: "Real estate office in Port Sudan. Apartments, offices and shops near the port and the city centre.",
      cities: ["port-sudan"],
    },
  },
  ownerAhmed: { phone: "+249911000003", name: "أحمد عثمان" },
  ownerFatima: { phone: "+249911000004", name: "فاطمة محمد" },
};

export type SeedListing = {
  owner: SeedUserKey;
  city: string;
  hood: string;
  deal: DealType;
  type: PropertyType;
  title: string;
  description: string;
  price: number;
  currency: Currency;
  rooms?: number;
  area?: number;
  floor?: number;
  furnished?: boolean;
  electricity?: boolean;
  water?: boolean;
  parking?: boolean;
  verified?: boolean;
  pending?: boolean;
  daysAgo: number;
  photos: number;
};

export const listings: SeedListing[] = [
  {
    owner: "agentNile", city: "khartoum", hood: "riyadh", deal: "RENT", type: "APARTMENT",
    title: "شقة مفروشة 3 غرف في الرياض قرب شارع المشتل",
    description: "شقة واسعة في الطابق الثاني، 3 غرف نوم وصالة كبيرة ومطبخ مجهز. مولد كهربائي للعمارة وخزان مياه علوي. قريبة من المدارس والسوق.",
    price: 900, currency: "USD", rooms: 3, area: 160, floor: 2, furnished: true, electricity: true, water: true, parking: true, verified: true, daysAgo: 1, photos: 4,
  },
  {
    owner: "ownerAhmed", city: "omdurman", hood: "mulazmin", deal: "SALE", type: "HOUSE",
    title: "منزل للبيع في الملازمين — 400 متر",
    description: "منزل من طابق واحد على مساحة 400 متر مربع، 4 غرف وديوان وحوش واسع. الأوراق سليمة وجاهزة للتسجيل.",
    price: 120000, currency: "USD", rooms: 4, area: 400, water: true, parking: true, daysAgo: 2, photos: 3,
  },
  {
    owner: "agentRedSea", city: "port-sudan", hood: "deim-madina", deal: "RENT", type: "OFFICE",
    title: "Office space near Port Sudan city centre",
    description: "Ground floor office, 4 rooms plus reception, suitable for shipping and logistics companies. Generator and parking available.",
    price: 700, currency: "USD", rooms: 4, area: 120, floor: 0, electricity: true, parking: true, verified: true, daysAgo: 2, photos: 3,
  },
  {
    owner: "ownerFatima", city: "bahri", hood: "kafouri", deal: "RENT", type: "HOUSE",
    title: "فيلا دورين في كافوري مع حديقة",
    description: "فيلا من طابقين، 5 غرف نوم و3 حمامات، حديقة أمامية وموقف لسيارتين. خزان مياه ومولد كهرباء احتياطي.",
    price: 1500, currency: "USD", rooms: 5, area: 500, electricity: true, water: true, parking: true, daysAgo: 3, photos: 4,
  },
  {
    owner: "agentNile", city: "khartoum", hood: "amarat", deal: "SALE", type: "APARTMENT",
    title: "شقة تمليك في العمارات شارع 15",
    description: "شقة في عمارة حديثة، الطابق الرابع مع مصعد. 3 غرف و2 حمام، تشطيب ممتاز. مناسبة للسكن أو الاستثمار.",
    price: 85000, currency: "USD", rooms: 3, area: 140, floor: 4, electricity: true, water: true, verified: true, daysAgo: 3, photos: 3,
  },
  {
    owner: "ownerAhmed", city: "omdurman", hood: "thawra", deal: "SALE", type: "LAND",
    title: "قطعة أرض سكنية في الثورة الحارة 21",
    description: "قطعة أرض سكنية 300 متر مربع، شهادة بحث حديثة. قريبة من الشارع الرئيسي والخدمات.",
    price: 45000000, currency: "SDG", area: 300, daysAgo: 4, photos: 2,
  },
  {
    owner: "agentNile", city: "bahri", hood: "mazad", deal: "RENT", type: "APARTMENT",
    title: "شقة غرفتين في المزاد للإيجار الشهري",
    description: "شقة نظيفة في الطابق الأول، غرفتين وصالة. المياه متوفرة على مدار اليوم. مناسبة لأسرة صغيرة.",
    price: 650000, currency: "SDG", rooms: 2, area: 90, floor: 1, water: true, daysAgo: 5, photos: 3,
  },
  {
    owner: "agentRedSea", city: "port-sudan", hood: "salabona", deal: "RENT", type: "APARTMENT",
    title: "شقة مطلة على البحر في سلبونا",
    description: "شقة 3 غرف مع بلكونة مطلة على البحر الأحمر. مكيفات في كل الغرف ومولد للعمارة.",
    price: 1100, currency: "USD", rooms: 3, area: 150, floor: 3, furnished: true, electricity: true, water: true, verified: true, daysAgo: 5, photos: 4,
  },
  {
    owner: "ownerFatima", city: "khartoum", hood: "jabra", deal: "RENT", type: "SHOP",
    title: "محل تجاري على شارع الهواء في جبرة",
    description: "محل بواجهة زجاجية على شارع رئيسي، مساحة 40 متر مع حمام. مناسب لصيدلية أو بقالة.",
    price: 400000, currency: "SDG", area: 40, floor: 0, electricity: true, daysAgo: 6, photos: 2,
  },
  {
    owner: "agentNile", city: "khartoum", hood: "khartoum-2", deal: "RENT", type: "OFFICE",
    title: "مكتب إداري في الخرطوم 2",
    description: "مكتب من 3 غرف في عمارة إدارية، الطابق الثاني. موقف سيارات خاص ومولد كهرباء.",
    price: 600, currency: "USD", rooms: 3, area: 85, floor: 2, electricity: true, parking: true, daysAgo: 7, photos: 3,
  },
  {
    owner: "ownerAhmed", city: "omdurman", hood: "wad-nubawi", deal: "RENT", type: "HOUSE",
    title: "بيت للإيجار في ود نوباوي — 3 غرف",
    description: "بيت أرضي 3 غرف وحوش، قريب من الجامع والسوق. الكهرباء والمياه متوفرة.",
    price: 500000, currency: "SDG", rooms: 3, area: 250, water: true, daysAgo: 8, photos: 3,
  },
  {
    owner: "agentRedSea", city: "port-sudan", hood: "transit", deal: "SALE", type: "LAND",
    title: "Commercial land plot in Transit area",
    description: "600 m² commercial plot on a paved road, close to the port. Clean title deed.",
    price: 95000, currency: "USD", area: 600, daysAgo: 9, photos: 2,
  },
  {
    owner: "agentNile", city: "bahri", hood: "shambat", deal: "SALE", type: "HOUSE",
    title: "منزل دورين للبيع في شمبات",
    description: "منزل من طابقين، 6 غرف، قريب من جامعة الخرطوم كلية الزراعة. مناسب لأسرة كبيرة أو للاستثمار.",
    price: 150000, currency: "USD", rooms: 6, area: 450, water: true, parking: true, verified: true, daysAgo: 10, photos: 4,
  },
  {
    owner: "ownerFatima", city: "khartoum", hood: "taif", deal: "RENT", type: "APARTMENT",
    title: "استوديو مفروش في الطائف",
    description: "استوديو مفروش بالكامل مع مطبخ صغير وحمام. مناسب لشخص واحد أو طالب.",
    price: 350000, currency: "SDG", rooms: 0, area: 45, floor: 1, furnished: true, electricity: true, daysAgo: 11, photos: 3,
  },
  {
    owner: "ownerAhmed", city: "omdurman", hood: "mohandiseen", deal: "SALE", type: "APARTMENT",
    title: "شقة تمليك في المهندسين أم درمان",
    description: "شقة 3 غرف في الطابق الثالث، تشطيب حديث، قريبة من شارع الشنقيطي.",
    price: 60000, currency: "USD", rooms: 3, area: 130, floor: 3, water: true, daysAgo: 12, photos: 3,
  },
  {
    owner: "agentNile", city: "khartoum", hood: "manshiya", deal: "RENT", type: "HOUSE",
    title: "فيلا مفروشة في المنشية للإيجار",
    description: "فيلا راقية 4 غرف مع مسبح صغير وحديقة. مفروشة بالكامل ومناسبة للمنظمات والشركات.",
    price: 2000, currency: "USD", rooms: 4, area: 600, furnished: true, electricity: true, water: true, parking: true, verified: true, daysAgo: 13, photos: 4,
  },
  {
    owner: "agentRedSea", city: "port-sudan", hood: "mirghaniya", deal: "RENT", type: "SHOP",
    title: "محل في سوق المرغنية",
    description: "محل صغير في منطقة تجارية مزدحمة، مناسب للملابس أو الإلكترونيات.",
    price: 300, currency: "USD", area: 30, floor: 0, daysAgo: 14, photos: 2,
  },
  {
    owner: "ownerFatima", city: "bahri", hood: "halfaya", deal: "SALE", type: "LAND",
    title: "أرض زراعية سكنية في الحلفايا",
    description: "قطعة أرض 500 متر قريبة من النيل، صالحة للسكن. السعر قابل للتفاوض.",
    price: 60000000, currency: "SDG", area: 500, daysAgo: 15, photos: 2,
  },
  {
    owner: "agentNile", city: "khartoum", hood: "arkaweet", deal: "RENT", type: "APARTMENT",
    title: "شقة 4 غرف في أركويت مع موقف",
    description: "شقة كبيرة في الطابق الأرضي مع موقف سيارة خاص. 4 غرف و3 حمامات، خزان مياه وبئر.",
    price: 1200000, currency: "SDG", rooms: 4, area: 180, floor: 0, water: true, parking: true, daysAgo: 17, photos: 3,
  },
  {
    owner: "ownerAhmed", city: "omdurman", hood: "abbasiya", deal: "RENT", type: "SHOP",
    title: "دكان للإيجار في العباسية",
    description: "دكان على الشارع العام في العباسية، مناسب لأي نشاط تجاري.",
    price: 250000, currency: "SDG", area: 25, floor: 0, daysAgo: 19, photos: 2,
  },
  // Pending: shows up in the admin approval queue, not in search.
  {
    owner: "ownerFatima", city: "khartoum", hood: "sahafa", deal: "RENT", type: "APARTMENT",
    title: "شقة غرفتين في الصحافة زلط",
    description: "شقة جديدة لم تسكن، غرفتين وصالة، الطابق الثاني.",
    price: 550000, currency: "SDG", rooms: 2, area: 95, floor: 2, water: true, pending: true, daysAgo: 0, photos: 2,
  },
  {
    owner: "ownerAhmed", city: "bahri", hood: "safiya", deal: "SALE", type: "HOUSE",
    title: "منزل للبيع في الصافية مربع 7",
    description: "منزل 5 غرف على مساحة 350 متر، قريب من الخدمات.",
    price: 90000, currency: "USD", rooms: 5, area: 350, pending: true, daysAgo: 0, photos: 2,
  },
  {
    owner: "agentRedSea", city: "port-sudan", hood: "matar", deal: "RENT", type: "APARTMENT",
    title: "Furnished 2-bedroom apartment near the airport",
    description: "Fully furnished apartment, 2 bedrooms, air conditioning, backup generator. Monthly or yearly contract.",
    price: 800, currency: "USD", rooms: 2, area: 110, floor: 1, furnished: true, electricity: true, pending: true, daysAgo: 0, photos: 2,
  },
];
