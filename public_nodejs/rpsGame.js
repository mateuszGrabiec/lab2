 class RpsGame {
   constructor(p1,p2,id){
     this._gameId=id;
     this._players = [p1,p2];
     this._turns = [null, null];
     this._wins = [0,0];//add wins and loses
     this._winCounter=0;
     this._roundCounter=0;
     this._timeOfRound=30000;//30s
     //this._timeOfRound=10000;//10s
     //this._timeOfRound=5000;//5s
     //this._timeOfRound=3000;//3s
     this._timeout;
     this._setTimer();
     
     this._sendScore(0,0);
     this._sendToPlayers('Rock, paper, scissors starts!');
     this._players.forEach((player, idx)=>{
       player.on('turn', (turn)=>{
         this._onTurn(idx,turn);
       });
     });
   }
   
   _getGameId(){
     return this._gameId;
   }
   
   _sendToPlayer(idx,msg) {
     this._players[idx].emit('message', '<p class="serv">'+msg+'</p>');
   }
   
   _sendToPlayers(msg) {
     this._players.forEach((p) => p.emit('message', '<p class="serv">'+msg+'</p>'));
   }
   _sendScore(s1,s2) {
     //dvide to you opponent
     this._players[0].emit('score', s1,s2);
     this._players[1].emit('score', s2,s1);
   }
   _sendClock(msg) {
     this._players.forEach((p) => p.emit('clock', msg));
   }
   
   
   _onTurn(playerIndex, turn){
     if(!this._turns[playerIndex] && this._winCounter<5){
     var secondPlayerIndex=1;
     if(playerIndex==1) secondPlayerIndex=0;
     this._turns[playerIndex] = turn;
     this._checkEndTurn();
     }
   }
   
   _checkEndTurn(){
     const turns = this._turns;
     
     if(turns[0] && turns[1]){
       clearTimeout(this._timeout);
       //this._sendToPlayers('Round over ' + turns.join(' : '));
       this._getGameResult();
       if( this._winCounter>= 5)this._whosWinsGame();
       if(this._winCounter<5){
       this._turns = [null,null];
       this._setTimer();
       }else{
         //end Game
         this._turns = [null,null];
       }
     }
   }
   
   _getGameResult(){
     const p1=this._decodeTurn(this._turns[0]);
     const p2=this._decodeTurn(this._turns[1]);
     
     const distance = (p2-p1+3)%3;
     
     switch (distance){
       case 0://Draw
        this._drawInRound();
        break;
      case 1://P1 wins
        this._checkWinsRound(0,1);
        break;
      case 2://P2 wins
        this._checkWinsRound(1,0);
        break;
     }
   }
   
   _checkWinsRound(indexWinner, indexLoser){     
     this._wins[indexWinner]++;
     this._sendScore(this._wins[0],this._wins[1]);
     this._sendWinMessage(indexWinner,indexLoser,this._turns[indexWinner],this._turns[indexLoser]);
     if(this._wins[indexWinner]>this._wins[indexLoser] )this._winCounter++;
   }
   
   _drawInRound(){
     this._wins[0]++;
     this._wins[1]++;
     this._sendScore(this._wins[0],this._wins[1]);
     if(this._turns[0]==this._turns[1]){
       if(this._turns[0]==null) this._turns[0]='nothing';
       this._sendToPlayers('Draw: '+this._turns[0]+' : '+this._turns[0]);
     }
     this._winCounter++;
   }
   
   _whosWinsGame(){
     //
     clearTimeout(this._timeout);
     this._players[0].emit('breakClock',null);
     this._players[1].emit('breakClock',null);
     
     if(this._wins[0] > this._wins[1]){
       this._sendToPlayer(0,'You are winner!!!');
       this._sendToPlayer(1,'This time you lost :(');
     }else if(this._wins[0] < this._wins[1]){
       this._sendToPlayer(1,'You are winner!!!');
       this._sendToPlayer(0,'This time you lost :(');
     }else{
       this._sendToPlayers("It's draw :o");
     }
     
     //closing game
    this._players[0].emit('endGame',this._gameId);
    this._players[1].emit('endGame',this._gameId); 
     
   }
   
   _sendWinMessage(indexWinner, indexLoser,winTurn,loseTurn){
     
     for(var i=0;i<this._turns.length;i++){
       if(this._turns[i]==null)this._turns[i]='nothing';
     }
    this._sendToPlayer(indexWinner,'You win: '+this._turns[indexWinner]+' : '+this._turns[indexLoser]);
    this._sendToPlayer(indexLoser,'You lose: '+this._turns[indexLoser]+' : '+this._turns[indexWinner]);
   }
   
   _decodeTurn(turn){
     switch (turn){
       case 'rock':
        return 0;
      case 'scissors':
        return 1;
      case 'paper':
        return 2;
      default:
        throw new Error(`Could not decode turn ${turn}`);
     }
   }
   
   _setTimer(){
     this._sendClock(this._timeOfRound);
     this._timeout = setTimeout(() => {
      if(this._winCounter<5){
        if(this._turns[0] == null && this._turns[1] ==null){
          //both AFK
          this._drawInRound();
        }else if(this._turns[1]==null){
          //P2 AFK
          this._checkWinsRound(0,1);
        }else if(this._turns[0]==null){
          //P1 AFK
      this._checkWinsRound(1,0);
        }
        this._turns = [null,null];
        clearTimeout(this._timeout);
        this._setTimer();
      }
    if(this._winCounter>=5) this._whosWinsGame();
    }, this._timeOfRound);
   }
 }
 
 module.exports = RpsGame;