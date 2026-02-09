const summarizeFallback = (text) => {
  const cleaned = (text || "").replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return "A curated update highlighting the latest trends in tech, engineering, and AI.";
  }
  return cleaned.length > 240 ? `${cleaned.slice(0, 237)}...` : cleaned;
};

const generateSummary = async (title, body, category) => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const prompt = `Summarize the following blog for a tech audience in 1-2 sentences. Focus on actionable insights in ${category || "technology"}.\n\nTitle: ${title}\n\nBody: ${body}`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        input: prompt,
        max_output_tokens: 120,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI summary request failed", await response.text());
      return null;
    }

    const payload = await response.json();
    const summary = payload.output_text || "";
    return summary.trim() || null;
  } catch (error) {
    console.error("OpenAI summary request error", error.message);
    return null;
  }
};

module.exports = { generateSummary, summarizeFallback };
