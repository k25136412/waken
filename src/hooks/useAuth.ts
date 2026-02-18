// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  User 
} from 'firebase/auth';
import { auth, secondaryAuth } from '../firebase/config';

export const useAuth = () => {
  // 現在ログインしているユーザーの情報を保存するステート
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // ログイン状態の確認中かどうかを判定するステート
  const [loadingAuth, setLoadingAuth] = useState(true);

  // 画面を開いた時に、ログイン状態を監視する
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });
    // 画面を閉じるときに監視を解除
    return () => unsubscribe();
  }, []);

  // ① ログイン処理
  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  // ② ログアウト処理
  const logout = async () => {
    await signOut(auth);
  };

  // ③ 新規スタッフのアカウント作成（※管理者がログアウトされない裏技）
  const registerNewUser = async (email: string, pass: string) => {
    // メインではなく、サブのAuthオブジェクトを使ってユーザーを作成します
    await createUserWithEmailAndPassword(secondaryAuth, email, pass);
    
    // サブ側は作成直後に自動ログイン状態になってしまうため、すぐにログアウトさせます
    // （※メインのAuthには影響しないため、管理者は作業を続けられます）
    await signOut(secondaryAuth);
  };

  return {
    currentUser,
    loadingAuth,
    login,
    logout,
    registerNewUser
  };
};