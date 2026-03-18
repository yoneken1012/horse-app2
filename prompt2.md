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
以下の仕様に基づいて、タイムラインページを作成してください。

# 目的
ログイン必須のタイムラインページを作成し、投稿一覧を表示する。

# 実装内容

1. タイムラインページ（app/timeline/page.tsx）:
   - Server Component として作成
   - 未ログインの場合は /auth/login にリダイレクト
   - ログインユーザーの profile 情報を取得（role判定に使用）
   - posts テーブルから全投稿を created_at DESC で取得
   - 各投稿の取得時に、投稿者の profiles.name も JOIN で取得する
   - 各投稿のいいね数（reactionsテーブルのCOUNT）を取得
   - ログインユーザーが各投稿にいいね済みかどうかの情報も取得
   - 取得例:
     const { data: posts } = await supabase
       .from('posts')
       .select(`
         *,
         profiles:user_id ( name, avatar_url ),
         reactions ( id, user_id )
       `)
       .order('created_at', { ascending: false });

2. ヘッダーコンポーネント（components/header.tsx）:
   - Client Component
   - 左側: アプリ名「Horse SNS」
   - 右側: ログインユーザーの表示名 + ログアウトボタン
   - ログアウト処理: supabase.auth.signOut() → /auth/login にリダイレクト
   - shadcn/ui の Button を使用

3. 投稿カードコンポーネント（components/post-card.tsx）:
   - Client Component
   - Props: 投稿データ、投稿者名、いいね数、いいね済みフラグ、ログインユーザーID
   - 表示内容: 投稿者名、投稿内容、投稿日時、画像（media_urlがある場合）、いいねボタン + いいね数
   - いいねボタンは表示のみ（トグル処理はPrompt 3で実装）
   - shadcn/ui の Card を使用

# UIデザイン方針
- シンプル・モダン
- 全体背景: bg-gray-50 または bg-slate-50
- カード: 白背景 + shadow-sm + rounded-lg
- 最大幅: max-w-2xl mx-auto（SNSらしい中央寄せレイアウト）
- レスポンシブ対応（モバイルでも見やすく padding を確保）
- trainerロールの場合「投稿フォームがここに入ります」というプレースホルダーを表示

# 注意
- 投稿フォームはこのPromptでは作成しない（Prompt 3で実装）
- いいねのトグル処理はこのPromptでは作成しない（Prompt 3で実装）
- 投稿がない場合は「まだ投稿がありません」と表示する

# 完了条件
- /timeline にアクセスして未ログインなら /auth/login にリダイレクトされる
- ログイン後、ヘッダーにユーザー名とログアウトボタンが表示される
- ログアウトが正常に動作する
- 投稿がない状態で「まだ投稿がありません」が表示される
- trainerロールでログインするとプレースホルダーが表示される