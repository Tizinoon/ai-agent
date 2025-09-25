import React, { useState } from 'react';
import { Screen, Decision } from './types';
import { BottomNavBar } from './components/UI';
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import InsightsScreen from './screens/InsightsScreen';

// FIX: Removed incorrect self-import and moved sample data definition before its usage to resolve declaration errors.
// Moved sampleData into its own file for clarity, but including here to meet file constraints
const sampleData = {
  sampleDecisions: [
    {
      id: 'sample-1',
      problem: 'Deciding on a new career path',
      options: [
        { id: '1', title: 'Software Development', analysis: { pros: ['High demand', 'Good salary'], cons: ['Steep learning curve', 'Can be sedentary'] } },
        { id: '2', title: 'UX/UI Design', analysis: { pros: ['Creative fulfillment', 'Collaborative'], cons: ['Subjective feedback', 'Competitive field'] } },
        { id: '3', title: 'Data Science', analysis: { pros: ['Highly analytical', 'Impactful work'], cons: ['Requires strong math skills', 'Complex concepts'] } },
      ],
      recommendation: {
        choice: 'Software Development',
        reasoning: 'Given your interest in problem-solving and building things, Software Development aligns well with your skills and offers strong career growth.',
      },
      date: 'October 26, 2023',
    },
  ],
  sampleInsights: [
    "The '10-10-10' rule: Ask yourself how you'll feel about this decision in 10 minutes, 10 months, and 10 years. This helps you gain perspective.",
    "Don't strive for the perfect decision; aim for the best decision with the information you have. Progress is better than perfection.",
    "Limit your options. Decision fatigue is real. Narrow your choices down to the top 3-4 contenders to make analysis more manageable."
  ]
};

export const { sampleDecisions, sampleInsights } = sampleData;


const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [decisions, setDecisions] = useState<Decision[]>(sampleDecisions);
  
  const addDecision = (decision: Decision) => {
    setDecisions(prev => [...prev, decision]);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen onSaveDecision={addDecision} />;
      case 'history':
        return <HistoryScreen decisions={decisions} />;
      case 'insights':
        return <InsightsScreen initialInsights={sampleInsights} />;
      default:
        return <HomeScreen onSaveDecision={addDecision} />;
    }
  };

  return (
    <div className="w-[375px] h-[720px] bg-slate-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans border-8 border-black">
      <div className="flex-1 overflow-y-auto">
        {renderScreen()}
      </div>
      <BottomNavBar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
    </div>
  );
};

export default App;
