import os

from flask import Flask, request
from flask_socketio import SocketIO, emit, rooms, join_room, leave_room
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



channels = dict()
def createChannel(channelName):
    if not channelName or channelName in channels:
        return False
    else:
        channels[channelName] = []
        #channels.add(channelName)
        return True

createChannel('general')


def saveMsg(channel, msg):
    channels[channel].append(msg)


def _getMsgs(channel):
    return channels[channel]


@socketio.on('getMsgs')
def getMessages(channelName):
    msgs = _getMsgs(channelName)
    emit('all messages', {'channel': channelName, 'msgs': msgs}, broadcast=False)


def sendMsg(message, broadcast=True):
    channel = message['channel']
    emit('msg', message, room=channel, broadcast=broadcast)
    
    
def createMsg(time, channel, sender, text):
    return {'time':time, 'channel':channel, 'name':sender, 'msg':text}
    

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
    text = f'{username} has joined channel {channel}'
    message = createMsg(time, channel, 'Server', text)
    sendMsg(message, channel)


@socketio.on('msg')
def onMsgEvent(data):
    username = data['name']
    time = getTimeStamp()
    msg = data['msg']
    channel = data['channel']
    print( f"{username} {time} {channel} {msg}\n")
    message = createMsg(time, channel, username, msg)
    sendMsg(message, channel)


@socketio.on('test')
def test(data):
    print(data)
    emit('test', data)


@socketio.on('leave')
def leaveRoom(data):
    channel = data['channel']
    leave_room(channel)
    user = data['name']
    msg = f'{user} has left channel {channel}'
    message = createMsg(getTimeStamp(), channel, 'Server', msg)
    sendMsg(message, channel)
    

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