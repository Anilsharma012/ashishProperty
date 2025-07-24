import { useState, useEffect } from "react";
import {
  Plus,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Users,
  Home,
  Settings,
  LogOut,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useAuth } from "../hooks/useAuth";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: "buyer" | "seller";
  status: "active" | "closed" | "potential";
  assignedDate: string;
}

interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  type: string;
  status: "active" | "sold" | "rented";
  clientId: string;
  commission: number;
  views: number;
  image: string;
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "Amit Sharma",
    phone: "+91 98765 43210",
    email: "amit@email.com",
    type: "buyer",
    status: "active",
    assignedDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Priya Singh",
    phone: "+91 98765 43211",
    email: "priya@email.com",
    type: "seller",
    status: "active",
    assignedDate: "2024-01-10",
  },
  {
    id: "3",
    name: "Rajesh Kumar",
    phone: "+91 98765 43212",
    email: "rajesh@email.com",
    type: "buyer",
    status: "closed",
    assignedDate: "2024-01-05",
  },
];

const mockProperties: Property[] = [
  {
    id: "1",
    title: "3 BHK Luxury Apartment",
    price: 8500000,
    location: "Sector 12, Rohtak",
    type: "Apartment",
    status: "active",
    clientId: "2",
    commission: 170000,
    views: 245,
    image: "/placeholder.svg",
  },
  {
    id: "2",
    title: "2 BHK Builder Floor",
    price: 6500000,
    location: "Sector 15, Rohtak",
    type: "Builder Floor",
    status: "sold",
    clientId: "3",
    commission: 130000,
    views: 156,
    image: "/placeholder.svg",
  },
];

export default function AgentDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [properties, setProperties] = useState<Property[]>(mockProperties);

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== "agent") {
      window.location.href = "/login?type=agent";
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  if (!isAuthenticated || user?.userType !== "agent") {
    return null;
  }

  const getClientStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-blue-100 text-blue-800";
      case "potential":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalCommission = properties
    .filter((p) => p.status === "sold")
    .reduce((sum, p) => sum + p.commission, 0);
  const activeClients = clients.filter((c) => c.status === "active").length;
  const totalProperties = properties.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#C70000] text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Agent Dashboard</h1>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-red-100">{user?.name}</p>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-300 fill-current" />
                <span className="text-red-100 text-sm ml-1">4.8</span>
              </div>
            </div>
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
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "clients", label: "Clients", icon: Users },
            { id: "properties", label: "Properties", icon: MapPin },
            { id: "commissions", label: "Commissions", icon: DollarSign },
            { id: "calendar", label: "Calendar", icon: Calendar },
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
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Active Clients</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {activeClients}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-[#C70000]" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Properties</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {totalProperties}
                    </p>
                  </div>
                  <Home className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Commission</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{(totalCommission / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Rating</p>
                    <p className="text-2xl font-bold text-yellow-600">4.8</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
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
                  onClick={() => setActiveTab("clients")}
                  className="bg-[#C70000] hover:bg-[#A60000] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("properties")}
                  className="border-[#C70000] text-[#C70000]"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Manage Properties
                </Button>
              </div>
            </div>

            {/* Recent Clients */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Clients
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("clients")}
                  className="text-[#C70000]"
                >
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {clients.slice(0, 3).map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#C70000] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {client.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {client.name}
                        </h3>
                        <p className="text-sm text-gray-600">{client.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getClientStatusColor(client.status)}>
                        {client.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === "clients" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                My Clients
              </h2>
              <Button className="bg-[#C70000] hover:bg-[#A60000] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </div>

            <div className="flex space-x-4">
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="potential">Potential</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="buyer">Buyers</SelectItem>
                  <SelectItem value="seller">Sellers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#C70000] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {client.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {client.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {client.phone}
                          </span>
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {client.email}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge
                            className={getClientStatusColor(client.status)}
                          >
                            {client.status}
                          </Badge>
                          <Badge variant="outline">
                            {client.type === "buyer" ? "Buyer" : "Seller"}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Since {client.assignedDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Client Properties
              </h2>
              <Button className="bg-[#C70000] hover:bg-[#A60000] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>

            <div className="space-y-4">
              {properties.map((property) => {
                const client = clients.find((c) => c.id === property.clientId);
                return (
                  <div
                    key={property.id}
                    className="bg-white rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex space-x-4">
                      <img
                        src={property.image}
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
                              {property.location}
                            </p>
                            <p className="text-lg font-bold text-[#C70000] mt-2">
                              ₹{(property.price / 100000).toFixed(1)}L
                            </p>
                          </div>
                          <Badge
                            className={
                              property.status === "sold"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }
                          >
                            {property.status}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                          <span>Client: {client?.name}</span>
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {property.views} views
                          </span>
                          <span className="text-green-600 font-medium">
                            Commission: ₹
                            {(property.commission / 1000).toFixed(0)}K
                          </span>
                        </div>

                        <div className="flex space-x-2 mt-4">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-1" />
                            Contact Client
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

        {/* Other tabs placeholders */}
        {activeTab === "commissions" && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Commission Tracking
            </h2>
            <p className="text-gray-600">
              Commission tracking and payment features coming soon...
            </p>
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Appointment Calendar
            </h2>
            <p className="text-gray-600">
              Calendar and appointment management features coming soon...
            </p>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Agent Profile
            </h2>
            <p className="text-gray-600">
              Profile management features coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
