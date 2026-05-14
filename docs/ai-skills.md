# AI skills

yz-player で使うプロジェクトローカル skill の運用メモです。

skill は `.agents/skills/` 配下に置きます。毎回の実装指示に長い前提を書かなくても、同じ観点で判断したい作業に使います。

## 基本方針

- まず `AGENTS.md` のプロジェクト方針を優先する
- skill は「繰り返し使う作業単位」にだけ使う
- 1 skill = 1 job を目安にする
- 迷ったら、skill を増やすより既存 skill の改善を優先する
- セトリ変換、YouTube 連携、GitHub Pages 公開のような壊れやすい境界は skill 化しやすい

## skill-definition

新しい skill を作るかどうかを考えるための skill です。

使う場面:

- 新しい skill の名前や責務を決めたい
- その作業を skill 化すべきか迷っている
- `AGENTS.md` に書く内容と skill にする内容を切り分けたい
- 既存 skill と重複しそうなので整理したい

頼み方の例:

```text
この作業を skill 化するべきか、skill-definition を使って整理してください
```

使わない場面:

- すぐ実装してほしいだけのとき
- 通常のコードレビュー
- 既存 skill の品質レビュー

組み込みの `skill-creator` との違い:

- `skill-creator` は Codex skill 全般の作成ルールや構成を扱う
- `skill-definition` は yz-player で skill を増やすべきか、責務をどう切るかを軽く判断する

## skill-design-review

既存 skill の内容を見直すための skill です。

使う場面:

- `SKILL.md` が長くなってきた
- 使いどころが曖昧になってきた
- 他 skill や `AGENTS.md` と内容が重複している
- skill 名や description を見直したい

頼み方の例:

```text
skill-design-review を使って ui-layout-design の内容を見直してください
```

使わない場面:

- アプリコードそのもののレビュー
- UI の見た目やレイアウトの相談
- 新しい skill をゼロから定義する相談

## ui-layout-design

yz-player の単一画面レイアウトを設計・改善するための skill です。

使う場面:

- YouTube プレイヤーをもっと見やすくしたい
- 再生操作、プレイリスト、セトリ変換入口の配置を見直したい
- 余白や UI 密度を調整したい
- スマホ幅で操作領域が詰まっている

頼み方の例:

```text
ui-layout-design を使って、プレイヤーを縮めずにセトリ変換入口を置く案を考えてください
```

見る観点:

- YouTube プレイヤーが主役として扱われているか
- 動画の縦横比が崩れていないか
- 操作ボタンがコンパクトにまとまっているか
- 現在曲とプレイリストの関係が分かるか
- スマホ幅でも再生、次曲、セトリ追加が最低限使えるか

使わない場面:

- 色や装飾だけを決めたい
- Vue の state 設計を相談したい
- セトリ変換ロジックを変更したい

## github-pages-deploy-check

GitHub Pages 公開前後のパス問題や workflow 設定を確認するための skill です。

使う場面:

- GitHub Pages に公開する前に確認したい
- 公開後に JS、CSS、画像、favicon、`songlist.tsv` が読み込めない
- `app/vite.config.ts` の `base` を変更した
- `app/public/` 配下のファイル参照を追加・変更した
- `.github/workflows/deploy.yml` を変更した

頼み方の例:

```text
github-pages-deploy-check を使って、公開前チェックをしてください
```

主な確認内容:

- `base: '/yz-player/'`
- `fetch()` が `import.meta.env.BASE_URL` を使っているか
- `app/public/songlist.tsv` や favicon 類が存在するか
- GitHub Actions が `app` を build し、`app/dist` を Pages artifact にしているか
- build 後の asset path が `/yz-player/` になっているか

使わない場面:

- 通常の UI 変更
- Vue コンポーネント設計
- GitHub Pages 以外のホスティング設定

## 追加候補

今後、同じ指示を繰り返すようなら次の skill 化を検討します。

- `setlist-conversion-change`: timestamp pattern 追加、曲長補完、ParseIssue、テスト追加の手順を固定する
- `youtube-player-integration`: YouTube IFrame API、singleton loader、localhost 動作確認の観点を固定する
- `playlist-data-compatibility`: localStorage、playlist file、`songlist.tsv` の互換性確認を固定する

追加するときは、まず `skill-definition` で本当に必要かを確認します。
