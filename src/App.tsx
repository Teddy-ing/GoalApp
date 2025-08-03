import { useState, useEffect } from 'react';
import { Goal, GoalDB } from './db/db';
import { GoalSection } from './components/GoalSection';
import { NotesArea } from './components/NotesArea';
import { ConfirmDialog } from './components/ConfirmDialog';
import './App.css';

interface EditGoalForm {
  id: number;
  title: string;
  description: string;
  targetValue: number;
}

interface AddGoalForm {
  title: string;
  description: string;
  targetValue: number;
  goalType: Goal['goal_type'];
}

function App() {
  // State management
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    goalId?: number;
    goalTitle?: string;
  }>({ isOpen: false });

  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    goal?: EditGoalForm;
  }>({ isOpen: false });

  const [addDialog, setAddDialog] = useState<{
    isOpen: boolean;
    goalType?: Goal['goal_type'];
  }>({ isOpen: false });

  // Form states
  const [editForm, setEditForm] = useState<EditGoalForm>({
    id: 0,
    title: '',
    description: '',
    targetValue: 1,
  });

  const [addForm, setAddForm] = useState<AddGoalForm>({
    title: '',
    description: '',
    targetValue: 1,
    goalType: 'daily',
  });

  // Load goals on component mount
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedGoals = await GoalDB.getGoals();
      setGoals(loadedGoals);
    } catch (err) {
      console.error('Failed to load goals:', err);
      setError('Failed to load goals from database');
    } finally {
      setLoading(false);
    }
  };

  // Goal event handlers
  const handleIncrement = async (goalId: number, amount: number = 1) => {
    try {
      await GoalDB.incrementGoal(goalId, amount);
      // Update local state
      setGoals(prev => 
        prev.map(goal => 
          goal.id === goalId 
            ? { ...goal, current_value: goal.current_value + amount }
            : goal
        )
      );
    } catch (err) {
      console.error('Failed to increment goal:', err);
      setError('Failed to update goal progress');
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditForm({
      id: goal.id!,
      title: goal.title,
      description: goal.description || '',
      targetValue: goal.target_value,
    });
    setEditDialog({ isOpen: true, goal: editForm });
  };

  const handleEditSubmit = async () => {
    try {
      await GoalDB.updateGoal(
        editForm.id,
        editForm.title,
        editForm.description || null,
        editForm.targetValue
      );
      
      // Update local state
      setGoals(prev => 
        prev.map(goal => 
          goal.id === editForm.id 
            ? { 
                ...goal, 
                title: editForm.title, 
                description: editForm.description,
                target_value: editForm.targetValue 
              }
            : goal
        )
      );
      
      setEditDialog({ isOpen: false });
    } catch (err) {
      console.error('Failed to update goal:', err);
      setError('Failed to update goal');
    }
  };

  const handleDelete = (goalId: number) => {
    const goal = goals.find(g => g.id === goalId);
    setDeleteDialog({
      isOpen: true,
      goalId,
      goalTitle: goal?.title || 'Unknown Goal',
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.goalId) {
      console.error('Delete attempted with no goalId');
      setError('No goal selected for deletion');
      return;
    }
    
    try {
      console.log('Deleting goal with ID:', deleteDialog.goalId);
      await GoalDB.deleteGoal(deleteDialog.goalId);
      console.log('Database delete successful');
      
      // Remove from local state
      setGoals(prev => {
        const updatedGoals = prev.filter(goal => goal.id !== deleteDialog.goalId);
        console.log('Updated goals state, removed goal. New count:', updatedGoals.length);
        return updatedGoals;
      });
      
      setDeleteDialog({ isOpen: false });
      console.log('Delete operation completed successfully');
    } catch (err) {
      console.error('Failed to delete goal:', err);
      setError(`Failed to delete goal: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleAddGoal = (goalType: Goal['goal_type']) => {
    setAddForm(prev => ({ ...prev, goalType }));
    setAddDialog({ isOpen: true, goalType });
  };

  const handleAddSubmit = async () => {
    try {
      const newGoalId = await GoalDB.addGoal(
        addForm.title,
        addForm.description || null,
        addForm.targetValue,
        addForm.goalType
      );
      
      // Add to local state
      const newGoal: Goal = {
        id: newGoalId,
        title: addForm.title,
        description: addForm.description,
        target_value: addForm.targetValue,
        current_value: 0,
        goal_type: addForm.goalType,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setGoals(prev => [newGoal, ...prev]);
      setAddDialog({ isOpen: false });
      
      // Reset form
      setAddForm({
        title: '',
        description: '',
        targetValue: 1,
        goalType: 'daily',
      });
    } catch (err) {
      console.error('Failed to add goal:', err);
      setError('Failed to add new goal');
    }
  };

  const dismissError = () => setError(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">GoalTracker</h1>
                <p className="text-sm text-gray-500">Track your daily, weekly, monthly, and yearly goals</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">{goals.length}</span> active goals
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={dismissError}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Goal Sections */}
          <div className="lg:col-span-2 space-y-6">
            <GoalSection
              title="Daily Goals"
              goals={goals}
              goalType="daily"
              onIncrement={handleIncrement}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddGoal={handleAddGoal}
              defaultExpanded={true}
            />
            
            <GoalSection
              title="Weekly Goals"
              goals={goals}
              goalType="weekly"
              onIncrement={handleIncrement}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddGoal={handleAddGoal}
              defaultExpanded={true}
            />
            
            <GoalSection
              title="Monthly Goals"
              goals={goals}
              goalType="monthly"
              onIncrement={handleIncrement}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddGoal={handleAddGoal}
              defaultExpanded={false}
            />
            
            <GoalSection
              title="Yearly Goals"
              goals={goals}
              goalType="yearly"
              onIncrement={handleIncrement}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddGoal={handleAddGoal}
              defaultExpanded={false}
            />
          </div>
          
          {/* Notes Area */}
          <div className="lg:col-span-1">
            <NotesArea 
              placeholder="Add your notes, thoughts, and reflections here..."
              debounceMs={1500}
            />
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false })}
        onConfirm={handleDeleteConfirm}
        title="Delete Goal"
        message={`Are you sure you want to delete "${deleteDialog.goalTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonStyle="danger"
        icon="danger"
      />

      {/* Edit Goal Dialog */}
      {editDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] flex flex-col my-8">
            <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Edit Goal</h3>
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Goal title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                  placeholder="Goal description (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.targetValue}
                  onChange={(e) => setEditForm(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 1 }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 flex-shrink-0">
              <button
                onClick={() => setEditDialog({ isOpen: false })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={!editForm.title.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Dialog */}
      {addDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] flex flex-col my-8">
            <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Add {addForm.goalType} Goal</h3>
            <div className="space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={addForm.title}
                  onChange={(e) => setAddForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Goal title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={addForm.description}
                  onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                  placeholder="Goal description (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
                <input
                  type="number"
                  min="1"
                  value={addForm.targetValue}
                  onChange={(e) => setAddForm(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 1 }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 flex-shrink-0">
              <button
                onClick={() => setAddDialog({ isOpen: false })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={!addForm.title.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
