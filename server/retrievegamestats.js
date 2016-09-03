//Lets require/import the HTTP module
var Promise = require('promise');
var http = require('http');
var xml2json = require('xml2json');
var _ = require('lodash');
var mongo = require('mongodb').MongoClient;
var settings = require('./settings.js');
var e = require('./helper/errorhandler.js');
var fs = require('fs');
//var nflYear = [2009, 2010, 2011, 2012, 2013, 2014, 2015];
//var nflTypes = ['REG', 'POST', 'PRE'];
//var nflWeeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
var nflWeeks = [17];
var nflYears = [2015];
var nflTypes = ['REG'];
var rawDataCol;
var currentResults;

fetchRawNflData(nflYears, nflWeeks, nflTypes);

function fetchRawNflData(years, weeks, types) {
    var obj = JSON.parse(fs.readFileSync('game.json', 'utf8'))["2015091309"];

    mongo.connect(settings.dbConnection, function (err, db) {
        e.checkError(err);

        rawDataCol = db.collection('raw_nfl_data');

        clearGames({year : 2015, week:1, type:'REG'})
            .then(function(){
                return saveGames([obj], 2015, 1, 'REG');
            })
            .catch(function (err) {
                console.log(err);
            })
            .finally(function () {
                console.log("done");
                db.close();
            });
    });
    /*mongo.connect(settings.dbConnection, function (err, db) {
     e.checkError(err);

     rawDataCol = db.collection('raw_nfl_data');

     _.each(years, function (y) {
     _.each(weeks, function (w) {
     _.each(types, function (t) {
     //Get Nfl schedule.
     fetchNflSchedule(y, w, t)
     .then(fetchGames)
     .then(function (result){
        currentResults = result;
         return clearGames({year:y,week:w,type:t});
     })
     .then(function () {
     return saveGames(currentResults, y, w, t);
     })
     .catch(function (err) {
     console.log(err);
     })
     .finally(function () {
     console.log("done");
     db.close();
     });
     });
     });
     });
     });*/

    function mapPlayerStats(rawStats, playerStats, team) {
        _.map(rawStats, function (pos, key) {
            if (key === 'team') {
                return;
            }

            pos = _.map(pos, function (k) {
                k.playerId = Object.getOwnPropertyNames(pos)[0];
                k.team = team;
                return k;
            });

            if (!playerStats[key]) {
                playerStats[key] = pos;
            }
            else {
                playerStats[key] = _.concat(playerStats[key], pos);
            }
        });
    }

    function mapDrives(drives) {
        return _.map(drives, function (d, driveSeq) {
            d.plays = _.map(d.plays, function (play) {
                play.players = _.map(play.players, function (player, key) {
                    player = _.map(player, function (playerSeq) {
                        playerSeq.playerId = key;
                        return playerSeq;
                    });

                    return player[0];
                });
                return play;
            });

            d.driveSequence = driveSeq;

            return drives[driveSeq];
        });
    };

    function saveGames(gamesJson, y, w, t) {
        gamesJson = _.map(gamesJson, function (g) {
            Object.assign(g, {
                year: y,
                week: w,
                type: t,
                homeTeam: g.home.abbr,
                awayTeam: g.away.abbr
            });

            g.playerStats = {};

            //Map Stats
            mapPlayerStats(g.home.stats, g.playerStats, g.homeTeam);
            mapPlayerStats(g.away.stats, g.playerStats, g.awayTeam);
            g.home.stats = g.home.stats['team'];
            g.away.stats = g.away.stats['team'];

            //Map Drives
            g.drives = mapDrives(g.drives);

            //Map Scoring summary
            g.scrsummary = _.map(g.scrsummary, function (s) {
                s.players = _.map(s.players, function (player, key) {
                    var obj = {};
                    obj.playerName = key;
                    obj.playerId = player;

                    return obj;
                });

                return s;
            });

            return g;
        });

        return new Promise(function (accept, reject) {
            rawDataCol.insert(gamesJson, function (err, r) {
                if(err){
                    reject(err);
                }

                console.log("Save result count: " + r.insertedCount);

                accept();
            });
        });
    }
}

function clearGames(opt){
    return new Promise(function(accept, reject){
        rawDataCol.deleteMany(opt, function(err, r){
            if(err){
                reject(err);
            }

            console.log("Deleted result count: " + r.deletedCount);
            accept();
        })
    })
}

function fetchGames(schedule) {
    var promises = [];
    _.each(schedule.ss.gms.g, function (g) {
        //var g = schedule.ss.gms.g[0];
        var gameReq = {
            host: 'www.nfl.com',
            port: 80,
            path: '/liveupdate/game-center/' + g.eid + '/' + g.eid + '_gtd.json',
            method: 'GET'
        };

        console.log('Fetch Game: ' + g.v + '@' + g.h);

        promises.push(new Promise(function (accept, reject) {
            http.request(gameReq, function (res) {
                var gameJson = '';
                res.on('data', function (chunk) {
                    gameJson += chunk;
                });

                res.on('end', function (err) {
                    if (err) {
                        reject(err);
                    }
                    accept(JSON.parse(gameJson)[g.eid]);
                })
            }).end();
        }));
    });

    return Promise.all(promises);
};

function fetchNflSchedule(year, week, type) {
    var schedReq = {
        host: 'www.nfl.com',
        port: 80,
        path: '/ajax/scorestrip?season=' + year + '&seasonType=' + type + '&week=' + week,
        method: 'GET'
    };

    console.log('Get Schedule ' + type + ' week' + week + ' ' + year);

    return new Promise(function (accpet, reject) {
        http.request(schedReq, function (res) {
            var schedule = '';
            res.on('data', function (chunk) {
                schedule += chunk;
            });

            res.on('end', function (err) {
                if (err) {
                    reject(err);
                }
                accpet(xml2json.toJson(schedule, {object: true}));
            })
        }).end();
    });
}


