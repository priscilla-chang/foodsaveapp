import { Stack, useRouter } from 'expo-router';
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
import { usePoints } from '../../../contexts/PointsContext';
import { auth, db } from '../../../firestore/firebase';

// ✅ 外部元件，props 用 readonly
type RulesModalProps = {
  readonly visible: boolean;
  readonly onClose: () => void;
};

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
          <Pressable
            onPress={onClose}
            style={{ alignSelf: 'flex-end', marginTop: 10 }}
          >
            <Text style={{ color: '#2D5B50', fontWeight: 'bold' }}>✕ 關閉</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function RewardCardScreen() {
  const router = useRouter();
  const { points, setPoints, addHistory, checkInToday, loading } = usePoints();
  const [showRules, setShowRules] = useState(false);

  const handleSignIn = async () => {
    const success = await checkInToday();
    if (success) {
      Alert.alert('簽到成功！獲得 1 點');
    } else {
      Alert.alert('你今天已經簽過囉！請明天再來😊');
    }
  };

  const handleRedeem = async (cost: number, reward: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    if (points >= cost) {
      const ref = doc(db, 'users', uid);

      await updateDoc(ref, {
        points: increment(-cost),
        history: arrayUnion(`兌換 ${reward} -${cost} 點`),
      });

      setPoints(points - cost);
      addHistory(`兌換 ${reward} -${cost} 點`);
      Alert.alert(`已兌換：${reward}`);
    } else {
      Alert.alert('點數不足');
    }
  };

  if (loading) return <Text style={{ padding: 20 }}>讀取中...</Text>;

  return (
    <>
      <Stack.Screen
        options={{
          title: '集點卡',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Text style={{ fontSize: 25, color: '#2D5B50', paddingHorizontal: 16 }}>
                ←
              </Text>
            </Pressable>
          ),
        }}
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: '#FDF9F3' }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* 頂部卡片 */}
          <View style={{ backgroundColor: '#2D5B50', borderRadius: 16, padding: 20, position: 'relative' }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>集點卡</Text>
            <Text style={{ color: '#FFD700', fontSize: 36, fontWeight: 'bold' }}>{points} 點</Text>
            <Text style={{ color: '#fff', fontSize: 12 }}>200 點將於 2025/12/31 到期</Text>

            <Pressable
              onPress={() => router.push({ pathname: '/profile/reward-history' })}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                backgroundColor: '#FFA500',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>點數紀錄</Text>
            </Pressable>

            <TouchableOpacity
              onPress={() => setShowRules(true)}
              style={{
                position: 'absolute',
                top: 70,
                right: 16,
                backgroundColor: '#fff',
                borderRadius: 50,
                width: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#2D5B50', fontWeight: 'bold' }}>?</Text>
            </TouchableOpacity>
          </View>

          {/* 每日簽到 */}
          <View style={{ marginTop: 20, backgroundColor: '#fff', padding: 16, borderRadius: 16 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>每日簽到</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              {['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Today', 'Day 6', 'Day 7'].map(day => (
                <View key={day} style={{ alignItems: 'center' }}>
                  <View style={{
                    width: 30, height: 30, borderRadius: 15,
                    backgroundColor: '#FFD700', marginBottom: 4
                  }} />
                  <Text style={{ fontSize: 10 }}>{day}</Text>
                </View>
              ))}
            </View>
            <Pressable
              onPress={handleSignIn}
              style={{
                backgroundColor: '#2D5B50',
                borderRadius: 10,
                paddingVertical: 10,
                alignItems: 'center',
                marginTop: 8
              }}
            >
              <Text style={{ color: 'white' }}>立即簽到</Text>
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

        {/* 外部 Modal 組件 */}
        <RulesModal visible={showRules} onClose={() => setShowRules(false)} />
      </SafeAreaView>
    </>
  );
}
