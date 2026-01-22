// constants.ts
import { Item, Customer, ProcessType, NO_LOT_ID } from './types';

// 初期工程マスタ (名前)
export const initialProcessNames = [
  '第一織場',
  '第二織場',
  '2F倉庫',
  '染工場',
  '起毛場',
  'ミシン工場',
  'ミシン場倉庫',
  '村田倉庫',
  '藤原運送'
];

// 初期の工程タイプ設定
export const initialProcessTypes: Record<string, ProcessType> = {
  '第一織場': 'WIP',
  '第二織場': 'WIP',
  '2F倉庫': 'WIP',
  '染工場': 'WIP',
  '起毛場': 'WIP',
  'ミシン工場': 'WIP',
  'ミシン場倉庫': 'BOXED',
  '村田倉庫': 'PRODUCT',
  '藤原運送': 'PRODUCT'
};

// 初期カテゴリマスタ
export const initialCategories = [
  'ウール',
  'コットン',
  '合成繊維',
  'シルク',
  'カシミヤ混',
  'その他'
];

// 初期顧客データ
export const initialCustomers: Customer[] = [
  { id: 1, name: '帝国ホテル様' },
  { id: 2, name: '百貨店共通' },
  { id: 3, name: '量販店A社' },
  { id: 4, name: '海外輸出用' },
  { id: 5, name: '株式会社ニトリ様' },
  { id: 6, name: 'イオン株式会社様' }
];

// 初期のサンプルデータ
export const initialData: Item[] = [
  {
    id: 1,
    code: 'WF-101',
    name: 'プレミアムウール毛布',
    customer: '帝国ホテル様',
    category: 'ウール',
    packaging: 'バラ',
    size: 'シングル',
    threshold: 10,
    targetStock: 50,
    productionLotSize: 20,
    price: 15000,
    processPrices: {
      '第一織場': 5000,
      '2F倉庫': 6000,
      '染工場': 9000,
      'ミシン工場': 12000
    },
    deadline: '2024-10-31',
    lots: [
      { lotNo: '23-A001', quantity: 20, process: '2F倉庫', receivedDate: '2023-10-01' },
      { lotNo: '23-B005', quantity: 25, process: '第一織場', receivedDate: '2023-11-15' },
      { lotNo: NO_LOT_ID, quantity: 45, process: '藤原運送', receivedDate: '2024-02-01' }
    ]
  },
  {
    id: 2,
    code: 'CT-204',
    name: 'オーガニックコットン肌掛け',
    customer: '百貨店共通',
    category: 'コットン',
    packaging: 'バラ',
    size: 'ダブル',
    threshold: 15,
    targetStock: 30,
    productionLotSize: 10,
    price: 8500,
    deadline: '',
    lots: [
      { lotNo: '24-C012', quantity: 8, process: 'ミシン工場', receivedDate: '2024-01-20' }
    ]
  },
  {
    id: 3,
    code: 'SY-009',
    name: '吸湿発熱フランネル毛布',
    customer: '量販店A社',
    category: '合成繊維',
    packaging: 'バラ',
    size: 'シングル',
    threshold: 20,
    targetStock: 150,
    productionLotSize: 50,
    price: 4980,
    deadline: '2025-05-15',
    lots: [
      { lotNo: '23-F001', quantity: 50, process: '村田倉庫', receivedDate: '2023-09-10' },
      { lotNo: '23-F002', quantity: 70, process: '藤原運送', receivedDate: '2023-10-05' }
    ]
  },
  {
    id: 4,
    code: 'CS-550',
    name: 'カシミヤ混高級ブランケット',
    customer: '海外輸出用',
    category: 'カシミヤ混',
    packaging: 'バラ',
    size: 'ハーフ',
    threshold: 5,
    targetStock: 10,
    productionLotSize: 5,
    price: 32000,
    deadline: '2024-12-25',
    lots: [
      { lotNo: '23-K001', quantity: 3, process: '2F倉庫', receivedDate: '2023-12-01' }
    ]
  },
  {
    id: 5,
    code: 'AL-001',
    name: 'アルパカ100% ストール',
    customer: '海外輸出用',
    category: 'その他',
    packaging: 'バラ',
    size: 'ハーフ',
    threshold: 5,
    targetStock: 20,
    productionLotSize: 10,
    price: 45000,
    deadline: '2024-12-10',
    lots: [
      { lotNo: '24-A001', quantity: 15, process: '2F倉庫', receivedDate: '2024-01-15' }
    ]
  },
  {
    id: 6,
    code: 'GIFT-W01',
    name: 'プレミアムウール ギフト箱入',
    customer: '帝国ホテル様',
    category: 'ウール',
    packaging: '箱入',
    size: 'シングル',
    threshold: 5,
    targetStock: 10,
    productionLotSize: 5,
    price: 18000,
    deadline: '',
    lots: []
  },
];