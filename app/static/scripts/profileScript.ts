
// get all of the buttons
const lists =  document.getElementsByClassName("petButton");
let counter: number = 0;


document.addEventListener("DOMContentLoaded", async () => {
    //loadUserInfo();
    modalChanging.loadPets();
    //const closeButton = document.getElementById("modal_close") as HTMLButtonElement | null;
    //if (closeButton) {
    //    closeButton.addEventListener("click", reloadPage);
    //}
    for(const button of lists){
        const btn = button as HTMLButtonElement;
        let thisID: string = btn.dataset.petId;
        //change the favbutton data to be the pet id
        btn.addEventListener("click",() => modalChanging.changeData(thisID));
    }
    const favButton = document.getElementById("favorite-button");
    favButton.addEventListener("click", () => addToFavorites(favButton.dataset.petId));
});

// Pivoting and hardcoding the info for now - editing will now be a separate page
// async function loadUserInfo() {
//     const container = document.getElementById("user-info");
//     const emailField = document.createElement('input');
//     emailField.innerText = "Email";
// }
 //

async function addToFavorites(petId: string){
    const favButton = document.getElementById("favorite-button");
    console.log("add?")
    const isFav: boolean = await isFavorite(petId);
    if(isFav){
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

async function isFavorite(petId: string): Promise<boolean> {
    const response = await fetch(`/api/favoritePet/check/${encodeURIComponent(petId)}`, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });
    const data = await modalChanging.validateJSON(response);  // <— pass Response, NOT parsed JSON
    return data.exists;
}    
export namespace modalChanging{

    export async function changeData(pid: string){

        //set fav button petID so it can add or remove the pet id from the db
        const favButton = document.getElementById("favorite-button");
        favButton.dataset.petId = pid;
        console.log("favButton id: "+ favButton.dataset.petId)
        //if isfavorite, "Delete from favs", else "Add to favs"
        if(await isFavorite(pid)){
            favButton.innerHTML = `<img src="/static/icons/unfavorite.png" alt="Unfavorite" width="24" height="24">`;
        }else{
            favButton.innerHTML = `<img src="/static/icons/favorite.png" alt="Favorite" width="24" height="24">`;
        }

        //TODO add the more detailed information here
    }


    

    


    


    export async function loadPets(){

        for (const item of lists) {
            //let thisID: string = IDS[counter];
            const btn = item as HTMLButtonElement;
            let thisID: string = btn.dataset.petId;

            const baseURL = "https://api.rescuegroups.org/v5/";
            const animalsURL = `${baseURL}public/animals/${thisID}`

            const response = await fetch(animalsURL, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/vnd.api+json",
                        "Authorization": "7mZmJj1Y", 
                    },
            });


            const pet = await validateJSON(response);

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

                
            const organizations = await validateJSON(response2);

            const orgLocationCity = organizations.data[0].attributes.citystate;

        
            item.innerHTML = `<img src="${imageURL}" alt="ImageOfAnimal"><p>${name}</p><p>${orgLocationCity}</p>`;

            counter+= 1;
            
        }
    }


    export async function validateJSON(response: Response): Promise<any> {
        if (response.ok) {
            return response.json();
        } else {
            return Promise.reject(response);
        }
    }
}



        //create eventlistenerbutton
        //same modal, just different information
        //so every button leads to the same modal
        //item.addEventListener("click", )

        //changing inner text of button to name, location, image


    //start with user profile
    //id's saved as a list in database for user
    //then the html will make spaces for each ID with a for loop/Jinja
    //then the TypeScript will access the id of each element and get the data from the API
    //then event listeners for the modals need to be made for each --> need to figure out how to do this
    //so only the name, location, image are displayed
    //and the rest of the imformation is in the modal
    //and modal needs to be filled in


    //figure out bootsrap and modals


