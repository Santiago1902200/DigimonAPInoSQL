export default async function mostrarHome() {
const app = document.getElementById("app");
app.innerHTML = `<h2>Pokémon</h2><div id="lista" style="display: flex;
flex-wrap: wrap; gap: 10px; justify-content: space-between; padding:
10px;"></div>`;

const lista = document.getElementById("lista");

try {
const res = await
fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
const json = await res.json();

const data = json.results;

data.forEach((pokemon) => {
const id = pokemon.url.split("/")[6];
const item = document.createElement("div");

item.innerHTML = `
<p>${id} - ${pokemon.name}</p>
<img
src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/p
okemon/other/official-artwork/${id}.png" style="width: 100px; height:
100px;" />
`;

lista.appendChild(item);
});
} catch (error) {
app.innerHTML = `<p>Error al cargar los Pokémon:
${error.message}</p>`;
}
}