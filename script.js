
document.getElementById("fecha").innerText = "Datos del día: " + new Date().toLocaleDateString();

document.getElementById("imageInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  const reader = new FileReader();

  reader.onload = () => img.src = reader.result;
  reader.readAsDataURL(file);

  img.onload = async () => {
    const canvas = document.getElementById("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext("2d").drawImage(img, 0, 0);

    const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
    const horarios = [...text.matchAll(/[0-9]{1,2}:[0-9]{2}\s*-\s*[0-9]{1,2}:[0-9]{2}/g)].map(m => m[0].replace(/\s*/g, ''));
    const precios = [...text.matchAll(/0,[0-9]{3,4}/g)].map(m => m[0].replace(",", "."));
    const preciosFiltrados = precios.slice(0, horarios.length);

    const tabla = document.createElement("table");
    tabla.innerHTML = "<tr><th>Horario</th><th>Precio base</th><th>Precio con impuestos</th></tr>";

    preciosFiltrados.forEach((precio, i) => {
      const base = parseFloat(precio);
      const final = ((base * 1.025) * 1.21).toFixed(4);
      tabla.innerHTML += `<tr>
        <td>${horarios[i] || "-"}</td>
        <td>${base.toFixed(4)} €</td>
        <td>${final} €</td>
      </tr>`;
    });

    const results = document.getElementById("results");
    results.innerHTML = "";
    results.appendChild(tabla);
    document.getElementById("exportBtn").style.display = "inline-block";
  };
});

document.getElementById("exportBtn").addEventListener("click", () => {
  html2canvas(document.getElementById("results")).then(canvas => {
    const link = document.createElement("a");
    link.download = "precios_finales.jpg";
    link.href = canvas.toDataURL("image/jpeg");
    link.click();
  });
});
