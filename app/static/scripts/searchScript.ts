document.addEventListener("DOMContentLoaded", async () => {
    
    console.log("in typescript")
    
    const form = document.getElementById("filterForm") as HTMLFormElement;
    console.log("running");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        console.log("hit submit");
        await getFilteredPets();
    });
    const submitBtn = <HTMLButtonElement> document.getElementById("submit-btn");

    // submitBtn.addEventListener("click", (event) => {
    //     event.preventDefault(); // THIS prevents the form from submitting/reloading
    //     getFilteredPets();
    //     console.log("hit submit")
//
        const favButton = document.getElementById("favorite-button");
        if(await IsLoggedInSearch()){
            console.log("logged in");
            favButton.addEventListener("click", () => addToFavoritesSearch(favButton.dataset.petId));
        }else{
            favButton.remove()
        }
    
    
    const profileBtn = document.getElementById("profile");
    profileBtn.addEventListener("click", async function (e){
        e.preventDefault();
        e.stopImmediatePropagation();
        if(await IsLoggedInSearch()){
            window.location.href = '/profile/';
            return;
        }
        const loginModal = document.getElementById("profileModal");
        const modal = (window as any).bootstrap.Modal.getOrCreateInstance(loginModal);
        modal.show();
    });
});





async function getFilteredPets(){
    const form = <HTMLFormElement> document.getElementById("filterForm");
    const formData = new FormData(form);

    const response = await fetch("/search/", {
            method: "POST",
            headers: {
                "Accept": "application/json"
            },
            body: formData
    });

    const data = await validateJSONSearch(response);


    makeButtonsSearch(data.results);

}

async function IsLoggedInSearch(): Promise<boolean>{
        const response = await fetch(`/api/isLoggedIn/`, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });
        const data = await validateJSONSearch(response);
        return data.signedIn;
}

//Buck, Nelly, Shiloh, Bella, Sam, Benz, Sparkle B, Suri, Bentley, Buffy, Maxine, Hollie, Foxy Boy, Bernie, Shyann, Herb C1371, WILLIE, Brady, Bree, Pomegranate
// //const StubIDS: string[] = ["1000004", "10000156", "100001", "10000154", "10000158", "10000196", 
//     "10000201", "10000202", "10000205", "10000155", "10000153", "10000152", "10000149", 
//     "1000001", "100000", "10000193", "10000190", "10000178", "10000176", "10000174"]; 

//const StubIDS2: string[] = ["1000004"]


async function makeButtonsSearch(list: string[]){
    const buttonDiv = <HTMLDivElement> document.getElementById("buttons-div")
    buttonDiv.replaceChildren();
    for(const id of list){
        //make a div for each new button
        const newDiv = <HTMLDivElement> document.createElement("div");
        buttonDiv.appendChild(newDiv);
        loadHomePetsSearch(id, newDiv)
    }
}

// get all of the buttons
//const homeLists =  document.getElementsByClassName("petButton");



async function loadHomePetsSearch(id: string, newDiv: HTMLDivElement){
    //let homeCounter: number = 0;
    //for (const item of homeLists) {
        //let thisID: string = StubIDS[homeCounter];
        //const btn = item as HTMLButtonElement;
        //let thisID: string = thisButton.dataset.petId;

        const btn = <HTMLButtonElement> document.createElement('button');
        btn.addEventListener("click",() => changeDataSearch(id));
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


        const pet = await validateHomeJSONSearch(response);

        let name = pet.data[0].attributes.name;
        if(name.toLowerCase().includes("adopted")){
            return;
        }
        const orgsID = pet.data[0].relationships.orgs.data[0].id;
        const imageURL = pet.data[0].attributes.pictureThumbnailUrl;  // put something here to add a stub image if there isn't one in the api

            
        const orgsURL= `${baseURL}public/orgs/${orgsID}`;
        const response2 = await fetch(orgsURL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/vnd.api+json",
                    "Authorization": "7mZmJj1Y", 
                },
        });

            
        const organizations = await validateHomeJSONSearch(response2);

        const orgLocationCity = organizations.data[0].attributes.citystate;

        if(imageURL == null){
            btn.innerHTML = `<img src="/static/icons/petStubImage.png" alt="No stub Available"><p>${name}</p><p>${orgLocationCity}</p>`;

        }else{
            btn.innerHTML = `<img src="${imageURL}" alt="No Image Available"><p>${name}</p><p>${orgLocationCity}</p>`;
        }
        

        newDiv.append(btn)
    
}


