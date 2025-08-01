import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SwapRequestsInbox({ currentUserId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
console.log("currentUserId",currentUserId)
  // Fetch incoming requests
  const fetchIncomingRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("swap_requests")
      .select("*")
      .eq("to_user_id", currentUserId)
      .eq("status", "pending");

    if (error) {
      console.error("Error fetching swap requests:", error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIncomingRequests();
  }, [currentUserId]);

  const respondToRequest = async (requestId, decision) => {
    const { error } = await supabase
      .from("swap_requests")
      .update({ status: decision })
      .eq("id", requestId);

    if (error) {
      console.error(`Error updating request:`, error);
      alert("Failed to update request.");
    } else {
      alert(`Request ${decision}.`);
      fetchIncomingRequests(); // Refresh
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-lg font-bold mb-4">📨 Incoming Swap Requests</h2>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-600 italic">No pending requests.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li key={req.id} className="border rounded p-3 bg-gray-50">
              <p className="text-sm text-gray-800">
                <p><strong>From:</strong> {req.from_user_id}</p>
                  <p><strong>Item:</strong> {req.item_requested}</p>
                  <p><strong>Suggestion:</strong> <em>{req.suggestion}</em></p>

              </p>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => respondToRequest(req.id, "accepted")}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  ✅ Accept
                </button>
                <button
                  onClick={() => respondToRequest(req.id, "rejected")}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  ❌ Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
