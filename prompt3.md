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
以下の仕様に基づいて、投稿機能といいね機能を実装してください。

# 目的
trainerロールのユーザーが画像・動画付き投稿を作成でき、全ユーザーがいいねできるようにする。

# 前提
- Supabase Storageに "post-images" バケットが作成済み（Public bucket）
- タイムラインページ（app/timeline/）は実装済み
- postsのINSERTはRLSでtrainerロールのみ許可済み（DB側でガード）
- reactionsのunique(post_id, user_id)制約でDB側で重複いいね防止済み

# 実装内容

1. 投稿フォームコンポーネント（components/post-form.tsx）:
   - Client Component
   - ログインユーザーの role が trainer の場合のみレンダリングされる
   - 入力項目:
     - content: テキストエリア（必須、最大500文字）
     - メディア: ファイル選択ボタン（任意、画像または動画）
       - 画像の受付形式: image/jpeg, image/png, image/gif, image/webp, image/heic, image/heif（最大5MB）
       - 動画の受付形式: video/mp4, video/quicktime, video/webm（最大25MB）
       - accept属性: "image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm"
       - ファイル選択時にMIMEタイプで画像か動画かを判定する:
         - file.type.startsWith('image/') → 画像（最大5MB）
         - file.type.startsWith('video/') → 動画（最大25MB）
       - サイズ超過時はエラーメッセージを表示（「画像は5MB以下、動画は25MB以下にしてください」）
       - 画像選択時: プレビュー画像を表示
       - 動画選択時: <video>タグでプレビューを表示
   - 送信処理:
     a. バリデーション（contentが空でないか、ファイルサイズ等）
     b. メディアがある場合、Supabase Storage にアップロード:
        - バケット: 'post-images'
        - パス: `${userId}/${Date.now()}_${file.name}`
        - アップロード後 getPublicUrl() で URL を取得
     c. posts テーブルに INSERT:
        - user_id: ログインユーザーのID
        - content: 入力テキスト
        - media_url: メディアのPublic URL（メディアなしの場合はnull）
        - media_type: 画像なら 'image'、動画なら 'video'、なしなら null
     d. 成功後: フォームクリア + router.refresh() でタイムラインを再取得
   - 送信中はボタンを disabled にしてローディング表示
   - エラー時はユーザーにメッセージを表示

2. いいねボタンの実装（components/post-card.tsx を修正）:
   - 既存の投稿カード内のいいねボタンに処理を追加
   - クリック時の処理:
     - 未いいね → reactions テーブルに INSERT（post_id, user_id, type: 'like'）
     - いいね済み → reactions テーブルから DELETE（post_id と user_id で特定）
   - UI状態:
     - いいね済み: ハートアイコン塗りつぶし（赤色 text-red-500）
     - 未いいね: ハートアイコンアウトライン
     - いいね数を楽観的更新（API応答を待たずにUIを先に更新）
   - 連打防止: 処理中は disabled にする

3. 投稿カードのメディア表示（components/post-card.tsx を修正）:
   - media_type が 'image' の場合: <img>タグで画像を表示
   - media_type が 'video' の場合: <video>タグで動画を表示（controls属性付き、再生・一時停止可能）
   - メディアはカード内で適切なサイズに収まるようにする（max-h-96, object-cover等）

4. タイムラインへの組み込み:
   - app/timeline/_components/timeline-content.tsx を修正
   - trainerロールの場合、投稿一覧の上に投稿フォームを表示
   - 既存のプレースホルダーを投稿フォームコンポーネントに置き換え

# Supabase Storageの使い方（参考）
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

// アップロード
const { data, error } = await supabase.storage
  .from('post-images')
  .upload(filePath, file);

// Public URL取得
const { data: { publicUrl } } = supabase.storage
  .from('post-images')
  .getPublicUrl(filePath);

# 注意
- 既存ファイルの構造を尊重し、大幅な書き換えをしない
- メディアアップロード失敗時はエラーを表示し、投稿自体を中止する
- ownerロールで投稿を試みた場合のRLSエラーもハンドリングする

# 完了条件
- trainerロールで投稿フォームが表示される
- ownerロールで投稿フォームは非表示
- テキストのみの投稿ができ、タイムラインに反映される
- 画像付き投稿ができ、画像がタイムラインに表示される
- 動画付き投稿ができ、動画がタイムラインで再生できる
- 5MB超の画像、25MB超の動画を選択するとエラーメッセージが出る
- いいねボタンが動作し、いいね数がリアルタイムに増減する
- 同じ投稿に2回いいね → トグルで取り消される