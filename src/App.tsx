// src/App.tsx
import React, { useState } from 'react';
import { 
  Plus, Minus, Search, Package, AlertTriangle, Trash2, Save, X, 
  ArrowRightLeft, Truck, MapPin, LogOut, CheckSquare, Square, 
  Edit, Factory, Box, Users, Building2, Calendar, 
  JapaneseYen, AlertCircle, Blocks, Layers, Merge, ClipboardList, Database, Settings, Archive, ArrowUpDown
} from 'lucide-react';

import { 
  Item, Lot, Customer, ProcessType, SortOption, 
  AssemblySourceItem, NO_LOT_ID 
} from './types';
import { Header } from './components/layout/Header';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { ProcessChart } from './components/dashboard/ProcessChart';
import { ItemTable } from './components/tables/ItemTable';

// Firebase用のHooksを読み込み
import { useItems } from './hooks/useItems';
import { useMasters } from './hooks/useMasters';

// ==========================================
// 初期データ（Firebaseへの初回アップロード用）
// ==========================================
const initialProcessNames = ['第一織場', '第二織場', '2F倉庫', '染工場', '起毛場', 'ミシン工場', 'ミシン場倉庫', '村田倉庫', '藤原運送'];
const initialProcessTypes: Record<string, ProcessType> = {
  '第一織場': 'WIP', '第二織場': 'WIP', '2F倉庫': 'WIP', '染工場': 'WIP', '起毛場': 'WIP',
  'ミシン工場': 'WIP', 'ミシン場倉庫': 'BOXED', '村田倉庫': 'PRODUCT', '藤原運送': 'PRODUCT'
};
const initialCategories = ['ウール', 'コットン', '合成繊維', 'シルク', 'カシミヤ混', 'その他'];
const initialCustomers: Customer[] = [
  { id: 1, name: '帝国ホテル様' }, { id: 2, name: '百貨店共通' }, { id: 3, name: '量販店A社' },
  { id: 4, name: '海外輸出用' }, { id: 5, name: '株式会社ニトリ様' }, { id: 6, name: 'イオン株式会社様' }
];
const initialData: Item[] = [
  { id: 1, code: 'WF-101', name: 'プレミアムウール毛布', customer: '帝国ホテル様', category: 'ウール', packaging: 'バラ', size: 'シングル', threshold: 10, targetStock: 50, productionLotSize: 20, price: 15000, processPrices: { '第一織場': 5000, '2F倉庫': 6000, '染工場': 9000, 'ミシン工場': 12000 }, deadline: '2024-10-31', lots: [{ lotNo: '23-A001', quantity: 20, process: '2F倉庫', receivedDate: '2023-10-01' }, { lotNo: '23-B005', quantity: 25, process: '第一織場', receivedDate: '2023-11-15' }, { lotNo: NO_LOT_ID, quantity: 45, process: '藤原運送', receivedDate: '2024-02-01' }] },
  { id: 2, code: 'CT-204', name: 'オーガニックコットン肌掛け', customer: '百貨店共通', category: 'コットン', packaging: 'バラ', size: 'ダブル', threshold: 15, targetStock: 30, productionLotSize: 10, price: 8500, deadline: '', lots: [{ lotNo: '24-C012', quantity: 8, process: 'ミシン工場', receivedDate: '2024-01-20' }] },
];

