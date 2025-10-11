import React from 'react';
import { CheckCircle, TrendingUp } from 'lucide-react';

const FeedbackCard = ({ title, points, type }) => {
    const isStrength = type === 'strength';
    const Icon = isStrength ? CheckCircle : TrendingUp;
    
    const styles = {
        strength: {
            container: 'bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow',
            icon: 'text-emerald-600',
            title: 'text-gray-900',
            text: 'text-gray-700',
            accent: 'text-emerald-600',
            dot: 'bg-emerald-500'
        },
        improvement: {
            container: 'bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow',
            icon: 'text-amber-600',
            title: 'text-gray-900',
            text: 'text-gray-700',
            accent: 'text-amber-600',
            dot: 'bg-amber-500'
        }
    };

    const style = styles[type] || styles.strength;

    return (
        <div className={style.container}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <Icon className={`w-5 h-5 ${style.icon}`} />
                <h3 className={`font-semibold ${style.title}`}>{title}</h3>
                <span className={`ml-auto text-sm ${style.accent} font-medium`}>
                    {points?.length || 0} points
                </span>
            </div>

            {/* Content */}
            {points && points.length > 0 ? (
                <ul className="space-y-2.5">
                    {points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${style.dot}`} />
                            <span className={`text-sm ${style.text} leading-relaxed`}>{point}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={`text-sm ${style.text} text-center py-4 italic`}>
                    {isStrength 
                        ? 'No specific strengths were highlighted in the feedback.' 
                        : 'No specific improvement areas were identified.'
                    }
                </p>
            )}
        </div>
    );
};

export default FeedbackCard;