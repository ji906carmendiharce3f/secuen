
const pantallaInicio = document.getElementById("pantalla-inicio");
const simuladorResiduos = document.getElementById("simulador-residuos");
const simuladorVerduras = document.getElementById("simulador-verduras");


const btnResiduos = document.getElementById("btn-residuos");
const btnVerduras = document.getElementById("btn-verduras");

// --- SIMULADOR RESIDUOS ---

const btnCafe = document.getElementById("btn-cafe");
const btnTe = document.getElementById("btn-te");
const btnYerba = document.getElementById("btn-yerba");

const btnAgua = document.getElementById("btn-agua"); 
const btnMezclar = document.getElementById("btn-mezclar");
const btnReiniciarResiduos = simuladorResiduos.querySelector(".reiniciar");
const tubo = document.getElementById("tubo");

// Ingredientes y estado residuos
let ingredientesResiduos = { cafe: 0, te: 0, yerba: 0, agua: 0 };
let residuoSeleccionado = null;
let mezclaProgreso = 0;
let mezclaInterval = null;

let verduraSeleccionada = null;
let pigmentoProgreso = 0;


// --- SIMULADOR VERDURAS ---

const btnRemolacha = document.getElementById("btn-remolacha");
const btnRepollo = document.getElementById("btn-repollo");
const btnCebolla = document.getElementById("btn-cebolla");
const btnHervir = document.getElementById("btn-hervir");
const btnReiniciarVerdura = simuladorVerduras.querySelector(".reiniciar");
const tuboVerdura = document.getElementById("tubo-verdura");
const fuego = document.getElementById("fuego");

// Ingredientes y estado verduras
let ingredientesVerdura = { remolacha: 0, repollo: 0, cebolla: 0, agua: 0 };
let hervorProgreso = 0;
let hervorInterval = null;

// --- FUNCIONES PANTALLAS ---

btnResiduos.addEventListener("click", () => {
  pantallaInicio.style.display = "none";
  simuladorResiduos.style.display = "block";
  simuladorVerduras.style.display = "none";
});

btnVerduras.addEventListener("click", () => {
  pantallaInicio.style.display = "none";
  simuladorVerduras.style.display = "block";
  simuladorResiduos.style.display = "none";
});

// FUNCIONES SIMULADOR RESIDUOS

function desactivarBotonesResiduosExcepto(tipoActivo) {
  [btnCafe, btnTe, btnYerba].forEach(btn => {
    if (btn.id !== "btn-" + tipoActivo) {
      btn.disabled = true;
      btn.style.opacity = "0.4";
    }
  });
}

function activarBotonesResiduos() {
  [btnCafe, btnTe, btnYerba].forEach(btn => {
    btn.disabled = false;
    btn.style.opacity = "1";
  });
  residuoSeleccionado = null;
}

function agregarIngrediente(tipo) {
  if (residuoSeleccionado && residuoSeleccionado !== tipo) {
    alert(`Solo puedes usar ${residuoSeleccionado}. Reinicia para cambiar.`);
    return;
  }
  if (!residuoSeleccionado) {
    residuoSeleccionado = tipo;
    desactivarBotonesResiduosExcepto(tipo);
  }
  ingredientesResiduos[tipo]++;
  mezclaProgreso = 0;
  actualizarVisualResiduos();
}

function reiniciarSimuladorResiduos() {
  ingredientesResiduos = { cafe: 0, te: 0, yerba: 0, agua: 0 };
  mezclaProgreso = 0;
  activarBotonesResiduos();
  if (mezclaInterval) clearInterval(mezclaInterval);
  mezclaInterval = null;
  actualizarVisualResiduos();
}

function getTotalResiduos() {
  return ingredientesResiduos.cafe + ingredientesResiduos.te + ingredientesResiduos.yerba;
}

function getTotalVolumen() {
  return getTotalResiduos() + ingredientesResiduos.agua / 100;
}

function crearCapa(texto, color, valor, altura, opacidad = 1) {
  const div = document.createElement("div");
  div.className = "capa";
  div.style.transition = "all 0.3s ease-in-out";
  div.style.backgroundColor = color;
  div.style.height = `${altura}%`;
  div.style.opacity = opacidad;
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
  div.style.color = "white";
  div.style.fontWeight = "bold";
  div.style.fontSize = "0.8rem";
  div.style.textTransform = "uppercase";
  div.style.textAlign = "center";
  div.innerText = texto ? (valor ? `${texto} (${valor})` : texto) : "";
  return div;
}

function rgbArrayToString(rgbArr) {
  return `rgb(${rgbArr[0]},${rgbArr[1]},${rgbArr[2]})`;
}

