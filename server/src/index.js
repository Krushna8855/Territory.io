import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import socketHandler from './ws/socketHandler.js';
import { GRID_WIDTH, GRID_HEIGHT } from '../../shared/constants.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

socketHandler(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Territory server running on port ${PORT}`);
  console.log(`📊 Grid size: ${GRID_WIDTH}x${GRID_HEIGHT}`);
});