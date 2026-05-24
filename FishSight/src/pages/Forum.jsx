import React, { useState, useEffect, useRef } from 'react';
import { ForumService } from '../services/API';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import './Forum.css';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMyPosts, setFilterMyPosts] = useState(false); 
  
  const [commentInputs, setCommentInputs] = useState({});
  const [summaries, setSummaries] = useState({}); 
  const [isSummarizing, setIsSummarizing] = useState({}); 

  // NEW: State to track which post is currently playing the delete animation!
  const [deletingPostId, setDeletingPostId] = useState(null);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // 2. NEW: Toast Helper Function
  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

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

  // Mobile Swipe State and Refs
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 50; // The finger must move at least 50px to trigger a swipe

  // 3. NEW: The Touch Functions
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null; // Reset the end position
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentUser) {
      // Swiped Left (<-) : Go to My Posts
      setFilterMyPosts(true);
    }
    
    if (isRightSwipe) {
      // Swiped Right (->) : Go to All Posts
      setFilterMyPosts(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      await ForumService.createPost({ title: newTitle, content: newContent, username: currentUser });
      setNewTitle("");
      setNewContent("");
      setShowCreateForm(false); 
      fetchPosts(); 
      showToast("Post created successfully!", "success"); // <-- Replaced Alert
    } catch (error) {
      showToast("Failed to create post.", "error"); // <-- Replaced Alert
    }
  };

  const handleAddComment = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;
    try {
      await ForumService.addComment(postId, { content: commentText, username: currentUser });
      setCommentInputs({ ...commentInputs, [postId]: "" });
      fetchPosts(); 
      showToast("Comment added!", "success"); // <-- Replaced Alert
    } catch (error) {
      showToast("Failed to add comment.", "error"); // <-- Replaced Alert
    }
  };

  // --- UPDATED: Handle Animated Deleting ---
  const handleDeletePost = async (postId) => {
    setDeletingPostId(postId); 
    
    // 3. Wait for the 3.2s CSS shredder animation to finish before deleting from database
    setTimeout(async () => {
      try {
        await ForumService.deletePost(postId, { username: currentUser });
        fetchPosts(); 
        showToast("Post deleted successfully.", "success"); 
      } catch (error) {
        showToast("Failed to delete post.", "error"); 
      } finally {
        setDeletingPostId(null); 
      }
    }, 3200); 
  };

  const handleToggleLike = async (postId) => {
    if (!currentUser) return showToast("Please login to like posts.", "error"); // <-- Replaced Alert
    try {
      await ForumService.toggleLike(postId, { username: currentUser });
      fetchPosts(); 
    } catch (error) {
      showToast("Failed to like post.", "error"); // <-- Replaced Alert
    }
  };

  const handleSummarize = async (postId) => {
    setIsSummarizing({ ...isSummarizing, [postId]: true }); 
    try {
      const data = await ForumService.summarizePost(postId);
      setSummaries({ ...summaries, [postId]: data.summary }); 
    } catch (error) {
      showToast("Failed to generate AI summary.", "error"); // <-- Replaced Alert
    } finally {
      setIsSummarizing({ ...isSummarizing, [postId]: false }); 
    }
  };

  const handleAutoResize = (e) => {
    e.target.style.height = 'auto'; 
    e.target.style.height = `${e.target.scrollHeight + 2}px`; 
  };

  const displayedPosts = posts.filter(post => {
    const matchesSearch = post.Title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.Content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUser = filterMyPosts ? post.Username === currentUser : true;
    return matchesSearch && matchesUser;
  });

  if (loading) return <div className="forum-loading"><h2>Loading discussions...</h2></div>;

  return (
    <div className="forum-container">
        {/* 3. NEW: The Toast UI Component (Rendered at the top level) */}
      {toast.show && (
        <div className={`custom-toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
      <div className="forum-header">
        <h1>Community Forum</h1>
        <p>Ask questions, share your tank setups, and help other hobbyists!</p>
      </div>

      <div className="forum-search-bar">
        <span className="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Search..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="forum-controls">
        <div className="forum-tabs">
          <button className={`tab-btn ${!filterMyPosts ? 'active' : ''}`} onClick={() => setFilterMyPosts(false)}>All Posts</button>
          {currentUser && (
            <button className={`tab-btn ${filterMyPosts ? 'active' : ''}`} onClick={() => setFilterMyPosts(true)}>My Posts</button>
          )}
        </div>

        {currentUser && (
          /* UPGRADED: 3D FLIP BUTTON (Now supports SVGs!) */
          <button 
            className={`btn-flip ${showCreateForm ? 'is-flipped' : ''}`} 
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {/* Front of the button */}
            <div className="flip-front">
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} /> 
              Create New Post
            </div>
            
            {/* Back of the button */}
            <div className="flip-back">
              <FontAwesomeIcon icon={faTimes} style={{ marginRight: '8px' }} /> 
              Cancel
            </div>
          </button>
        )}
      </div>

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

      <div 
        className="forum-feed-wrapper"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >

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
                        
                        {/* NEW: ANIMATED DELETE BUTTON */}
                        {currentUser === post.Username && (
                        <button 
                            className={`delete-btn-animated ${deletingPostId === post._id ? 'delete' : ''}`} 
                            onClick={() => handleDeletePost(post._id)}
                            disabled={deletingPostId === post._id} // Prevents clicking twice!
                        >
                            <div className="trash">
                                <div className="top">
                                    <div className="paper"></div>
                                </div>
                                <div className="box"></div>
                                <div className="check">
                                    <svg viewBox="0 0 8 6">
                                        <polyline points="1 3.4 2.71428571 5 7 1"></polyline>
                                    </svg>
                                </div>
                            </div>
                            <span>Delete</span>
                        </button>
                        )}
                    </div>
                    <span className="post-meta">
                        Posted by <strong>{post.Username}</strong> on {new Date(post.Timestamp).toLocaleDateString('en-GB')}
                    </span>
                    </div>
                    
                    <p className="post-content">{post.Content}</p>

                    <div className="post-actions">
                        {/* UPGRADED ANIMATED LIKE BUTTON */}
                        <button className={`btn-like ${hasLiked ? 'liked' : ''}`} onClick={() => handleToggleLike(post._id)}>
                    
                            <div className="heart-container" title="Like">
                                {/* The checkbox is controlled by your React 'hasLiked' state! */}
                                <input 
                                    type="checkbox" 
                                    className="checkbox" 
                                    id={`like-${post._id}`} 
                                    checked={hasLiked} 
                                    readOnly 
                                />
                                <div className="svg-container">
                                    <svg viewBox="0 0 24 24" className="svg-outline" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"></path>
                                    </svg>
                                    <svg viewBox="0 0 24 24" className="svg-filled" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z"></path>
                                    </svg>
                                    <svg className="svg-celebrate" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                                        <polygon points="10,10 20,20"></polygon>
                                        <polygon points="10,50 20,50"></polygon>
                                        <polygon points="20,80 30,70"></polygon>
                                        <polygon points="90,10 80,20"></polygon>
                                        <polygon points="90,50 80,50"></polygon>
                                        <polygon points="80,80 70,70"></polygon>
                                    </svg>
                                </div>
                            </div>

                            <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
                        </button>
                    
                    {post.Comments && post.Comments.length > 0 && (
                        <button className="btn-ai-summary" onClick={() => handleSummarize(post._id)} disabled={isSummarizing[post._id]}>
                        {isSummarizing[post._id] ? "⏳ AI is reading..." : "✨ AI Summary"}
                        </button>
                    )}
                    </div>

                    {summaries[post._id] && (
                    <div className="ai-summary-box">
                        <strong>🤖 FishSight AI Summary:</strong>
                        <p>{summaries[post._id]}</p>
                    </div>
                    )}

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
                            rows="1"
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
    </div>
  );
};

export default Forum;