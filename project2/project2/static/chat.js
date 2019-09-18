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
	// const listNode = document.querySelector('.channel-listing ul');
	channelNames.forEach(name => {
		let listItem = document.createElement("LI");
		let textNode = document.createTextNode(name);
		listItem.appendChild(textNode);
		document.querySelector('.channel-listing ul').appendChild(listItem);
		
	});

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


function createChannel(channelName) {
	// send signal and channel name to server
	channelListingDiv = document.querySelector('.channel-listing ul');
	
	return false;
}


function createMessage(msg) {
	// send message to server
	return false;
}


function connectToServer() {
	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
	
	socket.on('connect', () => {
		socket.emit('channel list');
	});
	
	socket.on('channel list', channelList => {
		drawChannelListing(channelList);
	});
}


document.addEventListener('DOMContentLoaded', () => {	

	connectToServer();
	drawUserName();
});