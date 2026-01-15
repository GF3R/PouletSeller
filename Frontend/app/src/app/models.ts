export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  pouletSpezial: number;
  pouletSpezialStueck: number;
  poulet3kg: number;
  truten5kg: number;
  truten10kg: number;
  address: string;
  postalCode: string;
  city: string;
  umsatzTruten: number;
  umsatzPoulet: number;
  umsatzTotal: number;
  infoChannel: string;
  phone: string;
}

export interface CustomerRequest {
  firstName: string;
  lastName: string;
  pouletSpezial: number;
  pouletSpezialStueck: number;
  poulet3kg: number;
  truten5kg: number;
  truten10kg: number;
  address: string;
  postalCode: string;
  city: string;
  infoChannel: string;
  phone: string;
}

export interface InventoryData {
  poulet3kg: number;
  truten5kg: number;
  truten10kg: number;
  brustchen: number;
  oberschenkel: number;
  fluegel: number;
  unterschenkel: number;
}

export interface DiscountConfig {
  mode: 'NONE' | 'PERCENT' | 'ABS';
  value: number;
}

export interface SaleRequest {
  customerId: string;
  product: string;
  quantity: number;
  date: string;
  baseAmount: number;
  finalAmount: number;
  paymentMethod: string;
  note: string;
}

export interface FinanceEntry {
  id: string;
  receiptNumber: string;
  date: string;
  description: string;
  person: string;
  amount: number;
  paymentMethod: string;
  note: string;
  type: 'Income' | 'Expense';
}

export interface FinanceRequest {
  date: string;
  description: string;
  person: string;
  amount: number;
  paymentMethod: string;
  note: string;
}

export interface SaleResponse {
  customer: Customer;
  finance: FinanceEntry;
  inventory: InventoryData;
  quantity: number;
}
