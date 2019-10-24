

const CHANNEL_EVENT = 'channel list';
const JOIN_EVENT = 'join';
const MESSAGE_EVENT = 'msg';
const LEAVE_EVENT = 'leave';
const ALL_MESSAGES_EVENT = 'all messages';


function redirectToLogin() {
	window.location.href = "/";
	return false;
}


function getUserName () {
	try {
		const name = localStorage.getItem('username');
		if (!name) {
			redirectToLogin();
			return false;
		}
		else {
			return localStorage.getItem('username');
		}
	} catch (err) {
		redirectToLogIn();
		return false;
	}
}


function getCurrentChannel() {
	return localStorage.getItem('currentChannel');
}


function setCurrentChannel(channelName) {
	localStorage.setItem('currentChannel', channelName);
}


function drawUserName() {
	const username = getUserName();
	
	if (!username) {
		window.location.href = "/chat";
	} else {
		const my_str = `<p>Hello, ${username}!</p>`;
		document.querySelector('.username').innerHTML = my_str;
	}
	return false;	
}


function drawChannelName() {
	const channelName = localStorage.getItem('currentChannel');
	document.querySelector('.channelTitle').innerHTML = channelName;
}


function drawChannelListing(channelNames, socket) {
	const myDiv = document.querySelector('.channel-listing');
	
	const oldList = myDiv.querySelector('ul');
	myDiv.removeChild(oldList);
	
	const newList = document.createElement("UL");
	channelNames.forEach(name => {
		const textNode = document.createTextNode(name);
		const listItem = document.createElement("LI");
		listItem.appendChild(textNode);
		
		const joinButton = document.createElement("button");
		joinButton.innerHTML = 'Join';
		const n = name;
		joinButton.onclick = () => {
			//socket.emit(JOIN_EVENT, {'username': getUserName(), 'channel': name});
			joinChannel(name, socket);
		};
		listItem.appendChild(joinButton);
		
		const leaveButton = document.createElement("button");
		leaveButton.innerHTML = "Leave";
		leaveButton.onclick = () => {
			leaveChannel(name, socket);
		};
		listItem.appendChild(leaveButton);
		
		
		newList.appendChild(listItem);
	});
	myDiv.appendChild(newList);

	return false;
	
	/*
	let str = "<ul>";
	channelNames.forEach(name => {
		str += `<li>${name}</li>\n`;
	});
	str += "</ul>";
	document.querySelector('.channel-listing').innerHTML = str;
	return false;
	*/
}


function requestAllMessages(socket, channel) {
	console.log(ALL_MESSAGES_EVENT);
	socket.emit(ALL_MESSAGES_EVENT, channel);
}


function receiveAllMessages(messages, channel) {
	if (channel === getCurrentChannel()) {
		// clear the message area
		const area = document.querySelector('.msg-text-area');
		area.innerHTML = "";
		// for each message
		messages.forEach( msg => {
			// draw the message
			drawMessage(msg);
			
		});
			
	}
}
	

function joinChannel(channel, socket) {
	socket.emit(JOIN_EVENT, {username: getUserName(), channel: channel})
	setCurrentChannel(channel);
	requestAllMessages(socket, channel);
}


function leaveChannel(channelName, socket) {
	socket.emit(LEAVE_EVENT, {name: getUserName(), channel: channelName});
	if (channelName === getCurrentChannel()) {
		setCurrentChannel('');
	}
}


function createDisplayStrFromMsg(msg) {
	return `${msg['name']} at ${msg['time']}:\n ${msg['msg']}`;
}


function autoScrollWindow() {
	const totalHeight = document.body.offsetHeight;
	const windowHeight = window.innerHeight;
	const scrolled = window.scrollY;
	if ((scrolled + windowHeight) == totalHeight) {
		const newPos = totalHeight - windowheight;
		window.scrollTo(0, newPos);
	}
}


function drawMessage(msg) {
	const s = createDisplayStrFromMsg(msg);
	document.querySelector('.msg-text-area').innerHTML += s + '<br>';
	autoScrollWindow();
}


// called when a message signal is emitted from server
function recieveMessage(msg) {	
	const channel = msg['channel'];
	if (channel === getCurrentChannel()) {
		drawMessage(msg);
	}
}


function createChannel(socket, newChannelName) {
	//"Click!";
	//const newChannelName = document.querySelector('#newChannelName').value;
	socket.emit(CHANNEL_EVENT, newChannelName);

	return false;
}


function createMessage(text, channel) {
	const time = Math.floor(Date.now() / 1000);
	return {name: getUserName(), channel: channel, msg: text, time: time};
}



function sendMessage(channel, socket, msg) {
	if (msg !== "") {
		const message = createMessage(msg, channel);
		socket.emit(MESSAGE_EVENT, message);
	}
	return false;
}


function connectToServer() {
	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
	
	// ---- Event Responses ----
	socket.on('connect', () => {
		socket.emit(CHANNEL_EVENT);
		joinChannel('general', socket);
	});
	
	socket.on(CHANNEL_EVENT, channelList => {
		drawChannelListing(channelList, socket);
	});
	
	
	socket.on(JOIN_EVENT, data => {
		username = data['name']
		data['text'] = `{username} has joined the channel`;
		drawMessage(data);
	});

	
	socket.on(MESSAGE_EVENT, data => {
		recieveMessage(data);
	});
	
	
	socket.on('test', msg => {
		testListen(msg);
	});
	
	
	socket.on(ALL_MESSAGES_EVENT, messages => {
		receiveAllMessages(messages['msgs'], messages['channel']);
	});
	
	return socket;
}


function testListen(msg) {
	console.log(msg);
	drawMsg(msg);
}



document.addEventListener('DOMContentLoaded', () => {
	drawUserName();
	
	const socket = connectToServer();
	
	const newChannelBttn = document.querySelector('#newChannelButton');
	const newChannelTextBox = document.querySelector('#newChannelName'); 
	newChannelBttn.addEventListener('click', () => {
		createChannel(socket, newChannelTextBox.value);
		newchannelTextBox.value = "";
	});
	newChannelTextBox.addEventListener("keyup", (event) => {
		if (event.keyCode == 13) {
			event.preventDefault();
			newChannelBttn.click();
		}
	});
	
	const sendButton = document.querySelector('#send');
	const msgEntryBox = document.querySelector('#msg-entry');
	sendButton.addEventListener('click', () => {
		sendMessage(getCurrentChannel(), socket, msgEntryBox.value);
		document.querySelector('#msg-entry').value = "";
	});
	document.querySelector('#msg-entry').addEventListener("keyup", (event) => {
		// taken from https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_trigger_button_enter
		if (event.keyCode === 13) {
			event.preventDefault();
			sendButton.click();
		}
	});
	
	drawChannelName();
	
});

