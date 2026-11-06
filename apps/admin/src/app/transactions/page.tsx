import React from 'react';
import { IndianRupee, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';

export default function TransactionsPage() {
  const transactions = [
    {
      id: 'TXN-9948',
      bookingId: 'PQ-2026-9948',
      gatewayId: 'pay_Nzk92398402',
      grossAmount: '₹60.00',
      ownerPayout: '₹48.00 (80%)',
      mediatorCut: '₹3.00 (5%)',
      platformNet: '₹9.00 (15%)',
      status: 'Settled to Escrow',
      date: 'Today, 12:45 PM',
    },
    {
      id: 'TXN-9947',
      bookingId: 'PQ-2026-9947',
      gatewayId: 'pay_Nzk92398401',
      grossAmount: '₹40.00',
      ownerPayout: '₹32.00 (80%)',
      mediatorCut: '₹2.00 (5%)',
      platformNet: '₹6.00 (15%)',
      status: 'Settled to Escrow',
      date: 'Today, 11:30 AM',
    },
    {
      id: 'TXN-9946',
      bookingId: 'PQ-2026-9946',
      gatewayId: 'pay_Nzk92398400',
      grossAmount: '₹80.00',
      ownerPayout: '₹64.00 (80%)',
      mediatorCut: '₹4.00 (5%)',
      platformNet: '₹12.00 (15%)',
      status: 'Settled to Escrow',
      date: 'Today, 10:15 AM',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Financial Clearing & Commission Ledger</h1>
        <p className="text-sm text-gray-500 mt-1">
          Automated Razorpay Route splits. 15% Platform GMV retained, 5% recurring Mediator attribution, and 80% direct Parking Owner settlement.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Transaction / Razorpay ID</th>
              <th className="px-6 py-4">Gross GMV</th>
              <th className="px-6 py-4">Owner Payout (80%)</th>
              <th className="px-6 py-4">Mediator Cut (5%)</th>
              <th className="px-6 py-4">Platform Net (15%)</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{t.id}</div>
                  <div className="text-xs text-gray-400">{t.gatewayId}</div>
                </td>
                <td className="px-6 py-4 font-extrabold text-gray-900">{t.grossAmount}</td>
                <td className="px-6 py-4 font-semibold text-emerald-700">{t.ownerPayout}</td>
                <td className="px-6 py-4 font-semibold text-amber-700">{t.mediatorCut}</td>
                <td className="px-6 py-4 font-semibold text-blue-700">{t.platformNet}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <CheckCircle className="h-3.5 w-3.5" /> {t.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
