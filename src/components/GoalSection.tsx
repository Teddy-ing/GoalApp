import React, { useState } from 'react';
import { Goal } from '../db/db';
import { GoalCard } from './GoalCard';

interface GoalSectionProps {
  title: string;
  goals: Goal[];
  goalType: Goal['goal_type'];
  onIncrement: (goalId: number, amount: number) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: number) => void;
  onAddGoal: (goalType: Goal['goal_type']) => void;
  defaultExpanded?: boolean;
}

export const GoalSection: React.FC<GoalSectionProps> = ({
  title,
  goals,
  goalType,
  onIncrement,
  onEdit,
  onDelete,
  onAddGoal,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Filter goals by the section's goal type
  const sectionGoals = goals.filter(goal => goal.goal_type === goalType);

  const handleAddGoal = () => {
    onAddGoal(goalType);
  };

  const getSectionColor = (type: Goal['goal_type']) => {
    switch (type) {
      case 'daily':
        return 'border-indigo-200 bg-indigo-50 dark:border-indigo-900/40 dark:bg-indigo-950/20';
      case 'weekly':
        return 'border-indigo-200 bg-indigo-50 dark:border-indigo-900/40 dark:bg-indigo-950/20';
      case 'monthly':
        return 'border-indigo-200 bg-indigo-50 dark:border-indigo-900/40 dark:bg-indigo-950/20';
      case 'yearly':
        return 'border-indigo-200 bg-indigo-50 dark:border-indigo-900/40 dark:bg-indigo-950/20';
      default:
        return 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40';
    }
  };

  const getHeaderColor = (type: Goal['goal_type']) => {
    switch (type) {
      case 'daily':
        return 'text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      case 'weekly':
        return 'text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      case 'monthly':
        return 'text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      case 'yearly':
        return 'text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      default:
        return 'text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700';
    }
  };

  const getAddButtonColor = (type: Goal['goal_type']) => {
    switch (type) {
      case 'daily':
        return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
      case 'weekly':
        return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
      case 'monthly':
        return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
      case 'yearly':
        return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
      default:
        return 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-500';
    }
  };

  return (
    <div className={`rounded-lg border ${getSectionColor(goalType)} transition-all duration-200`}>
      {/* Collapsible Header */}
      <div
        className={`flex items-center justify-between p-4 cursor-pointer border-b ${getHeaderColor(goalType)} hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors duration-150`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold capitalize">
            {title}
          </h2>
          <span className="text-sm font-medium px-2 py-1 rounded-full bg-white/60 dark:bg-slate-800/60">
            {sectionGoals.length} {sectionGoals.length === 1 ? 'goal' : 'goals'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Add Goal Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddGoal();
            }}
            className={`${getAddButtonColor(goalType)} text-white p-2 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
            title={`Add ${goalType} goal`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          {/* Collapse/Expand Icon */}
          <div className="text-2xl font-bold transition-transform duration-200">
            {isExpanded ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Goals List - Collapsible Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Drag-drop wrapper - will be enhanced in task 5.0 */}
          <div className="space-y-4">
            {sectionGoals.length > 0 ? (
              sectionGoals.map((goal) => (
                <div key={goal.id} className="goal-item">
                  <GoalCard
                    goal={goal}
                    onIncrement={onIncrement}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-300">
                <p className="text-sm">No {goalType} goals yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click the + button to add your first goal</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalSection; 