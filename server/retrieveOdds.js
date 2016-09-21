//Lets require/import the HTTP module
var http = require('http');
var xml2json = require('xml2json');
var _ = require('lodash');
var mongo = require('mongodb').MongoClient;
var nameres = require('./helper/nameresolver.js');
var settings = require('./settings.js');
var nflYear = 2016;
var nflWeek = 2;

console.log("Pulling odds data");
console.log("nfl Year: " + nflYear);
console.log("nfl Week: " + nflWeek);

var options = {
    host: 'xml.pinnaclesports.com',
    port: 80,
    path : '/pinnaclefeed.aspx?sporttype=Football&sportsubtype=nfl&contest=no',
    method : 'GET'
};

console.log(options);

http.request(options, function(result){
    var oddsData = '';
    result.on('data', function(chunk){
        oddsData += chunk;
    });

    result.on('end', function(err){
        var xmlOptions = {
            object:true
        };
        var json = xml2json.toJson(oddsData, xmlOptions);
        var gameNode = mapToGameNode(json);
        saveToMongo(gameNode);
        //console.log(JSON.stringify(gameNode));
    });
}).end();

function saveToMongo(games){
    var url = settings.dbConnection;
    mongo.connect(url, function(err, db) {
        console.log("Connected correctly to server.");
        var gamesCollection = db.collection('games');

        gamesCollection.deleteMany({nflYear:games.nflYear, nflWeek:games.nflWeek},function(err,r){
            console.log("Remove games: " + r.deletedCount);
            gamesCollection.insert(games, function(err, r){
                console.log("Games saved");
                db.close();
            });
        });
    });
}

function mapToGameNode(odds){
    /*{
     "nflYear": 2016,
     "nflWeek": 1,
     "games": [
     {
     "homeTeam": "Denver Broncos",
     "awayTeam": "Carolina Panther",
     "homeSpread": 2,
     "vegasTotalPoints": 44,
     "vegasHomeScore": 23,
     "vegasAwayScore": 21,
     "gameDateTimeUtc": "2016-09-11 17:00"
     }
     ]
     }
     */

    console.log("Mapping to game node...");

    var games = _.map(odds.pinnacle_line_feed.events.event, function(g){
        var period = (g.periods.period && Array.isArray(g.periods.period)) ? g.periods.period[0] : g.periods.period;

        if(!period){
            // The game is off.
            return {
                gameDateTimeUtc: new Date(g.event_datetimeGMT),
                //Assuming first participant is always away and second is always home, this might not be true.
                awayTeam: nameres.resolveTeamName(g.participants.participant[0].participant_name),
                homeTeam: nameres.resolveTeamName(g.participants.participant[1].participant_name),
                homeSpread: "off",
                vegasTotalPoints: "off",
                vegasHomeScore: "off",
                vegasAwayScore: "off"
            };
        }
        if(period.period_number !== "0")
        {
            //This is not a real game.
            return {};
        }

        var game = {
            gameDateTimeUtc: new Date(g.event_datetimeGMT),
            //Assuming first participant is always away and second is always home, this might not be true.
            awayTeam: nameres.resolveTeamName(g.participants.participant[0].participant_name),
            homeTeam: nameres.resolveTeamName(g.participants.participant[1].participant_name),
            homeSpread: period.spread.spread_home
        };

        if(period.total){
            game.vegasTotalPoints = period.total.total_points;

            var score = game.vegasTotalPoints / 2;

            if(game.homeSpread < 0){
                game.vegasHomeScore = score + Math.abs(game.homeSpread);
                game.vegasAwaySCore = score;
            }
            else{
                game.vegasHomeScore = score;
                game.vegasAwayScore = score + Math.abs(game.homeSpread);
            }
        }
        else{
            game.vegasTotalPoints = "off";
            game.vegasHomeScore = "off";
            game.vegasAwayScore = "off";
        }

        return game;
    });


    return {
        nflYear : nflYear,
        nflWeek : nflWeek,
        pinnacleLastGame: odds.pinnacle_line_feed.lastGame,
        games: _.without(games,{})
    }
};


/*
//Lets define a port we want to listen to
const PORT=3000;

//We need a function which handles requests and send response
function handleRequest(request, response){
    try{
        console.log(request.url);
        dispatcher.dispatch(request, response);
    }
    catch(err){
        console.log("Error" + err);
    }
}

//Get odds
dispatcher.onGet("/odds", function(req, res){

});

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});*/
