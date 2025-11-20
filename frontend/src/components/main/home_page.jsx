// src/pages/home/HomePage.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { FaComment, FaArrowUp, FaTimes } from "react-icons/fa";
import "../../styles/homepage.css";

/**
 * SAMPLE IMAGE PATH(s) (from your uploads) — developer asked to include local file path.
 * We'll include them as test fallbacks (you mentioned these earlier).
 * The UI expects cloud URLs; these are only for quick local visual testing.
 */
const SAMPLE_IMAGE_PATH = "/mnt/data/Screenshot 2025-11-20 at 12.12.29 PM.png"; // (example)
const SAMPLE_IMAGE_PATH_2 = "/mnt/data/Screenshot 2025-11-20 at 12.13.22 PM.png";

/* ----------------------------
   CommentItem (memoized)
   ---------------------------- */
const CommentItem = React.memo(function CommentItem({
  node,
  level = 0,
  replyInputs,
  timeAgo,
  onReplyClick,
  onReplyChange,
  onReplySubmit,
}) {
  const replyVal = replyInputs[node._id];
  const showReplyInput = replyVal !== undefined;

  return (
    <div className="comment-item" style={{ marginLeft: level * 12 }}>
      <div className="comment-row">
        <div className="comment-avatar">
          {node.userId?.fullName
            ? node.userId.fullName
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()
            : "U"}
        </div>

        <div className="comment-main">
          <div className="comment-meta">
            <strong>{node.userId?.fullName || "User"}</strong>
            <span className="comment-time"> • {timeAgo(node.createdAt)}</span>
          </div>

          <div className="comment-text">{node.text}</div>

          <div className="comment-actions">
            <button
              className="reply-btn"
              onClick={(e) => {
                e.stopPropagation();
                onReplyClick(node._id);
              }}
            >
              Reply
            </button>

            {node.replies && node.replies.length > 0 && (
              <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>
                {node.replies.length} {node.replies.length === 1 ? "reply" : "replies"}
              </span>
            )}
          </div>

          {showReplyInput && (
            <div className="reply-row">
              <input
                id={`reply-${node._id}`}
                value={replyVal || ""}
                onChange={(e) => onReplyChange(node._id, e.target.value)}
                className="reply-input"
                placeholder="Write a reply..."
                autoFocus
              />
              <button
                className="reply-submit"
                onClick={async (ev) => {
                  ev.stopPropagation();
                  await onReplySubmit(node._id);
                }}
              >
                Send
              </button>
            </div>
          )}

          {Array.isArray(node.replies) && node.replies.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {node.replies.map((r) => (
                <CommentItem
                  key={r._id}
                  node={r}
                  level={level + 1}
                  replyInputs={replyInputs}
                  timeAgo={timeAgo}
                  onReplyClick={onReplyClick}
                  onReplyChange={onReplyChange}
                  onReplySubmit={onReplySubmit}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CommentItem.displayName = "CommentItem";

/* ----------------------------
   HomePage
   ---------------------------- */
export default function HomePage() {
  // complaints (existing)
  const [complaints, setComplaints] = useState([]);
  // announcements (new)
  const [announcements, setAnnouncements] = useState([]);

  const [user, setUser] = useState(null);
  const [interactionMap, setInteractionMap] = useState({});
  const [commentCountMap, setCommentCountMap] = useState({});

  // modal & comment state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [fullComplaint, setFullComplaint] = useState(null);
  const [commentsTree, setCommentsTree] = useState([]);
  const [loadingFull, setLoadingFull] = useState(false);

  const [mainCommentText, setMainCommentText] = useState("");
  const [replyInputs, setReplyInputs] = useState({});

  const mainCommentRef = useRef(null);

  /* ----------------------------
     Helpers
     ---------------------------- */
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  }, []);

  const timeAgo = useCallback((iso) => {
    if (!iso) return "";
    const d = Date.now() - new Date(iso).getTime();
    const m = Math.floor(d / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }, []);

  // client-side comment tree builder (fallback)
  const buildTreeFromFlat = useCallback((flatArray) => {
    if (!flatArray || flatArray.length === 0) return [];

    const map = {};
    const roots = [];

    flatArray.forEach((comment) => {
      const id = comment._id?.toString() || comment._id;
      map[id] = { ...comment, replies: [] };
    });

    flatArray.forEach((comment) => {
      const id = comment._id?.toString() || comment._id;
      const parentId = comment.parentId?.toString?.() || comment.parentId;
      if (!parentId) roots.push(map[id]);
      else if (map[parentId]) map[parentId].replies.push(map[id]);
      else roots.push(map[id]);
    });

    return roots;
  }, []);

  /* ----------------------------
     Load complaints + announcements
     ---------------------------- */
  useEffect(() => {
    const loadAll = async () => {
      // load current user from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      }

      // complaints
      try {
        const res = await fetch("http://localhost:7500/api/complaints", {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load complaints");
        const list = Array.isArray(data) ? data : Array.isArray(data.complaints) ? data.complaints : [];
        setComplaints(list);
      } catch (err) {
        console.error("Load complaints:", err);
        setComplaints([]);
      }

      // announcements
      try {
        const res2 = await fetch("http://localhost:7500/api/announcements", {
          headers: getAuthHeaders(),
        });
        const d2 = await res2.json();
        if (!res2.ok) throw new Error(d2.message || "Failed to load announcements");
        const annList = Array.isArray(d2) ? d2 : Array.isArray(d2.announcements) ? d2.announcements : [];
        setAnnouncements(annList);
      } catch (err) {
        console.error("Load announcements:", err);
        setAnnouncements([]);
      }
    };

    loadAll();
  }, [getAuthHeaders]);

  /* ----------------------------
     Fetch comments for a complaint (used in modal & counts)
     ---------------------------- */
  const fetchCommentsForComplaint = useCallback(
    async (complaintId) => {
      try {
        const res = await fetch(`http://localhost:7500/api/comments/${complaintId}`, {
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch comments");

        // Accept multiple shapes
        let flat = [];
        if (Array.isArray(data)) flat = data;
        else if (Array.isArray(data.flat)) flat = data.flat;
        else if (Array.isArray(data.comments)) flat = data.comments;
        else if (Array.isArray(data.commentsFlat)) flat = data.commentsFlat;

        // If backend provided tree, use it; otherwise build here
        if (data.commentsTree && Array.isArray(data.commentsTree)) {
          return { flat, tree: data.commentsTree };
        }

        const tree = buildTreeFromFlat(flat);
        return { flat, tree };
      } catch (err) {
        console.error("fetchCommentsForComplaint error:", err);
        return { flat: [], tree: [] };
      }
    },
    [getAuthHeaders, buildTreeFromFlat]
  );

  /* ----------------------------
     Refresh counts (comments & interactions)
     ---------------------------- */
  const refreshCommentsAndCounts = useCallback(
    async (complaintId) => {
      try {
        const [commentsData, rIntRaw] = await Promise.all([
          fetchCommentsForComplaint(complaintId),
          fetch(`http://localhost:7500/api/interactions/${complaintId}`, { headers: getAuthHeaders() }).then((r) => r.json()),
        ]);

        const { flat, tree } = commentsData;
        const rInt = rIntRaw || {};

        setCommentCountMap((prev) => ({ ...prev, [complaintId]: flat.length }));
        setInteractionMap((prev) => ({ ...prev, [complaintId]: { upvoteCount: rInt.upvoteCount ?? rInt.upvotes?.length ?? 0, upvotes: rInt.upvotes ?? [] } }));

        if (selectedComplaint && selectedComplaint._id === complaintId) {
          setCommentsTree(tree);
          setFullComplaint((prev) => (prev ? { ...prev, comments: flat } : { comments: flat }));
        }
      } catch (err) {
        console.error("refreshCommentsAndCounts:", err);
      }
    },
    [fetchCommentsForComplaint, getAuthHeaders, selectedComplaint]
  );

  /* ----------------------------
     Post comment / reply
     ---------------------------- */
  const postComment = useCallback(
    async (complaintId, text, parentId = null) => {
      if (!text || !text.trim()) return null;
      try {
        const res = await fetch(`http://localhost:7500/api/comments/${complaintId}`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ text, parentId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to post comment");

        // small delay then refresh
        await new Promise((r) => setTimeout(r, 200));
        await refreshCommentsAndCounts(complaintId);

        return data.comment ?? data.created ?? data;
      } catch (err) {
        console.error("postComment:", err);
        return null;
      }
    },
    [getAuthHeaders, refreshCommentsAndCounts]
  );

  /* ----------------------------
     Prefetch counts for complaints
     ---------------------------- */
  useEffect(() => {
    if (!complaints || complaints.length === 0) return;

    const fetchCounts = async () => {
      const imap = {};
      const cmap = {};

      await Promise.all(
        complaints.map(async (c) => {
          try {
            const r1 = await fetch(`http://localhost:7500/api/interactions/${c._id}`, { headers: getAuthHeaders() });
            const iData = await r1.json();
            imap[c._id] = { upvoteCount: iData?.upvoteCount ?? (iData?.upvotes ? iData.upvotes.length : 0), upvotes: iData?.upvotes ?? [] };
          } catch (err) {
            imap[c._id] = { upvoteCount: 0, upvotes: [] };
          }

          try {
            const { flat } = await fetchCommentsForComplaint(c._id);
            cmap[c._id] = flat.length;
          } catch (err) {
            cmap[c._id] = 0;
          }
        })
      );

      setInteractionMap((prev) => ({ ...prev, ...imap }));
      setCommentCountMap((prev) => ({ ...prev, ...cmap }));
    };

    fetchCounts();
  }, [complaints, getAuthHeaders, fetchCommentsForComplaint]);

  /* ----------------------------
     Open / close modals
     ---------------------------- */
  const openComplaintModal = useCallback(
    async (complaint) => {
      setSelectedComplaint(complaint);
      setSelectedAnnouncement(null);
      setFullComplaint(null);
      setLoadingFull(true);
      setCommentsTree([]);
      setReplyInputs({});
      setMainCommentText("");

      try {
        const { flat, tree } = await fetchCommentsForComplaint(complaint._id);
        setFullComplaint({ ...complaint, comments: flat });
        setCommentsTree(tree);
      } catch (err) {
        console.error("openComplaintModal:", err);
        setFullComplaint(null);
        setCommentsTree([]);
      } finally {
        setLoadingFull(false);
        setTimeout(() => mainCommentRef.current?.focus?.(), 120);
      }
    },
    [fetchCommentsForComplaint]
  );

  const closeComplaintModal = useCallback(() => {
    setSelectedComplaint(null);
    setFullComplaint(null);
    setCommentsTree([]);
    setMainCommentText("");
    setReplyInputs({});
  }, []);

  const openAnnouncementModal = useCallback((announcement) => {
    setSelectedAnnouncement(announcement);
    setSelectedComplaint(null);
  }, []);

  const closeAnnouncementModal = useCallback(() => {
    setSelectedAnnouncement(null);
  }, []);

  /* ----------------------------
     Upvote helpers
     ---------------------------- */
  const toggleUpvote = useCallback(
    async (complaintId) => {
      try {
        const res = await fetch(`http://localhost:7500/api/interactions/${complaintId}/upvote`, {
          method: "POST",
          headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Upvote failed");
        const interaction = data.interaction ?? data;
        setInteractionMap((prev) => ({ ...prev, [complaintId]: { upvoteCount: interaction.upvoteCount ?? interaction.upvotes?.length ?? 0, upvotes: interaction.upvotes ?? [] } }));
      } catch (err) {
        console.error("toggleUpvote:", err);
      }
    },
    [getAuthHeaders]
  );

  const hasUserUpvoted = useCallback(
    (complaintId) => {
      const interaction = interactionMap[complaintId];
      if (!interaction || !user) return false;
      const uid = user.id ?? user._id ?? user._id?.toString?.();
      return (interaction.upvotes || []).some((u) => {
        const raw = u && (u._id ?? u);
        return raw?.toString?.() === uid?.toString?.();
      });
    },
    [interactionMap, user]
  );

  /* ----------------------------
     Comment submit handlers
     ---------------------------- */
  const handleMainCommentSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      if (!selectedComplaint || !mainCommentText.trim()) return;
      const created = await postComment(selectedComplaint._id, mainCommentText, null);
      if (created) setMainCommentText("");
    },
    [mainCommentText, postComment, selectedComplaint]
  );

  const handleReplyClick = useCallback((nodeId) => {
    setReplyInputs((prev) => {
      if (nodeId in prev) return prev;
      return { ...prev, [nodeId]: "" };
    });
  }, []);

  const handleReplyChange = useCallback((nodeId, value) => {
    setReplyInputs((prev) => ({ ...prev, [nodeId]: value }));
  }, []);

  const handleReplySubmit = useCallback(
    async (parentId) => {
      if (!selectedComplaint) return;
      const text = (replyInputs[parentId] || "").trim();
      if (!text) return;
      const created = await postComment(selectedComplaint._id, text, parentId);
      if (created) {
        setReplyInputs((prev) => {
          const newInputs = { ...prev };
          delete newInputs[parentId];
          return newInputs;
        });
      }
    },
    [postComment, replyInputs, selectedComplaint]
  );

  /* ----------------------------
     Utilities
     ---------------------------- */
  const countTree = useCallback((tree) => {
    if (!Array.isArray(tree)) return 0;
    let n = 0;
    const stack = [...tree];
    while (stack.length) {
      const x = stack.pop();
      n++;
      if (Array.isArray(x.replies) && x.replies.length) stack.push(...x.replies);
    }
    return n;
  }, []);

  /* ----------------------------
     Merge complaints + announcements into a single feed (newest first)
     ---------------------------- */
  const feed = React.useMemo(() => {
    const ann = announcements.map((a) => ({ ...a, _type: "announcement", _created: a.createdAt || a.startDate || a._id }));
    const comp = complaints.map((c) => ({ ...c, _type: "complaint", _created: c.createdAt || c._id }));
    const getTime = (item) => {
      const v = item._created;
      const t = v ? Date.parse(String(v)) : 0;
      return isNaN(t) ? 0 : t;
    };
    return [...ann, ...comp].sort((a, b) => getTime(b) - getTime(a));
  }, [announcements, complaints]);

  /* ----------------------------
     Render
     ---------------------------- */
  return (
    <div className="homepage-container">
      {feed.length === 0 ? (
        <p className="empty-state">No posts yet.</p>
      ) : (
        feed.map((post) => {
          if (post._type === "announcement") {
            // announcement card (distinct visual + red speaker badge)
            return (
              <article
                key={post._id}
                className="announcement-card"
                onClick={() => openAnnouncementModal(post)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openAnnouncementModal(post)}
              >
                <div style={{ position: "relative" }}>
                  {/* red speaker icon top-right */}
                  <div style={{ position: "absolute", right: 12, top: 12, zIndex: 2 }}>
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 14,
                        padding: 6,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                      }}
                    >
                      <span style={{ color: "#d9534f", fontSize: 18 }}>📢</span>
                    </div>
                  </div>

                  <header className="card-header" style={{ paddingRight: 56 }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <h3 className="announcement-title" style={{ color: "#b52b2b", margin: 0 }}>
                        {post.title}
                      </h3>
                      <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                        {post.senderName ? `${post.senderName} • ` : ""}
                        {new Date(post.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </header>

                  <div style={{ padding: "0 16px 16px 16px" }}>
                    <p className="announcement-text">{post.message?.length > 220 ? `${post.message.slice(0, 220)}...` : post.message}</p>

                    {post.imageUrl && (
                      <div style={{ marginTop: 8 }}>
                        <img
                          src={typeof post.imageUrl === "string" && post.imageUrl.startsWith("http") ? post.imageUrl : SAMPLE_IMAGE_PATH}
                          alt=""
                          style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 10 }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          }

          // complaint card (unchanged visual + media rendering expects full URLs)
          const c = post;
          const upCount = interactionMap[c._id]?.upvoteCount ?? 0;
          const comCount = commentCountMap[c._id] ?? 0;
          const userUpvoted = hasUserUpvoted(c._id);

          return (
            <article
              key={c._id}
              className="complaint-card"
              onClick={() => openComplaintModal(c)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && openComplaintModal(c)}
            >
              <header className="card-header">
                <div className="profile-circle" title={c.user?.fullName || "User"}>
                  {(c.user?.fullName || "U")
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h3 className="user-name">{c.user?.fullName || "User"}</h3>
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
              </header>

              <h2 className="complaint-title">{c.title}</h2>

              <p className="complaint-description">{c.description?.length > 140 ? `${c.description.slice(0, 140)}...` : c.description}</p>

              {Array.isArray(c.media) && c.media.length > 0 && (
                <div className={`media-grid media-count-${Math.min(4, c.media.length)}`}>
                  {c.media.slice(0, 4).map((m, idx) => {
                    // cloudinary-only: m is expected to be a full URL (starts with http)
                    const isVideo = /\.(mp4|mov|webm|mkv|avi)$/i.test(m);
                    const src = typeof m === "string" && m.startsWith("http") ? m : SAMPLE_IMAGE_PATH_2;

                    return (
                      <div key={idx} className="media-box">
                        {isVideo ? (
                          <video src={src} controls className="media-item" onClick={(e) => e.stopPropagation()} />
                        ) : (
                          <img src={src} alt="" className="media-item" onClick={(e) => e.stopPropagation()} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <footer className="card-footer">
                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openComplaintModal(c);
                    setTimeout(() => mainCommentRef.current?.focus?.(), 120);
                  }}
                >
                  <FaComment /> <span className="count">{comCount}</span>
                </button>

                <button
                  className={`action-btn upvote-btn ${userUpvoted ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleUpvote(c._id);
                  }}
                >
                  <FaArrowUp /> <span className="count">{upCount}</span>
                </button>
              </footer>
            </article>
          );
        })
      )}

      {/* Complaint Modal */}
      {selectedComplaint && (
        <div className="complaint-modal-overlay" onClick={() => closeComplaintModal()}>
          <div className="complaint-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", gap: "14px", alignItems: "center", flexGrow: 1 }}>
                <div className="profile-circle">
                  {(selectedComplaint.user?.fullName || "U")
                    .split(" ")
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h3 className="user-name">{selectedComplaint.user?.fullName || "User"}</h3>
                  <span style={{ color: "#0b5b54", fontWeight: 600, fontSize: 14 }}>{new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <button className="close-btn" onClick={closeComplaintModal}>
                <FaTimes />
              </button>
            </div>

            <h2 className="modal-title-centered">{selectedComplaint.title}</h2>

            <div className="modal-body">
              <p className="modal-description">{selectedComplaint.description}</p>

              {/* Modal media grid (CLOUDINARY-only: media items are URLs) */}
              {Array.isArray(selectedComplaint.media) && selectedComplaint.media.length > 0 && (
                <div className={`modal-media-grid media-count-${Math.min(4, selectedComplaint.media.length)}`}>
                  {selectedComplaint.media.slice(0, 4).map((m, idx) => {
                    const isVideo = /\.(mp4|mov|webm|mkv|avi)$/i.test(m);
                    const src = typeof m === "string" && m.startsWith("http") ? m : SAMPLE_IMAGE_PATH;
                    return (
                      <div key={idx} className="modal-media-box">
                        {isVideo ? <video src={src} controls className="modal-media" /> : <img src={src} alt="" className="modal-media" />}
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
                <button
                  className={`action-btn upvote-btn ${interactionMap[selectedComplaint._id] && hasUserUpvoted(selectedComplaint._id) ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleUpvote(selectedComplaint._id);
                  }}
                >
                  <FaArrowUp /> <span className="count">{interactionMap[selectedComplaint._id]?.upvoteCount ?? 0}</span>
                </button>

                <div style={{ color: "var(--text-muted)" }}>
                  Comments: <strong>{commentCountMap[selectedComplaint._id] ?? fullComplaint?.comments?.length ?? countTree(commentsTree)}</strong>
                </div>

                <div style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: 13 }}>{loadingFull ? "Loading comments..." : ""}</div>
              </div>

              <div className="comment-section" style={{ marginTop: 16 }}>
                <h4 style={{ margin: "0 0 8px 0" }}>Comments</h4>

                <form className="comment-input-box" onSubmit={handleMainCommentSubmit}>
                  <input ref={mainCommentRef} className="comment-input" value={mainCommentText} onChange={(e) => setMainCommentText(e.target.value)} placeholder="Write a comment..." />
                  <button className="comment-submit" type="submit">
                    Post
                  </button>
                </form>

                <div className="all-comments" style={{ marginTop: 12 }}>
                  {commentsTree.length > 0 ? (
                    commentsTree.map((n) => (
                      <CommentItem key={n._id} node={n} level={0} replyInputs={replyInputs} timeAgo={timeAgo} onReplyClick={handleReplyClick} onReplyChange={handleReplyChange} onReplySubmit={handleReplySubmit} />
                    ))
                  ) : (
                    <div style={{ color: "var(--text-muted)" }}>No comments yet — be the first to comment.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {selectedAnnouncement && (
        <div className="complaint-modal-overlay" onClick={() => closeAnnouncementModal()}>
          <div className="complaint-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", gap: "14px", alignItems: "center", flexGrow: 1 }}>
                <div style={{ width: 48, height: 48, borderRadius: 999, background: "#ffecec", display: "flex", alignItems: "center", justifyContent: "center", color: "#d9534f", fontSize: 20 }}>
                  📢
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h3 className="user-name" style={{ color: "#b52b2b" }}>{selectedAnnouncement.senderName || "Admin"}</h3>
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{new Date(selectedAnnouncement.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <button className="close-btn" onClick={closeAnnouncementModal}>
                <FaTimes />
              </button>
            </div>

            <h2 className="modal-title-centered">{selectedAnnouncement.title}</h2>

            <div className="modal-body">
              <p className="modal-description">{selectedAnnouncement.message}</p>

              {selectedAnnouncement.imageUrl && (
                <div style={{ marginTop: 12 }}>
                  <img
                    src={typeof selectedAnnouncement.imageUrl === "string" && selectedAnnouncement.imageUrl.startsWith("http") ? selectedAnnouncement.imageUrl : SAMPLE_IMAGE_PATH}
                    alt=""
                    style={{ width: "100%", height: 320, objectFit: "cover", borderRadius: 10 }}
                  />
                </div>
              )}

              <div style={{ marginTop: 12, color: "var(--text-muted)" }}>
                <div><strong>Category:</strong> {selectedAnnouncement.category}</div>
                <div><strong>Location / Area:</strong> {selectedAnnouncement.location} {selectedAnnouncement.area ? `• ${selectedAnnouncement.area}` : ""}</div>
                {selectedAnnouncement.startDate && <div><strong>Start:</strong> {new Date(selectedAnnouncement.startDate).toLocaleString()}</div>}
                {selectedAnnouncement.endDate && <div><strong>End:</strong> {new Date(selectedAnnouncement.endDate).toLocaleString()}</div>}
                {selectedAnnouncement.contactEmail && <div><strong>Contact:</strong> {selectedAnnouncement.contactEmail}</div>}
                {selectedAnnouncement.contactPhone && <div><strong>Phone:</strong> {selectedAnnouncement.contactPhone}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
