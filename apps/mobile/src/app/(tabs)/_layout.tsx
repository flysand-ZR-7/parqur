import { Tabs } from 'expo-router';
import { useAuthStore } from '../../lib/authStore';
import { MapPin, QrCode, User, PlusCircle, Award } from 'lucide-react-native';

export default function TabLayout() {
  const currentRole = useAuthStore((s) => s.currentRole);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0F5132',
        tabBarInactiveTintColor: '#6C757D',
        headerStyle: { backgroundColor: '#0F5132' },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: currentRole === 'driver' ? 'Find Parking' : currentRole === 'owner' ? 'My Slots' : 'My Territory',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: currentRole === 'driver' ? 'My Passes' : currentRole === 'owner' ? 'Scanner' : 'Onboard Lead',
          tabBarIcon: ({ color, size }) => currentRole === 'owner' ? <QrCode color={color} size={size} /> : currentRole === 'mediator' ? <PlusCircle color={color} size={size} /> : <QrCode color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: currentRole === 'mediator' ? 'Earnings' : 'Trust Profile',
          tabBarIcon: ({ color, size }) => currentRole === 'mediator' ? <Award color={color} size={size} /> : <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
