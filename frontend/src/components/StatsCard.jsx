export default function StatsCard({ icon: Icon, label, value, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-500 border-blue-100',
    green: 'bg-green-50 text-green-500 border-green-100',
    yellow: 'bg-yellow-50 text-yellow-500 border-yellow-100',
    red: 'bg-red-50 text-red-500 border-red-100',
    purple: 'bg-purple-50 text-purple-500 border-purple-100',
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 p-5 shadow-lg shadow-blue-100/30 hover:shadow-xl hover:shadow-blue-100/40 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl border ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
