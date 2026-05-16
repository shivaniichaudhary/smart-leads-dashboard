import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Helper function to generate a JWT token containing user id and role [cite: 31, 109]
const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || '', {
    expiresIn: '30d', // Token lasts for 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Basic validation check [cite: 42]
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please add all required fields' });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // 3. Encrypt / Hash the user's password using bcrypt [cite: 36]
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Save the user into MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Sales User', // defaults to Sales User if nothing is specified [cite: 111]
    });

    // 5. Send success response back with a secure token [cite: 39, 40]
    return res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString(), user.role),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Compare inputted password with the database encrypted password [cite: 36]
    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id.toString(), user.role),
        },
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};