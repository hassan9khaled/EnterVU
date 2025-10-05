import React from 'react';
import { Star } from 'lucide-react';
import Card from '../common/Card';

const getScoreColor = (score) => {
    if (score >= 90) return { text: 'text-green-600', bg: 'bg-green-500' };
    if (score >= 80) return { text: 'text-blue-600', bg: 'bg-blue-500' };
    if (score >= 70) return { text: 'text-yellow-600', bg: 'bg-yellow-500' };
    return { text: 'text-red-600', bg: 'bg-red-500' };
};

const SkillBreakdown = ({ skills }) => {
    return (
        <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-gray-500" />Skill Breakdown
            </h3>
            <div className="space-y-4">
                {skills.map(skillItem => {
                    const colors = getScoreColor(skillItem.score);
                    return (
                        <div key={skillItem.skill}>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">{skillItem.skill}</span>
                                <span className={`text-sm font-bold ${colors.text}`}>{skillItem.score}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className={`h-2 rounded-full ${colors.bg}`} style={{ width: `${skillItem.score}%` }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default SkillBreakdown;
