import { createContext, useContext, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext.jsx";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  // function to get all users for left sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to get messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      setMessages(data.messages);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to send message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `api/messages/send/${selectedUser._id}`,
        messageData,
      );
      if (data.success) {
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const value = {};

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
