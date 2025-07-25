import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  Building2,
  Eye,
  Check,
  X,
  Clock,
  Filter,
  Search,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
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

interface BankTransfer {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  referenceNumber: string;
  bankName: string;
  accountHolderName: string;
  transactionDate: string;
  status: "pending" | "verified" | "rejected";
  proofDocument?: string;
  remarks?: string;
  verifiedBy?: string;
  verificationDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BankTransferManagement() {
  const { token } = useAuth();
  const [transfers, setTransfers] = useState<BankTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTransfer, setSelectedTransfer] = useState<BankTransfer | null>(null);
  const [verificationRemarks, setVerificationRemarks] = useState("");

  useEffect(() => {
    fetchBankTransfers();
  }, [token]);

  const fetchBankTransfers = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      // Mock data for demonstration
      const mockTransfers: BankTransfer[] = [
        {
          _id: "1",
          userId: "user1",
          userName: "Rajesh Kumar",
          userEmail: "rajesh@example.com",
          amount: 599,
          referenceNumber: "REF123456789",
          bankName: "State Bank of India",
          accountHolderName: "Rajesh Kumar",
          transactionDate: "2024-01-15T10:30:00Z",
          status: "pending",
          proofDocument: "https://example.com/proof1.jpg",
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
        },
        {
          _id: "2",
          userId: "user2",
          userName: "Priya Sharma",
          userEmail: "priya@example.com",
          amount: 299,
          referenceNumber: "REF123456790",
          bankName: "HDFC Bank",
          accountHolderName: "Priya Sharma",
          transactionDate: "2024-01-14T15:45:00Z",
          status: "verified",
          proofDocument: "https://example.com/proof2.jpg",
          verifiedBy: "Admin",
          verificationDate: "2024-01-14T16:00:00Z",
          remarks: "Transaction verified successfully",
          createdAt: "2024-01-14T15:45:00Z",
          updatedAt: "2024-01-14T16:00:00Z",
        },
        {
          _id: "3",
          userId: "user3",
          userName: "Amit Singh",
          userEmail: "amit@example.com",
          amount: 199,
          referenceNumber: "REF123456791",
          bankName: "ICICI Bank",
          accountHolderName: "Amit Singh",
          transactionDate: "2024-01-13T09:20:00Z",
          status: "rejected",
          proofDocument: "https://example.com/proof3.jpg",
          verifiedBy: "Admin",
          verificationDate: "2024-01-13T11:00:00Z",
          remarks: "Insufficient proof or invalid transaction",
          createdAt: "2024-01-13T09:20:00Z",
          updatedAt: "2024-01-13T11:00:00Z",
        },
        {
          _id: "4",
          userId: "user4",
          userName: "Sunita Devi",
          userEmail: "sunita@example.com",
          amount: 999,
          referenceNumber: "REF123456792",
          bankName: "Punjab National Bank",
          accountHolderName: "Sunita Devi",
          transactionDate: "2024-01-12T14:10:00Z",
          status: "pending",
          proofDocument: "https://example.com/proof4.jpg",
          createdAt: "2024-01-12T14:10:00Z",
          updatedAt: "2024-01-12T14:10:00Z",
        }
      ];

