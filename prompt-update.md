# アップデート: ナビ順序変更 + 馬プロフィールにデータベースリンク追加

## ⚠️ 重要：作業対象はタイムラインページではありません

このタスクは **ヘッダーのナビゲーション順序変更** と **馬詳細ページ（/horses/[id]）のプロフィールカードへのリンク追加** です。

## 最初にやること

まず以下のコマンドで現在のファイルを確認してください：

```bash
cat components/header.tsx | head -30
cat app/horses/[id]/_components/horse-detail-content.tsx | head -50
```

## タスク1: ヘッダーのナビゲーション順序変更

ファイル: `components/header.tsx`

現在の順序: 「タイムライン」「馬一覧」
変更後の順序: 「馬一覧」「タイムライン」

navLinksの配列の順序を入れ替えるだけです。

## タスク2: 馬プロフィールカードにフランスギャロのデータベースリンクを追加

ファイル: `app/horses/[id]/_components/horse-detail-content.tsx`

馬詳細ページのプロフィールカード（馬名・バッジの下の空白部分）に、
フランスギャロの馬データベースへの固定リンクを表示してください。

- リンクはhorsesテーブルに新しいカラムを追加するのではなく、horse_linksテーブルから category='database' のリンクを取得して表示する形にしてください
- 表示形式: 外部リンクアイコン + 「France Galop」テキスト（クリックで新しいタブで開く）
- バッジ行の下に配置
- スタイル: text-blue-600 hover:underline text-sm

## 技術的な注意事項

- `export const dynamic = "force-dynamic"` は使用禁止
- horse-detail-content.tsx はServer Componentなので、Supabaseクエリを直接書いてOK
