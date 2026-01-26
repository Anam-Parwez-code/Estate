import Message from "../models/message.model.js";

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const newMessage = new Message({
      senderId: req.user.id,          // JWT se aaya hua user
      receiverId: req.body.receiverId, // landlord id
      listingId: req.body.listingId,   // optional: property reference
      text: req.body.text,             // message content
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending message" });
  }
};

// Get all messages for a user (inbox)
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ receiverId: req.user.id })
      .populate("senderId", "name email")
      .populate("listingId", "name address");
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching messages" });
  }
};
