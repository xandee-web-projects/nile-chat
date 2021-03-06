from flask import Blueprint, jsonify, render_template, redirect, url_for, request, json
from flask_login import login_required, current_user
from .models import Chat, User
from . import db, emit, socketio

admin = Blueprint('admin', __name__)

@admin.route('/', methods=['GET', 'POST'])
@login_required
def _admin():
    if current_user.id != 211605045:
        return redirect(url_for('views.chat'))
    return render_template('admin/admin.html', groups=Chat.query.all(), total_users=User.query.count())

@socketio.on('gen_msg', namespace='/chat')
@login_required
def gen_msg(data):
    emit("general_message", {"msg": data['message']}, room=data['dept_id'])


@admin.route('/edit', methods=['GET', 'POST'])
@login_required
def edit():
    if current_user.id != 211605045:
        return redirect(url_for('admin.chat'))
    if request.method == "POST":
        group_id = request.form['group_id']
        attr = request.form['attr']
        data = request.form['data']
        chat = Chat.query.get(group_id)
        if attr == "name":
            chat.name = data
        if attr == "abbr":
            chat.abbr = data
        db.session.commit()
    return render_template('admin/edit.html', groups=Chat.query.all())
