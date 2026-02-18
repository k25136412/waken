// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ⚠️ ここをご自身のFirebaseコンソールで表示された内容に書き換えてください
const firebaseConfig = {
  apiKey: "AIzaSyDEprrpdx5koXk1s0Hp7PgLXnL28rpHBdU",
  authDomain: "waken-zaiko.firebaseapp.com",
  projectId: "waken-zaiko",
  storageBucket: "waken-zaiko.firebasestorage.app",
  messagingSenderId: "40620672321",
  appId: "1:40620672321:web:508180e5c79053130e0dc0"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);

// Firestoreデータベースへの接続用オブジェクト
export const db = getFirestore(app);

export const auth = getAuth(app);

// ★追加：管理者用のサブアプリ（ユーザー追加時に自分が強制ログアウトされないための裏技）
const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
export const secondaryAuth = getAuth(secondaryApp);