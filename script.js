/**
 * CONSTANTES DO SISTEMA
 */
const STORAGE_KEY = 'tasks';
const TASK_LIST_ID = 'todo-list';
const PROGRESS_ELEMENT_ID = 'tasks-progress';
const FORM_ID = 'create-todo-form';
const SAVE_BUTTON_ID = 'save-task';
const DESCRIPTION_INPUT_ID = 'description';
const DESCRIPTION2_INPUT_ID = 'description2';

/**
 * 1. FUNÇÕES DE MANIPULAÇÃO DO LOCAL STORAGE
 */

function getTasksFromLocalStorage() {
    try {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
        console.error('Erro ao ler do Local Storage:', error);
        return [];
    }
}

function setTasksInLocalStorage(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error('Erro ao salvar no Local Storage:', error);
    }
}

function getNewTaskId() {
    const tasks = getTasksFromLocalStorage();
    const lastId = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) : 0;
    return lastId + 1;
}

/**
 * 2. FUNÇÕES DE MANIPULAÇÃO DA INTERFACE
 */

function updateTasksProgress(tasks) {
    const progressElement = document.getElementById(PROGRESS_ELEMENT_ID) || createProgressElement();
    const doneTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    progressElement.textContent = `${doneTasks}/${totalTasks} concluídas`;
}

function createProgressElement() {
    const footer = document.getElementById('todo-footer');
    if (!footer) return null;

    const newElement = document.createElement('div');
    newElement.id = PROGRESS_ELEMENT_ID;
    footer.appendChild(newElement);
    return newElement;
}

function createTaskListItem(task) {
    const list = document.getElementById(TASK_LIST_ID);
    if (!list) return;

    const listItem = document.createElement('li');
    listItem.id = `task-${task.id}`;
    listItem.dataset.taskId = task.id;
    if (task.completed) {
        listItem.classList.add('completed');
    }

    // Botão de Concluir
    const completeButton = document.createElement('button');
    if (task.completed) {
        completeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="40" width="40" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path fill="#63E6BE" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>';
        completeButton.style.backgroundColor = 'transparent';
        completeButton.style.borderColor = 'transparent';
    } else {
        completeButton.textContent = 'Concluir';
    }
    completeButton.classList.add('complete-btn');
    completeButton.addEventListener('click', () => toggleTaskCompletion(task.id));

    // Descrição da tarefa1
    const taskDescription = document.createElement('span');
    taskDescription.textContent = [task.description].filter(Boolean);
    taskDescription.classList.add('task-description');

    // Descrição da tarefa2
    const taskDescription2 = document.createElement('span');
    taskDescription2.textContent = [task.description2].filter(Boolean);
    taskDescription2.classList.add('task-description2');

    // Data de criação
    const creationDate = document.createElement('span');
    creationDate.textContent = `Criado em: ${formatDate(task.createdAt)}`;
    creationDate.classList.add('task-date');

    // Container de metadados
    const metaContainer = document.createElement('div');
    metaContainer.classList.add('task-meta');
    metaContainer.appendChild(creationDate);


    // Container de ações
    const actionsContainer = document.createElement('div');
    actionsContainer.classList.add('task-actions');
    actionsContainer.appendChild(completeButton);


    listItem.append(taskDescription, taskDescription2, metaContainer, actionsContainer);
    list.appendChild(listItem);
}

/**
 * Formata a data para exibição
 * @param {string|Date} date
 * @returns {string} Data formatada
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * 3. FUNÇÕES DE LÓGICA DE NEGÓCIO
 */

function removeTask(taskId) {
    const tasks = getTasksFromLocalStorage();
    const updatedTasks = tasks.filter(task => task.id !== taskId);

    setTasksInLocalStorage(updatedTasks);
    updateTasksProgress(updatedTasks);

    const taskElement = document.getElementById(`task-${taskId}`);
    if (taskElement) taskElement.remove();
}

function toggleTaskCompletion(taskId) {
    const tasks = getTasksFromLocalStorage();
    const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
            const completed = !task.completed;
            const button = document.querySelector(`#task-${taskId} .complete-btn`);
            if (button) {
                button.innerHTML = completed
                    ? '<i class="fa-solid fa-circle-check" style="color: #63E6BE;"></i>'
                    : 'Concluir';
            }
            return { ...task, completed };
        }
        return task;
    });

    setTasksInLocalStorage(updatedTasks);
    renderTaskList(updatedTasks);
    updateTasksProgress(updatedTasks);
}

function removeDoneTasks() {
    const tasks = getTasksFromLocalStorage();
    const updatedTasks = tasks.filter(task => !task.completed);

    tasks.forEach(task => {
        if (task.completed) {
            const taskElement = document.getElementById(`task-${task.id}`);
            if (taskElement) taskElement.remove();
        }
    });

    setTasksInLocalStorage(updatedTasks);
    updateTasksProgress(updatedTasks);
}

function getNewTaskData(form) {
    const formData = new FormData(form);
    return {
        id: getNewTaskId(),
        description: formData.get('description') || '',
        description2: formData.get('description2') || '',
        completed: false,
        createdAt: new Date().toISOString() // Adiciona data/hora atual
    };
}

async function createTask(event) {
    event.preventDefault();
    const form = event.target;
    const saveButton = document.getElementById(SAVE_BUTTON_ID);

    try {
        saveButton.disabled = true;

        await new Promise(resolve => setTimeout(resolve, 500));

        const newTask = getNewTaskData(form);
        const tasks = getTasksFromLocalStorage();
        const updatedTasks = [...tasks, newTask];

        setTasksInLocalStorage(updatedTasks);
        createTaskListItem(newTask);
        updateTasksProgress(updatedTasks);

        form.reset();
    } catch (error) {
        console.error('Erro ao criar tarefa:', error);
    } finally {
        saveButton.disabled = false;
    }
}

function renderTaskList(tasks) {
    const list = document.getElementById(TASK_LIST_ID);
    if (list) {
        list.innerHTML = '';
        tasks.forEach(task => createTaskListItem(task));
    }
}

/**
 * 4. INICIALIZAÇÃO DA APLICAÇÃO
 */

function initializeApp() {
    const form = document.getElementById(FORM_ID);
    if (form) {
        form.addEventListener('submit', createTask);
    }

    const tasks = getTasksFromLocalStorage();
    renderTaskList(tasks);
    updateTasksProgress(tasks);
}

window.addEventListener('DOMContentLoaded', initializeApp);