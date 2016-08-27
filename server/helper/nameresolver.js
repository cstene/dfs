var _ = require('lodash');

exports.resolveTeamName = function(name){
    var team = _.find(teams, function(t){
        return t.names.indexOf(name.toLowerCase()) > -1;
    });

    if(!team.id)
    {
        throw "Failed to resolve team name" + name;
    }
    
    return team.id;
};

var teams = [
    {id:'den', names:['denver broncos', 'den']},
    {id:'oak', names:['oakland raiders', 'oak']},
    {id:'sd', names:['san diego chargers', 'sd']},
    {id:'kc', names:['kansas city chiefs', 'kc']},
    {id:'hou', names:['houston texans', 'hou']},
    {id:'ten', names:['tennessee titans', 'ten']},
    {id:'ind', names:['indianapolis colts', 'ind']},
    {id:'jac', names:['jacksonville jaguars', 'jac']},
    {id:'bal', names:['baltimore ravens', 'bal']},
    {id:'cin', names:['cincinnati bengals', 'cin']},
    {id:'cle', names:['cleveland browns', 'cle']},
    {id:'pit', names:['pittsburgh steelers', 'pit']},
    {id:'ne', names:['new england patriots', 'ne']},
    {id:'mia', names:['miami dolphins', 'mia']},
    {id:'nyj', names:['new york jets', 'nyj']},
    {id:'buf', names:['buffalo bills', 'buf']},
    {id:'phi', names:['philadelphia eagles', 'phi']},
    {id:'was', names:['washington redskins', 'was']},
    {id:'dal', names:['dallas cowboys', 'dal']},
    {id:'nyg', names:['new york giants', 'nyg']},
    {id:'min', names:['minnesota vikings', 'min']},
    {id:'gb', names:['green bay packers', 'gb']},
    {id:'det', names:['detroit lions', 'det']},
    {id:'chi', names:['chicago bears', 'chi']},
    {id:'atl', names:['atlanta falcons', 'atl']},
    {id:'tb', names:['tampa bay buccaneers', 'tb']},
    {id:'car', names:['carolina panthers', 'car']},
    {id:'no', names:['new orleans saints', 'no']},
    {id:'la', names:['los angeles rams', 'la']},
    {id:'sea', names:['seattle seahawks', 'sea']},
    {id:'sf', names:['san francisco 49ers', 'sf']},
    {id:'ari', names:['arizona cardinals', 'ari']},
];