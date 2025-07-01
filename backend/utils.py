from configparser import ConfigParser
from Crypto.Util import number
import sqlite3
from flask import g


config_object = ConfigParser()
config_object.read("config.ini")


def generate_blum(required_bits):
    while True:
        p = number.getPrime(required_bits // 2)
        if p % 4 != 3:
            continue

        q = number.getPrime(required_bits // 2)
        if q % 4 != 3 or p == q:
            continue

        result = p * q
        if result.bit_length() != required_bits:  # (does double the avg time)
            continue

        return result


database_info = config_object["DATABASE"]


def get_db():
    db = getattr(g, "_database", None)
    if db is None:
        db = g._database = sqlite3.connect(database_info["url"])
        db.row_factory = sqlite3.Row
        cur = db.cursor()

        if (
            cur.execute("SELECT name FROM sqlite_master WHERE name='user'").fetchone()
            is None
        ):
            cur.execute(
                "CREATE TABLE user(username PRIMARY KEY, pubKeys, blum, regTime)"
            )  # mentioning datatype is optional in sqlite

    return db
