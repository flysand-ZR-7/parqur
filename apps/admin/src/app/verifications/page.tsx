import React from 'react';
import { CheckCircle, XCircle, Eye, ShieldCheck } from 'lucide-react';

export default function VerificationsPage() {
  const pendingQueue = [
    {
      id: 'VER-001',
      type: 'Parking Space (Commercial)',
      applicant: 'Mithapur Heights Complex',
      city: 'Jalandhar',
      docs: ['Deed Registration', 'Property Tax Receipt', 'CCTV Map'],
      proposedTier: 'PREMIUM SECURE',
      inspector: 'Inspector #104 (Completed Physical Check)',
    },
    {
      id: 'VER-002',
      type: 'Mediator Application',
      applicant: 'Rajinder Kumar',
      city: 'Jalandhar (Zone B)',
      docs: ['PAN Card', 'Video Introduction (Uploaded)', 'GPS Locality Check'],
      proposedTier: 'Field Partner',
      inspector: 'AI Face Liveness Passed',
    },
    {
      id: 'VER-003',
      type: 'Luxury Vehicle Protection',
      applicant: 'BMW X5 (PB 08 DE 0001)',
      city: 'Jalandhar',
      docs: ['RC Smart Card', 'Comprehensive Insurance Policy'],
      proposedTier: 'High-Value Verified',
      inspector: 'VAHAN Database Match',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">TrustGate™ Verification Queue</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review legal property documents, physical inspection checklists, and KYC submissions before granting bookable status.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-800" />
            <h2 className="text-lg font-bold text-gray-900">Pending Approval Items (3)</h2>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {pendingQueue.map((item) => (
            <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-gray-900">{item.applicant}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {item.type}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    {item.proposedTier}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Location: {item.city} • Verification Check: {item.inspector}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold text-gray-400">Attached Proofs:</span>
                  {item.docs.map((d, i) => (
                    <span key={i} className="text-xs text-emerald-700 font-medium underline cursor-pointer">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold transition">
                  <Eye className="h-4 w-4" /> View Docs
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition">
                  <XCircle className="h-4 w-4" /> Reject
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F5132] text-white hover:bg-emerald-800 text-xs font-bold transition">
                  <CheckCircle className="h-4 w-4" /> Approve & Activate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
