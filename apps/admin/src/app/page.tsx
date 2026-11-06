import React from 'react';
import { IndianRupee, ShieldAlert, CheckCircle2, Car, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { label: 'Today GMV', value: '₹36,000', change: '+18.2%', icon: IndianRupee },
    { label: 'Platform Net (15%)', value: '₹5,400', change: '+18.2%', icon: TrendingUp },
    { label: 'Mediator Payouts (5%)', value: '₹1,800', change: '+12.5%', icon: IndianRupee },
    { label: 'Pending TrustGate Verifications', value: '14', change: '8 require inspection', icon: ShieldAlert },
  ];

  const recentBookings = [
    {
      id: 'PQ-2026-9948',
      driver: 'John Doe',
      vehicle: 'DL 08 AB 1234 (SUV)',
      facility: 'City Center Mall P2',
      tier: 'PREMIUM SECURE',
      amount: '₹60',
      status: 'Active Pass',
    },
    {
      id: 'PQ-2026-9947',
      driver: 'Amanpreet Singh',
      vehicle: 'PB 08 BX 8801 (Sedan)',
      facility: 'Green Valley Society Bay 4',
      tier: 'SECURE',
      amount: '₹40',
      status: 'Completed',
    },
    {
      id: 'PQ-2026-9946',
      driver: 'Pooja Verma',
      vehicle: 'HR 26 CY 9900 (EV)',
      facility: 'Model Town Commercial B1',
      tier: 'PREMIUM SECURE',
      amount: '₹80',
      status: 'Completed',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Marketplace Operations Cockpit</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time status of bookings, field mediators, and TrustGate verifications.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</span>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-gray-900">{s.value}</span>
                <p className="text-xs text-emerald-700 font-semibold mt-1">{s.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Bookings Feed */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Live Booking Transactions</h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
            Live PostGIS Geo-Tracking Active
          </span>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Booking ID</th>
              <th className="px-6 py-4">Driver & Vehicle</th>
              <th className="px-6 py-4">Parking Facility</th>
              <th className="px-6 py-4">Trust Tier</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentBookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-bold text-gray-900">{b.id}</td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-800">{b.driver}</div>
                  <div className="text-xs text-gray-500">{b.vehicle}</div>
                </td>
                <td className="px-6 py-4 text-gray-700">{b.facility}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded ${
                    b.tier === 'PREMIUM SECURE' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {b.tier}
                  </span>
                </td>
                <td className="px-6 py-4 font-extrabold text-emerald-900">{b.amount}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
