import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  CreditCard,
  Eye,
  Filter,
  Search,
  Download,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface Transaction {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  type: "package_purchase" | "listing_fee" | "featured_upgrade" | "refund";
  status: "pending" | "completed" | "failed" | "cancelled";
  paymentMethod: "upi" | "card" | "netbanking" | "wallet";
  transactionId: string;
  packageId?: string;
  packageName?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentTransactions() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, [token, pagination.page, selectedStatus, selectedType]);

  const fetchTransactions = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      // Mock data for demonstration
      const mockTransactions: Transaction[] = [
        {
          _id: "1",
          userId: "user1",
          userName: "Rajesh Kumar",
          userEmail: "rajesh@example.com",
          amount: 599,
          type: "package_purchase",
          status: "completed",
          paymentMethod: "upi",
          transactionId: "TXN001234567890",
          packageId: "pkg1",
          packageName: "Premium Listing Package",
          description: "Premium listing package for 30 days",
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
        },
        {
          _id: "2",
          userId: "user2",
          userName: "Priya Sharma",
          userEmail: "priya@example.com",
          amount: 299,
          type: "featured_upgrade",
          status: "completed",
          paymentMethod: "card",
          transactionId: "TXN001234567891",
          packageId: "pkg2",
          packageName: "Featured Listing",
          description: "Upgrade to featured listing",
          createdAt: "2024-01-14T15:45:00Z",
          updatedAt: "2024-01-14T15:45:00Z",
        },
        {
          _id: "3",
          userId: "user3",
          userName: "Amit Singh",
          userEmail: "amit@example.com",
          amount: 199,
          type: "listing_fee",
          status: "pending",
          paymentMethod: "netbanking",
          transactionId: "TXN001234567892",
          description: "Property listing fee",
          createdAt: "2024-01-14T09:20:00Z",
          updatedAt: "2024-01-14T09:20:00Z",
        },
        {
          _id: "4",
          userId: "user4",
          userName: "Sunita Devi",
          userEmail: "sunita@example.com",
          amount: 599,
          type: "package_purchase",
          status: "failed",
          paymentMethod: "upi",
          transactionId: "TXN001234567893",
          packageId: "pkg1",
          packageName: "Premium Listing Package",
          description: "Premium listing package purchase failed",
          createdAt: "2024-01-13T14:10:00Z",
          updatedAt: "2024-01-13T14:10:00Z",
        },
        {
          _id: "5",
          userId: "user5",
          userName: "Vikash Yadav",
          userEmail: "vikash@example.com",
          amount: 299,
          type: "refund",
          status: "completed",
          paymentMethod: "upi",
          transactionId: "TXN001234567894",
          description: "Refund for cancelled listing",
          createdAt: "2024-01-12T11:30:00Z",
          updatedAt: "2024-01-12T11:30:00Z",
        },
      ];

      setTransactions(mockTransactions);
      setPagination({
        page: 1,
        limit: 20,
        total: mockTransactions.length,
        pages: 1,
      });

    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-600" />;
      case "cancelled": return <XCircle className="h-4 w-4 text-gray-600" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "package_purchase": return "bg-blue-100 text-blue-800";
      case "featured_upgrade": return "bg-purple-100 text-purple-800";
      case "listing_fee": return "bg-orange-100 text-orange-800";
      case "refund": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || transaction.status === selectedStatus;
    const matchesType = selectedType === "all" || transaction.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    totalTransactions: transactions.length,
    totalRevenue: transactions.filter(t => t.status === "completed" && t.type !== "refund").reduce((sum, t) => sum + t.amount, 0),
    pendingTransactions: transactions.filter(t => t.status === "pending").length,
    failedTransactions: transactions.filter(t => t.status === "failed").length,
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-[#C70000] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setError("");
              fetchTransactions();
            }}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Payment Transactions</h3>
          <p className="text-gray-600">Monitor and manage all payment transactions</p>
        </div>
        <Button className="bg-[#C70000] hover:bg-[#A60000]">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedTransactions}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Transaction Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="package_purchase">Package Purchase</SelectItem>
            <SelectItem value="featured_upgrade">Featured Upgrade</SelectItem>
            <SelectItem value="listing_fee">Listing Fee</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell className="font-medium">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {transaction.transactionId}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{transaction.userName}</p>
                      <p className="text-sm text-gray-500">{transaction.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">₹{transaction.amount}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getTypeColor(transaction.type)}
                    >
                      {transaction.type.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transaction.status)}
                      <Badge
                        variant="outline"
                        className={getStatusColor(transaction.status)}
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">{transaction.paymentMethod}</span>
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Transaction Details</DialogTitle>
                        </DialogHeader>
                        {selectedTransaction && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="font-semibold">Transaction ID:</label>
                                <p className="font-mono text-sm">{selectedTransaction.transactionId}</p>
                              </div>
                              <div>
                                <label className="font-semibold">Amount:</label>
                                <p className="text-lg font-bold">₹{selectedTransaction.amount}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="font-semibold">User:</label>
                                <p>{selectedTransaction.userName}</p>
                                <p className="text-sm text-gray-500">{selectedTransaction.userEmail}</p>
                              </div>
                              <div>
                                <label className="font-semibold">Payment Method:</label>
                                <p className="capitalize">{selectedTransaction.paymentMethod}</p>
                              </div>
                            </div>
                            <div>
                              <label className="font-semibold">Description:</label>
                              <p className="mt-1 p-3 bg-gray-50 rounded-lg">
                                {selectedTransaction.description}
                              </p>
                            </div>
                            {selectedTransaction.packageName && (
                              <div>
                                <label className="font-semibold">Package:</label>
                                <p>{selectedTransaction.packageName}</p>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="font-semibold">Created:</label>
                                <p>{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                              </div>
                              <div>
                                <label className="font-semibold">Updated:</label>
                                <p>{new Date(selectedTransaction.updatedAt).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
