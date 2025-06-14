const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');
const timeRoutes = require('./routes/time');
const dashboardRoutes = require('./routes/dashboard');

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL (adjust for prod)
  credentials: true,               // Important for cookies!
}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json());
app.get("/api/test", (req, res) => {
  res.send("Route working!");
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/time', timeRoutes);
app.use('/api/dashboard', dashboardRoutes);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected');
    app.listen(5000, () => console.log('Server running on port 5000'));
}).catch(err => console.error(err));