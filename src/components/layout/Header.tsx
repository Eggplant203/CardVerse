import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../auth/AuthModal';
import ProfileModal from '../user/ProfileModal';

interface HeaderProps {
  currentMana?: number;
  maxMana?: number;
}

const Header: React.FC<HeaderProps> = ({
  currentMana = 0,
  maxMana = 0
}) => {
  const { user, isAuthenticated, isGuestMode } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const userName = user?.displayName || (isGuestMode ? 'Guest' : 'Not logged in');
  const userAvatar = user?.avatarUrl || '/default-avatar.png';
  
  const handleUserClick = () => {
    if (isAuthenticated) {
      setIsProfileModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <header className="bg-gray-900 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
              <motion.div
                whileHover={{ rotate: 10 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-2xl font-title text-white mr-2">🃏</span>
              </motion.div>
              <h1 className="text-xl font-title text-white">
                CardVerse
              </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <NavLink href="/play">Battle</NavLink>
            <NavLink href="/cards">Collection</NavLink>
            <NavLink href="/create">Create Card</NavLink>
            <NavLink href="/decks">Decks</NavLink>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden text-gray-400 hover:text-white">
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
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>

          {/* User info */}
          <div className="flex items-center space-x-4">
            {/* Mana crystals (only show during gameplay) */}
            {maxMana > 0 && (
              <div className="flex items-center">
                <div className="flex">
                  {Array.from({ length: maxMana }).map((_, i) => (
                    <div 
                      key={`mana-${i}`} 
                      className={`w-4 h-4 rounded-full mx-0.5 ${i < currentMana ? 'bg-blue-500' : 'bg-gray-700 border border-blue-800'}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-xs text-blue-300 font-medium">
                  {currentMana}/{maxMana}
                </span>
              </div>
            )}
            
            {/* User profile button */}
            <motion.div 
              className="flex items-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={handleUserClick}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-colors">
                <Image src={userAvatar} alt={userName} width={32} height={32} className="w-full h-full object-cover" unoptimized priority />
              </div>
              <span className="ml-2 text-white text-sm font-medium hidden sm:block">
                {userName}
                {isGuestMode && userName !== 'Guest' && (
                  <span className="ml-1 text-xs text-yellow-400 font-normal">(Guest)</span>
                )}
              </span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 ml-1 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </div>
      </header>
      
      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      
      {/* Profile Modal */}
      {isAuthenticated && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </>
  );
};

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
  return (
    <Link href={href} className="text-gray-300 hover:text-white transition-colors">
      {children}
    </Link>
  );
};

export default Header;
