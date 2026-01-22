// types.ts

export const NO_LOT_ID = 'STOCK'; // ロット管理しない場合のID

export interface Lot {
  lotNo: string;
  quantity: number;
  process: string; // 現在の工程（場所）
  receivedDate: string;
}

export interface Item {
  id: number;
  code: string; // 品番
  name: string; // 商品名
  customer: string; // 顧客名（取引先）
  category: string; // 素材カテゴリ
  packaging: string; // 荷姿 (バラ, 箱, セット)
  size: string;
  threshold: number; // 発注点
  targetStock: number; // 必要在庫数
  productionLotSize: number; // 生産ロット数
  price: number; // 標準単価（製品単価）
  processPrices?: Record<string, number>; // 工程別単価
  deadline: string; // 納期 (YYYY-MM-DD)
  lots: Lot[];
}

export interface Customer {
  id: number;
  name: string;
}

// 工程のタイプ定義
// WIP: 仕掛品, PRODUCT: 製品, BOXED: 箱入れ品, ALL: 全在庫
export type ProcessType = 'WIP' | 'PRODUCT' | 'BOXED' | 'ALL';

// 並び替えオプションの型定義
export type SortOption = 'default' | 'code_asc' | 'stock_desc' | 'stock_asc' | 'deadline_asc';

// 加工元アイテムの型定義
export type AssemblySourceItem = {
  uid: string; // 一意のID（削除用）
  itemId: string;
  lotNo: string;
  quantity: number;
  process: string;
};