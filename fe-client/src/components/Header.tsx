import { Link } from '@tanstack/react-router';
import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartItemCount = 0; // This will be dynamic when we implement cart state

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-700">
            BOOKWORM
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-700 transition-colors"
              activeProps={{ className: "text-blue-700 font-semibold" }}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-gray-700 hover:text-blue-700 transition-colors"
              activeProps={{ className: "text-blue-700 font-semibold" }}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-700 transition-colors"
              activeProps={{ className: "text-blue-700 font-semibold" }}
            >
              About
            </Link>
            <Link
              to="/cart"
              className="text-gray-700 hover:text-blue-700 transition-colors relative"
            >
              Cart ({cartItemCount})
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <button 
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors"
              onClick={() => {/* Open sign in modal */}}
            >
              Sign In
            </button>
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pt-4 pb-2 space-y-3">
            <Link
              to="/"
              className="block text-gray-700 hover:text-blue-700 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="block text-gray-700 hover:text-blue-700 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="block text-gray-700 hover:text-blue-700 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/cart"
              className="block text-gray-700 hover:text-blue-700 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Cart ({cartItemCount})
            </Link>
            <button 
              className="block w-full text-left bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors"
              onClick={() => {
                setIsMenuOpen(false);
                /* Open sign in modal */
              }}
            >
              Sign In
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
