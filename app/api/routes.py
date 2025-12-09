from flask import request, jsonify, abort, session
from sqlalchemy.sql.expression import select, desc
from datetime import datetime, UTC
from flask_login import login_required, current_user
from typing import Sequence, Tuple
from sqlalchemy import Row, Select

from app import db
from app.api import bp
from app.auth.models import UserSchema, FavPet, User
from sqlalchemy.sql.expression import select



################################################################################
# REST API
################################################################################

@bp.get('/user-info/')
@login_required
def get_user_info():
    """Get a JSON object with the current user's id and email address"""
    schema = UserSchema()
    return jsonify(schema.dump(current_user))

@bp.post("/favoritePet/")
@login_required
def add_favorite():
    
    data = request.json
    #check if not in db yet so not add same one
    #if in db, remove from db
    #if not there, add
    #query: Select[Tuple[User]] = db.select(User).filter(User.email == session.get("user_email"))
    #rows: Sequence[Row[Tuple[User]]] = db.session.execute(query).all()
    #users: list[User] = [row[0] for row in rows]
    #favPets: list[int] = users[0].favorites
    #if int(data["pid"]) in favPets: #type:ignore
    pet = FavPet.query.filter_by(id=int(data["pid"]), user_email=session["user_email"]).first() #type:ignore
    if pet:
        db.session.delete(pet)
        db.session.commit()
        print("deleted from db\n")
    else:
        newPet: FavPet = FavPet(id = int(data["pid"]), user_email = session["user_email"])#type:ignore
        db.session.add(newPet)
        db.session.commit()
        print("added to db\n")
    
    return jsonify({"message":"saved"})

@bp.get("/favoritePet/check/<int:pid>")
@login_required
def check_favorite(pid):
    exists = FavPet.query.filter_by(
        id=pid,
        user_email=session["user_email"]
    ).first() is not None

    return jsonify({"exists": exists})


@bp.get("/isLoggedIn/")
def check_logged_in():
    #emailFound: bool = "user_email" in session
    auth: bool = current_user.is_authenticated
    print(auth)
    return jsonify({"signedIn": auth})

