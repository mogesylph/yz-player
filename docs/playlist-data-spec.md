# playlist data spec

`yz-player` のプレイリスト、曲長マスタ、保存形式、localStorage のデータ仕様です。

## 目的

プレイヤー、セトリ変換、保存 / 読み込み、UI 表示は同じ内部データを扱います。境界ごとに都合の違う形を持ち込むと壊れやすいため、内部データ構造を明確にします。

## 基本方針

- 内部データは保存形式に引きずられない。
- `title` と `artist` は内部では分ける。
- 表示名は必要な場所で組み立てる。
- import は寛容に、内部データは厳格にする。
- プレイリストファイル形式は version を持つ。

## 内部データ型

### `PlaylistItem`

```ts
type PlaylistItem = {
  id: string
  videoId: string
  title: string
  artist?: string | null
  start: number
  end: number
  source: PlaylistItemSource
  createdAt?: string
  updatedAt?: string
}

type PlaylistItemSource = 'setlist' | 'file' | 'manual'
```

フィールド:

| field | required | description |
| --- | --- | --- |
| `id` | yes | アプリ内部の安定 ID |
| `videoId` | yes | YouTube 動画 ID |
| `title` | yes | 曲名 |
| `artist` | no | アーティスト名。未設定は `null` |
| `start` | yes | 再生開始秒 |
| `end` | yes | 再生終了秒 |
| `source` | yes | 追加元 |
| `createdAt` | no | 作成日時 ISO 文字列 |
| `updatedAt` | no | 更新日時 ISO 文字列 |

### ID

ID はアプリ内部で安定して扱える値にします。実装では次のような方式を使えます。

- `crypto.randomUUID()`
- `videoId:start:end:title` を元にした安定 ID

重複判定とは別に扱います。

### 重複判定

重複キーは次の形式にします。

```ts
`${videoId}:${start}:${end}`
```

`title` や `artist` は表記ゆれが起きやすいため、重複判定の主キーにしません。

## 派生表示

内部データの `title` と `artist` は分けます。UI 表示では必要に応じて表示名を作ります。

```ts
function formatTrackName(item: PlaylistItem): string {
  return item.artist ? `${item.title} / ${item.artist}` : item.title
}
```

ファイル出力時も、保存形式に応じて `title` と `artist` を明示的に扱います。

## `SongMasterItem`

`public/songlist.tsv` から作る曲長マスタです。

```ts
type SongMasterItem = {
  title: string
  artist: string
  length: number
}
```

読み込みルール:

- ヘッダー行は除外する。
- `title` と `artist` は trim する。
- `length` は秒数の number にする。
- `length` が不正な行は除外する。

検索キー:

```ts
`${title.trim()}__${artist?.trim() || ''}`
```

表記ゆれ対応は `songMatcher` に閉じ込めます。

## プレイリストファイル形式

保存形式は version 付き JSON です。

拡張子は `.json` を基本とします。中身は次の version 付き JSON にします。

```ts
type PlaylistFile = {
  app: 'yz-player'
  version: 1
  exportedAt: string
  items: PlaylistFileItem[]
}

type PlaylistFileItem = {
  videoId: string
  title: string
  artist?: string | null
  start: number
  end: number
}
```

例:

```json
{
  "app": "yz-player",
  "version": 1,
  "exportedAt": "2026-04-28T13:00:00.000Z",
  "items": [
    {
      "videoId": "dQw4w9WgXcQ",
      "title": "l'aster",
      "artist": "柚羽まくら",
      "start": 83,
      "end": 383
    }
  ]
}
```

保存時:

- `id` は保存してもしなくてもよい。
- `id` を保存しない場合、import 時に新しい `id` を発行する。
- `createdAt` / `updatedAt` は保存しなくてよい。

読み込み時:

- `app` が `yz-player` であることを確認する。
- `version` を確認する。
- 未対応 version はエラーにする。
- `items` を `PlaylistItem[]` へ正規化する。

## import 正規化ルール

ファイル形式に関係なく、import 後は次のルールで内部データにします。

- `videoId` が不正なら取り込まない。
- `title` が空なら取り込まない。
- `start` が不正なら 0 にする。
- `end` が不正、0、または `start` 以下なら `start + 360` にする。
- `artist` が空文字なら `null` にする。
- `source` は読み込み元に応じて設定する。
- `id` は import 時に新規発行する。

## localStorage

localStorage はアプリの復元用です。ファイル保存形式とは別に扱います。

キー候補:

| key | value |
| --- | --- |
| `yz-player:playlist` | 現在の `PlaylistItem[]` |
| `yz-player:setlist-draft` | セトリ変換中の入力 draft |
| `yz-player:theme` | テーマ設定 |

## `SetlistDraft`

セトリ入力の途中保存用です。

```ts
type SetlistDraft = {
  videoInput: string
  rawText: string
  updatedAt: string
}
```

変換成功後は削除します。変換失敗時は残します。

## Playlist state

画面内で扱うプレイリスト状態です。

```ts
type PlaylistState = {
  items: PlaylistItem[]
  currentIndex: number
}
```

派生値:

```ts
currentItem = items[currentIndex] ?? null
totalCount = items.length
playlistPosition = `${currentIndex + 1}/${items.length}`
```

`items.length === 0` の場合、`currentIndex` は 0 とします。

## 再生モード

```ts
type PlayMode = 'none' | 'all' | 'one' | 'shuffle'
```

意味:

| mode | behavior |
| --- | --- |
| `none` | 最後の曲で停止 |
| `all` | 最後の曲の次は先頭へ戻る |
| `one` | 現在曲を繰り返す |
| `shuffle` | ランダムな曲へ移動 |

`shuffle` は 1 曲以下の場合に無限ループしないようにします。

## YouTube playback request

YouTube Player に渡す再生リクエストは、`PlaylistItem` から作ります。

```ts
type PlaybackRequest = {
  videoId: string
  startSeconds: number
  endSeconds: number
}
```

`endSeconds` は必ず `startSeconds` より大きい値に正規化済みとします。

## 未決定事項

- `id` を export するかどうか。
- 解析結果の補完根拠をファイルに保存するかどうか。
