// src/components/dashboard/SummaryCards.tsx
import React from 'react';
import { Package, Factory, Box, Archive, Clock, AlertTriangle, Scissors, List } from 'lucide-react';
import { ProcessType } from '../../types';

interface SummaryCardsProps {
  totalStock: number;
  totalWIP: number;
  totalProduct: number;
  totalBoxed: number;
  deadlineAlertCount: number;
  lowStockCount: number;
  rawMaterialShortageCount: number;
  isDeadlineFilterActive: boolean;
  setIsDeadlineFilterActive: (active: boolean) => void;
  isLowStockFilterActive: boolean;
  setIsLowStockFilterActive: (active: boolean) => void;
  isRawMaterialShortageFilterActive: boolean;
  setIsRawMaterialShortageFilterActive: (active: boolean) => void;
  setViewingStockType: (type: ProcessType | null) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalStock,
  totalWIP,
  totalProduct,
  totalBoxed,
  deadlineAlertCount,
  lowStockCount,
  rawMaterialShortageCount,
  isDeadlineFilterActive,
  setIsDeadlineFilterActive,
  isLowStockFilterActive,
  setIsLowStockFilterActive,
  isRawMaterialShortageFilterActive,
  setIsRawMaterialShortageFilterActive,
  setViewingStockType
}) => {
  return (
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
  );
};