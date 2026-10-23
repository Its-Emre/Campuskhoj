import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold">
          🎒 CampusKhoj
        </Link>

        <div className="flex items-center space-x-4 text-sm">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          {user ? (
            <>
              <Link
                to="/post"
                className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
              >
                Post Item
              </Link>
              <Link to="/myposts" className="hover:underline">
                My Posts
              </Link>
              <span className="text-gray-600">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="rounded bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
