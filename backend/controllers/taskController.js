import Task from "../models/Task.js";

export const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate } = req.body;

    if (!title) return res.status(400).json({ message: "Title is required" });

    const task = await Task.create({
      title,
      description: description || "",
      project: project || null,
      assignedTo: assignedTo || req.user.id,
      dueDate: dueDate || null
    });

    const populated = await task.populate([
      { path: "assignedTo", select: "name email" },
      { path: "project", select: "name" }
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const query =
      req.user.role === "admin"
        ? {} // admins see all tasks
        : { assignedTo: req.user.id }; // members only see their tasks

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { status, title, description, assignedTo, dueDate, project } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, title, description, assignedTo, dueDate, project },
      { new: true }
    )
      .populate("assignedTo", "name email")
      .populate("project", "name");

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
