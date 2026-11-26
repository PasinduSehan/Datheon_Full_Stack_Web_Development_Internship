// State Management
let tasks = loadFromLocalStorage();
let currentStatusFilter = 'all';
let currentCategoryFilter = 'all';
let searchQuery = '';

// DOM Elements
const taskForm = document.getElementById('taskForm');
const editTaskId = document.getElementById('editTaskId');
const taskTitle = document.getElementById('taskTitle');
const taskCategory = document.getElementById('taskCategory');
const taskDueDate = document.getElementById('taskDueDate');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const categoryFilter = document.getElementById('categoryFilter');
const completedCountEl = document.getElementById('completedCount');
const totalCountEl = document.getElementById('totalCount');

// Set default due date to today
taskDueDate.valueAsDate = new Date();

// Helper Functions: localStorage
function saveToLocalStorage() {
  localStorage.setItem('datheon_tasks', JSON.stringify(tasks));
}

function loadFromLocalStorage() {
  const data = localStorage.getItem('datheon_tasks');
  return data ? JSON.parse(data) : [];
}

// Create or Update Task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = taskTitle.value.trim();
  if (!title) return;

  const idToEdit = editTaskId.value;

  if (idToEdit) {
    // Update existing task
    tasks = tasks.map(task =>
      task.id === idToEdit
        ? { ...task, title, category: taskCategory.value, dueDate: taskDueDate.value }
        : task
    );
    resetFormState();
  } else {
    // Create new task
    const newTask = {
      id: Date.now().toString(),
      title,
      category: taskCategory.value,
      dueDate: taskDueDate.value,
      completed: false
    };
    tasks.unshift(newTask);
  }

  saveToLocalStorage();
  renderTasks();
  taskTitle.value = '';
  taskDueDate.valueAsDate = new Date();
});

// Cancel Edit Mode
cancelEditBtn.addEventListener('click', () => {
  resetFormState();
  taskTitle.value = '';
  taskDueDate.valueAsDate = new Date();
});

function resetFormState() {
  editTaskId.value = '';
  submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Task';
  cancelEditBtn.classList.add('hidden');
}

// Toggle Complete Status
function toggleTaskComplete(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveToLocalStorage();
  renderTasks();
}

// Populate Form for Editing
function startEditTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editTaskId.value = task.id;
  taskTitle.value = task.title;
  taskCategory.value = task.category;
  taskDueDate.value = task.dueDate;

  submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Task';
  cancelEditBtn.classList.remove('hidden');
  taskTitle.focus();
}

// Delete Task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  if (editTaskId.value === id) resetFormState();
  saveToLocalStorage();
  renderTasks();
}

// Filters & Search Listeners
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentStatusFilter = btn.getAttribute('data-filter');
    renderTasks();
  });
});

categoryFilter.addEventListener('change', (e) => {
  currentCategoryFilter = e.target.value;
  renderTasks();
});

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase();
  renderTasks();
});

// Render Tasks to DOM
function renderTasks() {
  // Update stats
  totalCountEl.textContent = tasks.length;
  completedCountEl.textContent = tasks.filter(t => t.completed).length;

  // Apply filters
  const filteredTasks = tasks.filter(task => {
    const matchesStatus =
      currentStatusFilter === 'all' ||
      (currentStatusFilter === 'active' && !task.completed) ||
      (currentStatusFilter === 'completed' && task.completed);

    const matchesCategory =
      currentCategoryFilter === 'all' || task.category === currentCategoryFilter;

    const matchesSearch = task.title.toLowerCase().includes(searchQuery);

    return matchesStatus && matchesCategory && matchesSearch;
  });

  taskList.innerHTML = '';

  if (filteredTasks.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;

    li.innerHTML = `
      <div class="task-left">
        <input
          type="checkbox"
          class="task-checkbox"
          ${task.completed ? 'checked' : ''}
          onchange="toggleTaskComplete('${task.id}')"
        />
        <div class="task-info">
          <span class="task-text">${escapeHTML(task.title)}</span>
          <div class="task-meta">
            <span class="badge badge-${task.category}">${task.category}</span>
            <span><i class="far fa-calendar-alt"></i> ${task.dueDate}</span>
          </div>
        </div>
      </div>
      <div class="task-actions">
        <button class="action-btn edit" title="Edit Task" onclick="startEditTask('${task.id}')">
          <i class="fas fa-pen"></i>
        </button>
        <button class="action-btn delete" title="Delete Task" onclick="deleteTask('${task.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

// Prevent XSS
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Initial Render
renderTasks();