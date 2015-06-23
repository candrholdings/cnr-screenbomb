!function (config, childProcess, linq) {
    'use strict';

    var CHANNEL_NAME = 'screenbomb',
        slack = new (require('slack-client'))(config.botKey, true, true);

    slack
        .on('loggedIn', function (client, team) {
            console.log('Connected to Slack');
        })
        .on('error', function (err) {
            console.error('Failed to connect to Slack due to "' + err + '"');
        })
        .on('close', function () {
            console.log('Connection closed, retrying');
            slack.reconnect();
        })
        .on('message', function (message) {
            var channel = slack.getChannelByID(message.channel);

            if (!channel || channel.name !== CHANNEL_NAME) {
                return;
            }

            var cp = childProcess.spawn('bin/screenmarquee.exe', [message.text]),
                watchdog = setTimeout(function () {
                    cp.kill();
                }, 10000);

            cp.on('exit', function () {
                clearTimeout(watchdog);
            });

            console.log('Got message "' + message.text + '"');
        })
        .login();
}(
    require('./config'),
    require('child_process'),
    require('async-linq')
);