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
    if (goal.id) {
      onDelete(goal.id);
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header with title and menu */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex-1 mr-2">
          {goal.title}
        </h3>
        
        {/* Three-dot menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Goal options"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          {/* Dropdown menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={handleEdit}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
        <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
      )}

      {/* Progress section */}
      <div className="mb-4">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Progress text */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>{Math.round(progressPercentage)}%</span>
          <span>{goal.current_value}/{goal.target_value}</span>
        </div>
      </div>

      {/* Increment button */}
      <div className="flex justify-center">
        <button
          onClick={handleIncrement}
          disabled={goal.current_value >= goal.target_value}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add {incrementAmount}
        </button>
      </div>

      {/* Goal type badge */}
      <div className="mt-3 flex justify-end">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
          {goal.goal_type}
        </span>
      </div>
    </div>
  );
};

export default GoalCard; 