      setTransfers(mockTransfers);

    } catch (error) {
      console.error("Error fetching bank transfers:", error);
      setError("Failed to fetch bank transfers");
    } finally {
      setLoading(false);
    }
  };

  const updateTransferStatus = async (transferId: string, status: "verified" | "rejected", remarks: string = "") => {
    if (!token) return;

    try {
      // Mock update - in real app, this would call API
      setTransfers(transfers.map(transfer => 
        transfer._id === transferId 
          ? { 
              ...transfer, 
              status, 
              remarks, 
              verifiedBy: "Admin",
              verificationDate: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : transfer
      ));
      
      setVerificationRemarks("");
      setSelectedTransfer(null);
    } catch (error) {
      console.error("Error updating transfer status:", error);
      setError("Failed to update transfer status");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-600" />;
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.bankName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || transfer.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalTransfers: transfers.length,
    pendingTransfers: transfers.filter(t => t.status === "pending").length,
    verifiedTransfers: transfers.filter(t => t.status === "verified").length,
    rejectedTransfers: transfers.filter(t => t.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-[#C70000] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading bank transfers...</p>
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
              fetchBankTransfers();
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
          <h3 className="text-2xl font-bold text-gray-900">Bank Transfer Management</h3>
          <p className="text-gray-600">Verify and manage bank transfer requests</p>
        </div>
        <Button className="bg-[#C70000] hover:bg-[#A60000]">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransfers}</div>
            <p className="text-xs text-muted-foreground">All bank transfers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingTransfers}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verifiedTransfers}</div>
            <p className="text-xs text-muted-foreground">Approved transfers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejectedTransfers}</div>
            <p className="text-xs text-muted-foreground">Declined transfers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <Input
          placeholder="Search transfers..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Bank Transfers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reference No.</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((transfer) => (
                <TableRow key={transfer._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{transfer.userName}</p>
                      <p className="text-sm text-gray-500">{transfer.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">₹{transfer.amount}</span>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {transfer.referenceNumber}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{transfer.bankName}</p>
                      <p className="text-sm text-gray-500">{transfer.accountHolderName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transfer.status)}
                      <Badge
                        variant="outline"
                        className={getStatusColor(transfer.status)}
                      >
                        {transfer.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(transfer.transactionDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedTransfer(transfer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Bank Transfer Details</DialogTitle>
                          </DialogHeader>
                          {selectedTransfer && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="font-semibold">User:</label>
                                  <p>{selectedTransfer.userName}</p>
                                  <p className="text-sm text-gray-500">{selectedTransfer.userEmail}</p>
                                </div>
                                <div>
                                  <label className="font-semibold">Amount:</label>
                                  <p className="text-lg font-bold">₹{selectedTransfer.amount}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="font-semibold">Reference Number:</label>
                                  <p className="font-mono">{selectedTransfer.referenceNumber}</p>
                                </div>
                                <div>
                                  <label className="font-semibold">Transaction Date:</label>
                                  <p>{new Date(selectedTransfer.transactionDate).toLocaleString()}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="font-semibold">Bank Name:</label>
                                  <p>{selectedTransfer.bankName}</p>
                                </div>
                                <div>
                                  <label className="font-semibold">Account Holder:</label>
                                  <p>{selectedTransfer.accountHolderName}</p>
                                </div>
                              </div>
                              
                              {selectedTransfer.proofDocument && (
                                <div>
                                  <label className="font-semibold">Proof Document:</label>
                                  <div className="mt-2 p-3 border rounded-lg">
                                    <a 
                                      href={selectedTransfer.proofDocument} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      View Document
                                    </a>
                                  </div>
                                </div>
                              )}
                              
                              {selectedTransfer.remarks && (
                                <div>
                                  <label className="font-semibold">Remarks:</label>
                                  <p className="mt-1 p-3 bg-gray-50 rounded-lg">
                                    {selectedTransfer.remarks}
                                  </p>
                                </div>
                              )}
                              
                              {selectedTransfer.status === "pending" && (
                                <div className="space-y-4 pt-4 border-t">
                                  <div>
                                    <label className="font-semibold">Verification Remarks:</label>
                                    <textarea
                                      value={verificationRemarks}
                                      onChange={(e) => setVerificationRemarks(e.target.value)}
                                      className="w-full mt-2 p-3 border rounded-lg resize-none"
                                      rows={3}
                                      placeholder="Add remarks for verification..."
                                    />
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() => updateTransferStatus(selectedTransfer._id, "verified", verificationRemarks)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Verify Transfer
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => updateTransferStatus(selectedTransfer._id, "rejected", verificationRemarks)}
                                      className="text-red-600 border-red-600 hover:bg-red-50"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Reject Transfer
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {transfer.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateTransferStatus(transfer._id, "verified")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTransferStatus(transfer._id, "rejected")}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransfers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No bank transfers found
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
