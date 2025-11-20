// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const qs = (sel) => document.querySelectorAll(sel);
const STORAGE_KEY = "trello_todos_v1";

// Generate simple unique id
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);

// Colors mapped by category value (fallback)
const categoryColors = {
  work: "#4f46e5",
  personal: "#10b981",
  reminder: "#f59e0b",
  urgent: "#ef4444"
};

// ---------- State ----------
let tasks = [];
let dragSrcEl = null;
let currentFilter = "all";
let searchQuery = "";

// ---------- Elements ----------
const taskForm = $("#task-form");
const taskInput = $("#task-input");
const catSelect = $("#category-select");
const dueDateInput = $("#due-date");
const taskList = $("#task-list");
const toastEl = $("#toast");
const filterBtns = document.querySelectorAll(".filter-btn");
const searchInput = $("#search");

// ---------- LocalStorage ----------
function loadTasks(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch(e){
    tasks = [];
  }
}
function saveTasks(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---------- Toast ----------
let toastTimer = null;
function showToast(text){
  clearTimeout(toastTimer);
  toastEl.textContent = text;
  toastEl.style.opacity = "1";
  toastEl.style.transform = "translateY(0)";
  toastTimer = setTimeout(() => {
    toastEl.style.opacity = "0";
    toastEl.style.transform = "translateY(10px)";
  }, 2200);
}

// ---------- Task utils ----------
function isDuplicate(text){
  return tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
}
function formatDateISOToHuman(iso){
  if(!iso) return "";
  const d = new Date(iso);
  if(isNaN(d)) return "";
  return d.toLocaleDateString();
}
function dueBadgeColor(dueISO){
  if(!dueISO) return "#9ca3af"; // grey
  const now = new Date();
  const due = new Date(dueISO);
  const diff = (due - now) / (1000*60*60*24); // days
  if(diff < 0) return "#ef4444"; // overdue => red
  if(diff <= 2) return "#f97316"; // soon => orange
  if(diff <= 7) return "#f59e0b"; // near => yellow
  return "#10b981"; // ok => green
}

// ---------- Rendering ----------
function createTaskElement(task){
  const li = document.createElement("li");
  li.className = "task-card";
  li.draggable = true;
  li.dataset.id = task.id;
  // build inner HTML
  li.innerHTML = `
    <div class="task-top">
      <div class="color-dot" style="background:${task.color}"></div>
      <div style="flex:1">
        <div class="task-title ${task.completed ? 'completed' : ''}" data-role="title">${escapeHtml(task.text)}</div>
      </div>
    </div>
    <div class="task-meta">
      <div class="small">Creada: ${formatDateISOToHuman(task.createdAt)}</div>
      <div style="display:flex; gap:8px; align-items:center;">
        <div class="due-badge" style="background:${dueBadgeColor(task.dueDate)}">
          ${task.dueDate ? formatDateISOToHuman(task.dueDate) : 'Sin fecha'}
        </div>
        <div class="task-actions">
          <button class="icon-btn" data-action="complete" title="Marcar completada"><i class="fa-regular fa-circle-check"></i></button>
          <button class="icon-btn" data-action="edit" title="Editar"><i class="fa-regular fa-pen-to-square"></i></button>
          <button class="icon-btn" data-action="delete" title="Eliminar"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      </div>
    </div>
  `;

  // drag events
  li.addEventListener("dragstart", handleDragStart);
  li.addEventListener("dragend", handleDragEnd);
  li.addEventListener("dragover", handleDragOver);
  li.addEventListener("drop", handleDrop);

  return li;
}

function render(){
  // clear
  taskList.innerHTML = "";
  // apply filter & search
  let items = tasks.slice();
  if(currentFilter === "pending") items = items.filter(t => !t.completed);
  if(currentFilter === "completed") items = items.filter(t => t.completed);
  if(currentFilter === "urgent") items = items.filter(t => t.category === "urgent");
  if(searchQuery) items = items.filter(t => t.text.toLowerCase().includes(searchQuery.toLowerCase()));
  // create nodes
  if(items.length === 0){
    taskList.innerHTML = `<div class="placeholder" style="padding:18px; text-align:center; color:var(--muted)">No hay tareas. Añade una nueva.</div>`;
    return;
  }
  items.forEach(task => {
    const el = createTaskElement(task);
    taskList.appendChild(el);
  });
}

// ---------- Events and actions ----------
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  const cat = catSelect.value;
  const color = catSelect.selectedOptions[0].dataset.color || categoryColors[cat] || "#60a5fa";
  const due = dueDateInput.value ? new Date(dueDateInput.value).toISOString() : null;

  if(!text){ showToast("Escribe una tarea válida"); return;}
  if(text.length < 3){ showToast("La tarea debe tener al menos 3 caracteres"); return;}
  if(isDuplicate(text)){ showToast("Ya existe una tarea igual"); return;}

  const task = {
    id: uid(),
    text,
    category: cat,
    color,
    createdAt: new Date().toISOString(),
    dueDate: due,
    completed: false
  };
  tasks.unshift(task); // add at top
  saveTasks();
  render();
  taskForm.reset();
  taskInput.focus();
  showToast("Tarea añadida");
});

