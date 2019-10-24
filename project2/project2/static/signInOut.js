function signIn() {
	username = document.querySelector('#username').value;
	if (username) {
		localStorage.setItem('username', username);
		window.location.href = "/chat";
	}
	else {
		output = document.querySelector('#output');
		output.innerHTML = "<p>Invalid User Name.</p>";
	}
	return false;
}