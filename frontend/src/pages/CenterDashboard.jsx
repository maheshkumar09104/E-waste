import React, { useEffect, useState } from 'react';
import { Building2, UserPlus, Truck, Recycle, CheckCircle2, Clock, UserCheck, X, Sparkles, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/axios';

export const CenterDashboard = () => {
  const [pickups, setPickups] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Staff modal state
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [sName, setSName] = useState('');
  const [sPhone, setSPhone] = useState('');
  const [sEmail, setSEmail] = useState('');

  // Assign staff selection map
  const [assignMap, setAssignMap] = useState({});

  const loadData = async () => {
    try {
      const [pickupsRes, staffRes] = await Promise.all([
        api.get('/api/pickups'),
        api.get('/api/staff')
      ]);
      setPickups(pickupsRes.data);
      setStaffList(staffRes.data);
    } catch (err) {
      console.error('Failed to load center data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAssignStaff = async (pickupId) => {
    const staffId = assignMap[pickupId];
    if (!staffId) {
      alert('Please select a collection staff member first.');
      return;
    }
    try {
      await api.put(`/api/pickups/${pickupId}/assign-staff`, { staff_id: staffId });
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to assign staff');
    }
  };

  const handleMarkRecycled = async (pickupId) => {
    try {
      await api.put(`/api/pickups/${pickupId}/status`, { status: 'Recycled' });
      // Trigger confetti celebratory effect!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    // Default to first center if available
    const centersRes = await api.get('/api/centers');
    const defaultCenterId = centersRes.data.length > 0 ? centersRes.data[0].id : 'center_001';

    try {
      await api.post('/api/staff', {
        name: sName,
        center_id: defaultCenterId,
        phone: sPhone,
        email: sEmail,
        availability_status: 'Available'
      });
      setIsStaffModalOpen(false);
      setSName('');
      setSPhone('');
      setSEmail('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add staff member');
    }
  };

  const unassignedPickups = pickups.filter(p => !p.assigned_staff_id && p.status !== 'Recycled');
  const inTransit = pickups.filter(p => ['Assigned', 'Collected'].includes(p.status));
  const readyToRecycle = pickups.filter(p => p.status === 'Delivered');
  const completedRecycles = pickups.filter(p => p.status === 'Recycled');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 60% White Dominant Banner with 30% Teal Accent & 10% Black Heading */}
      <div className="bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-teal-50 text-teal-700 rounded-full border border-teal-200">
              Recycling Center Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Center Management & Recycling Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            Assign collection drivers to incoming pickup requests, inspect delivered e-waste batches, and finalize eco-friendly recycling processing.
          </p>
        </div>

        <button
          onClick={() => setIsStaffModalOpen(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md shadow-slate-900/10 transition flex items-center gap-2 flex-shrink-0"
        >
          <UserPlus className="w-4 h-4 text-emerald-400" />
          Add Collection Staff
        </button>
      </div>

      {/* Metrics Row: 60% White cards, 10% Black numbers, 30% Colored icon badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{unassignedPickups.length}</p>
            <p className="text-xs text-slate-500 font-medium">Needs Staff Assignment</p>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{inTransit.length}</p>
            <p className="text-xs text-slate-500 font-medium">In Transit / Assigned</p>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{readyToRecycle.length}</p>
            <p className="text-xs text-slate-500 font-medium">Delivered (Ready to Recycle)</p>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{completedRecycles.length}</p>
            <p className="text-xs text-slate-500 font-medium">Recycled Completed</p>
          </div>
        </div>
      </div>

      {/* SECTION 1: DELIVERED ITEMS READY TO RECYCLE */}
      {readyToRecycle.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Delivered E-Waste Batches (Action Required: Mark Recycled)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readyToRecycle.map((p) => (
              <div key={p.id} className="bg-white p-5 border border-teal-200 shadow-sm rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-950">{p.item_type}</h3>
                    <p className="text-xs text-slate-500">User: {p.user_name} | Qty: {p.quantity}</p>
                  </div>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-teal-50 text-teal-700 rounded-full border border-teal-200">
                    Delivered to Center
                  </span>
                </div>
                <button
                  onClick={() => handleMarkRecycled(p.id)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Recycle className="w-4 h-4" />
                  Mark Processed & Recycled
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: PICKUPS LIST & STAFF ASSIGNMENT */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
          <Truck className="w-5 h-5 text-teal-600" />
          Assigned Pickup Requests & Driver Allocation
        </h2>

        {pickups.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-500 text-sm border border-slate-200/90 shadow-sm rounded-2xl">
            No pickup requests assigned to this center yet.
          </div>
        ) : (
          <div className="space-y-4">
            {pickups.map((p) => (
              <div key={p.id} className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-950">{p.item_type}</h3>
                    <span className="px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full">
                      Qty: {p.quantity}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${
                      p.status === 'Recycled' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      p.status === 'Delivered' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                      p.status === 'Collected' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">Customer: <strong>{p.user_name}</strong> ({p.user_phone || p.user_email})</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" /> {p.address}
                  </p>
                  {p.assigned_staff_name && (
                    <p className="text-xs text-purple-700 font-bold">
                      Assigned Driver: {p.assigned_staff_name}
                    </p>
                  )}
                </div>

                {/* Staff Selection Dropdown */}
                {p.status !== 'Recycled' && (
                  <div className="flex items-center gap-2">
                    <select
                      value={assignMap[p.id] || p.assigned_staff_id || ''}
                      onChange={(e) => setAssignMap({ ...assignMap, [p.id]: e.target.value })}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-600"
                    >
                      <option value="">-- Select Collection Driver --</option>
                      {staffList.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.availability_status})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleAssignStaff(p.id)}
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md shadow-slate-900/10 transition"
                    >
                      Assign Driver
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: STAFF DIRECTORY */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-purple-600" />
          Collection Staff Roster ({staffList.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {staffList.map((s) => (
            <div key={s.id} className="bg-white p-4 border border-slate-200/90 shadow-sm rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-950 text-sm">{s.name}</p>
                <p className="text-xs text-slate-500">{s.phone}</p>
                <p className="text-[10px] text-slate-400">{s.email}</p>
              </div>
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${
                s.availability_status === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
              }`}>
                {s.availability_status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Staff Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 space-y-4 border border-slate-200 shadow-2xl rounded-2xl relative">
            <button
              onClick={() => setIsStaffModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-950">Add Collection Staff Member</h3>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Staff Full Name</label>
                <input
                  type="text"
                  required
                  value={sName}
                  onChange={(e) => setSName(e.target.value)}
                  placeholder="Alexander Vance"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  required
                  value={sPhone}
                  onChange={(e) => setSPhone(e.target.value)}
                  placeholder="+1 555 901 829"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={sEmail}
                  onChange={(e) => setSEmail(e.target.value)}
                  placeholder="alex.vance@ewaste.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md shadow-slate-900/10"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
