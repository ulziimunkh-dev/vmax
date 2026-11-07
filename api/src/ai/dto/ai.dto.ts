export class AiChatDto {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export class GenerateDescriptionDto {
  type: string; // 'SALE' | 'RENT'
  category?: string; // 'APARTMENT', 'HOUSE', etc.
  district: string;
  khoroo?: string;
  location?: string;
  areaSqm: number;
  rooms?: number;
  floor?: number;
  totalFloors?: number;
  price?: number;
  highlights?: string[]; // e.g. ['Урагшаа харсан цонхтой', 'Бүрэн засвартай', 'Сургуульдаа ойр']
}

export class EstimatePriceDto {
  type: string; // 'SALE' | 'RENT'
  category?: string;
  district: string;
  khoroo?: string;
  areaSqm: number;
  price?: number;
}
