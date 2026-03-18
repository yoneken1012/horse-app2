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
以下の仕様に基づいて、既存のサインアップ機能を拡張してください。

# 目的
サインアップ時に「表示名」と「ロール（trainer/owner）」を入力・選択できるようにする。

# 前提
- Supabase Auth の signUp() で options.data にメタデータを渡すと、
  DBトリガーが自動的に profiles テーブルにレコードを作成する（設定済み）。
- トリガーは raw_user_meta_data から name と role を読み取る。
- name未指定時は「ユーザー」、role未指定時は「owner」がデフォルト値。

# 実装内容

1. サインアップフォームの修正:
   - 既存のサインアップページ（app/auth/sign-up/ 配下のファイル）を確認する
   - フォームに以下の入力欄を追加:
     - 「表示名」テキスト入力（必須）
     - 「ロール選択」（trainer: 調教師 / owner: 馬主）
   - signUp() 呼び出しを以下のように修正:
     await supabase.auth.signUp({
       email,
       password,
       options: {
         data: {
           name: displayName,
           role: selectedRole,
         }
       }
     })
   - ロール選択のデフォルト値は owner にする

2. ログイン後のリダイレクト先変更:
   - プロジェクト内で /protected へのリダイレクトを検索する
   - 全て /timeline に変更する
   - 対象: router.push, redirect, Link href 等

# UI仕様
- shadcn/uiコンポーネントを使用（Input, Label, RadioGroup またはSelect等）
- 既存のメール・パスワード部分のレイアウトに合わせる
- デザインはシンプル・モダンに

# 注意
- サインアップフォームの既存のメール・パスワード入力部分はなるべく変更しない
- /timeline ページ自体はまだ存在しなくてOK（次のPromptで作成する）

# 完了条件
- サインアップフォームに表示名とロール選択が表示される
- signUp()にoptions.dataでname, roleが渡される
- ログイン・サインアップ後のリダイレクト先が /timeline になっている