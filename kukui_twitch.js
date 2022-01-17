const tmi = require('tmi.js');
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const http = require('http');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const csv = require('@fast-csv/parse');
const net = require("net");
//const server = net.createServer();
// server.listen(7788, function() {
//     console.log("Server listening to port %j", server.address());
// });
const socket = net.Socket();
socket.connect(12345);
socket.write("hello");
// socket.on("data", function(d) {
//     console.log("Data from  %s : %s", remoteAddress, d);
// });
// server.on("connection", function(socket) {
//     const remoteAddress = socket.remoteAddress;
// });

// Define configuration options
//obtained from env file
const opts = {
    identity: {
        username: process.env.user,
        password: process.env.oauth
    },
    channels: [
        process.env.channel
    ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();


//instantiate variables to be used
var printOnly = new Map();
waitingForCatch = false;
let wildEncounter = "";

//new encounter every 5-10 minutes
setInterval(encounter, 5000);

//sets up api for later use
getAuth();
setTimeout(()=>{
    useAPI();
}, 1000);

setUp(printOnly);

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
    if (self) { return; } // Ignore messages from the bot
    if (!msg.startsWith('!')) {return;} //Ignore messages that aren't commands

    // Remove whitespace from chat message
    var split = msg.split(" ");
    const commandName = split[0];

    //command is print only
    if (printOnly.has(commandName)){
        //uses the user's username in message
        if (printOnly.get(commandName).cont != null){
            client.say(target, printOnly.get(commandName).cont + printOnly.get(commandName).message);
        }//end of if
        //basic print
        else{
            client.say(target, printOnly.get(commandName).message);
        }//end of else
    }//end of if
    else if (commandName == "!catch" && waitingForCatch){
        client.say(opts.channels[0], "Good job!");
        socket.write(wildEncounter + target);
        waitingForCatch = false;
    }
    else{
        console.log(`* Unknown command ${commandName}`);
    }//end of else
}//end of onMessageHandler

//Main "wild encounter" mechanic
function encounter(){
    //find random Pokemon
    const curr = Math.floor(Math.random() * 720);

    //Parse the csv and find the specific row
    csv.parseFile('Pokemon.csv', {skipRows: curr, maxRows: 1, headers: [undefined, 'name', undefined, undefined]})
        .on('error', error => console.error(error))
        .on('data', row => wildEncounter = row.name);

    //send the message in chat after it's stored
    setTimeout(function(){
        client.say(opts.channels[0], "A wild " + wildEncounter + " appeared!");
        waitingForCatch = true;
    }, 50);

}//end of encounter

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}

//TODO: add commands explaining functionality
//sets up the map of print only functions
//this map has the command name as the key, and has an array of the context and the message to be printed
async function setUp(map){
}// end of setUp

function getAuth(){

    //set up request with paramaters
    var request = new XMLHttpRequest();
    var params = '?client_id=' + process.env.clientid + '&client_secret=' + process.env.secret + '&grant_type=client_credentials';

    //open post request and send it
    request.open('POST', 'https://id.twitch.tv/oauth2/token' + params, true);
    request.send();
    request.onreadystatechange = function () {
        if (request.readyState === 4) { //valid
            //parse request for api authorization
            global.auth = JSON.parse(request.responseText);
        }//end of if
    };

}//end of getAuth

function useAPI(){
    var request = new XMLHttpRequest(); //instantiate request

    //open request and set headers
    request.open('GET', 'https://api.twitch.tv/helix/search/channels?query=' + process.env.channel, true);
    request.setRequestHeader('client-id', process.env.clientid);
    request.setRequestHeader('Authorization', 'Bearer ' + global.auth.access_token);
    request.send();//send request

    request.onreadystatechange = function () {
        if (request.readyState === 4) { //if it's valid
            //parse result to use
            global.api = JSON.parse(request.responseText);
        }//end of if
    };

}//end of useAPI

