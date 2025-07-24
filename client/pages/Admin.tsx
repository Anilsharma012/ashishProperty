import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import AdminLayout from "../components/AdminLayout";
import {
  BarChart3,
  Users,
  Package,
  CreditCard,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Check,
  X,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import PackageManagement from "../components/admin/PackageManagement";
import TestimonialManagement from "../components/admin/TestimonialManagement";
import FAQManagement from "../components/admin/FAQManagement";
import UserManagement from "../components/admin/UserManagement";
import PropertyManagement from "../components/admin/PropertyManagement";
import CategoryManagement from "../components/admin/CategoryManagement";
import AdvertisementListingPackage from "../components/admin/AdvertisementListingPackage";
import FeatureAdvertisementPackage from "../components/admin/FeatureAdvertisementPackage";
import UserPackagesManagement from "../components/admin/UserPackagesManagement";
import PropertyImageManager from "../components/admin/PropertyImageManager";
import PaymentTransactions from "../components/admin/PaymentTransactions";
import BankTransferManagement from "../components/admin/BankTransferManagement";
import SellerVerificationFields from "../components/admin/SellerVerificationFields";
import PendingPropertiesApproval from "../components/admin/PendingPropertiesApproval";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export default function Admin() {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to admin login");
      window.location.href = "/admin/login";
      return;
    }

    // Check if user is admin
    if (user?.userType !== "admin") {
      console.log(
        "User is not admin:",
        user?.userType,
        "redirecting to admin login",
      );
      window.location.href = "/admin/login";
      return;
    }

    console.log("Admin user authenticated, fetching data");
    // Fetch admin data
    fetchAdminData();
  }, [isAuthenticated, user, token, authLoading]);

  const fetchAdminData = async () => {
    if (!token) {
      console.log("No token available for admin data fetch");
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log(
        "Fetching admin data with token:",
        token.substring(0, 20) + "...",
      );

      // Fetch stats
      console.log("Fetching admin stats...");
      const statsResponse = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log("Stats data received:", statsData);
        if (statsData.success) {
          setStats(statsData.data);
        } else {
          console.error("Stats fetch failed:", statsData.error);
        }
      } else {
        console.error(
          "Stats response not ok:",
          statsResponse.status,
          statsResponse.statusText,
        );
      }

      // Fetch users
      console.log("Fetching admin users...");
      const usersResponse = await fetch("/api/admin/users?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log("Users data received:", usersData);
        if (usersData.success) {
          setUsers(usersData.data.users);
        } else {
          console.error("Users fetch failed:", usersData.error);
        }
      } else {
        console.error(
          "Users response not ok:",
          usersResponse.status,
          usersResponse.statusText,
        );
      }

      // Fetch properties
      console.log("Fetching admin properties...");
      const propertiesResponse = await fetch("/api/admin/properties?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json();
        console.log("Properties data received:", propertiesData);
        if (propertiesData.success) {
          setProperties(propertiesData.data.properties);
        } else {
          console.error("Properties fetch failed:", propertiesData.error);
        }
      } else {
        console.error(
          "Properties response not ok:",
          propertiesResponse.status,
          propertiesResponse.statusText,
        );
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setError("Failed to load admin data. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#C70000] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.userType !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting to admin login...</p>
          <div className="animate-spin w-6 h-6 border-2 border-[#C70000] border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setError("");
              fetchAdminData();
            }}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-[#C70000] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registered users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Listings
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.activeProperties || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active properties
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Properties
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalProperties || 0}
                </div>
                <p className="text-xs text-muted-foreground">All properties</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  User Types
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.usersByType?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Different user types
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.slice(0, 5).map((user, i) => (
                <div key={user._id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-[#C70000] rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      {user.email} • {user.userType}
                    </p>
                  </div>
                  <Badge
                    variant={user.status === "active" ? "default" : "outline"}
                    className={
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : ""
                    }
                  >
                    {user.status || "New"}
                  </Badge>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-gray-500 text-sm">No users found</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: "Seller Verification", count: 12 },
                { type: "Advertisement Request", count: 5 },
                { type: "User Reports", count: 3 },
                { type: "Bank Transfers", count: 8 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{item.type}</p>
                  <Badge variant="destructive">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAdsListing = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Advertisement Listings</h3>
        <Button className="bg-[#C70000] hover:bg-[#A60000]">
          <Plus className="h-4 w-4 mr-2" />
          Add Advertisement
        </Button>
      </div>

      <div className="flex space-x-4">
        <Input placeholder="Search advertisements..." className="max-w-sm" />
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.slice(0, 10).map((property) => (
            <TableRow key={property._id}>
              <TableCell className="font-medium">{property.title}</TableCell>
              <TableCell className="capitalize">
                {property.propertyType}
              </TableCell>
              <TableCell>{property.contactInfo?.name || "Unknown"}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    property.status === "active"
                      ? "bg-green-100 text-green-800"
                      : property.status === "sold"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }
                >
                  {property.status}
                </Badge>
              </TableCell>
              <TableCell>₹{(property.price / 100000).toFixed(1)}L</TableCell>
              <TableCell>
                {new Date(property.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {properties.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500">
                No properties found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderSellerVerification = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Seller Verification Requests</h3>
        <Badge variant="destructive">12 Pending</Badge>
      </div>

      <div className="grid gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="font-medium">S{i}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Seller {i}</h4>
                    <p className="text-sm text-gray-600">
                      seller{i}@example.com
                    </p>
                    <p className="text-sm text-gray-600">+91 98765 4321{i}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Submitted 2 days ago
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600">
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderUserReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">User Reports</h3>
        <Badge variant="destructive">3 New</Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reporter</TableHead>
            <TableHead>Reported User</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3].map((i) => (
            <TableRow key={i}>
              <TableCell>User {i}</TableCell>
              <TableCell>Seller {i + 5}</TableCell>
              <TableCell>Inappropriate Content</TableCell>
              <TableCell>
                <Badge variant="outline">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              </TableCell>
              <TableCell>2024-01-{15 + i}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderGenericSection = (title: string, description: string) => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        <Button className="bg-[#C70000] hover:bg-[#A60000]">
          <Plus className="h-4 w-4 mr-2" />
          Get Started
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard();
      case "ads-listing":
        return <PropertyManagement />;
      case "seller-verification":
        return renderSellerVerification();
      case "user-reports":
        return <TestimonialManagement />;
      case "categories":
        return <CategoryManagement />;
      case "custom-fields":
        return <CategoryManagement />;
      case "ad-management":
        return <PropertyImageManager />;
      case "ad-requested":
        return <PropertyManagement />;
      case "pending-approval":
        return <PendingPropertiesApproval />;
      case "ad-tips":
        return <FAQManagement />;
      case "package-management":
        return <PackageManagement />;
      case "listing-package":
        return <AdvertisementListingPackage />;
      case "feature-package":
        return <FeatureAdvertisementPackage />;
      case "user-packages":
        return <UserPackagesManagement />;
      case "transactions":
        return <PaymentTransactions />;
      case "bank-transfer":
        return <BankTransferManagement />;
      case "seller-management":
        return <UserManagement />;
      case "verification-fields":
        return <SellerVerificationFields />;
      case "seller-review":
        return <TestimonialManagement />;
      case "seller-review-report":
        return <TestimonialManagement />;
      case "slider":
        return <PropertyManagement />;
      case "feature-section":
        return <PropertyManagement />;
      case "countries":
        return <CategoryManagement />;
      case "states":
        return <CategoryManagement />;
      case "cities":
        return <CategoryManagement />;
      case "areas":
        return <CategoryManagement />;
      case "report-reasons":
        return <TestimonialManagement />;
      case "send-notification":
        return <UserManagement />;
      case "customers":
        return <UserManagement />;
      case "role":
        return <UserManagement />;
      case "staff-management":
        return <UserManagement />;
      case "blog-management":
        return <FAQManagement />;
      case "blogs":
        return <FAQManagement />;
      case "faq":
        return <FAQManagement />;
      case "faqs":
        return <FAQManagement />;
      case "web-queries":
        return <TestimonialManagement />;
      case "settings":
        return <UserManagement />;
      case "system-update":
        return <PropertyManagement />;
      default:
        return renderDashboard();
    }
  };

  try {
    return (
      <AdminLayout
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      >
        {renderContent()}
      </AdminLayout>
    );
  } catch (error) {
    console.error("Error rendering admin page:", error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Error Loading Admin Panel
          </h2>
          <p className="text-gray-600 mb-4">
            An error occurred while loading the admin panel.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#C70000] hover:bg-[#A60000] text-white"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }
}
