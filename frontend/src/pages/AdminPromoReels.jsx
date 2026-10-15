import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, Check, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { reelsService } from '../services/reelsService';

const AdminPromoReels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({ frequency: 7, enabled: true });
  const navigate = useNavigate();

  const [form, setForm] = useState({
    caption: '',
    topic: '',
    cta: '',
    linked_feature: '',
    priority: 0,
    file: null
  });

  useEffect(() => {
    loadReels();
    loadSettings();
  }, []);

  const loadReels = async () => {
    try {
      const data = await reelsService.getPromoReels();
      setReels(data.reels || []);
    } catch (e) {
      console.error('Failed to load promo reels', e);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await reelsService.getPromoSettings();
      setSettings(data);
    } catch (e) {
      console.error('Failed to load promo settings', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.file) return;
    try {
      setSaving(true);
      await reelsService.createPromoReel(
        form.file,
        form.caption,
        form.topic,
        form.cta,
        form.linked_feature,
        form.priority
      );
      setShowForm(false);
      setForm({ caption: '', topic: '', cta: '', linked_feature: '', priority: 0, file: null });
      loadReels();
    } catch (e) {
      console.error('Failed to create promo reel', e);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (reelId, currentActive) => {
    try {
      await reelsService.updatePromoReel(reelId, { active: !currentActive });
      loadReels();
    } catch (e) {
      console.error('Failed to update promo reel', e);
    }
  };

  const deleteReel = async (reelId) => {
    if (!window.confirm('Delete this promotional reel?')) return;
    try {
      await reelsService.deletePromoReel(reelId);
      loadReels();
    } catch (e) {
      console.error('Failed to delete promo reel', e);
    }
  };

  const updateSettings = async () => {
    try {
      await reelsService.updatePromoSettings(settings);
    } catch (e) {
      console.error('Failed to update settings', e);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto">
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-gray-800 px-4 py-3">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Famelo Promo Reels
              </h1>
              <p className="text-[11px] text-gray-400">Manage official promotional reels</p>
            </div>
          </div>
        </header>

        <div className="px-4 py-4 space-y-4">
          {/* Settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Feed Settings</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Enabled</span>
              <button
                onClick={() => { setSettings({ ...settings, enabled: !settings.enabled }); setTimeout(updateSettings, 0); }}
                className={`text-xs px-3 py-1.5 rounded-lg ${settings.enabled ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              >
                {settings.enabled ? 'On' : 'Off'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Frequency (1 per N reels)</span>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.frequency}
                onChange={(e) => { setSettings({ ...settings, frequency: parseInt(e.target.value) || 7 }); setTimeout(updateSettings, 0); }}
                className="w-16 bg-gray-800 text-white text-xs rounded-lg px-2 py-1 text-center"
              />
            </div>
          </div>

          {/* Create Button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold py-3 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              <span>Add Promotional Reel</span>
            </button>
          )}

          {/* Create Form */}
          {showForm && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">New Promo Reel</h3>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Video file</label>
                <input
                  type="file"
                  accept="video/*"
                  required
                  onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
                  className="w-full text-xs text-gray-300 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-gray-800 file:text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Caption</label>
                <textarea
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  className="w-full bg-gray-800 text-white text-xs rounded-lg px-3 py-2"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Topic</label>
                <input
                  type="text"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="w-full bg-gray-800 text-white text-xs rounded-lg px-3 py-2"
                  placeholder="e.g. Safe Shopping"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">CTA</label>
                <input
                  type="text"
                  value={form.cta}
                  onChange={(e) => setForm({ ...form, cta: e.target.value })}
                  className="w-full bg-gray-800 text-white text-xs rounded-lg px-3 py-2"
                  placeholder="e.g. Shop on Famelo"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Linked Feature</label>
                <input
                  type="text"
                  value={form.linked_feature}
                  onChange={(e) => setForm({ ...form, linked_feature: e.target.value })}
                  className="w-full bg-gray-800 text-white text-xs rounded-lg px-3 py-2"
                  placeholder="e.g. /explore"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">Priority</label>
                <input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-800 text-white text-xs rounded-lg px-3 py-2"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? 'Uploading...' : 'Upload Reel'}</span>
              </button>
            </motion.form>
          )}

          {/* Promo Reels List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white">Promotional Reels</h3>
            {loading ? (
              <div className="text-center text-gray-400 text-xs py-6">Loading...</div>
            ) : reels.length === 0 ? (
              <div className="text-center text-gray-400 text-xs py-6">No promotional reels yet.</div>
            ) : (
              reels.map((reel) => (
                <div key={reel.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white truncate flex-1">{reel.caption || 'Untitled'}</h4>
                    <span className={`text-[10px] border rounded-full px-2 py-0.5 ${reel.active ? 'border-green-700 text-green-400' : 'border-red-700 text-red-400'}`}>
                      {reel.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">Topic: {reel.topic || '-'}</p>
                  <p className="text-[11px] text-gray-400">CTA: {reel.cta || '-'}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-gray-500">Priority: {reel.priority || 0}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleActive(reel.id, reel.active)}
                        className={`text-[10px] px-2 py-1 rounded-lg ${reel.active ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'}`}
                      >
                        {reel.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteReel(reel.id)}
                        className="text-[10px] px-2 py-1 rounded-lg bg-red-600 text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPromoReels;
