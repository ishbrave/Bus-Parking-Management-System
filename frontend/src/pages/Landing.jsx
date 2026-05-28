import { Link } from 'react-router-dom';
import { ParkingSquare, Shield, BarChart3, ArrowRight, Bus, Clock, CreditCard } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-blue-100 bg-white/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500 text-white">
              <ParkingSquare size={22} />
            </div>
            <span className="text-lg font-bold text-blue-600">TransitPro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-500 transition-colors">
              Sign In
            </Link>
            <Link
              to="/auth/register"
              className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md shadow-blue-200 transition-all"
            >
              Get Started <ArrowRight size={14} className="inline ml-1" />
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-medium mb-6">
          Bus Parking Management System
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Smart Parking Management{' '}
          <span className="text-blue-500">for Modern Bus Terminals</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          TransitPro Rwanda provides an intelligent platform to manage bus parking spaces,
          track payments, and generate real-time income reports for Kigali's bus terminals.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/auth/register"
            className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all"
          >
            Get Started Now
          </Link>
          <Link
            to="/auth/login"
            className="px-6 py-3 border border-blue-200 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-all"
          >
            Sign In
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-1 shadow-2xl shadow-blue-200/50">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-white">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20">
                  <ParkingSquare size={32} />
                </div>
                <span className="font-semibold">15+ Parking Spaces</span>
                <span className="text-sm text-white/70">Across 6 terminals</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20">
                  <Bus size={32} />
                </div>
                <span className="font-semibold">50+ Registered Buses</span>
                <span className="text-sm text-white/70">Managed daily</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-xl bg-white/20">
                  <BarChart3 size={32} />
                </div>
                <span className="font-semibold">Real-time Reports</span>
                <span className="text-sm text-white/70">Income & occupancy analytics</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-12">Core Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: ParkingSquare, title: 'Space Management', desc: 'Track occupied and available parking spaces in real-time across all terminals.' },
            { icon: CreditCard, title: 'Payment Processing', desc: 'Monitor payments, generate receipts, and track pending vs paid records.' },
            { icon: BarChart3, title: 'Income Reports', desc: 'Generate daily parking income reports with interactive charts and CSV export.' },
            { icon: Shield, title: 'Secure Access', desc: 'Secure authentication for all system users.' },
            { icon: Clock, title: 'Parking Duration', desc: 'Track parking duration, calculate fees automatically based on daily rates.' },
            { icon: Bus, title: 'Bus Registration', desc: 'Register buses linked to owners with complete tracking history.' },
          ].map((feat, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-xl rounded-xl border border-blue-100 p-6 shadow-lg shadow-blue-100/30 hover:shadow-xl transition-all">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-500 w-fit mb-4">
                <feat.icon size={24} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-400">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-blue-100 bg-white/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <div className="flex gap-4">
              <Link to="/" className="hover:text-blue-500">Home</Link>
              <Link to="/auth/login" className="hover:text-blue-500">Sign In</Link>
            </div>
            <span>Ishimwe Brave | ishimwebrave8@gmail.com | 0738091744</span>
            <span className="font-medium text-blue-500">Powered by Brave</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
