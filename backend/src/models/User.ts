import { Schema, model } from 'mongoose';

// This defines the structure of a User document in MongoDB
const userSchema = new Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Name is required'] 
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true, // Prevents two users from signing up with the same email
      lowercase: true,
      trim: true
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'] 
    },
    role: { 
      type: String, 
      enum: ['Admin', 'Sales User'], // Restricts inputs to only these two roles
      default: 'Sales User' // If no role is specified, they become a Sales User
    }
  },
  { 
    timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields for us!
  }
);

export const User = model('User', userSchema);