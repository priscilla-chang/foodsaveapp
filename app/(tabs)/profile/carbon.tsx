import { Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePoints } from '../../../contexts/PointsContext';

export default function MyCarbonScreen() {
  const router = useRouter();
  const { carbonEmission, loading } = usePoints();

  if (loading) return <Text style={{ padding: 20 }}>讀取中...</Text>;

  return (
    <>
      <Stack.Screen
        options={{
          title: '查看碳足跡',
          headerLeft: () => (
            <Pressable onPress={() => router.replace('/profile')}>
              <Text style={{ fontSize: 25, color: '#2D5B50', paddingHorizontal: 16 }}>
                ←
              </Text>
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* 頂部卡片 */}
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>查看碳足跡</Text>
            <Text style={styles.headerValue}>{carbonEmission?.toFixed(2) || '0.00'} kg CO₂e</Text>
            <Text style={styles.headerSubtitle}>今日減少碳排放</Text>
          </View>

          {/* 趨勢圖 placeholder */}
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>我的碳足跡趨勢圖</Text>
          </View>

          {/* 環保小知識連結 */}
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => router.push('../profile/environmental-tip')}
          >
            <Text style={styles.linkText}>查看環保小知識</Text>
          </TouchableOpacity>

          {/* 累積數據與歷史記錄 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>累積減少碳排放</Text>
            <Text style={styles.cardValue}>{(carbonEmission ? carbonEmission * 5 : 0).toFixed(2)} kg CO₂e</Text>
            <Text style={styles.cardSubtitle}>已連續記錄 5 天！</Text>
            <Pressable
              style={{ marginTop: 10, backgroundColor: '#FFA500', borderRadius: 8, padding: 6, alignItems: 'center' }}
              onPress={() => router.push('../profile/carbon-history')}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>碳排放記錄</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF9F3' },
  content: { padding: 20 },
  headerCard: {
    backgroundColor: '#2D5B50',
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerValue: { color: '#FFD700', fontSize: 36, fontWeight: 'bold' },
  headerSubtitle: { color: '#fff', fontSize: 12 },
  chartPlaceholder: {
    height: 160,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  chartText: { color: '#999' },
  linkCard: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  linkText: { fontWeight: '500', color: '#8a6d3b' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#2D5B50', marginBottom: 8 },
  cardValue: { fontSize: 28, fontWeight: 'bold', color: '#388e3c' },
  cardSubtitle: { fontSize: 12, color: '#666' },
});