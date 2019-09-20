import os

from flask import Flask, request
from flask_socketio import SocketIO, emit
from flask.templating import render_template
from channel import Channel


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



channels = dict()
channels['general'] = Channel()


@socketio.on('join')
def joinRoom(data):
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
    channelNames = channels.keys()
    if msg is None:
        broadcast = False
    else:
        
        newChannelName = msg['name']
        if newChannelName == "":
            broadcast = False
        elif newChannelName in channelNames:
            emit('error', 'Channel already exists.', broadcast=False)
            return
        else:
            channels[newChannelName] = Channel()
            """
            For reasons unknown, if this path executes then the emit function at the end of this function
            doesn't broadcast anything.  However, things work if I call the emit function here.
            """
            emit('channel list', list(channelNames), broadcast=True)
            broadcast = True
    emit('channel list', list(channelNames), broadcast)
    

def main():
    os.putenv('FLASK_APP', 'application.py')
    os.putenv('FLASK_DEBUG', '1')
    app.run()