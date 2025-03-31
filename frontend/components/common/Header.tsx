// 공통 컴포넌트: Header.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SearchBar from './SearchBar';

interface HeaderProps {
  username?: string;
}

const Header: React.FC<HeaderProps> = ({ username = '사용자' }) => {
  const router = useRouter();

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <a className="flex items-center">
              <svg
                className="h-8 w-8 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-800">개념 그래프 학습 시스템</span>
            </a>
          </Link>
        </div>

        <div className="hidden md:block w-1/3 mx-4">
          <SearchBar />
        </div>

        <div className="flex items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">{username}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
