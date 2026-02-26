import { createContext, useContext, useEffect, useState } from "react";
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
        setMessages((prevMessages) => [...prevMessages, data.message]); // add the new message to the messages state
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to subscribe to messages for selected user - using this we will get the new messages in real time without refreshing the page
  const subscribeToMessages = async () => {
    if (!socket) return;
    socket.on("newMessage", (newMessage) => {
      // Listen for new messages from the server. Whenever a new message is received, this callback function will be executed.
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.put(`api/messages/mark/${newMessage._id}`);
      } else {
        // Message came from someone else while you are chatting with another person.
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
            ? prevUnseenMessages[newMessage.senderId] + 1
            : 1,
        }));
      }
    });
  };

  // function to unsubscribe from messages when user logs out or changes chat
  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => {
      unsubscribeFromMessages();
    };
  }, [socket, selectedUser]);

  const value = {
    messages,
    setMessages,
    selectedUser,
    setSelectedUser,
    users,
    getUsers,
    unseenMessages,
    setUnseenMessages,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
