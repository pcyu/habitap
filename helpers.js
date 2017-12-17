exports.navs = [
    {name: 'Home', path: '/', type: ['public']},
    {name: 'Register', path: '/register', type: ['public']},
    {name: 'Login', path: '/auth/login', type: ['public']},
    {name: 'Habit History', path: '/users/history', type: ['private']},
    {name: 'New Habit', path: '/users/new', type: ['private']},
    {name: 'Update Habit', path: '/users/update', type: ['private']},
    {name: 'Logout', path: '/auth/logout', type: ['private']}
];

exports.timer = (create=null) => {
  const msDay = 86400000;
  const msHour = 3600000;
  const offset = new Date().getTimezoneOffset()/60;  // we may not need to account for offset
  const msOffset = new Date().getTimezoneOffset() * 60000;

  // Today's start date in milliseconds (local time)
  let start = new Date();
  start.setHours(0,0,0,0);
  let msStart = new Date(start).getTime();

  // Right now in milliseconds (local time)
  let msNow = Date.now();

  // Today's end date in milliseconds (local time)
  let end = new Date();
  end.setHours(23,59,59,999);
  let msEnd = new Date(end).getTime();

  const timeTracker = (ms) => {
    let hours = Math.floor((ms/(1000 * 60 * 60)) % 24);
    let minutes = Math.floor((ms/(1000*60)) % 60);
    let seconds = Math.floor((ms/1000) % 60);
    if(create) {
      return {
        // goalBegin: msStart + msDay,
        goalBegin: msStart,
        goalEnd: msEnd + (msDay * 15),  // this makes the habit tracking duration equal to 15 days
      }
    }
    return {
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    }
  }

  return timeTracker(msEnd - msNow);
};
