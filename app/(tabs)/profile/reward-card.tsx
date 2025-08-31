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

export default function RewardCardScreen() {
  const router = useRouter();
  const { points, setPoints, addHistory, checkInToday, loading } = usePoints();
  const [showRules, setShowRules] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInMessage, setSignInMessage] = useState('');

  // Calendar logic
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-based index (0-11)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 (Sunday) to 6 (Saturday)

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array(firstDay).fill(null);

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];
const handleSignIn = async () => {
  try {
    const success = await checkInToday();
    setSignInMessage(success ? '今日簽到成功🥰' : '你今天已經簽過囉！請明天再來😭');
    setShowSignInModal(true);
  } catch (err) {
    setSignInMessage('簽到失敗，請稍後重試😭');
    setShowSignInModal(true);
    console.error(err);
  }
};

const handleRedeem = async (cost: number, reward: string) => {
  try {
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
      setSignInMessage('兌換成功🥰');
    } else {
      Alert.alert('點數不足');
      setSignInMessage('點數不足，兌換失敗😭');
    }
    setShowSignInModal(true);
  } catch (err) {
    Alert.alert('兌換失敗');
    console.error(err);
  }
};

  if (loading) return <Text style={{ padding: 20 }}>讀取中...</Text>;

  return (
    <>
      <Stack.Screen
        options={{
          title: '集點卡',
          headerLeft: () => (
            <Pressable onPress={() => router.replace('/profile')}>
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
              onPress={() => router.push('/profile/reward-history')}
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

          {/* 每日簽到 - 日曆版面 */}
          <View style={{ marginTop: 20, backgroundColor: '#fff', padding: 16, borderRadius: 16 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
              {`${year}年 ${monthNames[month]}`}
            </Text>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>每日簽到</Text>
            <View>
              {/* Weekday headers */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
                  <Text key={index} style={{ fontSize: 15, color: '#2D5B50', flex: 1, textAlign: 'center' }}>
                    {day}
                  </Text>
                ))}
              </View>
              {/* Calendar grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {[...emptyDays, ...daysArray].map((day, index) => (
                  <View
                    key={index}
                    style={{
                      width: `${100 / 7}%`,
                      aspectRatio: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 2,
                    }}
                  >
                    {day ? (
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: day === today.getDate() && month === today.getMonth() && year === today.getFullYear() ? '#FFD700' : '#e0e0e0',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 15, color: day === today.getDate() && month === today.getMonth() && year === today.getFullYear() ? '#2D5B50' : '#333' }}>
                          {day}
                        </Text>
                      </View>
                    ) : null}
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
                  marginTop: 16,
                }}
              >
                <Text style={{ color: 'white' }}>立即簽到</Text>
              </Pressable>
            </View>
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

        {/* 點數規範 Modal */}
        <Modal visible={showRules} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '85%' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>點數規範</Text>
              <Text>1. 每日簽到可得 100 點</Text>
              <Text>2. 點數不可轉讓</Text>
              <Text>3. 兌換後無法退回</Text>
              <Text style={{ marginBottom: 10 }}>4. 點數保存期限為一年</Text>
              <Pressable
                onPress={() => setShowRules(false)}
                style={{ alignSelf: 'flex-end', marginTop: 10 }}
              >
                <Text style={{ color: '#2D5B50', fontWeight: 'bold' }}>✕ 關閉</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* 簽到結果 Modal */}
        <Modal visible={showSignInModal} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '85%' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12, color: '#2D5B50' }}>
                集點卡
              </Text>
              <Text style={{ fontSize: 16, marginBottom: 20 }}>{signInMessage}</Text>
              <Pressable
                onPress={() => setShowSignInModal(false)}
                style={{ alignSelf: 'flex-end' }}
              >
                <Text style={{ color: '#2D5B50', fontWeight: 'bold' }}>✕ 關閉</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}