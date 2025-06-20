// Main App Component
const App = () => {
    // Base states
    const [todos, setTodos] = React.useState([
        { id: 1, title: 'Learn React', description: 'Study React fundamentals', dueDate: '2024-12-01', priority: 'High', completed: false, createdAt: new Date().toISOString() },
        { id: 2, title: 'Build Todo App', description: 'Complete the frontend and backend', dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString().split('T')[0], priority: 'Medium', completed: false, createdAt: new Date().toISOString() },
        { id: 3, title: 'Test App', description: 'Write unit tests', dueDate: '2024-12-20', priority: 'High', completed: true, createdAt: new Date(Date.now() - 3*24*60*60*1000).toISOString() },
    ]);
    const [newTodoTitle, setNewTodoTitle] = React.useState('');
    const [editingTodo, setEditingTodo] = React.useState(null);
    const [filterStatus, setFilterStatus] = React.useState('All');
    const [filterPriority, setFilterPriority] = React.useState('All');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    // Theme state with localStorage persistence
    const [theme, setTheme] = React.useState(() => localStorage.getItem('appTheme') || 'light');

    // AI General Suggestions (Title, Overall Priority) in Edit Modal
    const [titleSuggestion, setTitleSuggestion] = React.useState('');
    const [descriptionSuggestion, setDescriptionSuggestion] = React.useState('');
    const [suggestedPriority, setSuggestedPriority] = React.useState('');
    const [suggestionLoading, setSuggestionLoading] = React.useState(false);

    // AI Description Assistance in Edit Modal
    const [descriptionAISuggestions, setDescriptionAISuggestions] = React.useState([]);
    const [isDescriptionAISuggesting, setIsDescriptionAISuggesting] = React.useState(false);

    // UI Feedback States
    const [motivationalQuote, setMotivationalQuote] = React.useState('');
    const [showQuote, setShowQuote] = React.useState(false);
    const [notificationPermission, setNotificationPermission] = React.useState('default');
    const [notifiedTodoIds, setNotifiedTodoIds] = React.useState(new Set());
    const [generalUserMessage, setGeneralUserMessage] = React.useState({ text: '', type: '' });

    // View Management State
    const [currentView, setCurrentView] = React.useState('all_tasks');

    // Settings States with localStorage persistence
    const [areRemindersGloballyEnabled, setAreRemindersGloballyEnabled] = React.useState(() => {
        const saved = localStorage.getItem('areRemindersGloballyEnabled');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [loggedInUser, setLoggedInUser] = React.useState(null);


    // Placeholder SVG Icons (defined once in App)
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

    React.useEffect(() => {
        document.body.className = theme;
        localStorage.setItem('appTheme', theme);

        if ('Notification' in window) { setNotificationPermission(Notification.permission); }
        else { console.warn('Browser does not support desktop notification.'); setNotificationPermission('denied'); }

        const mockToken = localStorage.getItem('token');
        const mockUsername = localStorage.getItem('username');
        if (mockToken && mockUsername) {
            setLoggedInUser({ username: mockUsername });
        } else if (mockToken) {
            // setLoggedInUser({ username: 'user_from_token_placeholder' });
        }
    }, [theme]);

    React.useEffect(() => {
        localStorage.setItem('areRemindersGloballyEnabled', JSON.stringify(areRemindersGloballyEnabled));
    }, [areRemindersGloballyEnabled]);


    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) { alert('This browser does not support desktop notifications.'); setNotificationPermission('denied'); return; }
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission === 'granted') new Notification('Notifications Enabled!', { body: 'Due date reminders are active.' , icon: 'favicon.ico' });
        } else if (Notification.permission === 'denied') alert('Notification permission previously denied. Please enable it in browser settings.');
        else if (Notification.permission === 'granted') alert('Notifications are already enabled!');
    };
    React.useEffect(() => {
        if (notificationPermission === 'granted' && areRemindersGloballyEnabled) {
            const intervalId = setInterval(() => {
                const now = new Date();
                todos.forEach(todo => {
                    if (todo.completed || !todo.dueDate || notifiedTodoIds.has(todo.id)) return;
                    const dueDateParts = todo.dueDate.split('-');
                    const dueDate = new Date(parseInt(dueDateParts[0]), parseInt(dueDateParts[1]) - 1, parseInt(dueDateParts[2]), 23, 59, 59);
                    if (dueDate.getTime() - now.getTime() > 0 && dueDate.getTime() - now.getTime() <= 24 * 60 * 60 * 1000) {
                        new Notification('Upcoming Todo Reminder!', { body: `Task "${todo.title}" is due on ${dueDate.toLocaleDateString()}.`, icon: 'favicon.ico', tag: `todo-${todo.id}` });
                        setNotifiedTodoIds(prev => new Set(prev).add(todo.id));
                    }
                });
            }, 30 * 60 * 1000);
            return () => clearInterval(intervalId);
        }
    }, [todos, notificationPermission, notifiedTodoIds, areRemindersGloballyEnabled]);
    const toggleTheme = () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');

    const fetchSuggestionsForEdit = async (currentTitle, currentDescription, currentPriorityValue) => { /* ... (unchanged) ... */
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
    const handleDescriptionAISuggest = async (currentDescription) => { /* ... (unchanged) ... */
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
            const response = await fetch('/api/ai/refine-description', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token, }, body: JSON.stringify({ description: currentDescription }), });
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
    const fetchMotivationalQuote = async () => { /* ... (unchanged) ... */
        setMotivationalQuote(''); setShowQuote(false); await new Promise(resolve => setTimeout(resolve, 100));
        const quotes = ["The secret of getting ahead is getting started!", "Well done is better than well said."];
        setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]); setShowQuote(true);
        if (window.quoteTimeout) clearTimeout(window.quoteTimeout);
        window.quoteTimeout = setTimeout(() => setShowQuote(false), 5000);
    };
    const addTodoAndEdit = () => { /* ... (unchanged) ... */
        if (!newTodoTitle.trim()) return;
        const newId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) + 1 : 1;
        const newTodo = { id: newId, title: newTodoTitle.trim(), description: '', dueDate: '', priority: 'Medium', completed: false, createdAt: new Date().toISOString() };
        setTodos(prevTodos => [newTodo, ...prevTodos]);
        setNewTodoTitle('');
        startEditTodo(newTodo);
    };
    const toggleComplete = (id) => { /* ... (unchanged) ... */
        let todoWasJustCompleted = false;
        setTodos(prevTodos => prevTodos.map(todo => {
            if (todo.id === id) {
                if (!todo.completed) { todoWasJustCompleted = true; setNotifiedTodoIds(prevIds => new Set(prevIds).add(id)); }
                else { setNotifiedTodoIds(prevIds => { const newIds = new Set(prevIds); newIds.delete(id); return newIds; }); }
                return { ...todo, completed: !todo.completed };
            } return todo;
        }));
        if (todoWasJustCompleted) fetchMotivationalQuote();
    };
    const deleteTodo = (id) => { /* ... (unchanged) ... */
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
        setNotifiedTodoIds(prevIds => { const newIds = new Set(prevIds); newIds.delete(id); return newIds; });
    };
    const startEditTodo = (todo) => { /* ... (unchanged) ... */
        setEditingTodo({ ...todo });
        setTitleSuggestion(''); setDescriptionSuggestion(''); setSuggestedPriority('');
        setDescriptionAISuggestions([]); setIsDescriptionAISuggesting(false);
        setGeneralUserMessage({ text: '', type: '' });
    };
    const saveEditTodo = () => { /* ... (unchanged) ... */
        if (!editingTodo || !editingTodo.title.trim()) return;
        setTodos(prevTodos => prevTodos.map(todo => todo.id === editingTodo.id ? editingTodo : todo));
        setEditingTodo(null);
        setDescriptionAISuggestions([]); setIsDescriptionAISuggesting(false); setGeneralUserMessage({ text: '', type: '' });
    };
    const cancelEditTodo = () => { /* ... (unchanged) ... */
        setEditingTodo(null);
        setDescriptionAISuggestions([]); setIsDescriptionAISuggesting(false); setGeneralUserMessage({ text: '', type: '' });
    };
    const handleEditInputChange = (e) => { /* ... (unchanged) ... */ const { name, value } = e.target; setEditingTodo(prev => ({ ...prev, [name]: value })); };
    const filteredTodos = todos.filter(todo => filterStatus === 'All' || (filterStatus === 'Active' && !todo.completed) || (filterStatus === 'Completed' && todo.completed)) .filter(todo => filterPriority === 'All' || todo.priority === filterPriority) .filter(todo => { if (!searchTerm.trim()) return true; const lowerSearchTerm = searchTerm.toLowerCase(); return todo.title.toLowerCase().includes(lowerSearchTerm) || (todo.description && todo.description.toLowerCase().includes(lowerSearchTerm)); });
    const {totalTodos, completedTodosCount, activeTodosCount, completionPercentage, priorityCounts, averageCompletionTime} = React.useMemo(() => { /* ... (unchanged) ... */
        const total = todos.length;
        const completed = todos.filter(todo => todo.completed).length;
        return {
            totalTodos: total,
            completedTodosCount: completed,
            activeTodosCount: total - completed,
            completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            priorityCounts: todos.reduce((acc, todo) => { acc[todo.priority] = (acc[todo.priority] || 0) + 1; return acc; }, { Low: 0, Medium: 0, High: 0 }),
            averageCompletionTime: "N/A"
        };
    }, [todos]);
    const downloadFile = ({ data, fileName, fileType }) => { /* ... (unchanged) ... */ const blob = new Blob([data], { type: fileType }); const a = document.createElement('a'); a.download = fileName; a.href = window.URL.createObjectURL(blob); const clickEvt = new MouseEvent('click', { view: window, bubbles: true, cancelable: true }); a.dispatchEvent(clickEvt); a.remove(); window.URL.revokeObjectURL(a.href); };
    const exportToJson = () => { /* ... (unchanged) ... */ if (todos.length === 0) { alert("No todos to export."); return; } const dataToExport = todos; const jsonData = JSON.stringify(dataToExport, null, 2); downloadFile({ data: jsonData, fileName: 'todos.json', fileType: 'application/json' }); };
    const convertToCsv = (todosArray) => { /* ... (unchanged) ... */ if (todosArray.length === 0) return ''; const headers = ['id', 'title', 'description', 'dueDate', 'priority', 'completed', 'createdAt']; const csvRows = [headers.join(',')]; todosArray.forEach(todo => { const values = headers.map(header => { let value = todo[header]; if (value === null || value === undefined) value = ''; else { value = String(value).replace(/\r\n|\r|\n/g, ' '); if (value.includes(',') || value.includes('"')) value = `"${value.replace(/"/g, '""')}"`; } return value; }); csvRows.push(values.join(',')); }); return csvRows.join('\n'); };
    const exportToCsv = () => { /* ... (unchanged) ... */ if (todos.length === 0) { alert("No todos to export."); return; } const dataToExport = todos; const csvData = convertToCsv(dataToExport); downloadFile({ data: csvData, fileName: 'todos.csv', fileType: 'text/csv;charset=utf-8;' }); };

    const inputSelectCommonClasses = "border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400";
    const buttonPrimaryClasses = "bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900";
    const buttonSecondaryClasses = "bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1.5 px-4 rounded text-sm border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-900";
    const buttonSubtleClasses = "text-xs p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400";

    // View Components
    const AllTasksView = ({ todos,newTodoTitle,setNewTodoTitle,addTodoAndEdit,filterStatus,setFilterStatus,filterPriority,setFilterPriority,searchTerm,setSearchTerm,filteredTodos,toggleComplete,startEditTodo,deleteTodo,theme,inputSelectCommonClasses,buttonPrimaryClasses,buttonSubtleClasses}) => ( /* ... JSX unchanged ... */ <> <div className="mb-8"> <h2 className="text-xl md:text-2xl font-semibold mb-3 dark:text-gray-100">Organize & Plan</h2> <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end"> <div> <label htmlFor="filterStatus" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label> <select id="filterStatus" className={inputSelectCommonClasses + " w-full"} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} > <option value="All">All</option> <option value="Active">Active</option> <option value="Completed">Completed</option> </select> </div> <div> <label htmlFor="filterPriority" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Priority</label> <select id="filterPriority" className={inputSelectCommonClasses + " w-full"} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} > <option value="All">All</option> <option value="Low">Low</option> <option value="Medium">Medium</option> <option value="High">High</option> </select> </div> <div className="sm:col-span-2">  <label htmlFor="search" className="sr-only">Search</label> <input type="text" id="search" className={inputSelectCommonClasses + " w-full"} placeholder="Search todos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /> </div> </div> </div> <div className="mb-8"> <div className="flex gap-2 items-center"> <input type="text" className={inputSelectCommonClasses + " flex-grow"} placeholder="Add a new task... (then press Enter)" value={newTodoTitle} onChange={(e) => setNewTodoTitle(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && newTodoTitle.trim()) addTodoAndEdit(); }} /> <button onClick={addTodoAndEdit} className={buttonPrimaryClasses + " px-3"} disabled={!newTodoTitle.trim()} title="Add new task" > <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg> </button> </div> </div> <div className="mb-8"> <h2 className="text-xl md:text-2xl font-semibold mb-4 dark:text-gray-100">Your Todos</h2> {filteredTodos.length === 0 && <p className="text-gray-500 dark:text-gray-400 py-3 px-1.5 text-sm">No todos yet. Add one above to get started!</p>} <div className="space-y-1"> {filteredTodos.map(todo => { const priorityColors = { Low: theme === 'light' ? 'bg-green-100 text-green-600' : 'bg-green-500/20 text-green-400', Medium: theme === 'light' ? 'bg-yellow-100 text-yellow-600' : 'bg-yellow-500/20 text-yellow-400', High: theme === 'light' ? 'bg-red-100 text-red-600' : 'bg-red-500/20 text-red-400', }; return ( <div key={todo.id} className={`todo-block group flex items-start py-2 pr-3 pl-1.5 mb-0.5 rounded hover:bg-gray-100 dark:hover:bg-white/5 transition-colors duration-100 ${todo.completed ? 'text-gray-500 dark:text-gray-500 opacity-60' : 'text-gray-800 dark:text-gray-100'}`}> <div className="pt-0.5 px-1.5"> <input type="checkbox" checked={todo.completed} onChange={() => toggleComplete(todo.id)} className="h-4 w-4 text-blue-600 border-gray-400 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 bg-transparent dark:bg-transparent cursor-pointer"/> </div> <div className="flex-grow min-w-0 cursor-pointer" onClick={(e) => { if (e.target.closest('button')) return; startEditTodo(todo); }}> <p className={`text-sm font-medium truncate ${todo.completed ? 'line-through' : ''}`}>{todo.title}</p> {todo.description && (<p className={`text-xs mt-0.5 text-gray-600 dark:text-gray-400 line-clamp-2 ${todo.completed ? 'line-through opacity-70' : 'opacity-70'}`}>{todo.description}</p>)} <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 text-xs"> {todo.dueDate && (<span className={`flex items-center ${todo.completed ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}><svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>{new Date(todo.dueDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>)} {todo.priority && (<span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[todo.priority] || priorityColors.Medium}`}>{todo.priority}</span> )} </div> </div> <div className="flex-shrink-0 flex items-center space-x-0.5 pl-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150"> <button title="Edit" onClick={(e) => { e.stopPropagation(); startEditTodo(todo); }} className={buttonSubtleClasses + " hover:text-blue-600 dark:hover:text-blue-400"}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button> <button title="Delete" onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }} className={buttonSubtleClasses + " hover:text-red-600 dark:hover:text-red-400"}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button> </div> </div> )})} </div> </div></> );
    const AnalyticsDashboardView = ({totalTodos, completedTodosCount, activeTodosCount, completionPercentage, priorityCounts, averageCompletionTime}) => ( /* ... JSX unchanged ... */ <div className="mb-6"> <h2 className="text-xl md:text-2xl font-semibold mb-3 dark:text-gray-100">Productivity Dashboard</h2> <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"> <div className="p-3 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700/30"> <h3 className="font-medium text-xs text-gray-500 dark:text-gray-400">Total Todos</h3> <p className="text-xl font-semibold">{totalTodos}</p> </div> <div className="p-3 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700/30"> <h3 className="font-medium text-xs text-green-600 dark:text-green-400">Completed</h3> <p className="text-xl font-semibold">{completedTodosCount}</p> </div> <div className="p-3 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700/30"> <h3 className="font-medium text-xs text-yellow-600 dark:text-yellow-400">Active</h3> <p className="text-xl font-semibold">{activeTodosCount}</p> </div> <div className="p-3 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700/30"> <h3 className="font-medium text-xs text-indigo-600 dark:text-indigo-400">Completion Rate</h3> <p className="text-xl font-semibold">{completionPercentage}%</p> </div> <div className="p-3 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700/30 sm:col-span-2"> <h3 className="font-medium text-xs text-gray-500 dark:text-gray-400 mb-1">Todos by Priority</h3> <ul className="list-none pl-0 text-xs space-y-0.5"> <li>Low: <span className="font-semibold">{priorityCounts.Low || 0}</span></li> <li>Medium: <span className="font-semibold">{priorityCounts.Medium || 0}</span></li> <li>High: <span className="font-semibold">{priorityCounts.High || 0}</span></li> </ul> </div> <div className="p-3 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700/30"> <h3 className="font-medium text-xs text-gray-500 dark:text-gray-400">Avg. Completion Time</h3> <p className="text-sm">{averageCompletionTime}</p> </div> </div> </div> );
    const ExportTodosView = ({todos, exportToJson, exportToCsv, buttonSecondaryClasses}) => ( /* ... JSX unchanged ... */ <div className="mb-6"> <h2 className="text-xl md:text-2xl font-semibold mb-3 dark:text-gray-100">Export Your Todos</h2> <div className="flex flex-wrap gap-3"> <button onClick={exportToJson} className={buttonSecondaryClasses} disabled={todos.length === 0} > Export All as JSON </button> <button onClick={exportToCsv} className={buttonSecondaryClasses} disabled={todos.length === 0} > Export All as CSV </button> </div> {todos.length === 0 && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Add some todos to enable export options.</p>} </div> );

    const SettingsView = ({
        theme, toggleTheme, notificationPermission, requestNotificationPermission,
        areRemindersGloballyEnabled, setAreRemindersGloballyEnabled, loggedInUser, setLoggedInUser, // Added setLoggedInUser
        buttonSecondaryClasses
    }) => {
        const ToggleSwitch = ({ id, checked, onChange, label, disabled = false }) => (
            <label htmlFor={id} className={`flex items-center justify-between cursor-pointer py-2.5 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <span className="text-sm">{label}</span>
                <div className="relative">
                    <input type="checkbox" id={id} className="sr-only" checked={checked} onChange={onChange} disabled={disabled} />
                    <div className={`block w-10 h-6 rounded-full ${checked && !disabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked && !disabled ? 'transform translate-x-full' : ''}`}></div>
                </div>
            </label>
        );
        return (
            <div className="space-y-8">
                <div><h2 className="text-2xl md:text-3xl font-semibold mb-6 dark:text-gray-100">Settings</h2></div>
                <section><h3 className="text-lg font-medium mb-3 border-b pb-2 dark:border-gray-700">Appearance</h3>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Theme</p>
                        <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-700/30 rounded-lg w-min">
                            <button onClick={() => theme !== 'light' && toggleTheme()} className={`px-3 py-1.5 rounded-md text-sm font-medium ${theme === 'light' ? 'bg-white dark:bg-gray-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600/50'}`}>Light</button>
                            <button onClick={() => theme !== 'dark' && toggleTheme()} className={`px-3 py-1.5 rounded-md text-sm font-medium ${theme === 'dark' ? 'bg-gray-800 text-white dark:bg-gray-600 shadow' : 'hover:bg-gray-200 dark:hover:bg-gray-600/50'}`}>Dark</button>
                        </div>
                    </div>
                </section>
                <section><h3 className="text-lg font-medium mb-3 border-b pb-2 dark:border-gray-700">Notifications</h3>
                    <div className="text-sm space-y-3">
                        <div>Browser Notification Permission: <span className={`font-semibold ${notificationPermission === 'granted' ? 'text-green-600 dark:text-green-400' : (notificationPermission === 'denied' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400')}`}>{notificationPermission.charAt(0).toUpperCase() + notificationPermission.slice(1)}</span></div>
                        {notificationPermission === 'default' && (<button onClick={requestNotificationPermission} className={buttonSecondaryClasses + " text-xs py-1 px-2.5"}>Request Permission</button>)}
                        {notificationPermission === 'denied' && (<p className="text-xs text-gray-500 dark:text-gray-400">To enable notifications, please adjust your browser's site settings.</p>)}
                        {notificationPermission === 'granted' && (<ToggleSwitch id="globalReminders" checked={areRemindersGloballyEnabled} onChange={() => setAreRemindersGloballyEnabled(prev => !prev)} label="Enable Due Date Reminders"/>)}
                    </div>
                </section>
                <section><h3 className="text-lg font-medium mb-3 border-b pb-2 dark:border-gray-700">Account</h3>
                    <div className="text-sm space-y-2">
                        <p>Logged in as: <span className="font-semibold">{loggedInUser?.username || 'Guest'}</span></p>
                        {loggedInUser ?
                            (<button className={buttonSecondaryClasses + " text-xs py-1 px-2.5"} onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('username'); setLoggedInUser(null); alert("Logged out (placeholder)."); }}>Log Out</button>) :
                            (<p className="text-xs text-gray-500 dark:text-gray-400">Login/Signup features to be fully integrated.</p>)
                        }
                    </div>
                </section>
                <section><h3 className="text-lg font-medium mb-3 border-b pb-2 dark:border-gray-700">AI Features</h3>
                    <div className="space-y-3 text-sm">
                        <ToggleSwitch id="aiWritingAssist" checked={true} onChange={() => {}} label="AI Writing Assistance (Title/Description)" disabled={true}/>
                        <ToggleSwitch id="aiTaskBreakdown" checked={false} onChange={() => {}} label="AI Task Breakdown (Future)" disabled={true}/>
                        <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">AI features depend on backend API key configuration. Toggles are currently placeholders.</p>
                    </div>
                </section>
            </div>
        );
    };

    return (
        <div className={`flex h-screen ${theme} antialiased`}>
            {/* ... Sidebar JSX ... */}
            <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-60 md:w-64' : 'w-0'} overflow-hidden bg-gray-50 dark:bg-gray-800 border-r dark:border-gray-700 flex-shrink-0 flex flex-col shadow-lg`}> <div className="p-4 border-b dark:border-gray-700 flex items-center space-x-2"> <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg> <h1 className="text-lg font-semibold dark:text-white">AI Todo</h1> </div> <nav className="flex-grow p-2 space-y-1"> {navItems.map(item => ( <button key={item.id} onClick={() => setCurrentView(item.id)} title={isSidebarOpen ? '' : item.label} className={`flex items-center w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ${item.id === currentView ? 'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/60'} ${isSidebarOpen ? '' : 'justify-center'}`} > <span className={`flex-shrink-0 ${isSidebarOpen ? 'mr-3' : 'mr-0'}`}>{item.icon}</span> {isSidebarOpen && <span className="truncate">{item.label}</span>} </button> ))} </nav> <div className="p-3 border-t dark:border-gray-700"> <button onClick={toggleTheme} className="w-full text-sm p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-start space-x-2 text-gray-600 dark:text-gray-300"> {theme === 'light' ? ( <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg> ) : ( <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m8.66-8.66l-.707.707M4.04 4.04l-.707.707M21 12h-1M4 12H3m15.364 4.364l-.707-.707M5.636 5.636l-.707-.707"></path></svg> )} <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span> </button> </div> </div>
            <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
                {/* ... Top bar JSX ... */}
                <div className="p-2 md:p-3 border-b dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800/50 backdrop-blur-sm"> <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"> <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg> </button> </div>
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {/* ... General User Message & Notification Banners JSX ... */}
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
            {/* Edit Modal JSX (unchanged) */}
            {editingTodo && ( <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 z-40 backdrop-blur-sm"> <div className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-lg shadow-xl w-full max-w-lg space-y-3 border dark:border-gray-700"> <h2 className="text-xl font-semibold">Edit Todo Details</h2> <input type="text" name="title" className={inputSelectCommonClasses + " w-full"} placeholder="Title" value={editingTodo.title} onChange={handleEditInputChange} /> <div> <textarea name="description" className={inputSelectCommonClasses + " w-full h-24 resize-none"} placeholder="Description" value={editingTodo.description} onChange={handleEditInputChange}></textarea> <button onClick={() => handleDescriptionAISuggest(editingTodo.description)} className={buttonSecondaryClasses + " text-xs mt-1.5 w-full py-1"} disabled={isDescriptionAISuggesting} > {isDescriptionAISuggesting ? '🤖 Thinking...' : '✨ AI Assist Description'} </button> </div> {isDescriptionAISuggesting && <p className="text-xs italic text-gray-500 dark:text-gray-400 text-center py-2">Loading description suggestions...</p>} {!isDescriptionAISuggesting && descriptionAISuggestions.length > 0 && ( <div className="space-y-1.5 p-2.5 my-1.5 border rounded-md border-gray-200 dark:border-gray-700 max-h-36 overflow-y-auto bg-gray-50 dark:bg-gray-700/30"> <div className="flex justify-between items-center mb-1"> <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Description Suggestions:</p> <button onClick={() => setDescriptionAISuggestions([])} className={buttonSubtleClasses + " text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"} title="Dismiss suggestions">Dismiss</button> </div> {descriptionAISuggestions.map((suggestion, index) => ( <div key={index} className="p-2 bg-white dark:bg-gray-700/60 rounded text-xs shadow-sm border dark:border-gray-600/50"> <p className="mb-1 text-gray-600 dark:text-gray-200 whitespace-pre-wrap">{suggestion}</p> <button onClick={() => { setEditingTodo(prev => ({...prev, description: suggestion })); setDescriptionAISuggestions([]); }} className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-0.5 px-2 rounded">Use this</button> </div> ))} </div> )} <div className="flex gap-3"> <input type="date" name="dueDate" className={inputSelectCommonClasses + " w-full"} value={editingTodo.dueDate} onChange={handleEditInputChange} /> <select name="priority" className={inputSelectCommonClasses + " w-full"} value={editingTodo.priority} onChange={handleEditInputChange} > <option value="Low">Low</option> <option value="Medium">Medium</option> <option value="High">High</option> </select> </div> <div className="pt-2 space-y-2 border-t dark:border-gray-700/50 mt-2"> <p className="text-xs font-medium text-gray-500 dark:text-gray-400 pt-1">Overall AI Suggestions (Title/Priority):</p> <button onClick={() => fetchSuggestionsForEdit(editingTodo.title, editingTodo.description, editingTodo.priority)} className={buttonSecondaryClasses + " text-xs w-full py-1.5"} disabled={suggestionLoading || (!editingTodo.title?.trim() && !editingTodo.description?.trim())} >  {suggestionLoading ? '🧠 Thinking...' : '✨ Get Title/Priority Suggestions'} </button> {suggestionLoading && !isDescriptionAISuggesting && <p className="text-xs italic text-gray-500 dark:text-gray-400 text-center">Loading suggestions...</p>} {titleSuggestion && <div className="my-1.5 p-2.5 bg-purple-50 dark:bg-purple-800/40 rounded border border-purple-200 dark:border-purple-700/50 text-xs"> <p className="font-medium text-purple-700 dark:text-purple-300 mb-0.5">Suggested Title:</p> <p className="mb-1 text-gray-700 dark:text-gray-200">{titleSuggestion}</p> <button onClick={() => { setEditingTodo(prev => ({...prev, title: titleSuggestion.replace(' (AI)', '') })); setTitleSuggestion(''); }} className="text-xs bg-purple-500 hover:bg-purple-600 text-white py-0.5 px-2 rounded" > Use </button> </div>} {suggestedPriority && <div className="my-1.5 p-2.5 bg-orange-50 dark:bg-orange-800/40 rounded border border-orange-200 dark:border-orange-700/50 text-xs"> <p className="font-medium text-orange-700 dark:text-orange-300 mb-0.5">Suggested Priority:</p> <p className="mb-1 text-gray-700 dark:text-gray-200"> AI suggests: <span className="font-semibold">{suggestedPriority}</span> </p> <button onClick={() => { setEditingTodo(prev => ({...prev, priority: suggestedPriority })); setSuggestedPriority(''); }} className="text-xs bg-orange-500 hover:bg-orange-600 text-white py-0.5 px-2 rounded" > Set to {suggestedPriority} </button> </div>} </div> <div className="flex gap-3 pt-3 justify-end border-t dark:border-gray-700/50 mt-3">  <button onClick={cancelEditTodo} className={buttonSecondaryClasses}>Cancel</button> <button onClick={saveEditTodo} className={buttonPrimaryClasses}>Save Changes</button> </div> </div> </div> )}
            {/* Motivational Quote (JSX unchanged) */}
            {showQuote && motivationalQuote && ( <div key={motivationalQuote} className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-green-600 text-white p-4 rounded-lg shadow-xl z-50 animate-fadeInOut max-w-xs text-sm">  <p className="font-medium">Great job!</p> <p className="text-xs mt-1">{motivationalQuote}</p>  </div> )}
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
