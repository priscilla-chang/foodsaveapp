import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useGoals } from './GoalContext';

export default function CompletedGoalsScreen() {
  const { goals } = useGoals();
  const completedGoals = goals.filter(goal => goal.completed);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>已完成的目標</Text>

      <FlatList
        data={completedGoals}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.goalItem}>
            <Text style={styles.goalText}>{item.text}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>目前沒有已完成的目標</Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goalText: {
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'line-through',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
});
