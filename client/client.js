var timer;
var nums=[10];
for(var i=0;i<10;i++){
	nums[i]=new Image();
	nums[i].src = "nums/"+i+".png";
}

function changeChild(parentId,child){
			document.getElementById(parentId).innerHTML = '';
			document.getElementById(parentId).appendChild(child.cloneNode());
}

function clearClock(){
		changeChild("tens",nums[0]);
		changeChild("unity",nums[0]);
		clearInterval(timer);
}

function startCountdown(durationTime){
		clearInterval(timer);
		
		var countDownDate =new Date(new Date().getTime() + durationTime);
		timer = setInterval(function() {

		// Get todays date and time
		var now = new Date().getTime();
		// Find the distance between now and the count down date
		var distance = countDownDate - now;
		
		//var days = Math.floor(distance / (1000 * 60 * 60 * 24));
		//var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		//var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		var seconds = Math.floor((distance % (1000 * 60)) / 1000);
		var tens = Math.floor(seconds/10);
		var unity = Math.floor(seconds%10);
		// Output the result in an element with id="demo"
		if(distance > 0){
		changeChild("tens",nums[tens]);
		changeChild("unity",nums[unity]);
		}else {
			clearClock();
		}
	}, 1000);	
	}

const writeEvent = (text)=>{
	const parent = document.querySelector('#events');
	
	const el = document.createElement('li');
	el.innerHTML=text;
	
	parent.appendChild(el);
	//scrollDown
	$('#events').scrollTop($('#events')[0].scrollHeight);
};

const writeScore = (s1,s2)=>{
	document.getElementById("score-p1").innerHTML=s1+'&nbsp;';
	document.getElementById("score-p2").innerHTML=s2+'&nbsp;';
};

	const writeClock = (endTime)=>{
		$('.endGame-wrapper').css("display", "none");
	const parent = document.querySelector('#clock-getter');
	
	startCountdown(endTime);
}

const breakClock= (n) => {
	clearClock();
}

const reqestToServer=(id) =>{
	$('.endGame-wrapper').css("display", "block");
	sock.emit('clearTable',id);
}

writeEvent('Welcome to rock,paper,scissors');

const onFormSubmitted = (e) => {
	e.preventDefault();
	const input = document.querySelector('#chat');
	const text = input.value;
	input.value='';
	sock.emit('message',text);
	document.querySelector('#events').scrollIntoView(false);
};

const addButtonListeners = () => {
	
	['rock','paper','scissors'].forEach((id) =>{
		const button = document.getElementById(id);
		button.addEventListener('click', ()=>{
			sock.emit('turn', id);
		});
	});
	
	const id="newGame";
	const optionsButton = document.getElementById(id);
		optionsButton.addEventListener('click', ()=>{
			writeScore(0,0);
			$('.endGame-wrapper').css("display", "none");
			sock.emit('afterGame', id);
	});
	
};

const sock=io();
sock.on('message',writeEvent);
sock.on('score',writeScore);
sock.on('clock',writeClock);
sock.on('breakClock',breakClock);
sock.on('endGame',reqestToServer);

document.querySelector('#chat-form')
.addEventListener('submit', onFormSubmitted);

addButtonListeners();