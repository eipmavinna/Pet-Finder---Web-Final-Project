document.addEventListener("DOMContentLoaded", async () => {
    loadPets();
});
const homeLists = document.getElementsByClassName("petButton");
let StubIDS = ["1000004", "100001", "10000154"];
let homeCounter = 0;
async function loadHomePets() {
    for (const item of homeLists) {
        let thisID = StubIDS[counter];
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
        homeCounter += 1;
    }
}
