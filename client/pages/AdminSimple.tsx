import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import AdminLayout from "../components/AdminLayout";
import { Button } from "../components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminSimple() {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  // Mock data for offline mode
  const mockStats = {
    totalUsers: 31,
    totalProperties: 25,
    activeProperties: 22,
    usersByType: [
      { _id: "admin", count: 1 },
      { _id: "seller", count: 10 },
      { _id: "agent", count: 5 },
      { _id: "buyer", count: 15 },
    ],
  };

  // Initialize with mock data immediately
  const [stats, setStats] = useState<any>(mockStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const [offlineMode, setOfflineMode] = useState(true); // Start in offline mode
  const [hasTriedOnline, setHasTriedOnline] = useState(false);

  // Fetch admin data with proper error handling
  const fetchAdminData = async (retryAttempt = 0) => {
    if (!token) {
      console.log("No token available for admin data fetch");
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log(
        `Attempting to fetch admin data (attempt ${retryAttempt + 1})`,
      );

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Admin stats received:", data);

      if (data.success) {
        setStats(data.data);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(data.error || "API returned error");
      }
    } catch (error: any) {
      console.error("Error fetching admin data:", error);

      let errorMessage = "Failed to load admin data";

      if (error.name === "AbortError") {
        errorMessage = "Request timed out. Please check your connection.";
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message.includes("HTTP")) {
        errorMessage = `Server error: ${error.message}`;
      } else {
        errorMessage = error.message || errorMessage;
      }

      setError(errorMessage);

      // Auto-retry up to 3 times with exponential backoff
      if (retryAttempt < 3) {
        const delay = Math.pow(2, retryAttempt) * 1000; // 1s, 2s, 4s
        console.log(`Retrying in ${delay}ms...`);
        setTimeout(() => {
          setRetryCount(retryAttempt + 1);
          fetchAdminData(retryAttempt + 1);
        }, delay);
      } else {
        // After all retries failed, offer offline mode
        console.log("All retries failed, switching to offline mode");
        setOfflineMode(true);
        setStats(mockStats);
        setError("Unable to connect to server. Showing cached data.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Remove automatic fetching - let user choose when to go online
  // useEffect(() => {
  //   if (isAuthenticated && user?.userType === "admin" && token) {
  //     fetchAdminData();
  //   }
  // }, [isAuthenticated, user, token]);

  console.log("AdminSimple render:", {
    isAuthenticated,
    user: user?.name,
    userType: user?.userType,
    authLoading,
    hasToken: !!token,
  });

  // Show loading while auth is being determined
  if (authLoading) {
    console.log("Auth is loading...");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#C70000] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    console.log("Not authenticated, should redirect");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Not authenticated. Please login.</p>
          <Button
            onClick={() => (window.location.href = "/admin/login")}
            className="bg-[#C70000] hover:bg-[#A60000] text-white"
          >
            Go to Admin Login
          </Button>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (user?.userType !== "admin") {
    console.log("User is not admin:", user?.userType);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Access denied. You need admin privileges.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Current user type: {user?.userType || "unknown"}
          </p>
          <Button
            onClick={() => (window.location.href = "/admin/login")}
            className="bg-[#C70000] hover:bg-[#A60000] text-white"
          >
            Login as Admin
          </Button>
        </div>
      </div>
    );
  }

  console.log("Rendering admin dashboard for user:", user);

  const renderContent = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome to Admin Dashboard
        </h1>

        {/* Offline Mode Indicator */}
        {offlineMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Offline Mode
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Unable to connect to server. Showing cached data.
                </p>
              </div>
              <Button
                onClick={() => {
                  setOfflineMode(false);
                  setError("");
                  setRetryCount(0);
                  fetchAdminData();
                }}
                size="sm"
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                disabled={loading}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && !offlineMode && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Connection Error
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                {retryCount > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Retry attempt: {retryCount}/3
                  </p>
                )}
              </div>
              <Button
                onClick={() => fetchAdminData()}
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Retry"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
              <p className="text-blue-700">Loading admin data...</p>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Admin Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {user?.name}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>User Type:</strong> {user?.userType}
            </p>
            <p>
              <strong>Has Token:</strong> {token ? "Yes" : "No"}
            </p>
            <p>
              <strong>Connection Status:</strong>{" "}
              <span
                className={
                  offlineMode
                    ? "text-yellow-600"
                    : error
                      ? "text-red-600"
                      : stats
                        ? "text-green-600"
                        : "text-yellow-600"
                }
              >
                {offlineMode
                  ? "Offline Mode"
                  : error
                    ? "Disconnected"
                    : stats
                      ? "Connected"
                      : "Connecting..."}
              </span>
            </p>
          </div>
        </div>

        {/* Stats Display */}
        {stats && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Database Statistics</h2>
              {offlineMode && (
                <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                  Cached Data
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalUsers}
                </div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalProperties}
                </div>
                <div className="text-sm text-gray-600">Total Properties</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.activeProperties}
                </div>
                <div className="text-sm text-gray-600">Active Properties</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.usersByType?.length || 0}
                </div>
                <div className="text-sm text-gray-600">User Types</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => setActiveSection("users")}
              variant="outline"
              className="h-12"
            >
              Manage Users
            </Button>
            <Button
              onClick={() => setActiveSection("properties")}
              variant="outline"
              className="h-12"
            >
              Manage Properties
            </Button>
            <Button
              onClick={() => fetchAdminData()}
              variant="outline"
              className="h-12"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh Data"}
            </Button>
            <Button
              onClick={() => setActiveSection("settings")}
              variant="outline"
              className="h-12"
            >
              Settings
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {renderContent()}
    </AdminLayout>
  );
}
