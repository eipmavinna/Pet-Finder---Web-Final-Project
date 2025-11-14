from flask import request, jsonify, abort, session
from sqlalchemy.sql.expression import select, desc
from datetime import datetime, UTC
from flask_login import login_required, current_user

from app import db
from app.api import bp
from app.auth.models import UserSchema, FavPet


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
    print("went to route")
    data = request.json
    #check if not in db yet so not add same one
    newPet: FavPet = FavPet(id = int(data["pid"]), user_email = session["user_email"])#type:ignore
    db.session.add(newPet)
    db.session.commit()
    return jsonify({"message":"saved"})

