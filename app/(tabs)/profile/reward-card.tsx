import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { arrayUnion, doc, increment, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { auth, db } from '../../../firestore/firebase'; // ← 常見位置：app/firestore/firebase.ts
import { usePoints } from '../../contexts/PointsContext'; // ← 路徑依你的專案結構
// 若你的 firebase 檔在專案根目錄 (./firestore/firebase.ts)，請改成 '../../../firestore/firebase'

type RulesModalProps = { readonly visible: boolean; readonly onClose: () => void; };
function RulesModal({ visible, onClose }: RulesModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '85%' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>點數規範</Text>
          <Text>1. 每日簽到可得 1 點</Text>
          <Text>2. 點數不可轉讓</Text>
          <Text>3. 兌換後無法退回</Text>
          <Text style={{ marginBottom: 10 }}>4. 點數保存期限為一年</Text>
          <Pressable onPress={onClose} style={{ alignSelf: 'flex-end', marginTop: 10 }}>
            <Text style={{ color: '#2D5B50', fontWeight: 'bold' }}>✕ 關閉</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function RewardCardScreen() {
  const router = useRouter();
  const { points, setPoints, addHistory } = usePoints();
  const [showRules, setShowRules] = useState(false);
  const [signing, setSigning] = useState(false);

  const handleSignIn = async () => {
    if (signing) return;
    setSigning(true);
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const key = 'lastSignInDate';
      const last = await AsyncStorage.getItem(key);
      if (last === today) {
        Alert.alert('你今天已經簽過囉！請明天再來😊');
        return;
      }

      // 1) 本地記錄避免重複簽到
      await AsyncStorage.setItem(key, today);

      // 2) 先更新 UI 狀態
      setPoints(points + 1);
      const nowStr = new Date().toLocaleString();
      addHistory(`[${nowStr}] 每日簽到 +1 點`);

      // 3) 若已登入，順便同步到 Firestore
      const uid = auth.currentUser?.uid;
      if (uid) {
        const ref = doc(db, 'users', uid);
        await updateDoc(ref, {
          points: increment(1),
          history: arrayUnion(`[${nowStr}] 每日簽到 +1 點`),
        });
      }

      Alert.alert('簽到成功！獲得 1 點');
    } catch (e) {
      console.warn('sign-in error', e);
      Alert.alert('簽到失敗', '請稍後再試');
    } finally {
      setSigning(false);
    }
  };

  const handleRedeem = async (cost: number, reward: string) => {
    if (points < cost) return Alert.alert('點數不足');

    // 先更新 UI
    setPoints(points - cost);
    addHistory(`兌換 ${reward} -${cost} 點`);

    // 若登入，同步 Firestore
    const uid = auth.currentUser?.uid;
    if (uid) {
      const ref = doc(db, 'users', uid);
      try {
        await updateDoc(ref, {
          points: increment(-cost),
          history: arrayUnion(`兌換 ${reward} -${cost} 點`),
        });
      } catch (e) {
        console.warn('redeem error', e);
      }
    }

    Alert.alert(`已兌換：${reward}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FDF9F3' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* 頂部卡片 */}
        <View style={{ backgroundColor: '#2D5B50', borderRadius: 16, padding: 20, position: 'relative' }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>集點卡</Text>
          <Text style={{ color: '#FFD700', fontSize: 36, fontWeight: 'bold' }}>{points} 點</Text>
          <Text style={{ color: '#fff', fontSize: 12 }}>200 點將於 2025/12/31 到期</Text>

          <Pressable
            onPress={() => router.push('/profile/reward-history')}
            style={{ position: 'absolute', top: 16, right: 16, backgroundColor: '#FFA500', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>點數紀錄</Text>
          </Pressable>

          <TouchableOpacity
            onPress={() => setShowRules(true)}
            style={{ position: 'absolute', top: 70, right: 16, backgroundColor: '#fff', borderRadius: 50, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#2D5B50', fontWeight: 'bold' }}>?</Text>
          </TouchableOpacity>
        </View>

        {/* 每日簽到 */}
        <View style={{ marginTop: 20, backgroundColor: '#fff', padding: 16, borderRadius: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>每日簽到</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            {['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Today', 'Day 6', 'Day 7'].map((day) => (
              <View key={day} style={{ alignItems: 'center' }}>
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFD700', marginBottom: 4 }} />
                <Text style={{ fontSize: 10 }}>{day}</Text>
              </View>
            ))}
          </View>
          <Pressable
            disabled={signing}
            onPress={handleSignIn}
            style={{ backgroundColor: '#2D5B50', opacity: signing ? 0.7 : 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 8 }}
          >
            <Text style={{ color: 'white' }}>{signing ? '處理中…' : '立即簽到'}</Text>
          </Pressable>
        </View>

        {/* 點數兌換 */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>點數兌換</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 12, width: '48%' }}>
              <Text style={{ fontWeight: 'bold' }}>300 點</Text>
              <Text style={{ marginVertical: 4 }}>200 元折價券</Text>
              <Pressable onPress={() => handleRedeem(300, '200元折價券')} style={{ backgroundColor: '#2D5B50', borderRadius: 8, padding: 6, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 12 }}>兌換</Text>
              </Pressable>
            </View>
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 12, width: '48%' }}>
              <Text style={{ fontWeight: 'bold' }}>1000 點</Text>
              <Text style={{ marginVertical: 4 }}>幫助種樹</Text>
              <Pressable onPress={() => handleRedeem(1000, '種下一棵小樹')} style={{ backgroundColor: '#2D5B50', borderRadius: 8, padding: 6, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 12 }}>兌換</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <RulesModal visible={showRules} onClose={() => setShowRules(false)} />
    </SafeAreaView>
  );
}
