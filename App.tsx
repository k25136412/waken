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
  
  // その他すべてのステート（モーダル開閉、入力フォーム等）は元のコードと同様に記述
  // ... (省略せずに元のコードから必要なuseStateをすべて記述してください) ...
  // 例:
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

  // ... (その他のハンドラ関数は元のコードからコピー) ...

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <CustomDialog config={dialogConfig} onClose={closeDialog} onConfirm={handleDialogConfirm} />

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
          openEditModal={() => {/* openEditModalの実装 */}}
          deleteItem={deleteItem}
        />
      </main>

      {/* ここにモーダル群を配置 */}
      {/* {isStockModalOpen && <StockModal ... />} */}
    </div>
  );
}