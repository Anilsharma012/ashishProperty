import { useState } from "react";
import { Search, Heart, Menu, MapPin, ChevronDown, User, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function OLXStyleHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLocationClick = () => {
    // Location selector logic here
    console.log("Location selector clicked");
  };

  const handleFavoritesClick = () => {
    window.location.href = "/favorites";
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-[#C70000] border-b border-red-800 sticky top-0 z-40">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Menu Button */}
          <button
            onClick={handleMenuClick}
            className="p-2 hover:bg-red-700 rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6 text-white" />
          </button>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-white">AASHISH</span>
              <span className="text-white"> PROPERTY</span>
            </div>
          </div>

          {/* Location */}
          <button
            onClick={handleLocationClick}
            className="flex items-center space-x-1 text-white hover:bg-red-700 px-2 py-1 rounded-lg transition-colors"
          >
            <MapPin className="h-4 w-4 text-white" />
            <span className="text-sm font-medium">India</span>
            <ChevronDown className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search 'Properties'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border-2 border-white border-opacity-30 rounded-lg focus:border-white focus:outline-none text-white placeholder-white placeholder-opacity-70 bg-white bg-opacity-20 backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={handleFavoritesClick}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <Heart className="h-5 w-5 text-white opacity-70" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsMenuOpen(false)}>
          <div className="bg-white w-80 h-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            <nav className="space-y-2">
              <a href="/" className="block px-4 py-3 hover:bg-gray-100 rounded-lg text-gray-700">
                Home
              </a>
              <a href="/categories" className="block px-4 py-3 hover:bg-gray-100 rounded-lg text-gray-700">
                Categories
              </a>
              <a href="/post-property" className="block px-4 py-3 hover:bg-gray-100 rounded-lg text-gray-700">
                Sell
              </a>
              {isAuthenticated ? (
                <>
                  <a href="/user-dashboard" className="block px-4 py-3 hover:bg-gray-100 rounded-lg text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    My Dashboard
                  </a>
                  <a href="/favorites" className="block px-4 py-3 hover:bg-gray-100 rounded-lg text-gray-700">
                    Favorites
                  </a>
                  <a href="/chat" className="block px-4 py-3 hover:bg-gray-100 rounded-lg text-gray-700">
                    Chat
                  </a>
                </>
              ) : (
                <a href="/my-account" className="block px-4 py-3 hover:bg-gray-100 rounded-lg text-gray-700">
                  My Account
                </a>
              )}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm text-gray-600">
                    Welcome, {user?.name}!
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                      window.location.href = "/";
                    }}
                    className="w-full text-left px-4 py-3 text-[#C70000] font-semibold hover:bg-red-50 rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <a href="/user-login" className="block px-4 py-3 text-[#C70000] font-semibold hover:bg-red-50 rounded-lg">
                  Login / Sign Up
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
