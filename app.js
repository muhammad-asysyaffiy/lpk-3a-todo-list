// ===== STATE =====
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "semua";
let editingId = null;

// ===== DOM ELEMENTS =====
const form = document.querySelector("#form-todo");
const input = document.querySelector("#input-todo");
const list = document.querySelector("#list-todo");
const stats = document.querySelector("#stats");
const progressPercent = document.querySelector("#progress-percent");
const progressFill = document.querySelector("#progress-fill");
const filterButtons = document.querySelectorAll(".filter-btn");

// ===== HELPERS =====
function simpan() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function escapeHTML(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getFilteredTodos() {
  if (currentFilter === "aktif") {
    return todos.filter((todo) => !todo.selesai);
  }
  if (currentFilter === "selesai") {
    return todos.filter((todo) => todo.selesai);
  }
  return todos;
}

function updateStats() {
  const total = todos.length;
  const selesai = todos.filter((t) => t.selesai).length;
  const belum = total - selesai;
  const persen = total === 0 ? 0 : Math.round((selesai / total) * 100);

  stats.textContent = `${belum} tugas belum selesai`;
  progressPercent.textContent = `${persen}%`;
  progressFill.style.width = `${persen}%`;
}

// ===== RENDER =====
function render() {
  list.innerHTML = "";
  updateStats();

  const filtered = getFilteredTodos();

  if (filtered.length === 0) {
    const pesanKosong =
      todos.length === 0
        ? "Belum ada tugas. Tambahkan tugas pertamamu!"
        : `Tidak ada tugas di kategori "${currentFilter}".`;

    list.innerHTML = `<li class="empty-state">${pesanKosong}</li>`;
    return;
  }

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item${todo.selesai ? " selesai" : ""}`;

    if (editingId === todo.id) {
      li.innerHTML = `
        <input
          type="text"
          class="edit-input"
          value="${escapeHTML(todo.teks)}"
          data-id="${todo.id}"
        >
        <div class="item-actions">
          <button type="button" class="btn-action btn-simpan" data-id="${todo.id}">Simpan</button>
          <button type="button" class="btn-action btn-batal">Batal</button>
        </div>
      `;
    } else {
      li.innerHTML = `
        <input
          type="checkbox"
          class="todo-checkbox"
          ${todo.selesai ? "checked" : ""}
          data-id="${todo.id}"
          aria-label="Tandai selesai"
        >
        <span class="teks">${escapeHTML(todo.teks)}</span>
        <div class="item-actions">
          <button type="button" class="btn-action btn-edit" data-id="${todo.id}">Edit</button>
          <button type="button" class="btn-action btn-hapus" data-id="${todo.id}">Hapus</button>
        </div>
      `;
    }

    list.appendChild(li);
  });

  // Fokus otomatis ke input jika sedang mode edit
  if (editingId !== null) {
    const editInput = list.querySelector(".edit-input");
    if (editInput) {
      editInput.focus();
      editInput.setSelectionRange(editInput.value.length, editInput.value.length);
    }
  }
}

// ===== CRUD FUNCTIONS =====
function tambahTodo(teks) {
  todos.push({
    id: Date.now(),
    teks: teks.trim(),
    selesai: false,
  });
  simpan();
  render();
}

function toggleSelesai(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.selesai = !todo.selesai;
    simpan();
    render();
  }
}

function hapusTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  if (editingId === id) editingId = null;
  simpan();
  render();
}

function simpanEdit(id, teksBaru) {
  const bersih = teksBaru.trim();
  if (!bersih) return;

  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.teks = bersih;
    editingId = null;
    simpan();
    render();
  }
}

// ===== EVENT LISTENERS =====
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value.trim()) {
    tambahTodo(input.value);
    input.value = "";
  }
});

list.addEventListener("change", (e) => {
  if (e.target.classList.contains("todo-checkbox")) {
    toggleSelesai(Number(e.target.dataset.id));
  }
});

list.addEventListener("click", (e) => {
  const target = e.target;

  if (target.classList.contains("btn-hapus")) {
    hapusTodo(Number(target.dataset.id));
  } else if (target.classList.contains("btn-edit")) {
    editingId = Number(target.dataset.id);
    render();
  } else if (target.classList.contains("btn-simpan")) {
    const editInput = target.closest(".todo-item").querySelector(".edit-input");
    simpanEdit(Number(target.dataset.id), editInput.value);
  } else if (target.classList.contains("btn-batal")) {
    editingId = null;
    render();
  }
});

list.addEventListener("keydown", (e) => {
  if (!e.target.classList.contains("edit-input")) return;

  if (e.key === "Enter") {
    simpanEdit(Number(e.target.dataset.id), e.target.value);
  } else if (e.key === "Escape") {
    editingId = null;
    render();
  }
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    editingId = null;

    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    render();
  });
});

// ===== INIT =====
render();