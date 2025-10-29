import React, { useEffect, useState } from "react";
import { FaComment, FaArrowUp } from "react-icons/fa";
import "../styles/homepage.css";

const dummyCards = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  userName: `User ${i + 1}`,
  complaintName: `Complaint ${i + 1}`,
  profilePic: `https://i.pravatar.cc/50?img=${i + 1}`,
  description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  images: [
    `https://picsum.photos/300/150?random=${i + 1}`,
    `https://picsum.photos/300/150?random=${i + 11}`
  ]
}));

export default function HomePage() {
  const [greeting, setGreeting] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1️⃣ Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 2️⃣ Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="homepage-container">
      <h1 className="greeting">
        {greeting},{" "}
        <span className="username">{user ? user.fullName : "User"}!</span>
      </h1>
      <p className="location">
        You are at {user?.location || "your location"}.
      </p>

      {dummyCards.map((card) => (
        <div className="complaint-card" key={card.id}>
          <div className="card-row card-row-top">
            <img src={card.profilePic} alt={card.userName} className="profile-pic" />
            <div className="user-info">
              <p className="user-name">{card.userName}</p>
              <p className="complaint-name">{card.complaintName}</p>
            </div>
          </div>

          <div className="card-row card-row-middle">
            <p className="description">{card.description}</p>
            <div className="images-row">
              {card.images.map((img, index) => (
                <img key={index} src={img} alt={`complaint-${index}`} className="complaint-image" />
              ))}
            </div>
          </div>

          <div className="card-row card-row-bottom">
            <button className="action-btn">
              <FaComment /> Comment
            </button>
            <button className="action-btn">
              <FaArrowUp /> Upvote
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
