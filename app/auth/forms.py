from flask_wtf import FlaskForm
from wtforms import EmailField, PasswordField, SubmitField, IntegerField
from wtforms.validators import InputRequired, Email, Length

MIN_PASSWORD_LENGTH: int = 8

class LoginForm(FlaskForm):
    email: EmailField = EmailField('Email',
        validators=[InputRequired(), Email()])
    password: PasswordField = PasswordField('Password',
        validators=[InputRequired(), Length(min=MIN_PASSWORD_LENGTH)])
    submit: SubmitField = SubmitField("Login")

#adding signup forms here
class SignupFormUser(FlaskForm):
    
    #TODO make it so that the email field checks the current users and shelters to make sure there isn't another acct made with the same email

    email: EmailField = EmailField('Email',
        validators=[InputRequired(), Email()])
    password: PasswordField = PasswordField('Password',
        validators=[InputRequired(), Length(min=MIN_PASSWORD_LENGTH)])
    zipcode: IntegerField = IntegerField(validators=[InputRequired(), Length(min=5,max=5)])
    submit: SubmitField = SubmitField("Sign Up")

#TODO: shelter sign up
