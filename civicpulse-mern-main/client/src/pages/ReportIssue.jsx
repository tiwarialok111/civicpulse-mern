import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import { createComplaint } from '../services/complaintService';

const CATEGORIES = [
  'Road Damage',
  'Garbage',
  'Water Leakage',
  'Street Light',
  'Drainage',
  'Traffic',
];

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const ReportIssue = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const [images, setImages] = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // Preview URLs
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type }), 4000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > MAX_IMAGES) {
      showToast(`You can upload a maximum of ${MAX_IMAGES} images.`, 'error');
      e.target.value = '';
      return;
    }

    const validFiles = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        showToast('Only JPG, JPEG, and PNG images are allowed.', 'error');
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        showToast('Each image must be 5MB or less.', 'error');
        continue;
      }
      validFiles.push(file);
    }

    if (!validFiles.length) {
      e.target.value = '';
      return;
    }

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setLocating(false);
        showToast('Location detected successfully.', 'success');
      },
      () => {
        setLocating(false);
        showToast('Unable to get your location. Please enter manually.', 'error');
      }
    );
  };

  const validateForm = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.description.trim()) return 'Description is required.';
    if (!form.category) return 'Please select a category.';
    if (!form.address.trim()) return 'Address is required.';

    const lat = Number(form.latitude);
    const lng = Number(form.longitude);

    if (form.latitude === '' || Number.isNaN(lat) || lat < -90 || lat > 90) {
      return 'Valid latitude is required (-90 to 90).';
    }
    if (form.longitude === '' || Number.isNaN(lng) || lng < -180 || lng > 180) {
      return 'Valid longitude is required (-180 to 180).';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      showToast(error, 'error');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('category', form.category);
      formData.append('address', form.address.trim());
      formData.append('latitude', form.latitude);
      formData.append('longitude', form.longitude);

      images.forEach((file) => {
        formData.append('images', file);
      });

      await createComplaint(formData);

      showToast('Complaint submitted successfully!', 'success');

      setTimeout(() => {
        navigate('/dashboard', {
          state: { message: 'Complaint submitted successfully!' },
        });
      }, 1500);
    } catch (err) {
      showToast(err.message || 'Failed to submit complaint.', 'error');
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Report an Issue</h1>
        <p className="mt-1 text-sm text-slate-600">
          Describe the problem, add location details, and upload photos (optional).
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {/* Title */}
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g. Large pothole on Main Road"
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            className={inputClass}
            placeholder="Describe the issue in detail..."
            maxLength={1000}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="mb-1 block text-sm font-medium text-slate-700">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={form.address}
            onChange={handleChange}
            className={inputClass}
            placeholder="Street, area, city"
          />
        </div>

        {/* Location coordinates */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              Coordinates <span className="text-red-500">*</span>
            </span>
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
            >
              {locating ? 'Detecting...' : 'Use my location'}
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="latitude" className="mb-1 block text-xs text-slate-500">
                Latitude
              </label>
              <input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={handleChange}
                className={inputClass}
                placeholder="28.6139"
              />
            </div>
            <div>
              <label htmlFor="longitude" className="mb-1 block text-xs text-slate-500">
                Longitude
              </label>
              <input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={handleChange}
                className={inputClass}
                placeholder="77.2090"
              />
            </div>
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Photos <span className="font-normal text-slate-400">(optional, max 5)</span>
          </label>
          <label className="mt-1 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 transition hover:border-emerald-400 hover:bg-emerald-50/50">
            <span className="text-sm font-medium text-slate-600">Click to upload images</span>
            <span className="mt-1 text-xs text-slate-400">JPG, JPEG, PNG — max 5MB each</span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              multiple
              onChange={handleImageChange}
              className="hidden"
              disabled={images.length >= MAX_IMAGES}
            />
          </label>

          {/* Image previews */}
          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {previews.map((url, index) => (
                <div key={url} className="group relative overflow-hidden rounded-lg border border-slate-200">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="h-28 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white opacity-90 hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-slate-400">
            {images.length}/{MAX_IMAGES} images selected
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting...
            </span>
          ) : (
            'Submit Complaint'
          )}
        </button>
      </form>
    </div>
  );
};

export default ReportIssue;
