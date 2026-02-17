// src/hooks/useItems.ts
import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Item } from '../types';

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Firestoreからデータをリアルタイムに取得（監視）
  useEffect(() => {
    // 'items'という引き出し（コレクション）を監視します
    const unsubscribe = onSnapshot(collection(db, 'items'), (snapshot) => {
      const itemsData = snapshot.docs.map(doc => doc.data() as Item);
      // ID順に並び替えてセット
      setItems(itemsData.sort((a, b) => a.id - b.id));
      setLoadingItems(false);
    });

    // 画面を閉じるときに監視を解除
    return () => unsubscribe();
  }, []);

  // 1件のデータを追加・更新
  const saveItem = async (item: Item) => {
    try {
      // IDを文字に変換してドキュメント（ファイル）名として保存
      await setDoc(doc(db, 'items', item.id.toString()), item);
    } catch (error) {
      console.error("データの保存に失敗しました", error);
    }
  };

  // まとめてデータを更新（箱詰や一括移動など）
  const saveMultipleItems = async (newItems: Item[]) => {
    try {
      // 複数件を順番に保存（本格運用ではBatchを使いますが今回は簡易的に）
      for (const item of newItems) {
        await setDoc(doc(db, 'items', item.id.toString()), item);
      }
    } catch (error) {
      console.error("複数データの保存に失敗しました", error);
    }
  };

  // 1件のデータを削除
  const deleteItemFromDb = async (id: number) => {
    try {
      await deleteDoc(doc(db, 'items', id.toString()));
    } catch (error) {
      console.error("データの削除に失敗しました", error);
    }
  };

  return { items, loadingItems, saveItem, saveMultipleItems, deleteItemFromDb };
};