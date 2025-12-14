document.addEventListener("DOMContentLoaded", async () => {
    makeButtons();
    const favButton = document.getElementById("favorite-button");
    const loginButton = document.getElementById("login_btn");
    if (await IsLoggedIn()) {
        loginButton.innerText = "Log Out";
        console.log("logged in");
        favButton.addEventListener("click", () => addToFavorites(favButton.dataset.petId));
    }
    else {
        loginButton.innerText = "Log In";
        favButton.remove();
    }
});
async function IsLoggedIn() {
    const response = await fetch(`/api/isLoggedIn/`, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });
    const data = await validateJSON(response);
    return data.signedIn;
}
let StubIDS = ["1000004", "10000156", "100001", "10000154", "10000158", "10000196",
    "10000201", "10000202", "10000205", "10000155", "10000153", "10000152", "10000149",
    "1000001", "100000", "10000193", "10000190", "10000178", "10000176", "10000174"];
async function makeButtons() {
    const buttonDiv = document.getElementById("buttons-div");
    for (const id of StubIDS) {
        const newDiv = document.createElement("div");
        buttonDiv.appendChild(newDiv);
        loadHomePets(id, newDiv);
    }
}
const homeLists = document.getElementsByClassName("petButton");
async function loadHomePets(id, newDiv) {
    const btn = document.createElement('button');
    btn.addEventListener("click", () => changeData(id));
    btn.classList.add("petButton");
    btn.setAttribute("data-pet-id", id);
    btn.setAttribute("data-bs-toggle", "modal");
    btn.setAttribute("data-bs-target", "#exampleModal");
    const baseURL = "https://api.rescuegroups.org/v5/";
    const animalsURL = `${baseURL}public/animals/${id}`;
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
    const orgsURL = `${baseURL}public/orgs/${orgsID}`;
    const response2 = await fetch(orgsURL, {
        method: "GET",
        headers: {
            "Content-Type": "application/vnd.api+json",
            "Authorization": "7mZmJj1Y",
        },
    });
    const organizations = await validateHomeJSON(response2);
    const orgLocationCity = organizations.data[0].attributes.citystate;
    if (imageURL == null) {
        btn.innerHTML = `<img src="static/images/petStubImage.png" alt="No stub Available"><p>${name}</p><p>${orgLocationCity}</p>`;
    }
    else {
        btn.innerHTML = `<img src="${imageURL}" alt="No Image Available"><p>${name}</p><p>${orgLocationCity}</p>`;
    }
    newDiv.append(btn);
}
async function validateHomeJSON(response) {
    if (response.ok) {
        return response.json();
    }
    else {
        return Promise.reject(response);
    }
}
async function changeData(pid) {
    fillModal(pid);
    if (await IsLoggedIn()) {
        const favButton = document.getElementById("favorite-button");
        favButton.dataset.petId = pid;
        console.log("favButton id: " + favButton.dataset.petId);
        if (await isFavorite(pid)) {
            favButton.innerHTML = `<img src="/static/icons/unfavorite.png" alt="Unfavorite" width="24" height="24">`;
            console.log("unfav");
        }
        else {
            favButton.innerHTML = `<img src="/static/icons/favorite.png" alt="Favorite" width="24" height="24">`;
            console.log("unfav");
        }
        console.log("is favorite: " + await isFavorite(pid));
    }
}
async function isFavorite(petId) {
    const response = await fetch(`/api/favoritePet/check/${encodeURIComponent(petId)}`, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });
    const data = await validateJSON(response);
    return data.exists;
}
async function addToFavorites(petId) {
    const favButton = document.getElementById("favorite-button");
    if (await isFavorite(petId)) {
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
async function fillModal(id) {
    const modalBodyDiv = document.getElementById("bodyDiv");
    const baseURL = "https://api.rescuegroups.org/v5/";
    const animalsURL = `${baseURL}public/animals/${id}`;
    const response = await fetch(animalsURL, {
        method: "GET",
        headers: {
            "Content-Type": "application/vnd.api+json",
            "Authorization": "7mZmJj1Y",
        },
    });
    const pet = await validateHomeJSON(response);
    const name = document.getElementById("petName");
    name.textContent = "Name: " + (pet.data[0].attributes.name ?? "N/A");
    const ageGroup = document.getElementById("petAge");
    ageGroup.textContent = "Age: " + (pet.data[0].attributes.ageGroup ?? "N/A");
    const gender = document.getElementById("petGender");
    gender.textContent = "Gender: " + (pet.data[0].attributes.sex ?? "N/A");
    const breed = document.getElementById("petBreed");
    breed.textContent = "Breed: " + (pet.data[0].attributes.breedString ?? "N/A");
    const description = document.getElementById("petDescription");
    description.textContent = "Description: " + (pet.data[0].attributes.descriptionText ?? "N/A");
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
    const organizations = await validateHomeJSON(response2);
    const orgLocationCity = document.getElementById("petLocation");
    orgLocationCity.textContent = "Location: " + (organizations.data[0].attributes.citystate ?? "N/A");
    const img = document.getElementById("petImage");
    if (imageURL == null) {
        img.src = 'static/images/petStubImage.png';
        img.alt = 'No stub Available';
        modalBodyDiv.append(img);
    }
    else {
        img.src = imageURL;
        img.alt = 'No Image Available';
        modalBodyDiv.append(img);
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
