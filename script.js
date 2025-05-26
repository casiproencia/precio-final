
document.getElementById('imageInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = "Procesando imagen...";

    const reader = new FileReader();
    reader.onload = async () => {
        const { data: { text } } = await Tesseract.recognize(reader.result, 'eng');

        const lines = text.split('\n').map(l => l.trim()).filter(l => l.match(/^0\.[0-9]+ ?€?$/));

        if (lines.length < 6) {
            resultContainer.innerHTML = "No se reconocieron suficientes precios.";
            return;
        }

        const horarios = [
            "0:00 - 8:00",
            "8:00 - 10:00",
            "10:00 - 14:00",
            "14:00 - 18:00",
            "18:00 - 22:00",
            "22:00 - 0:00"
        ];

        const basePrices = lines.slice(0, 6);
        const taxPrices = basePrices.map(p => {
            const num = parseFloat(p.replace('€', '').trim());
            return (num * 1.24).toFixed(4) + " €";
        });

        let table = "<table><tr><th>Horario</th><th>Precio base</th><th>Precio con impuestos</th></tr>";
        for (let i = 0; i < 6; i++) {
            table += `<tr><td>${horarios[i]}</td><td>${basePrices[i]}</td><td>${taxPrices[i]}</td></tr>`;
        }
        table += "</table>";
        resultContainer.innerHTML = table;
    };
    reader.readAsDataURL(file);
});

document.getElementById('saveButton').addEventListener('click', () => {
    html2canvas(document.querySelector('.container')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'precio_final.png';
        link.href = canvas.toDataURL();
        link.click();
    });
});
