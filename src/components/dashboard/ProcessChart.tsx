// src/components/dashboard/ProcessChart.tsx
import React from 'react';
import { MapPin, List } from 'lucide-react';
import { ProcessType } from '../../types';

interface ProcessChartProps {
  processes: string[];
  processTypes: Record<string, ProcessType>;
  stockByProcess: Record<string, number>;
  totalStock: number;
  setViewingProcess: (process: string | null) => void;
}

export const ProcessChart: React.FC<ProcessChartProps> = ({
  processes,
  processTypes,
  stockByProcess,
  totalStock,
  setViewingProcess
}) => {
  return (
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
  );
};