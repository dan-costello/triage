import { useState } from 'react';
import { Task, Category } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import CategoryManager from '@/components/CategoryManager';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import WeeklySummary from '@/components/WeeklySummary';
import { appWindow } from '@tauri-apps/api/window';

export default function App() {
  const [categories, setCategories, categoriesLoaded] = useLocalStorage<Category[]>('categories', []);
  const [tasks, setTasks, tasksLoaded] = useLocalStorage<Task[]>('tasks', []);
  const [activeTab, setActiveTab] = useState<'active' | 'done' | 'summary'>('active');
  const [sortBy, setSortBy] = useState<'category' | 'priority'>('category');

  const handleAddCategory = (category: Category) => {
    setCategories([...categories, category]);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
    setTasks(tasks.filter(task => task.categoryId !== categoryId));
  };

  const handleAddTask = (task: Task) => {
    setTasks([...tasks, task]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date() : undefined,
        };
      }
      return task;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleChangePriority = (taskId: string, newPriority: 'today' | 'soon' | 'later') => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, priority: newPriority } : task
    ));
  };

  const handleChangeCategory = (taskId: string, newCategoryId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, categoryId: newCategoryId } : task
    ));
  };

  if (!categoriesLoaded || !tasksLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <main className="h-screen w-full bg-gray-100 dark:bg-gray-900 flex flex-col overflow-hidden">
      <div
        className="w-full h-8 bg-gray-200 dark:bg-gray-800 flex items-center justify-between px-2 cursor-move select-none flex-shrink-0"
        data-tauri-drag-region
      >
        <div className="w-12 h-1 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
        <div className="flex gap-2">
          <button
            onClick={() => appWindow.minimize()}
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400 text-sm cursor-pointer"
            title="Minimize"
          >
            −
          </button>
          <button
            onClick={() => appWindow.close()}
            className="w-6 h-6 flex items-center justify-center hover:bg-red-500 hover:text-white rounded text-gray-600 dark:text-gray-400 text-sm cursor-pointer"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden px-3 pb-3">
        <header className="mb-4 pt-3 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Tasks</h1>
        </header>

        <div className="flex-shrink-0">
          <CategoryManager categories={categories} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} />
          <TaskForm categories={categories} onAddTask={handleAddTask} />
        </div>

        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700 text-xs flex-shrink-0">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 px-2 py-2 font-medium ${
                activeTab === 'active'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Active ({tasks.filter(t => !t.completed).length})
            </button>
            <button
              onClick={() => setActiveTab('done')}
              className={`flex-1 px-2 py-2 font-medium ${
                activeTab === 'done'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Done ({tasks.filter(t => t.completed).length})
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 px-2 py-2 font-medium ${
                activeTab === 'summary'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              Summary
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {(activeTab === 'active' || activeTab === 'done') && (
              <div className="mb-3 flex flex-col gap-1.5">
                <span className="text-xs text-gray-600 dark:text-gray-400">View by:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setSortBy('category')}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium ${
                      sortBy === 'category'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Category
                  </button>
                  <button
                    onClick={() => setSortBy('priority')}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium ${
                      sortBy === 'priority'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Priority
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'active' && (
              <TaskList
                tasks={tasks}
                categories={categories}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onChangePriority={handleChangePriority}
                onChangeCategory={handleChangeCategory}
                showCompleted={false}
                sortBy={sortBy}
              />
            )}
            {activeTab === 'done' && (
              <TaskList
                tasks={tasks}
                categories={categories}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onChangePriority={handleChangePriority}
                onChangeCategory={handleChangeCategory}
                showCompleted={true}
                sortBy={sortBy}
              />
            )}
            {activeTab === 'summary' && (
              <WeeklySummary tasks={tasks} categories={categories} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