// Delegation for actions (complete / edit / delete)
taskList.addEventListener("click", (e) => {
  const btn = e.target.closest(".icon-btn");
  if(!btn) return;
  const action = btn.dataset.action;
  const li = btn.closest(".task-card");
  if(!li) return;
  const id = li.dataset.id;
  const idx = tasks.findIndex(t => t.id === id);
  if(idx === -1) return;

  if(action === "complete"){
    tasks[idx].completed = !tasks[idx].completed;
    saveTasks();
    render();
    showToast(tasks[idx].completed ? "Marcada como completada" : "Marcada como pendiente");
  } else if(action === "delete"){
    tasks.splice(idx,1);
    saveTasks();
    render();
    showToast("Tarea eliminada");
  } else if(action === "edit"){
    enableInlineEdit(li, tasks[idx]);
  }
});

// Click on title toggles completion (alternate)
taskList.addEventListener("dblclick", (e) => {
  const title = e.target.closest("[data-role='title']");
  if(!title) return;
  const li = title.closest(".task-card");
  const id = li.dataset.id;
  const t = tasks.find(x => x.id === id);
  if(!t) return;
  t.completed = !t.completed;
  saveTasks();
  render();
});

// Search
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.trim();
  render();
});

// Filters
filterBtns.forEach(b => b.addEventListener("click", () => {
  filterBtns.forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  currentFilter = b.dataset.filter;
  render();
}));

// ---------- Inline Edit ----------
function enableInlineEdit(li, task){
  const titleEl = li.querySelector("[data-role='title']");
  const old = task.text;
  // create input
  const input = document.createElement("input");
  input.type = "text";
  input.value = old;
  input.maxLength = 120;
  input.className = "inline-input";
  input.style.width = "100%";
  input.style.padding = "6px";
  titleEl.replaceWith(input);
  input.focus();
  input.select();

  function save(){
    const val = input.value.trim();
    if(!val || val.length < 3){ showToast("Texto inválido"); input.focus(); return; }
    if(val.toLowerCase() !== old.toLowerCase() && isDuplicate(val)){ showToast("Ya existe una tarea igual"); return; }
    task.text = val;
    saveTasks();
    render();
    showToast("Tarea actualizada");
  }
  input.addEventListener("keydown", (e) => {
    if(e.key === "Enter") save();
    if(e.key === "Escape") render();
  });
  input.addEventListener("blur", save);
}

// ---------- Drag & Drop handlers ----------
function handleDragStart(e){
  dragSrcEl = this;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  try {
    e.dataTransfer.setData("text/plain", this.dataset.id);
  } catch(err){}
}

function handleDragEnd(){
  this.classList.remove("dragging");
}

function handleDragOver(e){
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function handleDrop(e){
  e.preventDefault();
  const srcId = e.dataTransfer.getData("text/plain") || (dragSrcEl && dragSrcEl.dataset.id);
  const destId = this.dataset.id;
  if(!srcId || !destId || srcId === destId) return;
  const srcIndex = tasks.findIndex(t => t.id === srcId);
  const destIndex = tasks.findIndex(t => t.id === destId);
  if(srcIndex === -1 || destIndex === -1) return;
  // move src before dest
  const [moved] = tasks.splice(srcIndex,1);
  tasks.splice(destIndex, 0, moved);
  saveTasks();
  render();
  showToast("Tarea reordenada");
}

// ---------- Escape html for safety in rendering (very small) ----------
function escapeHtml(s = "") {
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

// ---------- Init ----------
function init(){
  // populate category select dataset colors (in case)
  Array.from(catSelect.options).forEach(opt => {
    const c = opt.dataset.color;
    if(!c) opt.dataset.color = categoryColors[opt.value] || "#60a5fa";
  });

  loadTasks();
  render();
}
init();
