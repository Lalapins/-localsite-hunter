/**
 * search.js - versão com fetch para backend e geração de prompt
 *
 * Observação: mantém fallback para filtrar os cards já existentes
 * quando a API /api/search não estiver disponível.
 */

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('searchForm');
  const resultsList = document.getElementById('resultsList');
  const emptyState = document.getElementById('emptyState');
  const resultCount = document.getElementById('resultCount');
  // Crie no HTML: <textarea id="promptArea"></textarea> para exibir o prompt
  const promptArea = document.getElementById('promptArea');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    applyFilters();
  });

  async function applyFilters() {
    const radiusKm = parseFloat(document.getElementById('raio').value) || 0;
    const category = document.getElementById('cat').value;
    const minRating = parseFloat(document.getElementById('rating').value) || 0;
    const minReviews = parseInt(document.getElementById('reviews').value, 10) || 0;
    const onlyNoWebsite = document.getElementById('onlyNoWebsite').checked;

    // Tentar obter posição do usuário
    try {
      const pos = await getCurrentPosition({ enableHighAccuracy: true, timeout: 8000 });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // Chamar o backend para buscar empresas próximas
      const businesses = await fetchBusinesses({ lat, lng, radiusKm, category, minRating, minReviews, onlyNoWebsite });
      renderResults(businesses);
    } catch (err) {
      // Se geolocalização ou fetch falhar: fallback para filtrar os cards existentes
      console.warn('Geolocalização ou busca falhou, usando fallback local:', err);
      filterExistingCards({ radiusKm, category, minRating, minReviews, onlyNoWebsite });
    }
  }

  function getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error('Geolocation not supported'));
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  async function fetchBusinesses({ lat, lng, radiusKm, category, minRating, minReviews, onlyNoWebsite }) {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radiusKm: radiusKm.toString(),
      category,
      minRating: minRating.toString(),
      minReviews: minReviews.toString(),
      onlyNoWebsite: onlyNoWebsite ? '1' : '0'
    });

    const url = `/api/search?${params.toString()}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      // Espera-se: [{ id, name, category, rating, reviews, distanceKm, siteStatus, website, address, phone, description }, ...]
      return data;
    } catch (err) {
      console.error('fetchBusinesses failed:', err);
      throw err;
    }
  }

  function renderResults(businesses) {
    resultsList.innerHTML = '';
    let visibleCount = 0;

    if (!Array.isArray(businesses) || businesses.length === 0) {
      emptyState.hidden = false;
      resultCount.textContent = '0 registros de exemplo';
      return;
    }

    businesses.forEach(b => {
      const card = document.createElement('article');
      card.className = 'record';
      card.dataset.distance = String(b.distanceKm ?? 0);
      card.dataset.rating = String(b.rating ?? 0);
      card.dataset.reviews = String(b.reviews ?? 0);
      card.dataset.category = b.category ?? 'outras';
      card.dataset.siteStatus = b.siteStatus ?? 'none';

      card.innerHTML = `
        <h3 class="name">${escapeHtml(b.name)}</h3>
        <p class="meta">${escapeHtml(b.category)} — ${formatDistance(b.distanceKm)}</p>
        <p class="rating">Avaliação: ${b.rating ?? '—'} (${b.reviews ?? 0} avaliações)</p>
        <p class="address">${escapeHtml(b.address ?? '')}</p>
        <p class="phone">${escapeHtml(b.phone ?? '')}</p>
        <div class="card-actions">
          <a class="visit-site" ${b.website ? `href="${escapeAttr(b.website)}" target="_blank"` : 'aria-disabled="true"'}>
            ${b.website ? 'Visitar site' : 'Sem site'}
          </a>
          <button class="generate-prompt">Gerar prompt</button>
        </div>
      `;

      // Gerar prompt ao clicar
      card.querySelector('.generate-prompt').addEventListener('click', () => {
        const prompt = generatePromptForBusiness(b);
        if (promptArea) {
          promptArea.value = prompt;
          promptArea.focus();
        } else {
          // fallback: abrir em nova aba com prompt como query (opcional)
          console.log('Prompt gerado:', prompt);
          alert('Prompt gerado — ver console ou adicione #promptArea ao HTML para exibi-lo.');
        }
      });

      resultsList.appendChild(card);
      visibleCount++;
    });

    emptyState.hidden = visibleCount !== 0;
    resultCount.textContent = visibleCount === 1 ? '1 registro de exemplo' : visibleCount + ' registros de exemplo';
  }

  // Gera uma string de prompt para criação de site a partir dos dados da empresa
  function generatePromptForBusiness(b) {
    // Customize o texto conforme seu modelo / prompt template
    const lines = [
      `Crie um site one-page profissional para a empresa "${b.name}".`,
      `Categoria: ${b.category || '—'}.`,
      `Descrição curta: ${b.description || 'Não disponível.'}`,
      `Endereço: ${b.address || 'Não disponível.'}`,
      `Telefone: ${b.phone || 'Não disponível.'}`,
      `Avaliação média: ${b.rating ?? '—'} (${b.reviews ?? 0} avaliações).`,
      b.website ? `Site atual: ${b.website}` : 'A empresa não possui site conhecido.',
      '',
      'Requisitos do site:',
      '- Layout responsivo, 1 página (hero, serviços, sobre, contato).',
      '- CTA de contato (telefone / WhatsApp) em destaque.',
      '- Paleta de cores neutra + destaque na cor primária do setor.',
      '- SEO básico (title, meta description).',
      '',
      'Gere o HTML/CSS/JS e os textos (headline, descrição, lista de serviços, CTA).'
    ];
    return lines.join('\n');
  }

  // Fallback que aplica os filtros nos cards já presentes no HTML
  function filterExistingCards({ radiusKm, category, minRating, minReviews, onlyNoWebsite }) {
    const cards = resultsList.querySelectorAll('.record');
    let visibleCount = 0;

    cards.forEach(function (card) {
      const distance = parseFloat(card.dataset.distance);
      const rating = parseFloat(card.dataset.rating);
      const reviews = parseInt(card.dataset.reviews, 10);
      const cardCategory = card.dataset.category;
      const siteStatus = card.dataset.siteStatus; // "none" | "uncertain" | "active"

      let matches = true;
      if (distance > radiusKm) matches = false;
      if (category !== 'todas' && cardCategory !== category) matches = false;
      if (rating < minRating) matches = false;
      if (reviews < minReviews) matches = false;
      if (onlyNoWebsite && siteStatus === 'active') matches = false;

      card.hidden = !matches;
      if (matches) visibleCount++;
    });

    emptyState.hidden = visibleCount !== 0;
    resultCount.textContent = visibleCount === 1 ? '1 registro de exemplo' : visibleCount + ' registros de exemplo';
  }

  // utilitários simples
  function formatDistance(d) {
    if (d == null) return '—';
    return d >= 1 ? `${d.toFixed(1)} km` : `${Math.round(d * 1000)} m`;
  }

  function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // aplica filtros iniciais ao carregar (comportamento antigo se API não existir)
  applyFilters();
});
