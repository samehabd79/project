import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { loginWithEmail } from '../../lib/firebase';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginWithEmail(credentials.email, credentials.password);
      navigate('/dashboard');
      toast.success('Successfully logged in!');
    } catch (error: any) {
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/invalid-credential':
          toast.error('Invalid email or password. Please try again.');
          break;
        case 'auth/wrong-password':
          toast.error('Incorrect password. Please try again.');
          break;
        case 'auth/user-not-found':
          toast.error('No account found with this email.');
          break;
        case 'auth/invalid-email':
          toast.error('Invalid email address.');
          break;
        case 'auth/too-many-requests':
          toast.error('Too many failed attempts. Please try again later.');
          break;
        case 'auth/user-disabled':
          toast.error('This account has been disabled.');
          break;
        default:
          toast.error('Login failed. Please check your credentials.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <LogIn className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="input mt-1"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="input mt-1"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="mt-4">
              <p className="text-sm text-gray-500 text-center">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-500">
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;