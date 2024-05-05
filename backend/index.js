const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Activity = require('./models/Activity');
const routes = require('./routers/Activity');
const socketIo = require('socket.io');
const http = require('http');
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://127.0.0.1:5500", // Allow requests from this origin
    methods: ["GET", "POST"] // Allow only GET and POST requests
  }
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/secure_dashboard').then(() => {
  console.log("MongoDB Connected");
}).catch((err) => {
  console.log("Error:", err);
});

// Register a new user
app.post('/register', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user object
      const newUser = new User({
        email,
        password: hashedPassword,
        isAdmin: false // Assuming newly registered users are not admin by default
      });
  
      // Save the new user to the database
      await newUser.save();
  
      // Respond with a success message
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
// Login
app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find the user by email
      const user = await User.findOne({ email });
  
      // If user not found, return 404
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
  
      // If passwords don't match, return 401
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }
  
      // Create a JWT token
      const token = jwt.sign({ email: user.email, isAdmin: user.isAdmin }, 'secretkey');
  
      // Send the token in the response
      res.json({ token, isAdmin: user.isAdmin });
    } catch (error) {
      console.error("Error logging in user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

// Middleware for token verification
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  });
};

// Protected route example
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Protected route accessed' });
});

app.use('/activity', routes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Receive new activity and broadcast to all clients
  socket.on('newActivity', (activity) => {
    io.emit('newActivity', activity);
  });
  
  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);


});



