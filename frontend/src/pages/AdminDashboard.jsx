import React, { useEffect, useState } from 'react';
import { ShieldCheck, Building2, Users, CheckCircle, Navigation, Plus, MapPin, Phone, RefreshCw, X, ArrowUpRight } from 'lucide-react';
import api from '../api/axios';
import { MapPicker } from '../components/MapPicker';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('verification'); // verification, centers, users
  const [pickups, setPickups] = useState([]);
  const [centers, setCenters] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Center Modal State
  const [isCenterModalOpen, setIsCenterModalOpen] = useState(false);
  const [cName, setCName] = useState('');
  const [cLocation, setCLocation] = useState('');
  const [cContact, setCContact] = useState('');
  const [cCapacity, setCCapacity] = useState(5000);
  const [cGeo, setCGeo] = useState({ lat: 12.9716, lng: 77.5946 });

  // Manual Assign Modal State
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedCenterId, setSelectedCenterId] = useState('');

  const loadAllData = async () => {
    try {
      const [pickupsRes, centersRes, usersRes] = await Promise.all([
        api.get('/api/pickups'),
        api.get('/api/centers'),
        api.get('/api/users')
      ]);
      setPickups(pickupsRes.data);
      setCenters(centersRes.data);
      setUsersList(usersRes.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyAndAutoAssign = async (pickupId) => {
    try {
      await api.put(`/api/pickups/${pickupId}/verify?auto_assign=true`);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to verify request');
    }
  };

  const handleManualAssign = async (e) => {
    e.preventDefault();
    if (!selectedPickup || !selectedCenterId) return;
    try {
      await api.put(`/api/pickups/${selectedPickup.id}/assign-center`, { center_id: selectedCenterId });
      setSelectedPickup(null);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to assign center');
    }
  };

  const handleCreateCenter = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/centers', {
        name: cName,
        location: cLocation,
        contact: cContact,
        capacity: parseInt(cCapacity, 10),
        geo_location: cGeo
      });
      setIsCenterModalOpen(false);
      setCName('');
      setCLocation('');
      setCContact('');
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create center');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/api/users/${userId}/role`, { role: newRole });
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user role');
    }
  };

  const pendingPickups = pickups.filter(p => p.status === 'Pending' || p.status === 'Verified');
  const totalCompleted = pickups.filter(p => p.status === 'Recycled').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 60% White Top Banner with 30% Color Accents & 10% Black Heading */}
      <div className="bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-700 rounded-full border border-amber-200">
              Admin Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            System Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            Verify pending citizen requests, auto-assign nearest recycling centers via geo-location, monitor plant capacities, and manage system roles.
          </p>
        </div>

        <button
          onClick={loadAllData}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 text-xs font-bold border border-slate-200 transition flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4 text-emerald-600" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Row: 60% White cards, 10% Black numbers, 30% Colored icon badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{pendingPickups.length}</p>
            <p className="text-xs text-slate-500 font-medium">Pending Verification</p>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{centers.length}</p>
            <p className="text-xs text-slate-500 font-medium">Recycling Centers</p>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{totalCompleted}</p>
            <p className="text-xs text-slate-500 font-medium">Items Recycled</p>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{usersList.length}</p>
            <p className="text-xs text-slate-500 font-medium">Registered Users</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'verification'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Verification & Assignment ({pendingPickups.length})
        </button>

        <button
          onClick={() => setActiveTab('centers')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'centers'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Recycling Centers ({centers.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          User Roles ({usersList.length})
        </button>
      </div>

      {/* TAB 1: VERIFICATION QUEUE */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950">Requests Pending Verification</h2>
            <span className="text-xs text-slate-500">Auto-assignment calculates nearest center distance</span>
          </div>

          {pendingPickups.length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-500 text-sm border border-slate-200/90 shadow-sm rounded-2xl">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              All pickup requests verified and assigned!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingPickups.map((p) => (
                <div key={p.id} className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-950">{p.item_type}</h3>
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                        Qty: {p.quantity}
                      </span>
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                        Status: {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">
                      User: <strong>{p.user_name}</strong> ({p.user_email} | {p.user_phone || 'No Phone'})
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Address: {p.address} (GPS: {p.geo_location?.lat?.toFixed(3)}, {p.geo_location?.lng?.toFixed(3)})
                    </p>
                    {p.notes && <p className="text-xs text-slate-500 italic">Notes: "{p.notes}"</p>}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleVerifyAndAutoAssign(p.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Verify & Auto-Assign Nearest
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPickup(p);
                        if (centers.length > 0) setSelectedCenterId(centers[0].id);
                      }}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 rounded-xl transition flex items-center gap-1"
                    >
                      <Building2 className="w-3.5 h-3.5 text-teal-600" />
                      Manual Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECYCLING CENTERS */}
      {activeTab === 'centers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Recycling Centers Directory</h2>
              <p className="text-xs text-slate-500">Manage plant locations, capacities, and collection staff</p>
            </div>

            <button
              onClick={() => setIsCenterModalOpen(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md shadow-slate-900/10 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              Add Recycling Center
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {centers.map((c) => (
              <div key={c.id} className="bg-white p-6 border border-slate-200/90 shadow-sm rounded-2xl space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-slate-950">{c.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      {c.location}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    Capacity: {c.capacity} kg
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs">
                  <div>
                    <p className="text-slate-500 font-medium">Occupancy</p>
                    <p className="text-sm font-bold text-slate-950">{c.current_occupancy} items</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Staff Count</p>
                    <p className="text-sm font-bold text-slate-950">{c.staff_count}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-medium">Contact</p>
                    <p className="text-[11px] font-bold text-slate-800">{c.contact}</p>
                  </div>
                </div>

                <MapPicker location={c.geo_location} interactive={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-950">User Account Roles & Access Control</h2>
          <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="p-4 font-bold">User Name</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Current Role</th>
                  <th className="p-4 font-bold">Modify Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-950">{u.name}</td>
                    <td className="p-4 text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                        u.role === 'Admin' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        u.role === 'Recycling Center' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                        u.role === 'Collection Staff' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                      >
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                        <option value="Recycling Center">Recycling Center</option>
                        <option value="Collection Staff">Collection Staff</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Assign Center Modal */}
      {selectedPickup && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 space-y-4 border border-slate-200 shadow-2xl rounded-2xl relative">
            <button
              onClick={() => setSelectedPickup(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-950">Assign Request to Center</h3>
            <p className="text-xs text-slate-500">Request: {selectedPickup.item_type} ({selectedPickup.address})</p>

            <form onSubmit={handleManualAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Select Recycling Center</label>
                <select
                  value={selectedCenterId}
                  onChange={(e) => setSelectedCenterId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  {centers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.location})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPickup(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md shadow-slate-900/10"
                >
                  Assign Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Recycling Center Modal */}
      {isCenterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white w-full max-w-lg max-h-[90vh] flex flex-col p-6 space-y-4 border border-slate-200 shadow-2xl rounded-2xl relative">
            <button
              onClick={() => setIsCenterModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-950 flex-shrink-0">Add New Recycling Center</h3>

            <form onSubmit={handleCreateCenter} className="overflow-y-auto pr-1.5 space-y-4 flex-1 custom-scrollbar">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Center Name</label>
                <input
                  type="text"
                  required
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  placeholder="EcoRecycle Hub West"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Physical Address / Location</label>
                <input
                  type="text"
                  required
                  value={cLocation}
                  onChange={(e) => setCLocation(e.target.value)}
                  placeholder="12 Clean Tech Highway"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={cContact}
                    onChange={(e) => setCContact(e.target.value)}
                    placeholder="+1 800 555 019"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">Capacity (Kg)</label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={cCapacity}
                    onChange={(e) => setCCapacity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Set Coordinates on Map</label>
                <MapPicker location={cGeo} onLocationSelect={setCGeo} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCenterModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md shadow-slate-900/10"
                >
                  Save Recycling Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
