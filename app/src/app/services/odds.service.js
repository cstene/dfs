(function () {
    'use strict';

    angular.module('app')
        .factory('OddsService', OddsServiceFactory);

    function OddsServiceFactory($http, $log, ngXml2json) {
        'ngInject';

        var nflYear = 2016;
        var nflWeek = 1;

        return {
            getWeeklyOdds: getWeeklyOdds
        };

        //Use a proxy to get around CORS.
        function getWeeklyOdds(nflYear, nflWeek){
            nflYear = nflYear;
            nflWeek = nflWeek;

            $http.get('http://crossorigin.me/http://xml.pinnaclesports.com/pinnaclefeed.aspx?sporttype=Football&sportsubtype=nfl&contest=no', {headers: {'Content-Type':'applicaton/xml'}})
                .then(function(response){
                    var json = ngXml2json.parser(response.data);
                    var weeklyGameNode = mapToGameNode(json);
                    updateWeeklyGameNode(weeklyGameNode);
                });
        }

        function updateWeeklyGameNode(gameNode){
            //Make call to remove old game node.

            //Save new game node.
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

            var games = _.map(odds.pinnacle_line_feed.events.event, function(g){
                var game = {
                    gameDateTimeUtc: g.event_datetimegmt,
                    //Assuming first participant is always away and second is always home, this might not be true.
                    awayTeam: g.participants.participant[0].participant_name,
                    homeTeam: g.participants.participant[1].participant_name,
                    homeSpread: g.periods.period.spread.spread_home,
                    vegasTotalPoints: g.periods.period.total.total_points
                };

                var score = game.vegasTotalPoints / 2;

                if(game.homeSpread < 0){
                    game.vegasHomeScore = score + Math.abs(game.homeSpread);
                    game.vegasAwaySCore = score;
                }
                else{
                    game.vegasHomeScore = score;
                    game.vegasAwaySCore = score + Math.abs(game.homeSpread);
                }

                return game;
            });


            return {
                nflYear : nflYear,
                nflWeek : nflWeek,
                games: games
            }
        }
    }



})();