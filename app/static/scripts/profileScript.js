const lists = document.getElementsByClassName("petButton");
let counter = 0;
document.addEventListener("DOMContentLoaded", async () => {
    modalChanging.loadPets();
    for (const button of lists) {
        const btn = button;
        let thisID = btn.dataset.petId;
        btn.addEventListener("click", () => modalChanging.changeData(thisID));
    }
    const favButton = document.getElementById("favorite-button");
    favButton.addEventListener("click", () => addToFavorites(favButton.dataset.petId));
});
async function addToFavorites(petId) {
    const favButton = document.getElementById("favorite-button");
    console.log("add?");
    const isFav = await isFavorite(petId);
    if (isFav) {
        favButton.innerHTML = `<img src="/static/icons/favorite.png" alt="Favorite" width="24" height="24">`;
    }
    else {
        favButton.innerHTML = `<img src="/static/icons/unfavorite.png" alt="Unfavorite" width="24" height="24">`;
    }
    await fetch("/api/favoritePet/", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pid: petId })
    });
    console.log("added " + petId);
}
async function isFavorite(petId) {
    const response = await fetch(`/api/favoritePet/check/${encodeURIComponent(petId)}`, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });
    const data = await modalChanging.validateJSON(response);
    return data.exists;
}
export var modalChanging;
(function (modalChanging) {
    async function changeData(pid) {
        const favButton = document.getElementById("favorite-button");
        favButton.dataset.petId = pid;
        console.log("favButton id: " + favButton.dataset.petId);
        if (await isFavorite(pid)) {
            favButton.innerHTML = `<img src="/static/icons/unfavorite.png" alt="Unfavorite" width="24" height="24">`;
        }
        else {
            favButton.innerHTML = `<img src="/static/icons/favorite.png" alt="Favorite" width="24" height="24">`;
        }
    }
    modalChanging.changeData = changeData;
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
    modalChanging.loadPets = loadPets;
    async function validateJSON(response) {
        if (response.ok) {
            return response.json();
        }
        else {
            return Promise.reject(response);
        }
    }
    modalChanging.validateJSON = validateJSON;
})(modalChanging || (modalChanging = {}));
