import React, { useState, useEffect, useMemo } from 'react';

// Import view components
import AllTasksView from './components/AllTasksView.jsx';
import AnalyticsDashboardView from './components/AnalyticsDashboardView.jsx';
import ExportTodosView from './components/ExportTodosView.jsx';
import SettingsView from './components/SettingsView.jsx';
import Sidebar from './components/Sidebar.jsx';
import EditTodoModal from './components/EditTodoModal.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Main App Component
const App = () => {
    // Base states
    const [todos, setTodos] = useState([
        { id: 1, title: 'Learn React', description: 'Study React fundamentals', dueDate: '2024-12-01', priority: 'High', completed: false, createdAt: new Date().toISOString() },
        { id: 2, title: 'Build Todo App', description: 'Complete the frontend and backend', dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString().split('T')[0], priority: 'Medium', completed: false, createdAt: new Date().toISOString() },
        { id: 3, title: 'Test App', description: 'Write unit tests', dueDate: '2024-12-20', priority: 'High', completed: true, createdAt: new Date(Date.now() - 3*24*60*60*1000).toISOString() },
    ]);
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [editingTodo, setEditingTodo] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPriority, setFilterPriority] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Theme state with localStorage persistence
    const [theme, setTheme] = useState(() => localStorage.getItem('appTheme') || 'light');

    // AI General Suggestions (Title, Overall Priority) in Edit Modal
    const [titleSuggestion, setTitleSuggestion] = useState('');
    const [descriptionSuggestion, setDescriptionSuggestion] = useState('');
    const [suggestedPriority, setSuggestedPriority] = useState('');
    const [suggestionLoading, setSuggestionLoading] = useState(false);

    // AI Description Assistance in Edit Modal
    const [descriptionAISuggestions, setDescriptionAISuggestions] = useState([]);
    const [isDescriptionAISuggesting, setIsDescriptionAISuggesting] = useState(false);

    // UI Feedback States
    const [motivationalQuote, setMotivationalQuote] = useState('');
    const [showQuote, setShowQuote] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [notifiedTodoIds, setNotifiedTodoIds] = useState(new Set());
    const [generalUserMessage, setGeneralUserMessage] = useState({ text: '', type: '' });

    // View Management State
    const [currentView, setCurrentView] = useState('all_tasks');

    // Settings States with localStorage persistence
    const [areRemindersGloballyEnabled, setAreRemindersGloballyEnabled] = useState(() => {
        const saved = localStorage.getItem('areRemindersGloballyEnabled');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [loggedInUser, setLoggedInUser] = useState(null);


    // Placeholder SVG Icons (defined once in App for Sidebar)
    const TasksSVGIcon = () => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17 6V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V7h1a1 1 0 001-1zm-2 10H5V5h10v11z"></path><path d="M14 11H8V9h6v2zm0 4H8v-2h6v2zM7 7H5V5h2v2z"></path></svg>;
    const AnalyticsSVGIcon = () => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11h14v2H2zM2 7h14v2H2zM2 3h14v2H2z"></path><path d="M16 15h2V3h-2v12zm-4-3h2V3h-2v9zm-4-4h2V3H8v5z"></path></svg>;
    const ExportSVGIcon = () => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>;
    const SettingsSVGIcon = () => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path></svg>;

    const navItems = [
        { id: 'all_tasks', label: 'My Tasks', icon: <TasksSVGIcon /> },
        { id: 'analytics_dashboard', label: 'Dashboard', icon: <AnalyticsSVGIcon /> },
        { id: 'export_todos', label: 'Export', icon: <ExportSVGIcon /> },
        { id: 'settings', label: 'Settings', icon: <SettingsSVGIcon /> }
    ];

    useEffect(() => {
        document.body.className = theme;
        localStorage.setItem('appTheme', theme);

        if ('Notification' in window) { setNotificationPermission(Notification.permission); }
        else { console.warn('Browser does not support desktop notification.'); setNotificationPermission('denied'); }

        const mockToken = localStorage.getItem('token');
        const mockUsername = localStorage.getItem('username');
        if (mockToken && mockUsername) {
            setLoggedInUser({ username: mockUsername });
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('areRemindersGloballyEnabled', JSON.stringify(areRemindersGloballyEnabled));
    }, [areRemindersGloballyEnabled]);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js') // Corrected path for Vite public dir
                .then(registration => console.log('Service Worker registered with scope:', registration.scope))
                .catch(error => console.error('Service Worker registration failed:', error));
        }
    }, []);


    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) { alert('This browser does not support desktop notifications.'); setNotificationPermission('denied'); return; }
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission === 'granted') new Notification('Notifications Enabled!', { body: 'Due date reminders are active.' , icon: '/vite.svg' }); // Updated icon path
        } else if (Notification.permission === 'denied') alert('Notification permission previously denied. Please enable it in browser settings.');
        else if (Notification.permission === 'granted') alert('Notifications are already enabled!');
    };
    useEffect(() => {
        if (notificationPermission === 'granted' && areRemindersGloballyEnabled) {
            const intervalId = setInterval(() => {
                const now = new Date();
                todos.forEach(todo => {
                    if (todo.completed || !todo.dueDate || notifiedTodoIds.has(todo.id)) return;
                    const dueDateParts = todo.dueDate.split('-');
                    const dueDate = new Date(parseInt(dueDateParts[0]), parseInt(dueDateParts[1]) - 1, parseInt(dueDateParts[2]), 23, 59, 59);
                    if (dueDate.getTime() - now.getTime() > 0 && dueDate.getTime() - now.getTime() <= 24 * 60 * 60 * 1000) {
                        new Notification('Upcoming Todo Reminder!', { body: `Task "${todo.title}" is due on ${dueDate.toLocaleDateString()}.`, icon: '/vite.svg', tag: `todo-${todo.id}` }); // Updated icon path
                        setNotifiedTodoIds(prev => new Set(prev).add(todo.id));
                    }
                });
            }, 30 * 60 * 1000);
            return () => clearInterval(intervalId);
        }
    }, [todos, notificationPermission, notifiedTodoIds, areRemindersGloballyEnabled]);
    const toggleTheme = () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');

    const fetchSuggestionsForEdit = async (currentTitle, currentDescription, currentPriorityValue) => {
        setGeneralUserMessage({text:'', type:''});
        if (!currentTitle && !currentDescription) { setTitleSuggestion(''); setDescriptionSuggestion(''); setSuggestedPriority(''); return; }
        setSuggestionLoading(true);
        setTitleSuggestion(''); setDescriptionSuggestion(''); setSuggestedPriority('');
        await new Promise(resolve => setTimeout(resolve, 1000));
        let genTitle = `Optimized: ${currentTitle} (AI)`;
        let genDesc = currentDescription ? `Refined: ${currentDescription} (AI)` : `Consider adding details for '${currentTitle}'. (AI)`;
        let genPrio = ['High', 'Medium', 'Low'][Math.floor(Math.random()*3)];
        setTitleSuggestion(genTitle);
        setDescriptionSuggestion(genDesc);
        if (genPrio !== currentPriorityValue) setSuggestedPriority(genPrio);
        setSuggestionLoading(false);
    };
    const handleDescriptionAISuggest = async (currentDescription) => {
        setGeneralUserMessage({ text: '', type: '' });
        setDescriptionAISuggestions([]);
        if (!currentDescription || !currentDescription.trim()) {
            setDescriptionAISuggestions([ "What is the main goal of this task?", "Who is this task for, or who is involved?", "What are the key steps or components to complete it?", "Are there any specific requirements or constraints?" ]);
            setGeneralUserMessage({ text: "Here are some general prompts to get you started on the description.", type: 'info' });
            setIsDescriptionAISuggesting(false); return;
        }
        setIsDescriptionAISuggesting(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setGeneralUserMessage({ text: 'Authentication required to use AI features. Please ensure you are logged in.', type: 'error' });
            setIsDescriptionAISuggesting(false); return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/refine-description`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token, }, body: JSON.stringify({ description: currentDescription }), });
            const data = await response.json();
            if (!response.ok) { throw new Error(data.msg || data.message || `Error ${response.status}: Failed to get suggestions from server.`); }
            let suggestions = [];
            if (data && Array.isArray(data.suggestions)) { suggestions = data.suggestions; }
            if (suggestions.length > 0) {
                setDescriptionAISuggestions(suggestions.filter(s => typeof s === 'string' && s.trim() !== ''));
                if (suggestions.filter(s => typeof s === 'string' && s.trim() !== '').length === 0) { setGeneralUserMessage({ text: 'AI did not provide specific refinements. The description might be clear already or too abstract.', type: 'info' }); }
            } else { setGeneralUserMessage({ text: 'No specific refinements suggested by AI at this time. Your description might be quite clear!', type: 'info' }); setDescriptionAISuggestions([]); }
        } catch (error) { console.error("Error fetching AI description suggestions:", error); setGeneralUserMessage({ text: error.message || 'An unexpected error occurred while fetching suggestions.', type: 'error' }); setDescriptionAISuggestions([]);
        } finally { setIsDescriptionAISuggesting(false); }
    };
    const fetchMotivationalQuote = async () => { /* ... */ };
    const addTodoAndEdit = () => { /* ... */ };
    const toggleComplete = (id) => { /* ... */ };
    const deleteTodo = (id) => { /* ... */ };
    const startEditTodo = (todo) => { /* ... */ };
    const saveEditTodo = () => { /* ... */ };
    const cancelEditTodo = () => { /* ... */ };
    const handleEditInputChange = (e) => { /* ... */ };
    const filteredTodos = todos.filter(/* ... */).filter(/* ... */).filter(/* ... */); // Assume full logic is here
    const {totalTodos, completedTodosCount, activeTodosCount, completionPercentage, priorityCounts, averageCompletionTime} = useMemo(() => { /* ... */ }, [todos]); // Assume full logic
    const downloadFile = ({ data, fileName, fileType }) => { /* ... */ };
    const exportToJson = () => { /* ... */ };
    const convertToCsv = (data) => { /* ... */ };
    const exportToCsv = () => { /* ... */ };

    // Ensure original const definitions are used and no re-assignments below

    const inputSelectCommonClasses = "border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400";
    const buttonPrimaryClasses = "bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900";
    const buttonSecondaryClasses = "bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1.5 px-4 rounded text-sm border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-900";
    const buttonSubtleClasses = "text-xs p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400";

    return (
        <div className={`flex h-screen ${theme} antialiased`}>
            <Sidebar isSidebarOpen={isSidebarOpen} theme={theme} toggleTheme={toggleTheme} navItems={navItems} currentView={currentView} setCurrentView={setCurrentView} />
            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
                <div className="p-2 md:p-3 border-b dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800/50 backdrop-blur-sm">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </div>
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {generalUserMessage.text && ( <div className={`my-3 p-3 rounded-md shadow-sm border text-sm flex justify-between items-center ${generalUserMessage.type === 'error' ? 'bg-red-50 border-red-300 text-red-800 dark:bg-red-800/30 dark:border-red-700/50 dark:text-red-200' : ''} ${generalUserMessage.type === 'success' ? 'bg-green-50 border-green-300 text-green-800 dark:bg-green-800/30 dark:border-green-700/50 dark:text-green-200' : ''} ${generalUserMessage.type === 'info' ? 'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-800/30 dark:border-blue-700/50 dark:text-blue-200' : ''} `}> <span>{generalUserMessage.text}</span> <button onClick={() => setGeneralUserMessage({ text: '', type: '' })} className={`ml-3 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ${generalUserMessage.type === 'error' ? 'text-red-600 dark:text-red-300' : ''} ${generalUserMessage.type === 'success' ? 'text-green-600 dark:text-green-300' : ''} ${generalUserMessage.type === 'info' ? 'text-blue-600 dark:text-blue-300' : ''}`} title="Dismiss message"> <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg> </button> </div> )}
                    {notificationPermission === 'default' && ( <div className="my-4 p-3 bg-yellow-50 dark:bg-yellow-800/60 rounded-md text-center shadow-sm border border-yellow-300 dark:border-yellow-700"> <p className="mb-1.5 text-yellow-800 dark:text-yellow-200 text-sm">Enable browser notifications for due date reminders?</p> <button onClick={requestNotificationPermission} className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-3 rounded text-xs shadow-sm"> Enable Notifications </button> </div> )}
                    {notificationPermission === 'denied' && ( <div className="my-4 p-3 bg-red-50 dark:bg-red-800/60 rounded-md text-center text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700 text-sm shadow-sm"> <p>Notifications currently disabled. Enable in browser settings for reminders.</p> </div> )}
                    {notificationPermission === 'granted' && ( <div className="my-4 p-3 bg-green-50 dark:bg-green-800/60 rounded-md text-center text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700 text-sm shadow-sm"> <p>Due date reminders are active!</p> </div> )}
                    <div className="space-y-10 max-w-3xl mx-auto">
                        {currentView === 'all_tasks' && <AllTasksView todos={todos} newTodoTitle={newTodoTitle} setNewTodoTitle={setNewTodoTitle} addTodoAndEdit={addTodoAndEdit} filterStatus={filterStatus} setFilterStatus={setFilterStatus} filterPriority={filterPriority} setFilterPriority={setFilterPriority} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filteredTodos={filteredTodos} toggleComplete={toggleComplete} startEditTodo={startEditTodo} deleteTodo={deleteTodo} theme={theme} inputSelectCommonClasses={inputSelectCommonClasses} buttonPrimaryClasses={buttonPrimaryClasses} buttonSubtleClasses={buttonSubtleClasses} />}
                        {currentView === 'analytics_dashboard' && <AnalyticsDashboardView totalTodos={totalTodos} completedTodosCount={completedTodosCount} activeTodosCount={activeTodosCount} completionPercentage={completionPercentage} priorityCounts={priorityCounts} averageCompletionTime={averageCompletionTime} />}
                        {currentView === 'export_todos' && <ExportTodosView todos={todos} exportToJson={exportToJson} exportToCsv={exportToCsv} buttonSecondaryClasses={buttonSecondaryClasses} />}
                        {currentView === 'settings' && <SettingsView theme={theme} toggleTheme={toggleTheme} notificationPermission={notificationPermission} requestNotificationPermission={requestNotificationPermission} areRemindersGloballyEnabled={areRemindersGloballyEnabled} setAreRemindersGloballyEnabled={setAreRemindersGloballyEnabled} loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} buttonSecondaryClasses={buttonSecondaryClasses} />}
                    </div>
                </main>
            </div>
            <EditTodoModal editingTodo={editingTodo} handleEditInputChange={handleEditInputChange} saveEditTodo={saveEditTodo} cancelEditTodo={cancelEditTodo} theme={theme} handleDescriptionAISuggest={handleDescriptionAISuggest} descriptionAISuggestions={descriptionAISuggestions} setDescriptionAISuggestions={setDescriptionAISuggestions} isDescriptionAISuggesting={isDescriptionAISuggesting} fetchSuggestionsForEdit={fetchSuggestionsForEdit} titleSuggestion={titleSuggestion} suggestedPriority={suggestedPriority} setTitleSuggestion={setTitleSuggestion} setSuggestedPriority={setSuggestedPriority} suggestionLoading={suggestionLoading} inputSelectCommonClasses={inputSelectCommonClasses} buttonPrimaryClasses={buttonPrimaryClasses} buttonSecondaryClasses={buttonSecondaryClasses} buttonSubtleClasses={buttonSubtleClasses} />
            {showQuote && motivationalQuote && ( <div key={motivationalQuote} className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-green-600 text-white p-4 rounded-lg shadow-xl z-50 animate-fadeInOut max-w-xs text-sm">  <p className="font-medium">Great job!</p> <p className="text-xs mt-1">{motivationalQuote}</p>  </div> )}
        </div>
    );
};

export default App;
