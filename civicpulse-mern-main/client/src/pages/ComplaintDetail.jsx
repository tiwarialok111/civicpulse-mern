import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import Toast from '../components/Toast';
import {
  getComplaintById,
  updateComplaint,
  deleteComplaint,
} from '../services/complaintService';
import { formatDate } from '../utils/formatDate';

const CATEGORIES = [
  'Road Damage',
  'Garbage',
  'Water Leakage',
  'Street Light',
  'Drainage',
  'Traffic',
];

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [editLoading, setEditLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const fetchComplaint = async () => {
    try {
      const response = await getComplaintById(id);
      const data = response.data.complaint;
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

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setError('');

    try {
      const formData = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category,
        location: {
          address: editForm.address.trim(),
          latitude: Number(editForm.latitude),
          longitude: Number(editForm.longitude),
        },
      };

      await updateComplaint(id, formData);
      showToast('Complaint updated successfully!');
      setIsEditing(false);
      fetchComplaint();
    } catch (err) {
      setError(err.message || 'Failed to update complaint.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this complaint? This cannot be undone.')) {
      return;
    }
    setLoading(true);
    try {
      await deleteComplaint(id);
      navigate('/my-complaints', { state: { message: 'Complaint deleted successfully.' } });
    } catch (err) {
      showToast(err.message || 'Failed to delete complaint.', 'error');
      setLoading(false);
    }
  };

  const imageUrl = (img) => (typeof img === 'string' ? img : img?.url);

  if (loading) {
    return <Loader fullScreen text="Loading complaint details..." />;
  }

  if (error || !complaint) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-red-600 text-lg font-semibold">{error || 'Complaint not found.'}</p>
        <Link to="/my-complaints" className="mt-4 inline-block text-emerald-600 hover:underline">
          &larr; Back to My Complaints
        </Link>
      </div>
    );
  }

  // Progress Bar Steps calculation
  const getProgressStep = () => {
    if (complaint.status === 'pending') return 1;
    if (complaint.status === 'in-progress') return 2;
    if (complaint.status === 'resolved' || complaint.status === 'rejected') return 3;
    return 1;
  };
  const progressStep = getProgressStep();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 space-y-6">
      {toast.message && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      )}

      <div className="flex items-center justify-between">
        <Link
          to="/my-complaints"
          className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          &larr; Back to My Complaints
        </Link>

        {complaint.status === 'pending' && !isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        /* Edit Form */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Complaint Details</h2>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                required
                value={editForm.title}
                onChange={handleEditChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                name="description"
                required
                rows={4}
                value={editForm.description}
                onChange={handleEditChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={editForm.address}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  required
                  value={editForm.latitude}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  required
                  value={editForm.longitude}
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Read Details View */
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{complaint.title}</h1>
              <p className="mt-1.5 text-sm font-semibold text-emerald-600">{complaint.category}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <StatusBadge status={complaint.status} />
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                complaint.priority === 'urgent'
                  ? 'bg-red-100 text-red-800'
                  : complaint.priority === 'high'
                  ? 'bg-amber-100 text-amber-800'
                  : complaint.priority === 'medium'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100 text-slate-800'
              }`}>
                {complaint.priority || 'medium'} priority
              </span>
            </div>
          </div>

          {/* Graphical Progress Tracker */}
          <div className="py-2.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Complaint Tracker</h3>
            <div className="flex items-center w-full">
              {/* Step 1 */}
              <div className="flex flex-col items-center flex-1 relative">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white ${
                  progressStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  1
                </div>
                <span className="text-[11px] font-bold mt-1 text-slate-700">Pending Approval</span>
              </div>

              {/* Line 1 */}
              <div className="flex-1 h-1 bg-slate-100 -mt-5">
                <div className={`h-full bg-emerald-600 transition-all duration-300`} style={{ width: progressStep >= 2 ? '100%' : '0%' }} />
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center flex-1 relative">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white ${
                  progressStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  2
                </div>
                <span className="text-[11px] font-bold mt-1 text-slate-700">In Progress</span>
              </div>

              {/* Line 2 */}
              <div className="flex-1 h-1 bg-slate-100 -mt-5">
                <div className={`h-full bg-emerald-600 transition-all duration-300`} style={{ width: progressStep >= 3 ? '100%' : '0%' }} />
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center flex-1 relative">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-4 ring-white ${
                  progressStep >= 3
                    ? complaint.status === 'rejected'
                      ? 'bg-red-600 text-white'
                      : 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  3
                </div>
                <span className="text-[11px] font-bold mt-1 text-slate-700">
                  {complaint.status === 'rejected' ? 'Rejected' : 'Resolved'}
                </span>
              </div>
            </div>
          </div>

          {/* Details sections */}
          <div className="grid gap-6 sm:grid-cols-2 pt-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</h4>
                <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{complaint.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Location Address</h4>
                <p className="mt-1 text-sm text-slate-700">{complaint.location?.address}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Lat: {complaint.location?.latitude}, Lng: {complaint.location?.longitude}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date Log</h4>
                <p className="mt-1 text-sm text-slate-700">
                  <span className="font-semibold text-slate-500">Reported on:</span> {formatDate(complaint.createdAt)}
                </p>
                {complaint.resolvedAt && (
                  <p className="mt-1 text-sm text-emerald-800 font-semibold bg-emerald-50 rounded px-2 py-0.5 inline-block">
                    Resolved: {formatDate(complaint.resolvedAt)}
                  </p>
                )}
              </div>

              {complaint.images?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Photos</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {complaint.images.map((img, i) => (
                      <a key={imageUrl(img) || i} href={imageUrl(img)} target="_blank" rel="noopener noreferrer">
                        <img
                          src={imageUrl(img)}
                          alt=""
                          className="h-16 w-full rounded-lg border border-slate-200 object-cover hover:opacity-90 transition"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Admin Remarks Note */}
          {complaint.adminRemark && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Admin Remarks & Notes</h4>
              <p className="mt-1.5 text-sm text-emerald-900 italic font-medium">
                &ldquo;{complaint.adminRemark}&rdquo;
              </p>
            </div>
          )}

          {/* Status Timeline History array */}
          <div className="rounded-xl bg-slate-50 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Official Status Timeline Updates</h4>
            {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
              <div className="relative border-l border-emerald-300 ml-2.5 pl-6 space-y-4">
                {complaint.statusHistory.map((history, idx) => (
                  <div key={history._id || idx} className="relative">
                    <span className="absolute -left-[31px] mt-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-slate-50" />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded px-1.5 py-0.5 uppercase">
                          {history.status}
                        </span>
                        <span className="text-xs text-slate-400">{formatDate(history.timestamp)}</span>
                      </div>
                      {history.note && (
                        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed font-medium">
                          Note: {history.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No timeline updates yet. Your issue is currently waiting for admin review.</p>
            )}
          </div>
        </article>
      )}
    </div>
  );
};

export default ComplaintDetail;
