const fs = require('fs');
const pdfParse = require('pdf-parse');

const dataBuffer = fs.readFileSync('C:/Users/Asus/OneDrive/Desktop/DEVTrails_2026_Usecase_Document.pdf');

pdfParse(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(console.error);
