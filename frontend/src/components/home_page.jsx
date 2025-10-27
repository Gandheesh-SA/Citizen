import React from "react";
import { FaComment, FaArrowUp } from "react-icons/fa";
import "../styles/homepage.css";

const dummyCards = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  userName: `User ${i + 1}`,
  complaintName: `Complaint ${i + 1}`,
  profilePic: `https://i.pravatar.cc/50?img=${i + 1}`,
  description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
  Curabitur vel sapien nec nulla dictum facilisis. 
  Suspendisse potenti. 
  Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
  Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
  Integer eget lectus nec mi faucibus lacinia.`, // more lines
  images: [
    `https://picsum.photos/300/150?random=${i + 1}`,
    `https://picsum.photos/300/150?random=${i + 11}`
  ]
}));

export default function HomePage() {
  return (
    <div className="page-container">
      {/* Fixed sidebar */}
     

      {/* Scrollable content */}
      <main className="content-scrollable">
        <h1 className="feed-title">Complaints Feed</h1>

        {dummyCards.map((card) => (
          <div className="complaint-card" key={card.id}>
            {/* Row 1: User info */}
            <div className="card-row card-row-top">
              <img src={card.profilePic} alt={card.userName} className="profile-pic" />
              <div className="user-info">
                <p className="user-name">{card.userName}</p>
                <p className="complaint-name">{card.complaintName}</p>
              </div>
            </div>

            {/* Row 2: Description + Images */}
            <div className="card-row card-row-middle">
              <p className="description">{card.description}</p>
              <div className="images-row">
                {card.images.map((img, index) => (
                  <img key={index} src={img} alt={`complaint-${index}`} className="complaint-image" />
                ))}
              </div>
            </div>

            {/* Row 3: Actions */}
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
      </main>
    </div>
  );
}
