exports.navs = [
    {name: 'Home', path: '/', type: ['public']},
    {name: 'Register', path: '/register', type: ['public']},
    {name: 'Login', path: '/auth/login', type: ['public']},
    {name: 'Habit History', path: '/users/history', type: ['private']},
    {name: 'New Habit', path: '/users/new', type: ['private']},
    {name: 'Update Habit', path: '/users/update', type: ['private']},
    {name: 'Logout', path: '/auth/logout', type: ['private']}
]   