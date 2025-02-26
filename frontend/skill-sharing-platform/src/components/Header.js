import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const token = localStorage.getItem('token');

  return (
    <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 text-white py-3 px-6 shadow-md flex justify-between items-center">
      <Link to="/post" className="text-xl font-bold">Skill Sharing Platform</Link>
      <div className="relative">
        {token ? (
          <>
            <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
              <Icon icon="mdi:account-circle" className="text-3xl" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-black shadow-lg rounded-lg overflow-hidden">
                <button onClick={() => { setMenuOpen(false); navigate('/profile'); }} className="block w-full px-4 py-2 hover:bg-gray-200">Профайл</button>
                <button onClick={handleSignOut} className="block w-full px-4 py-2 hover:bg-gray-200">Гарах</button>
              </div>
            )}
          </>
        ) : (
          <div className="space-x-4">
            <Link to="/login" className="hover:underline">Нэвтрэх</Link>
            <Link to="/register" className="hover:underline">Бүртгүүлэх</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
