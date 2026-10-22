# Alexa スキル - AIチャット Basic

OpenAI互換APIを使ったAlexaチャットスキルです。

## 構成

```
alexa-skill-ai-chat-basic/
├── lambda/                          # Lambda関数（TypeScript）
│   ├── src/
│   │   └── index.ts                 # メインのスキルコード
│   ├── package.json
│   └── tsconfig.json
├── skill-package/                   # Alexaスキルの設定
│   ├── interactionModels/
│   │   └── custom/
│   │       └── ja-JP.json           # 日本語の発話モデル
│   ├── skill.json                   # スキルマニフェスト（Git管理外）
│   └── skill.json.example           # スキルマニフェストのテンプレート
├── ask-resources.json               # ASK CLIのデプロイ設定
├── .env.example                     # 環境変数のサンプル
└── README.md
```

## 必要なもの

- Node.js 24（Lambdaのランタイム `nodejs24.x` に合わせています）
- [ASK CLI](https://developer.amazon.com/ja-JP/docs/alexa/smapi/quick-start-alexa-skills-kit-command-line-interface.html)（デプロイに使います）

## セットアップ

### 1. skill.json の準備

`skill-package/skill.json` はデプロイ時にAWSアカウント情報が書き込まれるためGit管理外です。
テンプレートからコピーして作成してください：

```bash
cp skill-package/skill.json.example skill-package/skill.json
```

### 2. 依存パッケージのインストール

```bash
cd lambda
npm install
```

### 3. ビルド

```bash
npm run build
```

### 4. 環境変数の設定

Lambda関数に以下の環境変数を設定してください：

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `OPENAI_API_KEY` | APIキー | `sk-...` |
| `OPENAI_BASE_URL` | APIエンドポイントURL | `https://api.example.com/v1` |
| `MODEL_NAME` | 使用するモデル名 | `gpt-oss-120b` |

## 使い方

- 「アレクサ、じんこうちのうを開いて」で起動
- 起動後は「質問があります」に続けて質問します（例：「質問があります 富士山の高さは」）
  - 「教えてください」「知りたいことがあります」「調べてください」でも質問できます
- 「ストップ」または「キャンセル」で終了
