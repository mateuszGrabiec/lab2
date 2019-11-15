const http = require('http');      // deklaracja protokołu
const express = require('express');    // deklaracja modułu express
                    // pozwalającego na przekierowania
//const session = require('express-session');
const socketio = require('socket.io');  // deklaracja modułu do komunikacji
                    // serwer-klient
const RpsGame = require('./rpsGame');  //  deklaracja klasy obsługującej grę

const app=express();

const clientPath=`${__dirname}/../client`;// deklaracja ścieżki klienta
console.log(`Serving static from ${clientPath}`);

app.use(express.static(clientPath));  // deklaracja ścieżki nadrzędnej

const server=http.createServer(app);  // stworzenie serwera

app.get('/index', function(req, res) {  //
});

app.get('/gallows/gallows', function(req, res) {
});

let waitingPlayer=null;

var tables=[];//tutaj są przechowywane stoliki
var gameId=0;

const io = socketio(server);  // deklaracja obsługi zapytań do serwera

io.on('connection', (sock)=>{  // funkcja obsługująca podłączenie klienta
  
  function createNewGame(){
  if(waitingPlayer){
    tables.push(new RpsGame(waitingPlayer,sock,++gameId));
    waitingPlayer=null;
  }else{
    waitingPlayer=sock;
    waitingPlayer.emit('message','<p class="serv">Waiting for oponent</p>');
  }
  }
  createNewGame();
  //sock.emit('message','Hey, you are conneted');
  
  sock.on('message', (text)=>{  // funkcja wysyłająa wiadomość
    io.emit('message', text);
  });
  
  sock.on('score', (text)=>{    // funkcja wysyłająca wynik
    io.emit('score', text);
  });
  
  sock.on('clock', (time)=>{
    io.emit('message', time);
  });
  
  sock.on('breakClock', (n)=>{
    io.emit('message',n);
  });
  
  sock.on('getTime', (t)=>{
    io.emit('getTime',Date.now());
  });
  
  sock.on('endGame', (id)=>{
    io.emit('endGame',id);
  });
  
  sock.on('clearTable', (id)=>{
    var idOfTable=null;
    var isIdfouned=false;
      tables.forEach((table,idx)=>{
       if(table._getGameId()==id){
         tables.splice(idx,1);
         idOfTable=idx;
         isIdfouned=true;
        }
        });
  });
  
});


server.on('error',(err)=> {
  console.error('Server error:', err );
});

const hostname = '127.0.0.1';
const port = 80;



server.listen(port, hostname, () => {
  console.log('Server started on port '+port);
});