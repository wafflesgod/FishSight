import React, { useState, useEffect } from 'react';
import { ForumService } from '../services/api';
import './Forum.css';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for creating a new post
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false); // Controls the collapsible box
  
  // States for Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMyPosts, setFilterMyPosts] = useState(false); // Controls the "My Posts" toggle
  
  const [commentInputs, setCommentInputs] = useState({});

  const currentUser = localStorage.getItem('username'); 

  const fetchPosts = async () => {
    try {
      const data = await ForumService.getPosts();
      setPosts(data);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      await ForumService.createPost({
        title: newTitle,
        content: newContent,
        username: currentUser
      });
      setNewTitle("");
      setNewContent("");
      setShowCreateForm(false); // Close the box after posting
      fetchPosts(); 
    } catch (error) {
      alert("Failed to create post.");
    }
  };

  const handleAddComment = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    try {
      await ForumService.addComment(postId, { content: commentText, username: currentUser });
      setCommentInputs({ ...commentInputs, [postId]: "" });
      fetchPosts(); 
    } catch (error) {
      alert("Failed to add comment.");
    }
  };

  // --- NEW: Handle Deleting ---
  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
      try {
        await ForumService.deletePost(postId, { username: currentUser });
        fetchPosts(); // Refresh feed
      } catch (error) {
        alert("Failed to delete post.");
      }
    }
  };

  // --- NEW: Handle Liking ---
  const handleToggleLike = async (postId) => {
    if (!currentUser) return alert("Please login to like posts.");
    try {
      await ForumService.toggleLike(postId, { username: currentUser });
      fetchPosts(); // Refresh feed to update like count
    } catch (error) {
      alert("Failed to like post.");
    }
  };

  // Auto-resize textarea
  const handleAutoResize = (e) => {
    e.target.style.height = 'auto'; 
    e.target.style.height = `${e.target.scrollHeight}px`; 
  };

  // --- COMBINED FILTER LOGIC (Search + My Posts) ---
  const displayedPosts = posts.filter(post => {
    const matchesSearch = post.Title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.Content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUser = filterMyPosts ? post.Username === currentUser : true;
    return matchesSearch && matchesUser;
  });

  if (loading) return <div className="forum-loading"><h2>Loading discussions...</h2></div>;

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1>Community Forum</h1>
        <p>Ask questions, share your tank setups, and help other hobbyists!</p>
      </div>

      {/* --- LIVE SEARCH BAR --- */}
      <div className="forum-search-bar">
        <span className="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Search for species, tank setups, or advice..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* --- TOGGLE & CREATE BUTTON ROW --- */}
      <div className="forum-controls">
        <div className="forum-tabs">
          <button className={`tab-btn ${!filterMyPosts ? 'active' : ''}`} onClick={() => setFilterMyPosts(false)}>All Posts</button>
          {currentUser && (
            <button className={`tab-btn ${filterMyPosts ? 'active' : ''}`} onClick={() => setFilterMyPosts(true)}>My Posts</button>
          )}
        </div>

        {currentUser && (
          <button className="btn-toggle-post" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? "✖ Cancel" : "➕ Create New Post"}
          </button>
        )}
      </div>

      {/* COLLAPSIBLE CREATE POST BOX */}
      {currentUser ? (
        showCreateForm && (
          <form className="create-post-box" onSubmit={handleCreatePost}>
            <h3>Start a Discussion</h3>
            <input 
              type="text" 
              placeholder="Post Title..." 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <textarea 
              placeholder="What's on your mind?" 
              value={newContent}
              onChange={(e) => {
                setNewContent(e.target.value);
                handleAutoResize(e);
              }}
              required
            />
            <button type="submit" className="btn-submit-post">Post</button>
          </form>
        )
      ) : (
        <div className="login-prompt">
          <p>Please <strong>Login</strong> or <strong>Register</strong> to join the discussion.</p>
        </div>
      )}

      {/* THE FORUM FEED */}
      <div className="forum-feed">
        {displayedPosts.length === 0 ? (
          <p className="no-posts">
            {searchQuery || filterMyPosts ? "No posts found." : "No posts yet. Be the first to start a discussion!"}
          </p>
        ) : (
          displayedPosts.map((post) => {
            const likeCount = post.LikedBy ? post.LikedBy.length : 0;
            const hasLiked = currentUser && post.LikedBy && post.LikedBy.includes(currentUser);

            return (
              <div key={post._id} className="post-card">
                <div className="post-header">
                  <div className="post-header-top">
                    <h2>{post.Title}</h2>
                    {/* DELETE BUTTON (Only shows if it's your post) */}
                    {currentUser === post.Username && (
                      <button className="btn-delete" onClick={() => handleDeletePost(post._id)} title="Delete Post">🗑️</button>
                    )}
                  </div>
                  <span className="post-meta">
                    Posted by <strong>{post.Username}</strong> on {new Date(post.Timestamp).toLocaleDateString('en-GB')}
                  </span>
                </div>
                
                <p className="post-content">{post.Content}</p>

                {/* LIKE BUTTON SECTION */}
                <div className="post-actions">
                  <button className={`btn-like ${hasLiked ? 'liked' : ''}`} onClick={() => handleToggleLike(post._id)}>
                    {hasLiked ? '❤️' : '🤍'} {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
                  </button>
                </div>

                {/* COMMENTS SECTION */}
                <div className="comments-section">
                  <h4>Comments ({post.Comments ? post.Comments.length : 0})</h4>
                  <div className="comments-list">
                    {post.Comments && post.Comments.map((comment, idx) => (
                      <div key={idx} className="comment-bubble">
                        <div className="comment-header">
                          <strong>{comment.Username}</strong>
                          <span className="comment-date">
                            {comment.Timestamp ? new Date(comment.Timestamp).toLocaleDateString('en-GB') : ""}
                          </span>
                        </div>
                        <div className="comment-text">{comment.Content}</div>
                      </div>
                    ))}
                  </div>

                  {currentUser && (
                    <div className="add-comment-box">
                      <textarea 
                        placeholder="Write a reply..." 
                        value={commentInputs[post._id] || ""}
                        onChange={(e) => {
                          setCommentInputs({ ...commentInputs, [post._id]: e.target.value });
                          handleAutoResize(e);
                        }}
                      />
                      <button onClick={() => handleAddComment(post._id)}>Reply</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Forum;