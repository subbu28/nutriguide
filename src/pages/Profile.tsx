import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Camera, 
  Lock, 
  Trash2, 
  LogOut,
  Heart,
  Users,
  Vote,
  ChefHat,
  Crown,
  Calendar,
  Loader2,
  Check,
  X,
  Edit3,
  AlertTriangle,
  Save
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { PageLoader, ProfileSkeleton, StatsSkeleton, TextSkeleton } from '../components/LoadingStates';
import { ErrorEmptyState } from '../components/EmptyState';

export const Profile: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState('');

  // Edit modes
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    loadProfile();
  }, [isAuthenticated, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileData, statsData] = await Promise.all([
        api.getProfile(),
        api.getProfileStats(),
      ]);
      setProfile(profileData);
      setStats(statsData);
      setName(profileData.name);
      setEmail(profileData.email);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async () => {
    if (!name.trim()) return;
    try {
      setSaving(true);
      setError(null);
      await api.updateUserProfile({ name: name.trim() });
      setProfile((prev: any) => ({ ...prev, name: name.trim() }));
      setEditingName(false);
      setSuccess('Name updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(new Error(err.message || 'Failed to update name'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email.trim()) return;
    try {
      setSaving(true);
      setError(null);
      await api.updateUserProfile({ email: email.trim() });
      setProfile((prev: any) => ({ ...prev, email: email.trim() }));
      setEditingEmail(false);
      setSuccess('Email updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(new Error(err.message || 'Failed to update email'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError(new Error('Passwords do not match'));
      return;
    }
    if (newPassword.length < 6) {
      setError(new Error('Password must be at least 6 characters'));
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await api.changePassword({ currentPassword, newPassword });
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password changed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(new Error(err.message || 'Failed to change password'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      setError(new Error('Please type DELETE to confirm'));
      return;
    }
    try {
      setSaving(true);
      await api.deleteAccount();
      logout();
      navigate('/');
    } catch (err: any) {
      setError(new Error(err.message || 'Failed to delete account'));
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      logout();
      navigate('/');
    } catch (err) {
      logout();
      navigate('/');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const avatar = reader.result as string;
        await api.updateUserProfile({ avatar });
        setProfile((prev: any) => ({ ...prev, avatar }));
        setSuccess('Avatar updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(new Error(err.message || 'Failed to update avatar'));
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            My Profile
          </h1>
          <p className="text-stone-600 mt-2">Manage your account and preferences</p>
        </motion.div>
        <ProfileSkeleton showStats={true} showActions={true} />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ErrorEmptyState onRetry={loadProfile} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          My Profile
        </h1>
        <p className="text-stone-600 mt-2">Manage your account and preferences</p>
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            {error.message}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Profile Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {profile?.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-stone-50 transition-colors">
                <Camera className="w-4 h-4 text-stone-600" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h2 className="text-2xl font-bold text-stone-800">{profile?.name}</h2>
                {profile?.isPremium && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full">
                    <Crown className="w-3 h-3" />
                    Premium
                  </span>
                )}
              </div>
              <p className="text-stone-500">{profile?.email}</p>
              <p className="text-sm text-stone-400 mt-1 flex items-center justify-center md:justify-start gap-1">
                <Calendar className="w-4 h-4" />
                Joined {new Date(profile?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: Heart, label: 'Favorites', value: stats?.favorites || 0, color: 'text-rose-500', bg: 'bg-rose-50' },
            { icon: Users, label: 'Families', value: stats?.families || 0, color: 'text-blue-500', bg: 'bg-blue-50' },
            { icon: Vote, label: 'Votes Cast', value: stats?.votes || 0, color: 'text-purple-500', bg: 'bg-purple-50' },
            { icon: ChefHat, label: 'Suggestions', value: stats?.suggestions || 0, color: 'text-amber-500', bg: 'bg-amber-50' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
              className="glass rounded-xl p-4 text-center"
            >
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-stone-800">{stat.value}</p>
              <p className="text-xs text-stone-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Account Info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-stone-800 mb-4">Account Information</h3>
          
          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-center justify-between py-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-stone-400" />
                <div>
                  <p className="text-sm text-stone-500">Name</p>
                  {editingName ? (
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="px-2 py-1 border border-stone-200 rounded-lg text-stone-800 focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                  ) : (
                    <p className="font-medium text-stone-800">{profile?.name}</p>
                  )}
                </div>
              </div>
              {editingName ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateName}
                    disabled={saving}
                    className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setName(profile?.name); }}
                    className="p-2 bg-stone-200 text-stone-600 rounded-lg hover:bg-stone-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center justify-between py-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-stone-400" />
                <div>
                  <p className="text-sm text-stone-500">Email</p>
                  {editingEmail ? (
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="px-2 py-1 border border-stone-200 rounded-lg text-stone-800 focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                  ) : (
                    <p className="font-medium text-stone-800">{profile?.email}</p>
                  )}
                </div>
              </div>
              {editingEmail ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateEmail}
                    disabled={saving}
                    className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { setEditingEmail(false); setEmail(profile?.email); }}
                    className="p-2 bg-stone-200 text-stone-600 rounded-lg hover:bg-stone-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingEmail(true)}
                  className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Password */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-stone-400" />
                <div>
                  <p className="text-sm text-stone-500">Password</p>
                  <p className="font-medium text-stone-800">••••••••</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                Change
              </button>
            </div>
          </div>
        </motion.section>

        {/* Premium Status */}
        {!profile?.isPremium && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Upgrade to Premium
                </h3>
                <p className="text-white/80 text-sm mt-1">
                  Unlock AI-powered recipes, unlimited families, and more!
                </p>
              </div>
              <Link
                to="/premium"
                className="px-6 py-2 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors"
              >
                Upgrade
              </Link>
            </div>
          </motion.section>
        )}

        {/* Danger Zone */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-stone-800 mb-4">Account Actions</h3>
          
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log Out</span>
            </button>
            
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span className="font-medium">Delete Account</span>
            </button>
          </div>
        </motion.section>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-stone-800 mb-4">Change Password</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-3 bg-stone-100 text-stone-700 font-medium rounded-xl hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="flex-1 px-4 py-3 gradient-primary text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Update Password'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-800">Delete Account</h3>
                <p className="text-stone-600 mt-2">
                  This action cannot be undone. All your data including favorites, family memberships, and settings will be permanently deleted.
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-red-500"
                  placeholder="DELETE"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                  className="flex-1 px-4 py-3 bg-stone-100 text-stone-700 font-medium rounded-xl hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={saving || deleteConfirm !== 'DELETE'}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Delete Account'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
