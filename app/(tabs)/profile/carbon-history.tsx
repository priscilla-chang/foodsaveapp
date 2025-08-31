import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePoints } from '../../../contexts/PointsContext';

export default function RewardHistoryScreen() {
  const { history } = usePoints();

  return (
    <>
      {/* ✅ Stack 標題與返回鍵自動出現 */}
      <Stack.Screen options={{ title: '碳排放紀錄' }} />

      <SafeAreaView style={{ flex: 1, backgroundColor: '#FDF9F3' }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            暫無碳排放被減少
          </Text>

          {history.length === 0 ? (
            <Text style={{ color: '#999', fontSize:45 }}>尚無紀錄</Text>
          ) : (
            history.map((entry, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: '#fff',
                  padding: 16,
                  borderRadius: 16,
                  marginBottom: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text style={{ color: '#C0392B', fontWeight: 'bold', fontSize: 16 }}>
                  {entry}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
