# YouTube Trend MVP

このアプリケーションは、YouTube のトレンド動画を簡単に取得して表示するための最小限の機能を持った MVP (Minimum Viable Product) です。

## 機能

- ボタン一つで世界中でトレンドになっている YouTube 動画を 5 つ取得
- レスポンシブデザインで様々な画面サイズに対応
- 動画のサムネイル、タイトル、チャンネル名、公開日を表示
- 各動画へのリンク

## セットアップ

1. このリポジトリをクローンします

```bash
git clone <repository-url>
cd youtubeTrend
```

2. 依存関係をインストールします

```bash
npm install
# または
yarn
# または
pnpm install
```

3. `.env.local` ファイルを作成し、YouTube API キーを設定します

```
YOUTUBE_API_KEY=your_youtube_api_key_here
```

4. 開発サーバーを起動します

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
```

5. ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認します

## YouTube API キーの取得方法

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセスします
2. プロジェクトを作成します
3. YouTube Data API v3 を有効にします
4. 認証情報ページで API キーを作成します
5. 作成した API キーを `.env.local` ファイルに設定します

## 注意事項

- YouTube Data API には無料枠の制限があるため、頻繁にAPIを呼び出すとクォータを超える可能性があります
- このアプリケーションは学習目的の MVP であり、本番環境での使用は想定していません
