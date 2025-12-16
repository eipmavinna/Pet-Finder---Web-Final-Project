
// get all of the buttons
const lists =  document.getElementsByClassName("petButton");
let counter: number = 0;


document.addEventListener("DOMContentLoaded", async () => {
    modalChanging.makeButtonsProfile();
    
    const favButton = document.getElementById("favorite-button");
    favButton.addEventListener("click", () => addToFavoritesProfile(favButton.dataset.petId));
});

//all the pet ids from the dataabse
const StubIDSProfile: string[] = ["1000004", "10000156", "100001", "10000154", "10000158", "10000196", 
    "10000201", "10000202", "10000205", "10000155", "10000153", "10000152", "10000149", 
    "1000001", "100000", "10000193", "10000190", "10000178", "10000176", "10000174"]; 

// Pivoting and hardcoding the info for now - editing will now be a separate page
// async function loadUserInfo() {
//     const container = document.getElementById("user-info");
//     const emailField = document.createElement('input');
//     emailField.innerText = "Email";
// }
 //


async function addToFavoritesProfile(petId: string){
    const favButton = document.getElementById("favorite-button");
    console.log("add?")
    const isFav: boolean = await isFavoriteProfile(petId);
    if(isFav){
        favButton.innerHTML = `<img src="/static/icons/favorite.png" alt="Favorite" width="24" height="24">`;
    }else{
        favButton.innerHTML = `<img src="/static/icons/unfavorite.png" alt="Unfavorite" width="24" height="24">`;
    }
    //want to access the FavPet table and add something with the user's id and the pet id
    const response = await fetch("/api/favoritePet/", {
        method: "POST",
        credentials: "same-origin", // send session cookie
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({pid: petId})
    })
    const msg = await validateJSONProfile(response);
    const outerDiv = document.getElementById("favPetsDiv");
    if(msg['message'] === "saved"){
        const newDiv = document.createElement("div");
        newDiv.id = `${petId}_div`;
        //newDiv.innerHTML = `<button type="button" class="petButton  image-button" data-pet-id="${petId}" data-bs-toggle="modal" data-bs-target="#exampleModal">`;
        modalChanging.loadPetsProfile(petId,newDiv);
        
        outerDiv.prepend(newDiv); //how do I make this append to the beginning of the children

        const btn = <HTMLButtonElement> newDiv.querySelector('button');
        loadOnePetProfile(btn);
        btn.addEventListener("click",() => modalChanging.changeData(petId));
    }else{
        console.log(msg);
        const deleted = document.getElementById(`${petId}_div`);
        deleted.remove();

    }

    console.log("added " + petId)
}



async function isFavoriteProfile(petId: string): Promise<boolean> {
    const response = await fetch(`/api/favoritePet/check/${encodeURIComponent(petId)}`, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });
    const data = await modalChanging.validateJSONProfile(response);  // <— pass Response, NOT parsed JSON
    return data.exists;
}    
export namespace modalChanging{

    export async function changeData(pid: string){

        fillModalProfile(pid);

        //set fav button petID so it can add or remove the pet id from the db
        const favButton = document.getElementById("favorite-button");
        favButton.dataset.petId = pid;
        console.log("favButton id: "+ favButton.dataset.petId)
        //if isfavorite, "Delete from favs", else "Add to favs"
        if(await isFavoriteProfile(pid)){
            favButton.innerHTML = `<img src="/static/icons/unfavorite.png" alt="Unfavorite" width="24" height="24">`;
        }else{
            favButton.innerHTML = `<img src="/static/icons/favorite.png" alt="Favorite" width="24" height="24">`;
        }
    }

    export async function makeButtonsProfile(){
        const buttonDiv = <HTMLDivElement> document.getElementById("buttons-div")
        for(const id of StubIDSProfile){
            //make a div for each new button
            if(await isFavoriteProfile(id)){
                const newDiv = <HTMLDivElement> document.createElement("div");
                newDiv.id = `${id}_div`;
                buttonDiv.appendChild(newDiv);
                loadPetsProfile(id, newDiv)
            }
        }
    }
    
