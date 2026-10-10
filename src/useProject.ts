import { useCallback, useEffect, useReducer, useState } from 'react';
import { parseProject, STORAGE_KEY, type Project } from './model';
import { createKidProject } from './kids';

interface History { past: Project[]; present: Project; future: Project[] }
type Action = { type: 'change'; update: (project: Project) => Project } | { type: 'undo' } | { type: 'redo' };

function reducer(state: History, action: Action): History {
  if (action.type === 'undo') {
    if (!state.past.length) return state;
    return { past: state.past.slice(0, -1), present: state.past[state.past.length - 1], future: [state.present, ...state.future] };
  }
  if (action.type === 'redo') {
    if (!state.future.length) return state;
    return { past: [...state.past, state.present], present: state.future[0], future: state.future.slice(1) };
  }
  const next = action.update(state.present);
  if (JSON.stringify(next) === JSON.stringify(state.present)) return state;
  return { past: [...state.past.slice(-79), state.present], present: next, future: [] };
}

function loadProject(): Project {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return parseProject(JSON.parse(stored));
  } catch { /* Um projeto indisponível não impede a primeira criação. */ }
  return createKidProject();
}

export function useProject() {
  const [history, dispatch] = useReducer(reducer, undefined, () => ({ past: [], present: loadProject(), future: [] }));
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>('saved');

  useEffect(() => {
    setSaveStatus('saving');
    const save = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history.present));
        setSaveStatus('saved');
      } catch { setSaveStatus('error'); }
    };
    const timer = setTimeout(save, 500);
    window.addEventListener('pagehide', save);
    return () => { clearTimeout(timer); window.removeEventListener('pagehide', save); };
  }, [history.present]);

  const change = useCallback((update: (project: Project) => Project) => dispatch({ type: 'change', update }), []);
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);

  return { project: history.present, change, undo, redo, canUndo: !!history.past.length, canRedo: !!history.future.length, saveStatus };
}
