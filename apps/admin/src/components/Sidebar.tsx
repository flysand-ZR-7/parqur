import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Map, 
  CreditCard, 
  Users, 
  BarChart3, 
  Car, 
  AlertTriangle 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#0F5132] text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-emerald-800">
        <div className="flex items-center gap-2">
          <Car className="h-7 w-7 text-emerald-300" />
          <span className="text-2xl font-black tracking-wider">PARQUR</span>
        </div>
        <p className="text-xs text-emerald-200 mt-1 uppercase font-semibold">
          Admin Control Center
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-100 hover:bg-emerald-800 transition font-medium"
        >
          <BarChart3 className="h-5 w-5" />
          Dashboard Overview
        </Link>

        <Link 
          href="/verifications" 
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-100 hover:bg-emerald-800 transition font-medium"
        >
          <ShieldCheck className="h-5 w-5" />
          TrustGate Queue
        </Link>

        <Link 
          href="/territories" 
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-100 hover:bg-emerald-800 transition font-medium"
        >
          <Map className="h-5 w-5" />
          Territories & Mediators
        </Link>

        <Link 
          href="/transactions" 
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-100 hover:bg-emerald-800 transition font-medium"
        >
          <CreditCard className="h-5 w-5" />
          Transactions & Payouts
        </Link>
      </nav>

      <div className="p-4 border-t border-emerald-800">
        <div className="bg-emerald-800/60 p-3 rounded-lg">
          <p className="text-xs font-semibold text-emerald-200">Logged in as SuperAdmin</p>
          <p className="text-xs text-emerald-300 truncate">ops@parqur.internal</p>
        </div>
      </div>
    </aside>
  );
};
