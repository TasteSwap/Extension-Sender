import React, { useEffect, useState } from "react";
import SwapRequestsInbox from "./SwapRequestsInbox";

export default function SwapInboxPage() {
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem("tasteSwapUserId");
    if (storedId) {
      setCurrentUserId(storedId);
    }
  }, []);

  if (!currentUserId) {
    return <p className="text-gray-500">Loading your user session...</p>;
  }

  return (
    <div className="max-w-xl mx-auto mt-6">
      <h1 className="text-2xl font-bold mb-4">🔁 Your Swap Inbox</h1>
      <SwapRequestsInbox currentUserId={currentUserId} />
    </div>
  );
}
