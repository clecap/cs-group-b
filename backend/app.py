from flask import Flask, jsonify
from utils import generate_blum

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


# WARN: By default 4300 is the max number of digits an int can have that is to be coverted to a string; Maximum digits a 2048 bit number can have is 617
@app.route("/blum")
def send_blum():
    return jsonify({"blum": generate_blum(2048)})
