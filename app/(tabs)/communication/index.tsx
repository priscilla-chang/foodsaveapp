// app/(tabs)/communication/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';

export default function CommunicationMenuScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require('../../../assets/images/tiger-avatar.png')}
          style={styles.avatar}
          resizeMode="cover"
        />
        <Text style={styles.greeting}>
          Hello{'\n'}我是小虎
        </Text>

        <TouchableOpacity style={styles.rowButton} onPress={() => router.push('./communication/goal')}>
          <Ionicons name="flag-outline" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>設定今日目標</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rowButton} onPress={() => router.push('./communication/chat')}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>問小虎問題</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rowButton} onPress={() => router.push('./communication/goal-list')}>
          <Ionicons name="list-outline" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>查看我的目標</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f2e5',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#f8f2e5',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f6657',
    textAlign: 'center',
    marginBottom: 40,
  },
  rowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ad8f',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 100,
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
