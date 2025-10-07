import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Lock } from 'lucide-react';
import { useAuth } from '~/contexts/AuthContext';
import Card from '~/components/common/Card';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password);
            // FIX: Redirect to the login page with a success message upon successful registration.
            navigate('/login', { state: { successMessage: 'Registration successful! Please log in.' } });
        } catch (err) {
            setError('Failed to register. This email might already be in use.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <Card>
                <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
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
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>
                <p className="text-center text-sm mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-600 hover:underline">
                        Log in
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default RegisterPage;

