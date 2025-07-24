import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/Header";
import BottomNavigation from "../components/BottomNavigation";
import PackageSelection from "../components/PackageSelection";
import PaymentForm from "../components/PaymentForm";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  Star,
  Crown,
  BarChart3,
  Package,
  IndianRupee,
  Clock,
  AlertCircle,
  Home,
  Settings,
  LogOut,
  Users,
  Mail,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ROHTAK_AREAS } from "@shared/types";

interface Property {
  _id: string;
  title: string;
  price: number;
  priceType: "sale" | "rent";
  location: {
    address: string;
    area?: string;
  };
  propertyType: string;
  subCategory: string;
  status: "active" | "sold" | "rented" | "inactive";
  featured: boolean;
  packageId?: string;
  packageExpiry?: string;
  views: number;
  inquiries: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export default function SellerDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [properties, setProperties] = useState<Property[]>([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPackageSelection, setShowPackageSelection] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedPackagePrice, setSelectedPackagePrice] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== "seller") {
      window.location.href = "/login?type=seller";
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    await Promise.all([
      fetchProperties(),
      fetchTransactions(),
      fetchAnalytics(),
    ]);
    setLoading(false);
  };

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🏠 Fetching properties from MongoDB...");

      const response = await fetch("/api/properties", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        const userProperties = data.data.properties.filter(
          (property: any) => property.ownerId === user?._id,
        );
        setProperties(userProperties);
        console.log(
          `✅ Loaded ${userProperties.length} properties from database`,
        );
      } else {
        console.error("❌ Failed to load properties:", data.error);
      }
    } catch (error) {
      console.error("❌ Error fetching properties from MongoDB:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/payments/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data.transactions);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("📊 Fetching seller analytics from MongoDB...");

      const response = await fetch("/api/analytics/seller", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
        console.log("✅ Analytics loaded from database successfully");
      } else {
        console.error("❌ Failed to load analytics:", data.error);
      }
    } catch (error) {
      console.error("❌ Error fetching analytics from MongoDB:", error);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchProperties();
        alert("Property deleted successfully");
      } else {
        alert("Failed to delete property");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Failed to delete property");
    }
  };

  const handlePromoteProperty = (property: Property) => {
    setSelectedProperty(property);
    setShowPackageSelection(true);
  };

  const handlePackageSelect = async (packageId: string) => {
    try {
      const response = await fetch(`/api/packages/${packageId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedPackage(packageId);
        setSelectedPackagePrice(data.data.price);
        setShowPackageSelection(false);
        setShowPaymentForm(true);
      }
    } catch (error) {
      console.error("Error fetching package details:", error);
    }
  };

  const handlePaymentComplete = (transactionId: string) => {
    setShowPaymentForm(false);
    setSelectedProperty(null);
    setSelectedPackage(null);
    setSelectedPackagePrice(0);
    fetchDashboardData();
    alert(
      "Payment processed successfully! Your property package will be activated soon.",
    );
  };

  const getPackageStatus = (property: Property) => {
    if (!property.packageId) {
      return { type: "basic", status: "active", label: "Free" };
    }

    const expiry = new Date(property.packageExpiry || "");
    const now = new Date();

    if (expiry < now) {
      return { type: "expired", status: "expired", label: "Expired" };
    }

    return {
      type: property.featured ? "featured" : "basic",
      status: "active",
      label: property.featured ? "Featured" : "Basic",
      expiry: expiry,
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "sold":
        return "bg-blue-100 text-blue-800";
      case "rented":
        return "bg-purple-100 text-purple-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  if (!isAuthenticated || user?.userType !== "seller") {
    return null;
  }

  if (showPackageSelection) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-4">
          <div className="mb-4">
            <Button
              onClick={() => setShowPackageSelection(false)}
              variant="outline"
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <h2 className="text-xl font-bold mb-2">Promote Property</h2>
            <p className="text-gray-600">
              {selectedProperty?.title} - {selectedProperty?.location.address}
            </p>
          </div>
          <PackageSelection
            propertyId={selectedProperty?._id}
            onPackageSelect={handlePackageSelect}
          />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (showPaymentForm && selectedPackage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-4">
          <div className="mb-4">
            <Button
              onClick={() => {
                setShowPaymentForm(false);
                setSelectedPackage(null);
              }}
              variant="outline"
              className="mb-4"
            >
              ← Back to Packages
            </Button>
          </div>
          <PaymentForm
            packageId={selectedPackage}
            propertyId={selectedProperty?._id}
            amount={selectedPackagePrice}
            onPaymentComplete={handlePaymentComplete}
            onCancel={() => {
              setShowPaymentForm(false);
              setSelectedPackage(null);
            }}
          />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#C70000] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const totalViews = analytics?.totals?.totalViews || 0;
  const totalInquiries = analytics?.totals?.totalInquiries || 0;
  const activeProperties = properties.filter(
    (p) => p.status === "active",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#C70000] text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Seller Dashboard</h1>
            <p className="text-red-100">Welcome back, {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 bg-white bg-opacity-20 rounded-lg"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="flex overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: Home },
            { id: "properties", label: "Properties", icon: MapPin },
            { id: "packages", label: "Packages", icon: Package },
            { id: "transactions", label: "Payments", icon: IndianRupee },
            { id: "analytics", label: "Analytics", icon: BarChart3 },
            { id: "profile", label: "Profile", icon: Settings },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 font-medium whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? "border-[#C70000] text-[#C70000]"
                    : "border-transparent text-gray-600"
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Properties</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {properties.length}
                    </p>
                  </div>
                  <Home className="h-8 w-8 text-[#C70000]" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {activeProperties}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Views</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {totalViews}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Inquiries</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {totalInquiries}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => (window.location.href = "/post-property")}
                  className="bg-[#C70000] hover:bg-[#A60000] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("packages")}
                  className="border-[#C70000] text-[#C70000]"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Promote Properties
                </Button>
              </div>
            </div>

            {/* Recent Properties */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Properties
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("properties")}
                  className="text-[#C70000]"
                >
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {properties.slice(0, 3).map((property) => {
                  const packageStatus = getPackageStatus(property);
                  return (
                    <div
                      key={property._id}
                      className="flex items-center space-x-4 p-3 border rounded-lg"
                    >
                      <img
                        src={
                          property.images[0] ||
                          "https://via.placeholder.com/64x64?text=No+Image"
                        }
                        alt={property.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {property.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {property.location.address}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(property.status)}>
                            {property.status}
                          </Badge>
                          <Badge variant="outline">{packageStatus.label}</Badge>
                          <span className="text-sm text-gray-500">
                            {property.views} views
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#C70000]">
                          ₹{(property.price / 100000).toFixed(1)}L
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                My Properties ({properties.length})
              </h2>
              <Button
                onClick={() => (window.location.href = "/post-property")}
                className="bg-[#C70000] hover:bg-[#A60000] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>

            <div className="space-y-4">
              {properties.map((property) => {
                const packageStatus = getPackageStatus(property);
                return (
                  <div
                    key={property._id}
                    className="bg-white rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex space-x-4">
                      <img
                        src={
                          property.images[0] ||
                          "https://via.placeholder.com/96x96?text=No+Image"
                        }
                        alt={property.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {property.title}
                            </h3>
                            <p className="text-gray-600 flex items-center mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {property.location.address}
                            </p>
                            <p className="text-lg font-bold text-[#C70000] mt-2">
                              ₹{(property.price / 100000).toFixed(1)}L
                              {property.priceType === "rent" && "/month"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Badge className={getStatusColor(property.status)}>
                              {property.status}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="block text-center"
                            >
                              {packageStatus.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {property.views} views
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {property.inquiries} inquiries
                          </span>
                          <span>
                            Listed:{" "}
                            {new Date(property.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePromoteProperty(property)}
                            className="text-orange-600 border-orange-600"
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Promote
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProperty(property._id)}
                            className="text-red-600 border-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === "packages" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Promote Your Properties
              </h2>
              <p className="text-gray-600">
                Select a property to promote with our advertisement packages
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties
                .filter((p) => p.status === "active")
                .map((property) => {
                  const packageStatus = getPackageStatus(property);
                  return (
                    <div
                      key={property._id}
                      className="bg-white rounded-lg p-4 shadow-sm border"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={
                            property.images[0] ||
                            "https://via.placeholder.com/80x80?text=No+Image"
                          }
                          alt={property.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {property.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {property.location.address}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">
                              {packageStatus.label}
                            </Badge>
                            {packageStatus.expiry && (
                              <span className="text-xs text-gray-500">
                                Expires:{" "}
                                {packageStatus.expiry.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handlePromoteProperty(property)}
                        className="w-full mt-4 bg-[#C70000] hover:bg-[#A60000] text-white"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Promote This Property
                      </Button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Payment Transactions
            </h2>

            <div className="space-y-4">
              {transactions.map((transaction: any) => (
                <div
                  key={transaction._id}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {transaction.package?.[0]?.name || "Package"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {transaction.property?.[0]?.title || "Property"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{transaction.amount}</p>
                      <Badge
                        className={
                          transaction.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              {transactions.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Transactions Yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Purchase promotion packages to boost your property
                    visibility
                  </p>
                  <Button
                    onClick={() => setActiveTab("packages")}
                    className="bg-[#C70000] hover:bg-[#A60000] text-white"
                  >
                    View Packages
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Analytics & Performance
            </h2>

            {analytics ? (
              <>
                {/* Overall Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {analytics.totals.totalViews}
                      </p>
                      <p className="text-sm text-gray-600">Total Views</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {analytics.totals.totalInquiries}
                      </p>
                      <p className="text-sm text-gray-600">Total Inquiries</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {analytics.totals.totalPhoneClicks}
                      </p>
                      <p className="text-sm text-gray-600">Phone Clicks</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {analytics.totals.totalFavorites}
                      </p>
                      <p className="text-sm text-gray-600">Favorites</p>
                    </div>
                  </div>
                </div>

                {/* Property Performance */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Property Performance
                  </h3>
                  <div className="space-y-4">
                    {analytics.analytics.map((item: any) => {
                      const property = analytics.properties.find(
                        (p: any) => p._id === item._id,
                      );
                      return (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {property?.title || "Property"}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {property?.location?.address}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-lg font-bold text-blue-600">
                                {item.totalViews}
                              </p>
                              <p className="text-xs text-gray-500">Views</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-green-600">
                                {item.totalInquiries}
                              </p>
                              <p className="text-xs text-gray-500">Inquiries</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-purple-600">
                                {item.totalPhoneClicks}
                              </p>
                              <p className="text-xs text-gray-500">Calls</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Analytics Data
                </h3>
                <p className="text-gray-600">
                  Analytics will appear once your properties start receiving
                  views
                </p>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Profile Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <p className="text-gray-900">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <p className="text-gray-900">{user?.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Type
                </label>
                <Badge className="bg-blue-100 text-blue-800">
                  {user?.userType}
                </Badge>
              </div>
              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
