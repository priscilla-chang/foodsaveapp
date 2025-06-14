import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGoals } from './GoalContext';

export default function GoalListScreen() {
  const { goals, toggleGoal, clearGoals } = useGoals();

  const incompleteGoals = goals.filter(goal => !goal.completed);

  const handleToggleWithDelay = (index: number) => {
    toggleGoal(index);
    setTimeout(() => {}, 1000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>我的目標清單</Text>

      <FlatList
        data={incompleteGoals}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.goalItem}
            onPress={() => handleToggleWithDelay(goals.indexOf(item))}
          >
            <Ionicons
              name={item.completed ? 'checkbox' : 'square-outline'}
              size={24}
              color={item.completed ? '#0A6859' : '#aaa'}
              style={{ marginRight: 12 }}
            />
            <Text style={[styles.goalText, item.completed && styles.completedText]}>
              {item.text}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>目前沒有未完成的目標！</Text>}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {incompleteGoals.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearGoals}>
          <Text style={styles.clearButtonText}>清除全部目標</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f2e5', padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0A6859',
    marginBottom: 16,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goalText: { fontSize: 16, color: '#333' },
  completedText: { color: '#999', textDecorationLine: 'line-through' },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#999' },
  clearButton: {
    marginTop: 20,
    backgroundColor: '#EA6A47',
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  clearButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
