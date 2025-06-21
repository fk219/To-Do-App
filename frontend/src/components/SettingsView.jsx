import React from 'react';

const SettingsView = ({
    theme,
    toggleTheme,
    notificationPermission,
    requestNotificationPermission,
    areRemindersGloballyEnabled,
    setAreRemindersGloballyEnabled,
    loggedInUser,
    setLoggedInUser,
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

export default SettingsView;
