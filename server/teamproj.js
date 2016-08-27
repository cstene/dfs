//Get games for this week.
var _ = require('lodash');
var settings = require('./settings.js');
var mongo = require('mongodb').MongoClient;
var nflYear = 2016;
var nflWeek = 1;
var nodeId = {'nflYear':nflYear, 'nflWeek':nflWeek};

mongo.connect(settings.dbConnection, function (err, db) {
    var gamesCollection = db.collection('games');
    var teamProjCollection = db.collection('team_proj');
    var teamProjNodes = [];

    console.log('Remove previous team projections');
    teamProjCollection.deleteMany(nodeId, function(err, r){
        console.log('Deleted team_proj: ' + r.deletedCount);
        fetchGames();
    });

    function fetchGames(){
        console.log('Fetch games');
        var gamesNode = gamesCollection.find(nodeId);
        gamesNode.each(function(err, node) {
            if (node) {
                _.each(node.games, function (g) {
                    var homeProj = genTeamProj(true, g);
                    var awayProj = genTeamProj(false, g);

                    teamProjNodes.push(homeProj);
                    teamProjNodes.push(awayProj);
                });
            }
            else {
                saveGameProj(teamProjNodes);
            }
        });
    };

    function saveGameProj(nodes){
      teamProjCollection.insertMany(nodes, function(err, r){
          console.log('Inserted team_proj: ' + r.insertedCount);
          db.close();
      });
    };
});

function genTeamProj(isHome, game){
    return {
        "nflYear": nflYear,
        "nflWeek": nflWeek,
        "team": isHome ? game.homeTeam: game.awayTeam,
        "spread" : isHome ? game.homeSpread : game.homeSpread * -1,
        "totalPoints": game.vegasTotalPoints,
        "score" : isHome ? game.vegasHomeScore : game.vegasAwayScore,
        "isHome" : isHome,
        "opp" : isHome ? game.awayTeam : game.homeTeam,
        "gameUtc" : game.gameDateTimeUtc,
        "passTdPct8" : 0.60,
        "passTdPct16" : 0.58,
        "runTdPct8" : 0.35,
        "runTdPct16" : 0.37,
        "wrCatchTdPct8" : 0.8,
        "teCatchTdPct8" : 0.1,
        "rbCatchTdPct8" : 0.1,
        "passYardsPer8" : 250,
        "runYardsPer8" : 75,
        "oppIntPer8" : 1,
        "oppForcedFumblePer8" : 1,
        "oppPassYardsAllowed8": 200,
        "oppRunYardsAllowed8": 50
    }
};

/*Team projection
 {
 "nflYear": 2016,
 "nflWeek": 1,
 "team": "den",
 "spread" : 2,
 "totalPoints": 44,
 "score" : 21,
 "isHome" : true,
 "opp" : "car",
 "gameUtc" : "2016-09-11 17:00",
 "passTdPct8" : 0.60,
 "passTdPct16" : 0.58,
 "runTdPct8" : 0.35,
 "runTdPct16" : 0.37,
 "wrCatchTdPct8" : 0.8,
 "teCatchTdPct8" : 0.1,
 "rbCatchTdPct8" : 0.1,
 "passYardsPer8" : 250,
 "runYardsPer8" : 75,
 "oppIntPer8" : 1,
 "oppForcedFumblePer8" : 1,
 "oppPassYardsAllowed8": 200,
 "oppRunYardsAllowed8": 50
 }
 */