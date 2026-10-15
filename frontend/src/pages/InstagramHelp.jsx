import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search as SearchIcon, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PROBLEMS } from '../data/instagramProblems';

const InstagramHelp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const categories = useMemo(() => {
    const cats = new Set(PROBLEMS.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const filteredProblems = useMemo(() => {
    return PROBLEMS.filter(problem => {
      const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || problem.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto">
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Instagram Help
                </h1>
                <p className="text-xs text-gray-400">Problem Solver</p>
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded-full">
              <HelpCircle className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </header>

        <div className="px-4 py-4 space-y-4">
          <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/20 rounded-xl p-4">
            <h2 className="text-base font-semibold text-white mb-1">Find your Instagram problem</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Select a problem below, answer a few questions, and get a personalized diagnosis with a step-by-step action plan.
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pb-6">
            {filteredProblems.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                No problems match your search.
              </div>
            ) : (
              filteredProblems.map((problem, index) => {
                const Icon = problem.icon;
                return (
                  <motion.button
                    key={problem.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => navigate(`/instagram-help/${problem.id}`)}
                    className="w-full text-left bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-purple-500/50 transition-all group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${problem.color} bg-opacity-20 shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                            {problem.title}
                          </h3>
                          <span className="text-[10px] uppercase tracking-wide text-gray-500 border border-gray-700 rounded-full px-2 py-0.5 shrink-0 ml-2">
                            {problem.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                          {problem.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramHelp;
