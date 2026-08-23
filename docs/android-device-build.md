# chasemaker — Android 実機ビルド・テスト手順書

MacBook + Pixel 実機で chasemaker をビルド・インストール・テストする手順。

## 前提

- **プロジェクト**: Expo SDK 57 / React Native（Managed Workflow、`android/` はビルド時に自動生成）
- **開発環境**: macOS + Android Studio
- **テスト端末**: Pixel 10a（物理端末）
- **注意**: `expo-notifications` を使っているため、通知の本番に近いテストには **Expo Go ではなく Development Build / リリース APK** が必要

---

## 1. 事前準備

### 1.1 Mac 側

1. [Android Studio](https://developer.android.com/studio) をインストール
2. Android SDK / Platform-Tools をインストール  
   **Settings → Android SDK → SDK Tools → Android SDK Platform-Tools**
3. 環境変数（`~/.zshrc` に追記推奨）:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

4. 依存関係のインストール:

```bash
cd /path/to/chasemaker
npm install
```

> `npm audit` の脆弱性警告は Expo 依存が多く、開発中は **`npm audit fix --force` は使わない**（Expo SDK が壊れる可能性あり）。

### 1.2 Pixel 側（初回のみ）

1. **設定 → 端末情報 → ビルド番号** を 7 回タップ → 開発者向けオプションを有効化
2. **設定 → システム → 開発者向けオプション**:
   - **USB デバッグ** … ON
   - **デフォルトの USB 設定** … **ファイル転送**（推奨）
   - （あれば）**USB デバッグ（セキュリティ設定）** … ON
3. **データ転送対応の USB ケーブル**で Mac に直接接続（充電専用ケーブルは不可）
4. **「USB デバッグを許可しますか？」** が出たら **許可**（「常に許可」にチェック推奨）
5. 通知パネルの USB 用途を **ファイル転送 / Android Auto** に変更

---

## 2. 実機接続の確認

### 2.1 adb で確認

```bash
adb kill-server
adb start-server
adb devices
```

| 表示 | 意味 | 対処 |
|------|------|------|
| `XXXXXXXX    device` | 接続 OK | 次へ進む |
| `XXXXXXXX    unauthorized` | 未許可 | 端末で許可ダイアログを押す |
| （空） | 未認識 | 下記トラブルシュート |

### 2.2 Mac が USB で端末を見えているか

> **注意**: macOS 25.x 付近では `system_profiler SPUSBDataType` が **空のまま返る** ことがある。端末未接続とは限らない。

代わりに:

```bash
ioreg -p IOUSB -w0 | grep -i pixel
```

`Pixel 10a` などが出れば **USB 接続は成功**。`adb devices` が空なら **USB デバッグの許可** を見直す。

### 2.3 接続トラブルシュート

1. **USB デバッグの許可を取り消す**（開発者向けオプション）→ ケーブル抜き差し → 許可ダイアログを再度承認
2. 別の **データ対応ケーブル** / 別 USB ポートを試す（ハブ経由は避ける）
3. 画面を **unlock** した状態で接続
4. USB 用途を **ファイル転送** に変更

### 2.4 無線デバッグ（USB が難しい場合）

Mac と Pixel を **同じ Wi‑Fi** に接続:

1. Pixel: **設定 → 開発者向けオプション → ワイヤレスデバッグ** ON
2. **ペア設定コードを使用してデバイスをペア設定**
3. Mac:

```bash
adb pair <IP>:<ペアリングポート>   # 6桁コードを入力
adb connect <IP>:<接続ポート>
adb devices
```

---

## 3. ビルドの種類と選び方

| 種類 | Metro 必要？ | PC 接続必要？ | 用途 |
|------|-------------|--------------|------|
| **デバッグビルド** | 毎回必要 | 開発中は必要 | コード変更をすぐ反映 |
| **リリースビルド** | 不要 | 不要 | 単体アプリとして試す|

---

## 4. 開発用ビルド（コード変更を反映したいとき）

### 4.1 おすすめ: 一括コマンド

```bash
npx expo run:android --device
```

以下を自動で行う:

- `android/` ディレクトリ生成（初回）
- ネイティブビルド
- 実機へのインストール
- Metro 起動
- `adb reverse` 設定

### 4.2 2 回目以降（JS/TS のみ変更）

ネイティブ依存を追加していなければ、Metro だけでよい:

```bash
npx expo start
```

実機で chasemaker アプリを開く（ホットリロードで反映）。

ネイティブライブラリ追加・`app.json` 変更後は再ビルド:

```bash
npx expo run:android --device
```

### 4.3 デバッグ APK を手動 install した場合

`app-debug.apk` だけ install すると **Metro エラー** になる（正常な挙動）。

```bash
# ターミナル 1
npx expo start

# ターミナル 2
adb reverse tcp:8081 tcp:8081
```

その後、実機でアプリを開き直す。

デバッグ APK の場所:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 5. 単体アプリとして使う（リリース APK）

**Metro なし・PC なし**で動かす。

### 5.1 ビルド

```bash
npx expo run:android --device --variant release
```

または:

```bash
cd android
./gradlew app:assembleRelease
```

### 5.2 出力場所

```
android/app/build/outputs/apk/release/app-release.apk
```

（署名設定により `app-release-unsigned.apk` の場合あり）

### 5.3 インストール

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

コードを変更したら **リリース APK の再ビルドが必要**（ホットリロードなし）。

---

## 6. よくあるエラー

### 「Make sure you're running Metro... index.android.bundle...」

- **原因**: デバッグ APK は JS を Metro から取得する
- **対処**: `npx expo start` + `adb reverse tcp:8081 tcp:8081`、または `npx expo run:android --device` を使う
- **単体で動かしたい**: リリース APK をビルド（セクション 5）

### `adb devices` が空

1. `ioreg -p IOUSB -w0 | grep -i pixel` で USB 認識を確認
2. USB デバッグ許可の取り消し → 再接続
3. データ対応ケーブルに変更
4. 無線デバッグを試す

### `system_profiler SPUSBDataType` が空

- macOS の仕様。端末未接続の判断材料に **使わない**
- `ioreg` または `adb devices` を使う

---

## 7. クイックリファレンス

```bash
# 依存関係
npm install

# 実機接続確認
adb devices

# 開発ビルド（おすすめ）
npx expo run:android --device

# 開発中（JS のみ変更）
npx expo start

# デバッグ APK 手動運用時
adb reverse tcp:8081 tcp:8081

# 単体 APK（リリース）
npx expo run:android --device --variant release
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## 参考

- [Expo: Create a debug build locally](https://docs.expo.dev/guides/local-app-development/)
- [Expo: Create a release build locally](https://docs.expo.dev/guides/local-app-production/)
- [Expo: Build APKs](https://docs.expo.dev/build-reference/apk/)
