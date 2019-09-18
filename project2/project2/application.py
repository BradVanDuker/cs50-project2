import os

from flask import Flask
from flask_socketio import SocketIO, emit, send
from flask.templating import render_template

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

"""
@app.route("/")
def index():
    return "Project 2: TODO"
"""

def renderPage(pageName, **args):
    return render_template(pageName, **args)


@app.route('/')
def signIn():
    return renderPage('signIn.html')


@app.route('/chat')
def chat():
    return renderPage('chat.html')


@socketio.on('channel list')
def sendChannelList(msg=None):
    print('sendChannelList')
    if msg:
        send('channel list', ['Curly,', 'Larry', 'Moe'])
    else:
        emit('channel list', ['Curly', 'Larry', 'Moe'], broadcast=True)
    

def main():
    os.putenv('FLASK_APP', 'application.py')
    os.putenv('FLASK_DEBUG', '1')
    app.run()