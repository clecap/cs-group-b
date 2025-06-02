from flask import Flask, send_from_directory
from flask_socketio import SocketIO, emit
import os

app = Flask(__name__, static_folder='../frontend', static_url_path='')
app.secret_key = os.urandom(24)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
@app.route('/peggy')
@app.route('/victor')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@socketio.on('publish_public_keys')
def publishPublicKeys(data):
    emit('public_keys_received', data, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
    