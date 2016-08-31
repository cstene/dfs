//Lets require/import the HTTP module
var Promise = require('promise');
var http = require('http');
var xml2json = require('xml2json');
var _ = require('lodash');
var mongo = require('mongodb').MongoClient;
var settings = require('./settings.js');
var e = require('./helper/errorhandler.js');
//var nflYear = [2009, 2010, 2011, 2012, 2013, 2014, 2015];
//var nflTypes = ['REG', 'POST', 'PRE'];
//var nflWeeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
var nflWeeks = [17];
var nflYears = [2015];
var nflTypes = ['REG'];
var rawDataCol;

fetchRawNflData(nflYears, nflWeeks, nflTypes);

function fetchRawNflData(years, weeks, types) {
    mongo.connect(settings.dbConnection, function (err, db) {
        e.checkError(err);

        rawDataCol = db.collection('raw_nfl_data');

        _.each(years, function (y) {
            _.each(weeks, function (w) {
                _.each(types, function (t) {
                    //Get Nfl schedule.
                    fetchNflSchedule(y, w, t)
                        .then(fetchGames)
                        .then(saveGames)
                        .catch(function(err){
                            console.log(err);
                        })
                        .finally(function () {
                            console.log("done");
                            db.close();
                        });
                });
            });
        });
    });

    function saveGames(gamesJson) {
        var gamesJson = _.map(gamesJson, function (g) {
            g.scrsummary = _.map(g.scrsummary, function (s) {
                s.players = _.invert(s.players);
                return s;
            });
            return g;
        });

        return new Promise(function (accept, reject) {
            rawDataCol.insert(gamesJson, function (err, r) {
                reject(err);

                console.log("Save result count: " + r.insertedCount);

                accept();
            });
        });
    }
}

function fetchGames(schedule) {
    var promises = [];
    _.each(schedule.ss.gms.g, function (g) {
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
}

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


