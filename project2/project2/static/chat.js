const CHANNEL_EVENT = 'channel list';

function getUserName () {
	return localStorage.getItem('username');
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


function drawChannelListing(channelNames) {
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

function changeChannel() {
	return false;
}




// called when a message signal is emitted from server
function updateMessages() {
	return false;
}


function createChannel(socket) {
	"Click!";
	const newName = document.querySelector('#newChannelName').value;
	let thing = socket.emit(CHANNEL_EVENT, {name : newName });
	// send signal and channel name to server
	//channelListingDiv = document.querySelector('.channel-listing ul');
	
	return false;
}


function createMessage(msg) {
	// send message to server
	return false;
}


function connectToServer() {
	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
	
	socket.on('connect', () => {
		socket.emit(CHANNEL_EVENT);
	});
	
	socket.on(CHANNEL_EVENT, channelList => {
		drawChannelListing(channelList);
	});
	
	return socket;
}


document.addEventListener('DOMContentLoaded', () => {	

	const socket = connectToServer();
	drawUserName();
	document.querySelector('#newChannelButton').addEventListener('click', () => {createChannel(socket)});
});

