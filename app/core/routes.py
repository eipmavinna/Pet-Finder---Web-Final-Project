from typing import Sequence, Tuple
from sqlalchemy import Row, Select
from flask import  render_template, redirect, url_for, current_app, session
from flask_login import login_required, current_user

from app import db
from app.core import bp
from app.auth.models import User
from app.core.models import Bank, Account, Customer, FavPet
from app.core.forms import SearchForm

@bp.get('/tester/')
#@login_required
def get_favs():
    # query: Select[Tuple[str]] = db.select(User.email)
    # rowsAccts: Sequence[Row[Tuple[str]]] = db.session.execute(query).all()
    # favorites: list[str] = [row[0] for row in rowsAccts]
    query: Select[Tuple[User]] = db.select(User)
    rowsAccts: Sequence[Row[Tuple[User]]] = db.session.execute(query).all()
    users: list[User] = [row[0] for row in rowsAccts]
    return render_template("test.html",users=users)
    #return f"{session.get("_id")} {session.get("_user_id")} {session.get("_fresh")} {session.get("sdjdjs")}"


# These are all from the example code so I'm commenting them out so we still have them for reference
# @bp.get('/accounts/')
# @login_required
# def get_accounts():
#     accounts: list[Account] = get_all_accounts()
#     return render_template('index.html', accounts=accounts)

# # TODO: define routes for listing Banks and Customers

# @bp.get('/banks/')
# @login_required
# def get_banks():
#     banks: list[Bank] = get_all_banks()
#     return render_template('banks.html',banks=banks)


# @bp.get('/customers/')
# @login_required
# def get_custs():
#     custs: list[Customer] = get_all_customers()
#     return render_template('custs.html',custs=custs)



#Simple routes to each page

#Home page will have a link to this, will require login
@bp.get('/profile/')
@login_required
def profile():
    #session.get("_user_id")
    #query: Select[Tuple[User]] = db.select(User)
    #rowsAccts: Sequence[Row[Tuple[User]]] = db.session.execute(query).all()
    #users: list[User] = [row[0] for row in rowsAccts]
    query: Select[Tuple[User]] = db.select(User).filter(User.email == session.get("user_email"))
    rows: Sequence[Row[Tuple[User]]] = db.session.execute(query).all()
    users: list[User] = [row[0] for row in rows]
    favPets: list[int] = users[0].favorites
    return render_template("user_profile.html", favPets=favPets)
    
    

@bp.get('/search/')
def search():
    form: SearchForm = SearchForm()
    return render_template("search.html", form=form)

@bp.get('/')
@bp.get('/home/')
def home():
    return render_template("home.html")




def get_all_accounts() -> list[Account]:
    query: Select[Tuple[Account]] = db.select(Account)
    rows:  Sequence[Row[Tuple[Account]]] = db.session.execute(query).all()
    accounts: list[Account] = [row[0] for row in rows]
    return accounts

def get_all_banks() -> list[Bank]:
    query: Select[Tuple[Bank]] = db.select(Bank)
    rows: Sequence[Row[Tuple[Bank]]] = db.session.execute(query).all()
    banks: list[Bank] = [row[0] for row in rows]
    return banks

def get_all_customers() -> list[Customer]:
    query: Select[Tuple[Customer]] = db.select(Customer)
    rows: Sequence[Row[Tuple[Customer]]] = db.session.execute(query).all()
    custs: list[Customer] = [row[0] for row in rows]
    return custs