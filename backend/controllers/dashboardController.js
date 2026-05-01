import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

export const getDashboard = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const userId = req.user.id;

    const taskQuery = isAdmin ? {} : { assignedTo: userId };
    const tasks = await Task.find(taskQuery).populate("project", "name");

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done"
    );

    // Recent tasks (last 5)
    const recentTasks = await Task.find(taskQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("assignedTo", "name")
      .populate("project", "name");

    let adminStats = null;
    if (isAdmin) {
      const totalUsers = await User.countDocuments();
      const totalProjects = await Project.countDocuments();
      adminStats = { totalUsers, totalProjects };
    }

    res.json({
      total,
      completed,
      inProgress,
      todo,
      overdue: overdueTasks.length,
      overdueTasks,
      recentTasks,
      adminStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
