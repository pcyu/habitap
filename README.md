<h1>Habitap</h1>
<p><a href="https://habitap.herokuapp.com/">Habitap</a> is a responsive full-stack app that allows users to record progress on their habit goals.  Users answer a habit question every day at sign-in, and habitap quantifies their answers into a habit score after fifteen days.  Users can also compete against other users through accruing more points.</p>

## Getting started
### Installing
```
>   git clone https://github.com/pcyu/habitap.git
>   cd habitap
>   npm install
```
### Launching
```
>   npm start
```
Then open [`localhost:3007`](http://localhost:3007) in a browser.

<h2>Technology</h2>
<h3>Front End</h3>
<ul>
  <li>HTML5</li>
  <li>CSS3</li>
  <li>JavaScript</li>
  <li>jQuery</li>
  <li><a href="http://www.chartjs.org/">Chart.js</a>
</ul>
<h3>Back End</h3>
<ul>
  <li>Node.js + Express.js (web server)</li>
  <li>MongoDB (database)</li>
  <li>Agenda.js</li>
  <li>User passwords are encrypted using <a href="https://github.com/dcodeIO/bcrypt.js">bcrypt.js</a>.</li>
  <li><a href="http://passportjs.org/">Passport</a> is used to control endpoints from unauthorized users.</li>
</ul>


<h2>Code Attributions</h2>
<h4><a href="https://codemyui.com/hamburger-menu-full-screen-navigation-menu-pure-css/">Hamburger Menu CSS</a></h4>