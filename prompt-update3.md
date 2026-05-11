# Uma Vie アップデート Phase 2: エルメス風UI + モバイル固定レイアウト

## このフェーズの目的

「馬が主役」のコンセプトを、**エルメス公式サイトのような余白・線・タイポグラフィの上質さ**で表現する。同時に、PCで開いた際にもスマホ画面サイズで表示されるようにし、登壇時のプロダクトデモ動画撮影に最適化する。

## デザインの基本方針

エルメス公式サイト ( https://www.hermes.com ) の特徴を Uma Vie にアダプトする:

1. **モダンミニマル**: サンセリフ統一、ウェイトでメリハリ
2. **余白の繊細さ**: スマホ画面はスクロール最小化のため詰める。PC側の額縁余白は贅沢に
3. **線・面の上品さ**: シャドウほぼなし、極薄ボーダー(1px、低コントラスト)で階層表現
4. **モノクローム + 1色アクセント**: アイボリー基調 + ディープボルドーをポイント使い
5. **ライトモード固定**: ダークモード関連は削除

## カラーパレット

CSS変数として `app/globals.css` に定義する:

| 用途 | 色名 | HEX | HSL(Tailwind用) |
|---|---|---|---|
| 額縁背景(body) | ストーングレー | `#EDEAE5` | `38 14% 92%` |
| アプリ背景(コンテナ内) | アイボリー | `#FAF7F2` | `36 36% 97%` |
| カード背景 | 純白に近いオフホワイト | `#FFFFFF` | `0 0% 100%` |
| 主要テキスト | チャコール | `#2A2622` | `30 11% 14%` |
| サブテキスト | ウォームグレー | `#7A746C` | `33 8% 45%` |
| ボーダー | 極薄ベージュグレー | `#E5E0D8` | `38 17% 87%` |
| アクセント(ボルドー) | ディープボルドー | `#722F37` | `353 41% 31%` |
| アクセント(ボルドー hover) | やや明るいボルドー | `#8B3A43` | `354 41% 39%` |
| 危険(削除等) | くすんだ赤 | `#A04545` | `0 40% 45%` |

## Git ワークフロー(必ず最初に実行)

### Step 0-1: 作業前の状態確認

```bash
git status
git branch --show-current
```

- 現在のブランチが `main` であることを確認
- ワーキングツリーがクリーンであることを確認
- 未コミットの変更があれば、ユーザーに確認してから進める

### Step 0-2: 最新の main を取得

```bash
git pull origin main
```

### Step 0-3: 新しいブランチを作成

```bash
git checkout -b feature/phase2-hermes-ui
```

ブランチ名は **`feature/phase2-hermes-ui`** で固定。

### コミット運用

各タスクを完了するごとに、個別のコミットを作成する:

| タスク | コミットメッセージ |
|---|---|
| タスク1 完了後 | `chore: remove dark mode and theme switcher` |
| タスク2 完了後 | `feat(style): introduce Hermes-inspired color palette and typography` |
| タスク3 完了後 | `feat(layout): add mobile-fixed frame with stone-grey backdrop` |
| タスク4 完了後 | `style(header): refine header with new palette and tighter spacing` |
| タスク5 完了後 | `style(horses): refine horse list and detail with luxury aesthetics` |
| タスク6 完了後 | `style(tabs): rename tabs to English and refine tab UI` |
| タスク7 完了後 | `style(chat): refine chat tab with bordeaux accent and tighter layout` |
| タスク8 完了後 | `style(calendar): refine calendar tab with refined typography` |
| タスク9 完了後 | `style(links): refine link tab with subtle borders` |
| タスク10 完了後 | `style(auth): refine login and signup forms with luxury aesthetics` |

### Step Final

```bash
git log --oneline main..HEAD
git status
```

**注意: push は実行しないこと**。

---

## 実装タスク

### タスク1: ダークモード関連の削除

- `components/theme-switcher.tsx` を削除
- `app/layout.tsx` または他の場所で `ThemeProvider` (next-themes) を使っている場合、削除して `<html lang="ja">` のルート構造をシンプルにする
- `package.json` から `next-themes` を依存削除し、`npm install` で `package-lock.json` を更新
- `app/globals.css` の `.dark { ... }` ブロックを削除
- `theme-switcher` を import している箇所を全て検索して削除(`components/header.tsx` 等にあるかも)

完了後にコミット。

### タスク2: グローバルCSS の刷新(カラーパレット + フォント)

#### 2-1: フォントの導入

`app/layout.tsx` を修正:

- `next/font/google` から `Noto_Sans_JP` を import
- ウェイトは `["300", "400", "500", "600", "700"]` を指定
- `subsets: ["latin"]`、`display: "swap"`、`variable: "--font-sans"` を指定
- `<html>` または `<body>` の `className` に `notoSansJp.variable` を適用
- 既存のフォント指定(Geist, Inter等)があれば削除

#### 2-2: globals.css の全面書き換え

`app/globals.css` を以下の方針で書き換える:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* 額縁背景 */
    --backdrop: 38 14% 92%;
    /* アプリ背景 */
    --background: 36 36% 97%;
    --foreground: 30 11% 14%;
    /* カード */
    --card: 0 0% 100%;
    --card-foreground: 30 11% 14%;
    /* ポップオーバー */
    --popover: 0 0% 100%;
    --popover-foreground: 30 11% 14%;
    /* プライマリ(ボルドー) */
    --primary: 353 41% 31%;
    --primary-foreground: 36 36% 97%;
    /* セカンダリ(極薄背景) */
    --secondary: 38 17% 92%;
    --secondary-foreground: 30 11% 14%;
    /* ミュート */
    --muted: 38 17% 92%;
    --muted-foreground: 33 8% 45%;
    /* アクセント */
    --accent: 353 41% 31%;
    --accent-foreground: 36 36% 97%;
    /* 危険 */
    --destructive: 0 40% 45%;
    --destructive-foreground: 36 36% 97%;
    /* ボーダー・入力 */
    --border: 38 17% 87%;
    --input: 38 17% 87%;
    --ring: 353 41% 31%;
    --radius: 0.125rem; /* 2px = rounded-sm。エルメス的な角の控えめさ */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  html, body {
    /* PC では額縁背景、スマホでは背景がそのまま見える */
    background-color: hsl(var(--backdrop));
    color: hsl(var(--foreground));
    font-family: var(--font-sans), system-ui, -apple-system, sans-serif;
    font-feature-settings: "palt"; /* 日本語の字詰め */
    letter-spacing: 0.02em;
    -webkit-font-smoothing: antialiased;
  }
  body {
    overflow-x: hidden;
  }
}

