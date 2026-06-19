require('dotenv').config(); // loads variables from .env into process.env (e.g. MONGO_URI, JWT_SECRET) before anything else uses them

const express = require('express'); // web framework: gives us routing, middleware pipeline, req/res helpers
const cors = require('cors'); // middleware that adds CORS headers so browsers on other origins (e.g. the frontend dev server) can call this API

const connectDB = require('./config/db'); // our function that opens the MongoDB connection (config/db.js)
const eventRoutes = require('./routes/eventRoutes'); // router containing all /api/events/* endpoints

const app = express(); // creates the Express application instance — this is the object we attach middleware/routes to

app.use(cors()); // applies CORS to every incoming request, before any route handler runs
app.use(express.json()); // parses incoming JSON request bodies into req.body — without this, req.body would be undefined

app.use('/api/events', eventRoutes); // mounts eventRoutes under the /api/events prefix, so router.get('/:id') becomes GET /api/events/:id

app.use((err, req, res, next) => { // global error handler — Express recognizes it by its 4 arguments and routes here whenever next(err) is called
  console.error(err); // log the full error server-side for debugging
  res.status(500).json({ message: 'Internal server error' }); // send a generic, safe message to the client (never leak err.stack to callers)
});

const PORT = process.env.PORT || 5000; // use the configured port, or fall back to 5000 if PORT isn't set in .env

connectDB() // open the database connection first...
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // ...and only start accepting HTTP requests once the DB is ready
  })
  .catch((err) => {
    console.error('Failed to connect to DB', err); // if the DB connection fails, log why and stop — don't run a server that can't reach its data
    process.exit(1); // exit with a non-zero code so process managers (e.g. nodemon, Docker, PM2) know startup failed
  });
