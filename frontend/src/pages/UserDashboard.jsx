import React, { useEffect, useState } from 'react';
import { Plus, Recycle, Clock, CheckCircle2, Leaf, MapPin, Calendar, Trash2, Camera, Info, X } from 'lucide-react';
import api from '../api/axios';
import { StatusStepper } from '../components/StatusStepper';
import { MapPicker } from '../components/MapPicker';
import { useAuth } from '../context/AuthContext';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [itemType, setItemType] = useState('Laptops & Electronics');
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState(user?.address || '124 Green Tech Street');
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [geoLocation, setGeoLocation] = useState({ lat: 12.9716, lng: 77.5946 });
  const [photoUrl, setPhotoUrl] = useState('');
  const [notes, setNotes] = useState('');

  const fetchPickups = async () => {
    try {
      const res = await api.get('/api/pickups');
      setPickups(res.data);
    } catch (err) {
      console.error('Failed to fetch pickups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
    const interval = setInterval(fetchPickups, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCreatePickup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/api/pickups', {
        item_type: itemType,
        quantity: parseInt(quantity, 10),
        address,
        preferred_date: preferredDate,
        geo_location: geoLocation,
        photo_url: photoUrl,
        notes
      });
      setIsModalOpen(false);
      // Reset form
      setNotes('');
      setPhotoUrl('');
      fetchPickups();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit pickup request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel this pickup request?')) {
      try {
        await api.delete(`/api/pickups/${id}`);
        fetchPickups();
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete request');
      }
    }
  };

  // Metrics
  const totalRequests = pickups.length;
  const inProgress = pickups.filter(p => ['Pending', 'Verified', 'Assigned', 'Collected', 'Delivered'].includes(p.status)).length;
  const recycledCount = pickups.filter(p => p.status === 'Recycled').length;
  const co2SavedKg = recycledCount * 12.5;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 60% White Dominant Top Banner with 30% Eco Emerald Highlights & 10% Black Heading */}
      <div className="bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Citizen Portal
            </span>
            <span className="text-xs text-slate-500 font-medium">Welcome, {user?.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            E-Waste Pickup & Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            Dispose of electronic waste responsibly. Submit pickup requests and follow real-time progress as items travel to certified recycling centers.
          </p>
        </div>

        {/* 10% Black High-Contrast Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-bold shadow-md shadow-slate-900/10 transition flex items-center gap-2 flex-shrink-0"
        >
          <Plus className="w-5 h-5 text-emerald-400" />
          <span>New Pickup Request</span>
        </button>
      </div>

      {/* Metrics Cards: 60% White cards, 10% Black numbers, 30% Color badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6 text-slate-800" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{totalRequests}</p>
            <p className="text-xs text-slate-500 font-medium">Total Requests</p>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{inProgress}</p>
            <p className="text-xs text-slate-500 font-medium">In Progress</p>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{recycledCount}</p>
            <p className="text-xs text-slate-500 font-medium">Fully Recycled</p>
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200/90 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-950">{co2SavedKg} kg</p>
            <p className="text-xs text-slate-500 font-medium">CO₂ Prevented</p>
          </div>
        </div>
      </div>

      {/* Request History Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          My Pickup Requests & Status Timeline
        </h2>

        {loading ? (
          <div className="bg-white p-12 text-center text-slate-500 text-sm border border-slate-200/90 shadow-sm rounded-2xl">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading pickup history...
          </div>
        ) : pickups.length === 0 ? (
          <div className="bg-white p-12 text-center space-y-4 border-dashed border-2 border-slate-200 rounded-2xl">
            <Recycle className="w-12 h-12 text-slate-400 mx-auto" />
            <div>
              <p className="text-slate-800 font-bold">No pickup requests found</p>
              <p className="text-xs text-slate-500 mt-1">Ready to recycle old electronics? Submit your first request above!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {pickups.map((p) => (
              <div key={p.id} className="bg-white p-5 sm:p-6 border border-slate-200/90 shadow-sm rounded-2xl space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-950">{p.item_type}</h3>
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                        Qty: {p.quantity}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {p.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        Preferred: {p.preferred_date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {p.status === 'Pending' && (
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Stepper */}
                <StatusStepper currentStatus={p.status} />

                {/* Additional Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  {p.assigned_center_name && (
                    <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200 flex items-center gap-2 text-slate-700">
                      <Info className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span>Recycling Center: <strong className="text-teal-900">{p.assigned_center_name}</strong></span>
                    </div>
                  )}
                  {p.assigned_staff_name && (
                    <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200 flex items-center gap-2 text-slate-700">
                      <Info className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span>Collection Staff: <strong className="text-purple-900">{p.assigned_staff_name}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Pickup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white w-full max-w-xl max-h-[90vh] flex flex-col p-6 sm:p-8 border border-slate-200 shadow-2xl rounded-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 mb-4 flex-shrink-0 pr-6">
              <h3 className="text-xl font-bold text-slate-950 flex items-center gap-2">
                <Recycle className="w-5 h-5 text-emerald-600" />
                Schedule E-Waste Pickup
              </h3>
              <p className="text-xs text-slate-500">Fill in the details of the electronic waste you want collected.</p>
            </div>

            <form onSubmit={handleCreatePickup} className="overflow-y-auto pr-1.5 space-y-4 flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">E-Waste Category</label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Laptops & Computers">Laptops & Computers</option>
                    <option value="Smartphones & Tablets">Smartphones & Tablets</option>
                    <option value="TVs & CRT Monitors">TVs & Monitors</option>
                    <option value="Lithium Batteries & Power Banks">Lithium Batteries</option>
                    <option value="Home & Kitchen Appliances">Home Appliances</option>
                    <option value="Cables, Chargers & Accessories">Cables & Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">Quantity (Units)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Pickup Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, apartment, city"
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Preferred Pickup Date</label>
                <input
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Map Location Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Pin Location on Map</label>
                <MapPicker location={geoLocation} onLocationSelect={setGeoLocation} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Photo URL (Optional)</label>
                <div className="relative">
                  <Camera className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Special Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Batteries stored in sealed box, call before arriving..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md shadow-slate-900/10 transition flex items-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Pickup Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
