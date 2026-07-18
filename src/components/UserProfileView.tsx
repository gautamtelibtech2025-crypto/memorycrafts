import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Globe, MapPin, Building, Lock, Check, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { saveUserProfile } from '../lib/firebase';

interface UserProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function UserProfileView({ user, onUpdateUser, showToast }: UserProfileViewProps) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [country, setCountry] = useState(user.country || '');
  const [state, setState] = useState(user.state || '');
  const [city, setCity] = useState(user.city || '');
  
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize when user prop changes (e.g. on mount/update)
  useEffect(() => {
    setDisplayName(user.displayName || '');
    setPhoneNumber(user.phoneNumber || '');
    setCountry(user.country || '');
    setState(user.state || '');
    setCity(user.city || '');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showToast('Full Name is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const updatedProfile: UserProfile = {
        ...user,
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        country: country.trim(),
        state: state.trim(),
        city: city.trim(),
      };
      
      await saveUserProfile(updatedProfile);
      onUpdateUser(updatedProfile);
      showToast('Profile updated successfully.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to save profile modifications.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white min-h-screen text-left">
      {/* Editorial Header */}
      <section className="py-20 border-b border-[#EAEAEA] bg-[#FAFAFA] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full border border-[#EAEAEA]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <img
              src={user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'}
              alt={user.displayName || 'Patron'}
              referrerPolicy="no-referrer"
              className="w-24 h-24 rounded-full object-cover border border-[#EAEAEA] shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#2563EB] text-white p-1.5 rounded-full border-2 border-white shadow-xs">
              <Check className="w-3.5 h-3.5" />
            </div>
          </div>
          
          <div className="text-center md:text-left space-y-2">
            <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-semibold block">
              Bespoke Identity Vault
            </span>
            <h1 className="font-sans text-3xl md:text-4xl tracking-tight text-[#111111] font-semibold">
              {user.displayName || 'Bespoke Patron'}
            </h1>
            <p className="text-xs text-[#666666] font-light font-mono">
              Member since: {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Profile Form Details */}
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#EAEAEA] p-6 sm:p-10 shadow-xs">
          <div className="mb-8 border-b border-[#EAEAEA] pb-4">
            <h3 className="font-sans font-semibold text-lg text-[#111111]">Account Coordinates</h3>
            <p className="text-xs text-[#666666] font-light mt-1">
              Verify and update your digital ledger details. These fields guide customized keepsake templates and digital deliveries.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name (Editable) */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    disabled={isSaving}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-full text-xs text-[#111111] placeholder-[#A1A1A1] focus:outline-hidden focus:border-[#2563EB] focus:bg-white transition-all font-sans disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Email (Non-Editable) */}
              <div className="space-y-1.5 text-left opacity-80">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    Email Address
                  </label>
                  <span className="flex items-center space-x-1 text-[9px] font-mono text-neutral-400 uppercase">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Locked</span>
                  </span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="email"
                    disabled
                    value={user.email || ''}
                    className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA]/80 rounded-full text-xs text-[#666666] cursor-not-allowed font-sans select-none"
                  />
                </div>
              </div>

              {/* Phone Number (Editable) */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="tel"
                    disabled={isSaving}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-full text-xs text-[#111111] placeholder-[#A1A1A1] focus:outline-hidden focus:border-[#2563EB] focus:bg-white transition-all font-sans disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Country (Editable) */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  Country
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    disabled={isSaving}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United States"
                    className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-full text-xs text-[#111111] placeholder-[#A1A1A1] focus:outline-hidden focus:border-[#2563EB] focus:bg-white transition-all font-sans disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* State (Editable) */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  State / Province
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    disabled={isSaving}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. New York"
                    className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-full text-xs text-[#111111] placeholder-[#A1A1A1] focus:outline-hidden focus:border-[#2563EB] focus:bg-white transition-all font-sans disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* City (Editable) */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  City
                </label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    disabled={isSaving}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Manhattan"
                    className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-full text-xs text-[#111111] placeholder-[#A1A1A1] focus:outline-hidden focus:border-[#2563EB] focus:bg-white transition-all font-sans disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

            </div>

            <div className="border-t border-[#EAEAEA] pt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#2563EB] text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-8 rounded-full hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50 min-w-[160px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
