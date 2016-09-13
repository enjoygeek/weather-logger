var mysql = require("mysql");
var rest = require("./rest_client");

// First you need to create a connection to the db
var con = mysql.createConnection({
  host: "localhost",
  user: "cadmin",
  password: "cadmin",
  database: "camaras"
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('DB Connection established');
});

function disconnect(){
  con.end(function(err) {
    process.exit(0);
    // The connection is terminated gracefully
    // Ensures all previously enqueued queries are still
    // before sending a COM_QUIT packet to the MySQL server.
  });
}

//Connection ready
function getWeatherData(data){
  con.query('SELECT * FROM weather',function(err,rows){
    if(err) console.error(err);

    console.log('Data received from Db:\n');
    console.log(rows);
  });
}

function addWeatherData(data){
  var t = new Date(data.dt*1000);
  var data = { date: t, city_id: data.id, wind_speed: data.wind.speed, temperature: data.main.temp };
  con.query('INSERT INTO weather SET ?', data, function(err,res){
    if(err) console.error(err) ;

    console.log('Last insert datetime:', t);
  });
}

function someAsyncOperation (callback) {
  // Assume this takes 95ms to complete
  var options = {
      host: 'api.openweathermap.org',
      port: 80,
      path: '/data/2.5/weather?q=Tandil,ar&APPID=7ef3fac6a4baf0d3d0d12a68a3277ba6&units=metric&lang=es',
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      }
  };

  rest.getJSON(options, function(statusCode, result)
        {
           if(statusCode == 200){
            // I could work with the result html/json here.  I could also just return it
            console.log("onResult: (" + statusCode + ")" + JSON.stringify(result));
            addWeatherData(result);
          }
        });

  callback();
}

var timeoutScheduled = Date.now();

setInterval(function () {

  someAsyncOperation(function () {

    var startCallback = Date.now();

    // do something that will take 10ms...
    while (Date.now() - startCallback < 10) {
      ; // do nothing
    }

  });

  var delay = Date.now() - timeoutScheduled;

  console.log(delay + "ms have passed since I was scheduled");
},  60 * 60 * 1000); //Cada 60 minutos

someAsyncOperation(function(){
	console.log("Logger initiated");
})

process.on('SIGINT', function() {
  disconnect();
});
