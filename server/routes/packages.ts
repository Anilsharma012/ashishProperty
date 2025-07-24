import { RequestHandler } from "express";
import { getDatabase } from "../db/mongodb";
import { AdPackage, Transaction, ApiResponse } from "@shared/types";
import { ObjectId } from "mongodb";

// Get all advertisement packages
export const getAdPackages: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { category, location } = req.query;

    const filter: any = { active: true };
    if (category) filter.category = category;
    if (location) filter.location = location;

    const packages = await db
      .collection("ad_packages")
      .find(filter)
      .sort({ type: 1, price: 1 })
      .toArray();

    const response: ApiResponse<AdPackage[]> = {
      success: true,
      data: packages as AdPackage[],
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch packages",
    });
  }
};

// Get package by ID
export const getPackageById: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { packageId } = req.params;

    const package_ = await db
      .collection("ad_packages")
      .findOne({ _id: new ObjectId(packageId) });

    if (!package_) {
      return res.status(404).json({
        success: false,
        error: "Package not found",
      });
    }

    const response: ApiResponse<AdPackage> = {
      success: true,
      data: package_ as AdPackage,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching package:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch package",
    });
  }
};

// Create new package (admin only)
export const createPackage: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const packageData: Omit<AdPackage, "_id"> = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("ad_packages").insertOne(packageData);

    const response: ApiResponse<{ _id: string }> = {
      success: true,
      data: { _id: result.insertedId.toString() },
    };

    res.json(response);
  } catch (error) {
    console.error("Error creating package:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create package",
    });
  }
};

// Update package (admin only)
export const updatePackage: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { packageId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    delete updateData._id;

    const result = await db
      .collection("ad_packages")
      .updateOne({ _id: new ObjectId(packageId) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Package not found",
      });
    }

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Package updated successfully" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating package:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update package",
    });
  }
};

// Delete package (admin only)
export const deletePackage: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { packageId } = req.params;

    // Check if package is being used
    const activeTransactions = await db
      .collection("transactions")
      .countDocuments({
        packageId: packageId,
        status: { $in: ["pending", "paid"] },
      });

    if (activeTransactions > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete package with active transactions",
      });
    }

    const result = await db
      .collection("ad_packages")
      .deleteOne({ _id: new ObjectId(packageId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Package not found",
      });
    }

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Package deleted successfully" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error deleting package:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete package",
    });
  }
};

// Initialize default packages
export const initializePackages: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();

    // Check if packages already exist
    const existingCount = await db.collection("ad_packages").countDocuments();
    if (existingCount > 0) {
      return res.json({
        success: true,
        message: "Packages already initialized",
      });
    }

    const defaultPackages: Omit<AdPackage, "_id">[] = [
      {
        name: "Basic Listing",
        description: "Standard property listing with basic visibility",
        price: 0,
        duration: 30,
        features: [
          "30 days listing",
          "Standard visibility",
          "Basic property details",
          "Contact information display",
        ],
        type: "basic",
        category: "property",
        location: "rohtak",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Featured Listing",
        description: "Enhanced visibility with featured badge",
        price: 299,
        duration: 30,
        features: [
          "30 days listing",
          "Featured badge",
          "Top of search results",
          "Homepage visibility",
          "Priority in category",
          "Enhanced property details",
          "Contact information display",
        ],
        type: "featured",
        category: "property",
        location: "rohtak",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Premium Listing",
        description: "Maximum visibility with premium features",
        price: 599,
        duration: 30,
        features: [
          "30 days listing",
          "Premium badge",
          "Top priority in all searches",
          "Homepage banner slot",
          "Featured in category top",
          "Enhanced property details",
          "Multiple image gallery",
          "Contact information display",
          "Analytics dashboard",
          "Priority customer support",
        ],
        type: "premium",
        category: "property",
        location: "rohtak",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Weekly Featured",
        description: "7-day featured listing for quick sales",
        price: 99,
        duration: 7,
        features: [
          "7 days listing",
          "Featured badge",
          "Top of search results",
          "Contact information display",
        ],
        type: "featured",
        category: "property",
        location: "rohtak",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Extended Premium",
        description: "60-day premium listing with maximum exposure",
        price: 999,
        duration: 60,
        features: [
          "60 days listing",
          "Premium badge",
          "Top priority in all searches",
          "Homepage banner slot",
          "Featured in category top",
          "Enhanced property details",
          "Multiple image gallery",
          "Contact information display",
          "Analytics dashboard",
          "Priority customer support",
          "Social media promotion",
        ],
        type: "premium",
        category: "property",
        location: "rohtak",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.collection("ad_packages").insertMany(defaultPackages);

    res.json({
      success: true,
      message: "Packages initialized successfully",
    });
  } catch (error) {
    console.error("Error initializing packages:", error);
    res.status(500).json({
      success: false,
      error: "Failed to initialize packages",
    });
  }
};
