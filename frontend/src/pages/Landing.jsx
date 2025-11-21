import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-10 py-6">
        <h1 className="text-2xl font-bold text-blue-700">A-Z Mattress System</h1>
        <div className="space-x-4">
          <Link to="/login" className="text-blue-700 font-semibold hover:underline">
            Login
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center text-center px-6 mt-10">
        <h1 className="text-4xl font-extrabold text-gray-800 leading-snug max-w-2xl">
          Streamline Your <span className="text-blue-600">Stock & Sales</span>  
          Operations With Ease
        </h1>

        <p className="text-gray-500 mt-4 max-w-xl text-lg">
          Manage inventory, sales, deposits, expenses, and transfers — all in one 
          simple dashboard designed for mattress businesses.
        </p>

        <div className="flex gap-4 mt-8">
          <Link
            to="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            Get Started
          </Link>

          <Link
            to="/register"
            className="px-8 py-3 border border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50"
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mt-20 px-10 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
        
        <FeatureCard
          title="Real-Time Stock Control"
          desc="Monitor stock movement, transfers, and balance levels instantly."
        />

        <FeatureCard
          title="Streamlined POS"
          desc="Fast and efficient sales processing optimized for attendants."
        />

        <FeatureCard
          title="Track Finances"
          desc="Manage deposits, expenses, and summaries from one dashboard."
        />

      </section>
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="bg-white shadow-md p-8 rounded-2xl border border-gray-100">
      <CheckCircle className="text-blue-600 mb-4" size={32} />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500">{desc}</p>
    </div>
  );
}
