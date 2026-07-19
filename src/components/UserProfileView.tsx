import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Globe, MapPin, Building, Lock, Check, Loader2, Camera, Trash2, AlertTriangle, X } from 'lucide-react';
import { UserProfile } from '../types';
import { saveUserProfile, auth, uploadProfilePhoto, reauthenticateGoogleUser, reauthenticateEmailUser, deleteUserAccountFirestoreAndAuth, removeProfilePhoto } from '../lib/firebase';

import { API_BASE_URL } from '../lib/api';


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
  const [isUploading, setIsUploading] = useState(false);
  
  // Photo Action Menu States
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [showViewPhotoModal, setShowViewPhotoModal] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemovePhotoSubmit = async () => {
    setShowRemoveConfirm(false);
    setIsUploading(true);
    try {
      const fallbackUrl = await removeProfilePhoto(user.uid);
      const updatedProfile = {
        ...user,
        photoURL: fallbackUrl
      };
      onUpdateUser(updatedProfile);
      showToast('Profile picture removed successfully.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to remove profile picture.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const getUserInitials = () => {
    if (!user.displayName) return 'M';
    const parts = user.displayName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  
  // Account Deletion States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'reauth'>('confirm');
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Synchronize when user prop changes (e.g. on mount/update)
  useEffect(() => {
    setDisplayName(user.displayName || '');
    setPhoneNumber(user.phoneNumber || '');
    setCountry(user.country || '');
    setState(user.state || '');
    setCity(user.city || '');
  }, [user]);

  // Determine if Google provider is used
  useEffect(() => {
    if (auth && auth.currentUser) {
      const google = auth.currentUser.providerData?.some(
        (provider: any) => provider.providerId === 'google.com'
      ) || user.uid.startsWith('mock-google-user');
      setIsGoogleUser(google);
    } else {
      setIsGoogleUser(user.uid.startsWith('mock-google-user'));
    }
  }, [user]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Validate file type (JPG/JPEG, PNG, WebP)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Unsupported file type. Please upload a JPG, PNG, or WebP image.', 'error');
      return;
    }

    // Validate file size (5MB limit)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      showToast('File is too large. Maximum size allowed is 5MB.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadProfilePhoto(user.uid, file);
      const updatedProfile = {
        ...user,
        photoURL: uploadedUrl
      };
      onUpdateUser(updatedProfile);
      showToast('Profile picture updated successfully.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to upload profile picture.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteUserAccountFirestoreAndAuth();
      showToast('Your account was permanently deleted. We are sorry to see you go.', 'success');
      setShowDeleteModal(false);
    } catch (err: any) {
      console.error('Deletion error:', err);
      // Catch requires-recent-login
      if (err.code === 'auth/requires-recent-login' || err.message?.includes('requires-recent-login') || err.message?.includes('recent-login')) {
        setDeleteStep('reauth');
      } else {
        setDeleteError(err.message || 'An error occurred during account deletion.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReauthAndDelete = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsDeleting(true);
    setDeleteError('');
    try {
      if (isGoogleUser) {
        await reauthenticateGoogleUser();
      } else {
        if (!deletePassword) {
          setDeleteError('Password is required for verification.');
          setIsDeleting(false);
          return;
        }
        await reauthenticateEmailUser(deletePassword);
      }
      
      // If re-auth succeeds, proceed with deletion!
      await deleteUserAccountFirestoreAndAuth();
      showToast('Your account was permanently deleted. We are sorry to see you go.', 'success');
      setShowDeleteModal(false);
    } catch (err: any) {
      console.error('Re-authentication deletion error:', err);
      if (err.code === 'auth/wrong-password' || err.message?.includes('wrong-password') || err.message?.includes('invalid-credential')) {
        setDeleteError('Incorrect password. Please verify and try again.');
      } else {
        setDeleteError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsDeleting(false);
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
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp, image/jpg"
              onChange={handlePhotoChange}
              disabled={isUploading}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => setShowPhotoMenu(true)}
              className="relative block group focus:outline-hidden cursor-pointer"
            >
              <div className="relative w-24 h-24 rounded-full overflow-hidden border border-[#EAEAEA] shadow-sm transition-transform duration-300 group-hover:scale-[1.02] flex items-center justify-center bg-stone-50">
                {user.photoURL ? (
                  <img
                    src={
                      user.photoURL.startsWith('/media/')
                        ? `${API_BASE_URL}${user.photoURL}`
                        : user.photoURL
                    }
                    alt={user.displayName || 'Patron'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-100 flex items-center justify-center font-mono font-medium text-neutral-500 text-2xl tracking-wider select-none">
                    {getUserInitials()}
                  </div>
                )}
                
                {/* Upload Spinner overlay */}
                {isUploading ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                ) : (
                  /* Hover Camera icon */
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[8px] uppercase tracking-wider font-semibold font-mono">Edit</span>
                  </div>
                )}
              </div>
              
              {!isUploading && (
                <div className="absolute -bottom-1 -right-1 bg-neutral-950 text-white p-1.5 rounded-full border-2 border-white shadow-xs">
                  <Camera className="w-3 h-3" />
                </div>
              )}
            </button>
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

          {/* Danger Zone */}
          <div className="mt-12 pt-8 border-t border-red-100 bg-red-50/20 rounded-2xl border border-red-100/60 p-6 sm:p-10">
            <div className="mb-6">
              <h3 className="font-sans font-semibold text-base text-red-950 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Bespoke Deletion Chamber</span>
              </h3>
              <p className="text-xs text-red-700/80 font-light mt-1 leading-relaxed">
                Actions in this section are highly dangerous, terminal, and irreversible. Proceeding will dissolve your identity credentials and permanently decouple your custom orders.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1 text-left">
                <h4 className="text-xs font-semibold text-neutral-800 font-sans">Dissolve Ledger Membership</h4>
                <p className="text-[11px] text-[#666666] font-light leading-relaxed">
                  This deletes your authentication profile, clears cache keys, and anonymizes all historic order registers.
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setDeleteStep('confirm');
                  setDeletePassword('');
                  setDeleteError('');
                  setShowDeleteModal(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-6 rounded-full transition-all shadow-xs self-start sm:self-center"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#EAEAEA] max-w-md w-full overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EAEAEA] flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-sans font-semibold text-base text-[#111111]">Dissolve Identity Vault?</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteStep('confirm');
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="text-[#666666] hover:text-[#111111] transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {deleteStep === 'confirm' && (
                <>
                  <div className="text-left space-y-3">
                    <p className="text-xs text-[#666666] font-light leading-relaxed">
                      This action is <strong className="text-red-700 font-semibold">permanent and completely irreversible</strong>. All of your personal identity coordinates, custom uploaded avatars, and digital configurations will be destroyed.
                    </p>
                    <p className="text-xs text-[#666666] font-light leading-relaxed">
                      Your historic payment ledger transactions will be preserved to maintain correct business ledger auditing, but all connection to your name, photo, and email is completely anonymized.
                    </p>
                  </div>
                  {deleteError && (
                    <div className="p-3 bg-red-50 rounded-lg text-xs text-red-700 font-medium text-left">
                      {deleteError}
                    </div>
                  )}
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(false)}
                      className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-[#111111] text-xs font-semibold rounded-full transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full transition-all flex items-center space-x-2 shadow-xs disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <span>Confirm Deletion</span>
                      )}
                    </button>
                  </div>
                </>
              )}

              {deleteStep === 'reauth' && (
                <form onSubmit={handleReauthAndDelete} className="space-y-4 text-left">
                  <p className="text-xs text-[#666666] font-light leading-relaxed">
                    To finalize decommissioning, Firebase requires recent credential validation. Please authenticate below.
                  </p>
                  
                  {isGoogleUser ? (
                    <div className="space-y-4 pt-2">
                      <p className="text-xs text-[#666666] font-light">
                        Please re-verify using Google Authentication to finish dissolving your ledger membership.
                      </p>
                      {deleteError && (
                        <div className="p-3 bg-red-50 rounded-lg text-xs text-red-700 font-medium">
                          {deleteError}
                        </div>
                      )}
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowDeleteModal(false);
                            setDeleteStep('confirm');
                            setDeleteError('');
                          }}
                          className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-[#111111] text-xs font-semibold rounded-full transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReauthAndDelete()}
                          disabled={isDeleting}
                          className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-full transition-all flex items-center space-x-2"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Authenticating...</span>
                            </>
                          ) : (
                            <span>Re-authenticate with Google</span>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                          Validate Account Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                          <input
                            type="password"
                            required
                            disabled={isDeleting}
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="Confirm password"
                            className="w-full pl-11 pr-4 py-3 bg-[#FAFAFA] border border-[#EAEAEA] rounded-full text-xs text-[#111111] focus:outline-hidden focus:border-[#2563EB] focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                      
                      {deleteError && (
                        <div className="p-3 bg-red-50 rounded-lg text-xs text-red-700 font-medium">
                          {deleteError}
                        </div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowDeleteModal(false);
                            setDeleteStep('confirm');
                            setDeletePassword('');
                            setDeleteError('');
                          }}
                          className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-[#111111] text-xs font-semibold rounded-full transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isDeleting}
                          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Dissolving...</span>
                            </>
                          ) : (
                            <span>Verify & Dissolve Account</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Photo Actions Menu / Bottom Sheet */}
      {showPhotoMenu && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowPhotoMenu(false)}
          />
          
          {/* Menu Card */}
          <div className="relative w-full sm:max-w-xs bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden border-t sm:border border-[#EAEAEA] p-4 space-y-3 z-10 transition-all transform animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-[#F4F4F5]">
              <h4 className="font-sans font-semibold text-[10px] uppercase tracking-wider text-neutral-400">Profile Photo</h4>
              <button 
                type="button"
                onClick={() => setShowPhotoMenu(false)}
                className="text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions list */}
            <div className="flex flex-col space-y-1">
              {user.photoURL && (
                <button
                  type="button"
                  onClick={() => {
                    setShowViewPhotoModal(true);
                    setShowPhotoMenu(false);
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-[#FAFAFA] text-xs font-semibold text-neutral-800 transition-colors flex items-center space-x-2.5 cursor-pointer"
                >
                  <User className="w-4 h-4 text-neutral-500" />
                  <span>View Photo</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowPhotoMenu(false);
                }}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-[#FAFAFA] text-xs font-semibold text-neutral-800 transition-colors flex items-center space-x-2.5 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-neutral-500" />
                <span>Upload New Photo</span>
              </button>

              {user.photoURL && (
                <button
                  type="button"
                  onClick={() => {
                    setShowRemoveConfirm(true);
                    setShowPhotoMenu(false);
                  }}
                  className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-red-50 text-xs font-semibold text-red-600 transition-colors flex items-center space-x-2.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>
            
            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => setShowPhotoMenu(false)}
              className="w-full py-2.5 border border-[#EAEAEA] hover:bg-[#FAFAFA] rounded-full text-xs font-semibold text-neutral-800 transition-colors uppercase tracking-wider text-center cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* View Photo Large Modal */}
      {showViewPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setShowViewPhotoModal(false)}
          />
          
          {/* Photo Container */}
          <div className="relative max-w-lg w-full bg-stone-950 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col items-center p-6 space-y-4 transition-all transform scale-100 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowViewPhotoModal(false)}
              className="absolute top-4 right-4 bg-stone-900/60 hover:bg-stone-900 text-white/80 hover:text-white rounded-full p-2 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Large Image */}
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border border-stone-800 shadow-inner bg-stone-900 flex items-center justify-center">
              {user.photoURL && (
                <img
                  src={
                    user.photoURL.startsWith('/media/')
                      ? `${API_BASE_URL}${user.photoURL}`
                      : user.photoURL
                  }
                  alt={user.displayName || 'Patron'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Caption */}
            <div className="text-center">
              <h3 className="font-sans font-semibold text-sm text-stone-200">{user.displayName}</h3>
              <p className="font-mono text-[9px] text-stone-500 uppercase tracking-widest mt-1">Patron Vault Identity</p>
            </div>
          </div>
        </div>
      )}

      {/* Remove Photo Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowRemoveConfirm(false)}
          />
          
          {/* Confirmation Box */}
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-[#EAEAEA] p-5 space-y-4 z-10 transition-all transform scale-100 animate-in zoom-in-95 duration-200 text-center">
            {/* Warning Icon */}
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            {/* Title & Desc */}
            <div className="space-y-1.5">
              <h3 className="font-sans font-semibold text-base text-neutral-900">Remove Profile Picture?</h3>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                This will delete your custom profile picture from the secure server storage. You will fall back to your Google profile picture or default avatar.
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(false)}
                className="py-2.5 border border-[#EAEAEA] hover:bg-[#FAFAFA] rounded-full text-xs font-semibold text-neutral-800 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemovePhotoSubmit}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-semibold transition-colors uppercase tracking-wider cursor-pointer"
              >
                Remove
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}



