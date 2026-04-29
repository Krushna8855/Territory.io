import { GameViewModel } from '../viewmodels/GameViewModel.js';
import { GameModel } from '../models/GameModel.js';
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
        const { username, color, id, password } = data;
        
        let user;
        if (id) {
          user = await GameViewModel.syncUser(id);
          if (user) {
            currentUser = user;
            connectedUsers.set(socket.id, currentUser);
            socket.emit('registered', { user: currentUser, isNew: false });
            io.emit('user_joined', { user: currentUser, onlineCount: connectedUsers.size });
            return;
          }
        }

        let isNew = false;

        if (!username || !password) {
          socket.emit('error', { message: 'Username and password are required.' });
          return;
        }

        const targetColor = color || getRandomColor();
        try {
          const authResult = await GameViewModel.onboardUser(username, targetColor, password);
          user = authResult.user;
          isNew = authResult.isNew;
          currentUser = user;
          connectedUsers.set(socket.id, currentUser);
          
          socket.emit('registered', { user: currentUser, isNew });
          io.emit('user_joined', { user: currentUser, onlineCount: connectedUsers.size });
        } catch(e) {
          throw e;
        }
      } catch (error) {
        if (error.message === 'USERNAME_TAKEN') {
          socket.emit('error', { message: '⚠️ Name already taken! Please choose another or check your password.' });
        } else {
          socket.emit('error', { message: error.message });
        }
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
          
          // AWARD XP
          const { xp, level } = await GameModel.addXP(currentUser.id, 10);
          currentUser.xp = xp;
          currentUser.level = level;

          const hit = { 
            x, y, 
            uid: currentUser.id, 
            name: currentUser.username, 
            color: currentUser.color,
            level: currentUser.level,
            victimId: result.victim ? result.victim.id : null
          };
          io.emit('tile_hit', hit);

          if (Math.random() < LUCK_FACTOR) {
            socket.emit('gift', { type: BONUSES.NUKE });
          }
        } else if (result.error === 'SHIELD_ACTIVE') {
          socket.emit('alert', { msg: '🛡️ THIS TILE IS SHIELDED!', type: 'info' });
        }
      } catch (error) {
        console.error('Claim Error:', error);
      }
    });

    socket.on('use_bomb', async (data) => {
      if (!currentUser) return;
      try {
        const { x, y } = data;
        const result = await GameViewModel.handleNuke(x, y, currentUser.id);
        
        if (result.success) {
          // GLOBAL CINEMATIC ALERT
          io.emit('nuke_impact', {
            x, y,
            uid: currentUser.id,
            name: currentUser.username,
            color: currentUser.color,
            blocks: result.blocks
          });
          
          io.emit('alert', {
            msg: `☢️ NUKE DEPLOYED BY ${currentUser.username.toUpperCase()}!`,
            type: 'danger'
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Nuke failed' });
      }
    });

    socket.on('logout', () => {
      connectedUsers.delete(socket.id);
      currentUser = null;
      io.emit('user_left', { user: currentUser, onlineCount: connectedUsers.size });
    });

    socket.on('disconnect', () => {
      if (currentUser) {
        connectedUsers.delete(socket.id);
        io.emit('user_left', { user: currentUser, onlineCount: connectedUsers.size });
      }
    });
  });
};