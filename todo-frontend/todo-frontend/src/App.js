import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

const API_URL = "http://127.0.0.1:5000/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError("Failed to load tasks. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: newTask }),
      });

      if (!res.ok) throw new Error("Failed to add task");
      setNewTask("");
      fetchTasks();
    } catch (err) {
      setError("Failed to add task. Please try again.");
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");

      // Optimistic UI update
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (err) {
      setError("Failed to delete task. Please try again.");
      fetchTasks(); // Revert to actual server state
      console.error(err);
    }
  };

  // Variants for framer-motion animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="app-container">
      {/* Animated background bubbles */}
      <div className="bubbles-container">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="bubble"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              transition: {
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: "mirror",
              },
            }}
            style={{
              background: `rgba(${Math.floor(
                Math.random() * 100 + 100
              )}, ${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(
                Math.random() * 155 + 100
              )}, 0.15)`,
            }}
          />
        ))}
      </div>

      <motion.div
        className="content-container"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="app-title"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            type: "spring",
            stiffness: 200,
          }}
        >
          Task Master
        </motion.h1>

        <AnimatePresence>
          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              {error}
              <button
                className="error-close-btn"
                onClick={() => setError(null)}
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          onSubmit={addTask}
          className="task-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What needs to be done?"
            className="task-input"
            disabled={isAdding}
            whileFocus={{
              scale: 1.02,
              boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.3)",
            }}
            transition={{ duration: 0.2 }}
          />
          <motion.button
            type="submit"
            disabled={isAdding || !newTask.trim()}
            className={`add-button ${isAdding ? "disabled" : ""}`}
            whileHover={!isAdding && newTask.trim() ? { scale: 1.05 } : {}}
            whileTap={!isAdding && newTask.trim() ? { scale: 0.95 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {isAdding ? "Adding..." : "Add Task"}
          </motion.button>
        </motion.form>

        {loading ? (
          <motion.div
            className="loader"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <motion.ul
            className="task-list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {tasks.length === 0 ? (
                <motion.p
                  className="empty-message"
                  animate={{
                    y: [0, -10, 0],
                    transition: { repeat: Infinity, duration: 2 },
                  }}
                >
                  No tasks yet! Add one above.
                </motion.p>
              ) : (
                tasks.map((task) => (
                  <motion.li
                    key={task.id}
                    className="task-item"
                    variants={itemVariants}
                    layout
                    exit="exit"
                  >
                    <span className="task-text">{task.task}</span>
                    <motion.button
                      onClick={() => deleteTask(task.id)}
                      className="delete-button"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.button>
                  </motion.li>
                ))
              )}
            </AnimatePresence>
          </motion.ul>
        )}
      </motion.div>
    </div>
  );
}

export default App;