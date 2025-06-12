const API_URL = 'https://hydrofish-api-2ywj.vercel.app/api/sensordata';
const tbody = document.getElementById('sensorDataBody');
const ctx = document.getElementById('sensorChart').getContext('2d');
const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');
const pageIndicator = document.getElementById('pageIndicator');

let chart;
let currentPage = 1;
const itemsPerPage = 10;
let sensorData = [];

// Ambil data dari API
async function fetchSensorData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    sensorData = data.reverse();
    renderPage();
  } catch (error) {
    console.error('Gagal mengambil data:', error);
  }
}

// Render tabel dan grafik
function renderPage() {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = sensorData.slice(start, end);

  tbody.innerHTML = '';

  const labels = [];
  const tdsData = [];
  const phData = [];
  const suhuData = [];
  const tinggiData = [];

  pageData.forEach(item => {
    const time = dayjs(item.timestamp._seconds * 1000).format('DD/MM/YYYY HH:mm:ss');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${time}</td>
      <td>${item.tds}</td>
      <td>${item.turbidity}</td>
      <td>${item.ph_air}</td>
      <td>${item.suhu_air}</td>
      <td>${item.tinggi_air}</td>
      <td>
        <button class="btn-delete" data-id="${item.id}">Hapus</button>
      </td>
    `;
    tbody.appendChild(row);

    labels.push(time);
    tdsData.push(item.tds);
    phData.push(item.ph_air);
    suhuData.push(item.suhu_air);
    tinggiData.push(item.tinggi_air);
  });

  renderChart(labels, tdsData, phData, suhuData, tinggiData);

  pageIndicator.textContent = `Halaman ${currentPage} dari ${Math.ceil(sensorData.length / itemsPerPage)}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = end >= sensorData.length;
}

// Render grafik
function renderChart(labels, tdsData, phData, suhuData, tinggiData) {
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'TDS (ppm)',
          data: tdsData,
          borderColor: '#89CFF0',
          backgroundColor: 'rgba(137, 207, 240, 0.2)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'pH Air',
          data: phData,
          borderColor: '#B0E57C',
          backgroundColor: 'rgba(176, 229, 124, 0.2)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Suhu Air (°C)',
          data: suhuData,
          borderColor: '#FFE4A1',
          backgroundColor: 'rgba(255, 228, 161, 0.2)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Tinggi Air (cm)',
          data: tinggiData,
          borderColor: '#FFB6C1',
          backgroundColor: 'rgba(255, 182, 193, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#333',
            font: {
              weight: 'bold'
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#444'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#444'
          }
        }
      }
    }
  });
}

// Hapus data
async function deleteData(id) {
  if (!id) {
    alert("ID data tidak ditemukan.");
    return;
  }

  if (confirm('Yakin ingin menghapus data ini?')) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (response.ok) {
        alert(result.message || 'Data berhasil dihapus');
        await fetchSensorData();
      } else {
        alert(result.message || 'Gagal menghapus data.');
      }
    } catch (error) {
      console.error('Gagal menghapus data:', error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  }
}

// Event delegation untuk tombol hapus
tbody.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-delete')) {
    const id = e.target.getAttribute('data-id');
    deleteData(id);
  }
});

// Navigasi halaman
prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
  }
});

nextBtn.addEventListener('click', () => {
  if ((currentPage * itemsPerPage) < sensorData.length) {
    currentPage++;
    renderPage();
  }
});

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', fetchSensorData);
