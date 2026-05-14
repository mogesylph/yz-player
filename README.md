# yz-player

yz-player は、YouTube 動画内の指定区間を曲単位で連続再生するための個人用プレイヤーです。

歌枠や長時間動画のセトリをもとに、曲ごとの開始時刻・終了時刻をプレイリスト化し、1 曲ずつ区間再生できるようにするために作っています。

柚羽まくらさんという Vsinger の歌枠を聴きやすくすることを主な目的にしていますが、このリポジトリは個人制作の非公式ツールです。柚羽まくらさん本人、所属先、YouTube とは関係ありません。

## Features

- YouTube 動画内の指定区間を曲単位で再生
- プレイリスト内の曲を連続再生
- 再生 / 一時停止 / 次曲スキップ
- 全曲リピート、1 曲リピート、シャッフル再生
- 音量変更とミュート切り替え
- セトリテキストからプレイリストを生成
- `songlist.tsv` による曲長補完
- 解析できなかったセトリ行の確認
- プレイリストの保存 / 読み込み
- ブラウザの localStorage による作業状態の復元
- ライト / ダークテーマ切り替え

## Concept

このアプリでは、YouTube プレイヤーを最も重要な UI として扱います。

画面遷移や複雑な設定を増やさず、動画を見ながら曲単位で聴けることを優先しています。また、セトリ変換は中核機能として扱い、変換ロジックを Vue コンポーネントから分離して、形式追加や仕様変更をしやすくしています。

詳しい方針は以下のドキュメントにまとめています。

- [docs/ui-design.md](docs/ui-design.md)
- [docs/setlist-conversion-spec.md](docs/setlist-conversion-spec.md)
- [docs/playlist-data-spec.md](docs/playlist-data-spec.md)
- [docs/ai-skills.md](docs/ai-skills.md)

## Development

アプリ本体は `app` 以下にあります。

```bash
cd app
npm install
npm run dev
```

YouTube IFrame API の動作確認は、Vite が表示する `http://localhost:<port>/` を使ってください。動画によっては `127.0.0.1` と `localhost` で iframe の再生可否が変わる場合があります。

本番ビルドは以下で確認できます。

```bash
cd app
npm run build
```

テストは以下で実行できます。

```bash
cd app
npm run test
```

## Data

プレイリストやセトリ変換中の入力など、作業状態の復元に必要なデータはブラウザの localStorage に保存されます。

曲長補完に使う曲マスタは `app/public/songlist.tsv` を参照します。

## License

このリポジトリには、現時点で明示的なオープンソースライセンスを付与していません。

コードは個人用ツールとして公開しています。再利用、改変、再配布を希望する場合は、事前に相談してください。
