document.addEventListener("DOMContentLoaded", async () => {
    console.log("in typescript");
    const form = document.getElementById("filterForm");
    console.log("running");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        console.log("hit submit");
        await getFilteredPets();
    });
    const submitBtn = document.getElementById("submit-btn");
    const favButton = document.getElementById("favorite-button");
    if (await IsLoggedInSearch()) {
        console.log("logged in");
        favButton.addEventListener("click", () => addToFavoritesSearch(favButton.dataset.petId));
    }
    else {
        favButton.remove();
    }
    const profileBtn = document.getElementById("profile");
    profileBtn.addEventListener("click", async function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (await IsLoggedInSearch()) {
            window.location.href = '/profile/';
            return;
        }
        const loginModal = document.getElementById("profileModal");
        const modal = window.bootstrap.Modal.getOrCreateInstance(loginModal);
        modal.show();
    });
});
async function getFilteredPets() {
    const form = document.getElementById("filterForm");
    const formData = new FormData(form);
    if (isFormDataEmpty(formData)) {
        alert("Please fill at least one filter field.");
        console.log("empty");
        return;
    }
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
function isFormDataEmpty(formData) {
    const zip = formData.get("zipcode");
    const type = formData.get("animal_type");
    const age = formData.get("age_group");
    if ((zip && zip !== "") || (type && type !== "") || (age && age !== "")) {
        return false;
    }
    return true;
}
async function IsLoggedInSearch() {
    const response = await fetch(`/api/isLoggedIn/`, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });
    const data = await validateJSONSearch(response);
    return data.signedIn;
}
async function makeButtonsSearch(list) {
    const buttonDiv = document.getElementById("buttons-div");
    buttonDiv.replaceChildren();
    for (const id of list) {
        const newDiv = document.createElement("div");
        buttonDiv.appendChild(newDiv);
        loadHomePetsSearch(id, newDiv);
    }
}
async function loadHomePetsSearch(id, newDiv) {
    const btn = document.createElement('button');
    btn.addEventListener("click", () => changeDataSearch(id));
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
    const pet = await validateHomeJSONSearch(response);
    let name = pet.data[0].attributes.name;
    if (name.toLowerCase().includes("adopted")) {
        return;
    }
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
    const organizations = await validateHomeJSONSearch(response2);
    const orgLocationCity = organizations.data[0].attributes.citystate;
    if (imageURL == null) {
        btn.innerHTML = `<img src="/static/icons/petStubImage.png" alt="No stub Available"><p>${name}</p><p>${orgLocationCity}</p>`;
    }
    else {
        btn.innerHTML = `<img src="${imageURL}" alt="No Image Available"><p>${name}</p><p>${orgLocationCity}</p>`;
    }
    newDiv.append(btn);
}
async function validateHomeJSONSearch(response) {
    if (response.ok) {
        return response.json();
    }
    else {
        return Promise.reject(response);
    }
}
async function changeDataSearch(pid) {
    fillModalSearch(pid);
    if (await IsLoggedInSearch()) {
        const favButton = document.getElementById("favorite-button");
        if (favButton != null) {
            favButton.dataset.petId = pid;
            console.log("favButton id: " + favButton.dataset.petId);
            if (await isFavoriteSearch(pid)) {
                favButton.innerHTML = `<img src="/static/icons/unfavorite.png" alt="Unfavorite" width="24" height="24">`;
            }
            else {
                favButton.innerHTML = `<img src="/static/icons/favorite.png" alt="Favorite" width="24" height="24">`;
            }
        }
        console.log("is favorite: " + await isFavoriteSearch(pid));
    }
}
async function isFavoriteSearch(petId) {
    const response = await fetch(`/api/favoritePet/check/${encodeURIComponent(petId)}`, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    });
    const data = await validateJSONSearch(response);
    return data.exists;
}
async function addToFavoritesSearch(petId) {
    const favButton = document.getElementById("favorite-button");
    if (await isFavoriteSearch(petId)) {
        if (favButton) {
            favButton.innerHTML = `<img src="/static/icons/favorite.png" alt="Favorite" width="24" height="24">`;
        }
    }
    else {
        if (favButton) {
            favButton.innerHTML = `<img src="/static/icons/unfavorite.png" alt="Unfavorite" width="24" height="24">`;
        }
    }
    await fetch("/api/favoritePet/", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pid: petId })
    });
    console.log("added " + petId);
}
async function fillModalSearch(id) {
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
    const pet = await validateHomeJSONSearch(response);
    const name = document.getElementById("petName");
    if (name) {
        name.textContent = "Name: " + (pet.data[0].attributes.name ?? "N/A");
    }
    const ageGroup = document.getElementById("petAge");
    if (ageGroup) {
        ageGroup.textContent = "Age: " + (pet.data[0].attributes.ageGroup ?? "N/A");
    }
    const gender = document.getElementById("petGender");
    if (gender) {
        gender.textContent = "Gender: " + (pet.data[0].attributes.sex ?? "N/A");
    }
    const breed = document.getElementById("petBreed");
    if (breed) {
        breed.textContent = "Breed: " + (pet.data[0].attributes.breedString ?? "N/A");
    }
    const description = document.getElementById("petDescription");
    if (description) {
        description.textContent = "Description: " + (pet.data[0].attributes.descriptionText ?? "N/A");
    }
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
    const organizations = await validateHomeJSONSearch(response2);
    const orgLocationCity = document.getElementById("petLocation");
    if (orgLocationCity) {
        orgLocationCity.textContent = "Location: " + (organizations.data[0].attributes.citystate ?? "N/A");
    }
    const petURL = document.getElementById("petURL");
    petURL.href = organizations.data[0].attributes.url ?? "#";
    const img = document.getElementById("petImage");
    if (imageURL == null) {
        img.src = '/static/icons/petStubImage.png';
        img.alt = 'No stub Available';
        if (modalBodyDiv) {
            modalBodyDiv.append(img);
        }
    }
    else {
        img.src = imageURL;
        img.alt = 'No Image Available';
        if (modalBodyDiv) {
            modalBodyDiv.append(img);
        }
    }
}
async function validateJSONSearch(response) {
    if (response.ok) {
        return response.json();
    }
    else {
        return Promise.reject(response);
    }
}
