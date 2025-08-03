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
        return 'border-blue-200 bg-blue-50';
      case 'weekly':
        return 'border-green-200 bg-green-50';
      case 'monthly':
        return 'border-yellow-200 bg-yellow-50';
      case 'yearly':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getHeaderColor = (type: Goal['goal_type']) => {
    switch (type) {
      case 'daily':
        return 'text-blue-700 border-blue-300';
      case 'weekly':
        return 'text-green-700 border-green-300';
      case 'monthly':
        return 'text-yellow-700 border-yellow-300';
      case 'yearly':
        return 'text-purple-700 border-purple-300';
      default:
        return 'text-gray-700 border-gray-300';
    }
  };

  const getAddButtonColor = (type: Goal['goal_type']) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500';
      case 'weekly':
        return 'bg-green-500 hover:bg-green-600 focus:ring-green-500';
      case 'monthly':
        return 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500';
      case 'yearly':
        return 'bg-purple-500 hover:bg-purple-600 focus:ring-purple-500';
      default:
        return 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500';
    }
  };

  return (
    <div className={`rounded-lg border-2 ${getSectionColor(goalType)} transition-all duration-200`}>
      {/* Collapsible Header */}
      <div
        className={`flex items-center justify-between p-4 cursor-pointer border-b-2 ${getHeaderColor(goalType)} hover:bg-opacity-75 transition-colors duration-150`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold capitalize">
            {title}
          </h2>
          <span className="text-sm font-medium px-2 py-1 rounded-full bg-white bg-opacity-50">
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
            className={`${getAddButtonColor(goalType)} text-white p-2 rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2`}
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
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No {goalType} goals yet</p>
                <p className="text-xs text-gray-400 mt-1">Click the + button to add your first goal</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalSection; 