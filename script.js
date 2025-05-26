
const fileInput = document.getElementById('fileInput');
const tablaPrecios = document.getElementById('tablaPrecios');
const fechaP = document.getElementById('fecha');
const saveBtn = document.getElementById('saveImageBtn');

fechaP.textContent = `Datos del día: ${new Date().toLocaleDateString('es-ES')}`;

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const sx = 50, sy = 480, sw = 320, sh = 220;
      canvas.width = sw;
      canvas.height = sh;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      Tesseract.recognize(canvas.toDataURL(), 'spa').then(({ data: { text } }) => {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.match(/^[0-9]+,[0-9]+/));
        tablaPrecios.innerHTML = '';
        lines.forEach(precio => {
          const base = parseFloat(precio.replace(',', '.'));
          const conImp = (base * 1.24).toFixed(4);
          const row = document.createElement('tr');
          row.innerHTML = `<td>${base.toFixed(4)} €</td><td>${conImp} €</td>`;
          tablaPrecios.appendChild(row);
        });
      });
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

saveBtn.addEventListener('click', () => {
  html2canvas(document.body).then(canvas => {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'precio-final.png';
    a.click();
  });
});
