# setlist conversion spec

`yz-player` のセトリ変換機能の仕様です。変換ロジックは pure function として扱い、その上に UI を載せます。

## 目的

セトリ変換は、YouTube 動画 ID とセトリテキストから、プレイリストへ追加できる曲区間リストを作る機能です。

入力:

- YouTube 動画 ID または URL
- セトリテキスト
- 曲長マスタ `songlist.tsv`

出力:

- `PlaylistItem[]`
- `ParseIssue[]`

## 基本型

```ts
type VideoId = string

type PlaylistItem = {
  id: string
  videoId: VideoId
  title: string
  artist?: string | null
  start: number
  end: number
  source: 'setlist'
}

type ParsedSetlistLine = {
  lineNumber: number
  rawLine: string
  start: number
  title: string
  artist?: string | null
}

type ParseIssue = {
  lineNumber: number
  line: string
  reason:
    | 'empty_line'
    | 'no_timestamp_match'
    | 'invalid_time'
    | 'empty_title'
    | 'invalid_video_id'
}

type SetlistParseResult = {
  items: PlaylistItem[]
  issues: ParseIssue[]
}
```

`empty_line` は通常 UI に表示しなくてよいですが、テストやデバッグで必要なら保持できるようにします。

## 処理パイプライン

```text
videoId / URL の検証
  |
  v
行分割
  |
  v
行の正規化
  |
  v
timestampPatterns による行解析
  |
  v
曲名 / アーティストの正規化
  |
  v
曲長マスタ照合
  |
  v
end 補完
  |
  v
PlaylistItem[] + ParseIssue[]
```

各段階は単体テスト可能な関数に分けます。

## Video ID の仕様

受け付ける入力:

- 11 文字の YouTube 動画 ID
- `https://www.youtube.com/watch?v=xxxxxxxxxxx`
- `https://youtu.be/xxxxxxxxxxx`

抽出結果は 11 文字の ID とします。

```ts
parseVideoId('dQw4w9WgXcQ') // 'dQw4w9WgXcQ'
parseVideoId('https://youtu.be/dQw4w9WgXcQ') // 'dQw4w9WgXcQ'
parseVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ') // 'dQw4w9WgXcQ'
```

不正な場合は変換全体を失敗扱いにし、`invalid_video_id` を返します。

## 行の正規化

行解析前に次を行います。

- 前後の空白を trim する。
- 空行は解析対象から外す。
- 絵文字を除去する。
- 連続する空白は必要に応じて 1 つに畳む。
- 全角スラッシュ `／` と半角スラッシュ `/` はどちらもアーティスト分割に使える。

元の行は `rawLine` と `ParseIssue.line` に残します。

## 時刻の仕様

対応する時刻形式:

- `mm:ss`
- `h:mm:ss`
- `hh:mm:ss`

`parseTime()` は秒数を返します。

```ts
parseTime('1:56') // 116
parseTime('02:11') // 131
parseTime('1:02:03') // 3723
parseTime('01:02:03') // 3723
```

分または秒が数値でない場合は `invalid_time` とします。

## 対応するセトリ行形式

### 1. `hh:mm:ss 曲名 / アーティスト`

入力:

```text
00:01:23 l'aster / 柚羽まくら
```

期待値:

```ts
{
  start: 83,
  title: "l'aster",
  artist: '柚羽まくら'
}
```

### 2. `hh:mm:ss 1. 曲名 / アーティスト`

入力:

```text
00:01:23 1. l'aster / 柚羽まくら
```

期待値:

```ts
{
  start: 83,
  title: "l'aster",
  artist: '柚羽まくら'
}
```

### 3. `【hh:mm:ss】「曲名」アーティスト`

入力:

```text
【00:01:23】「l'aster」柚羽まくら
```

期待値:

```ts
{
  start: 83,
  title: "l'aster",
  artist: '柚羽まくら'
}
```

### 4. `hh:mm:ss 曲名`

入力:

```text
00:01:23 l'aster
```

期待値:

```ts
{
  start: 83,
  title: "l'aster",
  artist: null
}
```

### 5. `【mm:ss】 曲名`

入力:

```text
【01:23】 l'aster
```

期待値:

```ts
{
  start: 83,
  title: "l'aster",
  artist: null
}
```

### 6. `番号 mm:ss 曲名`

入力:

```text
① 1:23 l'aster
```

期待値:

```ts
{
  start: 83,
  title: "l'aster",
  artist: null
}
```

### 7. `1. mm:ss 曲名`

入力:

```text
1. 01:23 l'aster
```

期待値:

```ts
{
  start: 83,
  title: "l'aster",
  artist: null
}
```

### 8. `[hh:mm:ss] 曲名`

入力:

```text
[00:01:23] l'aster
```

期待値:

```ts
{
  start: 83,
  title: "l'aster",
  artist: null
}
```

### 9. `hh:mm:ss 曲名／アーティスト`

入力:

```text
00:01:23 l'aster／柚羽まくら
```

