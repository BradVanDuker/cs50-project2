import os

from flask import Flask, request
from flask_socketio import SocketIO, emit, rooms, join_room
from flask.templating import render_template
from channel import Channel
from _datetime import date, datetime


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
def createChannel(channelName):
    if not channelName or channelName in channels:
        return False
    else:
        channels.add(channelName)
        return True

createChannel('general')


def getTimeStamp():
    return str(datetime.now())

@socketio.on('join')
def onJoinEvent(data):
    channel = data['channel']
    if channel not in channels:
        emit('error', 'You have attempted to join a channel that does not exist')
        return
    username = data['username']
    time = getTimeStamp()
    join_room(channel)
    message =  {'time': time, 'name': 'Server', 'channel': channel, 'msg':f'{username} has joined channel {channel}'}
    emit('msg', message, room=channel, broadcast=True)
    #emit('msg', f'{time} {channel} has joined the channel\n', room=channel)


@socketio.on('msg')
def onMsgEvent(data):
    username = data['name']
    time = getTimeStamp()
    msg = data['msg']
    channel = data['channel']
    print( f"{username} {time} {channel} {msg}\n")
    emit('msg', {'name': username, 'time': time, 'msg':msg, 'channel': channel})
    # emit('msg', data={'time': time, 'channel': channel, 'name': username, 'msg': msg}, broadcast=True)


@socketio.on('test')
def test(data):
    print(data)
    emit('test', data)

def leaveRoom():
    pass


@socketio.on('connect')
def onConnectEvent():
    return
    #data['channel'] = 'general'
    #join(data)
    

# rooms(sid, namespace)
# close_room
# join_room
# leave_room

@socketio.on('channel list')
def onChannelEvent(newChannelName=None):
    # treat the event without a message as a request for the channel list
    # otherwise, treat as a request to add a new channel to the list
    channelNames = channels
    if newChannelName is None:
        broadcast = False
    else:
        if newChannelName == "":
            broadcast = False
        elif createChannel(newChannelName):
            broadcast = True
        else:
            broadcast = False
            # emit('channel list', list(channelNames), broadcast=True)
    emit('channel list', list(channelNames), broadcast=broadcast)


def main():
    os.putenv('FLASK_APP', 'application.py')
    os.putenv('FLASK_DEBUG', '1')
    app.run()