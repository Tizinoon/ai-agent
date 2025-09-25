
import React, { useState } from 'react';
import { ChatIcon, HistoryIcon, LightbulbIcon } from './Icons';
import { Screen, ChatMessage, Decision, Option } from '../types';

interface BottomNavBarProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeScreen, setActiveScreen }) => {
  const navItems: { screen: Screen; label: string; icon: React.ReactNode }[] = [
    { screen: 'home', label: 'Assistant', icon: <ChatIcon className="h-6 w-6" /> },
    { screen: 'history', label: 'History', icon: <HistoryIcon className="h-6 w-6" /> },
    { screen: 'insights', label: 'Insights', icon: <LightbulbIcon className="h-6 w-6" /> },
  ];

  return (
    <div className="flex justify-around items-center p-2 bg-white/80 backdrop-blur-sm border-t border-slate-200">
      {navItems.map(({ screen, label, icon }) => (
        <button
          key={screen}
          onClick={() => setActiveScreen(screen)}
          className={`flex flex-col items-center justify-center w-full p-2 rounded-lg transition-colors duration-200 ${
            activeScreen === screen ? 'text-blue-600' : 'text-slate-500 hover:bg-blue-50'
          }`}
        >
          {icon}
          <span className="text-xs mt-1">{label}</span>
        </button>
      ))}
    </div>
  );
};

export const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-lg'
            : 'bg-white text-slate-700 rounded-bl-lg'
        }`}
      >
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
};

export const DecisionCard: React.FC<{ decision: Decision; onSelect: () => void }> = ({ decision, onSelect }) => (
  <div onClick={onSelect} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-200">
    <p className="text-xs text-slate-400 mb-1">{decision.date}</p>
    <h3 className="font-semibold text-slate-800 truncate mb-2">{decision.problem}</h3>
    <div className="text-xs text-slate-600 bg-blue-50 text-blue-700 font-medium px-2 py-1 rounded-full inline-block">
      Chosen: {decision.recommendation.choice}
    </div>
  </div>
);

export const InsightCard: React.FC<{ insight: string }> = ({ insight }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
    <p className="text-slate-700 leading-relaxed">{insight}</p>
  </div>
);

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
  </div>
);

export const OptionAccordion: React.FC<{ option: Option }> = ({ option }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-50">
                <span className="font-medium text-slate-800">{option.title}</span>
                <svg className={`h-5 w-5 text-slate-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                    {!option.analysis ? <LoadingSpinner /> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-green-600 mb-2">Pros</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                                    {option.analysis.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-red-600 mb-2">Cons</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                                    {option.analysis.cons.map((con, i) => <li key={i}>{con}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
