import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, ChevronLeft, RotateCcw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PROBLEMS } from '../data/instagramProblems';

const InstagramHelpDetail = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const problem = PROBLEMS.find(p => p.id === problemId);

  if (!problem) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Problem not found</h2>
          <button onClick={() => navigate('/instagram-help')} className="text-purple-400 hover:text-purple-300">
            Back to Instagram Help
          </button>
        </div>
      </div>
    );
  }

  const Icon = problem.icon;
  const totalSteps = problem.questions.length;
  const currentQuestion = problem.questions[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  const handleAnswer = (value) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    if (isLastStep) {
      const result = problem.analyze(answers);
      navigate(`/instagram-help/${problemId}/result`, { state: { result, problem } });
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/instagram-help');
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentStep(0);
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto">
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-base font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {problem.title}
                </h1>
                <p className="text-[11px] text-gray-400">Step {currentStep + 1} of {totalSteps}</p>
              </div>
            </div>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${problem.color} bg-opacity-20`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </header>

        <div className="px-4 py-4">
          <div className="w-full bg-gray-800 rounded-full h-1.5 mb-6">
            <motion.div
              className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-base font-semibold text-white mb-2 leading-snug">
                  {currentQuestion.text}
                </h2>
                <p className="text-xs text-gray-400">
                  This helps us give you a more accurate diagnosis.
                </p>
              </div>

              <div className="space-y-2.5">
                {currentQuestion.options.map(option => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                      answers[currentQuestion.id] === option
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500 text-white'
                        : 'bg-gray-900 border-gray-800 text-gray-200 hover:border-purple-500/40 hover:bg-gray-800'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleRestart}
              className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start again</span>
            </button>

            {isLastStep && (
              <div className="text-xs text-gray-500">
                {answers[currentQuestion.id] ? 'Ready to analyze' : 'Please select an option'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramHelpDetail;
