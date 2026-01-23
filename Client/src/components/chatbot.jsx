import React, { useState } from "react";
import axios from "axios";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi! Which city are you looking for a property in?" }
  ]);
  const [input, setInput] = useState("");

  // Simple parser for keywords
  const parseQuery = (text) => {
    const cityMatch = text.match(/kolkata|delhi|mumbai/i);
    const typeMatch = text.match(/2bhk|3bhk/i);
    const priceMatch = text.match(/(\d+)\s*lakh/i);

    return {
      city: cityMatch ? cityMatch[0] : null,
      type: typeMatch ? typeMatch[0].toUpperCase() : null,
      maxPrice: priceMatch ? parseInt(priceMatch[1]) * 100000 : null
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const query = parseQuery(input);

    try {
      const res = await axios.get("http://localhost:3000/api/listing/create", {
        params: query
      });

      if (res.data.length > 0) {
        const botMsg = {
          sender: "bot",
          text: `I found ${res.data.length} options for you:`
        };
        setMessages((prev) => [...prev, botMsg]);

        res.data.forEach((property) => {
          const cardMsg = {
            sender: "bot",
            text: `${property.title} — ₹${property.price} (${property.location})`
          };
          setMessages((prev) => [...prev, cardMsg]);
        });
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Sorry, no properties matched your search." }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Server error, please try again later." }
      ]);
    }

    setInput("");
  };

  return (
    <div style={{ width: "400px", border: "1px solid #ccc", padding: "10px" }}>
      <div style={{ height: "300px", overflowY: "auto", marginBottom: "10px" }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "5px 0"
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px",
                borderRadius: "10px",
                background: msg.sender === "user" ? "#007bff" : "#eee",
                color: msg.sender === "user" ? "#fff" : "#000"
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
          placeholder="Type your query..."
        />
        <button onClick={handleSend} style={{ marginLeft: "5px" }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
