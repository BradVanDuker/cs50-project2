import os

from flask import Flask
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask.templating import render_template
from _datetime import datetime
from random import randint



app = Flask(__name__)
socketio = SocketIO(app)


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

CHAT_BUFFER_SIZE = 100

#TODO: fix race conditions here
def saveMsg(channel, msg):
    storage = channels[channel]
    if len(storage) > CHAT_BUFFER_SIZE:
        storage.pop(0)
    storage.append(msg)


def _getMsgs(channel):
    return channels[channel]


@socketio.on('all messages')
def onGetAllMessages(channelName):
    msgs = _getMsgs(channelName)
    emit('all messages', {'channel': channelName, 'msgs': msgs}, broadcast=False)


def sendMsg(message, broadcast=True):
    channel = message['channel']
    saveMsg(channel, message)
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


def rollDice(qty, sides):
    results = []
    for i in range(0, qty):
        if sides == 0:
            roll = 0;
        else:
            roll = randint(1, sides)
        results.append(roll)
    return results


def magic8():
    fortunes = ["Future hazy. Try again later.", "Does a whale have wet farts?", \
                "Certainly.", "Just google it.  That's what I always do.", "Definately not.", \
                "You must construct additonal pylons.", "Hmmm....", "You ask too many questions.", \
                "No.", "Yes.", "Maybe", "42", "*sticks fingers in ears and hums loudly*", \
                "Sure.  Why not?", "I'll take \"Stupid Questions\" for 200, Alex."]
    n = randint(0, len(fortunes) - 1)
    f = fortunes[n]
    if not f:
        print("fortune error on roll " + n)
    return fortunes[randint(0, len(fortunes) - 1)]


@socketio.on('msg')
def onMsgEvent(data):
    msg = data['msg']
    username = data['name']
    commandStart = "/"
    if msg.find(commandStart) == 0:
        command = msg.strip(commandStart)
        cmd = command.split()[0]
        if cmd == "roll":
            command = command.strip("roll")
            parts = command.split("d")
            qty = int(parts[0])
            sides = int(parts[1])
            results = rollDice(qty, sides)
            msg = f'{username} rolled {qty}d{sides} and got {results}'
            username = "System"
        elif cmd == "died":
            msg = f'{username} died a little inside'
            username = "System"
        elif cmd == "magic8":
            username = "System"
            msg = magic8()
        else:
            return
    time = getTimeStamp()
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
    
    
if __name__ == '__main__':
    main()