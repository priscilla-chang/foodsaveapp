import { Stack, useRouter } from 'expo-router';
import { onAuthStateChanged, signOut, updateProfile, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../../firestore/firebase'; // 確保你的 firebase.ts 有 export auth

export default function AccountScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');

  // 監聽登入狀態
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setDisplayName(currentUser?.displayName || '');
    });
    return unsubscribe;
  }, []);

  // 更新暱稱
  const handleSave = async () => {
    if (user) {
      try {
        await updateProfile(user, { displayName });
        Alert.alert('更新成功', '已更新顯示名稱');
        setEditing(false);
      } catch (err) {
        console.error(err);
        Alert.alert('錯誤', '更新暱稱失敗');
      }
    }
  };

  // 登出
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/'); // 回首頁或登入頁
    } catch (err) {
      console.error(err);
      Alert.alert('錯誤', '登出失敗');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: '我的帳戶' }} />

      <View style={styles.container}>
        {/* 頭像 */}
        <Image
          source={{
            uri: user?.photoURL || 'https://i.pravatar.cc/150?img=12',
          }}
          style={styles.avatar}
        />

        {/* 使用者資訊 */}
        {editing ? (
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="輸入暱稱"
          />
        ) : (
          <Text style={styles.name}>{user?.displayName || '未設定名稱'}</Text>
        )}
        <Text style={styles.email}>{user?.email || '未登入'}</Text>

        {/* 操作按鈕 */}
        {editing ? (
          <Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.buttonText}>儲存</Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.button, styles.editButton]} onPress={() => setEditing(true)}>
            <Text style={styles.buttonText}>編輯暱稱</Text>
          </Pressable>
        )}

        <Pressable style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>登出</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDF9F3' },
  container: { flex: 1, alignItems: 'center', padding: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#2D5B50' },
  email: { fontSize: 14, color: '#555', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 12,
    width: '70%',
    textAlign: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    width: '60%',
    alignItems: 'center',
  },
  editButton: { backgroundColor: '#2D5B50' },
  saveButton: { backgroundColor: '#388e3c' },
  logoutButton: { backgroundColor: '#c0392b' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
