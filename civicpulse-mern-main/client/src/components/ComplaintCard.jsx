import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/formatDate';

const ComplaintCard = ({ complaint }) => {
  const imageUrl = (img) => (typeof img === 'string' ? img : img?.url);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">{complaint.title}</h2>
        <StatusBadge status={complaint.status} />
      </div>

      <p className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
        {complaint.category}
      </p>

      <p className="mt-3 line-clamp-2 text-sm text-slate-600">{complaint.description}</p>

      <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
        <span className="mt-0.5 shrink-0">📍</span>
        <span>{complaint.location?.address}</span>
      </div>

      <p className="mt-2 text-xs text-slate-400">Reported on {formatDate(complaint.createdAt)}</p>

      {complaint.images?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {complaint.images.slice(0, 3).map((img, index) => (
            <img
              key={imageUrl(img) || index}
              src={imageUrl(img)}
              alt={`Complaint ${index + 1}`}
              className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
            />
          ))}
          {complaint.images.length > 3 && (
            <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
              +{complaint.images.length - 3}
            </span>
          )}
        </div>
      )}

      <Link
        to={`/complaints/${complaint._id}`}
        className="mt-4 inline-block rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
      >
        View Details
      </Link>
    </article>
  );
};

export default ComplaintCard;
