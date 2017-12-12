exports.navs = [
    {name: 'Home', path: '/', type: ['public']},
    {name: 'Register', path: '/register', type: ['public']},
    {name: 'Login', path: '/auth/login', type: ['public']},
    {name: 'Habit History', path: '/users/history', type: ['private']},
    {name: 'New Habit', path: '/users/new', type: ['private']},
    {name: 'Update Habit', path: '/users/update', type: ['private']},
    {name: 'Logout', path: '/auth/logout', type: ['private']}
];

exports.timer = (startDate, daysActive) => {
  const msDay = 86400000;
  const msHour = 3600000;
  const offset = new Date().getTimezoneOffset()/60;
  const msOffset = new Date().getTimezoneOffset() * 60000;

  // Today's start date in milliseconds
  let start = new Date();
  start.setHours(0 - offset,0,0,0);
  let msStart = new Date(start).getTime();

  // Right now in milliseconds
  let msNow = Date.now() - msOffset;

  // Today's end date in milliseconds
  let end = new Date();
  end.setHours(23 - offset,59,59,999);
  let msEnd = new Date(end).getTime();

  const remainingTime = (ms) => {
    let hours = Math.floor((ms/(1000 * 60 * 60)) % 24);
    let minutes = Math.floor((ms/(1000*60)) % 60);
    let seconds = Math.floor((ms/1000) % 60);
    return {
      hours: hours,
      goalBegin: msEnd,  // goalBegin and goalEnd have values that are used only when a habit is first created
      goalEnd: msStart,  // this makes the habit tracking duration equal to 15 days
      minutes: minutes,
      seconds: seconds,
    }
  }

  return remainingTime(msEnd - msNow);
};
