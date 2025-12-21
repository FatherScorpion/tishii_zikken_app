# tishii_zikken_app

Github PagesでホストされるReactアプリケーション

## セットアップ

### 依存関係のインストール

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

開発サーバーは `http://localhost:5173` で起動します。

### ビルド

```bash
npm run build
```

ビルドされたファイルは `dist` ディレクトリに生成されます。

### Github Pagesへのデプロイ

```bash
npm run deploy
```

このコマンドは自動的にビルドを行い、`gh-pages` ブランチにデプロイします。

## 注意事項

### baseパスの設定

リポジトリ名がURLに含まれる場合（例: `https://username.github.io/tishii_zikken_app/`）、`vite.config.js` の `base` を以下のように変更してください:

```javascript
base: '/tishii_zikken_app/',
```

カスタムドメインを使用する場合は `base: '/'` のままにしてください。

## 技術スタック

- React 18
- Vite
- Github Pages

