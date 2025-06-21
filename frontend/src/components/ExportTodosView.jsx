import React from 'react';

const ExportTodosView = ({
    todos,
    exportToJson,
    exportToCsv,
    buttonSecondaryClasses
}) => (
    <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-semibold mb-3 dark:text-gray-100">Export Your Todos</h2>
        <div className="flex flex-wrap gap-3">
            <button
                onClick={exportToJson}
                className={buttonSecondaryClasses}
                disabled={todos.length === 0}
            >
                Export All as JSON
            </button>
            <button
                onClick={exportToCsv}
                className={buttonSecondaryClasses}
                disabled={todos.length === 0}
            >
                Export All as CSV
            </button>
        </div>
        {todos.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Add some todos to enable export options.</p>}
    </div>
);

export default ExportTodosView;
