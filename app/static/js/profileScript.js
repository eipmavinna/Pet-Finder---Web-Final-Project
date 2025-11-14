document.addEventListener("DOMContentLoaded", async () => {
    loadPets();
    const closeButton = document.getElementById("modal_close");
    closeButton.addEventListener("click", loadPets);
    const favButton = document.getElementById("favorite-button");
    addToFavorites("222");
    favButton.addEventListener("click", () => addToFavorites("6"));
});
const lists = document.getElementsByClassName("petButton");
let counter = 0;
async function addToFavorites(petID) {
    await fetch("/favoritePet/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: petID })
    });
}
async function loadPets() {
    for (const item of lists) {
        const btn = item;
        let thisID = btn.dataset.petId;
        const baseURL = "https://api.rescuegroups.org/v5/";
        const animalsURL = `${baseURL}public/animals/${thisID}`;
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
        const orgsURL = `${baseURL}public/orgs/${orgsID}`;
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
        counter += 1;
    }
}
async function validateJSON(response) {
    if (response.ok) {
        return response.json();
    }
    else {
        return Promise.reject(response);
    }
}
