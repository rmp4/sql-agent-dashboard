import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, TrendingUp, Database, FileText, Zap, User } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <aside className="fixed left-0 top-0 h-screen w-16 bg-black py-8 flex flex-col justify-between z-50">
        <div className="flex flex-col gap-6 items-center">
          <Link
            to="/"
            className="p-3"
          >
            <LayoutGrid
              size={24}
              className={isActive('/') ? 'text-[#FAFAFA]' : 'text-[#666666]'}
            />
          </Link>
          <Link
            to="/dashboards"
            className="p-3"
          >
            <TrendingUp
              size={24}
              className={isActive('/dashboards') ? 'text-[#FAFAFA]' : 'text-[#666666]'}
            />
          </Link>
          <Link
            to="/data-sources"
            className="p-3"
          >
            <Database
              size={24}
              className={isActive('/data-sources') ? 'text-[#FAFAFA]' : 'text-[#666666]'}
            />
          </Link>
          <Link
            to="/rules"
            className="p-3"
          >
            <FileText
              size={24}
              className={isActive('/rules') ? 'text-[#FAFAFA]' : 'text-[#666666]'}
            />
          </Link>
        </div>
        <div className="flex flex-col gap-6 items-center">
          <button className="p-3">
            <Zap size={24} className="text-[#666666]" />
          </button>
          <button className="p-3">
            <User size={24} className="text-[#666666]" />
          </button>
        </div>
      </aside>
      <main className="ml-16 flex-1 h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
}
