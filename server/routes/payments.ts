import { RequestHandler } from "express";
import { getDatabase } from "../db/mongodb";
import { Transaction, ApiResponse } from "@shared/types";
import { ObjectId } from "mongodb";

// Create new transaction
export const createTransaction: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { packageId, propertyId, paymentMethod, paymentDetails } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    // Get package details
    const package_ = await db
      .collection("ad_packages")
      .findOne({ _id: new ObjectId(packageId) });

    if (!package_) {
      return res.status(404).json({
        success: false,
        error: "Package not found",
      });
    }

    const transactionData: Omit<Transaction, "_id"> = {
      userId,
      packageId,
      propertyId,
      amount: package_.price,
      paymentMethod,
      paymentDetails,
      status: package_.price === 0 ? "paid" : "pending", // Free packages are automatically paid
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("transactions")
      .insertOne(transactionData);

    // If free package, activate property immediately
    if (package_.price === 0 && propertyId) {
      const packageExpiry = new Date();
      packageExpiry.setDate(packageExpiry.getDate() + package_.duration);

      await db.collection("properties").updateOne(
        { _id: new ObjectId(propertyId) },
        {
          $set: {
            packageId: packageId,
            packageExpiry: packageExpiry,
            featured:
              package_.type === "featured" || package_.type === "premium",
            updatedAt: new Date(),
          },
        },
      );
    }

    const response: ApiResponse<{ transactionId: string; status: string }> = {
      success: true,
      data: {
        transactionId: result.insertedId.toString(),
        status: transactionData.status,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create transaction",
    });
  }
};

// Get user transactions
export const getUserTransactions: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user?.userId;
    const { page = "1", limit = "20" } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const transactions = await db
      .collection("transactions")
      .aggregate([
        { $match: { userId } },
        {
          $lookup: {
            from: "ad_packages",
            localField: "packageId",
            foreignField: "_id",
            as: "package",
          },
        },
        {
          $lookup: {
            from: "properties",
            localField: "propertyId",
            foreignField: "_id",
            as: "property",
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limitNum },
      ])
      .toArray();

    const total = await db
      .collection("transactions")
      .countDocuments({ userId });

    const response: ApiResponse<{
      transactions: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }> = {
      success: true,
      data: {
        transactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transactions",
    });
  }
};

// Get all transactions (admin only)
export const getAllTransactions: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { page = "1", limit = "20", status, paymentMethod } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const transactions = await db
      .collection("transactions")
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $lookup: {
            from: "ad_packages",
            localField: "packageId",
            foreignField: "_id",
            as: "package",
          },
        },
        {
          $lookup: {
            from: "properties",
            localField: "propertyId",
            foreignField: "_id",
            as: "property",
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limitNum },
      ])
      .toArray();

    const total = await db.collection("transactions").countDocuments(filter);

    const response: ApiResponse<{
      transactions: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }> = {
      success: true,
      data: {
        transactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch transactions",
    });
  }
};

// Update transaction status (admin only)
export const updateTransactionStatus: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { transactionId } = req.params;
    const { status, adminNotes } = req.body;

    const transaction = await db
      .collection("transactions")
      .findOne({ _id: new ObjectId(transactionId) });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found",
      });
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    await db
      .collection("transactions")
      .updateOne({ _id: new ObjectId(transactionId) }, { $set: updateData });

    // If marking as paid, activate the property package
    if (status === "paid" && transaction.propertyId) {
      const package_ = await db
        .collection("ad_packages")
        .findOne({ _id: new ObjectId(transaction.packageId) });

      if (package_) {
        const packageExpiry = new Date();
        packageExpiry.setDate(packageExpiry.getDate() + package_.duration);

        await db.collection("properties").updateOne(
          { _id: new ObjectId(transaction.propertyId) },
          {
            $set: {
              packageId: transaction.packageId,
              packageExpiry: packageExpiry,
              featured:
                package_.type === "featured" || package_.type === "premium",
              updatedAt: new Date(),
            },
          },
        );
      }
    }

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Transaction status updated successfully" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update transaction",
    });
  }
};

// Verify payment (webhook or manual verification)
export const verifyPayment: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { transactionId, paymentData } = req.body;

    // Here you would integrate with actual payment gateway
    // For now, we'll simulate payment verification

    const transaction = await db
      .collection("transactions")
      .findOne({ _id: new ObjectId(transactionId) });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found",
      });
    }

    // Simulate payment verification logic
    const isPaymentValid = paymentData && paymentData.status === "success";

    const newStatus = isPaymentValid ? "paid" : "failed";

    await db.collection("transactions").updateOne(
      { _id: new ObjectId(transactionId) },
      {
        $set: {
          status: newStatus,
          paymentDetails: {
            ...transaction.paymentDetails,
            gatewayResponse: paymentData,
          },
          updatedAt: new Date(),
        },
      },
    );

    // If payment successful, activate property package
    if (isPaymentValid && transaction.propertyId) {
      const package_ = await db
        .collection("ad_packages")
        .findOne({ _id: new ObjectId(transaction.packageId) });

      if (package_) {
        const packageExpiry = new Date();
        packageExpiry.setDate(packageExpiry.getDate() + package_.duration);

        await db.collection("properties").updateOne(
          { _id: new ObjectId(transaction.propertyId) },
          {
            $set: {
              packageId: transaction.packageId,
              packageExpiry: packageExpiry,
              featured:
                package_.type === "featured" || package_.type === "premium",
              updatedAt: new Date(),
            },
          },
        );
      }
    }

    const response: ApiResponse<{ status: string }> = {
      success: true,
      data: { status: newStatus },
    };

    res.json(response);
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify payment",
    });
  }
};

// Get payment methods and UPI details
export const getPaymentMethods: RequestHandler = async (req, res) => {
  try {
    const paymentMethods = {
      upi: {
        enabled: true,
        upiId: "aashishproperty@paytm",
        qrCode: "/api/payments/upi-qr", // QR code endpoint
      },
      bankTransfer: {
        enabled: true,
        bankName: "State Bank of India",
        accountNumber: "1234567890",
        ifscCode: "SBIN0001234",
        accountHolder: "Aashish Property Services",
      },
      online: {
        enabled: true,
        gateways: ["razorpay", "paytm", "phonepe"],
      },
    };

    const response: ApiResponse<any> = {
      success: true,
      data: paymentMethods,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payment methods",
    });
  }
};
