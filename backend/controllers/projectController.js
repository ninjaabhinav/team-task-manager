import Project from "../models/Project.js";
import User from "../models/User.js";

export const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    if (!name) return res.status(400).json({ message: "Project name is required" });

    const project = await Project.create({
      name,
      description: description || "",
      members: members || [],
      createdBy: req.user.id
    });

    const populated = await project.populate("members", "name email");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const query =
      req.user.role === "admin"
        ? {} // admins see all projects
        : { $or: [{ createdBy: req.user.id }, { members: req.user.id }] };

    const projects = await Project.find(query)
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, members },
      { new: true }
    ).populate("members", "name email");

    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
