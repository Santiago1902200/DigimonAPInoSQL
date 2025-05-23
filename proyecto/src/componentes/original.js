import { auth, db } from '../firebaseConfig.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const niveles = ["Fresh", "In Training", "Rookie", "Champion", "Ultimate", "Mega", "Armor"];

let pokemonName = '';
let pokemonId = '';
let pokemonImage = '';
let gameOver = false;
let gameWon = false;
let userWin = 0;
let userLose = 0;
let uid = null;

const app = document.getElementById('app');

function createElement(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'className') el.className = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.substring(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  }
  for (const child of children) {
    if (typeof child === 'string') el.appendChild(document.createTextNode(child));
    else if (child instanceof Node) el.appendChild(child);
  }
  return el;
}

async function fetchRandomPokemon() {
  app.innerHTML = '<p>Cargando Digimon...</p>';
  const res = await fetch('https://digimon-api.vercel.app/api/digimon');
  const digimones = await res.json();

  const randomIndex = Math.floor(Math.random() * digimones.length);
  const digimon = digimones[randomIndex];

  pokemonName = digimon.name.toUpperCase();
  pokemonId = randomIndex + 1; // solo para mantener la variable
  pokemonImage = digimon.img;
  const nivelCorrecto = digimon.level.trim().toLowerCase();

  render(nivelCorrecto);
}

function render(nivelCorrecto) {
  app.innerHTML = '';

  const title = createElement('h2', {}, '¿Qué rango tiene este Digimon?');
  const stats = createElement('p', {}, `Ganados: ${userWin} | Perdidos: ${userLose}`);
  app.appendChild(title);
  app.appendChild(stats);
  app.appendChild(createElement('p', {}, `ID: ${pokemonId}`));
  app.appendChild(createElement('p', {}, `Nombre: ${pokemonName}`));
  app.appendChild(createElement('img', {
    src: pokemonImage,
    alt: pokemonName,
    style: 'width: 150px; height: 150px;'
  }));

  const opcionesDiv = createElement('div', { style: 'margin-top: 10px; display: flex; flex-wrap: wrap; gap: 10px;' });

  niveles.forEach(nivel => {
    const btn = createElement('button', {
      onclick: () => verificarRango(nivelCorrecto, nivel.toLowerCase()),
      style: 'padding: 10px; min-width: 100px;'
    }, nivel);
    opcionesDiv.appendChild(btn);
  });

  app.appendChild(opcionesDiv);
  app.appendChild(createElement('p', { id: 'resultado-rango', style: 'font-weight: bold; margin-top: 10px;' }));
}

async function verificarRango(rangoCorrecto, elegido) {
  const resultado = document.getElementById("resultado-rango");
  if (rangoCorrecto === elegido) {
    resultado.textContent = "✅ ¡Correcto!";
    resultado.style.color = "green";
    userWin++;
    gameWon = true;
    await guardarResultado(true);
  } else {
    resultado.textContent = `❌ Incorrecto. El rango correcto era: ${rangoCorrecto.charAt(0).toUpperCase() + rangoCorrecto.slice(1)}`;
    resultado.style.color = "red";
    userLose++;
    gameOver = true;
    await guardarResultado(false);
  }

  // Mostrar botón para jugar otra vez
  const btn = createElement('button', {
    onclick: restartGame,
    style: 'margin-top: 10px; padding: 8px 16px; font-weight: bold;'
  }, 'Jugar otra vez');
  app.appendChild(btn);
}

async function guardarResultado(acierto) {
  if (!uid) return;
  const fecha = new Date().toISOString();

  const resultado = {
    uid,
    digimon: pokemonName,
    aciertos: acierto ? 1 : 0,
    errores: acierto ? 0 : 1,
    fecha,
  };

  try {
    await setDoc(doc(db, 'resultados', `${uid}_${fecha}`), resultado);
    const docRef = doc(db, 'usuarios', uid);
    await updateDoc(docRef, {
      ganados: userWin,
      perdidos: userLose,
    });
  } catch (e) {
    console.error('Error al guardar resultado:', e);
  }
}

async function restartGame() {
  gameOver = false;
  gameWon = false;
  pokemonName = '';
  pokemonId = '';
  pokemonImage = '';
  await fetchRandomPokemon();
}

async function cargarDatosUsuario() {
  if (!uid) return;

  const docRef = doc(db, 'usuarios', uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    userWin = data.ganados || 0;
    userLose = data.perdidos || 0;
  } else {
    await setDoc(docRef, { ganados: 0, perdidos: 0 });
    userWin = 0;
    userLose = 0;
  }
}

export default function mostrarRango() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      uid = user.uid;
      await cargarDatosUsuario();
      await fetchRandomPokemon();
    } else {
      app.innerHTML = '<p>Por favor inicia sesión para jugar.</p>';
    }
  });
}
