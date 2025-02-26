import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Quill's stylesheet
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }], // Header options
    ['bold', 'italic', 'underline', 'strike'], // Formatting buttons
    [{ color: [] }, { background: [] }], // Text color and background color
    [{ align: [] }], // Text alignment
    ['blockquote', 'code-block'], // Blockquote and code block
    [{ list: 'ordered' }, { list: 'bullet' }], // Ordered and unordered lists
    ['link', 'image'], // Insert link and image
    ['clean'], // Remove formatting
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'align',
  'blockquote',
  'code-block',
  'list',
  'bullet',
  'link',
  'image',
];

const EditPost = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [readingTime, setReadingTime] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://platform-backend-zxgy.onrender.com/api/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { title, description, category, readingTime } = response.data;
      setTitle(title);
      setDescription(description);
      setCategory(category);
      setReadingTime(readingTime);
    };

    fetchPost();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://platform-backend-zxgy.onrender.com/api/posts/${id}`,
        { title, description, category, readingTime },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Post updated successfully');
      navigate('/profile'); // Redirect to profile
    } catch (error) {
      console.error('Error updating post:', error.message);
      alert('Failed to update post');
    }
  };

  // Calculate reading time whenever the description changes
  useEffect(() => {
    const words = description.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length; // Strip HTML and count words
    setReadingTime(Math.ceil(words / 200)); // Average reading speed: 200 WPM
  }, [description]);

  return (
    <>
      <Header />
      <form onSubmit={handleUpdate} className="max-w-3xl mx-auto p-4 sm:p-8 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Edit Post</h2>

        {/* Title Input */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mb-4 p-2 w-full text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Category Input */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="mb-4 p-2 w-full text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="Technology">Technology</option>
          <option value="Health">Health</option>
          <option value="Travel">Travel</option>
          <option value="Education">Education</option>
          <option value="Lifestyle">Lifestyle</option>
        </select>

        {/* WYSIWYG Editor for Description */}
        <ReactQuill
          theme="snow"
          value={description}
          onChange={setDescription} // Save editor content to state
          modules={modules}
          formats={formats}
          placeholder="Edit your post description here..."
          className="mb-4 bg-white rounded-lg"
        />

        {/* Reading Time Display */}
        <p className="mb-4 text-sm text-gray-600">
          Estimated Reading Time: {readingTime} {readingTime === 1 ? 'minute' : 'minutes'}
        </p>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 text-lg font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Update Post
        </button>
      </form>
      <Footer />
    </>
  );
};

export default EditPost;
