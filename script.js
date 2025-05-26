
document.getElementById("fecha").innerText = new Date().toLocaleDateString("es-ES");

const horarios = [
  "0:00 - 8:00",
  "8:00 - 10:00",
  "10:00 - 14:00",
  "14:00 - 18:00",
  "18:00 - 22:00",
  "22:00 - 0:00"
];

document.getElementById("upload").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const image = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);

  const lineHeight = canvas.height / 6;
  const precios = [];

  for (let i = 0; i < 6; i++) {
    const sy = i * lineHeight;
    const segment = ctx.getImageData(canvas.width * 0.5, sy, canvas.width * 0.45, lineHeight);
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = segment.width;
    tempCanvas.height = segment.height;
    tempCanvas.getContext("2d").putImageData(segment, 0, 0);

    const dataUrl = tempCanvas.toDataURL();
    const result = await Tesseract.recognize(dataUrl, 'eng', { tessedit_char_whitelist: '0123456789,€' });
    let base = result.data.text.replace(/[^0-9,]/g, "").trim();
    if (base) {
      if (!base.includes(",")) base = "0," + base.padStart(4, "0");
      const baseNum = parseFloat(base.replace(",", "."));
      const impuestos = (baseNum * 1.21 * 1.025).toFixed(4).replace(".", ",") + " €";
      precios.push([horarios[i], base.replace(".", ",") + " €", impuestos]);
    }
  }

  if (precios.length === 6) {
    renderTable(precios);
  } else {
    document.getElementById("tabla-container").innerHTML = "<p>Error al detectar todos los precios.</p>";
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
