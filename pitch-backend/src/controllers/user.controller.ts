

import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import prisma from "../../db/prisma-client.js";


const registerUser = async (
  req: any,
  res: any
): Promise<Response> => {
  try {
    const { name, email, password } = req.body;
    console.warn(password);
    // Check existing user
    const existedUser = await prisma.user.findFirst({
      where: {
        OR: [{ name }, { email }],
      },
    });

    
    console.warn(existedUser);
    if (existedUser) {
      throw new ApiError(
        409,
        "User with email or username already exists"
      );
    }

    console.warn("reaching2")

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: password,
      },
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          id: user.id,
          username: user.name,
          email: user.email,
          isEmailVerified: true,
        },
        "User registered successfully"
      )
    );
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};


const loginAndGenerateToken = async (req: any, res: any) => {
  try {
    const { name, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        AND: [{ name }, { password }]
      }
    });
    const secret = process.env.SECRET_KEY;

    if (!secret) {
      throw new Error("SECRET_KEY is not defined");
    }

    if (user) {
      const token = jwt.sign({ sub: user.id, username: user.name, email: user.email }, secret, {
        expiresIn: "1h",
      });

      res.cookie("jwtToken", token, {
        expires: new Date(Date.now() + 1000000),
        httpOnly: true
      });

      res.status(200).json(new ApiResponse(200, { id: user.id, token: token, name: user.name }, "Token generated.."));
    } else {
      res
        .status(400)
        .json(new ApiResponse(400, "Username or pasword is incorrect", "Username or password is incorrect"));
    }
  }
  catch (error) {
    console.log(error);
    return error;
  }
};

const logOutAndRemoveToken = async (req: any, res: any) => {
  // remove cookie 
  await res.clearCookie('jwtToken');

  res.status(200).json(new ApiResponse(200, "", "Success"));
}

export {
  registerUser,
  loginAndGenerateToken,
  logOutAndRemoveToken
}