import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import AdminLayout from "../components/AdminLayout";
import AdminCategories from "../components/AdminCategories";
import AdminBanners from "../components/AdminBanners";
import AdminProperties from "../components/AdminProperties";
import AdminUsers from "../components/AdminUsers";
import DatabaseStatus from "../components/DatabaseStatus";
import { Button } from "../components/ui/button";
import {
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
} from "lucide-react";
import { adminApi } from "../lib/api";
import {
  runApiDiagnostics,
  DiagnosticResult,
  EnvironmentInfo,
} from "../utils/api-diagnostics";

export default function AdminOffline() {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isOnline, setIsOnline] = useState(false);
  const [diagnostics, setDiagnostics] = useState<{
    environment: EnvironmentInfo;
    tests: DiagnosticResult[];
    recommendations: string[];
  } | null>(null);

  // Mock data that works offline
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

  const [stats, setStats] = useState(mockStats);

  console.log("AdminOffline render:", {
    isAuthenticated,
    user: user?.name,
    userType: user?.userType,
    authLoading,
    hasToken: !!token,
    isOnline,
  });

  // Auto-connect when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && token && user?.userType === "admin" && !isOnline) {
      console.log("🚀 Auto-connecting to MongoDB Atlas...");
      tryConnectToServer();
    }
  }, [isAuthenticated, token, user?.userType]);

  // Show loading while auth is being determined
  if (authLoading) {
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

  // Attempt to fetch real data with multiple fallback strategies
  const tryConnectToServer = async () => {
    if (!token) {
      setError("No authentication token available");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("🔄 Attempting to connect to server...");
      console.log("🌐 Current URL:", window.location.href);
      console.log("🔧 User Agent:", navigator.userAgent);
      console.log("🌐 Connection:", navigator.onLine ? "Online" : "Offline");

      // Run comprehensive API diagnostics
      console.log("🔍 Running API diagnostics...");
      const diagnosticResult = await runApiDiagnostics();
      setDiagnostics(diagnosticResult);

      console.log("📄 Diagnostic Results:", diagnosticResult);

      // Check if any API endpoint is working
      const workingEndpoints = diagnosticResult.tests.filter(
        (t) => t.status === "success",
      );

      if (workingEndpoints.length === 0) {
        const timeoutCount = diagnosticResult.tests.filter(
          (t) => t.status === "timeout",
        ).length;
        const errorCount = diagnosticResult.tests.filter(
          (t) => t.status === "failure",
        ).length;

        if (timeoutCount > 0) {
          throw new Error(
            `All ${timeoutCount} API endpoints timed out. Server may be starting up or overloaded.`,
          );
        } else if (errorCount > 0) {
          throw new Error(
            `All ${errorCount} API endpoints returned errors. Server configuration issue.`,
          );
        } else {
          throw new Error(
            "No API endpoints could be reached. Network connectivity issue.",
          );
        }
      }

      console.log(
        `✅ Found ${workingEndpoints.length} working API endpoint(s)`,
      );

      // Check if we're online first
      if (!navigator.onLine) {
        throw new Error("Device is offline - no internet connection");
      }

      // If health check passes, try to get admin stats
      console.log("📈 Fetching admin statistics...");
      const data = await adminApi.getStats(token);

      if (data.success) {
        setStats(data.data);
        setIsOnline(true);
        setError("");
        console.log("✅ Successfully connected and loaded admin statistics");
      } else {
        throw new Error(
          data.error || "Failed to fetch statistics from database",
        );
      }
    } catch (error: any) {
      console.error("❌ Connection failed:", {
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 200),
      });
      setIsOnline(false);

      // Provide specific error messages and always enable offline mode
      if (error.name === "AbortError" || error.message.includes("timeout")) {
        setError(
          "⏱️ Connection timeout - Server may be starting up or slow. Using offline data.",
        );
      } else if (
        error.message.includes("offline") ||
        error.message.includes("internet")
      ) {
        setError(
          "📵 Device is offline - Check your internet connection. Using cached data.",
        );
      } else if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("TypeError") ||
        error.message.includes("Network error")
      ) {
        setError(
          "🌐 Network connectivity issue - Server may be unreachable. Using offline data.",
        );
      } else if (
        error.message.includes("unauthorized") ||
        error.message.includes("authentication") ||
        error.message.includes("401")
      ) {
        setError("🔐 Authentication failed - Please login again");
      } else if (
        error.message.includes("500") ||
        error.message.includes("502") ||
        error.message.includes("503")
      ) {
        setError(
          "💥 Server error - Backend may be restarting. Using offline data.",
        );
      } else {
        setError(
          `⚠️ Connection issue: ${error.message.substring(0, 80)}... Using offline data.`,
        );
      }

      // Always provide mock data for offline functionality
      setStats(mockStats);
      console.log("💾 Using offline data for admin dashboard functionality");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (activeSection === "categories") {
      return <AdminCategories token={token!} />;
    }

    if (activeSection === "ad-management") {
      return <AdminBanners token={token!} />;
    }

    if (activeSection === "property-management") {
      return <AdminProperties token={token!} />;
    }

    if (activeSection === "user-management") {
      return <AdminUsers token={token!} />;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <div className="flex items-center space-x-2 text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium">Online</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-500">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm font-medium">Offline Mode</span>
              </div>
            )}
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-5 w-5 text-gray-600" />
              <div>
                <h3 className="font-medium">Database Connection</h3>
                <p className="text-sm text-gray-600">
                  {isOnline
                    ? "Connected to live database"
                    : "Using offline data - click to try connecting"}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={tryConnectToServer}
                disabled={loading}
                variant={isOnline ? "outline" : "default"}
                className={
                  isOnline ? "" : "bg-[#C70000] hover:bg-[#A60000] text-white"
                }
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : isOnline ? (
                  "Refresh"
                ) : (
                  "Connect"
                )}
              </Button>
              <Button
                onClick={async () => {
                  const result = await runApiDiagnostics();
                  setDiagnostics(result);
                  console.log("🔍 Manual diagnostics:", result);
                }}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                🔍 Diagnose
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-3 space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>

              {diagnostics && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium text-blue-800 mb-2">
                      🔍 API Diagnostics ({diagnostics.environment.environment})
                    </summary>
                    <div className="space-y-2 text-xs">
                      <div>
                        <strong>Environment:</strong>{" "}
                        {diagnostics.environment.hostname} (
                        {diagnostics.environment.environment})
                      </div>
                      <div>
                        <strong>Tests Run:</strong> {diagnostics.tests.length}
                      </div>
                      {diagnostics.tests.map((test, i) => (
                        <div
                          key={i}
                          className={`flex items-center space-x-1 ${
                            test.status === "success"
                              ? "text-green-700"
                              : test.status === "timeout"
                                ? "text-orange-700"
                                : "text-red-700"
                          }`}
                        >
                          <span>
                            {test.status === "success"
                              ? "✅"
                              : test.status === "timeout"
                                ? "⏱️"
                                : "❌"}
                          </span>
                          <span>
                            {test.endpoint} ({test.responseTime}ms)
                          </span>
                          {test.error && <span>- {test.error}</span>}
                        </div>
                      ))}
                      {diagnostics.recommendations.length > 0 && (
                        <div>
                          <strong>Recommendations:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {diagnostics.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Admin Information</h2>
          <div className="space-y-2 text-sm">
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
              <strong>Session:</strong> {token ? "Active" : "Inactive"}
            </p>
            <p>
              <strong>Data Source:</strong>{" "}
              {isOnline ? "Live Database" : "Offline Cache"}
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">System Statistics</h2>
            {!isOnline && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Cached Data
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalUsers}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalProperties}
              </div>
              <div className="text-sm text-gray-600">Total Properties</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.activeProperties}
              </div>
              <div className="text-sm text-gray-600">Active Properties</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {stats.usersByType?.length || 0}
              </div>
              <div className="text-sm text-gray-600">User Types</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => setActiveSection("users")}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center"
            >
              <span className="font-medium">Manage Users</span>
              <span className="text-xs text-gray-500">
                {stats.totalUsers} total
              </span>
            </Button>
            <Button
              onClick={() => setActiveSection("properties")}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center"
            >
              <span className="font-medium">Properties</span>
              <span className="text-xs text-gray-500">
                {stats.totalProperties} total
              </span>
            </Button>
            <Button
              onClick={tryConnectToServer}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center"
              disabled={loading}
            >
              <span className="font-medium">
                {loading ? "Connecting..." : "Sync Data"}
              </span>
              <span className="text-xs text-gray-500">
                {isOnline ? "Connected" : "Offline"}
              </span>
            </Button>
            <Button
              onClick={() => setActiveSection("settings")}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center"
            >
              <span className="font-medium">Settings</span>
              <span className="text-xs text-gray-500">Configure</span>
            </Button>
          </div>
        </div>

        {/* Database Status */}
        <DatabaseStatus token={token || undefined} />

        {/* System Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Authentication</span>
              <span className="text-green-600 font-medium">✓ Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Admin Access</span>
              <span className="text-green-600 font-medium">✓ Granted</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Database Connection</span>
              <span
                className={
                  isOnline
                    ? "text-green-600 font-medium"
                    : "text-yellow-600 font-medium"
                }
              >
                {isOnline ? "✓ Connected" : "⚠ Offline"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Data Availability</span>
              <span className="text-green-600 font-medium">✓ Available</span>
            </div>
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
