

document.addEventListener("DOMContentLoaded", async () => {
    //while there are things in the id list from pet favs, 
    //add a button for the modal
    //if == 0, delete the button?
    //else, while there is an id duplicate the first and add the id
    loadPets();
    //const closeButton = document.getElementById("modal_close")
    //closeButton.addEventListener("click",loadPets)
    const favButton = document.getElementById("favorite-button")
    favButton.addEventListener("click", () => addToFavorites("6"))
});

// get all of the buttons
const lists =  document.getElementsByClassName("petButton");


//Buck, Shiloh, Bella
//let IDS: string[] = ["1000004", "100001", "10000154"]; 
let counter: number = 0;


async function addToFavorites(petID: string){
    //want to access the FavPet table and add something with the user's id and the pet id
    await fetch("/api/favoritePet/", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({pid: petID})
    })
    console.log("added?")
}


async function loadPets(){

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


async function validateJSON(response: Response): Promise<any> {
    if (response.ok) {
        return response.json();
    } else {
        return Promise.reject(response);
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


