document.getElementById('imageInput').addEventListener('change', function(e) {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const file = e.target.files[0];
  const img = new Image();
  const reader = new FileReader();

  reader.onload = function(event) {
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      Tesseract.recognize(img, 'eng', {
        logger: m => console.log(m)
      }).then(({ data: { text } }) => {
        const lines = text.split('\n').filter(l => l.match(/\d{1,2}:\d{2} - \d{1,2}:\d{2}/));
        ctx.fillStyle = "#fff";
        ctx.font = "16px Arial";
        let y = 30;
        lines.forEach(line => {
          const match = line.match(/(\d{1,2}:\d{2} - \d{1,2}:\d{2})\s+([0-9,]+) ?€/);
          if (match) {
            const tramo = match[1];
            const precio = parseFloat(match[2].replace(',', '.'));
            const precioFinal = (precio * 1.24025).toFixed(4).replace('.', ',') + ' €';
            ctx.fillText(`${tramo}  ${precioFinal}`, 10, y);
            y += 30;
          }
        });
      });
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

document.getElementById('downloadBtn').addEventListener('click', function() {
  const canvas = document.getElementById('canvas');
  const link = document.createElement('a');
  link.download = 'precios_con_IVA.jpg';
  link.href = canvas.toDataURL('image/jpeg', 1.0);
  link.click();
});
