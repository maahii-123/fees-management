const express = require('express'); 
const cors = require('cors');
const bodyParser = require('body-parser');

const initAdmin = require('./setup/initAdmin');// Initializes DB tables and admin
const app = express();
const port = 7000;

// DB Connection
require('./connection/db');

// Routes
const userRoute = require('./Routes/userRoute');
const feesRoute = require('./Routes/feesRoute');
const courseRoute = require('./Routes/courseRoute');
const studentRoute = require('./Routes/studentRoute');
const batchRoute = require('./Routes/BatchRoute');

const authRoutes = require('./Routes/authRouter.js');



initAdmin();
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
// server.js or app.js
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/students', userRoute);
app.use('/api/fees', feesRoute);
app.use('/api', courseRoute);
app.use('/api/students', studentRoute);
app.use('/api/batches', batchRoute);
app.use('/api', authRoutes);





// 🔄 Run admin table and default user initializer
initAdmin();
// Server Start
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
