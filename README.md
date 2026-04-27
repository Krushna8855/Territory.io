# 🏴 Territory.io

A high-performance, real-time multiplayer grid conquest game. Claim territory, deploy power-ups, and dominate the global leaderboard in this premium Pixel War experience.

![Territory.io Preview](https://via.placeholder.com/1200x600/1a1b26/ffffff?text=Territory.io+Real-time+Multiplayer+Grid+Warfare)

## 🚀 Key Features

-   **Real-time Synchronization**: Powered by **Socket.io** for sub-100ms updates across all clients.
-   **Persistent World**: Every block capture is recorded in a **PostgreSQL** database, ensuring the war never resets unless you want it to.
-   **Identity System**: Players can choose their own handle and signature hex color, which is remembered across sessions.
-   **Advanced Gameplay**:
    -   **Area Conquest**: Random power-up drops like the **BOMB** allow players to capture 3x3 areas instantly.
    -   **Cooldown System**: Prevents spamming and adds strategic depth to every move.
-   **Live Activity Feed**: A scrolling log of all capture events, keeping you informed of your rivals' moves.
-   **Interactive Leaderboard**: Real-time ranking of the top territory owners.
-   **Premium UI**: A sleek, dark-mode design featuring glassmorphism, smooth animations, and Lucide icons.

## 🛠️ Tech Stack

-   **Frontend**: React 18, Vite, Lucide React (Icons), Socket.io-client.
-   **Backend**: Node.js, Express, Socket.io.
-   **Database**: PostgreSQL (Data persistence and atomic transactions).
-   **State Management**: React Context API for global game state.
-   **Styling**: Vanilla CSS with modern Flex/Grid and CSS Variables.

## 📡 API & WebSocket Specification

### REST API
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/state` | `GET` | Fetches the current state of the entire grid. |
| `/api/leaderboard` | `GET` | Returns the top 20 players by block count. |
| `/api/stats` | `GET` | Returns global game stats (total blocks, active users). |

### WebSocket Events (Client -> Server)
| Event | Payload | Description |
| :--- | :--- | :--- |
| `register` | `{ username, color, id? }` | Join the game or resume a session. |
| `capture_block` | `{ x, y }` | Attempt to capture a single pixel. |
| `use_bomb` | `{ x, y }` | Deploy a 3x3 area capture power-up. |

### WebSocket Events (Server -> Client)
| Event | Payload | Description |
| :--- | :--- | :--- |
| `initial_state` | `{ blocks, connectedCount }` | Sent on connection to initialize the grid. |
| `block_captured` | `{ x, y, username, color, userId }` | Broadcasted when any block is captured. |
| `area_captured` | `{ blocks[], username, color }` | Broadcasted when a bomb is used. |
| `powerup_received` | `{ type: "BOMB" }` | Sent to a specific user when they find a power-up. |
| `user_joined/left` | `{ onlineCount }` | Updates the player count UI. |

## 🏗️ Project Structure

```text
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Modular UI (Grid, Feed, Topbar, etc.)
│   │   ├── context/            # Global GameContext and WebSocket logic
│   │   ├── hooks/              # Reusable game logic
│   │   └── index.css           # Design system and global styles
│
├── server/                     # Node.js backend
│   ├── src/
│   │   ├── routes/             # Express REST endpoints
│   │   ├── ws/                 # Socket.io event handlers
│   │   ├── store/              # PostgreSQL data layer (Atomic transactions)
│   │   └── index.js            # Server entry point
│
├── shared/                     # Configuration shared between client & server
│   └── constants.js            # Grid size, cooldowns, and game rules
```

## 🚥 Getting Started

### 1. Database Setup
1.  Ensure **PostgreSQL** is installed and running.
2.  Create a database named `pixelwars`.
3.  Run the schema in `database.sql`:
    ```bash
    psql -U postgres -d pixelwars -f database.sql
    ```

### 2. Backend Setup
1.  Navigate to the server directory: `cd server`
2.  Install dependencies: `npm install`
3.  Create a `.env` file based on `.env.example`:
    ```env
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=pixelwars
    DB_USER=postgres
    DB_PASSWORD=your_password
    ```
4.  Start the server: `npm run dev`

### 3. Frontend Setup
1.  Navigate to the client directory: `cd client`
2.  Install dependencies: `npm install`
3.  Start the development server: `npm run dev`
4.  Open `http://localhost:5173` in your browser.

## 🐳 Docker Deployment (The "Single Unit" Method)

You can run the entire stack (Frontend, Backend, and Database) as a single unit using Docker Compose.

1.  **Prerequisites**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2.  **Start the app**:
    ```bash
    docker-compose up --build
    ```
3.  **Access the app**:
    - Frontend: `http://localhost`
    - Backend API: `http://localhost:3001`
    - Database: `localhost:5432`

The database will be automatically initialized with the schema in `database.sql`.

## 🛡️ Security & Performance
-   **Atomic Transactions**: Block captures use SQL transactions to prevent race conditions in high-concurrency scenarios.
-   **Cooldown Logic**: Server-side validation of capture timestamps to prevent botting.
-   **Optimized Rendering**: The grid uses CSS Grid and memoized components to ensure smooth performance even with large maps.

---
Created by **Krushna** with ❤️
