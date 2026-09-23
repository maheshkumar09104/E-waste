import React from 'react';
import { Clock, ShieldCheck, Building2, Truck, Warehouse, Recycle, Check, AlertCircle } from 'lucide-react';

const STAGES = [
  { id: 'Pending', label: 'Pending Verification', icon: Clock, desc: 'Submitted by user' },
  { id: 'Verified', label: 'Verified', icon: ShieldCheck, desc: 'Approved by admin' },
  { id: 'Assigned', label: 'Center Assigned', icon: Building2, desc: 'Assigned to recycling hub' },
  { id: 'Collected', label: 'Collected', icon: Truck, desc: 'Picked up by collection staff' },
  { id: 'Delivered', label: 'Delivered', icon: Warehouse, desc: 'Delivered to center' },
  { id: 'Recycled', label: 'Recycled', icon: Recycle, desc: 'Eco-processed sustainably' }
];

export const StatusStepper = ({ currentStatus }) => {
  if (currentStatus === 'Rejected') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
        <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-600" />
        <div>
          <p className="font-bold text-sm text-red-900">Pickup Request Rejected</p>
          <p className="text-xs text-red-700/80">This pickup request was reviewed and rejected. Contact support for details.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STAGES.findIndex(s => s.id === currentStatus);
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="w-full py-2">
      <div className="relative flex items-center justify-between">
        {/* Background track line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 rounded-full z-0" />
        
        {/* Active progress bar */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-out"
          style={{ width: `${(activeIdx / (STAGES.length - 1)) * 100}%` }}
        />

        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isPassed = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCurrent
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-500/20 scale-110'
                    : isPassed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                }`}
              >
                {isPassed ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="mt-2 text-center max-w-[85px] sm:max-w-[110px]">
                <p
                  className={`text-xs leading-tight ${
                    isCurrent ? 'font-bold text-emerald-700' : isPassed ? 'font-semibold text-slate-800' : 'font-medium text-slate-400'
                  }`}
                >
                  {stage.label}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