function interpolateColor(color1, color2, factor) {
  return color1.map((c, i) => Math.round(c + factor * (color2[i] - c)));
}

function calcularColorArrayResiduos() {
  const totalResiduos = getTotalResiduos();
  if (totalResiduos === 0) return [255, 255, 255];

  let r = 0, g = 0, b = 0;

  if (ingredientesResiduos.cafe > 0) {
    r += 111 * ingredientesResiduos.cafe;
    g += 78 * ingredientesResiduos.cafe;
    b += 55 * ingredientesResiduos.cafe;
  }
  if (ingredientesResiduos.te > 0) {
    r += 193 * ingredientesResiduos.te;
    g += 68 * ingredientesResiduos.te;
    b += 14 * ingredientesResiduos.te;
  }
  if (ingredientesResiduos.yerba > 0) {
    r += 59 * ingredientesResiduos.yerba;
    g += 122 * ingredientesResiduos.yerba;
    b += 87 * ingredientesResiduos.yerba;
  }

  r = Math.round(r / totalResiduos);
  g = Math.round(g / totalResiduos);
  b = Math.round(b / totalResiduos);

  const aclaradoPor100ml = 10;
  const cantidadAgua = ingredientesResiduos.agua;
  const aclaradoMaximo = 255;
  const aclarado = Math.min((cantidadAgua / 100) * aclaradoPor100ml, aclaradoMaximo);

  r = Math.min(255, r + aclarado);
  g = Math.min(255, g + aclarado);
  b = Math.min(255, b + aclarado);

  return [r, g, b];
}

function actualizarVisualResiduos() {
  if (!tubo) return;
  tubo.innerHTML = "";

  const totalResiduos = getTotalResiduos();
  const totalVolumen = getTotalVolumen();
  if (totalVolumen === 0) return;

  const alturaTotal = 100;
  const mezclaAltura = mezclaProgreso * alturaTotal;

  const colorBase = [255, 255, 255];
  const colorFinal = calcularColorArrayResiduos();
  const colorIntermedio = interpolateColor(colorBase, colorFinal, mezclaProgreso);
  const colorStr = rgbArrayToString(colorIntermedio);

  if (mezclaProgreso > 0) {
    const mezclaDiv = crearCapa("Pigmento", colorStr, "", mezclaAltura);
    mezclaDiv.style.opacity = 1;
    tubo.appendChild(mezclaDiv);
  }

  const alturaRestante = alturaTotal - mezclaAltura;
  if (mezclaProgreso < 1) {
    const residuosAltura = (totalResiduos / totalVolumen) * alturaRestante;
    const aguaAltura = (ingredientesResiduos.agua / 100 / totalVolumen) * alturaRestante;

    if (ingredientesResiduos.cafe > 0) {
      const h = (ingredientesResiduos.cafe / totalResiduos) * residuosAltura;
      tubo.appendChild(crearCapa("Café", "#4b3100", ingredientesResiduos.cafe, h));
    }
    if (ingredientesResiduos.te > 0) {
      const h = (ingredientesResiduos.te / totalResiduos) * residuosAltura;
      tubo.appendChild(crearCapa("Saquito de Té", "#ff4500", ingredientesResiduos.te, h));
    }
    if (ingredientesResiduos.yerba > 0) {
      const h = (ingredientesResiduos.yerba / totalResiduos) * residuosAltura;
      tubo.appendChild(crearCapa("Yerba", "#003d00", ingredientesResiduos.yerba, h));
    }
    if (ingredientesResiduos.agua > 0) {
      tubo.appendChild(crearCapa("Agua", "#AADDFF", ingredientesResiduos.agua / 100, aguaAltura));
    }
  }
}

function empezarMezcla() {
  if (getTotalResiduos() === 0) {
    alert("Agrega algún residuo antes de mezclar.");
    return;
  }
  if (mezclaInterval) clearInterval(mezclaInterval);
  mezclaInterval = setInterval(() => {
    if (mezclaProgreso < 1) {
      mezclaProgreso += 0.02;
      if (mezclaProgreso > 1) mezclaProgreso = 1;
      actualizarVisualResiduos();
    } else {
      clearInterval(mezclaInterval);
      mezclaInterval = null;
      
    }
  }, 100);
}

btnCafe.addEventListener("click", () => agregarIngrediente("cafe"));
btnTe.addEventListener("click", () => agregarIngrediente("te"));
btnYerba.addEventListener("click", () => agregarIngrediente("yerba"));
btnMezclar.addEventListener("click", empezarMezcla);
btnReiniciarResiduos.addEventListener("click", reiniciarSimuladorResiduos);

