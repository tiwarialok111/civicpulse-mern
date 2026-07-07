import { useEffect, useState, lazy, Suspense } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getComplaintById, updateComplaint, deleteComplaint } from '../services/complaintService';
import { formatDate } from '../utils/formatDate';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/ui/Badge';
import { Modal, ModalBody, ModalFooter } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import 'leaflet/dist/leaflet.css';

const CATEGORIES = ['Road Damage', 'Garbage', 'Water Leakage', 'Street Light', 'Drainage', 'Traffic'];

const imageUrl = (img) => (typeof img === 'string' ? img : img?.url);

const STATUS_TIMELINE = [
  { status: 'pending', label: 'Pending Review', icon: '⏳' },
  { status: 'in-progress', label: 'In Progress', icon: '🔄' },
  { status: 'resolved', label: 'Resolved', icon: '✅' },
];

const getStepIndex = (status) => {
  if (status === 'pending') return 0;
  if (status === 'in-progress') return 1;
  if (status === 'resolved') return 2;
  if (status === 'rejected') return 3;
  return 0;
};

// Lazy-load Map to avoid SSR issues
const MapView = lazy(() => import('./MapPickerWidget').catch(() => ({ default: () => null })));

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '', address: '', latitude: '', longitude: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchComplaint = async () => {
    try {
      const res = await getComplaintById(id);
      const data = res.data.complaint;
      setComplaint(data);
      setEditForm({
        title: data.title,
        description: data.description,
        category: data.category,
        address: data.location?.address || '',
        latitude: data.location?.latitude || '',
        longitude: data.location?.longitude || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaint(); }, [id]);

  const handleEditChange = (e) => setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await updateComplaint(id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category,
        location: { address: editForm.address.trim(), latitude: Number(editForm.latitude), longitude: Number(editForm.longitude) },
      });
      toast.success('Complaint updated successfully!');
      setIsEditing(false);
      fetchComplaint();
    } catch (err) {
      toast.error(err.message || 'Failed to update complaint.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteComplaint(id);
      toast.success('Complaint deleted successfully.');
      navigate('/my-complaints');
    } catch (err) {
      toast.error(err.message || 'Failed to delete complaint.');
      setDeleteLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-5 animate-fade-in">
        <div className="skeleton h-8 w-36 rounded" />
        <div className="card p-6 space-y-5">
          <div className="skeleton h-7 w-3/4 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-4/5 rounded" />
          <div className="skeleton h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center space-y-4 animate-fade-in">
        <div className="text-5xl">😕</div>
        <h2 className="text-xl font-bold text-slate-900">{error || 'Complaint not found.'}</h2>
        <Link to="/my-complaints" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
          ← Back to My Complaints
        </Link>
      </div>
    );
  }

  const stepIndex = getStepIndex(complaint.status);
  const hasLocation = complaint.location?.latitude && complaint.location?.longitude;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10 space-y-5 animate-fade-in">
      {/* Nav */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/my-complaints" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          My Complaints
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={copyLink} className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Share
          </button>
          {complaint.status === 'pending' && !isEditing && (
            <>
              <button onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                ✏️ Edit
              </button>
              <button onClick={() => setDeleteModal(true)}
                className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit Form */}
      {isEditing ? (
        <div className="card p-6 space-y-4 animate-fade-in-up">
          <h2 className="text-lg font-bold text-slate-900">Edit Complaint</h2>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Title</label>
              <input name="title" type="text" required value={editForm.title} onChange={handleEditChange} className="input-base" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" rows={4} required value={editForm.description} onChange={handleEditChange} className="input-base resize-none" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <div className="relative">
                  <select name="category" value={editForm.category} onChange={handleEditChange} className="input-base appearance-none pr-7">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Address</label>
                <input name="address" type="text" required value={editForm.address} onChange={handleEditChange} className="input-base" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Latitude</label>
                <input name="latitude" type="number" step="any" required value={editForm.latitude} onChange={handleEditChange} className="input-base" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Longitude</label>
                <input name="longitude" type="number" step="any" required value={editForm.longitude} onChange={handleEditChange} className="input-base" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setIsEditing(false)} className="h-9 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" disabled={editLoading} className="h-9 px-5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors">
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Main Detail Card */}
          <div className="card p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl leading-tight">{complaint.title}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <CategoryBadge category={complaint.category} />
                  <PriorityBadge priority={complaint.priority} />
                  <StatusBadge status={complaint.status} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Filed on</p>
                <p className="text-sm font-semibold text-slate-600">{formatDate(complaint.createdAt)}</p>
              </div>
            </div>

            {/* Status Progress Tracker */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Complaint Tracker</h3>
              <div className="flex items-center">
                {STATUS_TIMELINE.map((s, i) => (
                  <div key={s.status} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-base ring-4 transition-all duration-300 ${
                        complaint.status === 'rejected' && i === 2
                          ? 'bg-red-500 ring-red-100 text-white'
                          : i < stepIndex || (i === 2 && stepIndex === 2)
                          ? 'bg-emerald-500 ring-emerald-100 text-white'
                          : i === stepIndex
                          ? 'bg-emerald-600 ring-emerald-200 text-white animate-pulse-soft'
                          : 'bg-slate-200 ring-slate-50 text-slate-400'
                      }`}>
                        {i < stepIndex ? '✓' : s.icon}
                      </div>
                      <span className={`text-[10px] font-bold mt-1.5 text-center ${i === stepIndex ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {complaint.status === 'rejected' && i === 2 ? 'Rejected' : s.label}
                      </span>
                    </div>
                    {i < STATUS_TIMELINE.length - 1 && (
                      <div className="flex-1 h-1 mx-1 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full bg-emerald-500 rounded-full transition-all duration-700 ${i < stepIndex ? 'w-full' : 'w-0'}`} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            </div>

            {/* Admin Remark */}
            {complaint.adminRemark && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">💬</span>
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Admin Remark</h4>
                </div>
                <p className="text-sm text-emerald-900 leading-relaxed italic">"{complaint.adminRemark}"</p>
              </div>
            )}

            {/* Location + Date */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">📍 Location</h4>
                <p className="text-sm text-slate-700 font-medium">{complaint.location?.address || 'Not specified'}</p>
                {complaint.location?.latitude && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {complaint.location.latitude.toFixed(4)}, {complaint.location.longitude.toFixed(4)}
                  </p>
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">📅 Date Log</h4>
                <p className="text-sm text-slate-700">Filed: <span className="font-semibold">{formatDate(complaint.createdAt)}</span></p>
                {complaint.resolvedAt && (
                  <p className="text-sm text-emerald-700 font-semibold mt-0.5">
                    ✅ Resolved: {formatDate(complaint.resolvedAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Leaflet Map */}
            {hasLocation && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">🗺️ Location Map</h4>
                <div className="h-48 rounded-xl overflow-hidden border border-slate-200">
                  <Suspense fallback={<div className="h-full skeleton rounded-xl" />}>
                    <MapView
                      lat={Number(complaint.location.latitude)}
                      lng={Number(complaint.location.longitude)}
                      onSelect={() => {}}
                    />
                  </Suspense>
                </div>
              </div>
            )}

            {/* Image Gallery */}
            {complaint.images?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">📸 Photo Evidence ({complaint.images.length})</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {complaint.images.map((img, i) => {
                    const url = imageUrl(img);
                    return (
                      <button key={url || i} onClick={() => setLightboxImg(url)}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-300 transition-all hover:shadow-md">
                        <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                          <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Status History Timeline */}
          <div className="card p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-5">📋 Status Timeline</h3>
            {complaint.statusHistory?.length > 0 ? (
              <div className="relative ml-3">
                <div className="absolute inset-y-2 left-0 w-0.5 bg-emerald-200" />
                <div className="space-y-5">
                  {complaint.statusHistory.map((h, idx) => (
                    <div key={h._id || idx} className="relative flex gap-4 pl-6">
                      <span className="absolute left-0 -translate-x-1/2 mt-1 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white shadow-sm" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={h.status} size="sm" />
                          <span className="text-xs text-slate-400">{formatDate(h.timestamp)}</span>
                        </div>
                        {h.note && (
                          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                            <span className="font-semibold text-slate-500">Note:</span> {h.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No status updates yet. Your complaint is awaiting admin review.</p>
            )}
          </div>
        </>
      )}

      {/* Lightbox Modal */}
      <Modal open={!!lightboxImg} onClose={() => setLightboxImg(null)} size="xl" className="bg-slate-900 border-slate-700">
        <ModalBody className="flex items-center justify-center p-2">
          {lightboxImg && (
            <img src={lightboxImg} alt="Full size" className="max-h-[80vh] max-w-full rounded-lg object-contain" />
          )}
        </ModalBody>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Complaint"
        description="This will permanently delete your complaint and cannot be undone." size="sm">
        <ModalFooter>
          <button onClick={() => setDeleteModal(false)} className="h-9 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleteLoading}
            className="h-9 px-4 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors">
            {deleteLoading ? 'Deleting...' : '🗑️ Delete'}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ComplaintDetail;
