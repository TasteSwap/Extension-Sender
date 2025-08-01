const QLOO_API_KEY = 'xxxxxxxxxxxxxxxxxxxxxxxxx'; // Replace with your actual API key

export async function fetchQlooInsights() {
  const url = `https://hackathon.api.qloo.com/v2/insights?signal.interests.tags=urn:tag:genre:brand:fashion:footwear:sneakers&filter.type=urn:entity:brand`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Api-Key": QLOO_API_KEY,
      "Accept": "application/json"
    }
  });

const data = await response.json();
if (!data.success || !data.results?.entities) {
  console.warn("Qloo response invalid:", data);
  return [];
}

return (data?.results?.entities || []).map(entry => ({
  name: entry.name,
  entity_id: entry.entity_id,
  image: entry.properties?.image?.url ?? null,
  affinity: entry.query?.affinity ?? null,
  audience_growth: entry.query?.measurements?.audience_growth ?? null
}));


}

export async function fetchQlooTaste(productTitle, entityType = "brand") {
  const insights = await fetchQlooInsights();
  console.log("📦 Cultural insights:", insights);
  return insights;
}
