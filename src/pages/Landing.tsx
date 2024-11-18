import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  BarChart2, 
  ChevronRight,
  Shield,
  Zap,
  Cloud,
  Github,
  Linkedin,
  Mail,
  Download,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

const FadeInWhenVisible: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
};

const Landing = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const features = [
    {
      icon: LayoutDashboard,
      title: 'Intuitive Dashboard',
      description: 'Real-time analytics and insights at your fingertips. Monitor KPIs and make data-driven decisions.'
    },
    {
      icon: Package,
      title: 'Smart Inventory',
      description: 'Automated stock tracking, low inventory alerts, and seamless product management.'
    },
    {
      icon: Users,
      title: 'Customer Relations',
      description: 'Build stronger relationships with detailed customer profiles and purchase history tracking.'
    },
    {
      icon: ShoppingCart,
      title: 'Effortless Sales',
      description: 'Streamlined sales process with quick checkout and automatic inventory updates.'
    },
    {
      icon: BarChart2,
      title: 'Advanced Analytics',
      description: 'Comprehensive reports and insights to optimize your business performance.'
    },
    {
      icon: Cloud,
      title: 'Cloud-Powered',
      description: 'Secure, reliable cloud infrastructure with real-time synchronization.'
    }
  ];

  const benefits = [
    'Increase sales efficiency by up to 35%',
    'Reduce inventory management time by 50%',
    'Improve customer satisfaction rates',
    'Make data-driven decisions',
    'Scale your business effortlessly',
    'Access anywhere, anytime'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10" />
        </motion.div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="py-24 md:py-32">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                Transform Your Business with
                <br />
                Smart Sales Management
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
                An all-in-one solution that helps you manage sales, inventory, and customers
                with unparalleled efficiency
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  to="/login" 
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Try Demo
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-400 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Purchase Now
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <FadeInWhenVisible>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our comprehensive solution provides all the tools you need to streamline
            your business operations and drive growth.
          </p>
        </FadeInWhenVisible>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FadeInWhenVisible key={index}>
              <motion.div 
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                whileHover={{ scale: 1.02 }}
              >
                <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-blue-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose Our Solution?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Join thousands of businesses that have transformed their operations
                with our powerful sales management system.
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <FadeInWhenVisible>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm"
                    whileHover={{ x: 10 }}
                  >
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
                  alt="Dashboard Preview"
                  className="rounded-lg shadow-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg flex items-end p-6">
                  <p className="text-white text-lg font-medium">
                    Modern, intuitive interface designed for efficiency
                  </p>
                </div>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-gray-600">
                Get started with our comprehensive solution today
              </p>
            </div>
          </FadeInWhenVisible>

          <FadeInWhenVisible>
            <div className="max-w-lg mx-auto">
              <motion.div 
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-center mb-4">
                    Complete Package
                  </h3>
                  <div className="flex justify-center items-baseline mb-8">
                    <span className="text-5xl font-extrabold text-blue-600">$49.99</span>
                    <span className="text-gray-500 ml-2">one-time</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {[
                      'Full source code access',
                      '6 months premium support',
                      'Free updates',
                      'Comprehensive documentation',
                      'Deploy ready configuration',
                      'Commercial license'
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Purchase Now
                  </button>
                </div>
              </motion.div>
            </div>
          </FadeInWhenVisible>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-lg font-semibold mb-4">
                Programmed by Sameh Abd
              </p>
              <div className="flex justify-center gap-6 mb-8">
                <a 
                  href="https://github.com/sameh-abd" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors transform hover:scale-110"
                >
                  <Github className="w-6 h-6" />
                </a>
                <a 
                  href="https://linkedin.com/in/sameh-abd" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors transform hover:scale-110"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
                <a 
                  href="mailto:sameh.abd@example.com" 
                  className="hover:text-white transition-colors transform hover:scale-110"
                >
                  <Mail className="w-6 h-6" />
                </a>
              </div>
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Sales Management System. All rights reserved.
              </p>
            </motion.div>
          </div>
        </div>
      </footer>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
};

export default Landing;