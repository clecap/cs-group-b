from flask import Flask, render_template, request, session, redirect, url_for
from flask_socketio import SocketIO, emit, join_room
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

socketio = SocketIO(app)

@app.route("/")
def home():
    return render_template("index.html")

@app.route('/peggy')
def peggy():
    return render_template('peggy.html')

@app.route('/victor')
def victor():
    return render_template('victor.html')

@socketio.on('publish_public_keys')
def publishPublicKeys(data):
    emit('public_keys_received', data, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)