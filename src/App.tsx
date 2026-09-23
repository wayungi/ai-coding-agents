import { useEffect, useRef, useState, type FormEvent } from "react";
import Check from "./components/Check";
import { loadTodos, storageKey, type Todo } from "./loadTodos";

type Filter = "All" | "Active" | "Completed";

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [text, setText] = useState("");
  const [inputError, setInputError] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [storageError, setStorageError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const completed = todos.filter((todo) => todo.completed).length;
  const remaining = todos.length - completed;

  const visible = todos.filter(
    (todo) =>
      filter === "All" ||
      (filter === "Completed" ? todo.completed : !todo.completed),
  );

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(todos));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [todos]);
  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim()) {
      setInputError("Please enter a task.");
      inputRef.current?.focus();
      return;
    }
    setInputError("");
    setTodos((previous) => [
      ...previous,
      { id: crypto.randomUUID(), text: text.trim(), completed: false },
    ]);
    setText("");
    setFilter("All");
    inputRef.current?.focus();
  }
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="./" aria-label="Daily home">
          <span className="brand-icon">
            <Check />
          </span>
          daily<span className="brand-dot">.</span>
        </a>
        <span className="header-note">A little focus goes a long way.</span>
      </header>
      <main>
        <div className="date">
          <span />
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
        <h1>
          Make room for <em>what matters.</em>
        </h1>
        <p className="intro">
          Big plans, small steps. It all starts with a list.
        </p>
        <section className="todo-card" aria-label="Your todo list">
          <div className="card-heading">
            <div>
              <h2>
                My tasks <span className="count">{todos.length}</span>
              </h2>
              <p>Your day, one thing at a time.</p>
            </div>
            <span className="small-sparkle" aria-hidden="true">
              ✳
            </span>
          </div>
          <form onSubmit={addTodo} className="add-form">
            <label className="sr-only" htmlFor="new-todo">
              New task
            </label>
            <span className="input-plus" aria-hidden="true">
              +
            </span>
            <input
              ref={inputRef}
              id="new-todo"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                if (event.target.value.trim()) setInputError("");
              }}
              aria-invalid={Boolean(inputError)}
              aria-describedby={inputError ? "task-input-error" : undefined}
              placeholder="What's on your mind?"
              maxLength={500}
              autoComplete="off"
            />
            <button className="add-button" type="submit">
              <span aria-hidden="true">+</span> Add task
            </button>
          </form>
          {inputError && (
            <p id="task-input-error" className="input-error" role="alert">
              {inputError}
            </p>
          )}
          <div className="list-toolbar">
            <div className="filters" aria-label="Filter tasks">
              {(["All", "Active", "Completed"] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  aria-pressed={filter === value}
                  className={filter === value ? "selected" : ""}
                >
                  {value}
                </button>
              ))}
            </div>
            <span className="remaining" aria-live="polite">
              {remaining} {remaining === 1 ? "task" : "tasks"} left
            </span>
          </div>
          {visible.length > 0 ? (
            <ul className="task-list">
              {visible.map((todo) => (
                <li
                  key={todo.id}
                  className={todo.completed ? "task completed" : "task"}
                >
                  <label className="task-label">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() =>
                        setTodos((previous) =>
                          previous.map((item) =>
                            item.id === todo.id
                              ? { ...item, completed: !item.completed }
                              : item,
                          ),
                        )
                      }
                    />
                    <span className="checkbox-art">
                      <Check />
                    </span>
                    <span className="task-text">{todo.text}</span>
                  </label>
                  <button
                    className="delete-button"
                    aria-label={`Delete ${todo.text}`}
                    onClick={() =>
                      setTodos((previous) =>
                        previous.filter((item) => item.id !== todo.id),
                      )
                    }
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <div className="empty-art" aria-hidden="true">
                <div className="paper">
                  <span />
                  <span />
                  <span />
                  <div className="paper-check">
                    <Check />
                  </div>
                </div>
                <span className="art-sparkle">✧</span>
              </div>
              <h3>
                {filter === "Completed"
                  ? "Good things take a first step."
                  : filter === "Active" && todos.length
                    ? "All done. Take a little breather."
                    : "A fresh start, a clear mind."}
              </h3>
              <p>
                {filter === "Completed"
                  ? "Your completed tasks will appear here."
                  : filter === "Active" && todos.length
                    ? "You’ve checked everything off your list."
                    : "Add your first task and make a little progress today."}
              </p>
            </div>
          )}
          <footer className="card-footer">
            <span>
              <span className="status-dot" />
              {completed > 0
                ? `${completed} of ${todos.length} completed. Nice work!`
                : "A small step is still a step."}
            </span>
            {completed > 0 && (
              <button
                onClick={() =>
                  setTodos((previous) =>
                    previous.filter((todo) => !todo.completed),
                  )
                }
              >
                Clear completed
              </button>
            )}
          </footer>
        </section>
        {storageError && (
          <p className="storage-error" role="status">
            Your browser couldn’t save these tasks. They’ll stay available until
            you close or refresh this page.
          </p>
        )}
        <p className="below-card">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>{" "}
          Just your list. Saved in this browser.
        </p>
      </main>
      <footer className="site-footer">
        Less noise. More done.<span>Made for your everyday.</span>
      </footer>
    </div>
  );
}
