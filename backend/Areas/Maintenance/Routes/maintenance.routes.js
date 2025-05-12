const express = require('express');
const router = express.Router();
const Maintenance = require('../Models/Maintenance');
const { isAdmin } = require('../../../middlewares/adminAuth');

// Get maintenance status
router.get('/status', async (req, res) => {
  try {
    let maintenance = await Maintenance.findOne();
    if (!maintenance) {
      maintenance = await Maintenance.create({ isMaintenanceMode: false });
    }
    res.json({ isMaintenanceMode: maintenance.isMaintenanceMode });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maintenance status' });
  }
});

// Toggle maintenance mode (admin only)
router.post('/toggle', isAdmin, async (req, res) => {
  try {
    let maintenance = await Maintenance.findOne();
    if (!maintenance) {
      maintenance = await Maintenance.create({ isMaintenanceMode: false });
    }
    
    maintenance.isMaintenanceMode = !maintenance.isMaintenanceMode;
    maintenance.lastUpdated = Date.now();
    await maintenance.save();
    
    res.json({ isMaintenanceMode: maintenance.isMaintenanceMode });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling maintenance mode' });
  }
});

module.exports = router; 