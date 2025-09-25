
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Option, Decision } from '../types';
import { ChatBubble, LoadingSpinner, OptionAccordion } from '../components/UI';
import { SendIcon, SparklesIcon } from '../components/Icons';
import { geminiService } from '../services/geminiService';

interface HomeScreenProps {
  onSaveDecision: (decision: Decision) => void;
}

type Phase = 'IDLE' | 'CLARIFYING' | 'GENERATING_OPTIONS' | 'ANALYZING_OPTIONS' | 'RECOMMENDING' | 'DONE';

const HomeScreen: React.FC<HomeScreenProps> = ({ onSaveDecision }) => {
  const [phase, setPhase] = useState<Phase>('IDLE');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', text: "Welcome to Solvio. How can I help you make a decision today?", sender: 'ai' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [problem, setProblem] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [recommendation, setRecommendation] = useState<{ choice: string; reasoning: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleUserInput = async () => {
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), text: userInput, sender: 'user' };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    if (phase === 'IDLE' || phase === 'CLARIFYING') {
      if (phase === 'IDLE') setProblem(userInput);
      setPhase('CLARIFYING');

      const chatHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const aiResponse = await geminiService.getChatResponse(chatHistory, userInput);

      if (typeof aiResponse === 'string') {
        const newAiMessage: ChatMessage = { id: (Date.now() + 1).toString(), text: aiResponse, sender: 'ai' };
        setMessages(prev => [...prev, newAiMessage]);
      } else {
        const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), text: aiResponse.message, sender: 'ai' };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
    setIsLoading(false);
  };

  const handleGenerateOptions = async () => {
    setIsLoading(true);
    setPhase('GENERATING_OPTIONS');
    const result = await geminiService.generateOptions(problem);
    if ('options' in result) {
      const newOptions = result.options.map((opt, i) => ({ id: i.toString(), title: opt }));
      setOptions(newOptions);
      setPhase('ANALYZING_OPTIONS');
      analyzeAllOptions(newOptions);
    } else {
      const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), text: result.message, sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
      setPhase('CLARIFYING');
    }
    setIsLoading(false);
  };
  
  const analyzeAllOptions = async (currentOptions: Option[]) => {
    const analysisPromises = currentOptions.map(async (option) => {
        const analysis = await geminiService.analyzeOption(problem, option.title);
        if ('pros' in analysis) {
            return { ...option, analysis };
        }
        return option; // Keep original if analysis fails
    });
    
    const analyzedOptions = await Promise.all(analysisPromises);
    setOptions(analyzedOptions);
};


  const handleGetRecommendation = async () => {
    setIsLoading(true);
    setPhase('RECOMMENDING');
    const result = await geminiService.getRecommendation(problem, options);
    if ('choice' in result) {
      setRecommendation(result);
      setPhase('DONE');
    } else {
      const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), text: result.message, sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
      setPhase('ANALYZING_OPTIONS');
    }
    setIsLoading(false);
  };

  const handleSaveAndReset = () => {
    if (!recommendation) return;
    const newDecision: Decision = {
      id: Date.now().toString(),
      problem,
      options,
      recommendation,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    onSaveDecision(newDecision);
    // Reset state
    setPhase('IDLE');
    setMessages([{ id: '1', text: "Let's tackle another decision. What's on your mind?", sender: 'ai' }]);
    setProblem('');
    setOptions([]);
    setRecommendation(null);
  };
  
  const allOptionsAnalyzed = options.length > 0 && options.every(opt => opt.analysis);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {phase !== 'IDLE' && phase !== 'CLARIFYING' && (
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 mb-4">
              <h2 className="font-bold text-lg text-slate-800 mb-2">Your Problem:</h2>
              <p className="text-slate-600">{problem}</p>
          </div>
        )}

        {recommendation && (
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl mb-4 animate-fade-in">
                <h2 className="font-bold text-lg text-blue-800 mb-2 flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2 text-blue-600"/>
                    Recommendation
                </h2>
                <p className="font-semibold text-slate-800 mb-1">{recommendation.choice}</p>
                <p className="text-sm text-slate-600">{recommendation.reasoning}</p>
            </div>
        )}

        {options.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-700 px-1">Generated Options:</h3>
            {options.map(opt => <OptionAccordion key={opt.id} option={opt} />)}
          </div>
        )}
        
        {(phase === 'IDLE' || phase === 'CLARIFYING') && messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-slate-200">
        {isLoading && <div className="mb-2"><LoadingSpinner /></div>}
        
        {phase === 'CLARIFYING' && !isLoading && (
            <button onClick={handleGenerateOptions} className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl mb-2 hover:bg-blue-600 transition-colors flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 mr-2"/>
                Analyze Problem & Find Solutions
            </button>
        )}

        {phase === 'ANALYZING_OPTIONS' && allOptionsAnalyzed && !isLoading && (
            <button onClick={handleGetRecommendation} className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl mb-2 hover:bg-blue-600 transition-colors">
                Get Recommendation
            </button>
        )}

        {phase === 'DONE' && !isLoading && (
             <button onClick={handleSaveAndReset} className="w-full bg-green-500 text-white font-semibold py-3 px-4 rounded-xl mb-2 hover:bg-green-600 transition-colors">
                Save & Start New
            </button>
        )}
        
        {(phase === 'IDLE' || phase === 'CLARIFYING') && (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUserInput()}
              placeholder="Tell me about your problem..."
              className="flex-1 w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isLoading}
            />
            <button onClick={handleUserInput} disabled={isLoading || !userInput.trim()} className="bg-blue-500 text-white p-3 rounded-xl disabled:bg-slate-300">
              <SendIcon className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
