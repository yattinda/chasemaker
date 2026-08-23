# Chase Maker — 今後の改善点

飲み会用アルコールペースメーカー「Chase Maker」の現状整理と、優先度付きの改善候補一覧。

## 現状の整理

Chase Maker は「設定 → セッション → カウントダウン → 通知」というシンプルな流れで、コアロジックは `src/pacing.ts` と `src/usePacemakerSession.ts` に集約されている。

| 領域 | 内容 |
|------|------|
| 設定 | 時間（1〜3時間、0.5時間刻み）、1次会モード ON/OFF |
| ペーシング | 最大杯数 = `floor(時間 × 2.5)`、1次会モードで間隔が変わる（10分→20分→30分） |
| UX | 大きな「酒を注文する」ボタン、背景色で待機状態を示す、長押し3秒で減杯 |
| 通知・振動 | `expo-notifications` + カウントダウン終了時のバイブ |

---

## 改善点（優先度順）

### 1. 酔っていても使える UX（最重要）

アプリの目的に直結する領域。

| 改善 | 理由 |
|------|------|
| **触覚フィードバック** | 注文・カウントダウン終了時に `expo-haptics` を足すと、画面を見なくても分かる |

### 2. セッションの永続化・復帰

`usePacemakerSession` の状態はすべてメモリ上。アプリを落とすと **杯数・カウントダウン・開始時刻が消える**。

- `expo-secure-store` や `AsyncStorage` で `drinks`, `sessionStart`, `endTimestamp` を保存
- フォアグラウンド復帰時に残り時間を再計算
- 通知 ID も一緒に保存し、復帰時に再スケジュール

飲み会中に誤ってアプリを閉じても続けられるのは、実用性に直結する。

### 3. 通知の信頼性

`src/notifications.ts` では Expo Go 上では通知が無効になっている。通知の本番に近いテストには **Development Build / リリース APK** が必要（`docs/android-device-build.md` 参照）。

| 課題 | 対応案 |
|------|--------|
| `app.json` に `expo-notifications` プラグインが未設定 | Android 13+ の POST_NOTIFICATIONS 等のためプラグイン追加 |
| 権限拒否時の UI がない | `requestNotificationPermission` の結果を見て案内を表示 |
| フォアグラウンド通知 | `setNotificationHandler` で「飲んでOK」を表示 |

バックグラウンドでも「次の一杯のタイミング」が届くのは、このアプリの核心機能。

### 4. 画面・ナビゲーション

- 現状は `App.tsx` の `hasStarted` で画面切替。`AGENTS.md` は **Expo Router** を推奨しているが未導入
- 設定画面とセッション画面をルート分離すると、ディープリンク・履歴・将来の画面追加がしやすい
- セッション中に設定を変えられない（開始前のみ）。途中で時間を延長するニーズもあり得る

### 5. デザイン・ブランディング
- `expo-linear-gradient` は依存にあるが未使用 — 待機中の背景（`#2A1A1A`）をグラデーションやアニメーションで強調できる
- Android アイコン背景 `#E6F4FE` はアプリのダークテーマと不一致

### 7. 品質・開発基盤

| 不足 | 影響 |
|------|------|
| **テストなし** | `pacing.ts` の境界（退店直前の1杯、1次会の4杯目以降など）が壊れやすい |
| **`expo lint` 未設定** | `AGENTS.md` の完了条件とズレ |
| **`.tamagui/` の残骸** | Tamagui は `package.json` にない — 混乱の元 |
| **`com.anonymous.chasemaker`** | ストア公開前に要変更 |
| **EAS 設定なし** | `eas.json` なし。クラウドビルド・OTA 更新の準備がこれから |

### 8. ロジック上の細かい改善

`usePacemakerSession` の `decreaseDrink` では杯数を減らしても `sessionStart` はリセットされない。時間制限の計算が実態とずれる可能性がある。

- `canFitInterval` は「今から次の間隔が終了時刻に収まるか」だけ。既に飲んだ杯数との整合チェックは別レイヤ
- セッション終了条件（最大杯数 **または** 時間不足）の説明が UI にない — ユーザーが「なぜもう飲めない？」と困惑しやすい

### 9. アクセシビリティ

- `accessibilityRole="button"` はあるが、`accessibilityLabel` / `accessibilityHint` が不足
- 待機中の背景色変化だけに頼っている — VoiceOver ユーザー向けの状態アナウンスがあるとよい
- フォントサイズは大きめだが、システムの文字サイズ設定（Dynamic Type）への追従は未確認

### 10. 将来機能（任意）

- **飲み会サマリー**: 何杯・何時間・ペース遵守率
- **Apple Watch / ウィジェット**: 残り時間だけ見る
- **共有**: 「23:30 まであと2杯」などを LINE 共有（同伴者への宣言）
- **Keep Awake**: セッション中だけ画面スリープを抑制（`expo-keep-awake`）

---

## 関連ファイル

| ファイル | 役割 |
|----------|------|
| `App.tsx` | 設定画面（時間・1次会モード・START） |
| `pacemaker.tsx` | セッション UI |
| `src/usePacemakerSession.ts` | セッション状態・注文・カウントダウン |
| `src/pacing.ts` | 杯数上限・間隔・ヘッダーメッセージ |
| `src/notifications.ts` | ローカル通知 |
| `docs/android-device-build.md` | Android 実機ビルド・通知テスト手順 |
