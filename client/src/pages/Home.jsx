import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

function ItemCard({ item }) {
  const isLost = item.type === "lost";
  return (
    <Link
      to={`/items/${item._id}`}
      className="overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
    >
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-40 w-full object-cover"
        />
      )}
      <div className="p-4">
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
          <span className="text-xs text-gray-500">
            {new Date(item.date).toLocaleDateString()}
          </span>
        </div>
        <h3 className="mt-2 font-semibold">{item.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
          {item.description}
        </p>
        <p className="mt-2 text-xs text-gray-500">
          📍 {item.location} • {item.category} • Status: {item.status}
        </p>
      </div>
    </Link>
  );
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search) params.search = search;
      if (type) params.type = type;
      const data = await api.getItems(params);
      setItems(data);
    } catch (err) {
      setError("Could not load items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold">CampusKhoj</h1>
        <p className="mt-3 text-lg text-gray-600">
          Lost something on campus? Found something that is not yours? Post it
          here and help it get back to its owner.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="mt-8 flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items (e.g. earbuds, ID card)"
          className="flex-1 rounded border px-3 py-2"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="">All types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        <button
          type="submit"
          className="rounded bg-gray-900 px-5 py-2 text-white hover:bg-gray-700"
        >
          Search
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-10 text-center text-gray-500">Loading items...</p>
      ) : items.length === 0 ? (
        <p className="mt-10 text-center text-gray-500">
          No items posted yet. Be the first one to post.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
