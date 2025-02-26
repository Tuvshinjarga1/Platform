import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('role', response.data.role);

      alert(response.data.message);

      if (response.data.role === 'admin') {
        navigate('/dashboard', { state: { username: response.data.username } });
      } else {
        navigate('/post', { state: { username: response.data.username } });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gradient-to-r from-purple-300 to-blue-300 p-4">
      <div className="w-full max-w-md bg-white bg-opacity-90 rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Sign in</h2>
        <p className="text-gray-600 text-sm mb-4">
          Don’t have an account?
          <a href="/register" className="text-blue-500 hover:underline ml-1">Get started</a>
        </p>
        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <div className="relative w-full">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              <Icon icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} className="text-xl" />
            </button>
          </div>
          <button
            type="submit"
            className={`w-full p-2 text-white font-semibold rounded-lg transition duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="my-4 flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-2 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <div className="flex justify-center space-x-4">
          <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <Icon icon="logos:google-icon" className="text-2xl" />
          </button>
          <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <Icon icon="eva:github-fill" className="text-2xl" />
          </button>
          <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <Icon icon="ri:twitter-x-fill" className="text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;