import React, { useState } from 'react';
import { Goal } from '../db/db.ts';

interface GoalCardProps {
  goal: Goal;
  onIncrement: (goalId: number, amount: number) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: number) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onIncrement,
  onEdit,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Calculate progress percentage, ensuring it doesn't exceed 100%
  const progressPercentage = Math.min(
    (goal.current_value / goal.target_value) * 100,
    100
  );

  // Default increment amount (can be made configurable later)
  const incrementAmount = 1;

  const handleIncrement = () => {
    if (goal.id) {
      onIncrement(goal.id, incrementAmount);
    }
  };

  const handleEdit = () => {
    onEdit(goal);
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    console.log('🎯 GoalCard handleDelete called for goal:', goal.id, goal.title);
    if (goal.id) {
      console.log('📞 Calling onDelete prop with goalId:', goal.id);
      onDelete(goal.id);
    } else {
      console.log('❌ Goal has no ID!');
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900/60 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      {/* Header with title and menu */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex-1 mr-2">
          {goal.title}
        </h3>
        
        {/* Three-dot menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            aria-label="Goal options"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          {/* Dropdown menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-900 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-10">
              <div className="py-1">
                <button
                  onClick={handleEdit}
                  className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description if present */}
      {goal.description && (
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{goal.description}</p>
      )}

      {/* Progress section */}
      <div className="mb-4">
        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-2">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Progress text */}
        <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300">
          <span>{Math.round(progressPercentage)}%</span>
          <span>{goal.current_value}/{goal.target_value}</span>
        </div>
      </div>

      {/* Increment button */}
      <div className="flex justify-center">
        <button
          onClick={handleIncrement}
          disabled={goal.current_value >= goal.target_value}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add {incrementAmount}
        </button>
      </div>

      {/* Goal type badge */}
      <div className="mt-3 flex justify-end">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 capitalize">
          {goal.goal_type}
        </span>
      </div>
    </div>
  );
};

export default GoalCard; 