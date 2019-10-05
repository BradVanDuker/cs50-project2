const CHANNEL_EVENT = 'channel list';
const JOIN_EVENT = 'join';
const MESSAGE_EVENT = 'msg';

function getUserName () {
	return localStorage.getItem('username');
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


function getChannels() {
	// return ["Huey", "Dewy", "Louy"];
}


function joinChannel(channel, socket) {
	socket.emit(JOIN_EVENT, {username: getUserName(), channel: channel})
	setCurrentChannel(channel);
}


function createMsgDisplayString(time, username, msg) {
	return `${username} at ${time}:\n ${msg}`;
}


function drawMessage(msg) {
	document.querySelector('.msg-text-area').innerHTML += msg + '<br>';
}


let allMessages = {};

// called when a message signal is emitted from server
function recieveMessage(time, username, channel, msg) {	
	if ( !(channel in allMessages) ) {
		allMessages[channel] = [];
	}
	const s = createMsgDisplayString(time, username, msg);
	allMessages[channel].push(s);
	if (getCurrentChannel() === channel) {
		drawMessage(s);
	}
}


function createChannel(socket) {
	"Click!";
	const newChannelName = document.querySelector('#newChannelName').value;
	socket.emit(CHANNEL_EVENT, newChannelName);

	return false;
}


function sendMessage(msg, channel, socket) {
	socket.emit(MESSAGE_EVENT, {name: getUserName(), channel: channel, msg: msg})
	// send message to server
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
		user = data['username'];
		time = data['time'];
		drawMessage(`{time} {username} has joined the channel`);
	});

	
	socket.on(MESSAGE_EVENT, data => {
		const time = data['time'];
		const name = data['name'];
		const channel = data['channel'];
		const msg = data['msg'];
		recieveMessage(time, name, channel, msg);
	});
	
	
	socket.on('test', msg => {
		testListen(msg);
	})
	
	return socket;
}


function testListen(msg) {
	console.log(msg);
	allMessages['general'] = msg;
	drawMsg(msg);
}


document.addEventListener('DOMContentLoaded', () => {
	drawUserName();
	
	const socket = connectToServer();
	document.querySelector('#newChannelButton').addEventListener('click', () => {
		createChannel(socket)
	});
	
	document.querySelector('#send').addEventListener('click', () => {
		const s = document.querySelector('#msg-entry').value;
		socket.emit(MESSAGE_EVENT, {name: getUserName(), msg: s, channel: getCurrentChannel()} );
	})
});

