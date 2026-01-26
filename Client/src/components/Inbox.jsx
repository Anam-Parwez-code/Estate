import { useEffect, useState } from "react";

export default function Inbox() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/message/inbox", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching inbox:", error);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Inbox</h1>
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li key={msg._id} className="border p-3 rounded-lg">
              <p>
                <span className="font-semibold">From:</span> {msg.senderId?.username} ({msg.senderId?.email})
              </p>
              <p>
                <span className="font-semibold">Listing:</span> {msg.listingId?.name} ({msg.listingId?.address})
              </p>
              <p className="mt-2">{msg.text}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(msg.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
