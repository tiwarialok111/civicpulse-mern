import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useToast } from '../context/ToastContext';
import { createComplaint } from '../services/complaintService';
import 'leaflet/dist/leaflet.css';

const CATEGORIES = [
  { label: 'Road Damage', icon: '🛣️' },
  { label: 'Garbage', icon: '🗑️' },
  { label: 'Water Leakage', icon: '💧' },
  { label: 'Street Light', icon: '💡' },
  { label: 'Drainage', icon: '🚰' },
  { label: 'Traffic', icon: '🚦' },
];

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const STEPS = ['Details', 'Location', 'Photos', 'Review'];

// Lazy-load MapPicker to avoid SSR issues with Leaflet
let MapPicker = null;

const ReportIssue = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    address: '',
    latitude: '',
    longitude: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [MapComponent, setMapComponent] = useState(null);

  // Lazy load map
  useEffect(() => {
    import('./MapPickerWidget').then((mod) => {
      setMapComponent(() => mod.default);
    }).catch(() => {});
  }, []);

  // Cleanup preview URLs
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const onDrop = useCallback((accepted, rejected) => {
    rejected.forEach((f) => {
      if (f.errors[0]?.code === 'file-too-large') toast.error(`${f.file.name} exceeds 5MB limit`);
      else if (f.errors[0]?.code === 'file-invalid-type') toast.error('Only JPG and PNG images are allowed');
    });

    const remaining = MAX_IMAGES - images.length;
    const toAdd = accepted.slice(0, remaining);

    if (accepted.length > remaining) {
      toast.warning(`Only ${remaining} more image${remaining !== 1 ? 's' : ''} allowed (max ${MAX_IMAGES})`);
    }

    if (!toAdd.length) return;
    const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, [images, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/jpg': [], 'image/png': [] },
    maxSize: MAX_FILE_SIZE,
    disabled: images.length >= MAX_IMAGES,
  });

  const removeImage = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((f) => ({ ...f, latitude: coords.latitude.toFixed(6), longitude: coords.longitude.toFixed(6) }));
        setLocating(false);
        toast.success('Location detected!');
        clearError('latitude');
        clearError('longitude');
      },
      () => {
        setLocating(false);
        toast.error('Unable to get your location. Please enter manually.');
      },
      { timeout: 10000 }
    );
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    clearError(e.target.name);
  };

  const clearError = (field) => {
    setFieldErrors((e) => { const ne = { ...e }; delete ne[field]; return ne; });
  };

  const validateStep = (s) => {
    const errors = {};
    if (s === 0) {
      if (!form.title.trim()) errors.title = 'Title is required';
      else if (form.title.trim().length < 5) errors.title = 'Title must be at least 5 characters';
      if (!form.description.trim()) errors.description = 'Description is required';
      else if (form.description.trim().length < 10) errors.description = 'Description must be at least 10 characters';
      if (!form.category) errors.category = 'Please select a category';
    } else if (s === 1) {
      if (!form.address.trim()) errors.address = 'Address is required';
      const lat = Number(form.latitude);
      const lng = Number(form.longitude);
      if (form.latitude === '' || isNaN(lat) || lat < -90 || lat > 90) errors.latitude = 'Valid latitude required (-90 to 90)';
      if (form.longitude === '' || isNaN(lng) || lng < -180 || lng > 180) errors.longitude = 'Valid longitude required (-180 to 180)';
    }
    return errors;
  };

  const nextStep = () => {
    const errors = validateStep(step);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('category', form.category);
      formData.append('address', form.address.trim());
      formData.append('latitude', form.latitude);
      formData.append('longitude', form.longitude);
      images.forEach((f) => formData.append('images', f));
      await createComplaint(formData);
      toast.success('Complaint submitted successfully! 🎉');
      setTimeout(() => navigate('/dashboard', { state: { message: 'Complaint submitted successfully!' } }), 1200);
    } catch (err) {
      toast.error(err.message || 'Failed to submit complaint');
      setLoading(false);
    }
  };

  const inputCls = (field) =>
    `input-base ${fieldErrors[field] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Report a Civic Issue</h1>
        <p className="mt-1 text-sm text-slate-500">Help your community by reporting the problem with details and photos.</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute inset-x-0 top-4 h-0.5 bg-slate-200 z-0" />
          <div
            className="absolute top-4 h-0.5 bg-emerald-500 z-0 transition-all duration-500"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center z-10">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                i < step ? 'bg-emerald-600 text-white' : i === step ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-white border-2 border-slate-200 text-slate-400'
              }`}>
                {i < step ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : i + 1}
              </div>
              <span className={`mt-1.5 text-[11px] font-semibold ${i === step ? 'text-emerald-700' : i < step ? 'text-emerald-500' : 'text-slate-400'}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 0: Details */}
      {step === 0 && (
        <div className="card p-6 space-y-5 animate-fade-in-up">
          <h2 className="text-base font-bold text-slate-900">Complaint Details</h2>

          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input id="title" name="title" type="text" value={form.title} onChange={handleChange}
              className={inputCls('title')} placeholder="e.g. Large pothole on Main Road" maxLength={100} />
            {fieldErrors.title && <p className="text-xs text-red-500">{fieldErrors.title}</p>}
            <p className="text-xs text-slate-400 text-right">{form.title.length}/100</p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea id="description" name="description" rows={4} value={form.description} onChange={handleChange}
              className={inputCls('description')} placeholder="Describe the issue in detail — when did it start, how severe is it, who is affected..." maxLength={1000} />
            {fieldErrors.description && <p className="text-xs text-red-500">{fieldErrors.description}</p>}
            <p className={`text-xs text-right ${form.description.length > 800 ? 'text-amber-500 font-medium' : 'text-slate-400'}`}>{form.description.length}/1000</p>
          </div>

          {/* Category — Visual Grid */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat.label} type="button" onClick={() => { setForm((f) => ({ ...f, category: cat.label })); clearError('category'); }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-semibold transition-all duration-150 ${
                    form.category === cat.label
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}>
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs text-center leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
            {fieldErrors.category && <p className="text-xs text-red-500">{fieldErrors.category}</p>}
          </div>
        </div>
      )}

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="card p-6 space-y-5 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Location Details</h2>
            <button type="button" onClick={detectLocation} disabled={locating}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-50 transition-colors">
              {locating ? (
                <><span className="h-3.5 w-3.5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />Detecting...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Use My Location</>
              )}
            </button>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label htmlFor="address" className="block text-sm font-medium text-slate-700">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input id="address" name="address" type="text" value={form.address} onChange={handleChange}
              className={inputCls('address')} placeholder="e.g. 42 MG Road, Bengaluru, Karnataka" />
            {fieldErrors.address && <p className="text-xs text-red-500">{fieldErrors.address}</p>}
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="latitude" className="block text-sm font-medium text-slate-700">
                Latitude <span className="text-red-500">*</span>
              </label>
              <input id="latitude" name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange}
                className={inputCls('latitude')} placeholder="28.6139" />
              {fieldErrors.latitude && <p className="text-xs text-red-500">{fieldErrors.latitude}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="longitude" className="block text-sm font-medium text-slate-700">
                Longitude <span className="text-red-500">*</span>
              </label>
              <input id="longitude" name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange}
                className={inputCls('longitude')} placeholder="77.2090" />
              {fieldErrors.longitude && <p className="text-xs text-red-500">{fieldErrors.longitude}</p>}
            </div>
          </div>

          {/* Map preview */}
          {form.latitude && form.longitude && MapComponent && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Map Preview</p>
              <div className="h-48 rounded-xl overflow-hidden border border-slate-200">
                <MapComponent
                  lat={Number(form.latitude)}
                  lng={Number(form.longitude)}
                  onSelect={(lat, lng) => {
                    setForm((f) => ({ ...f, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
                    clearError('latitude');
                    clearError('longitude');
                  }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">📍 Click on the map to adjust the pin location</p>
            </div>
          )}
          {!form.latitude && !form.longitude && (
            <div className="h-32 rounded-xl bg-slate-100 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-400">
              <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
              <p className="text-sm">Enter coordinates or use "Use My Location"</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Photos */}
      {step === 2 && (
        <div className="card p-6 space-y-5 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Photo Evidence</h2>
            <span className="text-sm text-slate-400">{images.length}/{MAX_IMAGES} uploaded</span>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all duration-200 ${
              isDragActive ? 'border-emerald-400 bg-emerald-50/70' : images.length >= MAX_IMAGES ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60' : 'border-slate-300 bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/40'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 mb-3 text-2xl">
              {isDragActive ? '📤' : '📷'}
            </div>
            <p className="text-sm font-semibold text-slate-700">
              {isDragActive ? 'Drop your images here' : images.length >= MAX_IMAGES ? 'Maximum images reached' : 'Drag & drop images, or click to browse'}
            </p>
            <p className="text-xs text-slate-400 mt-1">JPG, PNG — max 5MB each, up to {MAX_IMAGES} images</p>
          </div>

          {/* Preview Grid */}
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {previews.map((url, idx) => (
                <div key={url} className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-square">
                  <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                  <span className="absolute top-1 left-1 bg-slate-900/60 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                    {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-500">Photos are optional but help authorities understand the issue better and speed up resolution.</p>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="card p-6 space-y-5">
            <h2 className="text-base font-bold text-slate-900">Review Your Complaint</h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Title</p>
                <p className="text-sm font-semibold text-slate-900">{form.title}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-slate-700 leading-relaxed">{form.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{CATEGORIES.find((c) => c.label === form.category)?.icon}</span>
                    <span className="text-sm font-semibold text-slate-900">{form.category}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Images</p>
                  <p className="text-sm text-slate-700">{images.length} photo{images.length !== 1 ? 's' : ''} attached</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm text-slate-700">{form.address}</p>
                <p className="text-xs text-slate-400">Lat: {form.latitude}, Lng: {form.longitude}</p>
              </div>
            </div>

            {previews.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Attached Photos</p>
                <div className="flex gap-2 flex-wrap">
                  {previews.map((url, i) => (
                    <img key={url} src={url} alt={`Preview ${i + 1}`} className="h-16 w-16 rounded-lg object-cover border border-slate-200" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
            <p className="text-xs text-emerald-700">
              <span className="font-semibold">📋 Note:</span> Once submitted, your complaint will be reviewed by municipal authorities. You can track its progress in your dashboard.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6 gap-3">
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 0}
          className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-2 h-10 px-6 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Continue
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 h-10 px-6 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? (
              <><span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Submitting...</>
            ) : (
              <>Submit Complaint ✅</>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportIssue;
