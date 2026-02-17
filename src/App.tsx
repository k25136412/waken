import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Lot, Item, Customer, ProcessType, SortOption, AssemblySourceItem, NO_LOT_ID } from './types';
import { 
  Plus, Minus, Search, Package, AlertTriangle, Trash2, Save, X, 
  ChevronDown, ChevronUp, ClipboardList, ArrowRightLeft, Settings, 
  Truck, MapPin, Filter, LogOut, List, Tag, CheckSquare, Square,
  Database, Edit, TrendingUp, Factory, Box, Users, Building2, CheckCircle2, Calendar, JapaneseYen, Clock, PieChart, ArrowUpDown, AlertCircle, Maximize, Minimize, Blocks, Gift, Layers, Archive, Merge, Scissors
} from 'lucide-react';

// 定数定義
const NO_LOT_ID = 'STOCK'; // ロット管理しない場合のID

// 初期工程マスタ (名前)
const initialProcessNames = [
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
const initialProcessTypes: Record<string, ProcessType> = {
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
const initialCategories = [
  'ウール',
  'コットン',
  '合成繊維',
  'シルク',
  'カシミヤ混',
  'その他'
];

// 初期顧客データ
const initialCustomers: Customer[] = [
  { id: 1, name: '帝国ホテル様' },
  { id: 2, name: '百貨店共通' },
  { id: 3, name: '量販店A社' },
  { id: 4, name: '海外輸出用' },
  { id: 5, name: '株式会社ニトリ様' },
  { id: 6, name: 'イオン株式会社様' }
];

// 初期のサンプルデータ
const initialData: Item[] = [
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

const getToday = () => new Date().toISOString().split('T')[0];

const getDaysUntil = (dateStr: string) => {
  if (!dateStr) return null;
  const today = new Date(getToday());
  const target = new Date(dateStr);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 荷姿のバッジコンポーネント
const PackagingBadge = ({ type }: { type: string | undefined }) => {
  if (type === '箱入') {
    return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded border border-amber-200"><Box size={10} /> 箱入</span>;
  }
  if (type === 'セット') {
    return <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded border border-purple-200"><Gift size={10} /> セット</span>;
  }
  return <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded border border-slate-200">バラ</span>;
};

export default function App() {
  // ステート管理
  const [items, setItems] = useState<Item[]>(initialData);
  const [processes, setProcesses] = useState<string[]>(initialProcessNames);
  const [processTypes, setProcessTypes] = useState<Record<string, ProcessType>>(initialProcessTypes);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  
  // 画面表示ステート
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 検索・フィルター用ステート
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  
  const [selectedProcessFilter, setSelectedProcessFilter] = useState<string | null>(null);
  const [isLowStockFilterActive, setIsLowStockFilterActive] = useState(false);
  const [isDeadlineFilterActive, setIsDeadlineFilterActive] = useState(false);
  const [isRawMaterialShortageFilterActive, setIsRawMaterialShortageFilterActive] = useState(false);

  // 詳細表示用ステート
  const [viewingProcess, setViewingProcess] = useState<string | null>(null);
  const [viewingStockType, setViewingStockType] = useState<ProcessType | null>(null);
   
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [isSelectingItem, setIsSelectingItem] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
   
  // 一括操作用ステート
  const [selectedLots, setSelectedLots] = useState<Set<string>>(new Set());
  const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState(false);
  const [bulkTargetProcess, setBulkTargetProcess] = useState('');

  // モーダル管理
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isInventoryValuationOpen, setIsInventoryValuationOpen] = useState(false);
  const [isAssemblyModalOpen, setIsAssemblyModalOpen] = useState(false);
  
  // 設定用ステート
  const [activeSettingsTab, setActiveSettingsTab] = useState<'PROCESS' | 'CATEGORY'>('PROCESS');
  const [newProcessName, setNewProcessName] = useState('');
  const [newProcessType, setNewProcessType] = useState<ProcessType>('WIP');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');

  // 加工用ステート
  const [assemblySources, setAssemblySources] = useState<AssemblySourceItem[]>([
    { uid: 'init-1', itemId: '', lotNo: '', quantity: 1, process: '' }
  ]);
  const [assemblyTarget, setAssemblyTarget] = useState({
    targetItemId: '',
    targetQuantity: 1,
    process: '',
    newLotNo: '',
  });

  // 確認・アラートダイアログ用ステート
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    type: 'CONFIRM' | 'ALERT';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'ALERT',
    title: '',
    message: '',
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setDialogConfig({ isOpen: true, type: 'CONFIRM', title, message, onConfirm });
  };

  const showAlert = (title: string, message: string) => {
    setDialogConfig({ isOpen: true, type: 'ALERT', title, message });
  };

  const closeDialog = () => {
    setDialogConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleDialogConfirm = () => {
    if (dialogConfig.onConfirm) {
      dialogConfig.onConfirm();
    }
    closeDialog();
  };
   
  // 入出庫・移動処理用ステート
  const [transactionType, setTransactionType] = useState<'IN' | 'OUT' | 'MOVE'>('IN');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [transactionData, setTransactionData] = useState({
    lotNo: '',
    quantity: 0,
    process: '',
    targetProcess: '',
  });
  const [isLotIntegration, setIsLotIntegration] = useState(false);
   
  // 商品登録・編集用ステート
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<{
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
    deadline: string;
    processPrices: Record<string, number>;
  }>({
    code: '', name: '', customer: '', category: 'ウール', packaging: 'バラ', size: 'シングル', 
    threshold: 10, targetStock: 20, productionLotSize: 10, price: 0, deadline: '',
    processPrices: {}
  });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.log("Fullscreen not supported or blocked", e);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // ローカルストレージ
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('blanketInventory_v14_data');
      const savedProcesses = localStorage.getItem('blanketInventory_v14_processes');
      const savedProcessTypes = localStorage.getItem('blanketInventory_v14_processTypes');
      const savedCategories = localStorage.getItem('blanketInventory_v14_categories');
      const savedCustomers = localStorage.getItem('blanketInventory_v14_customers');
      
      if (savedData) setItems(JSON.parse(savedData));
      if (savedProcesses) setProcesses(JSON.parse(savedProcesses));
      if (savedProcessTypes) setProcessTypes(JSON.parse(savedProcessTypes));
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    } catch (e) {
      console.warn("LocalStorage access failed", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('blanketInventory_v14_data', JSON.stringify(items));
      localStorage.setItem('blanketInventory_v14_processes', JSON.stringify(processes));
      localStorage.setItem('blanketInventory_v14_processTypes', JSON.stringify(processTypes));
      localStorage.setItem('blanketInventory_v14_categories', JSON.stringify(categories));
      localStorage.setItem('blanketInventory_v14_customers', JSON.stringify(customers));
    } catch (e) {
      console.warn("LocalStorage write failed", e);
    }
  }, [items, processes, processTypes, categories, customers]);

  // ヘルパー関数群
  const calculateTotalStock = (item: Item) => {
    if (!item.lots) return 0;
    return item.lots.reduce((sum, lot) => sum + lot.quantity, 0);
  };

  const calculateStockByType = (item: Item, type: ProcessType) => {
    if (!item.lots) return 0;
    if (type === 'ALL') {
      return item.lots.reduce((sum, lot) => sum + lot.quantity, 0);
    }
    return item.lots
      .filter(lot => (processTypes[lot.process] || 'WIP') === type)
      .reduce((sum, lot) => sum + lot.quantity, 0);
  };
  
  // 製品と箱入れ(BOXED)を合算した「製品在庫」を計算する
  const calculateProductStock = (item: Item) => {
    if (!item.lots) return 0;
    return item.lots
      .filter(lot => {
        const type = processTypes[lot.process] || 'WIP';
        return type === 'PRODUCT' || type === 'BOXED';
      })
      .reduce((sum, lot) => sum + lot.quantity, 0);
  };

  const stockByProcess = items.reduce((acc, item) => {
    if (item.lots) {
      item.lots.forEach(lot => {
        acc[lot.process] = (acc[lot.process] || 0) + lot.quantity;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const deleteItem = (id: number) => {
    showConfirm('商品削除の確認', 'この商品をマスタから削除しますか？\n※関連する在庫データも全て削除されます。この操作は取り消せません。', () => {
      setItems(prev => prev.filter(item => item.id !== id));
    });
  };

  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProcessName && !processes.includes(newProcessName)) {
      setProcesses([...processes, newProcessName]);
      setProcessTypes({...processTypes, [newProcessName]: newProcessType});
      setNewProcessName('');
    }
  };

  const deleteProcess = (processName: string) => {
    showConfirm('工程削除の確認', `工程「${processName}」を削除してもよろしいですか？\n※この工程にある在庫データは「未定義」になります。`, () => {
      setProcesses(prev => prev.filter(p => p !== processName));
      const newTypes = { ...processTypes };
      delete newTypes[processName];
      setProcessTypes(newTypes);
    });
  };

  const updateProcessType = (processName: string, type: ProcessType) => {
    setProcessTypes(prev => ({...prev, [processName]: type}));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName && !categories.includes(newCategoryName)) {
      setCategories([...categories, newCategoryName]);
      setNewCategoryName('');
    }
  };
  
  const deleteCategory = (categoryName: string) => {
    showConfirm('カテゴリ削除の確認', `カテゴリ「${categoryName}」を削除しますか？`, () => {
      setCategories(prev => prev.filter(c => c !== categoryName));
    });
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomerName && !customers.some(c => c.name === newCustomerName)) {
      const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
      setCustomers([...customers, { id: newId, name: newCustomerName }]);
      setNewCustomerName('');
    }
  };

  const deleteCustomer = (id: number) => {
    showConfirm('顧客削除の確認', 'この顧客をマスタから削除しますか？', () => {
      setCustomers(prev => prev.filter(c => c.id !== id));
    });
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setItems(items.map(item => item.id === editingId ? { ...item, ...newItem, price: Number(newItem.price), threshold: Number(newItem.threshold), targetStock: Number(newItem.targetStock), productionLotSize: Number(newItem.productionLotSize), processPrices: newItem.processPrices } : item));
    } else {
      const id = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
      const itemToAdd: Item = { ...newItem, id, price: Number(newItem.price), threshold: Number(newItem.threshold), targetStock: Number(newItem.targetStock), productionLotSize: Number(newItem.productionLotSize), processPrices: newItem.processPrices, lots: [] };
      setItems([...items, itemToAdd]);
    }
    setIsItemModalOpen(false);
    resetItemForm();
  };

  const resetItemForm = () => {
    setNewItem({ code: '', name: '', customer: '', category: categories[0] || 'ウール', packaging: 'バラ', size: 'シングル', threshold: 10, targetStock: 20, productionLotSize: 10, price: 0, deadline: '', processPrices: {} });
    setEditingId(null);
  };

  const openEditModal = (item: Item) => {
    setNewItem({
      code: item.code,
      name: item.name,
      customer: item.customer || '',
      category: item.category,
      packaging: item.packaging || 'バラ',
      size: item.size,
      threshold: item.threshold,
      targetStock: item.targetStock,
      productionLotSize: item.productionLotSize || 10,
      price: item.price,
      deadline: item.deadline || '',
      processPrices: item.processPrices ? { ...item.processPrices } : {}
    });
    setEditingId(item.id);
    setIsItemModalOpen(true);
  };

  const openNewItemModal = () => {
    resetItemForm();
    setIsItemModalOpen(true);
  };

  const openStockModal = (item: Item, type: 'IN' | 'OUT' | 'MOVE', initialLot?: Partial<Lot>) => {
    setSelectedItem(item);
    setTransactionType(type);
    setIsLotIntegration(false);
    let defaultProcess = processes[0];
    let defaultLotNo = '';
    if (initialLot) {
        if (initialLot.process) defaultProcess = initialLot.process;
        if (initialLot.lotNo) defaultLotNo = initialLot.lotNo;
    } else {
        if (type !== 'IN' && item.lots.length > 0) {
            const firstActiveLot = item.lots.find(l => l.quantity > 0);
            if (firstActiveLot) {
                defaultLotNo = firstActiveLot.lotNo;
                defaultProcess = firstActiveLot.process;
            }
        }
    }
    if (defaultLotNo === NO_LOT_ID) {
        setIsLotIntegration(true);
    }
    setTransactionData({
      lotNo: defaultLotNo,
      quantity: 0,
      process: defaultProcess,
      targetProcess: processes.length > 1 ? processes[1] : processes[0]
    });
    setIsStockModalOpen(true);
  };

  const addAssemblySource = () => {
    setAssemblySources([
      ...assemblySources,
      { uid: crypto.randomUUID(), itemId: '', lotNo: '', quantity: 1, process: '' }
    ]);
  };

  const removeAssemblySource = (uid: string) => {
    if (assemblySources.length <= 1) return;
    setAssemblySources(assemblySources.filter(s => s.uid !== uid));
  };

  const updateAssemblySource = (uid: string, field: keyof AssemblySourceItem, value: string | number) => {
    setAssemblySources(prev => prev.map(s => {
      if (s.uid === uid) {
        const newSource = { ...s, [field]: value };
        if (field === 'itemId') {
          newSource.lotNo = '';
          newSource.process = '';
        }
        if (field === 'lotNo') {
           const item = items.find(i => i.id === Number(newSource.itemId));
           const lot = item?.lots.find(l => l.lotNo === value && l.quantity > 0);
           newSource.process = lot ? lot.process : '';
        }
        return newSource;
      }
      return s;
    }));
  };

  const handleAssembly = (e: React.FormEvent) => {
    e.preventDefault();
    const { targetItemId, targetQuantity, process } = assemblyTarget;
    // ロットNoは自動でSTOCKにする
    const newLotNo = NO_LOT_ID;

    if (!targetItemId || !process) {
      showAlert('入力エラー', '完成品の情報をすべて入力してください。');
      return;
    }
    if (assemblySources.some(s => !s.itemId || !s.lotNo || s.quantity <= 0)) {
      showAlert('入力エラー', '加工元の情報を正しく入力してください。');
      return;
    }
    if (Number(targetQuantity) <= 0) {
      showAlert('入力エラー', '完成数量は1以上を指定してください。');
      return;
    }
    for (const source of assemblySources) {
      const item = items.find(i => i.id === Number(source.itemId));
      const lot = item?.lots.find(l => l.lotNo === source.lotNo && l.process === source.process);
      if (!lot || lot.quantity < source.quantity) {
        showAlert('在庫不足', `加工元の在庫が不足しています。\n${item?.name} (Lot:${source.lotNo})`);
        return;
      }
    }
    setItems(prevItems => {
      let newItems = JSON.parse(JSON.stringify(prevItems)) as Item[];
      assemblySources.forEach(source => {
        const itemIdx = newItems.findIndex(i => i.id === Number(source.itemId));
        if (itemIdx > -1) {
          const lotIdx = newItems[itemIdx].lots.findIndex(l => l.lotNo === source.lotNo && l.process === source.process);
          if (lotIdx > -1) {
            newItems[itemIdx].lots[lotIdx].quantity -= Number(source.quantity);
          }
        }
      });
      const targetIdx = newItems.findIndex(i => i.id === Number(targetItemId));
      if (targetIdx > -1) {
        const existingLotIdx = newItems[targetIdx].lots.findIndex(l => l.lotNo === newLotNo && l.process === process);
        if (existingLotIdx > -1) {
           newItems[targetIdx].lots[existingLotIdx].quantity += Number(targetQuantity);
        } else {
           newItems[targetIdx].lots.push({
             lotNo: newLotNo,
             quantity: Number(targetQuantity),
             process: process,
             receivedDate: getToday()
           });
        }
      }
      return newItems;
    });
    setIsAssemblyModalOpen(false);
    setAssemblySources([{ uid: crypto.randomUUID(), itemId: '', lotNo: '', quantity: 1, process: '' }]);
    setAssemblyTarget({
      targetItemId: '',
      targetQuantity: 1,
      process: '',
      newLotNo: '', // unused
    });
    showAlert('完了', '加工・セット組み処理が完了しました。\n在庫が更新されました。');
  };

  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const { lotNo, quantity, process, targetProcess } = transactionData;
    const amount = Number(quantity);
    if (amount <= 0) return;

    let srcLotNo = lotNo;
    let destLotNo = lotNo;

    if (transactionType === 'IN') {
        if (isLotIntegration) destLotNo = NO_LOT_ID;
        else if (!destLotNo) {
            showAlert('入力エラー', 'ロットNoを入力してください。');
            return;
        }
    } else if (transactionType === 'MOVE') {
        const targetType = processTypes[targetProcess];
        if (targetType === 'PRODUCT' || targetType === 'BOXED') {
            destLotNo = NO_LOT_ID;
        } else if (isLotIntegration) {
            destLotNo = NO_LOT_ID;
        }
    }
    if (transactionType === 'OUT' || transactionType === 'MOVE') {
      const targetItem = items.find(i => i.id === selectedItem.id);
      const targetLot = targetItem?.lots.find(l => l.lotNo === srcLotNo && l.process === process);
      if (!targetLot) {
        showAlert('エラー', '指定された条件の在庫が見つかりません。');
        return;
      }
      if (targetLot.quantity < amount) {
        showAlert('在庫不足', `指定場所の在庫は ${targetLot.quantity}枚 です。出庫できません。`);
        return;
      }
    }
    
    if (transactionType === 'MOVE' && process === targetProcess) {
       showAlert('エラー', '移動元と移動先が同じです。');
       return;
    }

    setItems(items.map(item => {
      if (item.id !== selectedItem.id) return item;
      let newLots = [...item.lots];
      if (transactionType === 'IN') {
        const existingIdx = newLots.findIndex(l => l.lotNo === destLotNo && l.process === process);
        if (existingIdx >= 0) {
          newLots[existingIdx] = { ...newLots[existingIdx], quantity: newLots[existingIdx].quantity + amount };
        } else {
          newLots.push({
            lotNo: destLotNo,
            quantity: amount,
            process,
            receivedDate: getToday()
          });
        }
      } else if (transactionType === 'OUT') {
        const existingIdx = newLots.findIndex(l => l.lotNo === srcLotNo && l.process === process);
        if (existingIdx >= 0) {
          const currentQty = newLots[existingIdx].quantity;
          newLots[existingIdx] = { ...newLots[existingIdx], quantity: currentQty - amount };
        }
      } else if (transactionType === 'MOVE') {
        const srcIdx = newLots.findIndex(l => l.lotNo === srcLotNo && l.process === process);
        const sourceLot = newLots[srcIdx];
        newLots[srcIdx] = { ...sourceLot, quantity: sourceLot.quantity - amount };
        const destIdx = newLots.findIndex(l => l.lotNo === destLotNo && l.process === targetProcess);
        if (destIdx >= 0) {
          newLots[destIdx] = { ...newLots[destIdx], quantity: newLots[destIdx].quantity + amount };
        } else {
          newLots.push({
            lotNo: destLotNo,
            quantity: amount,
            process: targetProcess,
            receivedDate: sourceLot.receivedDate
          });
        }
      }
      return { ...item, lots: newLots };
    }));

    setIsStockModalOpen(false);
    setIsSelectingItem(false);
  };

  const handleBulkMove = () => {
    if (!viewingProcess || !bulkTargetProcess) return;
    if (viewingProcess === bulkTargetProcess) {
      showAlert('エラー', '移動元と移動先が同じです。');
      return;
    }

    setItems(prevItems => prevItems.map(item => {
      let newLots = [...item.lots];
      const relevantSelectedLots = newLots.filter(lot => 
        lot.process === viewingProcess && 
        selectedLots.has(`${item.id}-${lot.lotNo}`)
      );

      if (relevantSelectedLots.length === 0) return item;

      relevantSelectedLots.forEach(sourceLot => {
        const moveQuantity = sourceLot.quantity;
        if (moveQuantity <= 0) return;

        const srcIdx = newLots.findIndex(l => l === sourceLot);
        if (srcIdx >= 0) {
          newLots[srcIdx] = { ...sourceLot, quantity: 0 }; 
        }

        const targetType = processTypes[bulkTargetProcess];
        const destLotNo = (targetType === 'PRODUCT' || targetType === 'BOXED') ? NO_LOT_ID : sourceLot.lotNo;

        const destIdx = newLots.findIndex(l => l.lotNo === destLotNo && l.process === bulkTargetProcess);
        if (destIdx >= 0) {
          newLots[destIdx] = { 
            ...newLots[destIdx], 
            quantity: newLots[destIdx].quantity + moveQuantity 
          };
        } else {
          newLots.push({
            lotNo: destLotNo,
            quantity: moveQuantity,
            process: bulkTargetProcess,
            receivedDate: sourceLot.receivedDate 
          });
        }
      });

      return { ...item, lots: newLots };
    }));

    setSelectedLots(new Set());
    setIsBulkMoveModalOpen(false);
    setBulkTargetProcess('');
  };

  // フィルタリングとソート
  const filteredItems = items.filter(item => {
    const lowerSearch = searchQuery.toLowerCase();
    const matchesSearch = 
        searchQuery === '' ||
        item.name.toLowerCase().includes(lowerSearch) ||
        item.code.toLowerCase().includes(lowerSearch) ||
        item.category.toLowerCase().includes(lowerSearch) ||
        item.lots.some(lot => lot.lotNo.toLowerCase().includes(lowerSearch));

    const matchesCustomer = 
        selectedCustomerFilter === '' ||
        item.customer === selectedCustomerFilter;

    const matchesProcess = selectedProcessFilter 
      ? item.lots.some(lot => lot.process === selectedProcessFilter && lot.quantity > 0)
      : true;

    // 在庫不足判定で calculateProductStock を使用
    const productStock = calculateProductStock(item);
    const matchesLowStock = isLowStockFilterActive 
      ? productStock <= item.threshold 
      : true;
    
    // 生地不足（全在庫が目標未満）
    const totalHeld = calculateStockByType(item, 'ALL');
    const matchesRawMaterialShortage = isRawMaterialShortageFilterActive ? (item.targetStock - totalHeld > 0) : true;

    const daysUntilDeadline = item.deadline ? getDaysUntil(item.deadline) : null;
    const matchesDeadlineAlert = isDeadlineFilterActive
      ? (daysUntilDeadline !== null && daysUntilDeadline <= 7)
      : true;

    return matchesSearch && matchesCustomer && matchesProcess && matchesLowStock && matchesDeadlineAlert && matchesRawMaterialShortage;
  }).sort((a, b) => {
    switch (sortOption) {
      case 'code_asc':
        return a.code.localeCompare(b.code);
      case 'stock_desc':
        return calculateProductStock(b) - calculateProductStock(a);
      case 'stock_asc':
        return calculateProductStock(a) - calculateProductStock(b);
      case 'deadline_asc':
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      default:
        return 0;
    }
  });

  const viewingProcessInventory = viewingProcess ? items.flatMap(item => 
    item.lots
      .filter(lot => lot.process === viewingProcess && lot.quantity > 0)
      .map(lot => ({ item, lot, key: `${item.id}-${lot.lotNo}` }))
  ) : [];
  viewingProcessInventory.sort((a, b) => a.item.code.localeCompare(b.item.code) || a.lot.lotNo.localeCompare(b.lot.lotNo));

  const viewingTypeInventory = viewingStockType ? items.flatMap(item => {
    const stock = calculateStockByType(item, viewingStockType);
    if (stock > 0) {
      return [{ item, stock }];
    }
    return [];
  }) : [];
  viewingTypeInventory.sort((a, b) => a.item.code.localeCompare(b.item.code));

  const toggleLotSelection = (key: string) => {
    const newSelection = new Set(selectedLots);
    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }
    setSelectedLots(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedLots.size === viewingProcessInventory.length) {
      setSelectedLots(new Set());
    } else {
      const newSelection = new Set<string>();
      viewingProcessInventory.forEach(entry => newSelection.add(entry.key));
      setSelectedLots(newSelection);
    }
  };

  const totalStock = items.reduce((acc, item) => acc + calculateTotalStock(item), 0);
  const totalWIP = items.reduce((acc, item) => acc + calculateStockByType(item, 'WIP'), 0);
  const totalProduct = items.reduce((acc, item) => acc + calculateStockByType(item, 'PRODUCT'), 0);
  const totalBoxed = items.reduce((acc, item) => acc + calculateStockByType(item, 'BOXED'), 0);
  
  const lowStockCount = items.filter(item => calculateProductStock(item) <= item.threshold).length;
  
  const rawMaterialShortageCount = items.filter(item => {
      const totalHeld = calculateStockByType(item, 'ALL');
      return item.targetStock - totalHeld > 0;
  }).length;

  const deadlineAlertCount = items.filter(item => {
    const days = item.deadline ? getDaysUntil(item.deadline) : null;
    return days !== null && days <= 7;
  }).length;

  const inventoryValue = items.reduce((total, item) => {
      const itemStockValue = item.lots.reduce((lotTotal, lot) => {
        const unitPrice = item.processPrices?.[lot.process] ?? item.price;
        return lotTotal + (lot.quantity * unitPrice);
      }, 0);
      return total + itemStockValue;
    }, 0);
  const valuationByProcess = processes.reduce((acc, process) => {
    const value = items.reduce((itemSum, item) => {
      const quantity = item.lots.filter(l => l.process === process).reduce((q, l) => q + l.quantity, 0);
      const price = item.processPrices?.[process] ?? item.price;
      return itemSum + (quantity * price);
    }, 0);
    acc[process] = value;
    return acc;
  }, {} as Record<string, number>);

  const closeProcessModal = () => {
    setViewingProcess(null);
    setIsSelectingItem(false);
    setItemSearchTerm('');
    setSelectedLots(new Set());
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCustomerFilter('');
    setSortOption('default');
    
    setSelectedProcessFilter(null);
    setIsLowStockFilterActive(false);
    setIsDeadlineFilterActive(false);
    setIsRawMaterialShortageFilterActive(false);
  };

  const handleProcessPriceChange = (process: string, value: string) => {
    setNewItem(prev => ({
      ...prev,
      processPrices: {
        ...prev.processPrices,
        [process]: Number(value)
      }
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* 1. カスタム確認・アラートダイアログ (最前面 z-9999) */}
      {dialogConfig.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" style={{zIndex: 9999}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
            <div className={`px-6 py-4 flex items-center gap-2 text-white ${dialogConfig.type === 'CONFIRM' ? 'bg-indigo-600' : 'bg-red-500'}`}>
              {dialogConfig.type === 'CONFIRM' ? <AlertCircle size={24} /> : <AlertTriangle size={24} />}
              <h2 className="font-bold text-lg">{dialogConfig.title}</h2>
            </div>
            <div className="p-6">
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{dialogConfig.message}</p>
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={closeDialog}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  {dialogConfig.type === 'CONFIRM' ? 'キャンセル' : '閉じる'}
                </button>
                {dialogConfig.type === 'CONFIRM' && (
                  <button 
                    type="button"
                    onClick={handleDialogConfirm}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md"
                  >
                    実行する
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ヘッダー (z-20) */}
      {/* ヘッダー */}
      <Header 
  isFullscreen={isFullscreen}
  toggleFullscreen={toggleFullscreen}
  setIsAssemblyModalOpen={setIsAssemblyModalOpen}
  setIsInventoryValuationOpen={setIsInventoryValuationOpen}
  setIsSettingsOpen={setIsSettingsOpen}
  setIsCustomerModalOpen={setIsCustomerModalOpen}
  setIsMasterModalOpen={setIsMasterModalOpen}
  openNewItemModal={openNewItemModal}
/>      
      {/* 3. メインコンテンツ */}
      <main className="w-full px-4 py-6 md:py-8">
        {/* ダッシュボード */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* 1. 総在庫 */}
          <button type="button" onClick={() => setViewingStockType('ALL')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between cursor-pointer hover:bg-slate-50 transition-colors active:scale-95 text-left">
            <h3 className="text-slate-500 text-sm font-medium flex items-center gap-2"><Package size={16} /> 総在庫枚数</h3>
            <p className="text-2xl lg:text-3xl font-bold mt-1 text-slate-700">{totalStock.toLocaleString()} <span className="text-sm font-normal text-slate-400">枚</span></p>
          </button>
          
          {/* 2. 内訳 */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center gap-2">
            <button type="button" onClick={() => setViewingStockType('WIP')} className="flex justify-between items-center border-b border-slate-100 pb-2 cursor-pointer hover:bg-slate-50 transition-colors rounded px-2 -mx-2 text-left w-full">
              <span className="text-sm font-medium text-slate-500 flex items-center gap-1"><Factory size={14}/> 仕掛品</span>
              <span className="font-bold text-lg text-indigo-600 flex items-center gap-1">
                {totalWIP.toLocaleString()} <span className="text-xs text-slate-400">枚</span>
                <List size={14} className="text-slate-300" />
              </span>
            </button>
            <button type="button" onClick={() => setViewingStockType('PRODUCT')} className="flex justify-between items-center pt-1 cursor-pointer hover:bg-slate-50 transition-colors rounded px-2 -mx-2 text-left w-full">
              <span className="text-sm font-medium text-slate-500 flex items-center gap-1"><Box size={14}/> 製品</span>
              <span className="font-bold text-lg text-emerald-600 flex items-center gap-1">
                {totalProduct.toLocaleString()} <span className="text-xs text-slate-400">枚</span>
                <List size={14} className="text-slate-300" />
              </span>
            </button>
            <button type="button" onClick={() => setViewingStockType('BOXED')} className="flex justify-between items-center pt-1 cursor-pointer hover:bg-slate-50 transition-colors rounded px-2 -mx-2 text-left w-full">
              <span className="text-sm font-medium text-slate-500 flex items-center gap-1"><Archive size={14}/> 箱入れ</span>
              <span className="font-bold text-lg text-amber-600 flex items-center gap-1">
                {totalBoxed.toLocaleString()} <span className="text-xs text-slate-400">枚</span>
                <List size={14} className="text-slate-300" />
              </span>
            </button>
          </div>
          
          {/* 3. 納期アラート */}
          <button type="button" onClick={() => setIsDeadlineFilterActive(!isDeadlineFilterActive)} className={`p-4 rounded-xl shadow-sm border flex flex-col justify-between cursor-pointer transition-all active:scale-95 text-left ${isDeadlineFilterActive ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-400 shadow-md' : deadlineAlertCount > 0 ? 'bg-rose-50 border-rose-200 hover:bg-rose-100' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
            <h3 className={`text-sm font-medium flex items-center gap-2 ${isDeadlineFilterActive ? 'text-rose-800' : 'text-slate-500'}`}>
              <Clock size={16} className={isDeadlineFilterActive ? 'text-rose-600' : deadlineAlertCount > 0 ? 'text-rose-500' : 'text-slate-300'} />
              納期アラート（7日以内）
            </h3>
            <p className={`text-2xl lg:text-3xl font-bold mt-1 ${deadlineAlertCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              {deadlineAlertCount} <span className={`text-sm font-normal ${isDeadlineFilterActive ? 'text-rose-700' : 'text-slate-400'}`}>件</span>
            </p>
          </button>
          
          {/* 4. 製品不足アラート */}
          <button type="button" onClick={() => setIsLowStockFilterActive(!isLowStockFilterActive)} className={`p-4 rounded-xl shadow-sm border flex flex-col justify-between cursor-pointer transition-all active:scale-95 text-left ${isLowStockFilterActive ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400 shadow-md' : lowStockCount > 0 ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
            <h3 className={`text-sm font-medium flex items-center gap-2 ${isLowStockFilterActive ? 'text-amber-800' : 'text-slate-500'}`}>
              <AlertTriangle size={16} className={isLowStockFilterActive ? 'text-amber-600' : lowStockCount > 0 ? 'text-amber-500' : 'text-slate-300'} />
              要補充（製品不足）
            </h3>
            <p className={`text-2xl lg:text-3xl font-bold mt-1 ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
              {lowStockCount} <span className={`text-sm font-normal ${isLowStockFilterActive ? 'text-amber-700' : 'text-slate-400'}`}>品目</span>
            </p>
          </button>

          {/* 5. 生地不足アラート */}
          <button type="button" onClick={() => setIsRawMaterialShortageFilterActive(!isRawMaterialShortageFilterActive)} className={`p-4 rounded-xl shadow-sm border flex flex-col justify-between cursor-pointer transition-all active:scale-95 text-left ${isRawMaterialShortageFilterActive ? 'bg-purple-100 border-purple-400 ring-2 ring-purple-400 shadow-md' : rawMaterialShortageCount > 0 ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
            <h3 className={`text-sm font-medium flex items-center gap-2 ${isRawMaterialShortageFilterActive ? 'text-purple-800' : 'text-slate-500'}`}>
              <Scissors size={16} className={isRawMaterialShortageFilterActive ? 'text-purple-600' : rawMaterialShortageCount > 0 ? 'text-purple-500' : 'text-slate-300'} />
              生地不足（要投入）
            </h3>
            <p className={`text-2xl lg:text-3xl font-bold mt-1 ${rawMaterialShortageCount > 0 ? 'text-purple-600' : 'text-slate-700'}`}>
              {rawMaterialShortageCount} <span className={`text-sm font-normal ${isRawMaterialShortageFilterActive ? 'text-purple-700' : 'text-slate-400'}`}>品目</span>
            </p>
          </button>
        </div>

        {/* 工程別在庫サマリ */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-600 font-bold flex items-center gap-2">
              <MapPin size={20} className="text-indigo-500" />
              工程別在庫サマリ
            </h3>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded"><span className="w-2 h-2 rounded-full bg-slate-400"></span> 仕掛 (WIP)</span>
              <span className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> 製品 (Product)</span>
              <span className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 箱入れ (Boxed)</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {processes.map(process => {
              const count = stockByProcess[process] || 0;
              const type = processTypes[process] || 'WIP';
              return (
                <button 
                  type="button"
                  key={process} 
                  onClick={() => setViewingProcess(process)}
                  className={`p-4 rounded-lg shadow-sm border transition-all cursor-pointer relative overflow-hidden group text-left
                    bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md hover:bg-indigo-50
                    ${count === 0 ? 'opacity-70' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${type === 'PRODUCT' ? 'bg-indigo-500' : type === 'BOXED' ? 'bg-amber-500' : 'bg-slate-400'}`} title={type === 'PRODUCT' ? '製品工程' : type === 'BOXED' ? '箱入れ工程' : '仕掛工程'}></span>
                      <div className="text-xs font-medium truncate text-slate-600 group-hover:text-indigo-700" title={process}>
                        {process}
                      </div>
                    </div>
                    <List size={14} className="text-slate-300 group-hover:text-indigo-500 shrink-0" />
                  </div>
                  <div className={`text-xl font-bold ${count > 0 ? 'text-slate-800' : 'text-slate-400'}`}>
                    {count.toLocaleString()} <span className="text-xs font-normal text-slate-400">枚</span>
                  </div>
                  {count > 0 && (
                    <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${type === 'PRODUCT' ? 'bg-indigo-500' : type === 'BOXED' ? 'bg-amber-500' : 'bg-slate-400'}`}
                        style={{ width: `${Math.min(100, (count / totalStock) * 100)}%` }}
                      ></div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-indigo-900 bg-opacity-0 group-hover:bg-opacity-5 transition-all pointer-events-none"></div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 mt-2 text-right">※ カードをクリックするとその工程の在庫詳細一覧がポップアップします</p>
        </div>

        {/* 検索とリスト */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* ... (テーブル部分) ... */}
           {/* 省略せず記述 */}
          <div className={`p-4 border-b transition-colors flex flex-col md:flex-row items-start md:items-center gap-4 ${isLowStockFilterActive ? 'bg-amber-50 border-amber-100' : isDeadlineFilterActive ? 'bg-rose-50 border-rose-100' : isRawMaterialShortageFilterActive ? 'bg-purple-50 border-purple-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className="flex-1 w-full md:max-w-4xl flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="品番、商品名を検索..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative w-full md:w-64">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <select
                  className="w-full pl-10 pr-8 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                  value={selectedCustomerFilter}
                  onChange={(e) => setSelectedCustomerFilter(e.target.value)}
                >
                  <option value="">全ての顧客</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
              </div>
               <div className="relative">
                 <select
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-600 font-medium appearance-none pr-8 cursor-pointer"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                 >
                    <option value="default">並び替え: 標準</option>
                    <option value="code_asc">品番順 (A-Z)</option>
                    <option value="stock_desc">製品在庫が多い順</option>
                    <option value="stock_asc">製品在庫が少ない順</option>
                    <option value="deadline_asc">納期が近い順</option>
                 </select>
                 <ArrowUpDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
               </div>
            </div>
             
            <div className="flex items-center gap-2 text-xs ml-auto flex-wrap justify-end">
              {isLowStockFilterActive ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-amber-200">
                    <AlertTriangle size={14} /> 製品不足のみ
                  </span>
                  <button type="button" onClick={clearFilters} className="text-slate-500 hover:text-slate-700 underline">解除</button>
                </div>
              ) : isDeadlineFilterActive ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-700 bg-rose-100 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-rose-200">
                    <Clock size={14} /> 納期アラートのみ
                  </span>
                  <button type="button" onClick={clearFilters} className="text-slate-500 hover:text-slate-700 underline">解除</button>
                </div>
              ) : isRawMaterialShortageFilterActive ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-lg flex items-center gap-1 border border-purple-200">
                    <Scissors size={14} /> 生地不足のみ
                  </span>
                  <button type="button" onClick={clearFilters} className="text-slate-500 hover:text-slate-700 underline">解除</button>
                </div>
              ) : selectedProcessFilter ? (
                 <div className="flex items-center gap-2">
                   <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded flex items-center gap-1">
                     <MapPin size={12} /> 「{selectedProcessFilter}」在庫
                   </span>
                   <button type="button" onClick={clearFilters} className="text-slate-500 hover:text-slate-700"><X size={12} /></button>
                 </div>
              ) : null}
              
              {(searchQuery || selectedCustomerFilter || sortOption !== 'default' || isLowStockFilterActive || isDeadlineFilterActive || isRawMaterialShortageFilterActive || selectedProcessFilter) && (
                 <button type="button" onClick={clearFilters} className="text-slate-400 hover:text-slate-600 flex items-center gap-1">
                   <X size={12} /> 条件クリア
                 </button>
              )}
            </div>
          </div>
          
          {/* ... (以下のテーブル部分は前回と同じなので省略なしで記述) ... */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold w-12"></th>
                  <th className="p-4 font-semibold w-64">品番 / 商品名 / 納期</th>
                  <th className="p-4 font-semibold w-48">顧客 / カテゴリ</th>
                  <th className="p-4 font-semibold w-[500px]">在庫状況</th>
                  <th className="p-4 font-semibold text-center w-20">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const productStock = calculateProductStock(item);
                    const wipStock = calculateStockByType(item, 'WIP');
                    const isExpanded = expandedItemId === item.id;
                    const replenishmentNeeded = Math.max(0, item.targetStock - productStock);
                    
                    // 生地不足（投入必要）の計算: 必要数 - (製品 + 仕掛 + 箱入)
                    const totalHeldStock = calculateStockByType(item, 'ALL');
                    const rawMaterialShortage = Math.max(0, item.targetStock - totalHeldStock);
                    
                    // 納期計算
                    const daysUntil = item.deadline ? getDaysUntil(item.deadline) : null;
                    let deadlineColor = "text-slate-600 bg-slate-100";
                    let deadlineText = item.deadline;
                    let deadlineIcon = <Calendar size={12} />;

                    if (daysUntil !== null) {
                        if (daysUntil < 0) {
                            deadlineColor = "text-white bg-red-600";
                            deadlineText = `期限切れ (${Math.abs(daysUntil)}日超過)`;
                            deadlineIcon = <AlertTriangle size={12} />;
                        } else if (daysUntil <= 7) {
                            deadlineColor = "text-amber-800 bg-amber-100 border border-amber-200";
                            deadlineText = `あと ${daysUntil} 日`;
                            deadlineIcon = <Clock size={12} />;
                        } else if (daysUntil <= 30) {
                            deadlineColor = "text-blue-800 bg-blue-50 border border-blue-100";
                            deadlineText = `あと ${daysUntil} 日`;
                        }
                    }
                    
                    // 在庫状況のステータス計算
                    const fulfillmentRate = item.targetStock > 0 ? (productStock / item.targetStock) * 100 : 100;
                    let stockStatusColor = 'bg-emerald-500';
                    if (fulfillmentRate < 50) stockStatusColor = 'bg-red-500';
                    else if (fulfillmentRate < 100) stockStatusColor = 'bg-amber-400';

                    return (
                      <React.Fragment key={item.id}>
                        <tr 
                          className={`hover:bg-slate-50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50' : ''}`}
                          onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                        >
                          <td className="p-4 text-slate-400 text-center align-top pt-5">
                            {expandedItemId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-lg text-indigo-700 flex items-center gap-1">
                                  <Tag size={16} />
                                  {item.code}
                                </span>
                                <PackagingBadge type={item.packaging} />
                                <span className="text-xs text-slate-400">ID: {String(item.id).padStart(4, '0')}</span>
                              </div>
                              
                              <div className="font-bold text-sm text-slate-800">{item.name}</div>
                              
                              {item.deadline && (
                                <div className={`mt-1 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded w-fit ${deadlineColor}`}>
                                  {deadlineIcon} {deadlineText}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex flex-col gap-2">
                              {item.customer && (
                                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 text-xs w-fit">
                                  <Users size={10} /> {item.customer}
                                </span>
                              )}
                              <div className="flex gap-1 flex-wrap text-xs">
                                <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                  {item.category}
                                </span>
                                <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                  {item.size}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="w-full pr-4">
                              <div className="flex items-center gap-6 mb-3">
                                {/* メイン：製品在庫 */}
                                <div className="flex-none min-w-[80px]">
                                  <div className="text-xs text-slate-500 mb-1 flex items-center gap-1 font-bold"><Box size={14}/> 製品在庫</div>
                                  <div className={`text-2xl font-bold leading-none ${productStock <= item.threshold ? 'text-red-600' : 'text-slate-800'}`}>
                                    {productStock.toLocaleString()} <span className="text-sm font-normal text-slate-400">枚</span>
                                  </div>
                                </div>

                                {/* サブ：仕掛・必要数 */}
                                <div className="flex flex-1 gap-6 border-l-2 border-slate-100 pl-6 py-0.5">
                                  <div>
                                    <div className="text-xs text-slate-400 mb-0.5 flex items-center gap-1"><Factory size={12}/> 仕掛</div>
                                    <div className="text-base font-semibold text-slate-600 leading-none">
                                      {wipStock.toLocaleString()}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-slate-400 mb-0.5">必要数</div>
                                    <div className="text-base font-semibold text-slate-600 leading-none">
                                      {item.targetStock.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-1.5">
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                  <div style={{ width: `${Math.min(100, fulfillmentRate)}%` }} className={`h-full ${stockStatusColor} transition-all duration-500`}></div>
                                </div>
                                <div className="flex items-center justify-between text-xs min-h-[20px]">
                                   <div className="flex gap-2">
                                     {replenishmentNeeded > 0 ? (
                                        <>
                                          <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1">
                                            <AlertTriangle size={10} /> 製品不足: {replenishmentNeeded}
                                          </span>
                                          {rawMaterialShortage > 0 && (
                                            <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded flex items-center gap-1">
                                              <AlertCircle size={10} /> 生地不足: {rawMaterialShortage}
                                            </span>
                                          )}
                                        </>
                                      ) : (
                                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                                          <CheckCircle2 size={10} /> 充足
                                        </span>
                                      )}
                                   </div>
                                   <div className="font-medium text-slate-400">充足率 {Math.round(fulfillmentRate)}%</div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-center gap-2">
                              <button 
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                title="編集"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                type="button"
                                onClick={() => deleteItem(item.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="削除"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {/* 詳細エリア */}
                        {expandedItemId === item.id && (
                          <tr className="bg-slate-50">
                            <td colSpan={5} className="p-0">
                              <div className="p-4 pl-16 border-t border-slate-200 shadow-inner bg-slate-100">
                                <div className="flex justify-between items-center mb-3">
                                  <h4 className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                    <MapPin size={16} />
                                    工程・ロケーション別在庫状況
                                  </h4>
                                  <div className="flex gap-3">
                                    <div className="text-xs text-slate-500 flex gap-1 items-center">
                                      <span className="w-2 h-2 rounded-full bg-slate-400"></span> 仕掛品
                                    </div>
                                    <div className="text-xs text-slate-500 flex gap-1 items-center">
                                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span> 製品
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                  <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                      <tr>
                                        <th className="px-4 py-2">現在の工程(場所)</th>
                                        <th className="px-4 py-2">種別</th>
                                        <th className="px-4 py-2">評価単価</th>
                                        <th className="px-4 py-2">反番 / ロットNo</th>
                                        <th className="px-4 py-2">在庫数</th>
                                        <th className="px-4 py-2">入荷日/更新日</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {processes.map((process, pIdx) => {
                                        const processLots = item.lots ? item.lots.filter(l => l.process === process && l.quantity > 0) : [];
                                        const type = processTypes[process] || 'WIP';
                                        const processPrice = item.processPrices?.[process] ?? item.price;
                                         
                                        if (processLots.length > 0) {
                                          return processLots.map((lot, lIdx) => (
                                              <tr key={`${pIdx}-${lIdx}`}>
                                                <td className="px-4 py-3 font-bold text-slate-700 flex items-center gap-2">
                                                  <span className={`w-2 h-2 rounded-full inline-block ${type === 'PRODUCT' ? 'bg-indigo-500' : type === 'BOXED' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                                                  {lot.process}
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                  {type === 'PRODUCT' 
                                                    ? <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">製品</span> 
                                                    : type === 'BOXED'
                                                      ? <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100">箱入</span>
                                                      : <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">仕掛</span>}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-600 font-mono">
                                                  ¥{processPrice.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-indigo-900">
                                                  {lot.lotNo === NO_LOT_ID 
                                                    ? <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs">（統合在庫）</span>
                                                    : lot.lotNo
                                                  }
                                                </td>
                                                <td className="px-4 py-3 font-bold text-slate-700">{lot.quantity} 枚</td>
                                                <td className="px-4 py-3 text-slate-500">{lot.receivedDate}</td>
                                              </tr>
                                          ));
                                        } else {
                                          return (
                                            <tr key={`${pIdx}-empty`} className="hover:bg-slate-50 transition-colors">
                                              <td className="px-4 py-3 font-bold text-slate-400 flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full inline-block ${type === 'PRODUCT' ? 'bg-indigo-200' : type === 'BOXED' ? 'bg-amber-200' : 'bg-slate-200'}`}></span>
                                                {process}
                                              </td>
                                              <td className="px-4 py-3 text-xs text-slate-300">{type === 'PRODUCT' ? '製品' : type === 'BOXED' ? '箱入' : '仕掛'}</td>
                                              <td className="px-4 py-3 text-xs text-slate-300 font-mono">¥{processPrice.toLocaleString()}</td>
                                              <td className="px-4 py-3 font-mono text-slate-300">-</td>
                                              <td className="px-4 py-3 font-bold text-slate-400">0 枚</td>
                                              <td className="px-4 py-3 text-slate-300">-</td>
                                            </tr>
                                          );
                                        }
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      {isLowStockFilterActive 
                        ? "現在、発注点割れ（製品不足）の商品はありません。すべて順調です！" 
                        : isDeadlineFilterActive ? "納期遅れや期限間近の商品はありません。"
                        : "該当する品番が見つかりません。"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* --- モーダル群 (z-50: 参照・一覧系) --- */}
      
      {/* 1. 在庫タイプ別一覧 */}
      {viewingStockType && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" style={{zIndex: 50}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-fade-in overflow-hidden relative">
            <div className="bg-indigo-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
              <h2 className="font-bold text-lg flex items-center gap-2">
                {viewingStockType === 'PRODUCT' ? <Box size={24} /> : viewingStockType === 'WIP' ? <Factory size={24} /> : viewingStockType === 'BOXED' ? <Archive size={24} /> : <Package size={24} />}
                {viewingStockType === 'PRODUCT' ? '製品在庫' : viewingStockType === 'WIP' ? '仕掛品在庫' : viewingStockType === 'BOXED' ? '箱入れ在庫' : '全工程・全在庫'} 一覧
              </h2>
              <button type="button" onClick={() => setViewingStockType(null)} className="opacity-80 hover:opacity-100"><X size={28} /></button>
            </div>
             
            <div className="p-0 overflow-auto flex-1 bg-slate-50">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-600 text-sm border-b sticky top-0 shadow-sm z-10">
                  <tr>
                    <th className="p-4 font-semibold">品番</th>
                    <th className="p-4 font-semibold">商品名 / 納期</th>
                    <th className="p-4 font-semibold">顧客名</th>
                    <th className="p-4 font-semibold text-right w-24">必要在庫数</th>
                    <th className="p-4 font-semibold text-right w-32">現在庫数</th>
                    {viewingStockType === 'ALL' && (
                       <>
                        <th className="p-4 font-semibold text-right text-xs text-indigo-600 w-24">内 製品・箱入</th>
                        <th className="p-4 font-semibold text-right text-xs text-slate-500 w-24">内 仕掛</th>
                       </>
                    )}
                    <th className="p-4 font-semibold text-right">不足数 (アラート)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.flatMap(item => {
                    const stock = calculateStockByType(item, viewingStockType);
                    if (stock > 0) {
                      return [item];
                    }
                    return [];
                  }).sort((a, b) => a.code.localeCompare(b.code)).map((item, idx) => {
                    const stock = calculateStockByType(item, viewingStockType);
                    
                    // 不足数の計算ロジック
                    let shortageDisplay = null;
                    
                    if (viewingStockType === 'PRODUCT') {
                        // 製品一覧: 製品在庫が必要数に足りているか
                        const shortage = Math.max(0, item.targetStock - stock);
                         if (shortage > 0) {
                            shortageDisplay = <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">製品不足 {shortage}</span>;
                        }
                    } else if (viewingStockType === 'WIP') {
                        // 仕掛一覧: (製品+仕掛)が必要数に足りているか (＝投入不足)
                        const totalHeld = calculateStockByType(item, 'ALL');
                        const shortage = Math.max(0, item.targetStock - totalHeld);
                        if (shortage > 0) {
                             shortageDisplay = <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">投入不足 {shortage}</span>;
                        } else {
                             shortageDisplay = <span className="text-xs text-emerald-600 font-medium">充足中</span>;
                        }
                    } else if (viewingStockType === 'ALL') {
                         const shortage = Math.max(0, item.targetStock - stock);
                         if (shortage > 0) shortageDisplay = <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">総量不足 {shortage}</span>;
                    }

                    return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-indigo-700">{item.code}</td>
                      <td className="p-4 font-bold text-slate-800">
                        {item.name}
                        <div className="text-xs text-slate-500 font-normal mt-0.5">{item.category} / {item.size}</div>
                        {item.deadline && <div className="text-xs text-red-500 font-normal mt-1 flex items-center gap-1"><Calendar size={10} /> 納期: {item.deadline}</div>}
                      </td>
                      <td className="p-4 text-slate-600 text-sm">{item.customer || '-'}</td>
                      
                      {/* 必要在庫数 (追加) */}
                      <td className="p-4 text-right font-medium text-slate-500">{item.targetStock.toLocaleString()}</td>

                      <td className="p-4 text-right font-bold text-lg text-slate-700">{stock.toLocaleString()} <span className="text-sm font-normal text-slate-400">枚</span></td>
                      
                      {/* 内訳表示 */}
                      {viewingStockType === 'ALL' && (
                        <>
                           <td className="p-4 text-right text-sm font-medium text-indigo-600">
                             {calculateProductStock(item).toLocaleString()}
                           </td>
                           <td className="p-4 text-right text-sm text-slate-500">
                             {calculateStockByType(item, 'WIP').toLocaleString()}
                           </td>
                        </>
                      )}

                      <td className="p-4 text-right">
                        {shortageDisplay || <span className="text-slate-300 text-xs">-</span>}
                      </td>
                    </tr>
                  )})}
                  {items.every(item => calculateStockByType(item, viewingStockType) === 0) && (
                    <tr>
                      <td colSpan={viewingStockType === 'ALL' ? 8 : 6} className="p-12 text-center text-slate-400">
                        該当する在庫はありません。
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-200 text-right text-sm text-slate-500 shrink-0">
               合計: {items.reduce((acc, item) => acc + calculateStockByType(item, viewingStockType), 0).toLocaleString()} 枚
            </div>
          </div>
        </div>
      )}
      
      {/* 2. 工程別詳細ポップアップ */}
      {viewingProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" style={{zIndex: 50}}>
           {/* ... (省略せず記述) ... */}
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in overflow-hidden relative">
            <div className="bg-indigo-800 px-6 py-4 flex justify-between items-center text-white shrink-0">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <MapPin size={24} /> 
                {isSelectingItem ? '入庫する品番を選択' : `「${viewingProcess}」在庫一覧`}
                <span className="text-sm font-normal bg-indigo-700 px-2 py-0.5 rounded border border-indigo-600">
                  {processTypes[viewingProcess] === 'PRODUCT' ? '製品工程' : processTypes[viewingProcess] === 'BOXED' ? '箱入れ工程' : '仕掛工程'}
                </span>
              </h2>
              <div className="flex items-center gap-3">
                {!isSelectingItem && <button type="button" onClick={() => setIsSelectingItem(true)} className="bg-white text-indigo-800 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors flex items-center gap-1"><Plus size={16} /> この工程に入庫</button>}
                {isSelectingItem && <button type="button" onClick={() => setIsSelectingItem(false)} className="text-indigo-200 hover:text-white text-sm underline">一覧に戻る</button>}
                <button type="button" onClick={closeProcessModal} className="opacity-80 hover:opacity-100 ml-2"><X size={28} /></button>
              </div>
            </div>
             
            <div className="p-0 overflow-auto flex-1 bg-slate-50 pb-20">
              {isSelectingItem ? (
                <div className="p-6">
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input type="text" placeholder="品番・商品名で検索..." className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={itemSearchTerm} onChange={(e) => setItemSearchTerm(e.target.value)} autoFocus />
                  </div>
                  <div className="grid gap-3">
                    {items.filter(i => i.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) || i.code.toLowerCase().includes(itemSearchTerm.toLowerCase())).map(item => (
                      <button type="button" key={item.id} onClick={() => openStockModal(item, 'IN', { process: viewingProcess || undefined, lotNo: '', quantity: 0 })} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-left group">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 rounded">{item.code}</span>
                            <span className="font-bold text-slate-800 text-lg">{item.name}</span>
                          </div>
                          <div className="text-sm text-slate-500 flex gap-2">
                            {item.customer && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{item.customer}</span>}
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{item.category}</span>
                            <span>{item.size}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-3 py-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Plus size={20} /> 選択して入庫</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : viewingProcessInventory.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-600 text-sm border-b sticky top-0 shadow-sm z-10">
                    <tr>
                      <th className="p-4 w-12 text-center">
                        <button type="button" onClick={toggleAllSelection} className="text-slate-400 hover:text-indigo-600">
                          {selectedLots.size > 0 && selectedLots.size === viewingProcessInventory.length ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} />}
                        </button>
                      </th>
                      <th className="p-4 font-semibold">品番</th>
                      <th className="p-4 font-semibold">商品名 / 顧客・カテゴリ</th>
                      <th className="p-4 font-semibold">反番 / ロットNo</th>
                      <th className="p-4 font-semibold text-right">在庫数</th>
                      <th className="p-4 font-semibold">入荷日</th>
                      <th className="p-4 font-semibold text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingProcessInventory.map(({item, lot, key}, idx) => (
                      <tr key={key} className={`hover:bg-slate-50 transition-colors ${selectedLots.has(key) ? 'bg-indigo-50' : 'bg-white'}`}>
                        <td className="p-4 text-center">
                          <button type="button" onClick={() => toggleLotSelection(key)} className="text-slate-400 hover:text-indigo-600">
                            {selectedLots.has(key) ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} />}
                          </button>
                        </td>
                        <td className="p-4 font-mono font-bold text-indigo-700">{item.code}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5 flex gap-1">
                            {item.customer && <span className="bg-blue-50 text-blue-700 px-1.5 rounded">{item.customer}</span>}
                            <span>{item.category} / {item.size}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-indigo-900 font-medium">
                          {lot.lotNo === NO_LOT_ID ? <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs">（統合在庫）</span> : lot.lotNo}
                        </td>
                        <td className="p-4 text-right font-bold text-lg">{lot.quantity} <span className="text-sm font-normal text-slate-500">枚</span></td>
                        <td className="p-4 text-sm text-slate-500">{lot.receivedDate}</td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button type="button" onClick={() => openStockModal(item, 'IN', lot)} className="px-3 py-1.5 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded font-bold flex items-center gap-1 transition-colors"><Plus size={14} /> 追加</button>
                            <button type="button" onClick={() => openStockModal(item, 'MOVE', lot)} className="px-3 py-1.5 text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-bold flex items-center gap-1 transition-colors"><ArrowRightLeft size={14} /> 移動</button>
                            <button type="button" onClick={() => openStockModal(item, 'OUT', lot)} className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded font-bold flex items-center gap-1 transition-colors"><LogOut size={14} /> 廃棄</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400 h-full">
                  <Package size={64} className="mb-4 opacity-20" />
                  <p className="text-lg font-medium">この工程には現在庫がありません。</p>
                  <button type="button" onClick={() => setIsSelectingItem(true)} className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg flex items-center gap-2"><Plus size={20} /> 商品を新規入庫する</button>
                </div>
              )}
            </div>
             
            {selectedLots.size > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-2xl flex items-center justify-between z-20 animate-fade-in-up">
                <div className="font-bold text-slate-700 ml-4">
                  {selectedLots.size} 件選択中
                </div>
                <button type="button" onClick={() => setIsBulkMoveModalOpen(true)} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md">
                  <ArrowRightLeft size={18} />
                  一括移動する
                </button>
              </div>
            )}

            {!isSelectingItem && viewingProcessInventory.length > 0 && selectedLots.size === 0 && (
              <div className="bg-slate-50 p-4 border-t border-slate-200 text-right text-sm text-slate-500 shrink-0">
                 合計: {viewingProcessInventory.reduce((acc, curr) => acc + curr.lot.quantity, 0).toLocaleString()} 枚
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. 棚卸・資産評価モーダル */}
      {isInventoryValuationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{zIndex: 50}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
            <div className="bg-indigo-800 px-6 py-4 flex justify-between items-center text-white shrink-0">
              <h2 className="font-bold text-lg flex items-center gap-2"><ClipboardList size={20} /> 棚卸・資産評価レポート</h2>
              <button type="button" onClick={() => setIsInventoryValuationOpen(false)} className="opacity-80 hover:opacity-100"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 text-center">
                <h3 className="text-slate-500 text-sm font-medium mb-1">現在の全在庫資産評価額</h3>
                <p className="text-3xl md:text-4xl font-bold text-slate-800 flex justify-center items-baseline gap-1">
                  <span className="text-base text-slate-400 font-normal">¥</span>
                  {inventoryValue.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-2">※ 工程別設定単価 × 在庫数量 の合計値</p>
              </div>

              <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><Factory size={18} /> 工程別資産内訳</h4>
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 text-left">工程名</th>
                      <th className="px-4 py-2 text-center">区分</th>
                      <th className="px-4 py-2 text-right">在庫数</th>
                      <th className="px-4 py-2 text-right">評価額計</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {processes.map((process) => {
                      const count = stockByProcess[process] || 0;
                      const value = valuationByProcess[process] || 0;
                      const type = processTypes[process] || 'WIP';
                      
                      return (
                        <tr key={process}>
                          <td className="px-4 py-3 font-medium text-slate-700">{process}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded border ${type === 'PRODUCT' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : type === 'BOXED' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                              {type === 'PRODUCT' ? '製品' : type === 'BOXED' ? '箱入' : '仕掛'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">{count.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono font-medium">¥{value.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-50 font-bold border-t border-slate-200">
                      <td className="px-4 py-3" colSpan={2}>合計</td>
                      <td className="px-4 py-3 text-right">{totalStock.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-indigo-700">¥{inventoryValue.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><PieChart size={18} /> 資産構成比</h4>
                <div className="flex h-4 rounded-full overflow-hidden w-full bg-slate-100">
                  {processes.map((process, idx) => {
                    const value = valuationByProcess[process] || 0;
                    if (value === 0) return null;
                    const percentage = (value / inventoryValue) * 100;
                    // 色を簡易的に生成（インデックスに基づいて）
                    const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-sky-500', 'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500', 'bg-green-500', 'bg-lime-500', 'bg-yellow-500'];
                    const colorClass = colors[idx % colors.length];
                    
                    return (
                      <div 
                        key={process} 
                        className={`h-full ${colorClass}`} 
                        style={{ width: `${percentage}%` }} 
                        title={`${process}: ${percentage.toFixed(1)}%`}
                      ></div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {processes.map((process, idx) => {
                    const value = valuationByProcess[process] || 0;
                    if (value === 0) return null;
                    const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-sky-500', 'bg-cyan-500', 'bg-teal-500', 'bg-emerald-500', 'bg-green-500', 'bg-lime-500', 'bg-yellow-500'];
                    const colorClass = colors[idx % colors.length];
                    return (
                      <div key={process} className="flex items-center gap-1 text-xs text-slate-500">
                        <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                        {process}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button type="button" onClick={() => setIsInventoryValuationOpen(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">閉じる</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. 設定モーダル */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{zIndex: 50}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-slate-800 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-lg flex items-center gap-2"><Settings size={20} /> 設定</h2>
              <button type="button" onClick={() => setIsSettingsOpen(false)} className="opacity-80 hover:opacity-100"><X size={24} /></button>
            </div>
            
            {/* タブ切り替え */}
            <div className="flex border-b border-slate-200">
              <button 
                type="button"
                className={`flex-1 py-3 font-bold text-sm ${activeSettingsTab === 'PROCESS' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveSettingsTab('PROCESS')}
              >
                工程マスタ設定
              </button>
              <button 
                type="button"
                className={`flex-1 py-3 font-bold text-sm ${activeSettingsTab === 'CATEGORY' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveSettingsTab('CATEGORY')}
              >
                カテゴリ設定
              </button>
            </div>

            <div className="p-6">
              {activeSettingsTab === 'PROCESS' ? (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">新しい工程を追加</label>
                    <form onSubmit={handleAddProcess} className="flex gap-2">
                      <input type="text" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="例: 第3倉庫" value={newProcessName} onChange={(e) => setNewProcessName(e.target.value)} />
                      <select 
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        value={newProcessType}
                        onChange={(e) => setNewProcessType(e.target.value as ProcessType)}
                      >
                        <option value="WIP">仕掛</option>
                        <option value="PRODUCT">製品</option>
                        <option value="BOXED">箱入</option>
                      </select>
                      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-bold">追加</button>
                    </form>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-600 mb-3">登録済みの工程一覧</h3>
                    <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {processes.map((process, index) => (
                        <li key={index} className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-slate-700">{process}</span>
                            <select 
                              className={`text-xs px-2 py-1 rounded border outline-none ${processTypes[process] === 'PRODUCT' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : processTypes[process] === 'BOXED' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                              value={processTypes[process] || 'WIP'}
                              onChange={(e) => updateProcessType(process, e.target.value as ProcessType)}
                            >
                              <option value="WIP">仕掛</option>
                              <option value="PRODUCT">製品</option>
                              <option value="BOXED">箱入</option>
                            </select>
                          </div>
                          <button type="button" onClick={() => deleteProcess(process)} className="text-slate-400 hover:text-red-500 p-1" title="削除"><Trash2 size={16} /></button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">新しいカテゴリを追加</label>
                    <form onSubmit={handleAddCategory} className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        placeholder="例: リネン" 
                        value={newCategoryName} 
                        onChange={(e) => setNewCategoryName(e.target.value)} 
                      />
                      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-bold">追加</button>
                    </form>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-600 mb-3">登録済みのカテゴリ一覧</h3>
                    <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {categories.map((category, index) => (
                        <li key={index} className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                          <span className="font-medium text-slate-700">{category}</span>
                          <button type="button" onClick={() => deleteCategory(category)} className="text-slate-400 hover:text-red-500 p-1" title="削除"><Trash2 size={16} /></button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. 商品マスタ管理モーダル */}
      {isMasterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{zIndex: 50}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col animate-fade-in">
            <div className="bg-indigo-900 px-6 py-4 flex justify-between items-center text-white shrink-0 rounded-t-xl">
              <h2 className="font-bold text-lg flex items-center gap-2"><Database size={20} /> 商品マスタ管理</h2>
              <button type="button" onClick={() => setIsMasterModalOpen(false)} className="opacity-80 hover:opacity-100"><X size={24} /></button>
            </div>
             
            <div className="p-6 overflow-auto flex-1 bg-slate-50">
              <div className="flex justify-between items-center mb-6">
                <p className="text-slate-600 text-sm">現在登録されている全商品の一覧です。在庫の有無に関わらず表示されます。</p>
                <button 
                  type="button"
                  onClick={openNewItemModal}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} /> 新規商品登録
                </button>
              </div>

              <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-600 text-sm">
                    <tr>
                      <th className="p-4 font-semibold border-b">品番</th>
                      <th className="p-4 font-semibold border-b">商品名</th>
                      <th className="p-4 font-semibold border-b">顧客名 (取引先)</th>
                      <th className="p-4 font-semibold border-b">カテゴリ</th>
                      <th className="p-4 font-semibold border-b text-center">必要在庫</th>
                      <th className="p-4 font-semibold border-b text-right">単価</th>
                      <th className="p-4 font-semibold border-b text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-4 font-mono font-bold text-indigo-700">{item.code}</td>
                        <td className="p-4 font-bold text-slate-800">
                           {item.name}
                           <div className="mt-1">
                             <PackagingBadge type={item.packaging} />
                           </div>
                        </td>
                        <td className="p-4 text-slate-700">
                          {item.customer ? (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm border border-blue-100">
                              <Users size={12} /> {item.customer}
                            </span>
                          ) : <span className="text-slate-400">-</span>}
                        </td>
                        <td className="p-4 text-slate-600">{item.category} <span className="text-slate-400 text-xs">/ {item.size}</span></td>
                        <td className="p-4 text-center font-medium text-slate-700">{item.targetStock} 枚</td>
                        <td className="p-4 text-right font-mono">¥{item.price.toLocaleString()}</td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="編集"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => deleteItem(item.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="削除"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. 顧客マスタ */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{zIndex: 50}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="bg-indigo-800 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-lg flex items-center gap-2"><Users size={20} /> 顧客マスタ管理</h2>
              <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="opacity-80 hover:opacity-100"><X size={24} /></button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">新しい顧客(取引先)を追加</label>
                <form onSubmit={handleAddCustomer} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="例: 株式会社〇〇ホテル"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                  />
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-bold">
                    追加
                  </button>
                </form>
              </div>
               
              <div>
                <h3 className="text-sm font-bold text-slate-600 mb-3">登録済みの顧客一覧</h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto bg-slate-50">
                  <ul className="divide-y divide-slate-200">
                    {customers.map((customer) => (
                      <li key={customer.id} className="flex justify-between items-center p-3 bg-white hover:bg-slate-50">
                        <span className="font-medium text-slate-700 flex items-center gap-2"><Building2 size={16} className="text-slate-400" />{customer.name}</span>
                        <button 
                          type="button"
                          onClick={() => deleteCustomer(customer.id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                          title="削除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                    {customers.length === 0 && (
                      <li className="p-4 text-center text-slate-400 text-sm">顧客が登録されていません</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. 箱詰・加工セット組モーダル */}
      {isAssemblyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{zIndex: 50}}>
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
            <div className="bg-indigo-800 px-6 py-4 flex justify-between items-center text-white shrink-0">
              <h2 className="font-bold text-lg flex items-center gap-2"><Blocks size={20} /> 箱詰・加工・セット組</h2>
              <button type="button" onClick={() => setIsAssemblyModalOpen(false)} className="opacity-80 hover:opacity-100"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAssembly} className="p-6 overflow-y-auto flex-1">
               <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                    <span className="bg-slate-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
                    加工元の在庫を選択
                  </h3>
                  <div className="space-y-4">
                    {assemblySources.map((source, index) => (
                      <div key={source.uid} className="relative p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                        {assemblySources.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeAssemblySource(source.uid)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                            title="削除"
                          >
                            <X size={16} />
                          </button>
                        )}
                        <div className="grid gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">加工する商品（親在庫）</label>
                            <select 
                              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                              value={source.itemId}
                              onChange={(e) => updateAssemblySource(source.uid, 'itemId', e.target.value)}
                            >
                              <option value="">-- 商品を選択 --</option>
                              {items.filter(i => calculateTotalStock(i) > 0).map(item => (
                                <option key={item.id} value={item.id}>{item.code} : {item.name}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                             <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">使用するロット</label>
                              <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                value={source.lotNo}
                                onChange={(e) => updateAssemblySource(source.uid, 'lotNo', e.target.value)}
                                disabled={!source.itemId}
                              >
                                <option value="">-- ロットを選択 --</option>
                                {source.itemId && 
                                  items.find(i => i.id === Number(source.itemId))?.lots
                                    .filter(l => l.quantity > 0)
                                    .map(l => (
                                      <option key={`${l.lotNo}-${l.process}`} value={l.lotNo}>{l.lotNo} ({l.process} / 在庫:{l.quantity})</option>
                                    ))
                                }
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">消費数量</label>
                              <div className="flex items-center">
                                <input 
                                  type="number" 
                                  min="1" 
                                  className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right pr-8 text-sm"
                                  value={source.quantity}
                                  onChange={(e) => updateAssemblySource(source.uid, 'quantity', Number(e.target.value))}
                                />
                                <span className="text-slate-500 -ml-6 text-xs">枚</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={addAssemblySource}
                      className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
                    >
                      <Plus size={16} /> 構成品を追加
                    </button>
                  </div>
                </div>

                <div className="flex justify-center -my-2 text-slate-400">
                  <ArrowUpDown size={24} />
                </div>

                {/* 2. 加工先 (After) */}
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h3 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
                    完成する製品・場所を指定
                  </h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-xs font-medium text-indigo-700 mb-1">完成する商品（変換後）</label>
                      <select 
                        className="w-full px-3 py-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={assemblyTarget.targetItemId}
                        onChange={(e) => setAssemblyTarget({...assemblyTarget, targetItemId: e.target.value})}
                      >
                        <option value="">-- 商品を選択 --</option>
                        {items.map(item => (
                          <option key={item.id} value={item.id}>{item.code} : {item.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                        <label className="block text-xs font-medium text-indigo-700 mb-1">完成数量（セット数）</label>
                        <div className="flex items-center">
                          <input 
                            type="number" 
                            min="1" 
                            className="w-full px-3 py-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right pr-8 font-bold"
                            value={assemblyTarget.targetQuantity}
                            onChange={(e) => setAssemblyTarget({...assemblyTarget, targetQuantity: Number(e.target.value)})}
                          />
                          <span className="text-indigo-600 -ml-6 text-sm">個</span>
                        </div>
                      </div>
                      {/* 新しいロットNo入力欄は削除済み (自動でSTOCK扱い) */}
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-indigo-700 mb-1">保管場所（工程）</label>
                        <select 
                          className="w-full px-3 py-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={assemblyTarget.process}
                          onChange={(e) => setAssemblyTarget({...assemblyTarget, process: e.target.value})}
                        >
                          <option value="">-- 場所を選択 --</option>
                          {processes.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAssemblyModalOpen(false)} 
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                >
                  キャンセル
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md"
                >
                  <Blocks size={18} /> 加工実行
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. 新規商品登録・編集モーダル */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4" style={{zIndex: 60}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
            <div className="bg-indigo-800 px-6 py-4 flex justify-between items-center text-white shrink-0">
              <h2 className="font-bold text-lg">{editingId ? '商品マスタ編集' : '新規品番マスタ登録'}</h2>
              <button type="button" onClick={() => setIsItemModalOpen(false)} className="text-indigo-200 hover:text-white"><X size={24} /></button>
            </div>
             
            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto flex-1">
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">品番 (Code)</label>
                    <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono" placeholder="WF-101" value={newItem.code} onChange={(e) => setNewItem({...newItem, code: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">商品名</label>
                    <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="プレミアムウール毛布" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} />
                  </div>
                </div>
                 
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">顧客名 (取引先)</label>
                  <div className="relative">
                    <Users size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <select 
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={newItem.customer}
                      onChange={(e) => setNewItem({...newItem, customer: e.target.value})}
                    >
                      <option value="">-- 顧客を選択 --</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.name}>{customer.name}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 text-right">※ 一覧にない場合は顧客マスタから登録してください</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">カテゴリ</label>
                    <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})}>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">荷姿（形状）</label>
                    <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={newItem.packaging} onChange={(e) => setNewItem({...newItem, packaging: e.target.value})}>
                      <option value="バラ">バラ</option>
                      <option value="箱入">箱入</option>
                      <option value="セット">セット</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">サイズ</label>
                    <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={newItem.size} onChange={(e) => setNewItem({...newItem, size: e.target.value})}>
                      <option value="シングル">シングル</option>
                      <option value="セミダブル">セミダブル</option>
                      <option value="ダブル">ダブル</option>
                      <option value="クイーン">クイーン</option>
                      <option value="ハーフ">ハーフ/ひざ掛け</option>
                    </select>
                  </div>
                </div>
                 
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">在庫管理・単価設定</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">必要在庫数 (目標)</label>
                      <input type="number" min="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={newItem.targetStock} onChange={(e) => setNewItem({...newItem, targetStock: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">発注点 (アラート)</label>
                      <input type="number" min="1" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={newItem.threshold} onChange={(e) => setNewItem({...newItem, threshold: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">生産ロット数 (目安)</label>
                      <div className="relative">
                        <Factory size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input type="number" min="1" className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={newItem.productionLotSize} onChange={(e) => setNewItem({...newItem, productionLotSize: Number(e.target.value)})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">標準/最終単価 (円)</label>
                      <input type="number" min="0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})} />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">納期 (YYYY-MM-DD)</label>
                        <div className="relative">
                          <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                          <input type="date" className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={newItem.deadline} onChange={(e) => setNewItem({...newItem, deadline: e.target.value})} />
                        </div>
                    </div>
                  </div>

                  <details className="group border border-slate-200 rounded-lg bg-white">
                    <summary className="cursor-pointer p-3 font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between">
                      <span className="flex items-center gap-2"><JapaneseYen size={16} /> 工程別単価設定 (任意)</span>
                      <span className="text-xs text-slate-400 group-open:hidden">クリックして展開</span>
                    </summary>
                    <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                      <p className="text-xs text-slate-500 mb-3 mt-3">※ 設定がない工程は「標準/最終単価」が適用されます。</p>
                      <div className="grid grid-cols-2 gap-3">
                        {processes.map(process => (
                          <div key={process}>
                            <label className="block text-xs font-medium text-slate-600 mb-1 truncate" title={process}>{process}</label>
                            <input 
                              type="number" 
                              min="0" 
                              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none" 
                              placeholder={`例: ${newItem.price}`}
                              value={newItem.processPrices[process] || ''}
                              onChange={(e) => handleProcessPriceChange(process, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 pb-2">
                <button type="button" onClick={() => setIsItemModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">キャンセル</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2">
                  <Save size={18} /> {editingId ? '更新する' : 'マスタ登録'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. 入出庫・移動処理モーダル */}
      {isStockModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4" style={{zIndex: 60}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className={`px-6 py-4 flex justify-between items-center text-white ${transactionType === 'IN' ? 'bg-indigo-600' : transactionType === 'MOVE' ? 'bg-emerald-600' : 'bg-slate-600'}`}>
              <h2 className="font-bold text-lg flex items-center gap-2">
                {transactionType === 'IN' && <Plus className="h-6 w-6" />}
                {transactionType === 'MOVE' && <ArrowRightLeft className="h-6 w-6" />}
                {transactionType === 'OUT' && <Minus className="h-6 w-6" />}
                {transactionType === 'IN' ? '入庫処理' : transactionType === 'MOVE' ? '工程移動' : '出庫 / 廃棄処理'}
              </h2>
              <button type="button" onClick={() => setIsStockModalOpen(false)} className="opacity-80 hover:opacity-100"><X size={24} /></button>
            </div>
             
            <form onSubmit={handleTransaction} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-1">対象品番</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{selectedItem.code}</span>
                  <span className="font-bold text-lg text-slate-800">{selectedItem.name}</span>
                  <PackagingBadge type={selectedItem.packaging} />
                </div>
              </div>

              <div className="grid gap-4">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{transactionType === 'IN' ? '入庫先の工程(場所)' : transactionType === 'MOVE' ? '移動元の工程(場所)' : '出庫・廃棄元の工程(場所)'}</label>
                  <select required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={transactionData.process} onChange={(e) => setTransactionData({...transactionData, process: e.target.value})}>
                    {transactionType === 'IN' ? processes.map(p => <option key={p} value={p}>{p}</option>) : selectedItem.lots.filter(l => l.lotNo === (isLotIntegration ? NO_LOT_ID : transactionData.lotNo) && l.quantity > 0).map(l => <option key={l.process} value={l.process}>{l.process} (在庫: {l.quantity})</option>)}
                  </select>
                </div>

                {/* ロットNo入力エリア */}
                {/* 移動先が製品・箱入れの場合は自動統合のため入力不要（表示切替） */}
                {transactionType === 'MOVE' && (processTypes[transactionData.targetProcess] === 'PRODUCT' || processTypes[transactionData.targetProcess] === 'BOXED') ? (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800 flex items-start gap-2">
                       <Merge size={18} className="shrink-0 mt-0.5" />
                       <div>
                         <span className="font-bold">自動統合:</span> 移動先は「{processTypes[transactionData.targetProcess] === 'PRODUCT' ? '製品' : '箱入れ'}」工程のため、ロット番号は自動的に統合され、トータル在庫として管理されます。
                       </div>
                    </div>
                ) : (
                    // 通常のロット入力（統合オプション付き）
                     <div>
                      <div className="flex justify-between items-center mb-2">
                         <label className="block text-sm font-medium text-slate-700">反番 / ロットNo</label>
                         {(transactionType === 'IN') && 
                          (processTypes[transactionData.process] === 'PRODUCT' || processTypes[transactionData.process] === 'BOXED') && (
                             <label className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded cursor-pointer border border-indigo-100">
                               <input 
                                 type="checkbox" 
                                 checked={isLotIntegration}
                                 onChange={(e) => setIsLotIntegration(e.target.checked)}
                                 className="accent-indigo-600"
                               />
                               ロット番号を管理しない（統合在庫）
                             </label>
                         )}
                      </div>
                      
                      {!isLotIntegration ? (
                        <>
                          {transactionType === 'IN' ? (
                            <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono" placeholder="例: 24-A001" value={transactionData.lotNo} onChange={(e) => setTransactionData({...transactionData, lotNo: e.target.value})} list="lot-suggestions" />
                          ) : (
                            // 移動・出庫時は元ロットを選択
                            <select required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono" value={transactionData.lotNo} onChange={(e) => {
                                const lot = selectedItem.lots.find(l => l.lotNo === e.target.value && l.quantity > 0);
                                setTransactionData({ ...transactionData, lotNo: e.target.value, process: lot ? lot.process : processes[0] });
                              }}>
                              <option value="">-- ロットを選択 --</option>
                              {Array.from(new Set(selectedItem.lots.filter(l => l.quantity > 0 && l.lotNo !== NO_LOT_ID).map(l => l.lotNo))).map(lotNo => (<option key={lotNo} value={lotNo}>{lotNo}</option>))}
                            </select>
                          )}
                          {transactionType === 'IN' && (
                            <datalist id="lot-suggestions">
                              {Array.from(new Set(selectedItem.lots.map(lot => lot.lotNo))).map(lotNo => (
                                <option key={lotNo} value={lotNo} />
                              ))}
                            </datalist>
                          )}
                        </>
                      ) : (
                        <div className="w-full px-4 py-2 border border-slate-200 bg-slate-100 rounded-lg text-slate-500 text-sm flex items-center gap-2">
                           <Layers size={16} /> 統合在庫として計上します
                        </div>
                      )}
                    </div>
                )}

                {transactionType === 'MOVE' && (
                  <div className="relative">
                    <div className="absolute left-4 -top-3 text-slate-300"><Truck size={16} /></div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 pl-6">移動先の工程</label>
                    <select required className="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-emerald-50" value={transactionData.targetProcess} onChange={(e) => setTransactionData({...transactionData, targetProcess: e.target.value})}>
                      {processes.map(p => <option key={p} value={p} disabled={p === transactionData.process}>{p}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{transactionType === 'MOVE' ? '移動する枚数' : transactionType === 'OUT' ? '出庫・廃棄する枚数' : '数量 (枚)'}</label>
                  <div className="flex items-center">
                    <input required type="number" min="1" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xl font-bold text-right pr-12" value={transactionData.quantity} onChange={(e) => setTransactionData({...transactionData, quantity: Number(e.target.value)})} />
                    <span className="text-slate-500 -ml-8 font-medium">枚</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsStockModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">キャンセル</button>
                <button type="submit" className={`px-6 py-2 text-white rounded-lg font-bold shadow-md transition-transform active:scale-95 flex items-center gap-2 ${transactionType === 'IN' ? 'bg-indigo-600 hover:bg-indigo-700' : transactionType === 'MOVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-600 hover:bg-slate-700'}`}>
                  {transactionType === 'IN' && <Plus size={18} />}
                  {transactionType === 'MOVE' && <ArrowRightLeft size={18} />}
                  {transactionType === 'OUT' && <Trash2 size={18} />}
                  {transactionType === 'IN' ? '入庫実行' : transactionType === 'MOVE' ? '移動実行' : '出庫・廃棄実行'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. 一括移動モーダル */}
      {isBulkMoveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-60 p-4" style={{zIndex: 60}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-lg flex items-center gap-2"><ArrowRightLeft size={20} /> 在庫一括移動</h2>
              <button type="button" onClick={() => setIsBulkMoveModalOpen(false)} className="opacity-80 hover:opacity-100"><X size={24} /></button>
            </div>
            <div className="p-6">
              <p className="mb-4 text-slate-600">選択した <strong className="text-slate-900">{selectedLots.size}</strong> 件の在庫を、以下の工程へ全量移動します。</p>
              <div className="mb-6 relative">
                <label className="block text-sm font-medium text-slate-700 mb-2 pl-6">移動先の工程</label>
                <div className="absolute left-4 top-9 text-slate-300"><Truck size={16} /></div>
                <select className="w-full px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-emerald-50" value={bulkTargetProcess} onChange={(e) => setBulkTargetProcess(e.target.value)}>
                  <option value="">-- 選択してください --</option>
                  {processes.map(p => (<option key={p} value={p} disabled={p === viewingProcess}>{p}</option>))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsBulkMoveModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">キャンセル</button>
                <button type="button" onClick={handleBulkMove} disabled={!bulkTargetProcess} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><ArrowRightLeft size={18} /> 一括移動実行</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}