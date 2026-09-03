/**
 * search.js
 *
 * Filtro funcional do painel de resultados.
 *
 * IMPORTANTE — o que isto é e o que não é:
 * Este script filtra os 3 registros de EXEMPLO que já estão no HTML,
 * usando os atributos data-* de cada card (categoria, avaliação,
 * número de avaliações, distância e status do site).
 *
 * Ele NÃO faz uma busca geográfica real nem consulta nenhuma API de
 * empresas de verdade — isso depende do Provider Layer (BusinessProvider /
 * MapsProvider) descrito na arquitetura, que ainda não está implementado.
 * Quando o backend real existir, a função applyFilters() abaixo deve ser
 * trocada por uma chamada à API do backend (ex.: fetch('/api/search', ...))
 * em vez de filtrar elementos que já estão na página.
 */

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('searchForm');
  const resultsList = document.getElementById('resultsList');
  const emptyState = document.getElementById('emptyState');
  const resultCount = document.getElementById('resultCount');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    applyFilters();
  });

  function applyFilters() {
    const radiusKm = parseFloat(document.getElementById('raio').value) || 0;
    const category = document.getElementById('cat').value;
    const minRating = parseFloat(document.getElementById('rating').value) || 0;
    const minReviews = parseInt(document.getElementById('reviews').value, 10) || 0;
    const onlyNoWebsite = document.getElementById('onlyNoWebsite').checked;

    const cards = resultsList.querySelectorAll('.record');
    let visibleCount = 0;

    cards.forEach(function (card) {
      const distance = parseFloat(card.dataset.distance);
      const rating = parseFloat(card.dataset.rating);
      const reviews = parseInt(card.dataset.reviews, 10);
      const cardCategory = card.dataset.category;
      const siteStatus = card.dataset.siteStatus; // "none" | "uncertain" | "active"

      let matches = true;

      // Aplicar filtros
      if (distance > radiusKm) matches = false;
      if (category !== 'todas' && cardCategory !== category) matches = false;
      if (rating < minRating) matches = false;
      if (reviews < minReviews) matches = false;
      if (onlyNoWebsite && siteStatus === 'active') matches = false;

      card.hidden = !matches;
      if (matches) visibleCount++;
    });

    // Atualizar estado vazio e contagem
    emptyState.hidden = visibleCount !== 0;
    resultCount.textContent = visibleCount === 1
      ? '1 registro de exemplo'
      : visibleCount + ' registros de exemplo';
  }

  // Aplica os filtros já no carregamento, para o estado inicial
  // corresponder aos valores padrão do formulário.
  applyFilters();
});
