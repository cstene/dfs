//Lets require/import the HTTP module
var http = require('http');
var xml2json = require('xml2json');
var _ = require('lodash');
var Promise = require('promise');
var mongo = require('mongodb').MongoClient;
var settings = require('./settings.js');
var e = require('./helper/errorhandler.js');
var fs = require('fs');
//var nflYear = [2009, 2010, 2011, 2012, 2013, 2014, 2015];
//var nflTypes = ['REG', 'POST', 'PRE'];
//var nflWeeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
var nflWeeks = [8,9,10,11,12,13];
var nflYears = [2015];
var nflTypes = ['REG'];
var rawDataCol;
var currentResults;

fetchRawNflData(nflYears, nflWeeks, nflTypes);

function fetchRawNflData(years, weeks, types) {
    mongo.connect(settings.dbConnection, function (err, db) {
        e.checkError(err);

        rawDataCol = db.collection('raw_nfl_data');

        retrieveGameStats(nflYears, nflWeeks, nflTypes)
            .then(function () {
                console.log("Completed.");
                db.close();
            });
    });

    function retrieveGameStats(year, week, type) {
        var promises = [];

        _.each(year, function (y) {
            _.each(week, function (w) {
                _.each(type, function (t) {
                    var data;
                    console.log("Week " + w + " " + y + " " + t);
                    promises.push(new Promise(function (resolve, reject) {
                        fetchNflSchedule(y, w, t)
                            .then(function (schedule) {
                                return fetchGames(schedule);
                            })
                            .then(function (gameData) {
                                data = gameData;
                                return clearGames({year: y, week: w, type: t});
                            })
                            .then(function () {
                                return saveGames(data, y, w, t);
                            })
                            .then(function () {
                                resolve();
                            })
                            .catch(function (err) {
                                console.log("Failed to save " + "Week " + w + " " + y + " " + t);
                                console.log("Error: " + err);
                                reject(err);
                            })
                    }));
                })
            })
        });

        return Promise.all(promises);
    }

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

        return new Promise(function (resolve, reject) {
            rawDataCol.insert(gamesJson, function (err, r) {
                if (err) {
                    reject(err);
                }

                console.log("Save result count: " + r.insertedCount);

                resolve();
            });
        });
    }

    function clearGames(opt) {
        return new Promise(function (resolve, reject) {
            rawDataCol.deleteMany(opt, function (err, r) {
                if (err) {
                    reject(err);
                }

                console.log("Deleted result count: " + r.deletedCount);
                resolve();
            });
        });
    }

//Fetch all the games within a provided schedule. The schedule will represent a single NFL week.
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

            promises.push(new Promise(function (resolve, reject) {
                http.request(gameReq, function (res) {
                    var gameJson = '';
                    res.on('data', function (chunk) {
                        gameJson += chunk;
                    });

                    res.on('end', function (err) {
                        if (err) {
                            reject(err);
                        }
                        resolve(JSON.parse(gameJson)[g.eid]);
                    })
                }).end();
            }));
        });

        return Promise.all(promises);
    };

//Fetch the year/week schedule so we can loop through the eid's to fetch the game json.
    function fetchNflSchedule(year, week, type) {
        var schedReq = {
            host: 'www.nfl.com',
            port: 80,
            path: '/ajax/scorestrip?season=' + year + '&seasonType=' + type + '&week=' + week,
            method: 'GET'
        };

        console.log('Get Schedule ' + type + ' week' + week + ' ' + year);

        return new Promise(function (resolve, reject) {
            http.request(schedReq, function (res) {
                var schedule = '';
                res.on('data', function (chunk) {
                    schedule += chunk;
                });

                res.on('end', function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve(xml2json.toJson(schedule, {object: true}));
                });
            }).end();
        });
    };
};