import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import io from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl; // everytime a request is made using axios, this baseURL will be used

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // children are the components that will be wrapped by this provider and will have access to the context values
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // Check if user is authenticated and if so, set the user data and connect the socket
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user); // if the user is authenticated, we want to establish a socket connection immediately so that we can receive real-time updates about online users and messages. We pass the user data to the connectSocket function, which uses the user ID to identify the socket connection on the backend.
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Login function to handle user authentication and socket connection
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["token"] = data.token; // set the token in axios headers. Now all future requests using Axios automatically include the token. No need to manually add it every time.
        setToken(data.token);
        localStorage.setItem("token", data.token); // store the token in local storage to persist login state
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Logout function to handle user logout and socket disconnection

  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["token"] = null; // remove the token from axios headers
    toast.success("Logged out successfully");
    socket.disconnect();
  };

  // Update profile function to handle user profile updates
  const updateProfile = async (body) => {
    // body contains the updated profile data that we want to send to the backend
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Connect socket function to handle socket connection and online users updates
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: { userId: userData._id }, // Send userId to the backend when establishing the socket connection. This allows the backend to identify which user is connected via which socket. userId came from server.js.
    });
    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds) => {
      // Listen for the "getOnlineUsers" event from the backend. The backend emits this event whenever a user connects or disconnects, sending the updated list of online user IDs.
      setOnlineUsers(userIds);
    });
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  }; // this is what that'll be shared globally, functions and states can be added here

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
