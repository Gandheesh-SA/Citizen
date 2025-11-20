// src/components/news/NewsCard.jsx
import React from "react";
import "../../styles/news.css";

export default function NewsCard({ article, index }) {
  const pastelColors = [
    "#FFDFD3", "#FEE9B2", "#D4F6CC", "#D7E3FC", "#F5D0FE",
    "#FFE5EC", "#E2F0CB", "#E8DFF5", "#D0F4DE", "#FDE2E4"
  ];

  // pick a pastel color based on index
  const bgColor = pastelColors[index % pastelColors.length];

  return (
    <div className="news-card">
      <div className="news-card-image-wrapper">
        {article.image ? (
          <img src={article.image} alt="news" className="news-card-img" />
        ) : (
          <div
            className="news-placeholder-full"
            style={{ backgroundColor: bgColor }}
          >
            {index + 1}
          </div>
        )}

        <span className="news-tag">Civic News</span>
      </div>

      <div className="news-card-body">
        <h4 className="news-card-title">{article.title}</h4>

        <p className="news-card-desc">
          {article.description?.slice(0, 120) || "No description available"}…
        </p>

        <div className="news-card-footer">
          <span className="news-source">
            {article.source?.name || "Unknown Source"}
          </span>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="news-read"
          >
            Read →
          </a>
        </div>
      </div>
    </div>
  );
}
