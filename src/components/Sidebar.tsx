import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  BarChart2, 
  Settings,
  LogOut 
} from 'lucide-react';
import { signOut } from '../lib/firebase';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const navigate = useNavigate();
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShoppingCart, label: 'Sales', path: '/sales' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: BarChart2, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="h-screen w-64 bg-gray-900 text-white p-4 fixed left-0 top-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <ShoppingCart className="w-8 h-8 text-blue-400" />
        <h1 className="text-xl font-bold">SalesPro</h1>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button 
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg mt-auto absolute bottom-8 w-[calc(100%-2rem)]"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;