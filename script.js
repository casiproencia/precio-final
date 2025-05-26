const fileInput = document.getElementById('fileInput');
const fileNameP = document.getElementById('fileName');
const tablaPrecios = document.getElementById('tablaPrecios');
const fechaP = document.getElementById('fecha');
const saveBtn = document.getElementById('saveImageBtn');

fechaP.textContent = `Datos del día: ${new Date().toLocaleDateString('es-ES')}`;

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  fileNameP.textContent = file.name;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      // Tamaño para la región del cuadro con horarios y precios (ajustar si fuera necesario)
      const sx = 50, sy = 480, sw = 320, sh = 220;
      canvas.width = sw;
      canvas.height = sh;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      Tesseract.recognize(canvas.toDataURL(), 'spa').then(({ data: { text } }) => {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        tablaPrecios.innerHTML = '';
        for(let i=0; i<lines.length; i++){
          const row = document.createElement('tr');
          const parts = lines[i].split(/\s+/);
          if(parts.length >= 4){
            const horario = `${parts[0]} ${parts[1]} ${parts[2]}`;
            const precioBase = parts[3].replace(',', '.');
            const precioImp = parts[4] ? parts[4].replace(',', '.') : '';
            const tdH = document.createElement('td');
            tdH.textContent = horario;
            const tdPB = document.createElement('td');
            tdPB.textContent = `${parseFloat(precioBase).toFixed(4)} €`;
            const tdPI = document.createElement('td');
            tdPI.textContent = precioImp ? `${parseFloat(precioImp).toFixed(4)} €` : '';
            row.appendChild(tdH);
            row.appendChild(tdPB);
            row.appendChild(tdPI);
            tablaPrecios.appendChild(row);
          }
        }
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
