
import React, { useState } from 'react';
import { InsightCard, LoadingSpinner } from '../components/UI';
import { LightbulbIcon } from '../components/Icons';
import { geminiService } from '../services/geminiService';

interface InsightsScreenProps {
  initialInsights: string[];
}

const InsightsScreen: React.FC<InsightsScreenProps> = ({ initialInsights }) => {
  const [insights, setInsights] = useState<string[]>(initialInsights);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNewInsight = async () => {
    setIsLoading(true);
    setError(null);
    const newInsight = await geminiService.getInsight();
    if (typeof newInsight === 'string') {
      setInsights(prev => [newInsight, ...prev]);
    } else {
      setError(newInsight.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-4 px-1">Daily Insights</h1>
      <div className="mb-4">
        <button
          onClick={fetchNewInsight}
          disabled={isLoading}
          className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center disabled:bg-slate-400"
        >
          {isLoading ? <LoadingSpinner /> : <><LightbulbIcon className="h-5 w-5 mr-2"/> Get New Insight</>}
        </button>
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <InsightCard key={index} insight={insight} />
        ))}
      </div>
    </div>
  );
};

export default InsightsScreen;
