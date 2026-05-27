

import jwt from 'jsonwebtoken';

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import prisma from '../../db/prisma-client.js';

export const verifyJWT = asyncHandler(async (req: any, res: any, next: any) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }
  
  try { 
    if (!process.env.SECRET_KEY) {
      throw Error("Secret Key not found")
    }
    
    const decodedToken:any = jwt.verify(token, process.env.SECRET_KEY);
    const user = await prisma.user.findFirst({
      where: { id: decodedToken?.sub }
    });

    if (!user) {
      // Client should make a request to /api/v1/users/refresh-token if they have refreshToken present in their cookie
      // Then they will get a new access token which will allow them to refresh the access token without logging out the user
      throw new ApiError(401, "Invalid access token");
    }
    req.user = user;
    next();
  } catch (error: any) {
    // Client should make a request to /api/v1/users/refresh-token if they have refreshToken present in their cookie
    // Then they will get a new access token which will allow them to refresh the access token without logging out the user
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