const getToday = () => new Date().toISOString().split('T')[0];
const getDaysUntil = (dateStr: string) => {
  if (!dateStr) return null;
  const today = new Date(getToday());
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export default function App() {
  const { items, loadingItems, saveItem, saveMultipleItems, deleteItemFromDb } = useItems();
  const { processes, processTypes, categories, customers, loadingMasters, saveProcesses, saveCategories, saveCustomers } = useMasters();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [selectedProcessFilter, setSelectedProcessFilter] = useState<string | null>(null);
  const [isLowStockFilterActive, setIsLowStockFilterActive] = useState(false);
  const [isDeadlineFilterActive, setIsDeadlineFilterActive] = useState(false);
  const [isRawMaterialShortageFilterActive, setIsRawMaterialShortageFilterActive] = useState(false);

  const [viewingProcess, setViewingProcess] = useState<string | null>(null);
  const [viewingStockType, setViewingStockType] = useState<ProcessType | null>(null);
  const [isSelectingItem, setIsSelectingItem] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [selectedLots, setSelectedLots] = useState<Set<string>>(new Set());
  const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState(false);
  const [bulkTargetProcess, setBulkTargetProcess] = useState('');

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isInventoryValuationOpen, setIsInventoryValuationOpen] = useState(false);
  const [isAssemblyModalOpen, setIsAssemblyModalOpen] = useState(false);
  
  const [activeSettingsTab, setActiveSettingsTab] = useState<'PROCESS' | 'CATEGORY'>('PROCESS');
  const [newProcessName, setNewProcessName] = useState('');
  const [newProcessType, setNewProcessType] = useState<ProcessType>('WIP');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');

  const [assemblySources, setAssemblySources] = useState<AssemblySourceItem[]>([{ uid: 'init-1', itemId: '', lotNo: '', quantity: 1, process: '' }]);
  const [assemblyTarget, setAssemblyTarget] = useState({ targetItemId: '', targetQuantity: 1, process: '', newLotNo: '' });
  const [transactionType, setTransactionType] = useState<'IN' | 'OUT' | 'MOVE'>('IN');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [transactionData, setTransactionData] = useState({ lotNo: '', quantity: 0, process: '', targetProcess: '' });
  const [isLotIntegration, setIsLotIntegration] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({ code: '', name: '', customer: '', category: 'ウール', packaging: 'バラ', size: 'シングル', threshold: 10, targetStock: 20, productionLotSize: 10, price: 0, deadline: '', processPrices: {} as Record<string, number> });

  const [dialogConfig, setDialogConfig] = useState<{isOpen: boolean; type: 'CONFIRM' | 'ALERT'; title: string; message: string; onConfirm?: () => void;}>({isOpen: false, type: 'ALERT', title: '', message: ''});
  const showConfirm = (title: string, message: string, onConfirm: () => void) => setDialogConfig({ isOpen: true, type: 'CONFIRM', title, message, onConfirm });
  const showAlert = (title: string, message: string) => setDialogConfig({ isOpen: true, type: 'ALERT', title, message });
  const closeDialog = () => setDialogConfig(prev => ({ ...prev, isOpen: false }));
  const handleDialogConfirm = () => { if (dialogConfig.onConfirm) dialogConfig.onConfirm(); closeDialog(); };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else if (document.exitFullscreen) document.exitFullscreen();
    setIsFullscreen(!isFullscreen);
  };

  const handleMigrateData = async () => {
    try {
      showConfirm("データ移行", "初期データをFirebaseにアップロードしますか？", async () => {
        await saveProcesses(initialProcessNames, initialProcessTypes);
        await saveCategories(initialCategories);
        await saveCustomers(initialCustomers);
        await saveMultipleItems(initialData);
        showAlert("完了", "Firebaseへのデータ移行が完了しました！");
      });
    } catch (e) {
      showAlert("エラー", "移行に失敗しました。");
    }
  };

  const calculateTotalStock = (item: Item) => item.lots ? item.lots.reduce((sum, lot) => sum + lot.quantity, 0) : 0;
  const calculateStockByType = (item: Item, type: ProcessType) => {
    if (!item.lots) return 0;
    if (type === 'ALL') return calculateTotalStock(item);
    return item.lots.filter(lot => (processTypes[lot.process] || 'WIP') === type).reduce((sum, lot) => sum + lot.quantity, 0);
  };
  const calculateProductStock = (item: Item) => item.lots ? item.lots.filter(lot => { const t = processTypes[lot.process] || 'WIP'; return t === 'PRODUCT' || t === 'BOXED'; }).reduce((sum, lot) => sum + lot.quantity, 0) : 0;
  
  const stockByProcess = items.reduce((acc, item) => {
    if (item.lots) item.lots.forEach(lot => { acc[lot.process] = (acc[lot.process] || 0) + lot.quantity; });
    return acc;
  }, {} as Record<string, number>);

  const deleteItem = (id: number) => showConfirm('削除確認', 'この商品をマスタから削除しますか？', () => deleteItemFromDb(id));

  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProcessName && !processes.includes(newProcessName)) {
      saveProcesses([...processes, newProcessName], { ...processTypes, [newProcessName]: newProcessType });
      setNewProcessName('');
    }
  };
  const deleteProcess = (processName: string) => {
    showConfirm('工程削除', `工程「${processName}」を削除しますか？`, () => {
      const newTypes = { ...processTypes };
      delete newTypes[processName];
      saveProcesses(processes.filter(p => p !== processName), newTypes);
    });
  };
  const updateProcessType = (processName: string, type: ProcessType) => saveProcesses(processes, { ...processTypes, [processName]: type });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName && !categories.includes(newCategoryName)) { saveCategories([...categories, newCategoryName]); setNewCategoryName(''); }
  };
  const deleteCategory = (categoryName: string) => showConfirm('カテゴリ削除', `カテゴリ「${categoryName}」を削除しますか？`, () => saveCategories(categories.filter(c => c !== categoryName)));

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomerName && !customers.some(c => c.name === newCustomerName)) {
      const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
      saveCustomers([...customers, { id: newId, name: newCustomerName }]);
      setNewCustomerName('');
    }
  };
  const deleteCustomer = (id: number) => showConfirm('顧客削除', 'この顧客をマスタから削除しますか？', () => saveCustomers(customers.filter(c => c.id !== id)));

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    let itemToSave: Item;
    if (editingId) {
      const existing = items.find(i => i.id === editingId)!;
      itemToSave = { ...existing, ...newItem, price: Number(newItem.price), threshold: Number(newItem.threshold), targetStock: Number(newItem.targetStock), productionLotSize: Number(newItem.productionLotSize), processPrices: newItem.processPrices };
    } else {
      const id = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
      itemToSave = { ...newItem, id, price: Number(newItem.price), threshold: Number(newItem.threshold), targetStock: Number(newItem.targetStock), productionLotSize: Number(newItem.productionLotSize), processPrices: newItem.processPrices, lots: [] };
    }
    await saveItem(itemToSave);
    setIsItemModalOpen(false);
    resetItemForm();
  };

  const resetItemForm = () => { setNewItem({ code: '', name: '', customer: '', category: categories[0] || 'ウール', packaging: 'バラ', size: 'シングル', threshold: 10, targetStock: 20, productionLotSize: 10, price: 0, deadline: '', processPrices: {} }); setEditingId(null); };
  const openEditModal = (item: Item) => { setNewItem({ code: item.code, name: item.name, customer: item.customer || '', category: item.category, packaging: item.packaging || 'バラ', size: item.size, threshold: item.threshold, targetStock: item.targetStock, productionLotSize: item.productionLotSize || 10, price: item.price, deadline: item.deadline || '', processPrices: item.processPrices ? { ...item.processPrices } : {} }); setEditingId(item.id); setIsItemModalOpen(true); };
  const openNewItemModal = () => { resetItemForm(); setIsItemModalOpen(true); };

  const openStockModal = (item: Item, type: 'IN' | 'OUT' | 'MOVE', initialLot?: Partial<Lot>) => {
    setSelectedItem(item); setTransactionType(type); setIsLotIntegration(false);
    let defaultProcess = processes[0]; let defaultLotNo = '';
    if (initialLot) {
        if (initialLot.process) defaultProcess = initialLot.process;
        if (initialLot.lotNo) defaultLotNo = initialLot.lotNo;
    } else if (type !== 'IN' && item.lots.length > 0) {
        const firstActive = item.lots.find(l => l.quantity > 0);
        if (firstActive) { defaultLotNo = firstActive.lotNo; defaultProcess = firstActive.process; }
    }
    if (defaultLotNo === NO_LOT_ID) setIsLotIntegration(true);
    setTransactionData({ lotNo: defaultLotNo, quantity: 0, process: defaultProcess, targetProcess: processes.length > 1 ? processes[1] : processes[0] });
    setIsStockModalOpen(true);
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    const { lotNo, quantity, process, targetProcess } = transactionData;
    const amount = Number(quantity);
    if (amount <= 0) return;

    let srcLotNo = lotNo; let destLotNo = lotNo;
    if (transactionType === 'IN') {
        if (isLotIntegration) destLotNo = NO_LOT_ID;
        else if (!destLotNo) { showAlert('入力エラー', 'ロットNoを入力してください。'); return; }
    } else if (transactionType === 'MOVE') {
        const targetType = processTypes[targetProcess];
        if (targetType === 'PRODUCT' || targetType === 'BOXED' || isLotIntegration) destLotNo = NO_LOT_ID;
    }

    const itemToUpdate = JSON.parse(JSON.stringify(items.find(i => i.id === selectedItem.id))) as Item;
    
    if (transactionType === 'OUT' || transactionType === 'MOVE') {
      const targetLot = itemToUpdate.lots.find(l => l.lotNo === srcLotNo && l.process === process);
      if (!targetLot || targetLot.quantity < amount) { showAlert('在庫不足', '出庫・移動できません。'); return; }
    }
    if (transactionType === 'MOVE' && process === targetProcess) { showAlert('エラー', '移動元と移動先が同じです。'); return; }

    if (transactionType === 'IN') {
      const existing = itemToUpdate.lots.find(l => l.lotNo === destLotNo && l.process === process);
      if (existing) existing.quantity += amount;
      else itemToUpdate.lots.push({ lotNo: destLotNo, quantity: amount, process, receivedDate: getToday() });
    } else if (transactionType === 'OUT') {
      const existing = itemToUpdate.lots.find(l => l.lotNo === srcLotNo && l.process === process)!;
      existing.quantity -= amount;
    } else if (transactionType === 'MOVE') {
      const srcLot = itemToUpdate.lots.find(l => l.lotNo === srcLotNo && l.process === process)!;
      srcLot.quantity -= amount;
      const destLot = itemToUpdate.lots.find(l => l.lotNo === destLotNo && l.process === targetProcess);
      if (destLot) destLot.quantity += amount;
      else itemToUpdate.lots.push({ lotNo: destLotNo, quantity: amount, process: targetProcess, receivedDate: srcLot.receivedDate });
    }

    await saveItem(itemToUpdate);
    setIsStockModalOpen(false); setIsSelectingItem(false);
  };

  const handleBulkMove = async () => {
    if (!viewingProcess || !bulkTargetProcess || viewingProcess === bulkTargetProcess) return;

    const itemsToUpdate: Item[] = [];
    const targetType = processTypes[bulkTargetProcess];

    items.forEach(item => {
      const relevantLots = item.lots.filter(lot => lot.process === viewingProcess && selectedLots.has(`${item.id}-${lot.lotNo}`) && lot.quantity > 0);
      if (relevantLots.length === 0) return;

      const newItem = JSON.parse(JSON.stringify(item)) as Item;
      relevantLots.forEach(sourceLot => {
        const moveQuantity = sourceLot.quantity;
        const srcLotRef = newItem.lots.find(l => l.lotNo === sourceLot.lotNo && l.process === viewingProcess)!;
        srcLotRef.quantity = 0;

        const destLotNo = (targetType === 'PRODUCT' || targetType === 'BOXED') ? NO_LOT_ID : sourceLot.lotNo;
        const destLotRef = newItem.lots.find(l => l.lotNo === destLotNo && l.process === bulkTargetProcess);
        
        if (destLotRef) destLotRef.quantity += moveQuantity;
        else newItem.lots.push({ lotNo: destLotNo, quantity: moveQuantity, process: bulkTargetProcess, receivedDate: sourceLot.receivedDate });
      });
      itemsToUpdate.push(newItem);
    });

    await saveMultipleItems(itemsToUpdate);
    setSelectedLots(new Set()); setIsBulkMoveModalOpen(false); setBulkTargetProcess('');
  };

  const addAssemblySource = () => { setAssemblySources([...assemblySources, { uid: crypto.randomUUID(), itemId: '', lotNo: '', quantity: 1, process: '' }]); };
  const removeAssemblySource = (uid: string) => { if (assemblySources.length > 1) setAssemblySources(assemblySources.filter(s => s.uid !== uid)); };
  const updateAssemblySource = (uid: string, field: keyof AssemblySourceItem, value: string | number) => {
    setAssemblySources(prev => prev.map(s => {
      if (s.uid !== uid) return s;
      const newSource = { ...s, [field]: value };
      if (field === 'itemId') { newSource.lotNo = ''; newSource.process = ''; }
      if (field === 'lotNo') {
         const item = items.find(i => i.id === Number(newSource.itemId));
         const lot = item?.lots.find(l => l.lotNo === value && l.quantity > 0);
         newSource.process = lot ? lot.process : '';
      }
      return newSource;
    }));
  };

  const handleAssembly = async (e: React.FormEvent) => {
    e.preventDefault();
    const { targetItemId, targetQuantity, process } = assemblyTarget;
    const newLotNo = NO_LOT_ID;

    if (!targetItemId || !process) { showAlert('入力エラー', '完成品の情報を入力してください。'); return; }
    if (assemblySources.some(s => !s.itemId || !s.lotNo || s.quantity <= 0)) { showAlert('入力エラー', '加工元の情報を正しく入力してください。'); return; }
    if (Number(targetQuantity) <= 0) { showAlert('入力エラー', '完成数量は1以上を指定してください。'); return; }

    for (const source of assemblySources) {
      const item = items.find(i => i.id === Number(source.itemId));
      const lot = item?.lots.find(l => l.lotNo === source.lotNo && l.process === source.process);
      if (!lot || lot.quantity < source.quantity) { showAlert('在庫不足', `加工元の在庫が不足しています。\n${item?.name} (Lot:${source.lotNo})`); return; }
    }

    let newItems = JSON.parse(JSON.stringify(items)) as Item[];
    const changedItems = new Set<number>();

    assemblySources.forEach(source => {
      const itemIdx = newItems.findIndex(i => i.id === Number(source.itemId));
      const lotIdx = newItems[itemIdx].lots.findIndex(l => l.lotNo === source.lotNo && l.process === source.process);
      newItems[itemIdx].lots[lotIdx].quantity -= Number(source.quantity);
      changedItems.add(newItems[itemIdx].id);
    });

    const targetIdx = newItems.findIndex(i => i.id === Number(targetItemId));
    const existingLotIdx = newItems[targetIdx].lots.findIndex(l => l.lotNo === newLotNo && l.process === process);
    if (existingLotIdx > -1) newItems[targetIdx].lots[existingLotIdx].quantity += Number(targetQuantity);
    else newItems[targetIdx].lots.push({ lotNo: newLotNo, quantity: Number(targetQuantity), process: process, receivedDate: getToday() });
    changedItems.add(newItems[targetIdx].id);

    const itemsToSave = newItems.filter(i => changedItems.has(i.id));
    await saveMultipleItems(itemsToSave);

    setIsAssemblyModalOpen(false);
    setAssemblySources([{ uid: crypto.randomUUID(), itemId: '', lotNo: '', quantity: 1, process: '' }]);
    setAssemblyTarget({ targetItemId: '', targetQuantity: 1, process: '', newLotNo: '' });
    showAlert('完了', '加工・セット組み処理が完了しました。');
  };

  const filteredItems = items.filter(item => {
    const lowerSearch = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || item.name.toLowerCase().includes(lowerSearch) || item.code.toLowerCase().includes(lowerSearch) || item.category.toLowerCase().includes(lowerSearch) || item.lots.some(lot => lot.lotNo.toLowerCase().includes(lowerSearch));
    const matchesCustomer = selectedCustomerFilter === '' || item.customer === selectedCustomerFilter;
    const matchesProcess = selectedProcessFilter ? item.lots.some(lot => lot.process === selectedProcessFilter && lot.quantity > 0) : true;
    const productStock = calculateProductStock(item);
    const matchesLowStock = isLowStockFilterActive ? productStock <= item.threshold : true;
    const totalHeld = calculateStockByType(item, 'ALL');
    const matchesRawMaterialShortage = isRawMaterialShortageFilterActive ? (item.targetStock - totalHeld > 0) : true;
    const daysUntilDeadline = item.deadline ? getDaysUntil(item.deadline) : null;
    const matchesDeadlineAlert = isDeadlineFilterActive ? (daysUntilDeadline !== null && daysUntilDeadline <= 7) : true;
    return matchesSearch && matchesCustomer && matchesProcess && matchesLowStock && matchesDeadlineAlert && matchesRawMaterialShortage;
  }).sort((a, b) => {
    switch (sortOption) {
      case 'code_asc': return a.code.localeCompare(b.code);
      case 'stock_desc': return calculateProductStock(b) - calculateProductStock(a);
      case 'stock_asc': return calculateProductStock(a) - calculateProductStock(b);
      case 'deadline_asc': if (!a.deadline) return 1; if (!b.deadline) return -1; return a.deadline.localeCompare(b.deadline);
      default: return 0;
    }
  });

  const totalStock = items.reduce((acc, item) => acc + calculateTotalStock(item), 0);
  const totalWIP = items.reduce((acc, item) => acc + calculateStockByType(item, 'WIP'), 0);
  const totalProduct = items.reduce((acc, item) => acc + calculateStockByType(item, 'PRODUCT'), 0);
  const totalBoxed = items.reduce((acc, item) => acc + calculateStockByType(item, 'BOXED'), 0);
  const lowStockCount = items.filter(item => calculateProductStock(item) <= item.threshold).length;
  const rawMaterialShortageCount = items.filter(item => (item.targetStock - calculateStockByType(item, 'ALL') > 0)).length;
  const deadlineAlertCount = items.filter(item => { const d = item.deadline ? getDaysUntil(item.deadline) : null; return d !== null && d <= 7; }).length;

  const inventoryValue = items.reduce((total, item) => total + item.lots.reduce((lt, lot) => lt + (lot.quantity * (item.processPrices?.[lot.process] ?? item.price)), 0), 0);
  const valuationByProcess = processes.reduce((acc, process) => {
    acc[process] = items.reduce((sum, item) => sum + (item.lots.filter(l => l.process === process).reduce((q, l) => q + l.quantity, 0) * (item.processPrices?.[process] ?? item.price)), 0);
    return acc;
  }, {} as Record<string, number>);

  const clearFilters = () => { setSearchQuery(''); setSelectedCustomerFilter(''); setSortOption('default'); setSelectedProcessFilter(null); setIsLowStockFilterActive(false); setIsDeadlineFilterActive(false); setIsRawMaterialShortageFilterActive(false); };
  const closeProcessModal = () => { setViewingProcess(null); setIsSelectingItem(false); setItemSearchTerm(''); setSelectedLots(new Set()); };
  const handleProcessPriceChange = (process: string, value: string) => setNewItem(prev => ({ ...prev, processPrices: { ...prev.processPrices, [process]: Number(value) } }));

  if (loadingItems || loadingMasters) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-indigo-600 font-bold flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          Firebaseからデータを読み込んでいます...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
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
                <button type="button" onClick={closeDialog} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
                  {dialogConfig.type === 'CONFIRM' ? 'キャンセル' : '閉じる'}
                </button>
                {dialogConfig.type === 'CONFIRM' && (
                  <button type="button" onClick={handleDialogConfirm} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md">
                    実行する
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Header
        isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} setIsAssemblyModalOpen={setIsAssemblyModalOpen}
        setIsInventoryValuationOpen={setIsInventoryValuationOpen} setIsSettingsOpen={setIsSettingsOpen}
        setIsCustomerModalOpen={setIsCustomerModalOpen} setIsMasterModalOpen={setIsMasterModalOpen} openNewItemModal={openNewItemModal}
      />
      
      <main className="w-full px-4 py-6 md:py-8">
        {items.length === 0 && (
          <div className="mb-8 p-6 bg-indigo-50 border border-indigo-200 rounded-xl text-center shadow-sm">
            <h2 className="text-lg font-bold text-indigo-800 mb-2">Firestoreのセットアップが完了しました！</h2>
            <p className="text-slate-600 mb-4">現在データベースは空です。お試しデータをFirebaseにアップロードして開始しますか？</p>
            <button onClick={handleMigrateData} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-colors">
              初期データをFirebaseにアップロード
            </button>
          </div>
        )}

        <SummaryCards 
          totalStock={totalStock} totalWIP={totalWIP} totalProduct={totalProduct} totalBoxed={totalBoxed} deadlineAlertCount={deadlineAlertCount}
          lowStockCount={lowStockCount} rawMaterialShortageCount={rawMaterialShortageCount} isDeadlineFilterActive={isDeadlineFilterActive}
          setIsDeadlineFilterActive={setIsDeadlineFilterActive} isLowStockFilterActive={isLowStockFilterActive} setIsLowStockFilterActive={setIsLowStockFilterActive}
          isRawMaterialShortageFilterActive={isRawMaterialShortageFilterActive} setIsRawMaterialShortageFilterActive={setIsRawMaterialShortageFilterActive} setViewingStockType={setViewingStockType}
        />

        <ProcessChart 
          processes={processes} processTypes={processTypes} stockByProcess={stockByProcess} totalStock={totalStock} setViewingProcess={setViewingProcess}
        />

        <ItemTable 
          filteredItems={filteredItems} customers={customers} processes={processes} processTypes={processTypes} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          selectedCustomerFilter={selectedCustomerFilter} setSelectedCustomerFilter={setSelectedCustomerFilter} sortOption={sortOption} setSortOption={setSortOption}
          isLowStockFilterActive={isLowStockFilterActive} isDeadlineFilterActive={isDeadlineFilterActive} isRawMaterialShortageFilterActive={isRawMaterialShortageFilterActive}
          selectedProcessFilter={selectedProcessFilter} clearFilters={clearFilters} calculateProductStock={calculateProductStock} calculateStockByType={calculateStockByType}
          getDaysUntil={getDaysUntil} openEditModal={openEditModal} deleteItem={deleteItem}
        />
      </main>

      {/* --- モーダル群 --- */}
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
                    <th className="p-4 font-semibold">品番</th><th className="p-4 font-semibold">商品名 / 納期</th><th className="p-4 font-semibold">顧客名</th>
                    <th className="p-4 font-semibold text-right w-24">必要在庫数</th><th className="p-4 font-semibold text-right w-32">現在庫数</th>
                    {viewingStockType === 'ALL' && (<><th className="p-4 font-semibold text-right text-xs text-indigo-600 w-24">内 製品・箱入</th><th className="p-4 font-semibold text-right text-xs text-slate-500 w-24">内 仕掛</th></>)}
                    <th className="p-4 font-semibold text-right">不足数 (アラート)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.flatMap(item => { const stock = calculateStockByType(item, viewingStockType); return stock > 0 ? [item] : []; }).sort((a, b) => a.code.localeCompare(b.code)).map((item) => {
                    const stock = calculateStockByType(item, viewingStockType);
                    let shortageDisplay = null;
                    if (viewingStockType === 'PRODUCT') {
                        const shortage = Math.max(0, item.targetStock - stock);
                         if (shortage > 0) shortageDisplay = <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">製品不足 {shortage}</span>;
                    } else if (viewingStockType === 'WIP') {
                        const totalHeld = calculateStockByType(item, 'ALL');
                        const shortage = Math.max(0, item.targetStock - totalHeld);
                        if (shortage > 0) shortageDisplay = <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">投入不足 {shortage}</span>;
                        else shortageDisplay = <span className="text-xs text-emerald-600 font-medium">充足中</span>;
                    } else if (viewingStockType === 'ALL') {
                         const shortage = Math.max(0, item.targetStock - stock);
                         if (shortage > 0) shortageDisplay = <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">総量不足 {shortage}</span>;
                    }

                    return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-indigo-700">{item.code}</td>
                      <td className="p-4 font-bold text-slate-800">{item.name}<div className="text-xs text-slate-500 font-normal mt-0.5">{item.category} / {item.size}</div>{item.deadline && <div className="text-xs text-red-500 font-normal mt-1 flex items-center gap-1"><Calendar size={10} /> 納期: {item.deadline}</div>}</td>
                      <td className="p-4 text-slate-600 text-sm">{item.customer || '-'}</td>
                      <td className="p-4 text-right font-medium text-slate-500">{item.targetStock.toLocaleString()}</td>
                      <td className="p-4 text-right font-bold text-lg text-slate-700">{stock.toLocaleString()} <span className="text-sm font-normal text-slate-400">枚</span></td>
                      {viewingStockType === 'ALL' && (<><td className="p-4 text-right text-sm font-medium text-indigo-600">{calculateProductStock(item).toLocaleString()}</td><td className="p-4 text-right text-sm text-slate-500">{calculateStockByType(item, 'WIP').toLocaleString()}</td></>)}
                      <td className="p-4 text-right">{shortageDisplay || <span className="text-slate-300 text-xs">-</span>}</td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-200 text-right text-sm text-slate-500 shrink-0">
               合計: {items.reduce((acc, item) => acc + calculateStockByType(item, viewingStockType), 0).toLocaleString()} 枚
            </div>
          </div>
        </div>
      )}
      
      {viewingProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" style={{zIndex: 50}}>
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in overflow-hidden relative">
            <div className="bg-indigo-800 px-6 py-4 flex justify-between items-center text-white shrink-0">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <MapPin size={24} /> 
                {isSelectingItem ? '入庫する品番を選択' : `「${viewingProcess}」在庫一覧`}
              </h2>
              <div className="flex items-center gap-3">
                {!isSelectingItem && <button type="button" onClick={() => setIsSelectingItem(true)} className="bg-white text-indigo-800 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-50 flex items-center gap-1"><Plus size={16} /> この工程に入庫</button>}
                {isSelectingItem && <button type="button" onClick={() => setIsSelectingItem(false)} className="text-indigo-200 hover:text-white text-sm underline">一覧に戻る</button>}
                <button type="button" onClick={closeProcessModal} className="opacity-80 hover:opacity-100 ml-2"><X size={28} /></button>
              </div>
            </div>
             
            <div className="p-0 overflow-auto flex-1 bg-slate-50 pb-20">
              {isSelectingItem ? (
                <div className="p-6">
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input type="text" placeholder="品番・商品名で検索..." className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg" value={itemSearchTerm} onChange={(e) => setItemSearchTerm(e.target.value)} autoFocus />
                  </div>
                  <div className="grid gap-3">
                    {items.filter(i => i.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) || i.code.toLowerCase().includes(itemSearchTerm.toLowerCase())).map(item => (
                      <button type="button" key={item.id} onClick={() => openStockModal(item, 'IN', { process: viewingProcess || undefined, lotNo: '', quantity: 0 })} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 text-left group">
                        <div>
                          <div className="flex items-center gap-2 mb-1"><span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 rounded">{item.code}</span><span className="font-bold text-slate-800 text-lg">{item.name}</span></div>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 px-3 py-2 rounded-lg group-hover:bg-indigo-600 group-hover:text-white"><Plus size={20} /> 選択して入庫</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (() => {
                const inventory = items.flatMap(item => item.lots.filter(l => l.process === viewingProcess && l.quantity > 0).map(lot => ({ item, lot, key: `${item.id}-${lot.lotNo}` })));
                if (inventory.length === 0) return (<div className="p-12 text-center text-slate-400">現在庫がありません。</div>);
                return (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 text-sm border-b sticky top-0 shadow-sm z-10">
                      <tr>
                        <th className="p-4 w-12 text-center"><button type="button" onClick={() => { const allKeys = inventory.map(i=>i.key); setSelectedLots(selectedLots.size === allKeys.length ? new Set() : new Set(allKeys)); }} className="text-slate-400 hover:text-indigo-600">{selectedLots.size > 0 && selectedLots.size === inventory.length ? <CheckSquare size={20} className="text-indigo-600"/> : <Square size={20}/>}</button></th>
                        <th className="p-4 font-semibold">品番</th><th className="p-4 font-semibold">商品名</th><th className="p-4 font-semibold text-right">在庫数</th><th className="p-4 font-semibold text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inventory.map(({item, lot, key}) => (
                        <tr key={key} className={`hover:bg-slate-50 ${selectedLots.has(key) ? 'bg-indigo-50' : 'bg-white'}`}>
                          <td className="p-4 text-center"><button type="button" onClick={() => { const newSel = new Set(selectedLots); newSel.has(key) ? newSel.delete(key) : newSel.add(key); setSelectedLots(newSel); }} className="text-slate-400">{selectedLots.has(key) ? <CheckSquare size={20} className="text-indigo-600"/> : <Square size={20}/>}</button></td>
                          <td className="p-4 font-mono font-bold text-indigo-700">{item.code}</td>
                          <td className="p-4 font-bold text-slate-800 text-sm">{item.name} <span className="text-xs text-slate-500 font-normal">({lot.lotNo})</span></td>
                          <td className="p-4 text-right font-bold text-lg">{lot.quantity}</td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button type="button" onClick={() => openStockModal(item, 'IN', lot)} className="px-3 py-1.5 text-xs bg-indigo-100 text-indigo-800 rounded font-bold flex items-center gap-1"><Plus size={14}/> 追加</button>
                              <button type="button" onClick={() => openStockModal(item, 'MOVE', lot)} className="px-3 py-1.5 text-xs bg-emerald-100 text-emerald-800 rounded font-bold flex items-center gap-1"><ArrowRightLeft size={14}/> 移動</button>
                              <button type="button" onClick={() => openStockModal(item, 'OUT', lot)} className="px-3 py-1.5 text-xs bg-slate-100 text-slate-600 rounded font-bold flex items-center gap-1"><LogOut size={14}/> 廃棄</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>
             
            {selectedLots.size > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-2xl flex items-center justify-between z-20">
                <div className="font-bold text-slate-700 ml-4">{selectedLots.size} 件選択中</div>
                <button type="button" onClick={() => setIsBulkMoveModalOpen(true)} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md"><ArrowRightLeft size={18} /> 一括移動する</button>
              </div>
            )}
          </div>
        </div>
      )}

      {isInventoryValuationOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{zIndex: 50}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-indigo-800 px-6 py-4 flex justify-between items-center text-white shrink-0">
              <h2 className="font-bold text-lg flex items-center gap-2"><ClipboardList size={20} /> 棚卸・資産評価</h2>
              <button type="button" onClick={() => setIsInventoryValuationOpen(false)}><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 text-center">
                <h3 className="text-slate-500 text-sm font-medium mb-1">現在の全在庫資産評価額</h3>
                <p className="text-3xl md:text-4xl font-bold text-slate-800">¥{inventoryValue.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                    <tr><th className="px-4 py-2 text-left">工程名</th><th className="px-4 py-2 text-right">在庫数</th><th className="px-4 py-2 text-right">評価額計</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {processes.map((process) => {
                      const count = stockByProcess[process] || 0;
                      return (
                        <tr key={process}>
                          <td className="px-4 py-3 font-medium text-slate-700">{process}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{count.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono font-medium">¥{(valuationByProcess[process] || 0).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{zIndex: 50}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-800 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-lg flex items-center gap-2"><Settings size={20} /> 設定</h2>
              <button type="button" onClick={() => setIsSettingsOpen(false)}><X size={24} /></button>
            </div>
            <div className="flex border-b border-slate-200">
              <button type="button" className={`flex-1 py-3 font-bold text-sm ${activeSettingsTab === 'PROCESS' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`} onClick={() => setActiveSettingsTab('PROCESS')}>工程マスタ設定</button>
              <button type="button" className={`flex-1 py-3 font-bold text-sm ${activeSettingsTab === 'CATEGORY' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`} onClick={() => setActiveSettingsTab('CATEGORY')}>カテゴリ設定</button>
            </div>
            <div className="p-6">
              {activeSettingsTab === 'PROCESS' ? (
                <>
                  <form onSubmit={handleAddProcess} className="flex gap-2 mb-6">
                    <input type="text" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg" placeholder="新しい工程" value={newProcessName} onChange={(e) => setNewProcessName(e.target.value)} />
                    <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm" value={newProcessType} onChange={(e) => setNewProcessType(e.target.value as ProcessType)}>
                        <option value="WIP">仕掛</option><option value="PRODUCT">製品</option><option value="BOXED">箱入</option>
                    </select>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">追加</button>
                  </form>
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {processes.map((process, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                        <div className="flex items-center gap-3">
                            <span className="font-medium">{process}</span>
                            <select className="text-xs px-2 py-1 rounded border outline-none" value={processTypes[process] || 'WIP'} onChange={(e) => updateProcessType(process, e.target.value as ProcessType)}>
                              <option value="WIP">仕掛</option><option value="PRODUCT">製品</option><option value="BOXED">箱入</option>
                            </select>
                        </div>
                        <button type="button" onClick={() => deleteProcess(process)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                    <input type="text" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg" placeholder="新しいカテゴリ" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">追加</button>
                  </form>
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {categories.map((category, idx) => (
                      <li key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                        <span className="font-medium">{category}</span>
                        <button type="button" onClick={() => deleteCategory(category)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isMasterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{zIndex: 50}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="bg-indigo-900 px-6 py-4 flex justify-between items-center text-white shrink-0 rounded-t-xl">
              <h2 className="font-bold text-lg flex items-center gap-2"><Database size={20} /> 商品マスタ管理</h2>
              <button type="button" onClick={() => setIsMasterModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="p-6 overflow-auto flex-1 bg-slate-50">
              <div className="flex justify-end mb-4">
                <button type="button" onClick={openNewItemModal} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={18} /> 新規登録</button>
              </div>
              <table className="w-full text-left bg-white border border-slate-200">
                <thead className="bg-slate-100 text-slate-600 text-sm"><tr><th className="p-4 border-b">品番</th><th className="p-4 border-b">商品名</th><th className="p-4 border-b text-center">操作</th></tr></thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b"><td className="p-4 font-mono text-indigo-700">{item.code}</td><td className="p-4 font-bold">{item.name}</td>
                    <td className="p-4 text-center">
                        <button type="button" onClick={() => openEditModal(item)} className="p-2 text-indigo-600"><Edit size={18} /></button>
                        <button type="button" onClick={() => deleteItem(item.id)} className="p-2 text-red-500"><Trash2 size={18} /></button>
                    </td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{zIndex: 50}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-indigo-800 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-lg flex items-center gap-2"><Users size={20} /> 顧客マスタ管理</h2>
              <button type="button" onClick={() => setIsCustomerModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddCustomer} className="flex gap-2 mb-6">
                  <input type="text" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg" placeholder="例: 株式会社〇〇ホテル" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} />
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">追加</button>
              </form>
              <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
                {customers.map((customer) => (
                  <li key={customer.id} className="flex justify-between p-3 bg-white"><span className="font-medium text-slate-700 flex items-center gap-2"><Building2 size={16} className="text-slate-400" />{customer.name}</span><button type="button" onClick={() => deleteCustomer(customer.id)} className="text-red-500"><Trash2 size={16} /></button></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {isAssemblyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{zIndex: 50}}>
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-indigo-800 px-6 py-4 flex justify-between items-center text-white shrink-0">
              <h2 className="font-bold text-lg flex items-center gap-2"><Blocks size={20} /> 箱詰・加工・セット組</h2>
              <button type="button" onClick={() => setIsAssemblyModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAssembly} className="p-6 overflow-y-auto flex-1">
               <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2"><span className="bg-slate-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>加工元の在庫を選択</h3>
                  <div className="space-y-4">
                    {assemblySources.map((source) => (
                      <div key={source.uid} className="relative p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                        {assemblySources.length > 1 && (<button type="button" onClick={() => removeAssemblySource(source.uid)} className="absolute top-2 right-2 text-slate-400"><X size={16} /></button>)}
                        <div className="grid gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">加工する商品（親在庫）</label>
                            <select className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={source.itemId} onChange={(e) => updateAssemblySource(source.uid, 'itemId', e.target.value)}>
                              <option value="">-- 商品を選択 --</option>
                              {items.filter(i => calculateTotalStock(i) > 0).map(item => (<option key={item.id} value={item.id}>{item.code} : {item.name}</option>))}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                             <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">使用するロット</label>
                              <select className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={source.lotNo} onChange={(e) => updateAssemblySource(source.uid, 'lotNo', e.target.value)} disabled={!source.itemId}>
                                <option value="">-- ロットを選択 --</option>
                                {source.itemId && items.find(i => i.id === Number(source.itemId))?.lots.filter(l => l.quantity > 0).map(l => (<option key={`${l.lotNo}-${l.process}`} value={l.lotNo}>{l.lotNo} ({l.process} / 在庫:{l.quantity})</option>))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">消費数量</label>
                              <div className="flex items-center"><input type="number" min="1" className="w-full px-3 py-2 border border-slate-300 rounded text-right pr-8 text-sm" value={source.quantity} onChange={(e) => updateAssemblySource(source.uid, 'quantity', Number(e.target.value))} /><span className="text-slate-500 -ml-6 text-xs">枚</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addAssemblySource} className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-bold flex items-center justify-center gap-2 text-sm"><Plus size={16} /> 構成品を追加</button>
                  </div>
                </div>
                <div className="flex justify-center -my-2 text-slate-400"><ArrowUpDown size={24} /></div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h3 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2"><span className="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>完成する製品・場所を指定</h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-xs font-medium text-indigo-700 mb-1">完成する商品（変換後）</label>
                      <select className="w-full px-3 py-2 border border-indigo-300 rounded" value={assemblyTarget.targetItemId} onChange={(e) => setAssemblyTarget({...assemblyTarget, targetItemId: e.target.value})}>
                        <option value="">-- 商品を選択 --</option>
                        {items.map(item => (<option key={item.id} value={item.id}>{item.code} : {item.name}</option>))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                        <label className="block text-xs font-medium text-indigo-700 mb-1">完成数量（セット数）</label>
                        <div className="flex items-center"><input type="number" min="1" className="w-full px-3 py-2 border border-indigo-300 rounded text-right pr-8 font-bold" value={assemblyTarget.targetQuantity} onChange={(e) => setAssemblyTarget({...assemblyTarget, targetQuantity: Number(e.target.value)})} /><span className="text-indigo-600 -ml-6 text-sm">個</span></div>
                      </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-indigo-700 mb-1">保管場所（工程）</label>
                        <select className="w-full px-3 py-2 border border-indigo-300 rounded" value={assemblyTarget.process} onChange={(e) => setAssemblyTarget({...assemblyTarget, process: e.target.value})}>
                          <option value="">-- 場所を選択 --</option>
                          {processes.map(p => (<option key={p} value={p}>{p}</option>))}
                        </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAssemblyModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">キャンセル</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-2"><Blocks size={18} /> 加工実行</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4" style={{zIndex: 60}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-indigo-800 px-6 py-4 flex justify-between items-center text-white shrink-0">
              <h2 className="font-bold text-lg">{editingId ? '商品マスタ編集' : '新規品番登録'}</h2>
              <button type="button" onClick={() => setIsItemModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto flex-1">
               <div className="grid gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1"><label className="block text-sm mb-1 text-slate-600">品番</label><input required className="w-full border p-2 rounded" value={newItem.code} onChange={(e) => setNewItem({...newItem, code: e.target.value})} /></div>
                    <div className="col-span-2"><label className="block text-sm mb-1 text-slate-600">商品名</label><input required className="w-full border p-2 rounded" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} /></div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-slate-600">顧客名</label>
                    <select className="w-full border p-2 rounded" value={newItem.customer} onChange={(e) => setNewItem({...newItem, customer: e.target.value})}>
                      <option value="">-- 選択 --</option>{customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="block text-sm mb-1 text-slate-600">カテゴリ</label><select className="w-full border p-2 rounded" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="block text-sm mb-1 text-slate-600">荷姿</label><select className="w-full border p-2 rounded" value={newItem.packaging} onChange={(e) => setNewItem({...newItem, packaging: e.target.value})}><option value="バラ">バラ</option><option value="箱入">箱入</option><option value="セット">セット</option></select></div>
                    <div><label className="block text-sm mb-1 text-slate-600">サイズ</label><select className="w-full border p-2 rounded" value={newItem.size} onChange={(e) => setNewItem({...newItem, size: e.target.value})}><option value="シングル">シングル</option><option value="ダブル">ダブル</option><option value="ハーフ">ハーフ</option></select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm mb-1 text-slate-600">目標在庫数</label><input type="number" className="w-full border p-2 rounded" value={newItem.targetStock} onChange={(e) => setNewItem({...newItem, targetStock: Number(e.target.value)})} /></div>
                    <div><label className="block text-sm mb-1 text-slate-600">発注点</label><input type="number" className="w-full border p-2 rounded" value={newItem.threshold} onChange={(e) => setNewItem({...newItem, threshold: Number(e.target.value)})} /></div>
                    <div><label className="block text-sm mb-1 text-slate-600">生産ロット数</label><input type="number" className="w-full border p-2 rounded" value={newItem.productionLotSize} onChange={(e) => setNewItem({...newItem, productionLotSize: Number(e.target.value)})} /></div>
                    <div><label className="block text-sm mb-1 text-slate-600">標準単価 (円)</label><input type="number" className="w-full border p-2 rounded" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})} /></div>
                  </div>
                  <details className="group border border-slate-200 rounded-lg bg-slate-50 mt-2">
                    <summary className="cursor-pointer p-3 font-medium text-slate-700 flex items-center gap-2"><JapaneseYen size={16} /> 工程別単価設定</summary>
                    <div className="p-4 pt-0 grid grid-cols-2 gap-3">
                      {processes.map(p => (
                        <div key={p}><label className="block text-xs mb-1 text-slate-600">{p}</label><input type="number" className="w-full border p-1.5 rounded text-sm" value={newItem.processPrices[p] || ''} onChange={(e) => handleProcessPriceChange(p, e.target.value)} /></div>
                      ))}
                    </div>
                  </details>
               </div>
               <div className="mt-6 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsItemModalOpen(false)} className="px-4 py-2 text-slate-600">キャンセル</button>
                 <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded font-bold flex items-center gap-2"><Save size={18}/> 保存</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {isStockModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4" style={{zIndex: 60}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className={`px-6 py-4 flex justify-between items-center text-white ${transactionType === 'IN' ? 'bg-indigo-600' : transactionType === 'MOVE' ? 'bg-emerald-600' : 'bg-slate-600'}`}>
              <h2 className="font-bold text-lg flex items-center gap-2">
                {transactionType === 'IN' && <Plus size={20}/>}{transactionType === 'MOVE' && <ArrowRightLeft size={20}/>}{transactionType === 'OUT' && <Minus size={20}/>}
                {transactionType === 'IN' ? '入庫処理' : transactionType === 'MOVE' ? '移動処理' : '出庫処理'}
              </h2>
              <button type="button" onClick={() => setIsStockModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleTransaction} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-slate-500 mb-1">対象品番</p>
                <div className="font-bold text-lg text-slate-800">{selectedItem.code} {selectedItem.name}</div>
              </div>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{transactionType === 'IN' ? '入庫先' : '移動・出庫元'}の工程</label>
                  <select required className="w-full px-4 py-2 border border-slate-300 rounded-lg" value={transactionData.process} onChange={(e) => setTransactionData({...transactionData, process: e.target.value})}>
                    {transactionType === 'IN' ? processes.map(p => <option key={p} value={p}>{p}</option>) : selectedItem.lots.filter(l => l.lotNo === (isLotIntegration ? NO_LOT_ID : transactionData.lotNo) && l.quantity > 0).map(l => <option key={l.process} value={l.process}>{l.process} (在庫: {l.quantity})</option>)}
                  </select>
                </div>
                {transactionType === 'MOVE' && (processTypes[transactionData.targetProcess] === 'PRODUCT' || processTypes[transactionData.targetProcess] === 'BOXED') ? (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800 flex items-center gap-2"><Merge size={18} />自動統合されます</div>
                ) : (
                     <div>
                      <div className="flex justify-between items-center mb-1">
                         <label className="block text-sm font-medium text-slate-700">ロットNo</label>
                         {(transactionType === 'IN') && (processTypes[transactionData.process] === 'PRODUCT' || processTypes[transactionData.process] === 'BOXED') && (
                             <label className="flex items-center gap-1 text-xs text-indigo-600"><input type="checkbox" checked={isLotIntegration} onChange={(e) => setIsLotIntegration(e.target.checked)}/>ロット管理しない</label>
                         )}
                      </div>
                      {!isLotIntegration ? (
                        transactionType === 'IN' ? (
                          <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono uppercase" placeholder="例: 24-A001" value={transactionData.lotNo} onChange={(e) => setTransactionData({...transactionData, lotNo: e.target.value})} />
                        ) : (
                          <select required className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono" value={transactionData.lotNo} onChange={(e) => { const lot = selectedItem.lots.find(l => l.lotNo === e.target.value && l.quantity > 0); setTransactionData({ ...transactionData, lotNo: e.target.value, process: lot ? lot.process : processes[0] }); }}>
                            <option value="">-- 選択 --</option>{Array.from(new Set(selectedItem.lots.filter(l => l.quantity > 0 && l.lotNo !== NO_LOT_ID).map(l => l.lotNo))).map(lotNo => (<option key={lotNo} value={lotNo}>{lotNo}</option>))}
                          </select>
                        )
                      ) : (
                        <div className="w-full px-4 py-2 border border-slate-200 bg-slate-100 rounded-lg text-slate-500 text-sm flex items-center gap-2"><Layers size={16} /> 統合在庫として計上</div>
                      )}
                    </div>
                )}
                {transactionType === 'MOVE' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">移動先の工程</label>
                    <select required className="w-full px-4 py-2 border border-emerald-300 rounded-lg bg-emerald-50" value={transactionData.targetProcess} onChange={(e) => setTransactionData({...transactionData, targetProcess: e.target.value})}>
                      {processes.map(p => <option key={p} value={p} disabled={p === transactionData.process}>{p}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">数量 (枚)</label>
                  <input required type="number" min="1" className="w-full px-4 py-3 border border-slate-300 rounded-lg text-xl font-bold text-right" value={transactionData.quantity} onChange={(e) => setTransactionData({...transactionData, quantity: Number(e.target.value)})} />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsStockModalOpen(false)} className="px-4 py-2 text-slate-600">キャンセル</button>
                <button type="submit" className={`px-6 py-2 text-white rounded-lg font-bold flex items-center gap-2 ${transactionType === 'IN' ? 'bg-indigo-600' : transactionType === 'MOVE' ? 'bg-emerald-600' : 'bg-slate-600'}`}>実行する</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBulkMoveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-60 p-4" style={{zIndex: 60}}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="font-bold text-lg flex items-center gap-2"><ArrowRightLeft size={20} /> 在庫一括移動</h2>
              <button type="button" onClick={() => setIsBulkMoveModalOpen(false)}><X size={24} /></button>
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
                <button type="button" onClick={() => setIsBulkMoveModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">キャンセル</button>
                <button type="button" onClick={handleBulkMove} disabled={!bulkTargetProcess} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"><ArrowRightLeft size={18} /> 一括移動実行</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}