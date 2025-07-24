import express from "express";
import cors from "cors";
import { connectToDatabase, getDatabase } from "./db/mongodb";
import { authenticateToken, requireAdmin } from "./middleware/auth";

// Property routes
import {
  getProperties,
  getPropertyById,
  createProperty,
  getFeaturedProperties,
  getUserProperties,
  getPendingProperties,
  updatePropertyApproval,
  upload,
} from "./routes/properties";

// Category routes
import {
  getCategories,
  getCategoryBySlug,
  initializeCategories,
} from "./routes/categories";

// Authentication routes
import {
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  getUserProfile,
  updateUserProfile,
} from "./routes/auth";

// Admin routes
import {
  getAllUsers,
  getUserStats,
  updateUserStatus,
  deleteUser,
  getAllProperties,
  initializeAdmin,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  updateProperty,
  deleteProperty,
} from "./routes/admin";

// Chat routes
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  startPropertyConversation,
  getUnreadCount,
} from "./routes/chat";

import { handleDemo } from "./routes/demo";
import { seedDatabase } from "./routes/seed";

// Package routes
import {
  getAdPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  initializePackages,
} from "./routes/packages";

// Payment routes
import {
  createTransaction,
  getUserTransactions,
  getAllTransactions,
  updateTransactionStatus,
  verifyPayment,
  getPaymentMethods,
} from "./routes/payments";

// Banner routes
import {
  getBannersByPosition,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadBannerImage,
  initializeBanners,
} from "./routes/banners";

// Analytics routes
import {
  trackPropertyView,
  trackPropertyInquiry,
  trackPhoneClick,
  getPropertyAnalytics,
  getSellerAnalytics,
  getAdminAnalytics,
} from "./routes/analytics";

// Testimonials routes
import {
  getAllTestimonials,
  getPublicTestimonials,
  createTestimonial,
  updateTestimonialStatus,
  deleteTestimonial,
} from "./routes/testimonials";

// FAQ routes
import {
  getAllFAQs,
  getPublicFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  initializeFAQs,
} from "./routes/faqs";

