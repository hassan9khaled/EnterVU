import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '~/contexts/AuthContext';
import Card from '~/components/common/Card';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // FIX: Check for and display the success message passed from the registration page.
        if (location.state?.successMessage) {
            setSuccessMessage(location.state.successMessage);
            // Clear the location state to prevent the message from re-appearing
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/'); // Redirect to dashboard on successful login
        } catch (err) {
            setError('Failed to log in. Please check your credentials.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <Card>
                <h2 className="text-2xl font-bold text-center mb-6">Log In</h2>
                {successMessage && (
                    <p className="text-green-600 bg-green-50 p-3 rounded-md text-center mb-4 text-sm">
                        {successMessage}
                    </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
                <p className="text-center text-sm mt-4">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-600 hover:underline">
                        Sign up
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default LoginPage;

