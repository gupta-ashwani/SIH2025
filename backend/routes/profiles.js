const express = require("express");
const router = express.Router();
const Faculty = require("../model/faculty");
const Department = require("../model/department");
const College = require("../model/college");
const Institute = require("../model/institute");
const SuperAdmin = require("../model/superadmin");
const { requireAuth, requireRole } = require("../middleware/auth");

// Faculty Profile Routes
router.get(
  "/faculty/:id",
  requireAuth,
  requireRole(["faculty", "department", "college", "institute", "superadmin"]),
  async (req, res) => {
    try {
      const faculty = await Faculty.findById(req.params.id)
        .populate("department", "name code")
        .populate("students", "name studentID")
        .select("-password");

      if (!faculty) {
        return res.status(404).json({ error: "Faculty not found" });
      }

      res.json({ faculty });
    } catch (error) {
      console.error("Faculty profile fetch error:", error);
      res.status(500).json({ error: "Failed to fetch faculty profile" });
    }
  }
);

router.put(
  "/faculty/:id",
  requireAuth,
  requireRole(["faculty", "department", "college", "institute", "superadmin"]),
  async (req, res) => {
    try {
      const { name, designation, contactNumber, isCoordinator } = req.body;
      
      const updateData = {};
      if (name) updateData.name = name;
      if (designation) updateData.designation = designation;
      if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
      if (isCoordinator !== undefined) updateData.isCoordinator = isCoordinator;

      const faculty = await Faculty.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate("department", "name code");

      if (!faculty) {
        return res.status(404).json({ error: "Faculty not found" });
      }

      res.json({ 
        message: "Faculty profile updated successfully",
        faculty 
      });
    } catch (error) {
      console.error("Faculty profile update error:", error);
      res.status(500).json({ error: "Failed to update faculty profile" });
    }
  }
);

// Department Profile Routes
router.get(
  "/department/:id",
  requireAuth,
  requireRole(["department", "college", "institute", "superadmin"]),
  async (req, res) => {
    try {
      const department = await Department.findById(req.params.id)
        .populate("college", "name code")
        .populate("institute", "name code")
        .populate("hod", "name facultyID designation")
        .populate("faculties", "name facultyID designation")
        .select("-password");

      if (!department) {
        return res.status(404).json({ error: "Department not found" });
      }

      res.json({ department });
    } catch (error) {
      console.error("Department profile fetch error:", error);
      res.status(500).json({ error: "Failed to fetch department profile" });
    }
  }
);

router.put(
  "/department/:id",
  requireAuth,
  requireRole(["department", "college", "institute", "superadmin"]),
  async (req, res) => {
    try {
      const { name, contactNumber, status } = req.body;
      
      const updateData = {};
      if (name) updateData.name = name;
      if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
      if (status) updateData.status = status;

      const department = await Department.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      )
      .populate("college", "name code")
      .populate("institute", "name code")
      .populate("hod", "name facultyID designation");

      if (!department) {
        return res.status(404).json({ error: "Department not found" });
      }

      res.json({ 
        message: "Department profile updated successfully",
        department 
      });
    } catch (error) {
      console.error("Department profile update error:", error);
      res.status(500).json({ error: "Failed to update department profile" });
    }
  }
);

// College Profile Routes
router.get(
  "/college/:id",
  requireAuth,
  requireRole(["college", "institute", "superadmin"]),
  async (req, res) => {
    try {
      const college = await College.findById(req.params.id)
        .populate("institute", "name code")
        .populate("departments", "name code")
        .select("-password");

      if (!college) {
        return res.status(404).json({ error: "College not found" });
      }

      res.json({ college });
    } catch (error) {
      console.error("College profile fetch error:", error);
      res.status(500).json({ error: "Failed to fetch college profile" });
    }
  }
);

router.put(
  "/college/:id",
  requireAuth,
  requireRole(["college", "institute", "superadmin"]),
  async (req, res) => {
    try {
      const { name, type, contactNumber, website, address, status } = req.body;
      
      const updateData = {};
      if (name) updateData.name = name;
      if (type) updateData.type = type;
      if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
      if (website !== undefined) updateData.website = website;
      if (address) updateData.address = address;
      if (status) updateData.status = status;

      const college = await College.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      )
      .populate("institute", "name code")
      .populate("departments", "name code");

      if (!college) {
        return res.status(404).json({ error: "College not found" });
      }

      res.json({ 
        message: "College profile updated successfully",
        college 
      });
    } catch (error) {
      console.error("College profile update error:", error);
      res.status(500).json({ error: "Failed to update college profile" });
    }
  }
);

// Institute Profile Routes
router.get(
  "/institute/:id",
  requireAuth,
  requireRole(["institute", "superadmin"]),
  async (req, res) => {
    try {
      const institute = await Institute.findById(req.params.id)
        .populate("colleges", "name code type")
        .populate("approvedBy", "name")
        .select("-password");

      if (!institute) {
        return res.status(404).json({ error: "Institute not found" });
      }

      res.json({ institute });
    } catch (error) {
      console.error("Institute profile fetch error:", error);
      res.status(500).json({ error: "Failed to fetch institute profile" });
    }
  }
);

