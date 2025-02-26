import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";
import DOMPurify from "dompurify";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const AWS_LOGO_URL = "https://blog.aws.mn/content/images/size/w150/2023/03/logo-white-background.png";

/** 
 * HTML доторх <img> тагуудыг устгаж, зөвхөн текст агуулгыг тасдаж авна.
 * @param {string} htmlString - Тухайн постын HTML агуулга (description)
 * @param {number} maxWords - Тасдаж авах үгийн тоо
 * @returns {string} - Зураггүй, текстийн snippet
 */
function getTextSnippet(htmlString, maxWords = 12) {
  // HTML-ийг санитлаж, түр div дээр суулгаж, <img>-ийг устгана
  const cleanHTML = DOMPurify.sanitize(htmlString);
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cleanHTML;
  const images = tempDiv.querySelectorAll("img");
  images.forEach((img) => img.remove());

  // Үлдсэн текстийг maxWords үгээр тасдаж авна
  const text = tempDiv.textContent || tempDiv.innerText || "";
  const words = text.split(/\s+/).filter(Boolean);
  const snippet =
    words.length > maxWords
      ? words.slice(0, maxWords).join(" ") + "..."
      : text.trim();
  return snippet;
}

/**
 * Extract the first image URL from an HTML string and remove the image tag.
 * @param {string} htmlString - The HTML string to process.
 * @returns {object} - An object containing the image URL and the cleaned HTML string.
 */
function extractFirstImageFromHTML(htmlString) {
  const cleanHTML = DOMPurify.sanitize(htmlString);
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cleanHTML;

  const imgEl = tempDiv.querySelector("img");
  let imageUrl = "";
  if (imgEl) {
    imageUrl = imgEl.src;
    imgEl.remove();
  }

  return { imageUrl, cleanedHTML: tempDiv.innerHTML };
}

const PostDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const createdByUsername = new URLSearchParams(location.search).get("createdByUsername");
  const category = new URLSearchParams(location.search).get("category");

  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [comment, setComment] = useState("");
  const [username, setUsername] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [reply, setReply] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  // Тухайн постын мэдээлэл татах
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        console.error("Error fetching post:", error.message);
      }
    };

    // Хэрэглэгчийн мэдээлэл эсвэл IP
    const fetchUserOrIp = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get("http://localhost:5000/api/user", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsername(response.data.username);
        } catch (error) {
          console.error("Error fetching user:", error.message);
        }
      } else {
        try {
          const ipResponse = await axios.get("https://api64.ipify.org?format=json");
          setIpAddress(ipResponse.data.ip);
        } catch (error) {
          console.error("Error fetching IP address:", error.message);
        }
      }
    };

    fetchPost();
    fetchUserOrIp();
  }, [id]);

  // Related постуудыг татах
  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/related?category=${encodeURIComponent(category)}`
        );
        setRelatedPosts(response.data);
      } catch (error) {
        console.error("Error fetching related posts:", error.message);
      }
    };
    if (category) {
      fetchRelatedPosts();
    }
  }, [category]);

  // Лайк хийх
  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/posts/${id}/like`,
        {},
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      const updatedLikes = response.data.likes || post.likes;
      setPost((prevPost) => ({ ...prevPost, likes: updatedLikes }));
    } catch (error) {
      console.error("Error liking post:", error.message);
      alert(error.response?.data?.message || "Failed to like post");
    }
  };

  // Коммент бичих
  const handleComment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const commentData = {
        content: comment,
        user: username || ipAddress,
      };
      const response = await axios.post(
        `http://localhost:5000/api/posts/${id}/comment`,
        commentData,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setPost((prevPost) => ({
        ...prevPost,
        comments: [...prevPost.comments, response.data.comment],
      }));
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error.message);
    }
  };

  // Хариу бичих
  const handleReply = async (e, parentCommentId) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const replyData = {
        content: reply,
        user: username || ipAddress,
      };
      const response = await axios.post(
        `http://localhost:5000/api/posts/${id}/comment/${parentCommentId}/reply`,
        replyData,
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setPost((prevPost) => {
        const updatedComments = prevPost.comments.map((comment) =>
          comment._id === parentCommentId
            ? {
                ...comment,
                replies: [...(comment.replies || []), response.data.reply],
              }
            : comment
        );
        return { ...prevPost, comments: updatedComments };
      });
      setReply("");
      setReplyTo(null);
    } catch (error) {
      console.error("Error replying to comment:", error.message);
    }
  };

  // Мэдэгдэх (Report)
  const handleReport = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/posts/${id}/report`,
        { reason: reportReason },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      alert("Report submitted successfully");
      setReportReason("");
      setShowReportModal(false);
    } catch (error) {
      console.error("Error reporting post:", error.message);
      alert("Failed to submit report");
    }
  };

  // Шэйрлэх
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: "Check out this post!",
          url: window.location.href,
        })
        .then(() => console.log("Content shared successfully"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("URL copied to clipboard!"))
        .catch((error) => alert("Failed to copy URL to clipboard."));
    }
  };

  // Постын гол агуулгыг санитлаж, шууд харуулах
  const sanitizedPostDescription = post ? DOMPurify.sanitize(post.description) : "";

  return post ? (
    <>
      <Header />
      <div className="max-w-2xl mx-auto py-8 font-sans">
        {/* Постын үндсэн мэдээлэл */}
        <p className="text-xs text-gray-500 font-sans">
          <strong>
            BY <span className="text-black uppercase">{createdByUsername}</span> IN{" "}
            <span className="text-pink-500 uppercase">{category}</span>
          </strong>
        </p>
        <p className="text-sm text-gray-600 font-sans">
          Унших хугацаа: {post.readingTime || 0} минут
        </p>
        <h1 className="text-4xl font-sans text-gray-900 leading-tight text-left mb-5 mt-5">
          <strong>{post.title}</strong>
        </h1>
        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto mt-6 rounded-lg shadow-lg"
          />
        )}

        <div className="prose lg:prose-lg mt-6 text-gray-800 leading-relaxed font-sans">
          <div dangerouslySetInnerHTML={{ __html: sanitizedPostDescription }} />
        </div>

        {/* Үйлдлийн товчлуурууд */}
        <div className="flex items-center gap-4 mb-6 mt-2">
          <button
            onClick={handleLike}
            className="px-4 py-2 border border-gray-300 text-gray-800 rounded-full hover:bg-blue-300 transition text-sm font-sans"
          >
            {post.likes.length} 👍
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 border text-black rounded-full hover:bg-red-400 transition text-sm font-sans"
          >
            📝 Мэдэгдэх
          </button>
          <button
            onClick={handleShare}
            className="px-4 py-2 border text-black rounded-full hover:bg-red-400 transition text-sm font-sans"
          >
            ➢ Хуваалцах
          </button>
        </div>

        {/* Мэдэгдэх (Report) Modal */}
        {showReportModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full font-sans">
              <h3 className="text-lg mb-4">Пост мэдэгдэх</h3>
              <textarea
                placeholder="Энэхүү постыг яагаад мэдэгдэж байгаа вэ?"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full h-24 p-2 border border-gray-200 rounded-md mb-4"
              ></textarea>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Болих
                </button>
                <button
                  onClick={handleReport}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Илгээх
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Related Posts */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Санал болгох</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedPosts.map((rPost) => {
              // 'img' tag-уудыг устгаж, зөвхөн текст snippet гаргах
              const snippet = getTextSnippet(rPost.description, 20);

              // post.image байвал шууд, эсвэл description-аас эхний зургийг гаргах
              const firstImg = extractFirstImageFromHTML(rPost.description).imageUrl;
              const cardImage = rPost.image || firstImg || "https://via.placeholder.com/600x300";

              return (
                <div
                  key={rPost._id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300 flex flex-col cursor-pointer"
                  onClick={() =>
                    window.location.assign(
                      `/post/${rPost._id}?createdByUsername=${encodeURIComponent(
                        rPost.createdBy.username
                      )}&category=${encodeURIComponent(rPost.category)}`
                    )
                  }
                >
                  <img
                    src={cardImage}
                    alt={rPost.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4 flex-grow">
                    <p className="text-xs text-pink-500 font-semibold">
                      {rPost.category || "Uncategorized"}
                    </p>
                    <h3 className="text-md font-bold text-gray-800 mt-2">
                      {rPost.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      {snippet}
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.assign(
                          `/post/${rPost._id}?createdByUsername=${encodeURIComponent(
                            rPost.createdBy.username
                          )}&category=${encodeURIComponent(rPost.category)}`
                        );
                      }}
                      className="text-xs text-black-500 font-bold hover:text-blue-600"
                    >
                      READ MORE
                    </button>
                    <img
                      src={AWS_LOGO_URL}
                      alt="AWS logo"
                      className="w-6 h-6"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleComment} className="mb-6 font-sans mt-10">
          <textarea
            placeholder="Коммент бичих..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md text-sm mb-3"
          ></textarea>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-600 transition text-sm"
          >
            Коммент оруулах
          </button>
        </form>

        {/* Comments List */}
        <div className="font-sans">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Комментууд:</h3>
          {post.comments.map((c) => (
            <div
              key={c._id}
              className="p-3 border-b border-gray-200 mb-4 text-sm text-gray-700"
            >
              <strong className="text-black-600">{c.user}</strong>: {c.content}
              <button
                onClick={() => setReplyTo(c._id)}
                className="ml-3 px-3 py-1 text-xs bg-black text-white rounded-lg hover:bg-gray-600 transition"
              >
                ↩
              </button>
              {replyTo === c._id && (
                <form onSubmit={(e) => handleReply(e, c._id)} className="mt-3">
                  <textarea
                    placeholder="Хариулт бичих..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md text-sm mb-3"
                  ></textarea>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-black text-white rounded-full hover:bg-gray-600 transition"
                  >
                    Хариулт оруулах
                  </button>
                </form>
              )}
              {c.replies && c.replies.length > 0 && (
                <div className="mt-3 pl-5 border-l border-gray-200">
                  {c.replies.map((r, index) => (
                    <div key={index} className="mb-3">
                      <strong className="text-gray-500">{r.user}</strong>: {r.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <p className="text-center text-gray-500">Loading post...</p>
  );
};

export default PostDetail;
