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

  // Validar se os botões existem
  if (!btnExportImg || !btnExportPdf) {
    console.error('Botões de exportação não encontrados no DOM');
    return;
  }

  function capturePreview(onCanvas) {
    const target = document.getElementById('previewCapture');
    if (!target) {
      console.error('Elemento #previewCapture não encontrado');
      return;
    }

    // Verificar se html2canvas está disponível
    if (typeof html2canvas === 'undefined') {
      console.error('html2canvas não está carregado');
      alert('Erro: biblioteca de captura não está disponível');
      return;
    }

    html2canvas(target, { backgroundColor: '#F7F4EC', scale: 2 })
      .then(onCanvas)
      .catch(function (error) {
        console.error('Erro ao capturar preview:', error);
        alert('Erro ao gerar prévia. Tente novamente.');
      });
  }

  // Botão "Baixar como imagem"
  btnExportImg.addEventListener('click', function () {
    capturePreview(function (canvas) {
      try {
        const link = document.createElement('a');
        link.download = 'previa-localsite-hunter.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Erro ao baixar imagem:', error);
        alert('Erro ao baixar a imagem. Tente novamente.');
      }
    });
  });

  // Botão "Baixar como PDF"
  btnExportPdf.addEventListener('click', function () {
    capturePreview(function (canvas) {
      try {
        // Verificar se jsPDF está disponível
        if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
          console.error('jsPDF não está carregado');
          alert('Erro: biblioteca de PDF não está disponível');
          return;
        }

        const { jsPDF } = window.jspdf;
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = 210; // A4 em mm, retrato
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('previa-localsite-hunter.pdf');
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar o PDF. Tente novamente.');
      }
    });
  });
});
