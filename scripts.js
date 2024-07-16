document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');

    addTaskBtn.addEventListener('click', addTask);
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    taskList.addEventListener('click', toggleTaskCompletion);

    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            const li = document.createElement('li');
            li.textContent = taskText;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                taskList.removeChild(li);
            });
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
            taskInput.value = '';
        }
    }

    function toggleTaskCompletion(e) {
        if (e.target.tagName === 'LI') {
            e.target.classList.toggle('completed');
        }
    }

    function clearCompletedTasks() {
        const completedTasks = document.querySelectorAll('li.completed');
        completedTasks.forEach(task => {
            taskList.removeChild(task);
        });
    }
});