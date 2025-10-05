import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <BrainCircuit className="h-8 w-8 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">AI Interview System</h1>
          </Link>
          <div className="flex items-center space-x-4">
             <div className="text-right">
                <span className="text-sm font-medium">Hassan Khaled</span>
                <p className="text-xs text-gray-500">hassan.k@example.com</p>
            </div>
            <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                H
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
