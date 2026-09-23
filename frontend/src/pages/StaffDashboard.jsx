import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle2, MapPin, Phone, Calendar, ArrowRight, PackageCheck, Warehouse, Navigation, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MapPicker } from '../components/MapPicker';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await api.get('/api/pickups');
      setPickups(res.data);
    } catch (err) {
      console.error('Failed to load staff pickups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (pickupId, newStatus) => {
    try {
      await api.put(`/api/pickups/${pickupId}/status`, { status: newStatus });
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status');
    }
  };

  // Filter tasks
  const pendingCollection = pickups.filter(p => p.status === 'Assigned' || p.status === 'Verified');
  const inTransit = pickups.filter(p => p.status === 'Collected');
  const completedDelivered = pickups.filter(p => ['Delivered', 'Recycled'].includes(p.status));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 60% White Top Banner with 30% Purple Accent & 10% Black Heading */}
      <div className="bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-50 text-purple-700 rounded-full border border-purple-200">
              Field Collection Agent
            </span>
            <span className="text-xs text-slate-500 font-medium">Agent: {user?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Assigned Pickup Routes & Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            View customer pickup addresses, contact phone numbers, navigation coordinates, and trigger status updates when collecting and delivering e-waste.
          </p>
        </div>
      </div>

      {/* Metrics Row: 60% White cards, 10% Black numbers, 30% Colored icon badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{pendingCollection.length}</p>
            <p className="text-xs text-slate-500 font-medium">Scheduled for Pickup</p>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{inTransit.length}</p>
            <p className="text-xs text-slate-500 font-medium">Collected (In Transit)</p>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{completedDelivered.length}</p>
            <p className="text-xs text-slate-500 font-medium">Delivered to Center</p>
          </div>
        </div>
      </div>

      {/* TASKS LIST */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-purple-600" />
          Active Collection Tasks ({pickups.length})
        </h2>

        {loading ? (
          <div className="bg-white p-12 text-center text-slate-500 text-sm border border-slate-200/90 shadow-sm rounded-2xl">
            Loading assigned pickups...
          </div>
        ) : pickups.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-500 text-sm border border-slate-200/90 shadow-sm rounded-2xl">
            No active pickup tasks assigned to your roster currently.
          </div>
        ) : (
          <div className="space-y-6">
            {pickups.map((p) => (
              <div key={p.id} className="bg-white p-6 border border-slate-200/90 shadow-sm rounded-2xl space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-slate-950">{p.item_type}</h3>
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                        Qty: {p.quantity} units
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                        p.status === 'Recycled' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        p.status === 'Delivered' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                        p.status === 'Collected' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        Status: {p.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-700 pt-1">
                      <p><strong className="text-slate-900">Customer:</strong> {p.user_name}</p>
                      <p className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-purple-600" />
                        <strong className="text-slate-900">Phone:</strong> {p.user_phone || p.user_email}
                      </p>
                      <p className="flex items-center gap-1 sm:col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-purple-600" />
                        <strong className="text-slate-900">Address:</strong> {p.address}
                      </p>
                    </div>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {(p.status === 'Assigned' || p.status === 'Verified') && (
                      <button
                        onClick={() => handleUpdateStatus(p.id, 'Collected')}
                        className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>Mark Collected (Picked Up)</span>
                      </button>
                    )}

                    {p.status === 'Collected' && (
                      <button
                        onClick={() => handleUpdateStatus(p.id, 'Delivered')}
                        className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                      >
                        <Warehouse className="w-4 h-4" />
                        <span>Mark Delivered to Center</span>
                      </button>
                    )}

                    {p.status === 'Delivered' && (
                      <div className="px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Delivered to Plant</span>
                      </div>
                    )}

                    {p.status === 'Recycled' && (
                      <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed & Recycled</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Geo Location Route Map */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700">Navigation Location Pin</p>
                  <MapPicker location={p.geo_location} interactive={false} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
