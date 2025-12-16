
document.addEventListener("DOMContentLoaded", async () => {

    makeButtons();
    
    const favButton = document.getElementById("favorite-button");
    const loginButton = document.getElementById("login_btn");
    if(await IsLoggedIn()){
        loginButton.innerText = "Log Out";
        console.log("logged in");
        favButton.addEventListener("click", () => addToFavorites(favButton.dataset.petId));
    }else{
        loginButton.innerText = "Log In"
        favButton.remove()
    }

    const profileBtn = document.getElementById("profile");
    profileBtn.addEventListener("click", async function (e){
        e.preventDefault();
        e.stopImmediatePropagation();
        if(await IsLoggedIn()){
            window.location.href = '/profile/';
            return;
        }
        const loginModal = document.getElementById("profileModal");
        const modal = (window as any).bootstrap.Modal.getOrCreateInstance(loginModal);
        modal.show();
    });

});

async function ProfileRouting(){
    if(await IsLoggedIn()){
        window.location.href = '/profile/';

    }else{
        //show the modal
        
        console.log("not logged in");
    }
}

async function IsLoggedIn(): Promise<boolean>{
        const response = await fetch(`/api/isLoggedIn/`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });
        const data = await validateJSON(response);
        return data.signedIn;
}

// get all of the buttons
const homeLists =  document.getElementsByClassName("petButton");


//Buck, Nelly, Shiloh, Bella, Sam, Benz, Sparkle B, Suri, Bentley, Buffy, Maxine, Hollie, Foxy Boy, Bernie, Shyann, Herb C1371, WILLIE, Brady, Bree, Pomegranate
let StubIDS: string[] = ["1000004", "10000156", "100001", "10000154", "10000158", "10000196", 
    "10000201", "10000202", "10000205", "10000155", "10000153", "10000152", "10000149", 
    "1000001", "100000", "10000193", "10000190", "10000178", "10000176", "10000174"]; 

async function makeButtons(){
    const buttonDiv = <HTMLDivElement> document.getElementById("buttons-div")
    for(const id of StubIDS){
        //make a div for each new button
        const newDiv = <HTMLDivElement> document.createElement("div");
        buttonDiv.appendChild(newDiv);
        loadHomePets(id, newDiv)
    }
}


async function loadHomePets(id: string, newDiv: HTMLDivElement){

        const btn = <HTMLButtonElement> document.createElement('button');
        btn.addEventListener("click",() => changeData(id));
        btn.classList.add("petButton");
        btn.setAttribute("data-pet-id", id);
        btn.setAttribute("data-bs-toggle", "modal");
        btn.setAttribute("data-bs-target","#exampleModal");


        const baseURL = "https://api.rescuegroups.org/v5/";
        const animalsURL = `${baseURL}public/animals/${id}`

        const response = await fetch(animalsURL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/vnd.api+json",
                    "Authorization": "7mZmJj1Y", 
                },
        });


        const pet = await validateHomeJSON(response);

        //get the needed pet information from the api to display on the home page
        //name, orgsID, imageURL
        const name = pet.data[0].attributes.name;
        const orgsID = pet.data[0].relationships.orgs.data[0].id;
        const imageURL = pet.data[0].attributes.pictureThumbnailUrl;

            
        const orgsURL= `${baseURL}public/orgs/${orgsID}`;
        const response2 = await fetch(orgsURL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/vnd.api+json",
                    "Authorization": "7mZmJj1Y", 
                },
        });

        //get the needed pet organization information from the api to display on the home page
        //organization city/state

        const organizations = await validateHomeJSON(response2);

        const orgLocationCity = organizations.data[0].attributes.citystate;

        if(imageURL == null){
            btn.innerHTML = `<img src="/static/icons/petStubImage.png" alt="No stub Available"><p>${name}</p><p>${orgLocationCity}</p>`;

        }else{
            btn.innerHTML = `<img src="${imageURL}" alt="No Image Available"><p>${name}</p><p>${orgLocationCity}</p>`;
        }
        

        newDiv.append(btn)
    
}


