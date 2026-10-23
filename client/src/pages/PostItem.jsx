import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "electronics",
  "id-card",
  "keys",
  "clothing",
  "books",
  "accessories",
  "other",
];

export default function PostItem() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "lost",
    category: "other",
    location: "",
    date: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file || null);
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.description.trim() || !form.location.trim() || !form.date) {
      setError("Title, description, location and date are required.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("type", form.type);
      formData.append("category", form.category);
      formData.append("location", form.location.trim());
      formData.append("date", form.date);
      if (image) formData.append("image", image);

      const item = await api.createItem(formData);
      navigate(`/items/${item._id}`);
    } catch (err) {
      setError(err.message || "Could not post the item. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full rounded border px-3 py-2";
  const labelClass = "mb-1 block text-sm font-medium text-gray-700";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Post an item</h1>
      <p className="mt-2 text-gray-600">
        Lost something, or found something that is not yours? Add it here.
      </p>

      {error && (
        <p className="mt-6 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className={labelClass}>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Black HP laptop charger"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Identifying details that help prove ownership..."
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Location on campus</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. CSE block, Room 204"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              {form.type === "lost" ? "Date lost" : "Date found"}
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Photo (optional, max 2 MB)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="w-full text-sm text-gray-600"
          />
          {preview && (
            <img
              src={preview}
              alt="Upload preview"
              className="mt-3 h-48 w-full rounded border object-cover"
            />
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-gray-900 px-6 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post item"}
          </button>
          <Link
            to="/"
            className="rounded border px-6 py-2 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