router.put(
  "/institute/:id",
  requireAuth,
  requireRole(["institute", "superadmin"]),
  async (req, res) => {
    try {
      const { 
        name, 
        type, 
        contactNumber, 
        website, 
        address, 
        location, 
        studentCount, 
        status 
      } = req.body;
      
      const updateData = {};
      if (name) updateData.name = name;
      if (type) updateData.type = type;
      if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
      if (website !== undefined) updateData.website = website;
      if (address) updateData.address = address;
      if (location) updateData.location = location;
      if (studentCount !== undefined) updateData.studentCount = studentCount;
      if (status) updateData.status = status;

      const institute = await Institute.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      )
      .populate("colleges", "name code type")
      .populate("approvedBy", "name");

      if (!institute) {
        return res.status(404).json({ error: "Institute not found" });
      }

      res.json({ 
        message: "Institute profile updated successfully",
        institute 
      });
    } catch (error) {
      console.error("Institute profile update error:", error);
      res.status(500).json({ error: "Failed to update institute profile" });
    }
  }
);

// SuperAdmin Profile Routes
router.get(
  "/superadmin/:id",
  requireAuth,
  requireRole(["superadmin"]),
  async (req, res) => {
    try {
      const superAdmin = await SuperAdmin.findById(req.params.id)
        .select("-password");

      if (!superAdmin) {
        return res.status(404).json({ error: "Super admin not found" });
      }

      res.json({ superAdmin });
    } catch (error) {
      console.error("Super admin profile fetch error:", error);
      res.status(500).json({ error: "Failed to fetch super admin profile" });
    }
  }
);

router.put(
  "/superadmin/:id",
  requireAuth,
  requireRole(["superadmin"]),
  async (req, res) => {
    try {
      const { name, contactNumber, permissions, status } = req.body;
      
      const updateData = {};
      if (name) updateData.name = name;
      if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
      if (permissions) updateData.permissions = permissions;
      if (status) updateData.status = status;

      const superAdmin = await SuperAdmin.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).select("-password");

      if (!superAdmin) {
        return res.status(404).json({ error: "Super admin not found" });
      }

      res.json({ 
        message: "Super admin profile updated successfully",
        superAdmin 
      });
    } catch (error) {
      console.error("Super admin profile update error:", error);
      res.status(500).json({ error: "Failed to update super admin profile" });
    }
  }
);

// Get current user's profile based on role
router.get(
  "/me",
  requireAuth,
  async (req, res) => {
    try {
      const user = req.user;
      let profile = null;

      switch (user.role) {
        case "faculty":
          profile = await Faculty.findById(user.id)
            .populate("department", "name code")
            .populate("students", "name studentID")
            .select("-password");
          break;
        case "department":
          profile = await Department.findById(user.id)
            .populate("college", "name code")
            .populate("institute", "name code")
            .populate("hod", "name facultyID designation")
            .populate("faculties", "name facultyID designation")
            .select("-password");
          break;
        case "college":
          profile = await College.findById(user.id)
            .populate("institute", "name code")
            .populate("departments", "name code")
            .select("-password");
          break;
        case "institute":
          profile = await Institute.findById(user.id)
            .populate("colleges", "name code type")
            .populate("approvedBy", "name")
            .select("-password");
          break;
        case "superadmin":
          profile = await SuperAdmin.findById(user.id)
            .select("-password");
          break;
        default:
          return res.status(400).json({ error: "Invalid user role" });
      }

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json({ profile, role: user.role });
    } catch (error) {
      console.error("Current user profile fetch error:", error);
      res.status(500).json({ error: "Failed to fetch current user profile" });
    }
  }
);

// Update current user's profile
router.put(
  "/me",
  requireAuth,
  async (req, res) => {
    try {
      const user = req.user;
      const updateData = req.body;
      let profile = null;

      switch (user.role) {
        case "faculty":
          profile = await Faculty.findByIdAndUpdate(
            user.id,
            updateData,
            { new: true, runValidators: true }
          )
          .populate("department", "name code")
          .select("-password");
          break;
        case "department":
          profile = await Department.findByIdAndUpdate(
            user.id,
            updateData,
            { new: true, runValidators: true }
          )
          .populate("college", "name code")
          .populate("institute", "name code")
          .select("-password");
          break;
        case "college":
          profile = await College.findByIdAndUpdate(
            user.id,
            updateData,
            { new: true, runValidators: true }
          )
          .populate("institute", "name code")
          .select("-password");
          break;
        case "institute":
          profile = await Institute.findByIdAndUpdate(
            user.id,
            updateData,
            { new: true, runValidators: true }
          )
          .populate("colleges", "name code type")
          .select("-password");
          break;
        case "superadmin":
          profile = await SuperAdmin.findByIdAndUpdate(
            user.id,
            updateData,
            { new: true, runValidators: true }
          )
          .select("-password");
          break;
        default:
          return res.status(400).json({ error: "Invalid user role" });
      }

      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      res.json({ 
        message: "Profile updated successfully",
        profile,
        role: user.role
      });
    } catch (error) {
      console.error("Current user profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

module.exports = router;