    export async function loadPetsProfile(id: string, newDiv: HTMLDivElement){

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


        const pet = await validateJSONProfile(response);

        //get what we need from the API
        //name, orgID, imageURL
        const name = pet.data[0].attributes.name;
        const orgsID = pet.data[0].relationships.orgs.data[0].id;
        const imageURL = pet.data[0].attributes.pictureThumbnailUrl;  

        //fetch from the organizations in the api  
        const orgsURL= `${baseURL}public/orgs/${orgsID}`;
        const response2 = await fetch(orgsURL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/vnd.api+json",
                    "Authorization": "7mZmJj1Y", 
                },
        });

            
        const organizations = await validateJSONProfile(response2);

        //get the organizationcity/state
        const orgLocationCity = organizations.data[0].attributes.citystate;

        //getting the image or putting the stub image in
        if(imageURL == null){
            btn.innerHTML = `<img src="/static/icons/petStubImage.png" alt="No stub Available"><p>${name}</p><p>${orgLocationCity}</p>`;

        }else{
            btn.innerHTML = `<img src="${imageURL}" alt="No Image Available"><p>${name}</p><p>${orgLocationCity}</p>`;
        }
        

        newDiv.append(btn)   
    }
 

    export async function fillModalProfile(id: string){
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
          
        const pet = await validateJSONProfile(response);

        //get the information we need from the api for the modal
        //name, age group, gender, breed, description, orgID
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
        const imageURL = pet.data[0].attributes.pictureThumbnailUrl;  // put something here to add a stub image if there isn't one in the api

        //get org information we need from the organization that the pet ID belongs to

        const orgsURL= `${baseURL}public/orgs/${orgsID}`;
        const response2 = await fetch(orgsURL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/vnd.api+json",
                    "Authorization": "7mZmJj1Y", 
                },
        });

            
        const organizations = await validateJSONProfile(response2);

        const orgLocationCity = document.getElementById("petLocation");
        orgLocationCity.textContent = "Location: " + (organizations.data[0].attributes.citystate ?? "N/A");

        const petURL = document.getElementById("petURL") as HTMLAnchorElement;
        petURL.href = organizations.data[0].attributes.url ?? "#";

       const img = <HTMLImageElement> document.getElementById("petImage")
        
       //set the image
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


    //validate JSON
    export async function validateJSONProfile(response: Response): Promise<any> {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }
}

    export async function loadOnePetProfile(btn: HTMLButtonElement){

            let thisID: string = btn.dataset.petId;

            const baseURL = "https://api.rescuegroups.org/v5/";
            const animalsURL = `${baseURL}public/animals/${thisID}`

            //get pet data from the api

            const response = await fetch(animalsURL, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/vnd.api+json",
                        "Authorization": "7mZmJj1Y", 
                    },
            });


            const pet = await validateJSONProfile(response);

            //get the specific data needed from the api
            //name, orgsID, imageURL

            const name = pet.data[0].attributes.name;
            const orgsID = pet.data[0].relationships.orgs.data[0].id;
            const imageURL = pet.data[0].attributes.pictureThumbnailUrl;

            //get org information based on the pet id

            const orgsURL= `${baseURL}public/orgs/${orgsID}`;
            const response2 = await fetch(orgsURL, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/vnd.api+json",
                        "Authorization": "7mZmJj1Y", 
                    },
                });

            
            //get specific pet information for the page
            //organization city/state
            const organizations = await validateJSONProfile(response2);

            const orgLocationCity = organizations.data[0].attributes.citystate;

        
            btn.innerHTML = `<img src="${imageURL}" alt="ImageOfAnimal"><p>${name}</p><p>${orgLocationCity}</p>`;

    }


    export async function validateJSONProfile(response: Response): Promise<any> {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }




