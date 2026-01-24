import React, { useState } from "react";
import axios from "axios";
import{Link} from "react-router-dom";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi! Which city are you looking for a property in?" }
  ]);
  const [input, setInput] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [currentListings, setCurrentListings] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  // Parse user input for city/type/price
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

  // Pagination helper
  const paginateListings = (listings, page) => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return listings.slice(start, end);
  };

 
  const formatListingMessage = (property) => {
    const price = property.discountPrice && property.discountPrice > 0
      ? property.discountPrice
      : property.regularPrice;

    const amenities = [
      property.furnished ? "Furnished" : "Unfurnished",
      property.parking ? "Parking Available" : "No Parking",
      `${property.bedrooms} Bed`,
      `${property.bathrooms} Bath`
    ].join(" | ");

    return {
      sender: "bot",
      content: (
        <div style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "10px",
          margin: "5px 0",
          background: "#f9f9f9"
        }}>
          {property.imageUrls[0] && (
            <Link to={`/listing/${property._id}`}> 

              <img src={property.imageUrls[0]} alt={property.name} style={{ width: "100%", borderRadius: "5px",cursor:"pointer" }} />
           </Link>
          )}
          <h4 style={{ margin: "5px 0" }}>{property.name} — ₹{price}</h4>
          <p style={{ margin: "5px 0" }}>{property.address}</p>
          <p style={{ fontSize: "0.9em", color: "#555", margin: "5px 0" }}>{amenities}</p>
        </div>
      )
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);

    const query = parseQuery(input);

    try {
      const res = await axios.get("http://localhost:3000/api/listing/get");
      let filteredListings = res.data;

      // Filters
      if (query.city) filteredListings = filteredListings.filter(item => item.address?.toLowerCase().includes(query.city.toLowerCase()));
      if (query.type) filteredListings = filteredListings.filter(item => item.type.toLowerCase() === query.type.toLowerCase());
      if (query.maxPrice) filteredListings = filteredListings.filter(item => {
        const price = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.regularPrice;
        return price <= query.maxPrice;
      });

      // Sort by price ascending
      filteredListings.sort((a, b) => {
        const priceA = a.discountPrice && a.discountPrice > 0 ? a.discountPrice : a.regularPrice;
        const priceB = b.discountPrice && b.discountPrice > 0 ? b.discountPrice : b.regularPrice;
        return priceA - priceB;
      });

      if (filteredListings.length > 0) {
        setCurrentPage(1);
        setTotalPages(Math.ceil(filteredListings.length / itemsPerPage));
        setCurrentListings(filteredListings);

        // Intro message
        setMessages(prev => [...prev, { sender: "bot", text: `I found ${filteredListings.length} options. Showing page 1 of ${Math.ceil(filteredListings.length / itemsPerPage)}:` }]);

        // First page listings
        const pageListings = paginateListings(filteredListings, 1);
        pageListings.forEach(property => {
          setMessages(prev => [...prev, formatListingMessage(property)]);
        });

        if (Math.ceil(filteredListings.length / itemsPerPage) > 1) {
          setMessages(prev => [...prev, { sender: "bot", text: `Type "next" to see more listings.` }]);
        }
      } else {
        setMessages(prev => [...prev, { sender: "bot", text: "Sorry, no properties matched your search." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: "bot", text: "Server error, please try again later." }]);
    }

    setInput("");
  };

  const handlePaginationCommand = (command) => {
    if (!currentListings.length) return;

    let newPage = currentPage;
    if (command === "next" && currentPage < totalPages) newPage++;
    else if (command === "previous" && currentPage > 1) newPage--;

    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      const pageListings = paginateListings(currentListings, newPage);

      setMessages(prev => [...prev, { sender: "bot", text: `Showing page ${newPage} of ${totalPages}:` }]);
      pageListings.forEach(property => {
        setMessages(prev => [...prev, formatListingMessage(property)]);
      });

      if (newPage < totalPages) {
        setMessages(prev => [...prev, { sender: "bot", text: `Type "next" to see more listings.` }]);
      }
      if (newPage > 1) {
        setMessages(prev => [...prev, { sender: "bot", text: `Type "previous" to go back.` }]);
      }
    }
  };

  const handleInputSubmit = () => {
    const cmd = input.trim().toLowerCase();
    if (cmd === "next" || cmd === "previous") {
      handlePaginationCommand(cmd);
      setInput("");
    } else {
      handleSend();
    }
  };

  return (
    <div style={{ width: "400px", border: "1px solid #ccc", padding: "10px" }}>
      <div style={{ height: "500px", overflowY: "auto", marginBottom: "10px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.sender === "user" ? "right" : "left", margin: "5px 0" }}>
            {msg.text ? (
              <span style={{
                display: "inline-block",
                padding: "8px",
                borderRadius: "10px",
                background: msg.sender === "user" ? "#007bff" : "#eee",
                color: msg.sender === "user" ? "#fff" : "#000",
                whiteSpace: "pre-wrap"
              }}>
                {msg.text}
              </span>
            ) : (
              msg.content
            )}
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
        <button onClick={handleInputSubmit} style={{ marginLeft: "5px" }}>Send</button>
      </div>
    </div>
  );
};

export default ChatBot;
