/*
    op-mattermost provides an integration for Mattermost and Open Project.
    Copyright (C) 2020  Girish M

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>

*/

const Message = require('./message');

module.exports = (app, axios) => {

  let hoursLog = 0;

  const opURL = process.env.OP_URL;
  const mmURL = process.env.MM_URL;
  const intURL = process.env.INT_URL;

  const UIActions = require('./uiActions');
  const uiActions = new UIActions(opURL, mmURL, intURL);

  app.get('/', (req, res) => {
    res.send("Hello there! Good to see you here :) We don't know what to show here yet!").status(200);
  });

  app.post('/', (req, res) => {
    const { text, command, token} = req.body;
    if(token === process.env.MATTERMOST_SLASH_TOKEN) {
      console.log("Request Body to / ", JSON.stringify(req.body, null, 2));
      if (text !== "") {
        hoursLog = parseFloat(text);
        if ((isNaN(hoursLog) || hoursLog < 0.0 || hoursLog > 99.9) || command != "/op") {
          res.send("*0.1 hour to 99.9 hours works well here :) Let's try again...* \n `/op [hours]`").status(500);
        }
        else {
          uiActions.showSelProject(req, res, axios, "showTimeLogDlg");
        }
      }
      else {
        uiActions.showMenuButtons(req, res);
      }
    }
    else {
      res.send("Invalid request").status(400);
    }
  });

  app.post('/projSel', (req, res) => {
    console.log("Project dialog submit request: ", req);
    switch (req.body.context.action) {
      case 'showTimeLogDlg':
        uiActions.loadTimeLogDlg(req, res, axios, hoursLog);
        break;
      case 'createWP':
        uiActions.createWP(req, res, axios);
        break;
      default:
        res.send("Invalid action type").status(400);
        break;
    }
  });

  app.post('/logTime', (req, res) => {
    console.log("Work package submit request: ", req);
    uiActions.handleSubmission(req, res, axios, hoursLog);
  });

  app.get('/getLogo', (req, res) => {
    console.log("Logo image request: ", req);
    res.sendFile(__dirname + '/op_logo.png');
  });

  app.post('/getTimeLog', (req, res) => {
    console.log("Request to getTimeLog: ", req);
    uiActions.getTimeLog(req, res, axios);
  });

  app.post('/createWP', (req, res) => {
    console.log("Request to createWP: ", req);
    uiActions.showSelProject(req, res, axios, "createWP");
  });

  app.post('/saveWP', (req, res) => {
    console.log("Work package save request: ", req);
    uiActions.saveWP(req, res, axios);
  })

  app.post('/bye', (req, res) => {
    console.log("Bye request: ", req);
    let msg = new Message(mmURL);
    msg.showMsg(req, res, axios, ":wave:");
  });
}