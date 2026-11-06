import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '../../lib/authStore';
import { ShieldAlert, CheckCircle, FileText, IndianRupee, Car } from 'lucide-react-native';

export default function ProfileScreen() {
  const currentRole = useAuthStore((s) => s.currentRole);

  return (
    <ScrollView style={styles.container}>
      {currentRole === 'driver' && (
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <Text style={styles.userName}>John Doe</Text>
            <View style={styles.badge}>
              <CheckCircle size={14} color="#0F5132" />
              <Text style={styles.badgeLabel}>Aadhaar & DL Verified</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Registered Vehicles (Trust Profile)</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Car size={20} color="#0F5132" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.cardTitle}>Mercedes-Benz C-Class</Text>
                <Text style={styles.cardSub}>DL 08 AB 1234 • High-Value Eligible</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.outlineBtn}>
            <Text style={styles.outlineBtnText}>+ Register Another Vehicle</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentRole === 'owner' && (
        <View style={styles.wrapper}>
          <Text style={styles.sectionTitle}>TrustGate Facility Compliance</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Property Ownership Documents</Text>
            <Text style={styles.cardSub}>Status: Approved by TrustGate Admin</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Physical Security Audit</Text>
            <Text style={styles.cardSub}>Status: CCTV & Guard Verified (Level 2 Secure)</Text>
          </View>
        </View>
      )}

      {currentRole === 'mediator' && (
        <View style={styles.wrapper}>
          <Text style={styles.sectionTitle}>Commission & Payout Engine</Text>
          <View style={styles.earningsCard}>
            <IndianRupee size={28} color="#0F5132" />
            <Text style={styles.earningsAmount}>₹54,000</Text>
            <Text style={styles.earningsSub}>Estimated Monthly Recurring (5% GMV)</Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownBox}>
              <Text style={styles.breakdownVal}>₹1,800</Text>
              <Text style={styles.breakdownLbl}>Today's Earnings</Text>
            </View>
            <View style={styles.breakdownBox}>
              <Text style={styles.breakdownVal}>₹14,200</Text>
              <Text style={styles.breakdownLbl}>Pending Payout</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.withdrawBtn}>
            <Text style={styles.withdrawBtnText}>Request Payout to Bank Account</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  wrapper: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#0F5132', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  userName: { fontSize: 20, fontWeight: '800', color: '#212529', marginTop: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 6, marginTop: 6 },
  badgeLabel: { color: '#0F5132', fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#212529', marginBottom: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E9ECEF' },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#212529' },
  cardSub: { fontSize: 12, color: '#6C757D', marginTop: 2 },
  outlineBtn: { borderWidth: 1, borderColor: '#0F5132', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 4 },
  outlineBtnText: { color: '#0F5132', fontWeight: 'bold' },
  earningsCard: { backgroundColor: '#E8F5E9', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  earningsAmount: { fontSize: 36, fontWeight: '900', color: '#0F5132', marginTop: 6 },
  earningsSub: { fontSize: 13, color: '#2E7D32', marginTop: 4 },
  breakdownRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  breakdownBox: { flex: 1, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E9ECEF', alignItems: 'center' },
  breakdownVal: { fontSize: 20, fontWeight: '800', color: '#212529' },
  breakdownLbl: { fontSize: 11, color: '#6C757D', marginTop: 4 },
  withdrawBtn: { backgroundColor: '#0F5132', padding: 14, borderRadius: 8, alignItems: 'center' },
  withdrawBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
});
