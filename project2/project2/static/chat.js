const CHANNEL_EVENT = 'channel list';
const JOIN_EVENT = 'join';
const MESSAGE_EVENT = 'msg';
const LEAVE_EVENT = 'leave';
const ALL_MESSAGES_EVENT = 'all messages';


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
	socket.emit(ALL_MESSAGES_EVENT, channel);
}


function getAllMessages(messages, channel) {
	if (channel === getCurrentchannel()) {
		// clear the message area
		area = document.querySelector('.msg-text-area');
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


function drawMessage(msg) {
	const s = createDisplayStrFromMsg(msg);
	document.querySelector('.msg-text-area').innerHTML += s + '<br>';
}


// called when a message signal is emitted from server
function recieveMessage(msg) {	
	const channel = msg['channel'];
	if (channel === getCurrentChannel()) {
		drawMessage(msg);
	}
}


function createChannel(socket) {
	"Click!";
	const newChannelName = document.querySelector('#newChannelName').value;
	socket.emit(CHANNEL_EVENT, newChannelName);

	return false;
}


function createMessage(text, channel) {
	time = Math.floor(Date.now() / 1000);
	return {name: getUserName(), channel: channel, msg: text, time: time};
}


function sendMessage(msg, channel, socket) {
	message = createMessage(msg, channel);
	socket.emit(MESSAGE_EVENT, message);
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
	})
	
	return socket;
}


function testListen(msg) {
	console.log(msg);
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
		sendMessage(s, getCurrentchannel(), socket)
		// socket.emit(MESSAGE_EVENT, {name: getUserName(), msg: s, channel: getCurrentChannel()} );
	})
});

