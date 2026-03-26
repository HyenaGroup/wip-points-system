import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Gift, History, Award } from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'หน้าหลัก' },
    { path: '/rewards', icon: Gift, label: 'แลกของรางวัล' },
    { path: '/history', icon: History, label: 'ประวัติแต้ม' },
    { path: '/redemptions', icon: Award, label: 'การแลกของ' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto">
        {children}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center flex-1 h-full ${
                    isActive ? 'text-primary' : 'text-gray-500'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
