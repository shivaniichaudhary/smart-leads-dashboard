import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// This is a TypeScript custom trick: We extend Express's standard Request interface 
// so we can attach the logged-in user's data directly to the request object.
export interface CustomRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const protect = async (req: CustomRequest, res: Response, next: NextFunction): Promise<any> => {
  let token;

  // 1. Checks if the incoming request contains an Authorization header starting with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get the token from the header (e.g., "Bearer token_string_here")
      token = req.headers.authorization.split(' ')[1];

      // Decode and verify the token using our secret key [cite: 31]
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string; role: string };

      // Attach the user's ID and Role to the request so controllers can use it later [cite: 109]
      req.user = { id: decoded.id, role: decoded.role };

      // Move on to the next function (the controller) [cite: 37]
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Role-Based Access Control Gatekeeper [cite: 109]
// It takes an array of allowed roles, e.g., authorizeRoles(['Admin'])
export const authorizeRoles = (roles: string[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction): any => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role (${req.user?.role || 'Guest'}) is not allowed to access this resource` 
      });
    }
    next();
  };
};