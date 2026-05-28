import { createContext, useContext, useState, useEffect } from 'react'
import { requestHandler } from '../utils'
import Userservices from "../services/index";
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: any) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedAuth = localStorage.getItem('isAuthenticated')
    
    if (storedUser && storedAuth === 'true') {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (data: any) => {
    await requestHandler(
      async () =>
        await Userservices.GenerateLoginToken(data.name, data.password),
      null,
      (res: any) => {
        if (
          res.message === "Invalid credentials" ||
          res.message === "User not found"
        ) {
          toast.error(res.message);
          navigate("/login");
        } else {
          console.warn("reaching...");
          setUser(res.data);
          setIsAuthenticated(true);
          setToken(res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data));
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("token", res.data.token);
          toast.success("Login successful");

          navigate("/pitches");
        }
        
      },
      (error: any) => {
        console.warn(error);
        // navigate("/login");
        // toast.error(error?.message || "Invalid credentials");
      } 
    );
    
  }

  const logout = () => {
    
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    localStorage.setItem('isAuthenticated', 'false')
  }

  const register = async (data: {
    email: string,
    name: string,
    password: string,
  }) => {
    await requestHandler(
      async () =>
        await Userservices.registerUser(data.email, data.name, data.password),
      null,
      () => {
        alert("Account created successfully! Go ahead and login.");
        navigate("/login"); // Redirect to the login page after successful registration
      },
      alert
    );
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register, token }}>
      {children}
    </AuthContext.Provider>
  )
}