// --- FUNCIONES SIMULADOR VERDURAS ---

function agregarIngredienteVerdura(tipo) {
  if (verduraSeleccionada && verduraSeleccionada !== tipo) {
    alert(`Solo puedes usar ${verduraSeleccionada}. Reinicia para cambiar.`);
    return;
  }


  if (!verduraSeleccionada) {
    verduraSeleccionada = tipo;
    [btnRemolacha, btnRepollo, btnCebolla].forEach(btn => {
      if (btn.id !== "btn-" + tipo) {
        btn.disabled = true;
        btn.style.opacity = "0.4";
      }
    });
  }

  
  ingredientesVerdura[tipo]++;
  pigmentoProgreso = 0;


  if (hervorInterval) clearInterval(hervorInterval);
  hervorProgreso = 0;
  fuego.style.display = "none";

  actualizarVisualVerdura();
}



function actualizarVisualVerdura() {
  tuboVerdura.innerHTML = "";

  const totalVerduras = ingredientesVerdura.remolacha + ingredientesVerdura.repollo + ingredientesVerdura.cebolla;
  const totalVolumen = totalVerduras + ingredientesVerdura.agua / 100;
  if (totalVolumen === 0) return;

  const alturaTotal = 100;

  if (hervorProgreso > 0) {
  
    const colorBase = [255, 255, 255];
    const colorFinal = calcularColorArrayVerdura();

  
    let colorIntermedio = interpolateColor(colorBase, colorFinal, hervorProgreso);


    const aclaradoExtra = Math.floor(hervorProgreso * 30); 
    colorIntermedio = [
      Math.min(255, colorIntermedio[0] + aclaradoExtra),
      Math.min(255, colorIntermedio[1] + aclaradoExtra),
      Math.min(255, colorIntermedio[2] + aclaradoExtra),
    ];

    const colorStr = rgbArrayToString(colorIntermedio);
    const pigmentoAltura = hervorProgreso * alturaTotal;
    const capaPigmento = crearCapa("Pigmento", colorStr, "", pigmentoAltura);
    tuboVerdura.appendChild(capaPigmento);


    const alturaRestante = alturaTotal - pigmentoAltura;

    if (hervorProgreso < 1) {
      const alturaVerduras = (totalVerduras / totalVolumen) * alturaRestante;
      const alturaAgua = (ingredientesVerdura.agua / 100 / totalVolumen) * alturaRestante;

      if (ingredientesVerdura.remolacha > 0) {
        const h = (ingredientesVerdura.remolacha / totalVerduras) * alturaVerduras;
        tuboVerdura.appendChild(crearCapa("Remolacha", "#7a003c", ingredientesVerdura.remolacha, h));
      }
      if (ingredientesVerdura.repollo > 0) {
        const h = (ingredientesVerdura.repollo / totalVerduras) * alturaVerduras;
        tuboVerdura.appendChild(crearCapa("Repollo", "#36005c", ingredientesVerdura.repollo, h));
      }
      if (ingredientesVerdura.cebolla > 0) {
        const h = (ingredientesVerdura.cebolla / totalVerduras) * alturaVerduras;
        tuboVerdura.appendChild(crearCapa("Cebolla", "#993000", ingredientesVerdura.cebolla, h));
      }
      if (ingredientesVerdura.agua > 0) {
        tuboVerdura.appendChild(crearCapa("Agua", "#01a7d1", ingredientesVerdura.agua / 100, alturaAgua));
      }
    }
  } else {
   
    const alturaVerduras = (totalVerduras / totalVolumen) * alturaTotal;
    const alturaAgua = (ingredientesVerdura.agua / 100 / totalVolumen) * alturaTotal;

    if (ingredientesVerdura.remolacha > 0) {
      const h = (ingredientesVerdura.remolacha / totalVerduras) * alturaVerduras;
      tuboVerdura.appendChild(crearCapa("Remolacha", "#7a003c", ingredientesVerdura.remolacha, h));
    }
    if (ingredientesVerdura.repollo > 0) {
      const h = (ingredientesVerdura.repollo / totalVerduras) * alturaVerduras;
      tuboVerdura.appendChild(crearCapa("Repollo", "#36005c", ingredientesVerdura.repollo, h));
    }
    if (ingredientesVerdura.cebolla > 0) {
      const h = (ingredientesVerdura.cebolla / totalVerduras) * alturaVerduras;
      tuboVerdura.appendChild(crearCapa("Cebolla", "#993000", ingredientesVerdura.cebolla, h));
    }
    if (ingredientesVerdura.agua > 0) {
      tuboVerdura.appendChild(crearCapa("Agua", "#01a7d1", ingredientesVerdura.agua / 100, alturaAgua));
    }
  }
}


