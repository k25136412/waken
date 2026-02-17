export const NO_LOT_ID = 'STOCK';

export interface Lot {
  lotNo: string;
  quantity: number;
  process: string;
  receivedDate: string;
}

export interface Item {
  id: number;
  code: string;
  name: string;
  customer: string;
  category: string;
  packaging: string;
  size: string;
  threshold: number;
  targetStock: number;
  productionLotSize: number;
  price: number;
  processPrices?: Record<string, number>;
  deadline: string;
  lots: Lot[];
}

export interface Customer {
  id: number;
  name: string;
}

export type ProcessType = 'WIP' | 'PRODUCT' | 'BOXED' | 'ALL';
export type SortOption = 'default' | 'code_asc' | 'stock_desc' | 'stock_asc' | 'deadline_asc';

export type AssemblySourceItem = {
  uid: string;
  itemId: string;
  lotNo: string;
  quantity: number;
  process: string;
};