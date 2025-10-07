import React from 'react';
import { CheckCircle, TrendingUp } from 'lucide-react';

const FeedbackCard = ({ title, points, type }) => {
    const isStrength = type === 'strength';
    const Icon = isStrength ? CheckCircle : TrendingUp;
    const iconColor = isStrength ? 'text-green-400' : 'text-yellow-400';

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
                <Icon className={`w-6 h-6 ${iconColor}`} />
                <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>
            {points && points.length > 0 ? (
                <ul className="space-y-3">
                    {points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <Icon className={`w-5 h-5 ${iconColor} mt-0.5 flex-shrink-0`} />
                            <span className="text-slate-300">{point}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                 <p className="text-slate-400">No specific points were identified in the summary.</p>
            )}
        </div>
    );
};

export default FeedbackCard;
