
document.getElementById("fecha").innerText = new Date().toLocaleDateString("es-ES");

const horarios = [
  "0:00 - 8:00",
  "8:00 - 10:00",
  "10:00 - 14:00",
  "14:00 - 18:00",
  "18:00 - 22:00",
  "22:00 - 0:00"
];

const priceZones = [
  [490, 620, 180, 40],
  [490, 695, 180, 40],
  [490, 770, 180, 40],
  [490, 845, 180, 40],
  [490, 920, 180, 40],
  [490, 995, 180, 40],
];

document.getElementById("upload").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = 708;
  canvas.height = 1536;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, 708, 1536);

  const precios = [];
  for (let i = 0; i < 6; i++) {
    const [x, y, w, h] = priceZones[i];
    const segment = ctx.getImageData(x, y, w, h);
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    tempCanvas.getContext("2d").putImageData(segment, 0, 0);

    const dataUrl = tempCanvas.toDataURL();
    const result = await Tesseract.recognize(dataUrl, 'eng', { tessedit_char_whitelist: '0123456789,€' });
    let base = result.data.text.replace(/[^0-9,]/g, "").trim();
    if (base && base.length >= 4) {
      if (!base.includes(",")) base = "0," + base.padStart(4, "0");
      const baseNum = parseFloat(base.replace(",", "."));
      if (baseNum > 0.02 && baseNum < 1) {
        const impuestos = (baseNum * 1.21 * 1.025).toFixed(4).replace(".", ",") + " €";
        precios.push([horarios[i], base.replace(".", ",") + " €", impuestos]);
      }
    }
  }

  if (precios.length === 6) {
    renderTable(precios);
    document.getElementById("save").style.display = "inline-block";
  } else {
    
  }
});

function renderTable(filas) {
  const tabla = document.createElement("table");
  tabla.innerHTML = `
    <thead><tr><th>Horario</th><th>Precio base</th><th>Precio con impuestos</th></tr></thead>
    <tbody>
      ${filas.map(f => `<tr><td>${f[0]}</td><td>${f[1]}</td><td>${f[2]}</td></tr>`).join("")}
    </tbody>
  `;
  document.getElementById("tabla-container").innerHTML = "";
  document.getElementById("tabla-container").appendChild(tabla);
}

document.getElementById("save").addEventListener("click", () => {
  html2canvas(document.body).then(canvas => {
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/jpeg");
    a.download = "precios.jpg";
    a.click();
  });
});
