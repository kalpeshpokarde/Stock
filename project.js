const stockListEl = document.getElementById('stock-list');
const newsListEl = document.getElementById('news-list');
const searchEl = document.getElementById('search');
const refreshBtn = document.getElementById('refresh');
const darkModeBtn = document.getElementById('dark-mode-toggle');
const sortEl = document.getElementById('sort');
const stockLoader = document.getElementById('stock-loader');
const newsLoader = document.getElementById('news-loader');

const apiKey = 'd0ag3ehr01qm3l9l6u1gd0ag3ehr01qm3l9l6u20';

const companies = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'BABA', name: 'Alibaba Group' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'MA', name: 'Mastercard Inc.' },
  { symbol: 'DIS', name: 'Walt Disney Co.' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.' },
  { symbol: 'INTC', name: 'Intel Corporation' },
  { symbol: 'ORCL', name: 'Oracle Corporation' },
  { symbol: 'PEP', name: 'PepsiCo Inc.' },
  { symbol: 'KO', name: 'Coca-Cola Co.' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'PG', name: 'Procter & Gamble Co.' }
];

let stockDataCache = [];

// Load Stocks
async function loadStocks() {
  stockListEl.innerHTML = '';
  stockLoader.style.display = 'block';
  let fetchedData = [];

  for (let company of companies) {
    try {
      const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${company.symbol}&token=${apiKey}`);
      const data = await res.json();

      if (!data.c) continue;

      const change = (data.c - data.pc).toFixed(2);
      const percentChange = ((change / data.pc) * 100).toFixed(2);

      fetchedData.push({
        ...company,
        price: data.c,
        change: parseFloat(change),
        percentChange: parseFloat(percentChange),
        open: data.o,
        high: data.h,
        low: data.l,
        prevClose: data.pc
      });
    } catch (err) {
      console.error(`Error fetching ${company.symbol}:`, err);
    }
  }

  stockDataCache = fetchedData;
  displayStocks(fetchedData);
  stockLoader.style.display = 'none';
}

function displayStocks(data) {
  stockListEl.innerHTML = '';
  data.forEach(company => {
    const card = document.createElement('div');
    card.className = 'stock-card';
    card.innerHTML = `
      <h3>${company.symbol} <span class="arrow">▼</span></h3>
      <p>${company.name}</p>
      <p>Price: $${company.price.toFixed(2)}</p>
      <p style="color:${company.change >= 0 ? 'lightgreen' : 'red'}">
        Change: ${company.change} (${company.percentChange}%)
      </p>
      <div class="extra-details">
        <p>Open: $${company.open}</p>
        <p>High: $${company.high}</p>
        <p>Low: $${company.low}</p>
        <p>Previous Close: $${company.prevClose}</p>
      </div>
    `;
    card.addEventListener('click', () => {
      const details = card.querySelector('.extra-details');
      const arrow = card.querySelector('.arrow');
      details.classList.toggle('show');
      arrow.classList.toggle('rotate');
    });
    stockListEl.appendChild(card);
  });
}

// Load News
async function loadNews() {
  newsListEl.innerHTML = '';
  newsLoader.style.display = 'block';
  try {
    const res = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${apiKey}`);
    const articles = await res.json();
    articles.slice(0, 10).forEach(news => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${news.url}" target="_blank">${news.headline}</a>`;
      newsListEl.appendChild(li);
    });
  } catch (err) {
    console.error('Error fetching news:', err);
  }
  newsLoader.style.display = 'none';
}

// Search filter
searchEl.addEventListener('input', () => {
  const term = searchEl.value.toLowerCase();
  document.querySelectorAll('.stock-card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(term) ? '' : 'none';
  });
});

// Sort stocks
sortEl.addEventListener('change', () => {
  let sorted = [...stockDataCache];
  if (sortEl.value === 'price') {
    sorted.sort((a, b) => b.price - a.price);
  } else if (sortEl.value === 'change') {
    sorted.sort((a, b) => b.percentChange - a.percentChange);
  } else if (sortEl.value === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  displayStocks(sorted);
});

// Refresh button
refreshBtn.addEventListener('click', () => {
  loadStocks();
  loadNews();
});

// Dark mode toggle
darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Auto refresh every 60s
setInterval(() => {
  loadStocks();
  loadNews();
}, 60000);

// Initial load
loadStocks();
loadNews();