async function validateHomeJSONSearch(response: Response): Promise<any> {
    if (response.ok) {
        return response.json();
    } else {
        return Promise.reject(response);
    }
}


    async function changeDataSearch(pid: string){
        //fill the modal that has been clicked
        fillModalSearch(pid);

        //set fav button petID so it can add or remove the pet id from the db
        if(await IsLoggedInSearch()){
            const favButton = document.getElementById("favorite-button");
            if(favButton != null){
                favButton.dataset.petId = pid;
                console.log("favButton id: "+ favButton.dataset.petId)
                //if isfavorite, "Delete from favs", else "Add to favs"
                if(await isFavoriteSearch(pid)){
                    //favButton.innerText = "Delete from favorites"
                    favButton.innerHTML = `<img src="/static/icons/unfavorite.png" alt="Unfavorite" width="24" height="24">`;
                }else{
                    //favButton.innerText = "Add to favorites"
                    favButton.innerHTML = `<img src="/static/icons/favorite.png" alt="Favorite" width="24" height="24">`;
                }
            }
            console.log("is favorite: " + await isFavoriteSearch(pid))
        }
        

        //TODO add the more detailed information here
    }


    async function isFavoriteSearch(petId: string): Promise<boolean> {
        const response = await fetch(`/api/favoritePet/check/${encodeURIComponent(petId)}`, {
            method: "GET",
            //credentials: "same-origin", // send session cookie
            headers: {
                "Accept": "application/json"
            }
        });
        const data = await validateJSONSearch(response);  // <— pass Response, NOT parsed JSON
        return data.exists;
    }



    async function addToFavoritesSearch(petId: string){
        //if "Delete from favorites" change to "Add to favorites", etc
        const favButton = document.getElementById("favorite-button");
        if(await isFavoriteSearch(petId)){
            if(favButton){
                favButton.innerHTML = `<img src="/static/icons/favorite.png" alt="Favorite" width="24" height="24">`;
            }

        }else{
            if(favButton){
                favButton.innerHTML = `<img src="/static/icons/unfavorite.png" alt="Unfavorite" width="24" height="24">`;
            }
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


    async function fillModalSearch(id: string){
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

        const pet = await validateHomeJSONSearch(response);

        //ageGroup, sex, breedPrimary, breedSecondary, descriptionText, 
        const name = document.getElementById("petName");
        if(name){
            name.textContent = "Name: " + (pet.data[0].attributes.name ?? "N/A");
        }
        
        
        const ageGroup = document.getElementById("petAge");
        if(ageGroup){
            ageGroup.textContent = "Age: " + (pet.data[0].attributes.ageGroup ?? "N/A");
        }
        

        const gender =  document.getElementById("petGender");
        if(gender){
           gender.textContent = "Gender: " + (pet.data[0].attributes.sex ?? "N/A"); 
        }
        

        const breed = document.getElementById("petBreed");
        if(breed){
            breed.textContent = "Breed: " + (pet.data[0].attributes.breedString ?? "N/A");
        }
        

        const description = document.getElementById("petDescription");
        if(description){
            description.textContent = "Description: " + (pet.data[0].attributes.descriptionText ?? "N/A");
        }
        


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
            
        const organizations = await validateHomeJSONSearch(response2);

        const orgLocationCity = document.getElementById("petLocation");
        if(orgLocationCity){
            orgLocationCity.textContent = "Location: " + (organizations.data[0].attributes.citystate ?? "N/A");
        }
        
        const petURL = document.getElementById("petURL") as HTMLAnchorElement;       // ---------
        petURL.href = organizations.data[0].attributes.url ?? "#";

       const img = <HTMLImageElement> document.getElementById("petImage")
        
        if(imageURL == null){
            
            img.src = '/static/icons/petStubImage.png';
            img.alt = 'No stub Available';
            if(modalBodyDiv){
                modalBodyDiv.append(img);
            }
            

        }else{
            img.src = imageURL;
            img.alt = 'No Image Available';
            if(modalBodyDiv){
                modalBodyDiv.append(img);
            }
        }

    }


    async function validateJSONSearch(response: Response): Promise<any> {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }

    

