import os

from flask import Flask, request
from flask_socketio import SocketIO, emit
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


channels = set()
channels.add('general')

def joinRoom():
    pass


def leaveRoom():
    pass


# rooms(sid, namespace)
# close_room
# join_room
# leave_room

@socketio.on('channel list')
def sendChannelList(msg=None):
    # treat the event without a message as a request for the channel list
    print('sendChannelList')
    broadcast = True
    if msg is None:
        broadcast = False
    else:
        newChannelName = msg['name']
        if newChannelName == "":
            broadcast = False
        elif newChannelName in channels:
            emit('error', 'Channel already exists.', broadcast=False)
            return
        else:
            channels.add(newChannelName)
            """
            For reasons unknown, if this path executes then the emit function at the end of this function
            doesn't broadcast anything.  However, things work if I call the emit function here then things work.
            """
            emit('channel list', list(channels), broadcast=True)
            broadcast = True        
    emit('channel list', list(channels), broadcast)
    

def main():
    os.putenv('FLASK_APP', 'application.py')
    os.putenv('FLASK_DEBUG', '1')
    app.run()