期待値:

```ts
{
  start: 83,
  title: "l'aster",
  artist: '柚羽まくら'
}
```

### 10. `hh:mm:ss<TAB>曲名`

入力:

```text
00:01:23	l'aster
```

期待値:

```ts
{
  start: 83,
  title: "l'aster",
  artist: null
}
```

### 11. `hh:mm:ss：曲名`

入力:

```text
00:01:23：l'aster
```

期待値:

```ts
{
  start: 83,
  title: "l'aster",
  artist: null
}
```

## timestamp pattern の構造

各パターンは次の形にします。

```ts
type TimestampPattern = {
  id: string
  label: string
  examples: string[]
  regex: RegExp
  parse: (match: RegExpMatchArray) => {
    startText: string
    titleText: string
    artistText?: string | null
  }
}
```

追加ルール:

- `id` は安定した文字列にする。
- `examples` を最低 1 件持たせる。
- 追加時はテストケースを追加する。
- パターンの順序変更時は既存ケースの期待結果を確認する。

## 曲名 / アーティストの正規化

基本ルール:

- `title` は trim する。
- `artist` は trim する。
- `artist` が空なら `null` にする。
- `title` に `/` または `／` が含まれる場合、左側を `title`、右側を `artist` とする。
- 分割は最初の `/` または `／` のみを使う。

例:

```ts
normalizeTitleArtist("l'aster / 柚羽まくら")
// { title: "l'aster", artist: '柚羽まくら' }

normalizeTitleArtist("l'aster")
// { title: "l'aster", artist: null }
```

## 曲長マスタ照合

`songlist.tsv` は次の構造です。

```text
title	artist	length
l'aster	柚羽まくら	300
```

読み込み時:

- ヘッダー行はデータとして扱わない。
- `title` と `artist` を trim する。
- `length` は number に変換する。
- 不正行は無視してよいが、将来ログに出せる構造にしておく。

照合キー:

```ts
`${title.trim()}__${artist?.trim() || ''}`
```

初期実装では完全一致でよいです。表記ゆれ対応は `songMatcher` に閉じ込め、後から改善します。

## end 補完ルール

`end` は次の優先順位で決めます。

1. 曲長マスタに一致した場合: `start + length`
2. 次の曲があり、次曲まで 360 秒未満の場合: 次曲の `start`
3. 次の曲がない、または次曲まで 360 秒以上の場合: `start + 360`

`MAX_TIME_GAP` は 360 秒です。

例:

```ts
[
  { start: 100, title: 'A' },
  { start: 220, title: 'B' }
]
```

曲長マスタに一致しない場合:

- A の `end` は 220
- B の `end` は 580

次曲まで 360 秒以上ある場合:

```ts
[
  { start: 100, title: 'A' },
  { start: 600, title: 'B' }
]
```

- A の `end` は 460
- B の `end` は 960

## ParseIssue の扱い

読み取れない行は捨てずに `issues` に入れます。

例:

```text
これはコメントです
00:01:23 l'aster / 柚羽まくら
```

期待値:

```ts
{
  items: [
    {
      videoId: 'xxxxxxxxxxx',
      title: "l'aster",
      artist: '柚羽まくら',
      start: 83,
      end: 443,
      source: 'setlist'
    }
  ],
  issues: [
    {
      lineNumber: 1,
      line: 'これはコメントです',
      reason: 'no_timestamp_match'
    }
  ]
}
```

UI では最低限、読み取れなかった行数を表示します。余裕があれば行番号と元行も表示します。

## 変換成功条件

- `videoId` が有効。
- `items.length > 0`。

`issues.length > 0` でも、`items.length > 0` なら変換自体は成功扱いにできます。

`items.length === 0` の場合は、プレイリストへ追加せず、ユーザーに読み取り失敗を伝えます。

## 最低限のテストケース

実装時に最低限用意するテストです。

- 11 文字の動画 ID を受け付ける。
- YouTube watch URL から動画 ID を抽出する。
- youtu.be URL から動画 ID を抽出する。
- 不正な動画 ID で `invalid_video_id` を返す。
- `hh:mm:ss 曲名 / アーティスト` を解析する。
- `hh:mm:ss 1. 曲名 / アーティスト` を解析する。
- `【hh:mm:ss】「曲名」アーティスト` を解析する。
- `hh:mm:ss 曲名` を解析する。
- `【mm:ss】 曲名` を解析する。
- `① mm:ss 曲名` を解析する。
- `1. mm:ss 曲名` を解析する。
- `[hh:mm:ss] 曲名` を解析する。
- 全角スラッシュで artist を分割する。
- タブ区切り行を解析する。
- コロン区切り行を解析する。
- 読み取れない行を `issues` に入れる。
- 曲長マスタ一致時に `start + length` を `end` にする。
- 曲長マスタ不一致時に次曲 start を `end` にする。
- 次曲まで 360 秒以上なら `start + 360` を `end` にする。
- 最後の曲は `start + 360` を `end` にする。
