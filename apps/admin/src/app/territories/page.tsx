import React from 'react';
import { Map, Users, ShieldAlert, Award } from 'lucide-react';

export default function TerritoriesPage() {
  const territories = [
    {
      id: 'TER-01',
      name: 'Mithapur & Urban Estate Phase 2',
      city: 'Jalandhar',
      mediator: 'Harpreet Singh (Active)',
      spacesAcquired: 18,
      driversOnboarded: 240,
      monthlyGmv: '₹72,000',
      commissionPaid: '₹3,600 (5%)',
      status: 'Exclusive Protection Active',
    },
    {
      id: 'TER-02',
      name: 'Model Town Commercial Spine',
      city: 'Jalandhar',
      mediator: 'Simran Kaur (Active)',
      spacesAcquired: 32,
      driversOnboarded: 410,
      monthlyGmv: '₹1,24,000',
      commissionPaid: '₹6,200 (5%)',
      status: 'Exclusive Protection Active',
    },
    {
      id: 'TER-03',
      name: 'Civil Lines & DC Office Zone',
      city: 'Jalandhar',
      mediator: 'Unassigned (Application in Review)',
      spacesAcquired: 4,
      driversOnboarded: 12,
      monthlyGmv: '₹12,000',
      commissionPaid: '₹0',
      status: 'Open for Mediator Bidding',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Territory & Mediator Engine</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage geographic geofenced zones (PostGIS polygons), mediator lead protection, and growth mission targets.
          </p>
        </div>
        <button className="bg-[#0F5132] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-800 transition">
          + Create New Polygon Geofence
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {territories.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                  {t.id}
                </span>
                <span className="text-xs font-semibold text-gray-500">{t.city}</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900">{t.name}</h3>
              <p className="text-xs text-gray-600 mt-1 font-medium">Assigned to: {t.mediator}</p>

              <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">Spaces</span>
                  <span className="text-lg font-black text-gray-800">{t.spacesAcquired}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">Drivers</span>
                  <span className="text-lg font-black text-gray-800">{t.driversOnboarded}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">30D GMV</span>
                  <span className="text-base font-extrabold text-emerald-900">{t.monthlyGmv}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-semibold block">Commission</span>
                  <span className="text-base font-extrabold text-amber-700">{t.commissionPaid}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700">{t.status}</span>
              <button className="text-xs font-bold text-gray-700 hover:text-black">
                Edit Geofence →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