// Blog routes
import {
  getAllBlogPosts,
  getPublicBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "./routes/blog";

// Reports routes
import {
  getAllReportReasons,
  getPublicReportReasons,
  createReportReason,
  updateReportReason,
  deleteReportReason,
  getAllUserReports,
  createUserReport,
  updateUserReportStatus,
  initializeReportReasons,
} from "./routes/reports";

// User Packages routes
import {
  getAllUserPackages,
  getUserPackages,
  createUserPackage,
  updateUserPackageStatus,
  updatePackageUsage,
  cancelUserPackage,
  getPackageStats,
} from "./routes/user-packages";

export function createServer() {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: true, // Allow all origins in development
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Cache-Control",
        "Pragma",
      ],
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Initialize MongoDB connection
  connectToDatabase()
    .then(() => {
      console.log("✅ MongoDB Atlas connected successfully");
    })
    .catch((error) => {
      console.error("❌ MongoDB connection failed:", error);
      console.log("Server will continue with limited functionality");
    });

  // Health check with database status
  app.get("/api/ping", async (req, res) => {
    const startTime = Date.now();

    try {
      // Try to get database connection
      let db;
      let dbStatus = "unknown";
      let dbError = null;

      try {
        db = getDatabase();
        // Test the connection
        await db.admin().ping();
        dbStatus = "connected";
      } catch (error: any) {
        dbError = error.message;
        try {
          // If database not initialized, try to connect
          console.log("🔄 Database not initialized, attempting connection...");
          const connection = await connectToDatabase();
          db = connection.db;
          await db.admin().ping();
          dbStatus = "connected";
        } catch (connectError: any) {
          dbStatus = "failed";
          dbError = connectError.message;
        }
      }

      const responseTime = Date.now() - startTime;

      const response = {
        message: "pong",
        status: "healthy",
        server: {
          environment: process.env.NODE_ENV || "unknown",
          port: process.env.PORT || 3000,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          responseTime: `${responseTime}ms`,
        },
        database: {
          status: dbStatus,
          name: db?.databaseName || "unknown",
          error: dbError,
        },
        request: {
          headers: {
            host: req.get("host"),
            "user-agent": req.get("user-agent")?.substring(0, 100),
            origin: req.get("origin"),
            referer: req.get("referer"),
          },
          ip: req.ip || req.connection.remoteAddress,
          method: req.method,
          url: req.url,
        },
        timestamp: new Date().toISOString(),
      };

      if (dbStatus === "connected") {
        res.json(response);
      } else {
        res.status(503).json(response);
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.error("❌ Health check failed:", error.message);

      res.status(500).json({
        message: "pong",
        status: "unhealthy",
        error: error.message,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.get("/api/demo", handleDemo);

  // Database seeding (development only)
  app.post("/api/seed", seedDatabase);

  // Authentication routes
  app.post("/api/auth/register", registerUser);
  app.post("/api/auth/login", loginUser);
  app.post("/api/auth/send-otp", sendOTP);
  app.post("/api/auth/verify-otp", verifyOTP);
  app.get("/api/auth/profile", authenticateToken, getUserProfile);
  app.put("/api/auth/profile", authenticateToken, updateUserProfile);

  // Property routes
  app.get("/api/properties", getProperties);
  app.get("/api/properties/featured", getFeaturedProperties);
  app.get("/api/properties/:id", getPropertyById);
  app.post(
    "/api/properties",
    authenticateToken,
    upload.array("images", 10),
    createProperty,
  );

  // User property management routes
  app.get("/api/user/properties", authenticateToken, getUserProperties);

  // Admin property approval routes
  app.get("/api/admin/properties/pending", authenticateToken, requireAdmin, getPendingProperties);
  app.put("/api/admin/properties/:id/approval", authenticateToken, requireAdmin, updatePropertyApproval);

  // Category routes
  app.get("/api/categories", getCategories);
  app.get("/api/categories/:slug", getCategoryBySlug);
  app.post("/api/categories/initialize", initializeCategories);

  // Admin routes
  app.get("/api/admin/users", authenticateToken, requireAdmin, getAllUsers);
  app.get("/api/admin/stats", authenticateToken, requireAdmin, getUserStats);
  app.put(
    "/api/admin/users/:userId/status",
    authenticateToken,
    requireAdmin,
    updateUserStatus,
  );
  app.delete(
    "/api/admin/users/:userId",
    authenticateToken,
    requireAdmin,
    deleteUser,
  );
  app.get(
    "/api/admin/properties",
    authenticateToken,
    requireAdmin,
    getAllProperties,
  );
  app.get(
    "/api/admin/categories",
    authenticateToken,
    requireAdmin,
    getAdminCategories,
  );
  app.post(
    "/api/admin/categories",
    authenticateToken,
    requireAdmin,
    createCategory,
  );
  app.put(
    "/api/admin/categories/:categoryId",
    authenticateToken,
    requireAdmin,
    updateCategory,
  );
  app.delete(
    "/api/admin/categories/:categoryId",
    authenticateToken,
    requireAdmin,
    deleteCategory,
  );
  app.put(
    "/api/admin/properties/:propertyId",
    authenticateToken,
    requireAdmin,
    updateProperty,
  );
  app.delete(
    "/api/admin/properties/:propertyId",
    authenticateToken,
    requireAdmin,
    deleteProperty,
  );
  app.post("/api/admin/initialize", initializeAdmin);

  // Package routes
  app.get("/api/packages", getAdPackages);
  app.get("/api/packages/:packageId", getPackageById);
  app.post("/api/packages", authenticateToken, requireAdmin, createPackage);
  app.put(
    "/api/packages/:packageId",
    authenticateToken,
    requireAdmin,
    updatePackage,
  );
  app.delete(
    "/api/packages/:packageId",
    authenticateToken,
    requireAdmin,
    deletePackage,
  );
  app.post("/api/packages/initialize", initializePackages);

  // Payment routes
  app.post("/api/payments/transaction", authenticateToken, createTransaction);
  app.get("/api/payments/transactions", authenticateToken, getUserTransactions);
  app.get(
    "/api/admin/transactions",
    authenticateToken,
    requireAdmin,
    getAllTransactions,
  );
  app.put(
    "/api/admin/transactions/:transactionId",
    authenticateToken,
    requireAdmin,
    updateTransactionStatus,
  );
  app.post("/api/payments/verify", verifyPayment);
  app.get("/api/payments/methods", getPaymentMethods);

  // Banner routes
  app.get("/api/banners/:position", getBannersByPosition);
  app.get("/api/admin/banners", authenticateToken, requireAdmin, getAllBanners);
  app.post("/api/admin/banners", authenticateToken, requireAdmin, createBanner);
  app.put(
    "/api/admin/banners/:bannerId",
    authenticateToken,
    requireAdmin,
    updateBanner,
  );
  app.delete(
    "/api/admin/banners/:bannerId",
    authenticateToken,
    requireAdmin,
    deleteBanner,
  );
  app.post(
    "/api/admin/banners/upload",
    authenticateToken,
    requireAdmin,
    uploadBannerImage,
  );
  app.post("/api/banners/initialize", initializeBanners);

  // Analytics routes
  app.post("/api/analytics/view/:propertyId", trackPropertyView);
  app.post(
    "/api/analytics/inquiry/:propertyId",
    authenticateToken,
    trackPropertyInquiry,
  );
  app.post("/api/analytics/phone/:propertyId", trackPhoneClick);
  app.get(
    "/api/analytics/property/:propertyId",
    authenticateToken,
    getPropertyAnalytics,
  );
  app.get("/api/analytics/seller", authenticateToken, getSellerAnalytics);
  app.get(
    "/api/admin/analytics",
    authenticateToken,
    requireAdmin,
    getAdminAnalytics,
  );

  // Chat routes
  app.get("/api/chat/conversations", authenticateToken, getUserConversations);
  app.get(
    "/api/chat/conversations/:conversationId/messages",
    authenticateToken,
    getConversationMessages,
  );
  app.post("/api/chat/messages", authenticateToken, sendMessage);
  app.post(
    "/api/chat/start-property-conversation",
    authenticateToken,
    startPropertyConversation,
  );
  app.get("/api/chat/unread-count", authenticateToken, getUnreadCount);

  // Testimonials routes
  app.get("/api/testimonials", getPublicTestimonials);
  app.get(
    "/api/admin/testimonials",
    authenticateToken,
    requireAdmin,
    getAllTestimonials,
  );
  app.post("/api/testimonials", authenticateToken, createTestimonial);
  app.put(
    "/api/admin/testimonials/:testimonialId",
    authenticateToken,
    requireAdmin,
    updateTestimonialStatus,
  );
  app.delete(
    "/api/admin/testimonials/:testimonialId",
    authenticateToken,
    requireAdmin,
    deleteTestimonial,
  );

  // FAQ routes
  app.get("/api/faqs", getPublicFAQs);
  app.get("/api/admin/faqs", authenticateToken, requireAdmin, getAllFAQs);
  app.post("/api/admin/faqs", authenticateToken, requireAdmin, createFAQ);
  app.put("/api/admin/faqs/:faqId", authenticateToken, requireAdmin, updateFAQ);
  app.delete(
    "/api/admin/faqs/:faqId",
    authenticateToken,
    requireAdmin,
    deleteFAQ,
  );
  app.post("/api/faqs/initialize", initializeFAQs);

  // Blog routes
  app.get("/api/blog", getPublicBlogPosts);
  app.get("/api/blog/:slug", getBlogPostBySlug);
  app.get(
    "/api/admin/blog",
    authenticateToken,
    requireAdmin,
    getAllBlogPosts,
  );
  app.post(
    "/api/admin/blog",
    authenticateToken,
    requireAdmin,
    createBlogPost,
  );
  app.put(
    "/api/admin/blog/:postId",
    authenticateToken,
    requireAdmin,
    updateBlogPost,
  );
  app.delete(
    "/api/admin/blog/:postId",
    authenticateToken,
    requireAdmin,
    deleteBlogPost,
  );

  // Reports routes
  app.get("/api/reports/reasons", getPublicReportReasons);
  app.get(
    "/api/admin/reports/reasons",
    authenticateToken,
    requireAdmin,
    getAllReportReasons,
  );
  app.post(
    "/api/admin/reports/reasons",
    authenticateToken,
    requireAdmin,
    createReportReason,
  );
  app.put(
    "/api/admin/reports/reasons/:reasonId",
    authenticateToken,
    requireAdmin,
    updateReportReason,
  );
  app.delete(
    "/api/admin/reports/reasons/:reasonId",
    authenticateToken,
    requireAdmin,
    deleteReportReason,
  );
  app.get(
    "/api/admin/reports",
    authenticateToken,
    requireAdmin,
    getAllUserReports,
  );
  app.post("/api/reports", authenticateToken, createUserReport);
  app.put(
    "/api/admin/reports/:reportId",
    authenticateToken,
    requireAdmin,
    updateUserReportStatus,
  );
  app.post("/api/reports/initialize", initializeReportReasons);

  // User Packages routes
  app.get(
    "/api/admin/user-packages",
    authenticateToken,
    requireAdmin,
    getAllUserPackages,
  );
  app.get("/api/user-packages", authenticateToken, getUserPackages);
  app.post("/api/user-packages", authenticateToken, createUserPackage);
  app.put(
    "/api/admin/user-packages/:packageId",
    authenticateToken,
    requireAdmin,
    updateUserPackageStatus,
  );
  app.put(
    "/api/user-packages/:packageId/usage",
    authenticateToken,
    updatePackageUsage,
  );
  app.delete(
    "/api/user-packages/:packageId",
    authenticateToken,
    cancelUserPackage,
  );
  app.get(
    "/api/admin/package-stats",
    authenticateToken,
    requireAdmin,
    getPackageStats,
  );

  return app;
}

// For production
// For production
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const port = Number(process.env.PORT);
  if (!port) {
    throw new Error("❌ PORT is not defined in environment variables.");
  }
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}

