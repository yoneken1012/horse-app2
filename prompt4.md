# 共通ルール（必ず守ること）

## 変更禁止ファイル
以下のファイルは絶対に変更しないでください。読み取り参照のみ許可します。
- lib/supabase/client.ts
- lib/supabase/server.ts
- app/layout.tsx
- middleware.ts（存在する場合）
- next.config.ts
- tailwind.config.ts
- package.json（依存追加が必要な場合は私に確認してください）

## コーディング規約
- TypeScriptの型を省略しない（any禁止）
- Supabaseクエリには必ずエラーハンドリングを含める（const { data, error } = ...）
- コンポーネントは "use client" / Server Component を明示する
- UIはshadcn/uiとTailwind CSSを使用する
- 新規ファイルを作成する場合、作成するファイルパスを最初にリストアップしてから実装に入ること
- 既存ファイルを変更する場合、変更箇所と変更理由を最初に説明してから変更すること

## Supabaseクエリのルール
- クライアントコンポーネントでは lib/supabase/client.ts の createClient を使用
- サーバーコンポーネント/Server Actionsでは lib/supabase/server.ts の createClient を使用
- RLSが有効のため service_role キーは使用禁止

## RLSポリシー情報（実際の設定）
### posts
- SELECT: 全員閲覧可能 (true)
- INSERT: auth.uid() = user_id かつ profiles.role = 'trainer'（DB側でロール制限あり）
- DELETE: auth.uid() = user_id

### profiles
- SELECT: 全員閲覧可能 (true)
- UPDATE: auth.uid() = id
- INSERT: ポリシーなし（SECURITY DEFINER トリガーで自動作成）

### reactions
- SELECT: 全員閲覧可能 (true)
- INSERT: auth.uid() = user_id
- DELETE: auth.uid() = user_id
- ※ unique(post_id, user_id) 制約あり（DB側で重複いいね防止済み）

## データベース構造
- profiles: id(uuid, PK), name(text, NOT NULL), role(text, NOT NULL, 'owner'|'trainer'), avatar_url(text), created_at(timestamptz)
- posts: id(uuid, PK, auto), user_id(uuid, FK→profiles.id, NOT NULL), content(text, NOT NULL), media_url(text), media_type(text, 'image'|'video'|null), created_at(timestamptz)
- reactions: id(uuid, PK, auto), post_id(uuid, FK→posts.id, NOT NULL), user_id(uuid, FK→profiles.id, NOT NULL), type(text, default 'like'), created_at(timestamptz), UNIQUE(post_id, user_id)

---

あなたはプロのフロントエンドエンジニアです。
以下の仕様に基づいて、バグ修正とUIの仕上げを行ってください。

# 目的
既知のバグを修正し、アプリ全体の見た目を整え、UXを改善する。

# バグ修正（最優先）

1. いいね数の表示バグ修正:
   - 現在の問題: ユーザーAがいいねした後、ユーザーBがログインすると、いいね数が0と表示される
   - 期待する動作: ユーザーAがいいねした投稿は、ユーザーBのタイムラインでもいいね数1と表示される。ユーザーBがさらにいいねすると2になる
   - 原因の調査: app/timeline/_components/timeline-content.tsx のデータ取得クエリを確認し、reactionsの取得・集計方法を修正する
   - いいね数はreactionsテーブルの該当post_idのレコード数をCOUNTして算出すること
   - ログインユーザーがいいね済みかどうかは、reactionsテーブルにそのuser_idのレコードがあるかで判定すること

2. 文字色の修正:
   - 現在の問題: 投稿カード内のテキスト（投稿者名、投稿内容、日時）が白色で背景に溶け込んで見えない
   - 修正: 投稿カード内の全テキストを見やすい色に変更
     - 投稿者名: text-gray-900（黒に近い色）、font-bold
     - 投稿内容: text-gray-800
     - 投稿日時: text-gray-500（薄めのグレー）
     - いいね数: text-gray-600
   - ヘッダーのアプリ名・ユーザー名も見やすい色にする

# UI改善

3. ローディング状態:
   - app/timeline/loading.tsx を作成
   - カード型のスケルトンUI（Tailwindのanimate-pulse）
   - 3つ分のスケルトンカードを表示

4. エラーハンドリング:
   - app/timeline/error.tsx を作成（Next.js Error Boundary）
   - 「エラーが発生しました。再読み込みしてください。」+ リトライボタン

5. 空状態のUI改善:
   - 投稿がない場合の表示をアイコン付きの見やすいデザインに改善

6. 投稿日時の相対表示:
   - 「○分前」「○時間前」「○日前」形式にする
   - 新規npmパッケージは追加しない（自前関数で実装）
   - 1分未満→「たった今」、1時間未満→「○分前」、24時間未満→「○時間前」、7日未満→「○日前」、それ以上→「YYYY/MM/DD」

7. ヘッダーの改善:
   - ロールバッジを追加（trainer: 🏇 調教師 / owner: 👑 馬主）
   - モバイル幅でも崩れないレイアウト

8. レスポンシブ対応:
   - 画像・動画のアスペクト比が崩れないように（object-cover等）
   - 投稿フォームのテキストエリアがモバイルで使いやすいサイズか確認
   - モバイル幅（375px）で全体が崩れないか確認

# 注意
- 既存の機能（認証・投稿・いいね）を絶対に壊さないこと
- 新しいnpmパッケージは追加しない
- 変更するファイルと変更内容を最初にリストアップすること

# 完了条件
- いいね数が全ユーザーで正しく共有される
- テキストが全て見やすい色で表示される
- ローディング中にスケルトンUIが表示される
- エラー時にリトライボタン付きメッセージが表示される
- 投稿日時が「○分前」形式で表示される
- ヘッダーにロールバッジが表示される
- モバイル幅（375px）で表示が崩れない