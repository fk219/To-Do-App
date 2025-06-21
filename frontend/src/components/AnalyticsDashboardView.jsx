import React from 'react';

const AnalyticsDashboardView = ({
    totalTodos,
    completedTodosCount,
    activeTodosCount,
    completionPercentage,
    priorityCounts,
    averageCompletionTime
}) => (
    <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-semibold mb-3 dark:text-gray-100">Productivity Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="p-3 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700/30">
                <h3 className="font-medium text-xs text-gray-500 dark:text-gray-400">Total Todos</h3>
                <p className="text-xl font-semibold">{totalTodos}</p>
            </div>
            <div className="p-3 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700/30">
                <h3 className="font-medium text-xs text-green-600 dark:text-green-400">Completed</h3>
                <p className="text-xl font-semibold">{completedTodosCount}</p>
            </div>
            <div className="p-3 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700/30">
                <h3 className="font-medium text-xs text-yellow-600 dark:text-yellow-400">Active</h3>
                <p className="text-xl font-semibold">{activeTodosCount}</p>
            </div>
            <div className="p-3 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700/30">
                <h3 className="font-medium text-xs text-indigo-600 dark:text-indigo-400">Completion Rate</h3>
                <p className="text-xl font-semibold">{completionPercentage}%</p>
            </div>
            <div className="p-3 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700/30 sm:col-span-2">
                <h3 className="font-medium text-xs text-gray-500 dark:text-gray-400 mb-1">Todos by Priority</h3>
                <ul className="list-none pl-0 text-xs space-y-0.5">
                    <li>Low: <span className="font-semibold">{priorityCounts.Low || 0}</span></li>
                    <li>Medium: <span className="font-semibold">{priorityCounts.Medium || 0}</span></li>
                    <li>High: <span className="font-semibold">{priorityCounts.High || 0}</span></li>
                </ul>
            </div>
            <div className="p-3 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700/30">
                <h3 className="font-medium text-xs text-gray-500 dark:text-gray-400">Avg. Completion Time</h3>
                <p className="text-sm">{averageCompletionTime}</p>
            </div>
        </div>
    </div>
);

export default AnalyticsDashboardView;
