import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify"; // HTML цэвэрлэх
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

// Chart.js бүртгэл
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// HTML-ээс эхний зураг болон 20 үгийн товч агуулга гаргах туслах функц
const extractImageAndSnippet = (htmlString) => {
  const cleanHTML = DOMPurify.sanitize(htmlString);
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cleanHTML;

  // Эхний <img> тагийг хайж, src-г салгаж авах
  const imgEl = tempDiv.querySelector("img");
  let imageUrl = "";
  if (imgEl) {
    imageUrl = imgEl.src;
    imgEl.remove();
  }

  // Үлдсэн текстээс 20 үг хүртэл тасдаж авах
  const plainText = tempDiv.textContent || tempDiv.innerText || "";
  const words = plainText.split(/\s+/).filter(Boolean);
  const snippet =
    words.length > 20 ? words.slice(0, 20).join(" ") + "..." : plainText.trim();

  return { imageUrl, snippet };
};

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState({ published: [], pending: [] });
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const navigate = useNavigate();

  // Хэрэглэгчийн нийтлэлийг татах
  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const postsResponse = await axios.get("https://platform-backend-zxgy.onrender.com/api/user/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userPosts = postsResponse.data;
      const categorizedPosts = {
        published: userPosts.filter((post) => post.status === "approved"),
        pending: userPosts.filter((post) => post.status === "pending"),
      };

      setPosts(categorizedPosts);
      setTotalPosts(userPosts.length);
      setTotalLikes(userPosts.reduce((sum, post) => sum + (post.likes.length || 0), 0));
      setTotalComments(userPosts.reduce((sum, post) => sum + (post.comments.length || 0), 0));
    } catch (error) {
      console.error("Алдаа:", error.message);
      alert("Нийтлэлийг татаж чадсангүй.");
    }
  };

  // Хэрэглэгчийн мэдээллийг татах
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Энэ хуудсанд нэвтрэхийн тулд та эхлээд нэвтэрсэн байх шаардлагатай.");
        navigate("/login");
        return;
      }

      try {
        const userResponse = await axios.get("https://platform-backend-zxgy.onrender.com/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(userResponse.data);
        fetchPosts();
      } catch (error) {
        console.error("Өгөгдөл татахад алдаа гарлаа:", error.message);
        alert("Өгөгдөл татаж чадсангүй. Та дахин нэвтэрнэ үү.");
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  // Пост засварлах
  const handleEdit = (postId) => {
    navigate(`/edit-post/${postId}`);
  };

  // Пост устгах
  const handleDelete = async (postId) => {
    const confirmDelete = window.confirm("Та энэ нийтлэлийг устгахдаа итгэлтэй байна уу?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      // UI-гээс урьдчилан устгаж харагдуулах
      setPosts((prevPosts) => ({
        ...prevPosts,
        published: prevPosts.published.filter((post) => post._id !== postId),
        pending: prevPosts.pending.filter((post) => post._id !== postId),
      }));

      // Сервер лүү устгах хүсэлт илгээх
      await axios.delete(`https://platform-backend-zxgy.onrender.com/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Нийтлэлийг амжилттай устгалаа");
    } catch (error) {
      console.error("Нийтлэлийг устгахад алдаа гарлаа:", error.message);
      await fetchPosts(); // Алдаа гарвал дахин сэргээж татах
      alert("Нийтлэлийг устгахад алдаа гарлаа");
    }
  };

  // Статистикийн мэдээлэл (Chart)
  const statsData = {
    labels: ["Нийтлэгдсэн", "Хянагдаж буй", "Нийт нийтлэл", "Нийт лайк", "Нийт коммент"],
    datasets: [
      {
        label: "Тоо",
        data: [
          posts.published.length,
          posts.pending.length,
          totalPosts,
          totalLikes,
          totalComments,
        ],
        backgroundColor: [
          "#34D399", // ногоон
          "#FBBF24", // шар
          "#3B82F6", // цэнхэр
          "#EF4444", // улаан
          "#A78BFA", // ягаан
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Постын картын загвар
  const postCardClass =
    "bg-gray-100 p-4 rounded-lg shadow-md my-2 h-80 flex flex-col";

  return userData ? (
    <>
      <Header />
      <div className="max-w-full mx-auto p-6 bg-gradient-to-r from-blue-100 to-pink-100 font-sans">
        <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-md">
          <h2 className="text-3xl font-semibold text-center text-blue-600 mb-4">
            Таны Самбар
          </h2>

          {/* Хоёр баганатай layout: Профайл + Статистик */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Профайл мэдээлэл */}
            <div className="bg-white shadow-md rounded-lg p-5 font-sans">
              <h3 className="text-xl font-semibold text-gray-800">Профайл мэдээлэл</h3>
              <hr className="my-2 border-gray-300" />
              <p>
                <strong>Хэрэглэгчийн нэр:</strong> {userData.username}
              </p>
              <p>
                <strong>Имэйл:</strong> {userData.email}
              </p>
              <p>
                <strong>Reputation:</strong> {userData.reputation}
              </p>
              <p>
                <strong>Цалин:</strong> {userData.salary}₮
              </p>
            </div>

            {/* Нийтлэлийн статистик (Chart) */}
            <div className="bg-white shadow-md rounded-lg p-5 flex flex-col">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Нийтлэлийн статистик</h3>
              <hr className="mb-4 border-gray-300" />
              <div className="flex-1 relative" style={{ minHeight: "250px" }}>
                <Bar
                  key={JSON.stringify(statsData)}
                  data={statsData}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>

          {/* Таны нийтлэлүүд */}
          <h3 className="text-2xl text-blue-600 font-semibold">Таны нийтлэлүүд</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Нийтлэгдсэн Нийтлэлүүд */}
            <div>
              <h4 className="text-xl text-green-600 font-semibold">Нийтлэгдсэн нийтлэлүүд</h4>
              {posts.published.length > 0 ? (
                posts.published.map((post) => {
                  const { imageUrl, snippet } = extractImageAndSnippet(post.description);
                  return (
                    <div key={post._id} className={postCardClass}>
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={post.title}
                          className="w-full h-32 object-cover rounded-md mb-2"
                        />
                      )}
                      <h5 className="text-lg font-semibold text-gray-800">{post.title}</h5>
                      <p className="text-sm text-gray-600 flex-grow">{snippet}</p>
                      <div className="flex justify-between mt-3">
                        <button
                          onClick={() => handleEdit(post._id)}
                          className="px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                        >
                          Засварлах
                        </button>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                        >
                          Устгах
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-600 bg-gray-200 p-3 rounded-md mt-2">
                  Одоогоор нийтлэгдсэн нийтлэл алга.
                </div>
              )}
            </div>

            {/* Хянагдаж буй Нийтлэлүүд */}
            <div>
              <h4 className="text-xl text-yellow-600 font-semibold">Хянагдаж буй нийтлэлүүд</h4>
              {posts.pending.length > 0 ? (
                posts.pending.map((post) => {
                  const { imageUrl, snippet } = extractImageAndSnippet(post.description);
                  return (
                    <div key={post._id} className={postCardClass}>
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={post.title}
                          className="w-full h-32 object-cover rounded-md mb-2"
                        />
                      )}
                      <h5 className="text-lg font-semibold text-gray-800">{post.title}</h5>
                      <p className="text-sm text-gray-600 flex-grow">{snippet}</p>
                      <div className="flex justify-between mt-3">
                        <button
                          onClick={() => handleEdit(post._id)}
                          className="px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                        >
                          Засварлах
                        </button>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                        >
                          Устгах
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-600 bg-gray-200 p-3 rounded-md mt-2">
                  Одоогоор хянагдаж буй нийтлэл алга.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <h2 className="text-center text-gray-500 mt-10">Ачаалж байна...</h2>
  );
};

export default Profile;
