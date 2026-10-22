import { Routes, Route, Link } from "react-router-dom";

// Week 1 skeleton — pages will be added step by step.
// TODO: Login/Register pages, items feed, post-item form, item detail, My Posts.
function Home() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-4xl font-bold">CampusKhoj</h1>
      <p className="mt-4 text-lg text-gray-600">
        Lost something on campus? Found something that is not yours? Post it
        here and help it get back to its owner.
      </p>
      <p className="mt-8 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
        Week 1 in progress: authentication pages and the items feed are under
        development.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold">
            🎒 CampusKhoj
          </Link>
          <div className="space-x-4 text-sm">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            {/* TODO: Login / Register / Post Item links */}
          </div>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}
