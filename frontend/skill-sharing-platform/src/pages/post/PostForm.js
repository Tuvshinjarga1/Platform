import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Quill's stylesheet
import Header from "../../components/Header";

// Quill Editor-ийн toolbar тохиргоо
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "align",
  "blockquote",
  "code-block",
  "list",
  "bullet",
  "link",
  "image",
];

const PostForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [readingTime, setReadingTime] = useState(0);
  const navigate = useNavigate();

  // Хэрэглэгч нэвтэрсэн эсэхийг шалгах
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Энэ хуудсанд нэвтрэхийн тулд та эхлээд нэвтэрсэн байх шаардлагатай.");
      navigate("/login");
    }
  }, [navigate]);

  // Тайлбар өөрчлөгдөх бүрт унших хугацааг тооцоолох
  useEffect(() => {
    const words = description.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
    setReadingTime(Math.ceil(words / 200)); // 200 үг/минут орчимд уншина
  }, [description]);

  // Форм илгээх
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const postData = { title, description, category, readingTime };
      const response = await axios.post("https://platform-backend-zxgy.onrender.com/api/posts", postData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert(response.data.message);
      navigate("/post");
    } catch (error) {
      alert(error.response?.data?.message || "Нийтлэл үүсгэхэд алдаа гарлаа");
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Зүүн багана: Форм */}
          <div className="bg-white p-6 rounded-md shadow-sm">
            <h2 className="text-2xl font-semibold text-center text-blue-600 mb-6">
              Нийтлэл үүсгэх
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Гарчиг оруулах талбар */}
              <input
                type="text"
                placeholder="Гарчиг"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              {/* Ангилал сонгох талбар */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Ангилал сонгох</option>
                <option value="General">General</option>
                <option value="Technology">Technology</option>
                <option value="Health">Health</option>
                <option value="Travel">Travel</option>
                <option value="Education">Education</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>

              {/* Quill Editor: Тайлбар */}
              <ReactQuill
                theme="snow"
                value={description}
                onChange={setDescription}
                modules={modules}
                formats={formats}
                placeholder="Нийтлэлийнхээ агуулгыг энд бичнэ үү..."
                className="bg-white rounded-md"
              />

              {/* Унших хугацаа */}
              <p className="text-gray-600 text-sm">
                Тооцоолсон унших хугацаа: {readingTime}{" "}
                {readingTime === 1 ? "минут" : "минут"}
              </p>

              {/* Илгээх товч */}
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition duration-200"
              >
                Илгээх
              </button>
            </form>
          </div>

          {/* Баруун багана: Урьдчилсан харагдац (Preview) */}
          <div className="bg-white p-6 rounded-md shadow-inner">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Урьдчилсан харагдац</h2>
            
            {/* Урьдчилсан Гарчиг & Мэдээлэл */}
            <div className="mb-4">
              <h3 className="text-2xl font-semibold text-gray-900">
                {title || "Таны нийтлэлийн гарчиг энд харагдана"}
              </h3>
              <p className="text-sm text-gray-500">
                Ангилал: {category || "Сонгоогүй"} | {readingTime}{" "}
                {readingTime === 1 ? "минут" : "минут"} унших
              </p>
            </div>

            {/* Quill-ийн HTML-г шууд үзүүлэх */}
            <div
              className="prose max-w-none text-gray-800"
              dangerouslySetInnerHTML={{
                __html: description || "<p>Таны нийтлэлийн тайлбар энд харагдана</p>",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PostForm;
