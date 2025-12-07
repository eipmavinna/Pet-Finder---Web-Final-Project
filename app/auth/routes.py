from flask import current_app, render_template, redirect, url_for, flash, request, session
from flask import request
from sqlalchemy.sql.expression import select
from flask_login import login_user, logout_user, login_required, current_user

from app import db
from app.auth import bp
from app.auth.models import User
from app.auth.forms import LoginForm, SignupFormUser, SignupFormShelter

@bp.get('/login/')
def get_login():
    form: LoginForm = LoginForm()
    return render_template('login.html', form=form)

@bp.post('/login/')
def post_login():

    # IMPORTANT:    We need this to check both the users database table and the shelters database table. 
    # Login as whichever it finds, and send them to wherever they were going with something in the session saying whether they're a regular user or not.

    form: LoginForm = LoginForm()
    # until successful, the user will be forwarded back to get the login form
    next: str = url_for('auth.get_login')
    if form.validate():
        # get the email address and password out of the login form
        email: str = str(form.email.data)
        password: str = str(form.password.data)
        # look up the user with this email address (if any)    INSIDE BOTH THE USERS AND THE SHELTERS TABLES
        
        
        query = select(User).filter(User.email == str(email))
        user_row = db.session.execute(query).first()
        user: User|None = user_row[0] if user_row is not None else None

        #query = select(Shelter).filter(Shelter.email == str(email))
        #user_row = db.session.execute(query).first()
        #shelter: Shelter|None = user_row[0] if user_row is not None else None

        # if there is such a user and the password is correct, log them in
        if user is not None and user.verify_password(password):
            login_user(user)
            session["user_email"] = email
            # update the next url where the user should be redirected
            if 'next' in request.args and request.args['next'].startswith('/'):
                next = str(request.args['next'])
            elif 'HOME_PAGE' in current_app.config:
                next = str(current_app.config['HOME_PAGE'])
            else:
                next = '/'
            return redirect(next)
        else:
            flash("Invalid Credentials")
            return redirect(url_for('auth.get_login'))
    else:
        # on invalid form, flash all error messages
        for field,error_msg in form.errors.items():
            flash(f"{field}: {error_msg}")
        return redirect(url_for('auth.get_login'))



#Anna's added code:
@bp.get('/signup/user/')   #this needs to make sure that the username isn't taken by anything in either the users or the shelters table
def get_signup_user():
    form: SignupFormUser = SignupFormUser()
    #TODO query the database and send in a list of the current usernames from both the users and the shelters
    return render_template("sign_up.html", form=form)
    

@bp.post('/signup/user/')
def post_signup_user(): 
    form: SignupFormUser = SignupFormUser()
    if form.validate():

        email: str = form.email.data #type:ignore
        password: str = form.password.data #type:ignore
        zipcode: int = int(form.zipcode.data) #type:ignore

        query = select(User).filter(User.email == str(email))
        user_row = db.session.execute(query).first()
        user: User|None = user_row[0] if user_row is not None else None

        if(user is None):
            #add to db

            new_user: User = User() #add an empty list
            new_user.password = password
            new_user.email = email
            new_user.zipcode = zipcode

            db.session.add(new_user)
            db.session.commit()

            login_user(new_user)
            session["user_email"] = email

            if 'next' in request.args and request.args['next'].startswith('/'):
                next = str(request.args['next'])
            elif 'HOME_PAGE' in current_app.config:
                next = str(current_app.config['HOME_PAGE'])
            else:
                next = '/'
            return redirect(next)
        else:
            flash("Email already attached to an account")
            return redirect('/auth/signup/user/')  #TODO change this to next
        #TODO: check the email to see if it's in the database already, route to get_signup_user if already there
        # OR: 
        # if already exists:
        #   return redirect(url_for('auth.get_signup_user'))   #with some sort of message that the username is already taken
    else:
        for field,error_msg in form.errors.items():
            flash(f"{field}: {error_msg}")
        return redirect(url_for('auth.get_signup_user'))




@bp.route('/logout/')
@login_required
def route_logout():
    session.pop("user_email")
    logout_user()
    return redirect(url_for('auth.get_login'))
