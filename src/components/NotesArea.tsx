import React, { useState, useEffect, useRef } from 'react';
import { NotesDB } from '../db/db';

interface NotesAreaProps {
  className?: string;
  placeholder?: string;
  debounceMs?: number;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const NotesArea: React.FC<NotesAreaProps> = ({
  className = '',
  placeholder = 'Add your notes here...',
  debounceMs = 1000,
}) => {
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for debouncing
  const debounceTimeoutRef = useRef<number | null>(null);
  const lastSavedContentRef = useRef('');

  // Load existing notes on component mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const notes = await NotesDB.getNotes();
        const noteContent = notes?.content || '';
        setContent(noteContent);
        lastSavedContentRef.current = noteContent;
      } catch (err) {
        console.error('Failed to load notes:', err);
        setError('Failed to load notes');
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, []);

  // Debounced save function
  const debouncedSave = async (newContent: string) => {
    // Don't save if content hasn't changed
    if (newContent === lastSavedContentRef.current) {
      setSaveStatus('idle');
      return;
    }

    try {
      setSaveStatus('saving');
      await NotesDB.saveNotes(newContent);
      lastSavedContentRef.current = newContent;
      setSaveStatus('saved');
      setError(null);
      
      // Reset to idle after showing saved status
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Failed to save notes:', err);
      setSaveStatus('error');
      setError('Failed to save notes');
    }
  };

  // Handle content changes with debouncing
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout for debounced save
    debounceTimeoutRef.current = setTimeout(() => {
      debouncedSave(newContent);
    }, debounceMs);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Manual save function (could be triggered by Ctrl+S)
  const handleManualSave = async () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    await debouncedSave(content);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleManualSave();
    }
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <div className="flex items-center text-blue-600">
            <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center text-green-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">Saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Error saving</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-slate-900/60 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center text-slate-600 dark:text-slate-300">
            <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading notes...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-900/60 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Notes</h3>
        </div>
        
        <div className="flex items-center gap-3">
          {getSaveStatusIcon()}
          
          {/* Manual save button */}
          <button
            onClick={handleManualSave}
            disabled={saveStatus === 'saving' || content === lastSavedContentRef.current}
            className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            title="Save notes (Ctrl+S)"
          >
            Save
          </button>
        </div>
      </div>

      {/* Textarea */}
      <div className="p-4">
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-64 p-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
          style={{ fontFamily: 'inherit' }}
        />
        
        {/* Footer with shortcuts info */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            {content.length > 0 && (
              <span>{content.length} characters</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>Auto-saves after {debounceMs / 1000}s</span>
            <span>Ctrl+S to save manually</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesArea; 