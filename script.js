document.getElementById('fecha').textContent = "Datos del día: " + new Date().toLocaleDateString('es-ES');

document.getElementById('imageInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";

  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      Tesseract.recognize(img, 'eng', {
        logger: m => console.log(m)
      }).then(({ data: { text } }) => {
        const lines = text.split('\n').filter(l => l.match(/\d{1,2}:\d{2} - \d{1,2}:\d{2}/));
        lines.forEach(line => {
          const match = line.match(/(\d{1,2}:\d{2} - \d{1,2}:\d{2})\s+([0-9]{1,2},[0-9]{4}) ?€/);
          if (match) {
            const tramo = match[1];
            const precioBase = parseFloat(match[2].replace(",", "."));
            const precioFinal = (precioBase * 1.24025).toFixed(4).replace('.', ',') + ' €';
            const baseFormatted = precioBase.toFixed(4).replace('.', ',') + ' €';
            const row = `<tr><td>${tramo}</td><td>${baseFormatted}</td><td>${precioFinal}</td></tr>`;
            tbody.innerHTML += row;
          }
        });
      });
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById('downloadBtn').addEventListener('click', function() {
  html2canvas(document.querySelector('.container')).then(canvas => {
    const link = document.createElement('a');
    link.download = 'precios_finales.jpg';
    link.href = canvas.toDataURL('image/jpeg', 1.0);
    link.click();
  });
});