function hervirVerduras() {
  if (ingredientesVerdura.remolacha + ingredientesVerdura.repollo + ingredientesVerdura.cebolla === 0) {
    alert("Agrega verduras antes de hervir.");
    return;
  }
  if (hervorInterval) clearInterval(hervorInterval);
  fuego.style.display = "block";
  hervorProgreso = 0;
  hervorInterval = setInterval(() => {
    if (hervorProgreso < 1) {
      hervorProgreso += 0.02;
      fuego.style.opacity = 0.5 + 0.5 * Math.sin(hervorProgreso * Math.PI * 10);
      actualizarVisualVerdura(); 
    } else {
      clearInterval(hervorInterval);
      hervorInterval = null;
      fuego.style.display = "none";
      actualizarVisualVerdura(); 
      
    }
  }, 100);
}


function reiniciarSimuladorVerdura() {
  ingredientesVerdura = { remolacha: 0, repollo: 0, cebolla: 0, agua: 0 };
  hervorProgreso = 0;
  verduraSeleccionada = null;
  pigmentoProgreso = 0;
  [btnRemolacha, btnRepollo, btnCebolla].forEach(btn => {
    btn.disabled = false;
    btn.style.opacity = "1";
  });
  if (hervorInterval) clearInterval(hervorInterval);
  fuego.style.display = "none";
  actualizarVisualVerdura();
}


btnRemolacha.addEventListener("click", () => agregarIngredienteVerdura("remolacha"));
btnRepollo.addEventListener("click", () => agregarIngredienteVerdura("repollo"));
btnCebolla.addEventListener("click", () => agregarIngredienteVerdura("cebolla"));
btnHervir.addEventListener("click", hervirVerduras);
btnReiniciarVerdura.addEventListener("click", reiniciarSimuladorVerdura);
btnAgua.addEventListener("click", () =>agregarAguaSegunSimulador());



function agregarAguaSegunSimulador() {
  if (simuladorResiduos.style.display === "block") {
    ingredientesResiduos.agua += 100;
    mezclaProgreso = 0;
    actualizarVisualResiduos();
  } else if (simuladorVerduras.style.display === "block") {
    ingredientesVerdura.agua += 100;
    pigmentoProgreso = 0;
    if (hervorInterval) clearInterval(hervorInterval);
    hervorProgreso = 0;
    fuego.style.display = "none";
    actualizarVisualVerdura();
  } else {
    console.log("Ningún simulador activo para agregar agua");
  }
}



["mousedown", "touchstart"].forEach(evt => {
  btnAgua.addEventListener(evt, e => {
    e.preventDefault();
    agregarAguaSegunSimulador();
  }, { passive: false });
});

function calcularColorArrayVerdura() {
  const { remolacha, repollo, cebolla } = ingredientesVerdura;
  const totalVerdura = remolacha + repollo + cebolla;
  if (totalVerdura === 0) return [255, 255, 255];

  // Colores base
  const baseRemolacha = [122, 0, 60];
  const baseRepollo = [54, 0, 92];
  const baseCebolla = [153, 48, 0];

  // Colores brillantes
  const colorRemolacha = [252, 0, 126];
  const colorRepollo = [158, 22, 255];
  const colorCebolla = [255, 81, 0];


  const maxUnidades = 10;


  function colorInterpolado(base, brillante, cantidad) {
    const intensidad = Math.min(cantidad, maxUnidades) / maxUnidades;
    return base.map((comp, i) => interpolate(comp, brillante[i], intensidad));
  }


  const colorR = colorInterpolado(baseRemolacha, colorRemolacha, remolacha);
  const colorP = colorInterpolado(baseRepollo, colorRepollo, repollo);
  const colorC = colorInterpolado(baseCebolla, colorCebolla, cebolla);


  let r = 0, g = 0, b = 0;
  r += colorR[0] * remolacha + colorP[0] * repollo + colorC[0] * cebolla;
  g += colorR[1] * remolacha + colorP[1] * repollo + colorC[1] * cebolla;
  b += colorR[2] * remolacha + colorP[2] * repollo + colorC[2] * cebolla;

  r /= totalVerdura;
  g /= totalVerdura;
  b /= totalVerdura;

  return [r, g, b].map(c => Math.round(Math.min(255, c)));
}


function interpolate(base, target, t) {
  return base * (1 - t) + target * t;
}
