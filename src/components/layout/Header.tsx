// src/components/layout/Header.tsx
import React from 'react';
import { 
  Package, Minimize, Maximize, Blocks, ClipboardList, 
  Settings, Users, Database, Plus 
} from 'lucide-react';

// ヘッダーが受け取るProps（親から渡される関数や値）の定義
interface HeaderProps {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  setIsAssemblyModalOpen: (isOpen: boolean) => void;
  setIsInventoryValuationOpen: (isOpen: boolean) => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setIsCustomerModalOpen: (isOpen: boolean) => void;
  setIsMasterModalOpen: (isOpen: boolean) => void;
  openNewItemModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isFullscreen,
  toggleFullscreen,
  setIsAssemblyModalOpen,
  setIsInventoryValuationOpen,
  setIsSettingsOpen,
  setIsCustomerModalOpen,
  setIsMasterModalOpen,
  openNewItemModal
}) => {
  return (
    <header className="bg-indigo-800 text-white shadow-lg sticky top-0 z-20" style={{zIndex: 20}}>
      <div className="w-full px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 md:h-8 md:w-8" />
              waken在庫管理
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* 全画面ボタン */}
             <button 
              type="button"
              onClick={toggleFullscreen}
              className="p-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg transition-colors text-indigo-100 hidden md:flex items-center gap-1"
              title="全画面表示切り替え"
            >
               {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>

            <button 
              type="button"
              onClick={() => setIsAssemblyModalOpen(true)}
              className="p-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg transition-colors text-indigo-100 flex items-center gap-1"
              title="箱詰・セット組"
            >
              <Blocks size={20} />
              <span className="hidden md:inline text-xs font-bold ml-1">箱詰・加工</span>
            </button>

            <button 
              type="button"
              onClick={() => setIsInventoryValuationOpen(true)}
              className="p-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg transition-colors text-indigo-100 flex items-center gap-1"
              title="棚卸・資産評価"
            >
              <ClipboardList size={20} />
              <span className="hidden md:inline text-xs font-bold ml-1">棚卸・資産</span>
            </button>
            <button 
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg transition-colors text-indigo-100 flex items-center gap-1"
              title="工程マスタ設定"
            >
              <Settings size={20} />
              <span className="hidden md:inline text-xs font-bold ml-1">工程マスタ</span>
            </button>
            <button 
              type="button"
              onClick={() => setIsCustomerModalOpen(true)}
              className="p-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg transition-colors text-indigo-100 flex items-center gap-1"
              title="顧客マスタ管理"
            >
              <Users size={20} />
              <span className="hidden md:inline text-xs font-bold ml-1">顧客マスタ</span>
            </button>
            <button 
              type="button"
              onClick={() => setIsMasterModalOpen(true)}
              className="p-2 bg-indigo-700 hover:bg-indigo-600 rounded-lg transition-colors text-indigo-100 flex items-center gap-1"
              title="商品マスタ管理"
            >
              <Database size={20} />
              <span className="hidden md:inline text-xs font-bold ml-1">商品マスタ</span>
            </button>
            <button 
              type="button"
              onClick={openNewItemModal}
              className="bg-indigo-600 hover:bg-indigo-500 border border-indigo-400 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm text-sm md:text-base"
            >
              <Plus size={18} />
              新規品番登録
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};