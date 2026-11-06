import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { RoleSwitcher } from '../../components/RoleSwitcher';
import { useAuthStore } from '../../lib/authStore';
import { ShieldCheck, Video, MapPin, Zap } from 'lucide-react-native';

export default function HomeScreen() {
  const currentRole = useAuthStore((s) => s.currentRole);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample verified parking spots
  const spots = [
    {
      id: '1',
      title: 'City Center Mall Basement P2',
      address: 'Sector 17, Commercial District',
      rate: '₹30/hr',
      distance: '350m away',
      tier: 'PREMIUM SECURE',
      cctv: true,
      guard: true,
    },
    {
      id: '2',
      title: 'Green Valley Society Gated Bay',
      address: 'Main Avenue, Sector 21',
      rate: '₹20/hr',
      distance: '900m away',
      tier: 'SECURE',
      cctv: true,
      guard: false,
    },
  ];

  return (
    <View style={styles.container}>
      <RoleSwitcher />

      {currentRole === 'driver' && (
        <ScrollView style={styles.content}>
          <View style={styles.searchBox}>
            <TextInput
              style={styles.input}
              placeholder="Where do you want to park?"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Verified Nearby Spots</Text>
          {spots.map((spot) => (
            <View key={spot.id} style={styles.spotCard}>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, spot.tier === 'PREMIUM SECURE' ? styles.premiumBadge : styles.secureBadge]}>
                  <ShieldCheck size={14} color="#FFF" />
                  <Text style={styles.badgeText}>{spot.tier}</Text>
                </View>
                <Text style={styles.distance}>{spot.distance}</Text>
              </View>

              <Text style={styles.spotTitle}>{spot.title}</Text>
              <Text style={styles.spotAddress}>{spot.address}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.rate}>{spot.rate}</Text>
                <TouchableOpacity style={styles.bookBtn}>
                  <Text style={styles.bookBtnText}>Reserve Space</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {currentRole === 'owner' && (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Active Parking Capacity</Text>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>4 / 6</Text>
            <Text style={styles.statsSub}>Bays Currently Occupied</Text>
          </View>
          <TouchableOpacity style={styles.primaryActionButton}>
            <Text style={styles.primaryActionText}>+ Add New Parking Space</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {currentRole === 'mediator' && (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Assigned Territory</Text>
          <View style={styles.territoryCard}>
            <MapPin size={24} color="#0F5132" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.territoryName}>Jalandhar Heights - Zone A</Text>
              <Text style={styles.territoryStatus}>Status: Exclusive Lead Protection Active</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Territory Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>14</Text>
              <Text style={styles.statLbl}>Onboarded Owners</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>88</Text>
              <Text style={styles.statLbl}>Active Drivers</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 16 },
  searchBox: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchBtn: {
    backgroundColor: '#0F5132',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  searchBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#212529', marginBottom: 12 },
  spotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  premiumBadge: { backgroundColor: '#B8860B' },
  secureBadge: { backgroundColor: '#0F5132' },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  distance: { color: '#6C757D', fontSize: 12 },
  spotTitle: { fontSize: 16, fontWeight: '700', color: '#212529', marginBottom: 4 },
  spotAddress: { fontSize: 13, color: '#6C757D', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F3F5', paddingTop: 10 },
  rate: { fontSize: 18, fontWeight: '800', color: '#0F5132' },
  bookBtn: { backgroundColor: '#0F5132', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  bookBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  statsCard: { backgroundColor: '#E8F5E9', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  statsNumber: { fontSize: 32, fontWeight: '900', color: '#0F5132' },
  statsSub: { fontSize: 14, color: '#2E7D32', marginTop: 4 },
  primaryActionButton: { backgroundColor: '#0F5132', padding: 14, borderRadius: 8, alignItems: 'center' },
  primaryActionText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  territoryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E9ECEF' },
  territoryName: { fontSize: 15, fontWeight: '700', color: '#212529' },
  territoryStatus: { fontSize: 12, color: '#28A745', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E9ECEF', alignItems: 'center' },
  statVal: { fontSize: 24, fontWeight: '800', color: '#0F5132' },
  statLbl: { fontSize: 12, color: '#6C757D', marginTop: 4 },
});
