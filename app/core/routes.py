from typing import Sequence, Tuple
from sqlalchemy import Row, Select
from flask import  render_template, redirect, url_for, current_app, session
from flask_login import login_required, current_user

from app import db
from app.core import bp
from app.auth.models import User
from app.core.models import Bank, Account, Customer

@bp.get('/')  # attach a bunch of routes to the blueprint    //what are blueprints again?
@login_required
def index():
    return redirect(url_for('core.get_accounts'))

@bp.get('/accounts/')
@login_required
def get_accounts():
    accounts: list[Account] = get_all_accounts()
    return render_template('index.html', accounts=accounts)

# TODO: define routes for listing Banks and Customers

@bp.get('/banks/')
@login_required
def get_banks():
    banks: list[Bank] = get_all_banks()
    return render_template('banks.html',banks=banks)


@bp.get('/customers/')
@login_required
def get_custs():
    custs: list[Customer] = get_all_customers()
    return render_template('custs.html',custs=custs)



#Simple routes to each page

#Home page will have a link to this, will require login
@bp.get('/profile/')
@login_required
def profile():
    if session.get("isShelter"):
        return render_template("shelter_profile.html")
    return render_template("user_profile.html")

@bp.get('/search/')
def search():
    return render_template("search.html")

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