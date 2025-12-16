from typing import Sequence, Tuple
from sqlalchemy import Row, Select
from flask import  render_template, redirect, url_for, current_app, session, flash, jsonify, request
from flask_login import login_required, current_user
from sqlalchemy.sql.expression import select


from app import db
from app.core import bp
from app.auth.models import User
# from app.core.models import Bank, Account, Customer # Trying to be careful as we slowly remove the starter project code that we started with
from app.core.models import FavPet
from app.core.forms import SearchForm, EditForm
import requests

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
    return f"{session.get("user_email")} {session.get("_user_id")} {session.get("_fresh")} {session.get("sdjdjs")}"



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

    return render_template("user_profile.html", favPets=favPets, email=session.get("user_email"), zip=users[0].zipcode)#zip=session.get("user_zipcode"))
     

@bp.get('/search/')
def search():
    form: SearchForm = SearchForm()
    return render_template("search.html", form=form)


@bp.post('/search/')
def searchResults():
    form = SearchForm(request.form)
    response = requests.get(
        "https://api.rescuegroups.org/v5/public/animals?include=species,orgs",
        headers={"Content-Type": "application/vnd.api+json", "Authorization": "7mZmJj1Y"}
    )
    responseData = response.json()

    age_group = (form.age_group.data or "").lower()

    firstFilter = responseData["data"]

    #if an age group was added then filter by age group
    if(age_group != ""):
        ageMatches = [pet
               for pet in responseData["data"]
                if "ageGroup" in pet["attributes"] and
                age_group in pet["attributes"]["ageGroup"].lower()]
        
        firstFilter = ageMatches
    

    #dog species id is 8 as a string
    #cat species id is 3 as a string

    speciesID: str = ""
    if (form.animal_type.data == "cat"):
         speciesID = "3"
    elif(form.animal_type.data == "dog"):
        speciesID = "8"
    else:
        speciesID = ""
    

    secondFilter = firstFilter

    zip = form.zipcode.data

    #if a pet type was added then filter by age group
    if(speciesID != "" and zip != ""):
        matching_pet_ids = [
                    pet
                    for pet in firstFilter
                    if any(
                    species["id"] == speciesID
                    for species in pet["relationships"]["species"]["data"])]
        secondFilter = matching_pet_ids
    elif(speciesID != ""):
        matching_pet_ids = [
                    pet["id"]
                    for pet in firstFilter
                    if any(
                    species["id"] == speciesID
                    for species in pet["relationships"]["species"]["data"])]
        secondFilter = matching_pet_ids

  

    toReturn = secondFilter

    if(zip == ""):
        return jsonify({
            'results': toReturn,
        })

    
    # return jsonify({
    #     'results': toReturn
    # })


    #get zips of all the pets filtered so far
    dict_of_zipcodes = {}
    for pet in secondFilter:

        
        organizationID = pet["relationships"]["orgs"]["data"][0]["id"]


        orgs_url = f"https://api.rescuegroups.org/v5/public/orgs/{organizationID}"

        organization = requests.get(
            orgs_url,
            headers={
                "Content-Type": "application/vnd.api+json",
                "Authorization": "7mZmJj1Y"
            }
        )

        postal_code = organization.json()["data"][0]["attributes"]["postalcode"]
        
        dict_of_zipcodes[pet["id"]] = postal_code



    #checking by zipcode
    
    #matching_zip_ids = None

    if(zip != ""):
        # #find exact matches
        # matching_zip_ids = [
        #      key
        #      for key, value in dict_of_zipcodes.items()
        #      if zip == value]

        #find closest 3 matches
        idsPetsNearby = findNearbyDistances(zip, dict_of_zipcodes)


    petIds: list[str] = [] #idsPetsNearby.keys()
    for dict in idsPetsNearby:
        petIds.append(list(dict.keys())[0])


    
    # print(matching_zip_ids)
    # print(idsPetsNearby)

    return jsonify({
        'results': petIds
    })
    



