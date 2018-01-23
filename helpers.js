exports.navs = [
  {name: 'Demo', path: '/', type: ['public'], id: 'demo'},
  {name: 'Register', path: '/auth/register', type: ['public'], id: 'register'},
  {name: 'Login', path: '/auth/login', type: ['public'], id: 'login'},
  {name: 'Dashboard', path: '/users/dashboard', type: ['private'], id: 'dashboard'},
  {name: 'New Habit', path: '/users/new', type: ['private'], id: 'new'},
  {name: 'History', path: '/users/history', type: ['private'], id: 'history'},
  {name: 'Leaderboard', path: '/users/leaderboard', type: ['private'], id: 'leaderboard'},
  {name: 'Logout', path: '/auth/logout', type: ['private'], id: 'logout'}
];