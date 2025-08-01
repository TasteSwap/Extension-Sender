export default function TasteForm({ product }) {
  const [likes, setLikes] = useState(["", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [matches, setMatches] = useState([]);
  const [userId, setUserId] = useState(null);
  const [swapSuggestion, setSwapSuggestion] = useState(null);
  const [productTitle, setProductTitle] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    let storedId = localStorage.getItem("tasteSwapUserId");
    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem("tasteSwapUserId", storedId);
    }
    setUserId(storedId);
  }, []);

  const getLocalStorage = async (key) => {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key]);
      });
    });
  };

  useEffect(() => {
    (async () => {
      const productDetails = await getLocalStorage("tasteSwapProduct");
      if (productDetails) {
        setProductImage(productDetails.image);
        setProductTitle(productDetails.title);
      }
    })();
  }, []);

  useEffect(() => {
    chrome.storage?.local.get(["swapSuggestion"], (result) => {
      if (result?.swapSuggestion) {
        setSwapSuggestion(result.swapSuggestion);
      }
    });
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
        },
        () => {
          setLocation({ lat: null, lng: null });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const handleLikeChange = (index, value) => {
    const newLikes = [...likes];
    newLikes[index] = value;
    setLikes(newLikes);
  };

  const saveTasteProfile = async (brands) => {
    try {
      const itemData = await supabase.from("swap_items").insert({
        user_id: userId,
        title: productTitle,
        image_url: productImage,
        lat: location.lat,
        lng: location.lng,
      });

      const tasteData = await supabase.from("user_taste_profiles").insert({
        user_id: userId,
        tastes: brands.map((b) => b.name),
        lat: location.lat,
        lng: location.lng,
      });

      console.log("✅ Taste profile saved:", tasteData);
    } catch (err) {
      console.error("❌ Error saving taste profile:", err);
    }
  };
  const fetchOpenAI = async (prompt) => {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`, // or use a backend proxy
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // or "gpt-4" if available
          messages: [
            { role: "system", content: "You are a helpful assistant who crafts friendly swap messages." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 100,
        }),
      });

      const json = await response.json();

      if (json.choices?.length > 0) {
        return { text: json.choices[0].message.content.trim() };
      } else {
        console.warn("⚠️ OpenAI returned no response:", json);
        return { text: "Let’s swap! I’ve got something that matches your taste." };
      }
    } catch (error) {
      console.error("❌ Error fetching OpenAI response:", error);
      return { text: "Let’s swap! I’ve got something that matches your taste." };
    }
  };

  const handleSwapRequest = async (match) => {
    try {
      const brands = match.brands || [];
      const prompt = `You're writing a friendly swap message. The receiver's cultural affinities include: ${brands.map((b) => `- ${b.name}`).join("\n")}`;
      const response = await fetchOpenAI(prompt);
      const message = response.text || "Let’s swap! I’ve got something that matches your taste.";

      await supabase.from("swap_requests").insert({
        from_user_id: userId,
        to_user_id: match.user_id,
        item_requested: match.title,
        status: "pending",
        suggestion: message,
      });

      const newRequest = {
        to_user_id: match.user_id,
        title: match.title,
        image_url: match.image_url || null,
        entity_id: match.entity_id || '',
        popularity: match.popularity,
        affinity: match.affinity,
        audience_growth: match.audience_growth,
        timestamp: Date.now(),
      };

      const previous = JSON.parse(localStorage.getItem("sentSwapRequests") || "[]");
      localStorage.setItem("sentSwapRequests", JSON.stringify([...previous, newRequest]));
    } catch (err) {
      console.error("Error in sending request:", err);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      if (!productTitle) {
        alert("No product title found");
        return;
      }

      const tagUrn = `urn:tag:genre:brand:fashion:footwear:${productTitle.toLowerCase().replace(/\s+/g, "-")}`;
      const result = await fetchQlooTaste(tagUrn);
      const brands = result || [];

      if (brands.length === 0) {
        alert("No cultural matches found for this product.");
        return;
      }

      await saveTasteProfile(brands);

      const { data, error } = await supabase.rpc("find_nearby_matches", {
        current_user_id: userId,
        tastes: brands.map((b) => b.name),
        user_lat: location.lat,
        user_lng: location.lng,
      });

      if (error) {
        alert("Error finding matches.");
      } else {
        setMatches(data || []);
        if (!data || data.length === 0) {
          alert("No culturally compatible matches nearby.");
        }
      }
    } catch (e) {
      alert("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="popupRoot">
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      <div className="product-card">
        <p className="product-label">Based on your interest in:</p>
        <h3 className="product-title">{productTitle}</h3>
        {productImage && <img src={productImage} alt={productTitle} className="product-image" />}
      </div>

      <div className="swap-intro-message">
        👟 <strong>Looking to swap your <em>{productTitle}</em>?</strong><br />
        💫 Let’s find a fellow enthusiast who vibes with your taste!
      </div>

      <button className="swap-button" onClick={submit} disabled={submitting}>
        {submitting ? "🔄 Saving..." : "✨ Save & Find Matches"}
      </button>

      {swapSuggestion && <p className="ai-suggestion">🧠 AI Suggestion: {swapSuggestion}</p>}

      {matches.length > 0 && (
        <div className="matches-section">
          <h4 className="matches-heading">
            🎯 Your taste matches these items!
            <br /><span>Popularity, affinity, and audience growth help you decide better.</span>
          </h4>
          {matches.map((match, idx) => (
            <li key={idx} className="match-card">
              <p className="text-lg font-bold">{match.title}</p>
              <p><strong>📦 Entity ID:</strong> {match.entity_id}</p>
              <p><strong>🔥 Popularity:</strong> {match.popularity?.toFixed(3)}</p>
              <p><strong>🤝 Affinity:</strong> {match.affinity?.toFixed(3)}</p>
              <p><strong>📈 Growth:</strong> {match.audience_growth?.toFixed(3)}</p>
              {match.image_url && <img src={match.image_url} alt={match.title} className="match-image" />}
              <p>👤 Swapper ID: {match.user_id}</p>
              <button onClick={() => handleSwapRequest(match)}>
                🤝 Send Swap Request
              </button>
            </li>
          ))}
        </div>
      )}
    </div>
  );
}
