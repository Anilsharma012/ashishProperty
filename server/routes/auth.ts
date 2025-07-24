import { RequestHandler } from "express";
import { getDatabase } from "../db/mongodb";
import { User, ApiResponse } from "@shared/types";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

// Register new user (seller, agent, or buyer)
export const registerUser: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const {
      name,
      email,
      phone,
      password,
      userType,
      experience,
      specializations,
      serviceAreas,
    } = req.body;

    // Check if user already exists
    const existingUser = await db
      .collection("users")
      .findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email or phone already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user object
    const newUser: Omit<User, "_id"> = {
      name,
      email,
      phone,
      password: hashedPassword,
      userType,
      preferences: {
        propertyTypes: [],
        priceRange: { min: 0, max: 10000000 },
        locations: [],
      },
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add agent-specific fields if userType is agent
    if (userType === "agent") {
      (newUser as any).agentProfile = {
        experience: parseInt(experience) || 0,
        specializations: specializations || [],
        rating: 0,
        reviewCount: 0,
        aboutMe: "",
        serviceAreas: serviceAreas || [],
      };
      (newUser as any).properties = [];
    }

    const result = await db.collection("users").insertOne(newUser);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.insertedId.toString(),
        userType,
        email,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    const response: ApiResponse<{ token: string; user: any }> = {
      success: true,
      data: {
        token,
        user: {
          id: result.insertedId.toString(),
          name,
          email,
          phone,
          userType,
        },
      },
      message: "User registered successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to register user",
    });
  }
};

// Login user
export const loginUser: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const { email, phone, password, userType } = req.body;

    // Build query based on provided fields
    let query: any = {};

    if (email && phone) {
      query = { $or: [{ email }, { phone }] };
    } else if (email) {
      query = { email };
    } else if (phone) {
      query = { phone };
    } else {
      return res.status(400).json({
        success: false,
        error: "Email or phone number is required",
      });
    }

    // Add userType filter if specified (for admin login)
    if (userType) {
      query = { ...query, userType };
    }

    // Find user by email or phone
    const user = await db.collection("users").findOne(query);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        userType: user.userType,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    const response: ApiResponse<{ token: string; user: any }> = {
      success: true,
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
        },
      },
      message: "Login successful",
    };

    res.json(response);
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to login",
    });
  }
};

// Send OTP (placeholder - integrate with SMS service)
export const sendOTP: RequestHandler = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: "Phone number is required",
      });
    }

    // Generate 6-digit OTP (for demo, always use 123456)
    const otp = "123456"; // Fixed OTP for demo purposes

    // Store OTP in database (with expiry)
    const db = getDatabase();

    // Remove any existing OTPs for this phone
    await db.collection("otps").deleteMany({ phone });

    await db.collection("otps").insertOne({
      phone,
      otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    console.log(`OTP for ${phone}: ${otp}`);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "OTP sent successfully" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send OTP",
    });
  }
};

// Verify OTP
export const verifyOTP: RequestHandler = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        error: "Phone number and OTP are required",
      });
    }

    const db = getDatabase();

    // Find valid OTP
    const otpRecord = await db.collection("otps").findOne({
      phone,
      otp,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired OTP",
      });
    }

    // Delete used OTP
    await db.collection("otps").deleteOne({ _id: otpRecord._id });

    // Check if user exists
    let user = await db.collection("users").findOne({ phone });

    if (!user) {
      // Create new user for OTP login
      const newUser: Omit<User, "_id"> = {
        name: phone, // Use phone as name initially
        email: "",
        phone,
        password: "", // No password for OTP users
        userType: "seller",
        preferences: {
          propertyTypes: [],
          priceRange: { min: 0, max: 10000000 },
          locations: [],
        },
        favorites: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("users").insertOne(newUser);
      user = {
        _id: result.insertedId,
        ...newUser,
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        userType: user.userType,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    const response: ApiResponse<{
      token: string;
      user: any;
    }> = {
      success: true,
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
        },
      },
      message: "OTP verified successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify OTP",
    });
  }
};

// Get user profile
export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const userId = (req as any).userId; // From auth middleware

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    const response: ApiResponse<any> = {
      success: true,
      data: userWithoutPassword,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user profile",
    });
  }
};

// Update user profile
export const updateUserProfile: RequestHandler = async (req, res) => {
  try {
    const db = getDatabase();
    const userId = (req as any).userId; // From auth middleware
    const updateData = req.body;

    // Remove sensitive fields
    delete updateData.password;
    delete updateData._id;

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...updateData,
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
      data: { message: "Profile updated successfully" },
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
};
