!function (config, app, BrowserWindow, Promise, Slack) {
  var windows = [];

  // Report crashes to our server.
  // require('crash-reporter').start();

  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the javascript object is GCed.

  // Quit when all windows are closed.
  // app.on('window-all-closed', function() {
  //     if (process.platform != 'darwin') {
  //         app.quit();
  //     }
  // });

  // This method will be called when Electron has done everything
  // initialization and ready for creating browser windows.
  app.on('ready', function() {
    main();
  }).on('will-quit', function (evt) {
    evt.preventDefault();
  });

  function createSlackClient() {
    return new Promise((resolve, reject) => {
      const
        webClient = new Slack.WebClient(config.SLACK_API_KEY),
        rtm = new Slack.RtmClient(webClient, {
          maxReconnectionAttempts: Infinity
        });

      rtm
        .on('connecting', () => console.info('Connecting to Slack RTM API'))
        .on('authenticated', () => console.info('Got RTM API URL'))
        .on('failed_auth', () => console.warn('Failed to authenticate'))
        .on('opening_ws', () => console.info('Connecting Web Socket'))
        .on('opened_ws', () => console.info('Web Socket connected'))
        .on('open', () => resolve({ webClient, rtm }))
        .on('attempting_reconn', () => console.warn('Web Socket closed, reconnecting'))
        .start();
    });
  }

  function main() {
    createSlackClient()
      .then(slack => {
        const
          dataStore = slack.rtm.dataStore;

        slack.rtm.on('message', message => {
          if (message.channel[0] !== 'D') { return; }

          const
            user = dataStore.getUserById(message.user),
            profile = user && user.profile;

          showMessage(message.text, profile ? profile.image192 : '');
        });
      });
  }

  function showMessage(message, avatar) {
    var workArea = require('screen').getPrimaryDisplay().workArea;

    // Create the browser window.
    var mainWindow = new BrowserWindow({
      width: 1,
      height: 1,
      x: 0,
      y: 0,
      transparent: true,
      frame: false,
      'always-on-top': true,
      'skip-taskbar': true
    });

    windows.push(mainWindow);

    var watchdog = setTimeout(function () {
      mainWindow.destroy();
    }, 60000);

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // Open the devtools.
    // mainWindow.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      clearTimeout(watchdog);

      var index = windows.indexOf(mainWindow);

      ~index && windows.splice(index, 1);
    });

    mainWindow.webContents.on('did-finish-load', function () {
      setTimeout(function () {
        mainWindow.webContents.send('message', message, avatar);
      }, 500);

      setTimeout(function () {
        mainWindow.setBounds({
          width: workArea.width,
          height: config.BOMB_HEIGHT,
          x: 0,
          y: ~~(Math.random() * (workArea.height - config.BOMB_HEIGHT)),
        });
      }, 100);
    });
  }
}(
  require('./config'),
  require('app'),
  require('browser-window'),
  require('bluebird'),
  require('slack-client')
);
