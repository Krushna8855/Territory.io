import { GameViewModel } from '../viewmodels/GameViewModel.js';
import { GRID_W, GRID_H, RECHARGE_MS, COLORS, LUCK_FACTOR, BONUSES } from '../../../shared/constants.js';

const connectedUsers = new Map();
const userCooldowns = new Map();

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function generateUsername() {
  const adjectives = ['Swift', 'Bold', 'Clever', 'Mighty', 'Silent', 'Rapid', 'Cosmic', 'Neon'];
  const nouns = ['Pixel', 'Ninja', 'Warrior', 'Hunter', 'Master', 'Legend', 'Phoenix', 'Shadow'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`;
}

export default (io) => {
  console.log('🔌 Socket.io initialized (MVVM Mode)');

  io.on('connection', async (socket) => {
    console.log(`📡 New connection attempt: ${socket.id}`);
    let currentUser = null;

    try {
      const state = await GameViewModel.getPlayableState();
      console.log(`📦 Sending initial state: ${Object.keys(state.grid.blocks).length} tiles`);

      socket.emit('initial_state', {
        grid: state.grid,
        leaderboard: state.leaderboard,
        onlineCount: connectedUsers.size
      });
    } catch (error) {
      console.error('WS Sync Error:', error);
    }

    socket.on('register', async (data) => {
      try {
        const { username, color, id } = data;
        
        let user;
        if (id) {
          user = await GameViewModel.syncUser(id);
          if (user) {
            currentUser = user;
            connectedUsers.set(socket.id, currentUser);
            socket.emit('registered', currentUser);
            io.emit('user_joined', { user: currentUser, onlineCount: connectedUsers.size });
            return;
          }
        }

        const targetName = username || generateUsername();
        const targetColor = color || getRandomColor();
        
        user = await GameViewModel.onboardUser(targetName, targetColor);
        currentUser = user;
        connectedUsers.set(socket.id, currentUser);
        
        socket.emit('registered', currentUser);
        io.emit('user_joined', { user: currentUser, onlineCount: connectedUsers.size });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('claim_tile', async (data) => {
      try {
        const { x, y } = data;
        if (!currentUser) return;
        
        const lastCapture = userCooldowns.get(currentUser.id) || 0;
        if (Date.now() - lastCapture < RECHARGE_MS) {
          return socket.emit('error', { message: 'Cooldown active' });
        }

        const result = await GameViewModel.handleClaim(x, y, currentUser.id);
        if (result.success) {
          userCooldowns.set(currentUser.id, Date.now());
          
          const hit = { 
            x, y, 
            uid: currentUser.id, 
            name: currentUser.username, 
            color: currentUser.color,
            victimId: result.victim ? result.victim.id : null // Tell everyone who lost the tile
          };
          io.emit('tile_hit', hit);

          if (result.victim) {
            // Logic for notifying victims could go here
          }

          if (Math.random() < LUCK_FACTOR) {
            socket.emit('gift', { type: BONUSES.NUKE });
          }
        }
      } catch (error) {
        console.error('Claim Error:', error);
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