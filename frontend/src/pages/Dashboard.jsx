import { useState, useEffect } from 'react';
import { ParkingSquare, Bus, CreditCard, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import StatsCard from '../components/StatsCard';
import { reportAPI } from '../api/endpoints';

const BLUE_SHADES = ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await reportAPI.getDashboard();
        if (data.success) setStats(data.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  const pieData = stats?.statusData?.map((s) => ({
    name: s._id,
    value: s.count,
  })) || [];

  return (
    <div className="space-y-6 min-h-full flex flex-col">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400">Overview of TransitPro parking operations</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard icon={ParkingSquare} label="Total Spaces" value={stats?.totalSpaces || 0} color="blue" />
        <StatsCard icon={ParkingSquare} label="Available" value={stats?.availableSpaces || 0} color="green" />
        <StatsCard icon={Bus} label="Occupied" value={stats?.occupiedSpaces || 0} color="yellow" />
        <StatsCard icon={CreditCard} label="Pending Payments" value={stats?.pendingPayments || 0} color="red" />
        <StatsCard icon={DollarSign} label="Total Revenue" value={`RWF ${(stats?.totalRevenue || 0).toLocaleString()}`} color="purple" />
        <StatsCard icon={TrendingUp} label="Total Records" value={stats?.totalRecords || 0} color="blue" />
        <StatsCard icon={Clock} label="Paid Records" value={stats?.paidRecords || 0} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 p-6 shadow-lg shadow-blue-100/30">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Payment Status Distribution</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={BLUE_SHADES[idx % BLUE_SHADES.length]} stroke="#dbeafe" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #dbeafe', boxShadow: '0 4px 12px rgba(59,130,246,0.1)' }} />
                <Legend formatter={(value) => <span className="text-sm text-gray-600">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">No data available</div>
          )}
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 p-6 shadow-lg shadow-blue-100/30">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Quick Summary</h2>
          <div className="space-y-4">
            {[
              { label: 'Total Parking Spaces', value: stats?.totalSpaces, color: 'bg-blue-500' },
              { label: 'Available Spaces', value: stats?.availableSpaces, color: 'bg-green-500' },
              { label: 'Occupied Spaces', value: stats?.occupiedSpaces, color: 'bg-yellow-500' },
              { label: 'Pending Payments', value: stats?.pendingPayments, color: 'bg-red-500' },
              { label: 'Total Revenue', value: `RWF ${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'bg-purple-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">{item.label}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-sm font-semibold text-gray-800">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
