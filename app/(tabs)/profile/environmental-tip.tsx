// app/(tabs)/profile/environmental-tip.tsx
import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type VideoItem = {
  id: string;
  title: string;
  icon: string;
  color: string;
  url: string;
  duration: number;
  viewCount: number;
  description: string;
};

export default function EnvironmentalTipScreen() {
  const [error, setError] = useState<string | null>(null);

  // 使用靜態環保教育影片列表
  const environmentalVideos: VideoItem[] = useMemo(() => [
    {
      id: '1',
      title: '減少食物浪費',
      description: '從餐桌做起的環保行動',
      icon: '🍽️',
      color: '#4CAF50',
      url: 'https://youtube.com/results?search_query=reduce+food+waste+environmental',
      duration: 180,
      viewCount: 1500000
    },
    {
      id: '2',
      title: '碳足跡計算',
      description: '了解你的環境影響',
      icon: '👣',
      color: '#2196F3',
      url: 'https://youtube.com/results?search_query=carbon+footprint+calculator',
      duration: 240,
      viewCount: 890000
    },
    {
      id: '3',
      title: '珍惜食物',
      description: '全球飢餓與食物浪費的真相',
      icon: '🌾',
      color: '#FF9800',
      url: 'https://youtube.com/results?search_query=food+waste+global+hunger',
      duration: 300,
      viewCount: 1200000
    },
    {
      id: '4',
      title: '愛護地球',
      description: '日常生活中的環保小貼士',
      icon: '🌍',
      color: '#8BC34A',
      url: 'https://youtube.com/results?search_query=earth+care+environmental+tips',
      duration: 210,
      viewCount: 750000
    },
    {
      id: '5',
      title: '循環經濟',
      description: '重新思考消費模式',
      icon: '♻️',
      color: '#9C27B0',
      url: 'https://youtube.com/results?search_query=circular+economy+sustainability',
      duration: 280,
      viewCount: 650000
    },
    {
      id: '6',
      title: '綠色生活',
      description: '從家庭開始的環保實踐',
      icon: '🏡',
      color: '#4CAF50',
      url: 'https://youtube.com/results?search_query=green+living+sustainable+home',
      duration: 190,
      viewCount: 980000
    },
    {
      id: '7',
      title: '氣候變遷',
      description: '我們能做什麼？',
      icon: '🌡️',
      color: '#F44336',
      url: 'https://youtube.com/results?search_query=climate+change+action',
      duration: 320,
      viewCount: 1800000
    },
    {
      id: '8',
      title: '永續飲食',
      description: '選擇對地球友善的食物',
      icon: '🥬',
      color: '#795548',
      url: 'https://youtube.com/results?search_query=sustainable+food+diet+environment',
      duration: 220,
      viewCount: 560000
    }
  ], []);

  const [randomVideos, setRandomVideos] = useState<VideoItem[]>(() => {
    // 初始隨機顯示 4 個影片
    const shuffled = [...environmentalVideos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  });

  const shuffleVideos = () => {
    const shuffled = [...environmentalVideos].sort(() => 0.5 - Math.random());
    setRandomVideos(shuffled.slice(0, 4));
    setError(null);
  };

  const handleVideoPress = async (item: VideoItem) => {
    try {
      const canOpen = await Linking.canOpenURL(item.url);
      if (canOpen) {
        await Linking.openURL(item.url);
      } else {
        // 如果無法直接打開，顯示選項
        Alert.alert(
          '選擇操作',
          `想要搜尋關於「${item.title}」的環保影片嗎？`,
          [
            { text: '取消', style: 'cancel' },
            {
              text: '在 YouTube 搜尋',
              onPress: () => {
                const searchUrl = `https://m.youtube.com/results?search_query=${encodeURIComponent(item.title + ' 環保 教育')}`;
                Linking.openURL(searchUrl).catch(() => {
                  setError('無法打開 YouTube，請確認已安裝相關應用');
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('無法打開連結:', error);
      Alert.alert(
        '提示',
        '無法自動打開連結，您可以手動在 YouTube 搜尋相關環保教育內容',
        [{ text: '確定' }]
      );
    }
  };

  const renderItem = ({ item }: { item: VideoItem }) => (
    <TouchableOpacity style={[styles.button, { borderLeftColor: item.color }]} onPress={() => handleVideoPress(item)}>
      <View style={styles.contentContainer}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Text style={styles.icon}>{item.icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.buttonText}>{item.title}</Text>
          <Text style={styles.descriptionText}>{item.description}</Text>
          <View style={styles.videoInfo}>
            <Text style={styles.viewCount}>
              👥 {(item.viewCount / 10000).toFixed(0)}萬觀看
            </Text>
            <Text style={styles.duration}>
              ⏱️ {Math.floor(item.duration / 60)}分{item.duration % 60}秒
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ title: '環保小知識' }} />
      <View style={styles.container}>
        <Text style={styles.title}>探索環保教育影片</Text>
        <Text style={styles.description}>
          以下是精選的環保教育影片，點擊即可前往 YouTube 搜尋相關內容！
        </Text>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <FlatList
          data={randomVideos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
        
        <TouchableOpacity style={styles.refreshButton} onPress={shuffleVideos}>
          <Text style={styles.refreshText}>🔄 隨機推薦新影片</Text>
        </TouchableOpacity>
        
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            💡 提示：點擊任何主題即可搜尋相關環保教育內容
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FDF9F3'
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D5B50',
    marginBottom: 10,
    textAlign: 'center'
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22
  },
  list: {
    paddingBottom: 20,
    flexGrow: 1
  },
  button: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  buttonText: {
    color: '#2D5B50',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  descriptionText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
  },
  videoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewCount: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500'
  },
  duration: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500'
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 14,
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8
  },
  refreshButton: {
    backgroundColor: '#2D5B50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  refreshText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  noteContainer: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50'
  },
  noteText: {
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center',
    fontStyle: 'italic'
  },
});