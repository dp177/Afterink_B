const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Hold', 'Completed'],
    default: 'Not Started',
  },
  startTime: { type: Date },
  endTime: { type: Date },
  duration: { type: Number }, // in seconds
});

module.exports = mongoose.model('TimeLog', timeLogSchema);
