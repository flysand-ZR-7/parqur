import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuthStore } from '../../lib/authStore';
import { Camera, CheckCircle2, UserPlus, Share2 } from 'lucide-react-native';

export default function ActivityScreen() {
  const currentRole = useAuthStore((s) => s.currentRole);

  return (
    <View style={styles.container}>
      {currentRole === 'driver' && (
        <View style={styles.passCard}>
          <Text style={styles.passHeader}>ACTIVE ENTRY PASS</Text>
          <Text style={styles.passBookingCode}>PQ-2026-9948</Text>

          <View style={styles.qrWrapper}>
            <QRCode value="PARQUR://ENTRY/PQ-2026-9948" size={180} />
          </View>

          <View style={styles.passDetails}>
            <Text style={styles.detailText}>Vehicle: <Text style={styles.bold}>DL 08 AB 1234 (SUV)</Text></Text>
            <Text style={styles.detailText}>Slot: <Text style={styles.bold}>City Center Mall - Bay B12</Text></Text>
            <Text style={styles.detailText}>Valid Until: <Text style={styles.bold}>Today, 6:00 PM</Text></Text>
          </View>
        </View>
      )}

      {currentRole === 'owner' && (
        <View style={styles.scannerPrompt}>
          <Camera size={64} color="#0F5132" />
          <Text style={styles.scannerTitle}>Check-in & Out Scanner</Text>
          <Text style={styles.scannerDesc}>
            Point camera at the driver's PARQUR entry pass QR code to record timestamp and verify vehicle registration.
          </Text>
          <TouchableOpacity style={styles.scanBtn}>
            <Text style={styles.scanBtnText}>Open Camera Scanner</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentRole === 'mediator' && (
        <View style={styles.onboardWrapper}>
          <Text style={styles.sectionHeader}>Acquisition Toolkit</Text>
          <TouchableOpacity style={styles.onboardOption}>
            <UserPlus size={24} color="#0F5132" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.optionTitle}>Onboard Commercial Parking Space</Text>
              <Text style={styles.optionDesc}>Capture space capacity, photos and property verification consent</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.onboardOption, { marginTop: 12 }]}>
            <Share2 size={24} color="#0F5132" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.optionTitle}>Share Driver Referral QR</Text>
              <Text style={styles.optionDesc}>Earn recurring commissions from newly acquired drivers</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20, justifyContent: 'center' },
  passCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  passHeader: { fontSize: 13, fontWeight: '800', color: '#0F5132', letterSpacing: 1.5, marginBottom: 4 },
  passBookingCode: { fontSize: 20, fontWeight: '900', color: '#212529', marginBottom: 20 },
  qrWrapper: { padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#DEE2E6', marginBottom: 20 },
  passDetails: { width: '100%', borderTopWidth: 1, borderTopColor: '#F1F3F5', paddingTop: 16, gap: 6 },
  detailText: { fontSize: 13, color: '#495057' },
  bold: { fontWeight: '700', color: '#212529' },
  scannerPrompt: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#E9ECEF' },
  scannerTitle: { fontSize: 18, fontWeight: '800', color: '#212529', marginTop: 16, marginBottom: 8 },
  scannerDesc: { textAlign: 'center', color: '#6C757D', fontSize: 13, lineHeight: 20, marginBottom: 24 },
  scanBtn: { backgroundColor: '#0F5132', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8 },
  scanBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  onboardWrapper: { flex: 1, justifyContent: 'flex-start' },
  sectionHeader: { fontSize: 18, fontWeight: '800', color: '#212529', marginBottom: 16 },
  onboardOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#E9ECEF' },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#212529' },
  optionDesc: { fontSize: 12, color: '#6C757D', marginTop: 2, maxWidth: 240 },
});
