import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { useGoals } from './GoalContext';

export default function GoalScreen() {
  const [goalText, setGoalText] = useState('');
  const { addGoal } = useGoals();

  const handleSubmit = () => {
    if (!goalText.trim()) return;

    addGoal(goalText.trim());
    setGoalText('');
    Alert.alert('小虎收到你的目標！');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>設定你的今日目標</Text>
      <TextInput
        style={styles.input}
        placeholder="例如：這週吃飯花費不超過800元"
        value={goalText}
        onChangeText={setGoalText}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>提交目標</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f2e5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0A6859',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00ad8f',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 100,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
