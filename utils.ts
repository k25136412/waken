// utils.ts
import { Item, ProcessType, NO_LOT_ID } from './types';

export const getToday = () => new Date().toISOString().split('T')[0];

export const getDaysUntil = (dateStr: string) => {
  if (!dateStr) return null;
  const today = new Date(getToday());
  const target = new Date(dateStr);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateTotalStock = (item: Item) => {
  if (!item.lots) return 0;
  return item.lots.reduce((sum, lot) => sum + lot.quantity, 0);
};

// 状態(processTypes)に依存するため、引数で受け取るように変更
export const calculateStockByType = (item: Item, type: ProcessType, processTypes: Record<string, ProcessType>) => {
  if (!item.lots) return 0;
  if (type === 'ALL') {
    return item.lots.reduce((sum, lot) => sum + lot.quantity, 0);
  }
  return item.lots
    .filter(lot => (processTypes[lot.process] || 'WIP') === type)
    .reduce((sum, lot) => sum + lot.quantity, 0);
};

export const calculateProductStock = (item: Item, processTypes: Record<string, ProcessType>) => {
  if (!item.lots) return 0;
  return item.lots
    .filter(lot => {
      const type = processTypes[lot.process] || 'WIP';
      return type === 'PRODUCT' || type === 'BOXED';
    })
    .reduce((sum, lot) => sum + lot.quantity, 0);
};