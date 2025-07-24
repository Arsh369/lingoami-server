const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  const { from, to, message } = req.body;

  try {
    if (!from || !to || !message) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newMessage = await Message.create({
      from,
      to,
      message,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
};


exports.getMessages = async (req, res) => {
  const { from, to } = req.body;
  try {
    const msgs = await Message.find({
      $or: [
        { from, to },
        { from: to, to: from }
      ]
    }).sort({ createdAt: 1 });

    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages." });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const { from, to } = req.params;

    const messages = await Message.find({
      $or: [
        { from, to },
        { from: to, to: from },
      ],
    }).sort({ createdAt: 1 }); // oldest to newest

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
};