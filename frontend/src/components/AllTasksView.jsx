import React from 'react';
import TodoItem from './TodoItem.jsx'; // Import the new TodoItem component

const AllTasksView = ({
    todos, newTodoTitle, setNewTodoTitle, addTodoAndEdit,
    filterStatus, setFilterStatus, filterPriority, setFilterPriority,
    searchTerm, setSearchTerm, filteredTodos,
    toggleComplete, startEditTodo, deleteTodo, theme,
    inputSelectCommonClasses, buttonPrimaryClasses
    // buttonSubtleClasses is no longer needed here as TodoItem defines its own
}) => (
    <>
        <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 dark:text-gray-100">Organize & Plan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div>
                    <label htmlFor="filterStatus" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
                    <select id="filterStatus" className={inputSelectCommonClasses + " w-full"} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} >
                        <option value="All">All</option> <option value="Active">Active</option> <option value="Completed">Completed</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="filterPriority" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Priority</label>
                    <select id="filterPriority" className={inputSelectCommonClasses + " w-full"} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} >
                        <option value="All">All</option> <option value="Low">Low</option> <option value="Medium">Medium</option> <option value="High">High</option>
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="search" className="sr-only">Search</label>
                    <input type="text" id="search" className={inputSelectCommonClasses + " w-full"} placeholder="Search todos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>
        </div>
        <div className="mb-8">
            <div className="flex gap-2 items-center">
                <input
                    type="text"
                    className={inputSelectCommonClasses + " flex-grow"}
                    placeholder="Add a new task... (then press Enter)"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter' && newTodoTitle.trim()) addTodoAndEdit(); }}
                />
                <button
                    onClick={addTodoAndEdit}
                    className={buttonPrimaryClasses + " px-3"}
                    disabled={!newTodoTitle.trim()}
                    title="Add new task"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </button>
            </div>
        </div>
        <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 dark:text-gray-100">Your Todos</h2>
            {filteredTodos.length === 0 && <p className="text-gray-500 dark:text-gray-400 py-3 px-1.5 text-sm">No todos yet. Add one above to get started!</p>}
            <div className="space-y-1">
                {filteredTodos.map(todo => (
                    <TodoItem
                        key={todo.id}
                        todo={todo}
                        theme={theme}
                        toggleComplete={toggleComplete}
                        startEditTodo={startEditTodo}
                        deleteTodo={deleteTodo}
                        // buttonSubtleClasses is now defined within TodoItem.jsx
                    />
                ))}
            </div>
        </div>
    </>
);

export default AllTasksView;
