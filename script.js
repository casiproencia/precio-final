
document.getElementById("imageInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  const reader = new FileReader();

  reader.onload = () => {
    img.src = reader.result;
  };
  reader.readAsDataURL(file);

  img.onload = async () => {
    const canvas = document.getElementById("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
    const precios = [...text.matchAll(/0,[0-9]{3,4}/g)].map(m => m[0].replace(",", "."));
    const tabla = document.createElement("table");
    tabla.innerHTML = "<tr><th>Precio base</th><th>Precio con impuestos</th></tr>";
    precios.forEach(precio => {
      const base = parseFloat(precio);
      const total = ((base * 1.025) * 1.21).toFixed(4);
      const fila = `<tr><td>${base.toFixed(4)} €</td><td>${total} €</td></tr>`;
      tabla.innerHTML += fila;
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
