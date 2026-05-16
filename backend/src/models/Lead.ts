import { Schema, model } from 'mongoose';

// This defines the exact fields required for our Leads module
const leadSchema = new Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Lead name is required'],
      trim: true
    },
    email: { 
      type: String, 
      required: [true, 'Lead email is required'],
      trim: true
    },
    status: { 
      type: String, 
      enum: ['New', 'Contacted', 'Qualified', 'Lost'], // Explicitly matches assignment requirements
      default: 'New' 
    },
    source: { 
      type: String, 
      enum: ['Website', 'Instagram', 'Referral'], // Explicitly matches assignment requirements
      required: [true, 'Lead source is required'] 
    }
  },
  { 
    timestamps: true // This covers our required 'Created At' field automatically! [cite: 60]
  }
);

export const Lead = model('Lead', leadSchema);