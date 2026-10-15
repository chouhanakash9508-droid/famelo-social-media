import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, MessageSquare, RotateCcw, Lightbulb, AlertTriangle, ClipboardCheck, Phone, Mail } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const InstagramHelpResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { result, problem } = location.state || {};
  const [copied, setCopied] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [messageInput, setMessageInput] = useState('');

  if (!result || !problem) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">No analysis found</h2>
          <button onClick={() => navigate('/instagram-help')} className="text-purple-400 hover:text-purple-300">
            Back to Instagram Help
          </button>
        </div>
      </div>
    );
  }

  const Icon = problem.icon;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateMessage = () => {
    const prompt = problem.messagePrompt || 'Describe your situation:';
    const context = messageInput.trim();
    const baseMessage = `Instagram Support Request\n\nProblem: ${problem.title}\n\nDetails: ${context || 'User did not provide additional details.'}\n\nPlease review my account and provide assistance with the issue described above. Thank you.`;
    setGeneratedMessage(baseMessage);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto">
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/instagram-help')}
                className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-base font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Analysis Result
                </h1>
                <p className="text-[11px] text-gray-400 truncate max-w-[180px]">{problem.title}</p>
              </div>
            </div>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${problem.color} bg-opacity-20`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </header>

        <div className="px-4 py-4 space-y-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-xl p-4"
          >
            <h2 className="text-sm font-semibold text-white mb-1">Problem Summary</h2>
            <p className="text-xs text-gray-300 leading-relaxed">{result.summary}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <h3 className="text-sm font-semibold text-white">Possible Causes</h3>
            </div>
            <ul className="space-y-2">
              {result.possibleCauses.map((cause, index) => (
                <li key={index} className="text-xs text-gray-300 leading-relaxed flex items-start space-x-2">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {result.whatToCheck && result.whatToCheck.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4"
            >
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">What You Should Check</h3>
              </div>
              <ul className="space-y-2">
                {result.whatToCheck.map((item, index) => (
                  <li key={index} className="text-xs text-gray-300 leading-relaxed flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <div className="flex items-center space-x-2 mb-3">
              <ClipboardCheck className="w-4 h-4 text-green-400" />
              <h3 className="text-sm font-semibold text-white">Recommended Actions</h3>
            </div>
            <ul className="space-y-2">
              {result.recommendedActions.map((action, index) => (
                <li key={index} className="text-xs text-gray-300 leading-relaxed flex items-start space-x-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-4"
          >
            <div className="flex items-center space-x-2 mb-3">
              <ClipboardCheck className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Step-by-Step Action Plan</h3>
            </div>
            <ol className="space-y-2.5">
              {result.actionPlan.map((step, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-xs text-gray-300 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-white">When to Contact Instagram</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{result.whenToContactInstagram}</p>
          </motion.div>

          {result.canGenerateMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-semibold text-white">Generate Help / Appeal Message</h3>
              </div>
              <p className="text-[11px] text-gray-400">{problem.messagePrompt}</p>
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a brief description of your situation..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
              />
              <button
                onClick={handleGenerateMessage}
                disabled={!messageInput.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Generate Message
              </button>

              {generatedMessage && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-gray-300">Generated Message</span>
                    <button
                      onClick={() => handleCopy(generatedMessage)}
                      className="flex items-center space-x-1 text-[11px] text-purple-400 hover:text-purple-300"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">{generatedMessage}</p>
                </div>
              )}
            </motion.div>
          )}

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => navigate('/instagram-help')}
              className="flex-1 bg-gray-800 border border-gray-700 text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Problems
            </button>
            <button
              onClick={() => navigate(`/instagram-help/${problemId}`)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold py-2.5 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Start Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramHelpResult;
