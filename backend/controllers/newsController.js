const Parser = require("rss-parser");
const parser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0" }
});

exports.getCitizenNews = async (req, res) => {
  try {
    const keywords = [
      "Coimbatore road work",
      "Coimbatore infrastructure",
      "Coimbatore corporation",
      "Coimbatore water supply",
      "Coimbatore electricity",
      "Coimbatore environment",
      "Coimbatore law",
      "Coimbatore scheme",
      "Coimbatore smart city",
      "Coimbatore project"
    ];

    const query = keywords.join(" OR ");

    const feed = await parser.parseURL(
      `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`
    );

    const articles = feed.items.map(item => ({
      title: item.title,
      description: item.contentSnippet,
      url: item.link,
      publishedAt: item.pubDate,
      source: item.source,
    }));

    res.json({ success: true, total: articles.length, articles });
  } catch (err) {
    console.error("RSS Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch news" });
  }
};
