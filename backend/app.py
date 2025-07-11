import datetime
from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
import os
from utils import generate_blum, get_db
from flask import g
from configparser import ConfigParser
from flask import request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.secret_key = os.urandom(24)
socketio = SocketIO(app, cors_allowed_origins="*")


@socketio.on("publish_public_keys")
def publishPublicKeys(data):
    emit("public_keys_received", data, broadcast=True)


@socketio.on("publish_commitment_x")
def handleX(data):
    emit("publish_commitment_x", data, broadcast=True)


@socketio.on("publish_response_y")
def handleY(data):
    emit("publish_response_y", data, broadcast=True)


@socketio.on("send_challenge")
def sendChallenge(data):
    emit("challenge_bits_received", data, broadcast=True)


# close db connection after every request
@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, "_database", None)
    if db is not None:
        db.close()


config_object = ConfigParser()
config_object.read("config.ini")

bitsize_info = config_object["BITSIZE"]


# WARN: By default 4300 is the max number of digits an int can have that is to be coverted to a string; Maximum digits a 2048 bit number can have is 617
@app.route("/blum")
def send_blum():
    return jsonify({"blum": str(generate_blum(int(bitsize_info["blumInt"])))})


@app.route("/user/register", methods=["POST"])
def register_user():
    data = (
        request.json
    )  # WARN: request should have content type as json set for this to work

    # data = request.get_json(force=True) # otherwise use this

    # if json data is missing or keys are wrong then throw 400 error; very basic sanity check, should use something like JSONSCHEMA library for validation if serious
    if (
        data is None
        or len(data) != 3
        or any(x not in data.keys() for x in ["username", "pubKeys", "blum"])
    ):
        return ("", 400)

    data["username"] = data["username"].lower()
    db = get_db()
    cur = db.cursor()

    user = cur.execute(
        "SELECT * FROM user WHERE username = ?", (data["username"].lower(),)
    ).fetchone()

    if user is not None:
        return ("user already exists", 406)

    data["regTime"] = datetime.datetime.now(tz=datetime.timezone.utc)

    cur.execute("INSERT INTO user VALUES (:username,:pubKeys,:blum, :regTime)", data)
    db.commit()
    return ("Success", 200)


@app.route("/user/info")
def user_info():
    data = request.args

    if "username" not in data:
        return ("", 400)

    db = get_db()
    cur = db.cursor()

    res = cur.execute(
        "SELECT * FROM user WHERE username = ?", (data["username"].lower(),)
    ).fetchone()

    if res is None:
        return "Username does not exist"

    return (dict(res), 200)


@app.route("/provers")
def get_all_users():
    db = get_db()
    cur = db.cursor()

    res = cur.execute("SELECT * FROM user").fetchall()

    user_info_list = []

    for userInfo in res:
        user_info_list.append(
            {
                "name": userInfo[0],
                "keys": userInfo[1],
                "reg_time": userInfo[-1],
            }
        )

    return ({"provers": user_info_list}, 200)


if __name__ == "__main__":
    print("here")
    socketio.run(
        app,
        debug=True,
        # host="0.0.0.0",
        # certfile="/etc/letsencrypt/live/feigefiatshamirdemo.ddns.net/fullchain.pem",
        # keyfile="/etc/letsencrypt/live/feigefiatshamirdemo.ddns.net/privkey.pem",
    )
