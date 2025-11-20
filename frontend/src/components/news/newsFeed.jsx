// src/components/news/NewsFeed.jsx
import React, { useEffect, useState } from "react";

import "../../styles/news.css";
import NewsCard from "./newsCard";

export default function NewsFeed() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("http://localhost:7500/api/news/coimbatore");
        const data = await res.json();

        if (data.success) {
          setNews(data.articles || []);
        } else {
          setError("Failed to load news");
        }
      } catch (err) {
        setError("Unable to fetch news");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) return <div className="news-loading">Loading news…</div>;
  if (error) return <div className="news-error">{error}</div>;

  return (
    <div className="news-feed">
      {news.length === 0 && <p>No news found for today.</p>}

      {news.map((a, i) => (
  <NewsCard article={a} index={i} key={i} />
))}
    </div>
  );
}
