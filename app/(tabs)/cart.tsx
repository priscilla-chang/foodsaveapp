import { StyleSheet, Text, View } from 'react-native';

// 這是購物車頁面，對應 app/(tabs)/cart.tsx
export default function CartScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>購物車頁面</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f2e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});
