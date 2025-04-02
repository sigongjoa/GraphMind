import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SearchBar from './SearchBar';

const Header: React.FC = () => {
  const router = useRouter();
  
  const isActive = (path: string) => {
    return router.pathname === path ? 'bg-primary-dark' : '';
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/">
              <a className="text-xl font-bold">개념 그래프 학습 시스템</a>
            </Link>
          </div>
          
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <SearchBar />
          </div>
          
          <nav>
            <ul className="flex space-x-1">
              <li>
                <Link href="/">
                  <a className={`px-3 py-2 rounded hover:bg-primary-dark ${isActive('/')}`}>
                    대시보드
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/graph-management">
                  <a className={`px-3 py-2 rounded hover:bg-primary-dark ${isActive('/graph-management')}`}>
                    개념 그래프
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/review">
                  <a className={`px-3 py-2 rounded hover:bg-primary-dark ${isActive('/review')}`}>
                    복습
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/stats">
                  <a className={`px-3 py-2 rounded hover:bg-primary-dark ${isActive('/stats')}`}>
                    통계
                  </a>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
