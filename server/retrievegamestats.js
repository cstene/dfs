//Lets require/import the HTTP module
var http = require('http');
var xml2json = require('xml2json');
var _ = require('lodash');
var mongo = require('mongodb').MongoClient;
var settings = require('./settings.js');
var nflYear = [2009, 2010, 2011, 2012, 2013, 2014, 2015];
var nflWeek = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
var nflType = 'REG';

console.log("Pulling game data");

var schedReq = {
    host: 'www.nfl.com',
    port: 80,
    path: '/ajax/scorestrip?season=2015&seasonType=REG&week=1',
    method: 'GET'
};

console.log(schedReq);

http.request(schedReq, function (result) {
    var schedData = '';
    result.on('data', function (chunk) {
        schedData += chunk;
    });

    result.on('end', function (err) {
        if (err) {
            console.log(err);
            return;
        }

        var xmlOptions = {
            object: true
        };
        var schedDataJson = xml2json.toJson(schedData, xmlOptions);
        console.log(JSON.stringify(schedDataJson));
        getAndSaveGameData(schedDataJson);
    });
}).end();

function getAndSaveGameData(sched) {
    console.log('Year:' + sched.ss.gms.y + ' Week:' + sched.ss.gms.w);
    _.each(sched.ss.gms.g, function (game) {
        console.log(game.v + 'vs' + game.h);
        var gameReq = {
            host: 'www.nfl.com',
            port: 80,
            path: '/liveupdate/game-center/' + game.eid + '/' + game.eid + '_gtd.json',
            method: 'GET'
        };

        http.request(gameReq, function (gameResult) {
            var gameData = '';

            gameResult.on('data', function (chunk) {
                gameData += chunk;
            });

            gameResult.on('end', function (err) {
                if (err) {
                    console.log(err);
                    return;
                }

                saveToMongo(JSON.parse(gameData)[game.eid]);
            })
        }).end()
    })
}

function saveToMongo(statsNode) {
    var url = settings.dbConnection;
    mongo.connect(url, function (err, db) {
        console.log("Connected correctly to server.");
        var statsCollection = db.collection('nfl_game_stats');

        //This is a bit of a mess and needs to be played with. Hacking off scrsummary for now.
        delete statsNode.scrsummary;

        statsCollection.insert(statsNode, function (err, r) {
            if (err) {
                console.log(err);
                db.close();
                return;
            }

            db.close();
        });
    });
}


