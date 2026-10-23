import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

function ClaimStatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    declined: "bg-gray-200 text-gray-600",
  };
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-semibold ${styles[status] || styles.pending}`}
    >
      {status}
    </span>
  );
}

export default function MyPosts() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState("posts");
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;
    setLoading(true);
    Promise.all([api.getMyItems(), api.getMyClaims()])
      .then(([myItems, myClaims]) => {
        setItems(myItems);
        setClaims(myClaims);
      })
      .catch(() => setError("Could not load your dashboard."))
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  const handleStatusChange = async (itemId, status) => {
    setActionError("");
    try {
      const updated = await api.updateItemStatus(itemId, status);
      setItems((prev) =>
        prev.map((it) =>
          it._id === itemId ? { ...it, status: updated.status } : it
        )
      );
    } catch (err) {
      setActionError(err.message || "Could not update status.");
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this item permanently?")) return;
    setActionError("");
    try {
      await api.deleteItem(itemId);
      setItems((prev) => prev.filter((it) => it._id !== itemId));
    } catch (err) {
      setActionError(err.message || "Could not delete the item.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">My Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Everything you posted and every claim you made — in one place.
      </p>

      <div className="mt-6 flex gap-2 border-b">
        <button
          onClick={() => setTab("posts")}
          className={`px-4 py-2 text-sm font-medium ${
            tab === "posts"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          My Posts ({items.length})
        </button>
        <button
          onClick={() => setTab("claims")}
          className={`px-4 py-2 text-sm font-medium ${
            tab === "claims"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          My Claims ({claims.length})
        </button>
      </div>

      {actionError && (
        <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {actionError}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-gray-500">Loading...</p>
      ) : error ? (
        <p className="mt-8 text-gray-600">{error}</p>
      ) : tab === "posts" ? (
        items.length === 0 ? (
          <div className="mt-8 text-center text-gray-500">
            <p>You have not posted anything yet.</p>
            <Link
              to="/post"
              className="mt-3 inline-block rounded bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700"
            >
              Post your first item
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {items.map((item) => (
              <li
                key={item._id}
                className="flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm sm:flex-row"
              >
                {item.imageUrl && (
                  <Link to={`/items/${item._id}`} className="shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-24 w-32 rounded object-cover"
                    />
                  </Link>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/items/${item._id}`}
                      className="font-semibold hover:underline"
                    >
                      {item.title}
                    </Link>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        item.type === "lost"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.type === "lost" ? "LOST" : "FOUND"}
                    </span>
                    <span className="text-xs text-gray-500">
                      Status: <strong>{item.status}</strong>
                    </span>
                  </div>
                  {item.pendingClaims > 0 && (
                    <Link
                      to={`/items/${item._id}`}
                      className="mt-1 inline-block text-sm font-medium text-blue-600 hover:underline"
                    >
                      🤝 {item.pendingClaims} pending claim
                      {item.pendingClaims > 1 ? "s" : ""} — review
                    </Link>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item._id, e.target.value)
                      }
                      className="rounded border px-2 py-1 text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="claimed">Claimed</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : claims.length === 0 ? (
        <p className="mt-8 text-center text-gray-500">
          You have not claimed anything yet. Browse the feed and claim an item
          that is yours.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {claims.map((claim) => (
            <li
              key={claim._id}
              className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm"
            >
              {claim.item?.imageUrl && (
                <Link
                  to={`/items/${claim.item?._id}`}
                  className="shrink-0"
                >
                  <img
                    src={claim.item.imageUrl}
                    alt={claim.item.title}
                    className="h-20 w-28 rounded object-cover"
                  />
                </Link>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/items/${claim.item?._id}`}
                    className="font-semibold hover:underline"
                  >
                    {claim.item?.title || "Deleted item"}
                  </Link>
                  <ClaimStatusBadge status={claim.status} />
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                  “{claim.message}”
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Item status: {claim.item?.status || "unknown"} •{" "}
                  {new Date(claim.createdAt).toLocaleDateString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
