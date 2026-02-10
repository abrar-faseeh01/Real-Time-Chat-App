import Message from "../models/Message";
import User from "../models/User";

export const  getUsersForSidebar = async (req, res) => {
    try {
     const userId = req.user._id;
     const filteredUser = await User.find({_id:{$ne: userId}}).select("-password")   // Fetch distinct users who have chatted with the logged-in user
      // Count unseen messages from each user
      const unseenMessages={}

      const promises = filteredUser.map(async (user)=>{
        const messages = await Message.find({senderId: user._id  , receiverId: userId, seen: false})
        if(messages.length > 0){
           unseenMessages[user._id] = messages.length;
        }
      })
      await Promise.all(promises); // Wait for all promises to resolve before sending the response
      res.json({success: true, users: filteredUser, unseenMessages})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}



// controller to fetch chat messages between logged-in user and another user
export const getMessages = async (req,res)=>{
    try {
        const {id: selectedUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId: selectedUserId , receiverId: myId},
                {senderId: myId , receiverId: selectedUserId}
            ]
        })

        await Message.updateMany(   // mark messages as seen when the user opens the chat
            {senderId: selectedUserId , receiverId: myId}, {seen: true}
        )
        res.json({success: true, messages});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// api to mark messages as seen using message id
// This function is used to mark ONE specific message as “seen” (read).
export const markMessageAsSeen = async (re,res)=>{
    try {
        const{id}= req.params; // specific message id to mark as seen
        await Message.findByIdAndUpdate(id, {seen:true});
        res.json({success: true})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

