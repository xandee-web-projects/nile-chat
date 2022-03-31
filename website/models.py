from . import db
from flask_login import UserMixin
from sqlalchemy.sql import func


class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.String(10000))
    sender = db.Column(db.String(32))
    sender_id = db.Column(db.String(32))
    is_img = db.Column(db.Boolean, default=False)
    date = db.Column(db.DateTime(timezone=True), default=func.now())
    chat_id = db.Column(db.Integer, db.ForeignKey('chat.id'))

class Chat(db.Model):
    id = db.Column(db.String(32), primary_key=True)
    name = db.Column(db.String(64))
    abbr = db.Column(db.String(6))
    messages = db.relationship('Message')

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32))
    identity = db.Column(db.String(64))
    dept_id = db.Column(db.Integer)
    def __init__(self, _id, _dept_id, _identity) -> None:
        self.id = _id
        self.dept_id = _dept_id
        self.identity = _identity