def findNearbyDistances(Inputzipcode: int | str, codes: dict) -> list[dict[str, int]]:
    toRet: list[dict[str, int]] = []

    for _ in range(len(codes)):
        toRet.append({"0000": 999999})

    for petId, zip in codes.items():
        currInd = len(codes) - 1
        stopped = False

        while not stopped:
            try:
                nextZip = int(zip)
            except ValueError:
                nextZip = 111111

            if nextZip < next(iter(toRet[currInd].values())):
                currInd -= 1
                if currInd < 0:
                    stopped = True
            else:
                stopped = True

        if currInd < len(codes) - 1:
            currInd += 1
            try:
                nextZip = int(zip)
            except ValueError:
                nextZip = 111111
            holder = (petId, nextZip)
            

            while currInd < len(codes):
                currVals = (
                    next(iter(toRet[currInd].keys())),
                    next(iter(toRet[currInd].values()))
                )
                toRet[currInd] = {holder[0]: holder[1]}
                holder = currVals
                currInd += 1

    return toRet


@bp.get('/')
@bp.get('/home/')
def home():
    StubIDS: list[str] = ["1000004", "10000156", "100001", "10000154", "10000158"];    #TODO: this is where the 20 featured pets will go (search based on zipcode, grab top 20)
    return render_template("home.html", stubs=StubIDS)


@bp.get('/edit/user/')
@login_required
def edit_user():
    form: EditForm = EditForm()
    #send in the current information to the html template
    return render_template("edit_info.html", form=form)
    

@bp.post('/edit/user/')
@login_required
def post_edit_user():
    form: EditForm = EditForm()
    if form.validate():

        query = select(User).filter(User.email == session.get("user_email"))
        user_row = db.session.execute(query).first()
        user: User|None = user_row[0] if user_row is not None else None
        #user = current_user

        zipcode: str|None = form.zipcode.data  #convert to int later if not none
        currPass: str|None = form.realPass.data
        newPass: str|None = form.newPass.data

        if ((newPass == "") != (currPass == "")): #please input both the current password and the new password in order to change the 
            flash("Enter both current and new password to change the password")
            return render_template("edit_info.html", form=form)
        
        if currPass and newPass:    #which do I use
            #validate the password, if not valid flash a message saying to enter the correct password
            if user != None and user.verify_password(currPass):
                #change the password
                user.password = newPass #type:ignore
            else:
                flash("Incorrect password")
                return render_template("edit_info.html", form=form)
        
        
        if user is not None and zipcode is not None and zipcode != "":
            try:
                user.zipcode = int(zipcode)
            except ValueError:
                flash("Invalid zipcode")
                return render_template("edit_info.html", form=form)
            
        print("didn't change zipcode")

        db.session.commit()
        return redirect(url_for("core.profile"))
    else:
        print("didn't validate")
        for field,error_msg in form.errors.items():
            flash(f"{field}: {error_msg}")
        return render_template("edit_info.html", form=form)
        


    #if all works out well, redirect to the profile
    
    











# def get_all_accounts() -> list[Account]:
#     query: Select[Tuple[Account]] = db.select(Account)
#     rows:  Sequence[Row[Tuple[Account]]] = db.session.execute(query).all()
#     accounts: list[Account] = [row[0] for row in rows]
#     return accounts

# def get_all_banks() -> list[Bank]:
#     query: Select[Tuple[Bank]] = db.select(Bank)
#     rows: Sequence[Row[Tuple[Bank]]] = db.session.execute(query).all()
#     banks: list[Bank] = [row[0] for row in rows]
#     return banks

# def get_all_customers() -> list[Customer]:
#     query: Select[Tuple[Customer]] = db.select(Customer)
#     rows: Sequence[Row[Tuple[Customer]]] = db.session.execute(query).all()
#     custs: list[Customer] = [row[0] for row in rows]
#     return custs



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


