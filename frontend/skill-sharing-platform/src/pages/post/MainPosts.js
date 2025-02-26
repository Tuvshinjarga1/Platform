import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

// Helper: Extract the first image and create a snippet of up to 12 words.
// If the description has fewer than 12 words, show all of them.
function extractFirstImageFromHTML(htmlString) {
  // Sanitize the HTML string to avoid XSS
  const cleanHTML = DOMPurify.sanitize(htmlString);

  // Create a temporary DOM element
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cleanHTML;

  // Find and remove the first <img> tag
  const imgEl = tempDiv.querySelector("img");
  let imageUrl = "";
  if (imgEl) {
    imageUrl = imgEl.src;
    imgEl.remove();
  }

  // Get plain text from the remaining HTML
  const plainText = tempDiv.textContent || tempDiv.innerText || "";
  const words = plainText.split(/\s+/).filter(Boolean);

  // If there are more than 12 words, truncate and append an ellipsis
  const snippet =
    words.length > 12
      ? words.slice(0, 12).join(" ") + "..."
      : plainText.trim();

  return { imageUrl, snippet };
}

const MainPosts = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/posts");
        if (response.status === 200) {
          // Filter approved posts only
          const approvedPosts = response.data.filter(
            (post) => post.status === "approved"
          );
          setPosts(approvedPosts);

          // Create a unique list of categories
          const uniqueCategories = [
            "All",
            ...new Set(
              approvedPosts.map((post) => post.category || "Uncategorized")
            ),
          ];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error("Error fetching posts:", error.message);
      }
    };

    const fetchUsername = () => {
      const storedUsername = localStorage.getItem("username");
      if (storedUsername) setUsername(storedUsername);
    };

    fetchPosts();
    fetchUsername();
  }, []);

  // Example "like" handler (currently attached to "READ MORE" button)
  const handleLike = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/posts/${id}/like`,
        {},
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === id ? { ...post, likes: response.data.likes } : post
        )
      );
    } catch (error) {
      alert(
        error.response?.status === 400
          ? "You have already liked this post!"
          : "Failed to like the post."
      );
    }
  };

  // Filter posts by selected category
  const filteredPosts =
    selectedCategory === "All"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  return (
    <>
      <Header />
      <div className="max-w-full mx-auto p-9 font-sans bg-gray-100">
        <div className="max-w-screen-xl mx-auto p-9">
        {username && (
          <div className="flex flex-col items-center mb-6 sm:flex-row sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              Сайн байна уу, {username}
            </h1>
            <button
              onClick={() => navigate("/create-post")}
              className="mt-4 sm:mt-0 px-5 py-2 bg-purple-500 text-white rounded-full"
            >
              Шинэ нийтлэл оруулах
            </button>
          </div>
        )}

        <div className="mb-6 text-center flex items-center">
          <p className="text-base text-gray-800"> Ангилал</p>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-full shadow-sm focus:ring focus:ring-blue-200 text-base"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredPosts.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full">
              No posts available in this category.
            </p>
          ) : (
            filteredPosts.map((post) => {
              // Extract the first image and snippet (first 12 words)
              const { imageUrl, snippet } = extractFirstImageFromHTML(
                post.description
              );

              // Fallback to post.image if no image found in description
              const cardImage =
                imageUrl ||
                post.image ||
                "https://via.placeholder.com/800x400?text=No+Image";

              return (
                <div
                  onClick={() => navigate(`/post/${post._id}?createdByUsername=${post.createdBy.username}&category=${post.category}`)}
                  key={post._id}
                  className="bg-white rounded-lg overflow-hidde flex flex-col hover:shadow-xl transition duration-300 px-2"
                >
                  {/* Top Image */}
                  <img
                    src={cardImage}
                    alt={post.title}
                    className="w-full aspect-video rounded-t object-cover"
                  />

                  {/* Category */}
                  <p className="text-sm text-pink-500 font-semibold mt-4">
                    Ангилал: {post.category || "Uncategorized"}
                  </p>

                  {/* Title */}
                  <h3
                    className="text-lg font-bold text-gray-800 cursor-pointer mt-2"
                    onClick={() => navigate(`/post/${post._id}?createdByUsername=${post.createdBy.username}&category=${post.category}`)}
                  >
                    {post.title}
                  </h3>

                  {/* Truncated Description (first 12 words or all if fewer) */}
                  <div className="text-gray-600 text-sm mt-2 flex-grow">
                    {snippet}
                  </div>

                  {/* Footer: "READ MORE" button & AWS logo */}
                  <div className="m-2 flex justify-between items-center border-collapse border-t border-gray-200">
                    <button
                      onClick={(e) =>         
                        {e.stopPropagation();
                        navigate(`/post/${post._id}?createdByUsername=${post.createdBy.username}&category=${post.category}`);}
                      }
                      className="rounded-t-none text-black rounded-full text-xs font-bold"
                    >
                      READ MORE
                    </button>
                    <img
                      src="https://blog.aws.mn/content/images/size/w150/2023/03/logo-white-background.png"
                      alt="AWS logo"
                      className="w-6 h-6"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MainPosts;
