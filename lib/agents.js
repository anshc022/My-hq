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

// Room definitions — 2 rooms: workspace + cabin lounge
export const ROOMS = {
  workspace: {
    x: 0.02, y: 0.03, w: 0.58, h: 0.94,
    label: 'WORKSPACE', bg: 'rgba(12,14,35,0.6)', border: '#3344aa',
    accent: '#4a6aff', icon: '💻',
  },
  cabin: {
    x: 0.62, y: 0.03, w: 0.36, h: 0.94,
    label: 'CABIN', bg: 'rgba(28,18,12,0.55)', border: '#8a5a2a',
    accent: '#d4915a', icon: '🏠',
  },
};

// Desk positions per agent (percentage of canvas) — inside workspace
export const DESK_POSITIONS = {
  echo:  { x: 0.12, y: 0.22 },
  pixel: { x: 0.32, y: 0.22 },
  dash:  { x: 0.50, y: 0.22 },
  stack: { x: 0.12, y: 0.50 },
  probe: { x: 0.32, y: 0.50 },
  ship:  { x: 0.50, y: 0.50 },
  pulse: { x: 0.32, y: 0.78 },
};

// Room center positions for when agents move rooms
export const ROOM_POSITIONS = {
  workspace: null, // use DESK_POSITIONS
  desk:      null, // alias
  cabin:     { x: 0.80, y: 0.50 },
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