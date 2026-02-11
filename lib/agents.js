// Agent definitions — Dev Team
export const AGENTS = {
  echo:  { color: '#4A90D9', icon: '⚙️', label: 'Echo',  role: 'Tech Lead',  avatar: '👨‍💻' },
  pixel: { color: '#27AE60', icon: '🎨', label: 'Pixel', role: 'UI/UX',      avatar: '🖌️' },
  dash:  { color: '#8E44AD', icon: '🖥️', label: 'Dash',  role: 'Frontend',   avatar: '⚛️' },
  stack: { color: '#F1C40F', icon: '🧠', label: 'Stack', role: 'Backend',    avatar: '🗄️' },
  probe: { color: '#E74C3C', icon: '🔍', label: 'Probe', role: 'QA/Tester',  avatar: '🔬' },
  ship:  { color: '#E67E22', icon: '🚀', label: 'Ship',  role: 'DevOps',     avatar: '🚢' },
  pulse: { color: '#00FF88', icon: '💚', label: 'Pulse', role: 'Node Health', avatar: '🖥️' },
};

// Room definitions (percentage-based positions on canvas)
export const ROOMS = {
  desk: {
    x: 0.02, y: 0.02, w: 0.56, h: 0.55,
    label: 'DEV FLOOR', bg: 'rgba(15,18,45,0.6)', border: '#3344aa',
    accent: '#4a6aff', icon: '💻',
  },
  meeting: {
    x: 0.02, y: 0.6, w: 0.45, h: 0.38,
    label: 'STANDUP', bg: 'rgba(12,35,35,0.5)', border: '#1a8a7a',
    accent: '#00ddc4', icon: '🗣️',
  },
  research: {
    x: 0.6, y: 0.02, w: 0.38, h: 0.45,
    label: 'CODE LAB', bg: 'rgba(35,12,45,0.5)', border: '#7a2aaa',
    accent: '#b44aff', icon: '🧪',
  },
  board: {
    x: 0.5, y: 0.6, w: 0.48, h: 0.38,
    label: 'SPRINT BOARD', bg: 'rgba(20,15,10,0.5)', border: '#8a6a2a',
    accent: '#ffaa33', icon: '📋',
  },
};

// Desk positions per agent (percentage of canvas)
export const DESK_POSITIONS = {
  echo:  { x: 0.12, y: 0.25 },
  pixel: { x: 0.28, y: 0.25 },
  dash:  { x: 0.44, y: 0.25 },
  stack: { x: 0.12, y: 0.48 },
  probe: { x: 0.28, y: 0.48 },
  ship:  { x: 0.44, y: 0.48 },
  pulse: { x: 0.78, y: 0.78 },
};

// Room center positions for when agents move rooms
export const ROOM_POSITIONS = {
  desk:     null, // use DESK_POSITIONS
  meeting:  { x: 0.24, y: 0.78 },
  research: { x: 0.78, y: 0.25 },
  board:    { x: 0.74, y: 0.78 },
};

// Status visual mapping
export const STATUS_VISUALS = {
  idle:        { glow: '#666666' },
  working:     { glow: '#2ecc71' },
  thinking:    { glow: '#f1c40f' },
  talking:     { glow: '#00bcd4' },
  posting:     { glow: '#e67e22' },
  researching: { glow: '#9b59b6' },
  error:       { glow: '#e74c3c' },
  sleeping:    { glow: '#555555' },
};