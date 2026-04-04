# Uma Vie (ウマヴィ) - 馬主向けSNSアプリケーション

馬主（オーナー）と調教師（トレーナー）をつなぐSNSアプリケーションです。調教師が馬のトレーニング風景や近況を写真・動画付きで投稿し、馬主がそれを閲覧・いいねできます。

## デプロイURL
https://horse-app2.vercel.app

## 使用技術
- Next.js (App Router) / TypeScript
- Supabase (PostgreSQL / Auth / Storage)
- Vercel
- Tailwind CSS / shadcn/ui

## 機能一覧
- ユーザー認証（メール・パスワードによるサインアップ・ログイン・ログアウト）
- サインアップ時にロール選択（調教師 or 馬主）
- タイムライン（全投稿を新しい順に一覧表示）
- 投稿機能（テキスト・画像・動画の投稿、調教師ロールのみ）
- いいね機能（トグル式、全ユーザー利用可能）
- ロール制御（調教師のみ投稿可能、馬主は閲覧・いいねのみ）

## ロール
- 🏇 調教師（trainer）: 投稿・閲覧・いいねが可能
- 👑 馬主（owner）: 閲覧・いいねが可能

## テスト用アカウント
- 調教師: shimizu@example.com / password
- 馬主: yonemoto@example.com / password

## セットアップ手順
1. リポジトリをクローン
2. npm install で依存関係をインストール
3. .env.local に以下の環境変数を設定:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
4. npm run dev で開発サーバーを起動
