import { RequestHandler } from "express";
import { getDatabase } from "../db/mongodb";
import { ApiResponse, Category } from "@shared/types";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

// Get all users (admin only)
export const getAllUsers: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { page = "1", limit = "20", userType, search } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};
    if (userType && userType !== "all") {
      filter.userType = userType;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const users = await db
      .collection("users")
      .find(filter, { projection: { password: 0 } }) // Exclude password
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    const total = await db.collection("users").countDocuments(filter);

    const response: ApiResponse<{
      users: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }> = {
      success: true,
      data: {
        users: users as any[],
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
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
};

// Get user statistics
export const getUserStats: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();

    // Test database connection
    await db.admin().ping();
    console.log("✅ Database connection verified for admin stats");

    const stats = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: "$userType",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const totalUsers = await db.collection("users").countDocuments();
    const totalProperties = await db.collection("properties").countDocuments();
    const activeProperties = await db
      .collection("properties")
      .countDocuments({ status: "active" });

    const response: ApiResponse<{
      totalUsers: number;
      totalProperties: number;
      activeProperties: number;
      usersByType: any[];
    }> = {
      success: true,
      data: {
        totalUsers,
        totalProperties,
        activeProperties,
        usersByType: stats,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
    });
  }
};

// Update user status (activate/deactivate)
export const updateUserStatus: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { userId } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID",
      });
    }

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          status: status,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "User status updated successfully" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user status",
    });
  }
};

// Delete user
export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID",
      });
    }

    // Also delete user's properties
    await db.collection("properties").deleteMany({ ownerId: userId });

    const result = await db
      .collection("users")
      .deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "User deleted successfully" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete user",
    });
  }
};

// Get all properties (admin view)
export const getAllProperties: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { page = "1", limit = "20", status, search } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } },
        { "contactInfo.name": { $regex: search, $options: "i" } },
      ];
    }

    const properties = await db
      .collection("properties")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    const total = await db.collection("properties").countDocuments(filter);

    const response: ApiResponse<{
      properties: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }> = {
      success: true,
      data: {
        properties: properties as any[],
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
    console.error("Error fetching properties:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch properties",
    });
  }
};

// Initialize admin user
export const initializeAdmin: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();

    // Check if admin already exists
    const existingAdmin = await db
      .collection("users")
      .findOne({ userType: "admin" });

    if (existingAdmin) {
      return res.json({
        success: true,
        message: "Admin user already exists",
      });
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminUser = {
      name: "Administrator",
      email: "admin@aashishproperty.com",
      phone: "+91 9876543210",
      password: hashedPassword,
      userType: "admin",
      preferences: {
        propertyTypes: [],
        priceRange: { min: 0, max: 10000000 },
        locations: [],
      },
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("users").insertOne(adminUser);

    res.json({
      success: true,
      message: "Admin user created successfully",
      data: {
        email: "admin@aashishproperty.com",
        password: "admin123",
      },
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create admin user",
    });
  }
};

// Get all categories (admin view)
export const getAdminCategories: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();

    const categories = await db
      .collection("categories")
      .find({})
      .sort({ order: 1 })
      .toArray();

    // Get property counts for each category and subcategory
    const propertiesAgg = await db
      .collection("properties")
      .aggregate([
        {
          $group: {
            _id: {
              propertyType: "$propertyType",
              subCategory: "$subCategory",
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Map counts to categories
    const categoriesWithCounts = categories.map((category: any) => {
      const categoryCount = propertiesAgg
        .filter((p) => p._id.propertyType === category.slug)
        .reduce((sum, p) => sum + p.count, 0);

      const subcategoriesWithCounts = category.subcategories.map((sub: any) => {
        const subCount =
          propertiesAgg.find(
            (p) =>
              p._id.propertyType === category.slug &&
              p._id.subCategory === sub.slug,
          )?.count || 0;

        return { ...sub, count: subCount };
      });

      return {
        ...category,
        count: categoryCount,
        subcategories: subcategoriesWithCounts,
      };
    });

    const response: ApiResponse<any[]> = {
      success: true,
      data: categoriesWithCounts,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching admin categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories",
    });
  }
};

// Create new category
export const createCategory: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const {
      name,
      slug,
      icon,
      description,
      subcategories = [],
      order,
    } = req.body;

    // Check if slug already exists
    const existingCategory = await db
      .collection("categories")
      .findOne({ slug });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: "Category with this slug already exists",
      });
    }

    const newCategory: Omit<Category, "_id"> = {
      name,
      slug,
      icon,
      description,
      subcategories,
      order: order || 999,
      active: true,
    };

    const result = await db.collection("categories").insertOne(newCategory);

    const response: ApiResponse<{ _id: string }> = {
      success: true,
      data: { _id: result.insertedId.toString() },
    };

    res.json(response);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create category",
    });
  }
};

// Update category
export const updateCategory: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { categoryId } = req.params;
    const updateData = req.body;

    delete updateData._id; // Remove _id from update data

    const result = await db
      .collection("categories")
      .updateOne({ _id: new ObjectId(categoryId) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Category updated successfully" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update category",
    });
  }
};

// Delete category
export const deleteCategory: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { categoryId } = req.params;

    // Check if category has associated properties
    const category = await db
      .collection("categories")
      .findOne({ _id: new ObjectId(categoryId) });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    const propertiesCount = await db
      .collection("properties")
      .countDocuments({ propertyType: category.slug });

    if (propertiesCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category. It has ${propertiesCount} associated properties.`,
      });
    }

    await db
      .collection("categories")
      .deleteOne({ _id: new ObjectId(categoryId) });

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Category deleted successfully" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete category",
    });
  }
};

// Update property (admin only)
export const updateProperty: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { propertyId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    delete updateData._id;

    const result = await db
      .collection("properties")
      .updateOne({ _id: new ObjectId(propertyId) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Property not found",
      });
    }

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Property updated successfully" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update property",
    });
  }
};

// Delete property (admin only)
export const deleteProperty: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { propertyId } = req.params;

    const result = await db
      .collection("properties")
      .deleteOne({ _id: new ObjectId(propertyId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Property not found",
      });
    }

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Property deleted successfully" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete property",
    });
  }
};
