import React from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';

interface StatsProps {
  stats: {
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    topProducts: Array<{
      product: any;
      quantity: number;
    }>;
  };
}

const Stats: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {[
        {
          title: 'Total Revenue',
          value: `$${stats.totalRevenue.toFixed(2)}`,
          icon: DollarSign,
          color: 'bg-green-500',
        },
        {
          title: 'Total Sales',
          value: stats.totalSales.toString(),
          icon: ShoppingBag,
          color: 'bg-blue-500',
        },
        {
          title: 'Average Order Value',
          value: `$${stats.averageOrderValue.toFixed(2)}`,
          icon: TrendingUp,
          color: 'bg-purple-500',
        },
        {
          title: 'Top Product',
          value: stats.topProducts[0]?.product?.name || 'N/A',
          subValue: stats.topProducts[0]?.quantity 
            ? `${stats.topProducts[0].quantity} units` 
            : '',
          icon: Users,
          color: 'bg-orange-500',
        },
      ].map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
              <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          {stat.subValue && (
            <p className="text-sm text-gray-500 mt-1">{stat.subValue}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Stats;