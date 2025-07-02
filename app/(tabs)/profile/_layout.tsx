import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerTintColor: '#2D5B50',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerStyle: {
          backgroundColor: '#fff',
        },
      }}
    />
  );
}
