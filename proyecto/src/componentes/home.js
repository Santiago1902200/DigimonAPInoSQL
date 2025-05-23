export default async function mostrarHome() {
    const app = document.getElementById("app");

    // Limpiar contenido y preparar contenedores
    app.innerHTML = `
        <h2>Digimon</h2>
        <input type="text" id="buscador" placeholder="Buscar Digimon..." style="width: 100%; padding: 10px; margin-bottom: 10px;" />
        <div id="filtroNiveles" style="margin-bottom: 10px;"></div>
        <div id="lista" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; padding: 10px;"></div>
    `;

    const lista = document.getElementById("lista");
    const buscador = document.getElementById("buscador");
    const filtroNiveles = document.getElementById("filtroNiveles");

    try {
        const res = await fetch("https://digimon-api.vercel.app/api/digimon");
        const digimones = await res.json();

        let digimonesFiltrados = [...digimones]; // Manejamos la lista activa aquí

        // Mostrar lista inicial
        renderLista(digimonesFiltrados);

        // Buscador
        buscador.addEventListener("input", (e) => {
            const texto = e.target.value.toLowerCase();
            if (texto.length >= 3) {
                const filtrados = digimonesFiltrados.filter(d => d.name.toLowerCase().includes(texto));
                renderLista(filtrados);
            } else if (texto.length === 0) {
                renderLista(digimonesFiltrados);
            }
        });

        // Filtro por nivel
        const niveles = ["All", "Fresh", "In Training", "Rookie", "Champion", "Ultimate", "Mega"];
        niveles.forEach(nivel => {
            const btn = document.createElement("button");
            btn.textContent = nivel;
            btn.onclick = () => {
                if (nivel === "All") {
                    digimonesFiltrados = [...digimones];
                } else {
                    digimonesFiltrados = digimones.filter(d => d.level === nivel);
                }
                buscador.value = ""; // Limpiar buscador al cambiar filtro
                renderLista(digimonesFiltrados);
            };
            filtroNiveles.appendChild(btn);
        });

        // Función para renderizar la lista
        function renderLista(listaDigis) {
            lista.innerHTML = "";
            listaDigis.forEach((digimon, i) => {
                const item = document.createElement("div");
                item.classList.add(`digimon-${i}`);
                item.style.textAlign = "center";
                item.innerHTML = `
                    <p>${digimon.name}</p>
                    <img src="${digimon.img}" alt="${digimon.name}" width="100" height="100" />
                    <p>${digimon.level}</p>
                `;
                lista.appendChild(item);
            });
        }

    } catch (error) {
        app.innerHTML = `<p>Error al cargar los Digimon: ${error.message}</p>`;
    }
}
