import { useState } from 'react';
import { Task, Category } from '@/types';

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onChangePriority: (taskId: string, priority: 'today' | 'soon' | 'later') => void;
  onChangeCategory?: (taskId: string, categoryId: string) => void;
  onEditTask: (taskId: string, newText: string) => void;
  showCompleted?: boolean;
  sortBy?: 'category' | 'priority';
}

export default function TaskList({ tasks, categories, onToggleTask, onDeleteTask, onChangePriority, onChangeCategory, onEditTask, showCompleted = false, sortBy = 'category' }: TaskListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const filteredTasks = tasks.filter(task => task.completed === showCompleted);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const getCategoryById = (id: string) => categories.find(cat => cat.id === id);

  const getPriorityLabel = (priority: 'today' | 'soon' | 'later') => {
    const labels = {
      'today': { text: 'Today', color: 'bg-red-500', name: 'Must do today', order: 1 },
      'soon': { text: 'Soon', color: 'bg-orange-500', name: 'Next few days', order: 2 },
      'later': { text: 'Later', color: 'bg-blue-500', name: 'Future/someday', order: 3 },
    };
    return labels[priority];
  };

  const handleTaskClick = (taskId: string) => {
    if (selectedTask === taskId) {
      setSelectedTask(null);
    } else {
      setSelectedTask(taskId);
    }
  };

  const handleGroupHeaderClick = (groupKey: string, e: React.MouseEvent) => {
    // Only move task if one is selected
    if (!selectedTask) {
      toggleGroup(groupKey);
      return;
    }

    // Don't toggle if we're moving a task
    e.stopPropagation();

    if (sortBy === 'priority') {
      onChangePriority(selectedTask, groupKey as 'today' | 'soon' | 'later');
    } else if (sortBy === 'category' && onChangeCategory) {
      onChangeCategory(selectedTask, groupKey);
    }
    setSelectedTask(null);
  };

  const handleStartEdit = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task.id);
    setEditText(task.title);
  };

  const handleSaveEdit = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editText.trim()) {
      onEditTask(taskId, editText.trim());
    }
    setEditingTask(null);
    setEditText('');
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(null);
    setEditText('');
  };

  const groupedTasks = sortBy === 'priority'
    ? filteredTasks.reduce((acc, task) => {
        const priority = task.priority;
        if (!acc[priority]) {
          acc[priority] = [];
        }
        acc[priority].push(task);
        return acc;
      }, { today: [], soon: [], later: [] } as Record<string, Task[]>)
    : filteredTasks.reduce((acc, task) => {
        const categoryId = task.categoryId;
        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        acc[categoryId].push(task);
        return acc;
      }, {} as Record<string, Task[]>);

  // Sort tasks within each group by priority (today > soon > later)
  Object.keys(groupedTasks).forEach(key => {
    groupedTasks[key].sort((a, b) => {
      const orderA = getPriorityLabel(a.priority).order;
      const orderB = getPriorityLabel(b.priority).order;
      return orderA - orderB;
    });
  });

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {showCompleted ? 'No completed tasks yet' : 'No active tasks'}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {selectedTask && (
        <div className="bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded p-2 text-xs text-blue-800 dark:text-blue-200">
          {sortBy === 'priority'
            ? '📍 Click a priority group to move this task'
            : '📍 Click a category group to move this task'}
        </div>
      )}
      {Object.entries(groupedTasks).sort(([a], [b]) => {
        if (sortBy === 'priority') {
          // Sort priority groups: today, soon, later
          const orderA = getPriorityLabel(a as 'today' | 'soon' | 'later').order;
          const orderB = getPriorityLabel(b as 'today' | 'soon' | 'later').order;
          return orderA - orderB;
        }
        if (sortBy === 'category') {
          // Sort category groups alphabetically by category name
          const categoryA = getCategoryById(a);
          const categoryB = getCategoryById(b);
          if (categoryA && categoryB) {
            return categoryA.name.localeCompare(categoryB.name);
          }
        }
        return 0;
      }).map(([groupKey, groupTasks]) => {
        if (sortBy === 'category') {
          const category = getCategoryById(groupKey);
          if (!category) return null;
          const isExpanded = expandedGroups[groupKey] ?? true;

          return (
            <div
              key={groupKey}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
                selectedTask ? 'border-blue-400 dark:border-blue-600 border-2 cursor-pointer' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <button
                onClick={(e) => handleGroupHeaderClick(groupKey, e)}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <h3
                  className="font-semibold text-white px-2 py-0.5 rounded text-xs"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </h3>
                <span className="text-gray-500 dark:text-gray-400 text-sm">{isExpanded ? '▼' : '▶'}</span>
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-1.5">
                  {groupTasks.map((task) => {
                    const priorityInfo = getPriorityLabel(task.priority);
                    const isSelected = selectedTask === task.id;
                    const isEditing = editingTask === task.id;

                    if (isEditing) {
                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 p-2 rounded bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(task.id, e as any);
                              } else if (e.key === 'Escape') {
                                handleCancelEdit(e as any);
                              }
                            }}
                          />
                          <button
                            onClick={(e) => handleSaveEdit(task.id, e)}
                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-xs"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task.id)}
                        className={`flex items-center gap-2 p-2 rounded group ${
                          isSelected
                            ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                            : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                        } cursor-pointer`}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleTask(task.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 cursor-pointer flex-shrink-0"
                        />
                        <select
                          value={task.priority}
                          onChange={(e) => {
                            e.stopPropagation();
                            onChangePriority(task.id, e.target.value as 'today' | 'soon' | 'later');
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`px-1.5 py-0.5 rounded text-white text-xs font-bold flex-shrink-0 border-0 cursor-pointer ${priorityInfo.color}`}
                          title="Change priority"
                        >
                          <option value="today">Today</option>
                          <option value="soon">Soon</option>
                          <option value="later">Later</option>
                        </select>
                        <span className={task.completed ? 'line-through text-gray-500 dark:text-gray-400 flex-1 text-xs' : 'text-gray-900 dark:text-gray-100 flex-1 text-xs'}>
                          {task.title}
                        </span>
                        {task.completedAt && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {new Date(task.completedAt).toLocaleDateString()}
                          </span>
                        )}
                        <button
                          onClick={(e) => handleStartEdit(task, e)}
                          className="opacity-0 group-hover:opacity-100 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm leading-none flex-shrink-0"
                          title="Edit task"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm leading-none flex-shrink-0"
                          title="Delete task"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        } else {
          // Priority view
          const priorityInfo = getPriorityLabel(groupKey as 'today' | 'soon' | 'later');
          const isExpanded = expandedGroups[groupKey] ?? true;

          return (
            <div
              key={groupKey}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
                selectedTask ? 'border-blue-400 dark:border-blue-600 border-2 cursor-pointer' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <button
                onClick={(e) => handleGroupHeaderClick(groupKey, e)}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <h3 className={`font-semibold text-white px-2 py-0.5 rounded text-xs ${priorityInfo.color}`}>
                  {priorityInfo.text}: {priorityInfo.name} ({groupTasks.length})
                </h3>
                <span className="text-gray-500 dark:text-gray-400 text-sm">{isExpanded ? '▼' : '▶'}</span>
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-1.5">
                  {groupTasks.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-xs">
                      No tasks
                    </div>
                  ) : (
                    groupTasks.map((task) => {
                      const category = getCategoryById(task.categoryId);
                      if (!category) return null;
                      const isSelected = selectedTask === task.id;
                      const isEditing = editingTask === task.id;

                      if (isEditing) {
                        return (
                          <div
                            key={task.id}
                            className="flex items-center gap-2 p-2 rounded bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveEdit(task.id, e as any);
                                } else if (e.key === 'Escape') {
                                  handleCancelEdit(e as any);
                                }
                              }}
                            />
                            <button
                              onClick={(e) => handleSaveEdit(task.id, e)}
                              className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                              title="Save"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-500 text-xs"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      }

                      return (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task.id)}
                        className={`flex items-center gap-2 p-2 rounded group ${
                          isSelected
                            ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                            : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                        } cursor-pointer`}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleTask(task.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 cursor-pointer flex-shrink-0"
                        />
                        <span
                          className="px-1.5 py-0.5 rounded text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.name}
                        </span>
                        <span className={task.completed ? 'line-through text-gray-500 dark:text-gray-400 flex-1 text-xs' : 'text-gray-900 dark:text-gray-100 flex-1 text-xs'}>
                          {task.title}
                        </span>
                        {task.completedAt && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {new Date(task.completedAt).toLocaleDateString()}
                          </span>
                        )}
                        <button
                          onClick={(e) => handleStartEdit(task, e)}
                          className="opacity-0 group-hover:opacity-100 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm leading-none flex-shrink-0"
                          title="Edit task"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm leading-none flex-shrink-0"
                          title="Delete task"
                        >
                          🗑️
                        </button>
                      </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        }
      })}
    </div>
  );
}
