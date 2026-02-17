// src/hooks/useMasters.ts
import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Customer, ProcessType } from '../types';

export const useMasters = () => {
  // 初期値は空にしておき、データがなければApp側で初期データを入れます
  const [processes, setProcesses] = useState<string[]>([]);
  const [processTypes, setProcessTypes] = useState<Record<string, ProcessType>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingMasters, setLoadingMasters] = useState(true);

  useEffect(() => {
    // 'masters'という引き出しの中の各ファイルを監視
    const unsubProcesses = onSnapshot(doc(db, 'masters', 'processes'), (docSnap) => {
      if (docSnap.exists()) {
        setProcesses(docSnap.data().names || []);
        setProcessTypes(docSnap.data().types || {});
      }
    });

    const unsubCategories = onSnapshot(doc(db, 'masters', 'categories'), (docSnap) => {
      if (docSnap.exists()) {
        setCategories(docSnap.data().names || []);
      }
    });

    const unsubCustomers = onSnapshot(doc(db, 'masters', 'customers'), (docSnap) => {
      if (docSnap.exists()) {
        setCustomers(docSnap.data().data || []);
      }
    });

    // 読み込み完了（簡易的にタイマーで判定）
    const timer = setTimeout(() => setLoadingMasters(false), 800);

    return () => {
      unsubProcesses();
      unsubCategories();
      unsubCustomers();
      clearTimeout(timer);
    };
  }, []);

  // 工程データの保存
  const saveProcesses = async (names: string[], types: Record<string, ProcessType>) => {
    await setDoc(doc(db, 'masters', 'processes'), { names, types });
  };

  // カテゴリデータの保存
  const saveCategories = async (names: string[]) => {
    await setDoc(doc(db, 'masters', 'categories'), { names });
  };

  // 顧客データの保存
  const saveCustomers = async (data: Customer[]) => {
    await setDoc(doc(db, 'masters', 'customers'), { data });
  };

  return {
    processes,
    processTypes,
    categories,
    customers,
    loadingMasters,
    saveProcesses,
    saveCategories,
    saveCustomers
  };
};