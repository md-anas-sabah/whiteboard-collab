# Collaborative Whiteboard Application

A real-time collaborative whiteboard application that allows multiple users to draw together in shared rooms. Users can create or join rooms, draw in real-time, and save/load drawing sessions.

## Features

- Real-time collaborative drawing
- Room-based collaboration with shareable room IDs
- Color picker and stroke size adjustment
- Save and load drawing sessions
- Responsive canvas sizing
- Copy room ID functionality for easy sharing

## Tech Stack

### Frontend
- **React**: UI framework
- **React Router**: For routing and room management
- **Socket.io-client**: Real-time client-server communication
- **TailwindCSS**: Styling and UI components

### Backend
- **Node.js & Express**: Server framework
- **Socket.io**: Real-time bidirectional communication
- **Sequelize**: ORM for database operations
- **PostgreSQL**: Database for storing drawing sessions

## Prerequisites

- Node.js (v14+ recommended)
- PostgreSQL database
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd collaborative-whiteboard
```

2. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:

Create a `.env` file in the backend directory:
```env
PORT=3001
CORS_ORIGIN=http://localhost:3000
DATABASE_URL= ""
```

4. Set up the database:
```bash
cd backend
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
collaborative-whiteboard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.js
│   │   │   └── Whiteboard.js
│   │   └── App.js
│   └── package.json
└── backend/
    ├── models/
    │   └── session.js
    ├── migrations/
    ├── config/
    │   └── config.json
    ├── server.js
    └── package.json
```

## How It Works

1. **Room Creation/Joining**:
   - Users can create a new room or join an existing one using a room ID
   - Room IDs are generated using UUID v4
   - Room ID is displayed and can be copied to clipboard

2. **Real-time Drawing**:
   - Canvas drawing is implemented using HTML5 Canvas API
   - Drawing events are broadcast to all users in the same room using Socket.io
   - Each drawing event contains coordinates, color, and stroke size

3. **Session Management**:
   - Drawings can be saved with a custom session name
   - Sessions are stored in PostgreSQL database as base64 encoded images
   - Saved sessions can be loaded back to continue working

4. **Database Schema**:
```sql
Table: Sessions
- id: Primary Key
- roomId: String
- sessionName: String
- imageData: Text (base64)
- createdAt: Timestamp
- updatedAt: Timestamp
```

## Socket Events

- `join_room`: User joins a specific room
- `draw`: Broadcast drawing events to room
- `save_session`: Save current canvas state
- `load_session`: Load saved canvas state
- `save_success`: Confirmation of successful save
- `save_error`: Error in saving session
- `load_error`: Error in loading session

## Error Handling

- Socket disconnection handling
- Database operation error handling
- Canvas context validation
- Session name validation
- Room joining validation

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Known Limitations

- Maximum canvas size is limited by browser
- Large drawings may take longer to save/load
- Limited to web browsers (no mobile touch support yet)
- Single undo/redo history
