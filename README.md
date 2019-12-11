# UAT Signup Application

Deployed version of the website can be seen [here](https://signup-uat.herokuapp.com/events/staff)! Used for anything signups related in 6.UAT Fall 2019.

## Tech Stack

This application uses React for the FE, Javascript for the backend, and a NoSQL DB to store the data (MongoDB).

#### Main Tech

Frontend: [React.js](https://reactjs.org/)
Backend: [Node.js](https://nodejs.org/en/)
Database: [MongoDB](https://www.mongodb.com/).
Database Cloud Host: [MongoDB Atlas](http://cloud.mongodb.com).
Deployed On: [Heroku](https://heroku.com).

#### Extra Libraries

Socket.io using for live updating
Reach Router used for routing.
Mongoose used to create a schema for data in MongoDB and serve as an ORM.

## Accounts Needed

In order to deploy the website you will need access to Tony's Heroku account where the _signup-uat_ currently exists.

In order to access the cloud database to manually edit the stored data you will need access to the Atlas created created for Tony.

Both of these services are **free**. If at any point they no longer are free you will need another alternative to deploying a basic Node server online / hosting a MongoDB database online.

## How to develop

1. Clone the repo
2. run `npm install`
3. Open two terminals.
   a. In one terminal run `npm start`, this starts the Node server.
   b. In the other, run `npm run dev`, this starts the [React Hotloader Dev Server](https://github.com/gaearon/react-hot-loader). At a high level this simply runs a server which re-webpacks your frontend code everytime you change it so you will be able to see updates you make on the fly.
4. Connect to the website on `localhost:5000`.

#### FAQ

_Q: Why can't I see the data that is on the deployed website?_
A: In `app.js` you will see that based off the environment variable `NODE_ENV` you will either connect to a database dedicated to development environments, or a database dedicated for production data. So, when in dev feel free to create/delete any signups or events with impunity.

## How to deploy

1. Install [Heroku Command Line Interface.](https://devcenter.heroku.com/articles/heroku-cli)
2. Set up your repo to have a remote which points to the Heroku remote. Follow instructions in settings up the heroku-cli if that doesn't make sense.
3. Push your changes to master, or a branch of your choosing.
4. Run `git push heroku <your_branch_here>`.

_Note: Heroku automatically sets `NODE_ENV=production` so you do not have to do anything for Heroku to use the prod database. However, if you change to a different provider you will need to make sure NODE_ENV is set to production otherwise the prod deploy will use the dev database, which is very bad._

## Application Documentation

### Frontend

All routing is done in `App.js`. Based off the URL provided a different component will be rendered.

#### Component Description

##### StudentHome

This page simply grabs all the events possible for students to join and lets them click the link to join the corresponding event.

##### EventAdmin

This page is the admin page for staff to create new events.

##### EventViewer

This page is the meat and potatoes for this application. It has two `props`: `eventId` and `status`. Using socket.io it will grab all the event details for the event with id `eventId` and if your `status` is set to `"staff"` then the staff version of the page is rendered.

##### Signup

This component is mostly stateless and is used by `EventViewer` to render an individual signup.

### Backend

The vast majority of the server code is in `app.js`. The rest of the server code is the database schemas which is under the `server/models` path.

You shouldn't have to touch the backend much unless you want to make a new socket endpoint for the frontend to hit, or add a new database model.

To add a new socket endpoint look for the line in `app.js` that is like `io.on("connect", socket ...`. You can the structure of how any of the other socket handlers are written.

To add a DB model you may need to read up a little on how Mongoose works, but you should be able to copy how any of the other models are implemented.

## Areas for Improvement

Clean up the server code (remove `api.js` which is unneeded), etc.

Add the ability to hide an event from students. This will need you to add a `visible` parameter to the Event model, and then in `StudentHome` you should only render the events which have `visible=true`. Then in `EventAdmin` add an option to toggle the visbility of events.

## Further Questions?

Feel feel to forward any questions to me on Facebook or via email (ajsipser@gmail.com).
