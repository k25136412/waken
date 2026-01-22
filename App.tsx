// App.tsx
import React, { useState, useEffect } from 'react';
import {
  Plus, Package, Settings, Users, Database, Minimize, Maximize, Blocks, ClipboardList, MapPin, List
} from 'lucide-react';

import { Item, Lot, Customer, ProcessType, SortOption, AssemblySourceItem, NO_LOT_ID } from './types';
import { initialData, initialProcessNames, initialProcessTypes, initialCategories, initialCustomers } from './constants';
import { getToday, getDaysUntil, calculateTotalStock, calculateStockByType, calculateProductStock } from './utils';

import { CustomDialog } from './components/Common';
import { Dashboard } from './components/Dashboard';
import { InventoryList } from './components/InventoryList';

// ※ モーダルの中身のコンポーネントも本来はimportしますが、
// ここでは元のコードロジックを維持するため、App内に記述または適宜分割を想定してください。

// ★ 1. 編集モーダルのコンポーネントを定義
const EditItemModal: React.FC<{
  isOpen: boolean;
  item: Item | null;
  onClose: () => void;
  onSave: (updatedItem: Item) => void;
  customers: Customer[];
  categories: string[];
}> = ({ isOpen, item, onClose, onSave, customers, categories }) => {
  const [formData, setFormData] = useState<Partial<Item>>({});

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // Tbd: handle checkbox
    // const { name, value, type, checked } = e.target as HTMLInputElement;
    // setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave({ ...item, ...formData } as Item);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">品番情報の編集</h2>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* 各フォーム要素 */}
          <div className="grid grid-cols-1 gap-4">
             <label className="block">
                <span className="text-slate-700">品番</span>
                <input type="text" name="code" value={formData.code || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
             </label>
             <label className="block">
                <span className="text-slate-700">商品名</span>
                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
             </label>
             <label className="block">
                <span className="text-slate-700">顧客</span>
                 <select name="customer" value={formData.customer || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    <option value="">なし</option>
                    {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                 </select>
             </label>
              <label className="block">
                <span className="text-slate-700">カテゴリ</span>
                 <select name="category" value={formData.category || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
             </label>
             <label className="block">
                <span className="text-slate-700">サイズ</span>
                <input type="text" name="size" value={formData.size || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
             </label>
             <label className="block">
                <span className="text-slate-700">単価</span>
                <input type="number" name="price" value={formData.price || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
             </label>
             <label className="block">
                <span className="text-slate-700">安全在庫数</span>
                <input type="number" name="threshold" value={formData.threshold || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
             </label>
             <label className="block">
                <span className="text-slate-700">目標在庫数</span>
                <input type="number" name="targetStock" value={formData.targetStock || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
             </label>
             <label className="block">
                <span className="text-slate-700">納期</span>
                <input type="date" name="deadline" value={formData.deadline || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
             </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">キャンセル</button>
          <button type="button" onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">保存</button>
        </div>
      </div>
    </div>
  );
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
  
  // ★ 2. 編集モーダル用のステートを追加
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{isOpen: boolean; type: 'CONFIRM'|'ALERT'; title: string; message: string; onConfirm?: ()=>void}>({isOpen:false, type:'ALERT', title:'', message:''});
  
  // ダイアログ操作関数
  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setDialogConfig({ isOpen: true, type: 'CONFIRM', title, message, onConfirm });
  };
  const closeDialog = () => setDialogConfig(prev => ({ ...prev, isOpen: false }));
  const handleDialogConfirm = () => { if (dialogConfig.onConfirm) dialogConfig.onConfirm(); closeDialog(); };

  // ... (ローカルストレージのuseEffectなどはそのまま) ...

  // データ集計（Dashboardへ渡す用）
  const totalStock = items.reduce((acc, item) => acc + calculateTotalStock(item), 0);
  const totalWIP = items.reduce((acc, item) => acc + calculateStockByType(item, 'WIP', processTypes), 0);
  const totalProduct = items.reduce((acc, item) => acc + calculateStockByType(item, 'PRODUCT', processTypes), 0);
  const totalBoxed = items.reduce((acc, item) => acc + calculateStockByType(item, 'BOXED', processTypes), 0);
  const lowStockCount = items.filter(item => calculateProductStock(item, processTypes) <= item.threshold).length;
  const rawMaterialShortageCount = items.filter(item => (item.targetStock - calculateStockByType(item, 'ALL', processTypes)) > 0).length;
  const deadlineAlertCount = items.filter(item => {
    const days = item.deadline ? getDaysUntil(item.deadline) : null;
    return days !== null && days <= 7;
  }).length;
  const stockByProcess = items.reduce((acc, item) => {
    if (item.lots) item.lots.forEach(lot => { acc[lot.process] = (acc[lot.process] || 0) + lot.quantity; });
    return acc;
  }, {} as Record<string, number>);

  // 操作関数群（deleteItem, openStockModalなど）
  const deleteItem = (id: number) => {
    showConfirm('商品削除の確認', 'この商品を削除しますか？', () => {
      setItems(prev => prev.filter(item => item.id !== id));
    });
  };

  // ★ 3. 編集モーダルを開く関数を定義
  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };
  
  // ★ 4. 編集モーダルを閉じる関数を定義
  const closeEditModal = () => {
    setEditingItem(null);
    setIsEditModalOpen(false);
  };

  // ★ 5. アイテムを更新する関数を定義
  const handleUpdateItem = (updatedItem: Item) => {
    setItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <CustomDialog config={dialogConfig} onClose={closeDialog} onConfirm={handleDialogConfirm} />
      
      {/* ★ 6. 編集モーダルをレンダリング */}
      <EditItemModal 
        isOpen={isEditModalOpen}
        item={editingItem}
        onClose={closeEditModal}
        onSave={handleUpdateItem}
        customers={customers}
        categories={categories}
      />

      {/* ヘッダー */}
      <header className="bg-indigo-800 text-white shadow-lg sticky top-0 z-20">
         {/* ... (ヘッダー内容は元のコード参照) ... */}
         <div className="w-full px-4 py-4 flex justify-between items-center">
             <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2"><Package /> waken在庫管理</h1>
             {/* ボタン群... */}
         </div>
      </header>
     
      <main className="w-full px-4 py-6 md:py-8">
        <Dashboard
          totalStock={totalStock} totalWIP={totalWIP} totalProduct={totalProduct} totalBoxed={totalBoxed}
          deadlineAlertCount={deadlineAlertCount} lowStockCount={lowStockCount} rawMaterialShortageCount={rawMaterialShortageCount}
          isDeadlineFilterActive={isDeadlineFilterActive} setIsDeadlineFilterActive={setIsDeadlineFilterActive}
          isLowStockFilterActive={isLowStockFilterActive} setIsLowStockFilterActive={setIsLowStockFilterActive}
          isRawMaterialShortageFilterActive={isRawMaterialShortageFilterActive} setIsRawMaterialShortageFilterActive={setIsRawMaterialShortageFilterActive}
          setViewingStockType={setViewingStockType}
        />

        {/* 工程別カード */}
        <div className="mb-8">
             {/* ... (工程別カードのループ処理。元のコードの stockByProcess.map 部分) ... */}
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {processes.map(process => {
                    const count = stockByProcess[process] || 0;
                    // ... 表示ロジック
                    return (
                        <button key={process} onClick={() => setViewingProcess(process)} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                             <div className="font-bold">{process}</div>
                             <div className="text-xl">{count}枚</div>
                        </button>
                    )
                })}
             </div>
        </div>

        <InventoryList
          items={items} customers={customers} processes={processes} processTypes={processTypes}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          selectedCustomerFilter={selectedCustomerFilter} setSelectedCustomerFilter={setSelectedCustomerFilter}
          sortOption={sortOption} setSortOption={setSortOption}
          selectedProcessFilter={selectedProcessFilter} setSelectedProcessFilter={setSelectedProcessFilter}
          isLowStockFilterActive={isLowStockFilterActive} setIsLowStockFilterActive={setIsLowStockFilterActive}
          isDeadlineFilterActive={isDeadlineFilterActive} setIsDeadlineFilterActive={setIsDeadlineFilterActive}
          isRawMaterialShortageFilterActive={isRawMaterialShortageFilterActive} setIsRawMaterialShortageFilterActive={setIsRawMaterialShortageFilterActive}
          openEditModal={openEditModal}
          deleteItem={deleteItem}
        />
      </main>

      {/* ここにモーダル群を配置 */}
      {/* {isStockModalOpen && <StockModal ... />} */}
    </div>
  );
}