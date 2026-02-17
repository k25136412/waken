// src/components/tables/ItemTable.tsx
import React, { useState } from 'react';
import { 
  Search, Users, ChevronDown, ArrowUpDown, AlertTriangle, Clock, Scissors, MapPin, X, ChevronUp, Tag, Box, Factory, CheckCircle2, AlertCircle, Calendar, Edit, Trash2, Gift
} from 'lucide-react';
import { Item, Customer, ProcessType, SortOption, NO_LOT_ID } from '../../types';

// 荷姿のバッジコンポーネント（表示用）
const PackagingBadge = ({ type }: { type: string | undefined }) => {
  if (type === '箱入') return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded border border-amber-200"><Box size={10} /> 箱入</span>;
  if (type === 'セット') return <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded border border-purple-200"><Gift size={10} /> セット</span>;
  return <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded border border-slate-200">バラ</span>;
};

interface ItemTableProps {
  filteredItems: Item[];
  customers: Customer[];
  processes: string[];
  processTypes: Record<string, ProcessType>;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCustomerFilter: string;
  setSelectedCustomerFilter: (customer: string) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  
  isLowStockFilterActive: boolean;
  isDeadlineFilterActive: boolean;
  isRawMaterialShortageFilterActive: boolean;
  selectedProcessFilter: string | null;
  clearFilters: () => void;
  
  calculateProductStock: (item: Item) => number;
  calculateStockByType: (item: Item, type: ProcessType) => number;
  getDaysUntil: (dateStr: string) => number | null;
  
  openEditModal: (item: Item) => void;
  deleteItem: (id: number) => void;
}

export const ItemTable: React.FC<ItemTableProps> = ({
  filteredItems,
  customers,
  processes,
  processTypes,
  searchQuery,
  setSearchQuery,
  selectedCustomerFilter,
  setSelectedCustomerFilter,
  sortOption,
  setSortOption,
  isLowStockFilterActive,
  isDeadlineFilterActive,
  isRawMaterialShortageFilterActive,
  selectedProcessFilter,
  clearFilters,
  calculateProductStock,
  calculateStockByType,
  getDaysUntil,
  openEditModal,
  deleteItem
}) => {
  // 詳細表示の開閉状態（テーブル内で完結するためここに移動）
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* 検索・フィルター領域 */}
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
      
      {/* テーブル本体 */}
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
                
                const totalHeldStock = calculateStockByType(item, 'ALL');
                const rawMaterialShortage = Math.max(0, item.targetStock - totalHeldStock);
                
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
                            <div className="flex-none min-w-[80px]">
                              <div className="text-xs text-slate-500 mb-1 flex items-center gap-1 font-bold"><Box size={14}/> 製品在庫</div>
                              <div className={`text-2xl font-bold leading-none ${productStock <= item.threshold ? 'text-red-600' : 'text-slate-800'}`}>
                                {productStock.toLocaleString()} <span className="text-sm font-normal text-slate-400">枚</span>
                              </div>
                            </div>

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
  );
};