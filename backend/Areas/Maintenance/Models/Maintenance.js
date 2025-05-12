const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  isMaintenanceMode: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Maintenance', maintenanceSchema); 