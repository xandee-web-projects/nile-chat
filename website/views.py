from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_required, current_user
from .models import Message, Chat, User
from . import db, emit, socketio, join_room
from .hash import hsh, h

views = Blueprint('views', __name__)

@views.route('/', methods=['GET', 'POST'])
@login_required
def chat():
    if not current_user.username:
        return redirect(url_for('auth.choose_username'))
    users = []
    for i in User.query.filter_by(dept_id=current_user.dept_id).all():
        users.append(i.username)
    return render_template('chat-app.html', current_user_id=hsh(current_user.identity), group=Chat.query.get(current_user.dept_id))

@views.route('/admin', methods=['GET', 'POST'])
@login_required
def admin():
    if current_user.id != 211605045:
        return redirect(url_for('views.chat'))

    return render_template('admin.html')


@socketio.on('online', namespace='/chat')
@login_required
def isonline():
    messages = []
    get_chat = Message.query.filter_by(chat_id=current_user.dept_id).order_by(Message.id.desc()).limit(20).all()
    for i in get_chat:
        messages.append({"msg": i.data, "time": str(i.date.time())[0:5], "is_sender": i.sender_id==hsh(current_user.identity), "sender": i.sender, "i": h(i.sender+i.sender_id)})
    join_room(h(current_user.dept_id))
    if len(messages) > 0:
        emit('get_messages', messages)
    # emit("general_message", {"msg": current_user.username +" is online"}, room=h(current_user.dept_id))

@socketio.on('send', namespace='/chat')
@login_required
def send(data):
    new_message = Message(data=data['message'], sender_id=hsh(current_user.identity), sender=current_user.username, chat_id=current_user.dept_id)
    db.session.add(new_message)
    db.session.commit()
    emit('new_message', {'msg': new_message.data, 'time': str(new_message.date.time())[0:5], 'current_user': new_message.sender_id, 'sender': new_message.sender, 'i': h(new_message.sender+new_message.sender_id)}, room=h(current_user.dept_id))


