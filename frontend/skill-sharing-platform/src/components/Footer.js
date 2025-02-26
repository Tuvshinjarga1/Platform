import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-gray-100 text-center py-4 text-gray-600">
    {/* <footer className="fixed bottom-0 left-0 w-full bg-gray-100 text-center py-4 text-gray-600"> */}
      <p className="text-sm">
        © {new Date().getFullYear()} Skill Sharing Platform. All rights reserved. © Tuvshinjargal
      </p>
    </footer>
  );
};

export default Footer;