/* スクロールバーをミニマルに */
@layer utilities {
  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: hsl(var(--border));
    border-radius: 2px;
  }
}
```

- `.dark` ブロックは完全削除
- `--chart-*` 変数も使っていなければ削除
- フォントスムージング、字詰め、letter-spacing で品格を出す

#### 2-3: tailwind.config.ts の調整

- `fontFamily.sans` を `["var(--font-sans)", ...defaultTheme.fontFamily.sans]` に設定
- `colors` に `backdrop: "hsl(var(--backdrop))"` を追加(額縁背景用)
- 既存の HSL ベースの color マッピングは維持

完了後にコミット。

### タスク3: モバイル固定レイアウト(額縁)の実装

#### 3-1: app/layout.tsx の構造変更

`<body>` 直下に「額縁」となるラッパー div を入れる:

```tsx
<body className={`${notoSansJp.variable} font-sans antialiased`}>
  <div className="min-h-screen w-full flex justify-center bg-backdrop">
    <div className="w-full max-w-[420px] min-h-screen bg-background shadow-[0_0_40px_rgba(0,0,0,0.04)]">
      {children}
    </div>
  </div>
</body>
```

ポイント:
- 外側 div: 全幅 + 額縁背景(ストーングレー)、中央寄せ
- 内側 div: `max-w-[420px]`、アプリ背景(アイボリー)、極薄シャドウで「浮いている」感を演出
- スマホで開くと画面幅 < 420px なので、内側 div が全幅を占める(額縁は見えない)
- PCで開くと中央に 420px の枠、左右にストーングレーの余白

#### 3-2: 各ページの max-w 制約を撤廃

以下のファイルから、`max-w-2xl` や類似の幅制約を**撤廃**する(layout.tsx の額縁が幅を制御するため):

- `app/horses/_components/horse-list.tsx` の `<main className="mx-auto max-w-2xl px-4 py-6">`
- `app/horses/[id]/_components/horse-detail-content.tsx` の `<main>`
- `components/header.tsx` の `<div className="mx-auto flex max-w-2xl ...">`
- `app/auth/*` 配下の各認証ページ
- その他、`max-w-2xl` を grep で検索して全て撤廃

撤廃方針:
- `<main>` は `mx-auto max-w-2xl` を削除し、`px-3 py-3` 程度の余白のみ残す(余白最小化)
- ヘッダー内の `max-w-2xl` も削除し、`px-3 py-2` 程度に詰める

#### 3-3: スクロール最小化のための余白調整

スマホ画面でできるだけスクロールせずに収まるよう、以下を調整:

- `<main>` の padding: `px-4 py-6` → `px-3 py-3`
- カード間の gap: `gap-4` → `gap-2` または `gap-3`
- セクション間の `space-y-4` → `space-y-3`

完了後にコミット。

### タスク4: ヘッダーのリスタイル

`components/header.tsx` を修正:

#### 構成は維持(Phase 1 と同じ): ロゴ + ロールバッジ + ユーザー名 + ログアウトボタン

#### 変更点:

- 全体: `py-3` → `py-2`、`px-4` → `px-3`
- `border-b`: `border-b border-border/50`(極薄ボーダーに)
- ロゴ「Uma Vie」:
  - `text-xl font-bold` → `text-base font-medium tracking-[0.15em] uppercase`
  - 「UMA VIE」と大文字 + tracking 広めで、エルメス的なロゴタイポグラフィに
  - ボルドー色は使わず、`text-foreground` (チャコール)で
- ロールバッジ:
  - `bg-gray-100` → `bg-secondary`
  - `text-xs` のまま、padding 微調整
  - 絵文字(🏇 / 👑)は維持(視認性のため)
- ユーザー名: `text-sm font-medium text-foreground`
- ログアウトボタン:
  - `Button variant="outline" size="sm"` を維持しつつ、内部スタイルを調整
  - `text-xs uppercase tracking-wider`(エルメス的な小さな大文字ボタン)

完了後にコミット。

### タスク5: 馬一覧・馬詳細のリスタイル

#### 5-1: 馬一覧 (`app/horses/_components/horse-list.tsx`)

- `<main>` の padding を詰める(`px-3 py-3`)
- 見出し「担当馬一覧」「所有馬一覧」:
  - `text-lg font-bold` → `text-xs uppercase tracking-[0.2em] text-muted-foreground font-normal mb-3`
  - エルメス的に「ラベル」として小さく上品に
- 馬カード:
  - `Card` 全体: `bg-white shadow-sm` → `bg-card border border-border shadow-none rounded-sm`
  - hover: `hover:bg-gray-50 hover:shadow-lg` → `hover:border-foreground/20 transition-colors`
  - `CardHeader` の padding: `pb-2` → `p-3`
  - 馬画像: `h-16 w-16 rounded-lg` → `h-14 w-14 rounded-sm`
  - 馬名: `text-base text-gray-900` → `text-sm font-medium text-foreground tracking-wide`
  - バッジ:
    - `bg-gray-900 text-white` → `bg-secondary text-foreground border border-border font-normal`
    - サイズを小さく: `text-xs px-2 py-0.5` → `text-[10px] px-1.5 py-0 uppercase tracking-wider`
  - カード間: `gap-4` → `gap-2`
- 「馬が登録されていません」: `text-lg font-medium` → `text-sm font-normal text-muted-foreground`、絵文字無し、上下padding 控えめ

#### 5-2: 馬詳細 (`app/horses/[id]/_components/horse-detail-content.tsx`)

- 「馬一覧に戻る」リンク:
  - `text-sm text-gray-500` → `text-xs uppercase tracking-wider text-muted-foreground`
  - ラベル: 「馬一覧に戻る」 → 「← Back」(英語短縮)
  - 余白: `mb-4` → `mb-3`
- 馬プロフィールカード:
  - `Card` 全体: `bg-white shadow-sm` → `bg-card border border-border shadow-none rounded-sm`
  - `CardContent` padding: `pt-6` → `p-3`
  - 馬画像: `h-24 w-24 rounded-lg` → `h-20 w-20 rounded-sm`
  - 馬名: `text-xl font-bold text-gray-900` → `text-lg font-medium text-foreground tracking-wide`
  - バッジ: 一覧と同じスタイル(`bg-secondary text-foreground border` の小さなバッジ)
  - France Galop リンク: アイコン + テキスト、`text-blue-600` → `text-primary hover:text-primary/80 underline-offset-4 hover:underline`
- タブカード:
  - `bg-white shadow-sm` → `bg-card border border-border shadow-none rounded-sm`
  - `CardContent` padding: `p-4` → `p-3`
- カード間: `mb-6` → `mb-3`

完了後にコミット。

### タスク6: タブUIのリスタイル + 英語ラベル化

`app/horses/[id]/_components/horse-tabs.tsx` を修正:

- `tabs` 配列のラベルを英語に:
  - `{ id: "chat", label: "Chat", icon: MessageCircle }`
  - `{ id: "calendar", label: "Calendar", icon: Calendar }`
  - `{ id: "links", label: "Links", icon: Link2 }`
- タブバーのスタイル:
  - `border-b` → `border-b border-border/60`
  - 各タブボタン:
    - `py-3 text-sm font-medium` → `py-2 text-[11px] uppercase tracking-[0.15em] font-normal`
    - アイコン: `h-4 w-4` → `h-3.5 w-3.5`
    - アクティブ時: `border-b-2 border-gray-900 text-gray-900` → `border-b border-primary text-primary`(ボルドーの細い線でアクティブを示す)
    - 非アクティブ時: `text-gray-500 hover:text-gray-700` → `text-muted-foreground hover:text-foreground`
- タブコンテンツの上下 padding: `py-4` → `py-3`

完了後にコミット。

### タスク7: チャットタブのリスタイル

`app/horses/[id]/_components/chat-tab.tsx` を修正:

#### 重要な変更: 表示エリアの高さを画面いっぱいに

- 現状の `max-h-96`(384px固定)を撤廃
- 代わりに、ヘッダー + 馬プロフィール + タブヘッダー + 入力フォームを除いた残りの高さを使う
- 簡易実装: `flex-1` を使って親のflexコンテナで残り高さを占める
- ただし、`horse-detail-content.tsx` は `<main>` 内にカードが並ぶ構造のため、チャットだけ特別扱いするのは難しい
- **代替案: `max-h-[calc(100vh-340px)]` のように動的計算**で、画面高から固定要素の高さを引く
- 採用方針: `max-h-[calc(100vh-340px)] min-h-[300px]` を使う(値は調整可)

#### スタイル変更:

- メッセージバブル:
  - 自分の発言: `bg-blue-500 text-white` → `bg-primary text-primary-foreground`(ボルドー)
  - 相手の発言: `bg-gray-100 text-gray-900` → `bg-secondary text-foreground border border-border`
  - 角丸: `rounded-2xl` → `rounded-md`(やや控えめに)
- メッセージ間隔: `mb-2` → `mb-1.5`
- 日付区切り:
  - `bg-gray-100 text-gray-500` → `bg-transparent text-muted-foreground`
  - フォーマット: `2026/05/10` → `MAY 10, 2026`(英語の大文字、より上質に)
  - 日付フォーマット関数を以下に変更:
    ```typescript
    const formatDateHeader = (dateString: string) => {
      const d = new Date(dateString);
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    };
    ```
  - `text-xs tracking-wider` で上品に
- 名前ラベル: `text-xs font-medium text-gray-500` → `text-[10px] uppercase tracking-wider text-muted-foreground`
- 時刻表示: `text-[10px] text-gray-400` → `text-[10px] text-muted-foreground/70`
- 入力フォーム:
  - `border-t pt-3` → `border-t border-border/60 pt-2`
  - Input: 既存の Input コンポーネントを使うが、`text-gray-900` → `text-foreground`、placeholder を `Type a message...` に変更
  - 送信ボタン:
    - `bg-blue-500 hover:bg-blue-600` → `bg-primary hover:bg-primary/90`
- ファイル添付ボタン: `text-gray-500 hover:text-gray-700` → `text-muted-foreground hover:text-foreground`
- エラー表示: `text-red-500` → `text-destructive`
- 「まだメッセージがありません」: `text-gray-400` → `text-muted-foreground`、英語に変更 → `No messages yet`

完了後にコミット。

### タスク8: カレンダータブのリスタイル

`app/horses/[id]/_components/calendar-tab.tsx` を修正:

- カレンダーヘッダー(月送りボタン + 年月表示):
  - 月送りボタン: `bg-slate-700 hover:bg-slate-600` → `bg-transparent text-foreground hover:bg-secondary border border-border`
  - 年月表示: `text-sm font-bold text-gray-900` → `text-sm font-medium tracking-wider`
    - フォーマット: `2026年5月` → `MAY 2026`(英語大文字)
- 曜日ヘッダー: `text-xs font-medium text-gray-500` → `text-[10px] uppercase tracking-widest text-muted-foreground font-normal`
  - ラベル: `["日", "月", "火", "水", "木", "金", "土"]` → `["S", "M", "T", "W", "T", "F", "S"]`
- カレンダーグリッドの日付ボタン:
  - 通常: `text-gray-700 hover:bg-gray-100` → `text-foreground hover:bg-secondary`
  - 今日(`isToday`): `bg-blue-50 font-bold text-blue-700` → `bg-secondary font-medium text-foreground`
  - 選択中: `bg-gray-900 text-white` → `bg-primary text-primary-foreground`
  - 角丸: `rounded-md` → `rounded-sm`
  - 投稿ありドット: `bg-blue-500` → `bg-primary`、選択中の `bg-white` はそのまま
- 選択日のメッセージ表示:
  - 見出し「○○ のメッセージ」を英語に: `MAY 10, 2026 — Messages`
  - フォントスタイル: `text-sm font-bold text-gray-700` → `text-xs uppercase tracking-wider text-muted-foreground font-normal`
  - メッセージカード:
    - `bg-white shadow-sm` → `bg-card border border-border shadow-none rounded-sm`
    - `pt-4` → `p-3`
  - 投稿者名: `text-sm font-bold` → `text-xs uppercase tracking-wider text-muted-foreground font-normal`
  - 時刻: `text-xs text-gray-500` → `text-[10px] text-muted-foreground`
  - メッセージ本文: `text-sm text-gray-800` → `text-sm text-foreground leading-relaxed`
- 「この日のメッセージはありません」: `text-gray-400` → `text-muted-foreground`、英語化 → `No messages on this day`

完了後にコミット。

### タスク9: リンクタブのリスタイル

`app/horses/[id]/_components/link-tab.tsx` を修正:

- カテゴリフィルタボタン:
  - 通常: `bg-gray-100 text-gray-600 hover:bg-gray-200` → `bg-transparent text-muted-foreground hover:text-foreground border border-border hover:border-foreground/40`
  - アクティブ: `bg-gray-900 text-white` → `bg-primary text-primary-foreground border border-primary`
  - フォント: `text-xs font-medium` → `text-[10px] uppercase tracking-wider font-normal`
  - カテゴリラベルも英語化:
    - `all` → `All`
    - `bloodline` → `Bloodline`
    - `race_result` → `Race`
    - `news` → `News`
    - `video` → `Video`
    - `other` → `Other`
- 「リンクを追加」ボタン:
  - `Button variant="outline" size="sm" className="w-full"` のまま
  - ラベル: `リンクを追加` → `Add Link`、`text-xs uppercase tracking-wider`
- 追加フォーム:
  - 背景: `bg-gray-50` → `bg-secondary/50 border border-border`
  - Input: `bg-white text-gray-900` → `bg-background text-foreground`
  - placeholder も英語化: `URL（必須）` → `URL (required)`、`タイトル（任意）` → `Title (optional)`
  - 「追加」「キャンセル」ボタン: 同様にカラー調整、ラベル英語化(`Add` / `Cancel`)
- リンク一覧:
  - リンクカード: `border bg-white p-3` → `border border-border bg-card p-3 rounded-sm`
  - リンクアイコン: `text-gray-400` → `text-muted-foreground`
  - リンクテキスト: `text-blue-600 hover:underline` → `text-foreground hover:text-primary underline-offset-4 hover:underline transition-colors`
  - URL補足: `text-gray-400` → `text-muted-foreground/70`
  - カテゴリバッジ: `bg-gray-100 text-gray-500` → `bg-secondary text-muted-foreground border border-border text-[10px] uppercase tracking-wider px-1.5`
  - 削除ボタン: `text-gray-400 hover:bg-red-50 hover:text-red-500` → `text-muted-foreground hover:text-destructive`
- 空表示: `text-gray-400` → `text-muted-foreground`、英語化 → `No links yet` 等
- 「リンクの取得に失敗しました」等のエラーは既存のままで可
- カテゴリラベル(`categoryLabel`)も英語化:
  ```typescript
  const categoryLabel: Record<string, string> = {
    bloodline: "Bloodline",
    race_result: "Race",
    news: "News",
    video: "Video",
    other: "Other",
  };
  ```

完了後にコミット。

### タスク10: 認証画面(ログイン・サインアップ)のリスタイル

#### 対象ファイル:
- `components/login-form.tsx`
- `components/sign-up-form.tsx`
- `components/forgot-password-form.tsx`
- `components/update-password-form.tsx`
- `app/auth/login/page.tsx`
- `app/auth/sign-up/page.tsx`
- `app/auth/forgot-password/page.tsx`
- `app/auth/update-password/page.tsx`
- `app/auth/sign-up-success/page.tsx`
- `app/auth/error/page.tsx`

#### 共通方針:

- 各ページの `<main>` 等のラッパー: `min-h-screen flex flex-col items-center justify-center px-3 py-6`
- 認証カード:
  - 背景: `bg-card`、`border border-border`、`shadow-none`、`rounded-sm`
  - padding: `p-5` 程度
- 見出し:
  - 「ログイン」「アカウント作成」等を、`text-base uppercase tracking-[0.2em] font-normal text-foreground` のラベル風スタイルに
  - 例: `LOGIN`, `SIGN UP`, `FORGOT PASSWORD`, `RESET PASSWORD`
- サブテキスト: `text-xs text-muted-foreground`
- Input:
  - `bg-background text-foreground`、`border-border`、`rounded-sm`
  - フォーカス: `focus:border-primary focus:ring-0`
- ラベル: `text-[10px] uppercase tracking-wider text-muted-foreground font-normal`
- ボタン(主要):
  - `bg-primary text-primary-foreground hover:bg-primary/90`
  - `rounded-sm uppercase tracking-wider text-xs font-normal py-2.5`
- リンク(「アカウントをお持ちですか?」等):
  - `text-xs text-muted-foreground` で、強調部分のみ `text-primary hover:underline`
- エラー表示: `text-xs text-destructive`
- 既存の Card / CardHeader / CardContent コンポーネントを使っている場合、それを活かしつつスタイルを上記に合わせる

#### 文言は日本語のまま維持してOK(認証画面まで英語化すると混乱を招く)

ただし、見出しとボタンラベルだけは英語(LOGIN, SIGN UP等)にして、「ラベル風」のエルメス的な使い方をする。

完了後にコミット。

---

## 完了条件

- 上記10タスクすべてが完了している
- TypeScript ビルド成功(`npm run build`)
- ESLint エラーなし(`npm run lint`)
- `feature/phase2-hermes-ui` ブランチ上で作業されている
- 各タスクが個別のコミットになっている(指定したコミットメッセージで)
- ワーキングツリーがクリーン
- `git log --oneline main..HEAD` の結果をユーザーに報告

## 動作確認の観点(ユーザーが手動で確認)

実装完了後、ユーザーがブラウザで以下を確認する:

- [ ] PC で開くと、画面中央に 420px のアプリ枠、左右にストーングレーの額縁
- [ ] スマホ(または DevTools のモバイルビュー)で開くと、額縁が見えず画面いっぱい
- [ ] フォントが Noto Sans JP になっている(全体的に細く繊細な印象)
- [ ] アクセントカラーがディープボルドー(チャットの自分の発言、タブのアクティブ線、主要ボタン等)
- [ ] ダークモード切替が無くなっている
- [ ] 馬一覧・馬詳細・タブ全て、エルメス的な余白と線で構成されている
- [ ] タブが「Chat / Calendar / Links」の英語表記
- [ ] 認証画面も新しいパレットで統一されている
- [ ] 横スクロールが発生しない

## 注意事項

- 文言の日本語/英語の使い分け:
  - **英語化するもの**: タブ名、カレンダーの月名・曜日、認証画面の見出し・ボタン、空表示メッセージ、UI操作系ラベル(Add Link, Cancel等)
  - **日本語のまま**: 認証画面の説明文、エラーメッセージ、ロールバッジ(🏇 調教師 / 👑 馬主)、メッセージ本文(これはユーザー入力)
- 既存の機能・データフローは一切変更しない(見た目のみ)
- DBスキーマ変更なし
- 新規依存パッケージは導入しない(`next/font` は標準機能なので追加不要)
- `next-themes` は削除する
