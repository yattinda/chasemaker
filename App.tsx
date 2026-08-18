import React, { useState } from 'react'; // ★ useState を追加
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native'; // ★ Button を追加

export default function App() {
  // ★ カウント状態を定義（初期値は 0）。C++の変数宣言＋画面更新機能のようなものです。
  const [count, setCount] = useState<number>(0);

  // ★ ボタンが押されたときに実行される関数（Pythonのdef、C++のvoid関数に相当）
  const increment = () => {
    setCount(count + 1); // 値を更新すると、画面が自動的に再描画されます
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>カウンターアプリ</Text>
      <Text style={styles.counter}>{count}</Text>
      <Button title="カウントアップ" onPress={increment} />
      <StatusBar style="auto" />
    </View>
  );
}

// スタイル（見た目）の設定
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  counter: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});