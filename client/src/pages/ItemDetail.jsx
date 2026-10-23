import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    api
      .getItem(id)
      .then(setItem)
      .catch(() => setError("Item not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = user && item && user._id === item.postedBy?._id;

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    setActionError("");
    try {
      const updated = await api.updateItemStatus(id, status);
      setItem(updated);
    } catch (err) {
      setActionError(err.message || "Could not update status.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this item permanently?")) return;
    setActionError("");
    try {
      await api.deleteItem(id);
      navigate("/");
    } catch (err) {
      setActionError(err.message || "Could not delete the item.");
    }
  };

  if (loading) {
    return <p className="mx-auto max-w-3xl px-4 py-10 text-gray-500">Loading...</p>;
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-gray-600">{error || "Item not found."}</p>
        <Link to="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          ← Back to feed
        </Link>
      </div>
    );
  }

  const isLost = item.type === "lost";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/" className="text-sm text-blue-600 hover:underline">
        ← Back to feed
      </Link>

      {actionError && (
        <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{actionError}</p>
      )}

      <div className="mt-4 overflow-hidden rounded-lg border bg-white shadow-sm">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="max-h-96 w-full object-cover"
          />
        )}

        <div className="p-6">
          <div className="flex items-center justify-between">
            <span
              className={`rounded px-2 py-0.5 text-xs font-semibold ${
                isLost
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {isLost ? "LOST" : "FOUND"}
            </span>
            <span className="text-sm text-gray-500">
              Status: <strong>{item.status}</strong>
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-bold">{item.title}</h1>
          <p className="mt-3 whitespace-pre-wrap text-gray-700">{item.description}</p>

          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-gray-500">Location</dt>
              <dd>📍 {item.location}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Date</dt>
              <dd>{new Date(item.date).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Category</dt>
              <dd>{item.category}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Posted by</dt>
              <dd>{item.postedBy?.name || "Unknown"}</dd>
            </div>
          </dl>

          {user && !isOwner && item.postedBy?.email && (
            <a
              href={`mailto:${item.postedBy.email}?subject=CampusKhoj: ${item.title}`}
              className="mt-6 inline-block rounded bg-gray-900 px-5 py-2 text-sm text-white hover:bg-gray-700"
            >
              Contact the {isLost ? "owner" : "finder"}
            </a>
          )}

          {isOwner && (
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded border bg-gray-50 p-4">
              <label className="text-sm font-medium text-gray-700">
                Update status:
              </label>
              <select
                value={item.status}
                onChange={handleStatusChange}
                className="rounded border px-3 py-1.5 text-sm"
              >
                <option value="open">Open</option>
                <option value="claimed">Claimed</option>
                <option value="resolved">Resolved</option>
              </select>
              <button
                onClick={handleDelete}
                className="rounded bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
