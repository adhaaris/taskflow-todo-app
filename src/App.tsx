import { useState, useEffect } from "react";
import "./App.css";

type Task = { id: number; text: string; done: boolean };
type Filter = "all" | "active" | "completed";

export default function App() {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem("tasks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const remaining = tasks.filter((t) => !t.done).length;
  const visibleTasks = tasks.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.done : t.done,
  );

  function addTask() {
    if (title.trim() === "") return;
    setTasks([...tasks, { id: Date.now(), text: title.trim(), done: false }]);
    setTitle("");
  }

  function toggleTask(id: number) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTask(id: number) {
    setTasks(tasks.filter((t) => t.id !== id));
  }
  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditText(task.text);
  }
  function saveEdit(id: number) {
    if (editText.trim() === "") return;
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, text: editText.trim() } : t)),
    );
    setEditingId(null);
  }

  return (
    <>
      <main className="app">
        <header className="header">
          <h1>TaskFlow</h1>
          <p>Organize your day, one task at a time.</p>
        </header>
        <form
          className="add-form"
          onSubmit={(event) => {
            event.preventDefault();
            addTask();
          }}
        >
          {" "}
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Write one Task"
            aria-label="New Task"
          />
          <button className="btn btn-success">Add task</button>
        </form>
        <div className="toolbar">
          <div className="filters">
            {(["all", "active", "completed"] as Filter[]).map((f) => (
              <button
                key={f}
                className={
                  filter === f
                    ? "btn btn-sm btn-dark"
                    : "btn btn-sm btn-outline-dark"
                }
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="count">{remaining} tasks left</span>
        </div>

        <ul className="task-list">
          {visibleTasks.map((task) => (
            <li key={task.id} className="task-item">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
                aria-label={`Mark ${task.text} as done`}
              />
              {editingId === task.id ? (
                <>
                  <input
                    className="edit-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(task.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    aria-label="Edit task"
                    autoFocus
                  />
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => saveEdit(task.id)}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className={task.done ? "task-text done" : "task-text"}>
                    {task.text}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => startEdit(task)}
                  >
                    Edit
                  </button>
                </>
              )}
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => deleteTask(task.id)}
                aria-label={`Delete ${task.text}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        {visibleTasks.length === 0 && (
          <p className="empty">
            {tasks.length === 0
              ? "No tasks yet. Add your first one above."
              : "No tasks match this filter."}
          </p>
        )}
      </main>
    </>
  );
}
