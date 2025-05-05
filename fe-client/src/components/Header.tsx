import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import SignInModal from './SignInModal';
import logo from '@/assets/logo.jpg';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const { cart } = useCart();
  const { user, isAuthenticated, login, logout } = useAuth();
  const cartItemCount = cart.totalItems;

  const handleSignIn = async (email: string, password: string) => {
    try {
      await login(email, password);
      setIsSignInModalOpen(false);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          
          <Link to="/" className="flex text-2xl font-bold text-blue-700">
          <img src={logo} alt="Logo" className="h-8" />
          <span className="ml-2">BOOKWORM</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-700 transition-colors"
              activeProps={{ className: "text-blue-700 font-semibold underline" }}
            >
              Home
            </Link>
            <Link
              to="/shop"
              search={{ sort: 'on_sale', page: 1 , limit: 15 }}
              className="text-gray-700 hover:text-blue-700 transition-colors"
              activeProps={{ className: "text-blue-700 font-semibold underline" }}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-700 transition-colors"
              activeProps={{ className: "text-blue-700 font-semibold underline" }}
            >
              About
            </Link>
            <Link
              to="/cart"
              className="text-gray-700 hover:text-blue-700 transition-colors relative"
              activeProps={{ className: "text-blue-700 font-semibold underline" }}
            >
              Cart ({cartItemCount})
            </Link>
            
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-700">
                  <span>{user?.first_name} {user?.last_name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-10">
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors"
                onClick={() => setIsSignInModalOpen(true)}
              >
                Sign In
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
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
              activeProps={{ className: "text-blue-700 font-semibold underline" }}
            >
              Home
            </Link>
            <Link
              to="/shop"
              search={{ sort: 'on_sale', page: 1 , limit: 15 }}
              className="block text-gray-700 hover:text-blue-700 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
              activeProps={{ className: "text-blue-700 font-semibold underline" }}
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="block text-gray-700 hover:text-blue-700 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
              activeProps={{ className: "text-blue-700 font-semibold underline" }}
            >
              About
            </Link>
            <Link
              to="/cart"
              className="block text-gray-700 hover:text-blue-700 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
              activeProps={{ className: "text-blue-700 font-semibold underline" }}
            >
              Cart ({cartItemCount})
            </Link>
            
            {isAuthenticated ? (
              <button 
                onClick={logout}
                className="block w-full text-left py-2 text-gray-700 hover:text-blue-700"
              >
                Sign Out ({user?.last_name})
              </button>
            ) : (
              <button 
                className="block w-full text-left bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsSignInModalOpen(true);
                }}
              >
                Sign In
              </button>
            )}
          </nav>
        )}
      </div>

      {/* Sign In Modal */}
      <SignInModal 
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSignIn={handleSignIn}
      />
    </header>
  );
};

export default Header;
