import React from 'react';

const EditTodoModal = ({
    editingTodo,
    // setEditingTodo, // Direct prop for updating fields is handleEditInputChange
    handleEditInputChange, // Receives this to update editingTodo in App.jsx
    saveEditTodo,
    cancelEditTodo,
    // theme, // theme prop not explicitly used in this component's JS, but classes might rely on parent theme

    handleDescriptionAISuggest,
    descriptionAISuggestions,
    setDescriptionAISuggestions,
    isDescriptionAISuggesting,

    fetchSuggestionsForEdit, // For general title/priority suggestions
    titleSuggestion,
    // descriptionSuggestion, // General description suggestion is not used here anymore
    suggestedPriority,
    setTitleSuggestion,
    // setDescriptionSuggestion, // Not used here
    setSuggestedPriority,
    suggestionLoading, // Loading state for general suggestions

    // Styling classes
    inputSelectCommonClasses,
    // textareaInputCommonClasses, // Assuming this is part of inputSelectCommonClasses or just use inputSelectCommonClasses
    buttonPrimaryClasses,
    buttonSecondaryClasses,
    buttonSubtleClasses
}) => {
    if (!editingTodo) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center p-4 z-40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-lg shadow-xl w-full max-w-lg space-y-3 border dark:border-gray-700">
                <h2 className="text-xl font-semibold dark:text-gray-100">Edit Todo Details</h2>

                <input
                    type="text"
                    name="title"
                    className={inputSelectCommonClasses + " w-full"}
                    placeholder="Title"
                    value={editingTodo.title}
                    onChange={handleEditInputChange}
                />

                <div>
                    <textarea
                        name="description"
                        className={inputSelectCommonClasses + " w-full h-24 resize-none"}
                        placeholder="Description"
                        value={editingTodo.description}
                        onChange={handleEditInputChange}>
                    </textarea>
                    <button
                        onClick={() => handleDescriptionAISuggest(editingTodo.description)}
                        className={buttonSecondaryClasses + " text-xs mt-1.5 w-full py-1"}
                        disabled={isDescriptionAISuggesting}
                    >
                        {isDescriptionAISuggesting ? '🤖 Thinking...' : '✨ AI Assist Description'}
                    </button>
                </div>

                {isDescriptionAISuggesting && <p className="text-xs italic text-gray-500 dark:text-gray-400 text-center py-2">Loading description suggestions...</p>}
                {!isDescriptionAISuggesting && descriptionAISuggestions.length > 0 && (
                    <div className="space-y-1.5 p-2.5 my-1.5 border rounded-md border-gray-200 dark:border-gray-700 max-h-36 overflow-y-auto bg-gray-50 dark:bg-gray-700/30">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Description Suggestions:</p>
                            <button
                                onClick={() => setDescriptionAISuggestions([])}
                                className={buttonSubtleClasses + " text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}
                                title="Dismiss suggestions"
                            >
                                Dismiss
                            </button>
                        </div>
                        {descriptionAISuggestions.map((suggestion, index) => (
                            <div key={index} className="p-2 bg-white dark:bg-gray-700/60 rounded text-xs shadow-sm border dark:border-gray-600/50">
                                <p className="mb-1 text-gray-600 dark:text-gray-200 whitespace-pre-wrap">{suggestion}</p>
                                <button
                                    onClick={() => {
                                        // Update description in parent's editingTodo state
                                        handleEditInputChange({ target: { name: 'description', value: suggestion } });
                                        setDescriptionAISuggestions([]);
                                    }}
                                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-0.5 px-2 rounded"
                                >
                                    Use this
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-3">
                    <input
                        type="date"
                        name="dueDate"
                        className={inputSelectCommonClasses + " w-full"}
                        value={editingTodo.dueDate}
                        onChange={handleEditInputChange}
                    />
                    <select
                        name="priority"
                        className={inputSelectCommonClasses + " w-full"}
                        value={editingTodo.priority}
                        onChange={handleEditInputChange}
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>

                <div className="pt-2 space-y-2 border-t dark:border-gray-700/50 mt-2">
                     <p className="text-xs font-medium text-gray-500 dark:text-gray-400 pt-1">Overall AI Suggestions (Title/Priority):</p>
                    <button
                        onClick={() => fetchSuggestionsForEdit(editingTodo.title, editingTodo.description, editingTodo.priority)}
                        className={buttonSecondaryClasses + " text-xs w-full py-1.5"}
                        disabled={suggestionLoading || (!editingTodo.title?.trim() && !editingTodo.description?.trim())}
                    >
                        {suggestionLoading ? '🧠 Thinking...' : '✨ Get Title/Priority Suggestions'}
                    </button>
                    {/* Ensure this loading message only shows if not already showing description loading */}
                    {suggestionLoading && !isDescriptionAISuggesting && <p className="text-xs italic text-gray-500 dark:text-gray-400 text-center">Loading suggestions...</p>}

                    {titleSuggestion && <div className="my-1.5 p-2.5 bg-purple-50 dark:bg-purple-800/40 rounded border border-purple-200 dark:border-purple-700/50 text-xs">
                        <p className="font-medium text-purple-700 dark:text-purple-300 mb-0.5">Suggested Title:</p>
                        <p className="mb-1 text-gray-700 dark:text-gray-200">{titleSuggestion}</p>
                        <button
                            onClick={() => {
                                handleEditInputChange({ target: { name: 'title', value: titleSuggestion.replace(' (AI)', '') } });
                                setTitleSuggestion('');
                            }}
                            className="text-xs bg-purple-500 hover:bg-purple-600 text-white py-0.5 px-2 rounded" > Use </button>
                    </div>}
                    {/* General descriptionSuggestion display removed as it's handled by AI Assist Description */}
                    {suggestedPriority && <div className="my-1.5 p-2.5 bg-orange-50 dark:bg-orange-800/40 rounded border border-orange-200 dark:border-orange-700/50 text-xs">
                        <p className="font-medium text-orange-700 dark:text-orange-300 mb-0.5">Suggested Priority:</p>
                        <p className="mb-1 text-gray-700 dark:text-gray-200"> AI suggests: <span className="font-semibold">{suggestedPriority}</span> </p>
                        <button
                            onClick={() => {
                                handleEditInputChange({ target: { name: 'priority', value: suggestedPriority } });
                                setSuggestedPriority('');
                            }}
                            className="text-xs bg-orange-500 hover:bg-orange-600 text-white py-0.5 px-2 rounded" > Set to {suggestedPriority} </button>
                    </div>}
                </div>

                <div className="flex gap-3 pt-3 justify-end border-t dark:border-gray-700/50 mt-3">
                    <button onClick={cancelEditTodo} className={buttonSecondaryClasses}>Cancel</button>
                    <button onClick={saveEditTodo} className={buttonPrimaryClasses}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default EditTodoModal;
