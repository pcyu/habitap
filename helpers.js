exports.navs = [
  {name: 'Home', path: '/', type: ['public']},
  {name: 'Register', path: '/auth/register', type: ['public']},
  {name: 'Login', path: '/auth/login', type: ['public']},
  {name: 'Dashboard', path: '/users/dashboard', type: ['private']},
  {name: 'New Habit', path: '/users/new', type: ['private']},
  {name: 'History', path: '/users/history', type: ['private']},
  {name: 'Leaderboard', path: '/users/leaderboard', type: ['private']},
  {name: 'Logout', path: '/auth/logout', type: ['private']}
];