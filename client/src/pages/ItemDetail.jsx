import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");

  // Week 3: claim state
  const [claims, setClaims] = useState([]); // for the poster
  const [myClaim, setMyClaim] = useState(null); // for a non-owner visitor
  const [claimFormOpen, setClaimFormOpen] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimError, setClaimError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .getItem(id)
      .then(setItem)
      .catch(() => setError("Item not found."))
      .finally(() => setLoading(false));
  }, [id]);

  // Load claim context once we know the item and the viewer.
  // (Depends on stable ids only, so owner actions that refresh the
  // item above do not trigger a duplicate fetch here.)
  const viewerId = user?._id;
  const posterId = item?.postedBy?._id;
  useEffect(() => {
    if (!viewerId || !id) {
      setClaims([]);
      setMyClaim(null);
      return;
    }
    if (viewerId === posterId) {
      api
        .getItemClaims(id)
        .then(setClaims)
        .catch(() => {});
    } else {
      api
        .getMyClaims({ item: id })
        .then((list) => setMyClaim(list[0] || null))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, viewerId, posterId]);

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

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimError("");
    setClaimBusy(true);
    try {
      const claim = await api.createClaim(id, claimMessage);
      setMyClaim(claim);
      setClaimFormOpen(false);
      setClaimMessage("");
    } catch (err) {
      setClaimError(err.message || "Could not send the claim request.");
    } finally {
      setClaimBusy(false);
    }
  };

  const handleClaimDecision = async (claimId, decision) => {
    setActionError("");
    try {
      await api.respondClaim(id, claimId, decision);
      const [updatedItem, updatedClaims] = await Promise.all([
        api.getItem(id),
        api.getItemClaims(id),
      ]);
      setItem(updatedItem);
      setClaims(updatedClaims);
    } catch (err) {
      setActionError(err.message || "Could not update the claim.");
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
  const itemOpen = item.status === "open";
  const pendingClaims = claims.filter((c) => c.status === "pending");

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

          {/* Week 3: claim flow for visitors */}
          {!user && itemOpen && (
            <p className="mt-6 text-sm text-gray-500">
              <Link to="/login" className="text-blue-600 hover:underline">
                Log in
              </Link>{" "}
              to claim this item if it is yours.
            </p>
          )}
          {user && !isOwner && (
            <div className="mt-6">
              {!myClaim && !claimFormOpen && itemOpen && (
                <button
                  onClick={() => setClaimFormOpen(true)}
                  className="rounded bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700"
                >
                  🤝 Claim this item — it is mine
                </button>
              )}

              {claimFormOpen && (
                <form
                  onSubmit={handleClaimSubmit}
                  className="rounded border bg-gray-50 p-4"
                >
                  <label className="text-sm font-medium text-gray-700">
                    Prove it is yours — tell the poster something only the real
                    owner would know (a sticker, a scratch, the ID number...)
                  </label>
                  <textarea
                    value={claimMessage}
                    onChange={(e) => setClaimMessage(e.target.value)}
                    rows={3}
                    maxLength={500}
                    required
                    className="mt-2 w-full rounded border px-3 py-2 text-sm"
                    placeholder="e.g. The phone has a cracked corner and a blue anime sticker on the back"
                  />
                  {claimError && (
                    <p className="mt-2 text-sm text-red-700">{claimError}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      type="submit"
                      disabled={claimBusy}
                      className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {claimBusy ? "Sending..." : "Send claim request"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setClaimFormOpen(false);
                        setClaimMessage("");
                        setClaimError("");
                      }}
                      className="rounded border px-4 py-1.5 text-sm hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {myClaim && (
                <div
                  className={`rounded border p-4 text-sm ${
                    myClaim.status === "accepted"
                      ? "border-green-300 bg-green-50"
                      : myClaim.status === "declined"
                        ? "border-gray-300 bg-gray-50"
                        : "border-yellow-300 bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">
                      Your claim request
                    </span>
                    <ClaimStatusBadge status={myClaim.status} />
                  </div>
                  {myClaim.status === "pending" && (
                    <p className="mt-2 text-gray-700">
                      Sent — the poster will review it and accept or decline.
                    </p>
                  )}
                  {myClaim.status === "accepted" && (
                    <p className="mt-2 text-gray-700">
                      Accepted! 🎉 Contact the poster to arrange the handover.
                    </p>
                  )}
                  {myClaim.status === "declined" && (
                    <div className="mt-2">
                      <p className="text-gray-700">
                        Declined
                        {itemOpen
                          ? " — you can send a new request with more proof."
                          : " — this item is no longer open."}
                      </p>
                      {itemOpen && (
                        <button
                          onClick={() => {
                            setMyClaim(null);
                            setClaimFormOpen(true);
                          }}
                          className="mt-2 rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700"
                        >
                          Claim again with more details
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!itemOpen && !myClaim && (
                <p className="text-sm text-gray-500">
                  This item is {item.status} and no longer open for claims.
                </p>
              )}
            </div>
          )}

          {/* Week 3: claim requests for the poster */}
          {isOwner && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold">
                Claim requests ({claims.length})
              </h2>
              {claims.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">
                  No one has claimed this item yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {claims.map((claim) => (
                    <li
                      key={claim._id}
                      className="rounded border bg-gray-50 p-4 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">
                            {claim.claimer?.name || "Unknown"}
                          </span>
                          <span className="ml-2 text-xs text-gray-500">
                            {new Date(claim.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <ClaimStatusBadge status={claim.status} />
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-gray-700">
                        “{claim.message}”
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        {claim.claimer?.email && (
                          <a
                            href={`mailto:${claim.claimer.email}?subject=CampusKhoj: ${item.title}`}
                            className="text-blue-600 hover:underline"
                          >
                            {claim.claimer.email}
                          </a>
                        )}
                        {claim.status === "pending" && itemOpen && (
                          <>
                            <button
                              onClick={() =>
                                handleClaimDecision(claim._id, "accepted")
                              }
                              className="ml-auto rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleClaimDecision(claim._id, "declined")
                              }
                              className="rounded border px-3 py-1 hover:bg-gray-100"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {pendingClaims.length > 0 && !itemOpen && (
                <p className="mt-2 text-sm text-gray-500">
                  This item is {item.status} — claims are closed.
                </p>
              )}
            </div>
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
