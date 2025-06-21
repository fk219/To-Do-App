import React from 'react';

// Define placeholder SVG icons directly within TodoItem or import from a shared icons file later
const CalendarIcon = () => <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>;
const DeleteIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;

// Common styling class for subtle buttons, can be defined here or passed as prop if it varies more widely
const buttonSubtleClasses = "text-xs p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400";


const TodoItem = ({ todo, theme, toggleComplete, startEditTodo, deleteTodo }) => {
    const priorityColors = {
        Low: theme === 'light' ? 'bg-green-100 text-green-600' : 'bg-green-500/20 text-green-400',
        Medium: theme === 'light' ? 'bg-yellow-100 text-yellow-600' : 'bg-yellow-500/20 text-yellow-400',
        High: theme === 'light' ? 'bg-red-100 text-red-600' : 'bg-red-500/20 text-red-400',
    };

    return (
        <div
            className={`todo-block group flex items-start py-2 pr-3 pl-1.5 mb-0.5 rounded
                        hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-100
                        ${todo.completed ? 'text-gray-500 dark:text-gray-500 opacity-60' : 'text-gray-800 dark:text-gray-100'}`}
        >
            {/* Checkbox Area */}
            <div className="pt-0.5 px-1.5">
                <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.id)}
                    className="h-4 w-4 text-blue-600 border-gray-400 dark:border-gray-600 rounded
                               focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800
                               bg-transparent dark:bg-transparent cursor-pointer"
                />
            </div>

            {/* Main Content Div */}
            <div className="flex-grow min-w-0 cursor-pointer" onClick={(e) => {
                // Prevent triggering edit if a button inside this div was the target (though actions are outside now)
                if (e.target.closest('button')) return;
                startEditTodo(todo);
            }}>
                <p className={`text-sm font-medium truncate ${todo.completed ? 'line-through' : ''}`}>
                    {todo.title}
                </p>
                {todo.description && (
                    <p className={`text-xs mt-0.5 text-gray-600 dark:text-gray-400 line-clamp-2 ${todo.completed ? 'line-through opacity-70' : 'opacity-70'}`}>
                        {todo.description}
                    </p>
                )}
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 text-xs">
                    {todo.dueDate && (
                        <span className={`flex items-center ${todo.completed ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                            <CalendarIcon />
                            {new Date(todo.dueDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    )}
                    {todo.priority && (
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[todo.priority] || priorityColors.Medium}`}>
                            {todo.priority}
                        </span>
                    )}
                </div>
            </div>

            {/* Action Buttons Div */}
            <div className="flex-shrink-0 flex items-center space-x-0.5 pl-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                <button title="Edit" onClick={(e) => { e.stopPropagation(); startEditTodo(todo); }} className={buttonSubtleClasses + " hover:text-blue-600 dark:hover:text-blue-400"}>
                    <EditIcon />
                </button>
                <button title="Delete" onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }} className={buttonSubtleClasses + " hover:text-red-600 dark:hover:text-red-400"}>
                    <DeleteIcon />
                </button>
            </div>
        </div>
    );
};

export default TodoItem;
