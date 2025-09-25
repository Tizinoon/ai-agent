
import React, { useState } from 'react';
import { Decision } from '../types';
import { DecisionCard, OptionAccordion } from '../components/UI';
import { SparklesIcon } from '../components/Icons';


const DecisionDetailView: React.FC<{ decision: Decision, onBack: () => void }> = ({ decision, onBack }) => (
    <div className="p-4 h-full flex flex-col">
        <button onClick={onBack} className="self-start mb-4 text-blue-600 hover:underline">
            &larr; Back to History
        </button>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Problem</h2>
        <p className="text-slate-600 bg-white p-3 rounded-lg mb-4">{decision.problem}</p>

        <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <h2 className="font-bold text-lg text-blue-800 mb-2 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-blue-600"/>
                Chosen Solution
            </h2>
            <p className="font-semibold text-slate-800 mb-1">{decision.recommendation.choice}</p>
            <p className="text-sm text-slate-600">{decision.recommendation.reasoning}</p>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Options Considered</h3>
        <div className="flex-1 overflow-y-auto space-y-2">
            {decision.options.map(opt => <OptionAccordion key={opt.id} option={opt} />)}
        </div>
    </div>
);

const HistoryScreen: React.FC<{ decisions: Decision[] }> = ({ decisions }) => {
    const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);

    if (selectedDecision) {
        return <DecisionDetailView decision={selectedDecision} onBack={() => setSelectedDecision(null)} />
    }

    return (
        <div className="p-4 space-y-3">
             <h1 className="text-2xl font-bold text-slate-800 px-1">Decision History</h1>
            {decisions.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-slate-500">No decisions saved yet.</p>
                    <p className="text-sm text-slate-400">Complete a session on the Assistant tab to see it here.</p>
                </div>
            ) : (
                [...decisions].reverse().map(decision => (
                    <DecisionCard key={decision.id} decision={decision} onSelect={() => setSelectedDecision(decision)} />
                ))
            )}
        </div>
    );
};

export default HistoryScreen;
