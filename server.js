const express = require('express');
const app = express();

/**
 * Stub simples para /api/search — retorna mocks.
 * Substitua pela integração com Google Places / Foursquare / DB real.
 */
app.get('/api/search', (req, res) => {
  const mocks = [
    { id: 1, name: 'Padaria do Bairro', category: 'Alimentação', rating: 4.6, reviews: 120, distanceKm: 0.7, siteStatus: 'active', website: 'https://padariadobairro.example', address: 'Rua A, 123', phone: '+55 11 99999-0000', description: 'Padaria tradicional com pão artesanal.' },
    { id: 2, name: 'Oficina RapidFix', category: 'Serviços', rating: 4.2, reviews: 45, distanceKm: 1.2, siteStatus: 'none', website: null, address: 'Av. B, 45', phone: '+55 11 98888-1111', description: 'Consertos rápidos e revisões.' }
  ];
  res.json(mocks);
});

app.listen(3000, () => console.log('Stub API rodando em :3000'));
