import * as gridStore from '../store/gridStore.js';
import { GRID_WIDTH, GRID_HEIGHT, CAPTURE_COOLDOWN, USER_COLORS, POWERUP_CHANCE, POWERUP_TYPES } from '../../../shared/constants.js';

const connectedUsers = new Map();
const userCooldowns = new Map();

function getRandomColor() {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

function generateUsername() {
  const adjectives = ['Swift', 'Bold', 'Clever', 'Mighty', 'Silent', 'Rapid', 'Cosmic', 'Neon'];
  const nouns = ['Pixel', 'Ninja', 'Warrior', 'Hunter', 'Master', 'Legend', 'Phoenix', 'Shadow'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`;
}

export default (io) => {
  io.on('connection', async (socket) => {
    let currentUser = null;

    try {
      const state = await gridStore.getGridState();
      socket.emit('initial_state', {
        ...state,
        connectedCount: connectedUsers.size
      });
    } catch (error) {
      console.error('WS Error:', error);
    }

    socket.on('register', async (data) => {
      try {
        const { username, color, id } = data;
        
        let user;
        if (id) {
          // Attempt to resume session
          user = await gridStore.findUserById(id);
          if (user) {
            currentUser = user;
            connectedUsers.set(socket.id, currentUser);
            socket.emit('registered', currentUser);
            io.emit('user_joined', { user: currentUser, onlineCount: connectedUsers.size });
            return;
          }
        }

        // New registration attempt
        const targetName = username || generateUsername();
        const targetColor = color || getRandomColor();
        
        const existingUser = await gridStore.findUserByUsername(targetName);
        if (existingUser) {
          return socket.emit('error', { message: 'Username already taken! Choose another.' });
        }
        
        user = await gridStore.createUser(targetName, targetColor);
        currentUser = user;
        connectedUsers.set(socket.id, currentUser);
        
        socket.emit('registered', currentUser);
        io.emit('user_joined', { user: currentUser, onlineCount: connectedUsers.size });
      } catch (error) {
        socket.emit('error', { message: 'Registration failed' });
      }
    });

    socket.on('capture_block', async (data) => {
      if (!currentUser) return socket.emit('error', { message: 'Not registered' });
      
      const { x, y } = data;
      if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
        return socket.emit('error', { message: 'Invalid coordinates' });
      }

      const lastCapture = userCooldowns.get(currentUser.id) || 0;
      if (Date.now() - lastCapture < CAPTURE_COOLDOWN) {
        return socket.emit('error', { message: 'Cooldown active' });
      }

      try {
        const result = await gridStore.captureBlock(x, y, currentUser.id);
        if (result.success) {
          userCooldowns.set(currentUser.id, Date.now());
          
          // Random Powerup Drop
          if (Math.random() < POWERUP_CHANCE) {
            socket.emit('powerup_received', { type: POWERUP_TYPES.BOMB });
          }

          io.emit('block_captured', {
            x, y, userId: currentUser.id, username: currentUser.username, color: currentUser.color
          });
        } else {
          socket.emit('error', { message: result.message });
        }
      } catch (error) {
        socket.emit('error', { message: 'Capture failed' });
      }
    });

    socket.on('use_bomb', async (data) => {
      if (!currentUser) return;
      const { x, y } = data;

      try {
        const result = await gridStore.captureArea(x, y, 1, currentUser.id);
        if (result.success) {
          io.emit('area_captured', {
            blocks: result.capturedBlocks,
            userId: currentUser.id,
            username: currentUser.username,
            color: currentUser.color
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Bomb deployment failed' });
      }
    });

    socket.on('disconnect', () => {
      if (currentUser) {
        connectedUsers.delete(socket.id);
        io.emit('user_left', { user: currentUser, onlineCount: connectedUsers.size });
      }
    });
  });
};