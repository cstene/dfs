var PythonShell = require('python-shell');

var options = {
    mode: 'json',
    //not needed if python defined in environment variables.
    //pythonPath: 'path/to/python',
    pythonOptions: ['-u'],
    scriptPath: './py'
    //args: ['value1', 'value2', 'value3']
};

var shell = new PythonShell('helloworld.py', options);
shell.send({a: 1, b:2, c:'den'});

shell.on('message', function(message){
   console.log('wtf: ' + JSON.stringify(message));
});

shell.end(function(err){
    if (err) throw err;
    console.log('finished');
});
