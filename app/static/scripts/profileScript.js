const lists = document.getElementsByClassName("petButton");
let counter = 0;
document.addEventListener("DOMContentLoaded", async () => {
    loadPets();
    for (const button of lists) {
        const btn = button;
        let thisID = btn.dataset.petId;
        btn.addEventListener("click", () => changeData(thisID));
    }
    const favButton = document.getElementById("favorite-button");
    favButton.addEventListener("click", () => addToFavorites(favButton.dataset.petID));
});
async function changeData(pid) {
    const favButton = document.getElementById("favorite-button");
    favButton.dataset.petID = pid;
    console.log("favButton id: " + favButton.dataset.petID);
    if (isFavorite(pid)) {
        favButton.innerText = "Delete from favorites";
    }
    else {
        favButton.innerText = "Add to favorites";
    }
}
async function isFavorite(petID) {
    const response = await fetch(`/api/favoritePet/check/${petID}`);
    const data = await response.json();
    return data.exists;
}
async function addToFavorites(petID) {
    const favButton = document.getElementById("favorite-button");
    if (isFavorite(petID)) {
        favButton.innerText = "Add to favorites";
    }
    else {
        favButton.innerText = "Delete from favorites";
    }
    await fetch("/api/favoritePet/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pid: petID })
    });
    console.log("added " + petID);
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
