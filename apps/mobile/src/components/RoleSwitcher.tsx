import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { UserRole } from '@parqur/shared';
import { useAuthStore } from '../lib/authStore';

export const RoleSwitcher: React.FC = () => {
  const { currentRole, setRole } = useAuthStore();

  const roles: { id: UserRole; label: string }[] = [
    { id: 'driver', label: '🚗 Driver' },
    { id: 'owner', label: '🅿️ Owner' },
    { id: 'mediator', label: '🤝 Mediator' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simulate Marketplace Role:</Text>
      <View style={styles.buttonRow}>
        {roles.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.button, currentRole === item.id && styles.activeButton]}
            onPress={() => setRole(item.id)}
          >
            <Text style={[styles.buttonText, currentRole === item.id && styles.activeButtonText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C757D',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CED4DA',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#0F5132',
    borderColor: '#0F5132',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
});
