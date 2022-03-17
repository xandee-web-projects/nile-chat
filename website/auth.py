from flask import Blueprint, render_template, request, flash, redirect, url_for
from .models import User, Chat
from . import db, load_file
from flask_login import login_user, login_required, logout_user, current_user
import requests as req
from .hash import hsh, h

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        student_id = request.form['student_id'].replace(" ", "")
        password = request.form['password']
        r = req.post("http://www.sis.nileuniversity.edu.ng/my/loginAuth.php", data={"username": student_id, "password": password, "LogIn": "LOGIN"})
        res = r.content.decode()
        if res.find("incorrect") == -1:
            # str_to_find = '<h4 class="card-title m-t-10">'
            # idx = res.find(str_to_find)+len(str_to_find)
            # new_sub_str = res[idx:idx+100].replace("</h4>", "")
            # all_names = new_sub_str.split()
            # name = all_names[0] + " " + all_names[2]
            user = User.query.get(student_id)
            if not user:
                user = User(student_id, hsh(int(student_id)))
                db.session.add(user)
                if not Chat.query.get(user.dept_id):
                    group = Chat(id=user.dept_id, name=load_file()[str(user.dept_id)[3:]]+" "+student_id[0:2], room=h(user.dept_id))
                    db.session.add(group)
                db.session.commit()
            if current_user.is_authenticated:
                logout_user()
            login_user(user, True)
            return redirect(url_for('auth.choose_username'))
        else:
            flash('Wrong student ID or password', 'danger')
    return render_template("login.html")

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))

@auth.route('/username', methods=['GET', 'POST'])
@login_required
def choose_username(): 
    if request.method == "POST":
        username = request.form['username'].replace(" ", "")
        if len(username) < 3:
            flash("This username is short like you", 'danger')
            return redirect(url_for('auth.choose_username'))
        if User.query.filter(db.and_(User.username==username, User.dept_id==current_user.dept_id, User.id!=current_user.id)).first():
            flash("Some other guy has taken that name", 'danger')
            return redirect(url_for('auth.choose_username'))
        current_user.username = username
        db.session.commit()
        return redirect(url_for('views.chat'))
    return render_template('username.html', username=current_user.username if current_user.username else "")
