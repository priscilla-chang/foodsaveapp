// app/(tabs)/communication/chat.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function ChatScreen() {
  const [chatMessages, setChatMessages] = useState<{ id: string; text: string; sender: 'user' | 'tiger' }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setChatMessages([
      {
        id: 'greeting',
        text: '您好！請問要問什麼？',
        sender: 'tiger',
      },
    ]);
  }, []);

  const handleSendChat = () => {
    if (chatInput.trim() === '') return;

    const userMessage = { id: Date.now().toString(), text: chatInput, sender: 'user' as const };
    setChatMessages(prev => [userMessage, ...prev]);
    setChatInput('');

    setTimeout(() => {
      const tigerReply = {
        id: (Date.now() + 1).toString(),
        text: '小虎收到你的訊息了喔！',
        sender: 'tiger' as const,
      };
      setChatMessages(prev => [tigerReply, ...prev]);
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <FlatList
        ref={flatListRef}
        data={chatMessages}
        renderItem={({ item }) => (
          <View style={[
            styles.messageRow,
            item.sender === 'user' ? styles.messageRowUser : styles.messageRowTiger
          ]}>
            {item.sender === 'tiger' && (
              <Image source={require('../../../assets/images/tiger-avatar.png')} style={styles.avatarSmall} />
            )}
            <View style={[
              styles.chatBubble,
              item.sender === 'user' ? styles.userBubble : styles.tigerBubble
            ]}>
              <Text style={[
                styles.chatText,
                item.sender === 'user' ? styles.userText : styles.tigerText
              ]}>
                {item.text}
              </Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.chatList}
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.chatInput}
          placeholder="請輸入內容..."
          placeholderTextColor="#999"
          value={chatInput}
          onChangeText={setChatInput}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendChat}>
          <Text style={styles.sendButtonText}>送出</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8f2e5' },
  chatList: { paddingHorizontal: screenWidth * 0.05, paddingTop: 10, paddingBottom: 10 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowTiger: { justifyContent: 'flex-start' },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  chatBubble: { maxWidth: screenWidth * 0.65, padding: 12, borderRadius: 16 },
  userBubble: { backgroundColor: '#0f6657', marginLeft: 50 },
  tigerBubble: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc' },
  chatText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#fff' },
  tigerText: { color: '#333' },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f2f2f2',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#00ad8f',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
