(function () {
    'use strict';

    angular.module('app')
        .factory('OddsService', OddsServiceFactory);

    function OddsServiceFactory($http, $log, ngXml2json) {
        'ngInject';

        return {
            getWeeklyOdds: getWeeklyOdds
        };

        //Use a proxy to get around CORS.
        function getWeeklyOdds(){
            $http.get('http://crossorigin.me/http://xml.pinnaclesports.com/pinnaclefeed.aspx?sporttype=Football&sportsubtype=nfl&contest=no', {headers: {'Content-Type':'applicaton/xml'}})
                .then(function(response){
                    var json = ngXml2json.parser(response.data);
                    $log.debug(json);
                });
        }
    }



})();