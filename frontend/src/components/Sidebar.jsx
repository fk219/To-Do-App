import React from 'react';

const Sidebar = ({
    isSidebarOpen,
    theme,
    toggleTheme,
    navItems,
    currentView,
    setCurrentView
}) => {
    return (
        <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-60 md:w-64' : 'w-0'} overflow-hidden bg-gray-50 dark:bg-gray-800 border-r dark:border-gray-700 flex-shrink-0 flex flex-col shadow-lg`}>
            <div className="p-4 border-b dark:border-gray-700 flex items-center space-x-2">
                {/* Placeholder App Icon - Assuming SVGs are passed within navItems or defined globally/imported if complex */}
                {isSidebarOpen && ( // Only show icon and title if sidebar is open, or adjust styling for collapsed state
                    <>
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                        <h1 className="text-lg font-semibold dark:text-white">AI Todo</h1>
                    </>
                )}
                 {!isSidebarOpen && ( // Show a minimal icon or nothing when collapsed, or a specific collapsed state icon
                    <div className="w-6 h-6 text-blue-600"> {/* Adjust size as needed for collapsed view */}
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                    </div>
                )}
            </div>
            <nav className="flex-grow p-2 space-y-1">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        title={isSidebarOpen ? '' : item.label}
                        className={`flex items-center w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150
                                    ${item.id === currentView
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-200'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/60'}
                                    ${isSidebarOpen ? '' : 'justify-center'}`}
                    >
                        <span className={`flex-shrink-0 ${isSidebarOpen ? 'mr-3' : 'mr-0'}`}>{item.icon}</span>
                        {isSidebarOpen && <span className="truncate">{item.label}</span>}
                    </button>
                ))}
            </nav>
            <div className="p-3 border-t dark:border-gray-700">
                <button
                    onClick={toggleTheme}
                    className="w-full text-sm p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-start space-x-2 text-gray-600 dark:text-gray-300"
                >
                    {isSidebarOpen ? (
                        <>
                            {theme === 'light' ? ( <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg> ) : ( <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m8.66-8.66l-.707.707M4.04 4.04l-.707.707M21 12h-1M4 12H3m15.364 4.364l-.707-.707M5.636 5.636l-.707-.707"></path></svg> )}
                            <span className="truncate">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                        </>
                    ) : (
                        // Only icon when sidebar is closed
                        theme === 'light' ? ( <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg> ) : ( <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m8.66-8.66l-.707.707M4.04 4.04l-.707.707M21 12h-1M4 12H3m15.364 4.364l-.707-.707M5.636 5.636l-.707-.707"></path></svg> )
                    )}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
