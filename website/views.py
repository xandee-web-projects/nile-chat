from flask import Blueprint, render_template, redirect, url_for, json
from flask_login import login_required, current_user
from .models import Message, Chat
from . import db, emit, socketio, join_room
from .hash import hsh, h

views = Blueprint('views', __name__)
curse_words = ["breast", "boobs", "arsehole","asshole","balls","bint","bitch","bollocks","bullshit","feck","munter","shit","tits","bastard","bellend","bloodclaat","clunge","cock","dick","dickhead","fanny","flaps","gash","knob","minge","prick","punani","pussy","snatch","twat","cunt","fuck","motherfucker","fucker","prick","fuckin"]

@views.route('/', methods=['GET', 'POST'])
@login_required
def chat():
    if not current_user.username or current_user.username == "":
        return redirect(url_for('auth.choose_username'))
    return render_template('chat-app.html', current_user_id=hsh(current_user.identity), group=Chat.query.get(current_user.dept_id))

@socketio.on('online', namespace='/chat')
@login_required
def isonline():
    messages = []
    get_chat = Message.query.filter_by(chat_id=current_user.dept_id).order_by(Message.id.desc()).limit(30).all()
    for i in get_chat:
        if i.type == "str":
            messages.append({"msg": i.data, "t": str(i.date.time())[0:5], "is_s": i.sender_id==hsh(current_user.identity), "s": i.sender, "i": h(i.sender+i.sender_id)})
        elif i.type == "img":
            messages.append({"img": i.data, "t": str(i.date.time())[0:5], "is_s": i.sender_id==hsh(current_user.identity), "s": i.sender, "i": h(i.sender+i.sender_id)})
        elif i.type == "flames":
            messages.append({"flames": json.loads(i.data), "t": str(i.date.time())[0:5], "is_s": i.sender_id==hsh(current_user.identity), "s": i.sender, "i": h(i.sender+i.sender_id)})
    join_room(current_user.dept_id)
    if len(messages) > 0:
        emit('get_messages', messages)

def create_message(text, type:str):
    new_message = Message(sender_id=hsh(current_user.identity), sender=current_user.username, chat_id=current_user.dept_id, type=type)
    if type == "str":
        new_writeup = text
        for curse in curse_words:
            if text.lower().find(curse) != -1:
                new_writeup = ""
                for word in text.split():
                    if word.lower() in curse_words:
                        word = word.replace(word[1:(len(word)//2)], (len(word)//2)*"*")
                    new_writeup += word+" "
                break
        text = new_writeup
    elif type == "flames":
        text = json.dumps(text)
    new_message.data = text
    db.session.add(new_message)
    db.session.commit()
    return new_message

@socketio.on('send', namespace='/chat')
@login_required
def send(data):
    new_message = create_message(data['message'], "str")
    emit('new_message', {'msg': new_message.data, 't': str(new_message.date.time())[0:5], 's_id': new_message.sender_id, 's': new_message.sender, 'i': h(new_message.sender+new_message.sender_id)}, room=current_user.dept_id)

@socketio.on('image', namespace='/chat')
@login_required
def image(data):
    new_message = create_message(data, "img")
    emit('new_image', {'img': data, 't': str(new_message.date.time())[0:5], 's_id': new_message.sender_id, 's': new_message.sender, 'i': h(new_message.sender+new_message.sender_id)}, room=current_user.dept_id)

@socketio.on('flames', namespace='/chat')
@login_required
def flames(data):
    new_message = create_message(data, "flames")
    emit('flames', {'flames': data, 't': str(new_message.date.time())[0:5], 's_id': new_message.sender_id, 's': new_message.sender, 'i': h(new_message.sender+new_message.sender_id)}, room=current_user.dept_id)