async function validateHomeJSON(response: Response): Promise<any> {
    if (response.ok) {
        return response.json();
    } else {
        return Promise.reject(response);
    }
}


    async function changeData(pid: string){

        fillModal(pid);

        //set fav button petID so it can add or remove the pet id from the db
        if(await IsLoggedIn()){
            const favButton = document.getElementById("favorite-button");
            favButton.dataset.petId = pid;
            console.log("favButton id: "+ favButton.dataset.petId)
            if(await isFavorite(pid)){
                //favButton.innerText = "Delete from favorites"
                favButton.innerHTML = `<img src="/static/icons/unfavorite.png" alt="Unfavorite" width="24" height="24">`;
                console.log("unfav")
            }else{
                //favButton.innerText = "Add to favorites"
                favButton.innerHTML = `<img src="/static/icons/favorite.png" alt="Favorite" width="24" height="24">`;
                console.log("unfav")
            }
            console.log("is favorite: " + await isFavorite(pid))
        }
        

        //TODO add the more detailed information here
    }


    async function isFavorite(petId: string): Promise<boolean> {
        const response = await fetch(`/api/favoritePet/check/${encodeURIComponent(petId)}`, {
            method: "GET",
            //credentials: "same-origin", // send session cookie
            headers: {
                "Accept": "application/json"
            }
        });
        const data = await validateJSON(response);  // <— pass Response, NOT parsed JSON
        return data.exists;
    }



    async function addToFavorites(petId: string){
        //if "Delete from favorites" change to "Add to favorites", etc
        const favButton = document.getElementById("favorite-button");
        if(await isFavorite(petId)){
            favButton.innerHTML = `<img src="/static/icons/favorite.png" alt="Favorite" width="24" height="24">`;

        }else{
            favButton.innerHTML = `<img src="/static/icons/unfavorite.png" alt="Unfavorite" width="24" height="24">`;

        }
        //want to access the FavPet table and add something with the user's id and the pet id
        await fetch("/api/favoritePet/", {
            method: "POST",
            credentials: "same-origin", // send session cookie
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({pid: petId})
        })
        console.log("added " + petId)
    }



    async function validateJSON(response: Response): Promise<any> {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }

    async function fillModal(id: string){
        const modalBodyDiv = document.getElementById("bodyDiv");
        const baseURL = "https://api.rescuegroups.org/v5/";
        const animalsURL = `${baseURL}public/animals/${id}`

        const response = await fetch(animalsURL, {
            method: "GET",
            headers: {
                "Content-Type": "application/vnd.api+json",
                "Authorization": "7mZmJj1Y", 
            },
        });

        const pet = await validateHomeJSON(response);

        //get the needed pet information from the api for the modal
        //name, ageGroup, gender, breed, description, orgsID, imageURL

        const name = document.getElementById("petName");
        name.textContent = "Name: " + (pet.data[0].attributes.name ?? "N/A");
        
        const ageGroup = document.getElementById("petAge");
        ageGroup.textContent = "Age: " + (pet.data[0].attributes.ageGroup ?? "N/A");

        const gender =  document.getElementById("petGender");
        gender.textContent = "Gender: " + (pet.data[0].attributes.sex ?? "N/A");

        const breed = document.getElementById("petBreed");
        breed.textContent = "Breed: " + (pet.data[0].attributes.breedString ?? "N/A");

        const description = document.getElementById("petDescription");
        description.textContent = "Description: " + (pet.data[0].attributes.descriptionText ?? "N/A");

        

        const orgsID = pet.data[0].relationships.orgs.data[0].id;
        const imageURL = pet.data[0].attributes.pictureThumbnailUrl;

        
        //get the needed organization information from the api based on the pet ID
        //organization city/state
            
        const orgsURL= `${baseURL}public/orgs/${orgsID}`;
        const response2 = await fetch(orgsURL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/vnd.api+json",
                    "Authorization": "7mZmJj1Y", 
                },
        });
            
        const organizations = await validateHomeJSON(response2);

        const orgLocationCity = document.getElementById("petLocation");
        orgLocationCity.textContent = "Location: " + (organizations.data[0].attributes.citystate ?? "N/A");

        const petURL = document.getElementById("petURL") as HTMLAnchorElement;
        petURL.href = organizations.data[0].attributes.url ?? "#";

       const img = <HTMLImageElement> document.getElementById("petImage")
        
       //fill in the image on the modal or if there is no image, fill it with the stub
        if(imageURL == null){            
            img.src = '/static/icons/petStubImage.png';
            img.alt = 'No stub Available';
            modalBodyDiv.append(img);

        }else{
            img.src = imageURL;
            img.alt = 'No Image Available';
            modalBodyDiv.append(img);
        }

    }

