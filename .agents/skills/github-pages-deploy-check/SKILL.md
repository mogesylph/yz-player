---
name: github-pages-deploy-check
description: yz-player の GitHub Pages 公開前後の確認をするときに使う。Vite の base、public 配下ファイルの参照パス、GitHub Actions workflow、ビルド結果の asset path を確認し、https://mogesylph.github.io/yz-player/ で壊れず動くかをチェックする。通常の UI 変更や機能実装だけの場合には使わない。
---

# github-pages-deploy-check

## 目的

GitHub Pages 公開時に起きやすいパス問題と deploy 設定ミスを、push 前または公開後の不具合調査で確認する。

yz-player は `https://mogesylph.github.io/yz-player/` で公開するため、ルート `/` ではなく `/yz-player/` 配下で動く前提で確認する。

## 対象

この skill は以下のような場面で使う。

- GitHub Pages に公開する前のチェック
- 公開後に JS / CSS / 画像 / favicon / TSV が読み込めない
- `vite.config.ts` の `base` を変更した
- `public/` 配下のファイルを追加・変更した
- `fetch()` で静的ファイルを読む処理を追加・変更した
- `.github/workflows/deploy.yml` を追加・変更した

## 対象外

この skill は以下には使わない。

- 通常の UI レイアウト変更
- Vue コンポーネント設計の相談
- 曲リスト TSV の内容レビュー
- GitHub Pages 以外のホスティング設定
- GitHub 認証や SSH key の設定作業

## 基本原則

- 公開先 URL は `https://mogesylph.github.io/yz-player/` として扱う
- Vite の `base` は `/yz-player/` を前提にする
- `public/` 配下のファイルをコードから読むときは、絶対パス `/file` を避ける
- 静的ファイルの fetch には `import.meta.env.BASE_URL` を使う
- GitHub Actions では `app/` を build し、`app/dist` を Pages artifact として upload する
- push はユーザーが行う運用を優先し、依頼がない限り push しない

## チェック手順

### 1. Vite base を確認する

`app/vite.config.ts` を確認し、次の設定になっているか見る。

```ts
base: '/yz-player/',
```

### 2. 静的ファイル参照を確認する

`app/src` で次のような参照を探す。

```sh
rg -n "fetch\\('/|fetch\\(\"/|src=\\\"/|href=\\\"/" app/src
```

`public/` 配下のファイルを `fetch()` する場合は、次の形を優先する。

```ts
fetch(`${import.meta.env.BASE_URL}songlist.tsv`)
```

### 3. public ファイルを確認する

`app/public` に必要なファイルが存在するか確認する。

- `songlist.tsv`
- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png`
- `logo.png`
- `header-title.png`

### 4. GitHub Actions workflow を確認する

`.github/workflows/deploy.yml` で次を確認する。

- `main` push または `workflow_dispatch` で起動する
- `defaults.run.working-directory` が `app`
- `npm ci` を実行する
- `npm run build` を実行する
- `actions/upload-pages-artifact` の `path` が `app/dist`
- `actions/deploy-pages` を使っている

### 5. ビルドする

次を実行する。

```sh
cd app
npm run build
```

失敗した場合は、公開チェックを続けずにビルドエラーを先に直す。

### 6. dist のパスを確認する

ビルド後に `app/dist/index.html` を確認し、JS / CSS / favicon の参照が `/yz-player/` から始まっているか見る。

必要に応じて次を実行する。

```sh
rg -n "/yz-player/|/songlist.tsv" app/dist
```

`/songlist.tsv` のようなルート直下参照が残っていたら修正する。

## よくある問題

### public ファイルが読めない

原因になりやすいコード:

```ts
fetch('/songlist.tsv')
```

修正例:

```ts
fetch(`${import.meta.env.BASE_URL}songlist.tsv`)
```

### JS / CSS が 404 になる

`app/vite.config.ts` の `base` が未設定、または公開リポジトリ名と一致していない可能性が高い。

### workflow は成功するがページが古い

ブラウザキャッシュ、GitHub Pages の反映待ち、または別ブランチを見ている可能性を確認する。

## 出力ルール

この skill を使ったときは、原則として以下の形式で返す。

1. チェック結果
2. 問題があれば修正内容
3. 実行した確認コマンド
4. build の結果
5. push 前にユーザーが行うこと

## 返答スタイル

- 問題がなければ「公開前チェックOK」と明確に言う
- 問題があれば、公開 URL でどう壊れるかを短く説明する
- 修正できる場合は最小修正を行う
- push はユーザーが行う前提で、必要な commit メッセージを提案する
