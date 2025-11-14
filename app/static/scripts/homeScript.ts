
document.addEventListener("DOMContentLoaded", async () => {
    loadHomePets();
});

// get all of the buttons
const homeLists =  document.getElementsByClassName("petButton");


//Buck, Nelly, Shiloh, Bella, Sam, Benz, Sparkle B, Suri, Bentley, Buffy, Maxine, Hollie, Foxy Boy, Bernie, Shyann, Herb C1371, WILLIE, Brady, Bree, Pomegranate
let StubIDS: string[] = ["1000004", "10000156", "100001", "10000154", "10000158", "10000196", 
    "10000201", "10000202", "10000205", "10000155", "10000153", "10000152", "10000149", 
    "1000001", "100000", "10000193", "10000190", "10000178", "10000176", "10000174"]; 

let homeCounter: number = 0;


async function loadHomePets(){

    for (const item of homeLists) {
        let thisID: string = StubIDS[homeCounter];

        const baseURL = "https://api.rescuegroups.org/v5/";
        const animalsURL = `${baseURL}public/animals/${thisID}`

        const response = await fetch(animalsURL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/vnd.api+json",
                    "Authorization": "7mZmJj1Y", 
                },
        });


        const pet = await validateHomeJSON(response);

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

            
        const organizations = await validateHomeJSON(response2);

        const orgLocationCity = organizations.data[0].attributes.citystate;

       
        item.innerHTML = `<img src="${imageURL}" alt="No Image Available"><p>${name}</p><p>${orgLocationCity}</p>`;

         homeCounter+= 1;
        
    }
}

async function validateHomeJSON(response: Response): Promise<any> {
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