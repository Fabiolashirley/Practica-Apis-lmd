// Fabiola Shirley Cordero Mollostaca | 11080662
// Lógica para Ejercicios Web 4 y 5

//EJERCICIO 4:Buscador de Digimon
function buscarDigimon(event) {
    if (!document.getElementById('criterio')) return; 

    event.preventDefault(); 
    const criterio = document.getElementById('criterio').value;
    const valorBusqueda = document.getElementById('valorBusqueda').value.trim();
    const tbody = document.getElementById('resultadosTable').querySelector('tbody');
    const mensajeError = document.getElementById('mensajeError');
    
    tbody.innerHTML = '';
    mensajeError.textContent = '';
    
    if (valorBusqueda === "") {
        mensajeError.textContent = "¡Necesitas ingresar un valor de búsqueda!";
        return;
    }

    let URL = (criterio === 'name') 
        ? `https://digimon-api.vercel.app/api/digimon/name/${valorBusqueda}`
        : `https://digimon-api.vercel.app/api/digimon/level/${valorBusqueda}`;

    fetch(URL)
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => { throw new Error(data.ErrorMsg || 'No encontrado. Revisa el nombre o nivel.'); });
            }
            return response.json();
        })
        .then(data => {
            const results = Array.isArray(data) ? data : [data];
            results.forEach(digimon => {
                const row = tbody.insertRow();
                row.insertCell().textContent = digimon.name;
                row.insertCell().textContent = digimon.level;
            });
        })
        .catch(error => {
            mensajeError.textContent = `Error: ${error.message}`;
        });
}


//EJERCICIO 5:Galería Pokémon con Paginación
let currentPage = 1;
const limit = 20;

async function cargarPaginaPokemon(page) {
    if (!document.getElementById('galeria')) return; 
    
    const offset = (page - 1) * limit;
    const URL = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    const galeria = document.getElementById('galeria');
    const loadMessage = document.getElementById('loadMessage');
    
    galeria.innerHTML = '<p>Cargando datos...un momento, por favor.</p>';
    loadMessage.textContent = 'Buscando el lote de Pokémon...';
    
    try {
        const response = await fetch(URL);
        const data = await response.json();
        
        galeria.innerHTML = '';
        const detailPromises = data.results.map(p => fetch(p.url).then(res => res.json()));
        const detailedData = await Promise.all(detailPromises);
        
        detailedData.forEach(pokemon => {
            renderizarCard(pokemon);
        });
        currentPage = page;
        document.getElementById('pageInfo').textContent = `Página ${currentPage}`;
        document.getElementById('prevBtn').disabled = !data.previous;
        document.getElementById('nextBtn').disabled = !data.next;
        loadMessage.textContent = '¡Carga de datos exitosa! Ahora puedes filtrar.';

    } catch (error) {
        galeria.innerHTML = `<p style="color:red;">Error al cargar los Pokémon: ${error.message}</p>`;
    }
}

function renderizarCard(pokemon) {
    const galeria = document.getElementById('galeria');
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    
    const pokemonID = pokemon.id;
    const imgSrc = pokemon.sprites.front_default || 'https://via.placeholder.com/96x96?text=No+Img';
    
    card.innerHTML = `
        <img src="${imgSrc}" alt="${pokemon.name}">
        <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
        <p>ID: ${pokemonID}</p>
    `;
    galeria.appendChild(card);
}

function cambiarPagina(delta) {
    limpiarFiltro(); 
    cargarPaginaPokemon(currentPage + delta);
}

function filtrarPokemon() {
    if (!document.getElementById('filtroNombre')) return;
    
    const filtro = document.getElementById('filtroNombre').value.toLowerCase().trim();
    const cards = document.querySelectorAll('.pokemon-card');
    
    let encontrados = 0;
    cards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        
        if (name.includes(filtro) || filtro === '') {
            card.style.display = 'block';
            encontrados++;
        } else {
            card.style.display = 'none';
        }
    });

    const loadMessage = document.getElementById('loadMessage');
    if (filtro && encontrados === 0) {
        loadMessage.textContent = `No se encontró ningún Pokémon con el nombre "${filtro}" en esta página.`;
    } else {
         loadMessage.textContent = filtro === '' ? 'Filtro limpiado.' : `Mostrando ${encontrados} Pokémon con el filtro "${filtro}".`;
    }
}

function limpiarFiltro() {
    if (document.getElementById('filtroNombre')) {
        document.getElementById('filtroNombre').value = '';
        filtrarPokemon(); 
    }
}