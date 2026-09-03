/**
 * export.js
 *
 * Exportação da área de resultados (#previewCapture) como imagem (PNG)
 * ou PDF estático, para envio ao cliente sem expor código ou funcionalidade.
 * Depende das bibliotecas html2canvas e jsPDF, carregadas via <script>
 * no index.html antes deste arquivo.
 */

document.addEventListener('DOMContentLoaded', function () {
  const btnExportImg = document.getElementById('btnExportImg');
  const btnExportPdf = document.getElementById('btnExportPdf');

  function capturePreview(onCanvas) {
    const target = document.getElementById('previewCapture');
    html2canvas(target, { backgroundColor: '#F7F4EC', scale: 2 }).then(onCanvas);
  }

  btnExportImg.addEventListener('click', function () {
    capturePreview(function (canvas) {
      const link = document.createElement('a');
      link.download = 'previa-localsite-hunter.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  });

  btnExportPdf.addEventListener('click', function () {
    capturePreview(function (canvas) {
      const { jsPDF } = window.jspdf;
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210; // A4 em mm, retrato
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('previa-localsite-hunter.pdf');
    });
  });
});
