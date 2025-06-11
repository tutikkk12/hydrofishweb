// js/main.js

// Import Firebase modules
import { database, firestore } from './firebase-config.js';
import {
  ref,
  onValue,
  set
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

import {
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// === Animasi Focus pada Input ===
document.querySelectorAll(".input").forEach((input) => {
  input.addEventListener("focus", () => {
    input.closest(".input-div").classList.add("focus");
  });

  input.addEventListener("blur", () => {
    if (input.value === "") {
      input.closest(".input-div").classList.remove("focus");
    }
  });
});

// === Efek Hover Navigasi ===
document.querySelectorAll(".navigation li").forEach((item) => {
  item.addEventListener("mouseover", () => {
    document.querySelectorAll(".navigation li").forEach((i) => i.classList.remove("hovered"));
    item.classList.add("hovered");
  });
});

// === Toggle Sidebar Menu ===
const toggle = document.querySelector(".toggle");
const navigation = document.querySelector(".navigation");
const main = document.querySelector(".main");

toggle.onclick = () => {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};

// === Listener Data Sensor Realtime ===
const sensorRef = ref(database, 'sensor_data');

onValue(sensorRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) {
    console.log("Data kosong.");
    return;
  }

  document.getElementById('tdsOutput').innerText = `${data.tds ?? '-'} ppm`;
  document.getElementById('turbidityOutput').innerText = data.turbidity ?? '-';
  document.getElementById('phOutput').innerText = `${data.ph ?? '-'} pH`;
  document.getElementById('suhuOutput').innerText = `${data.suhu ?? '-'} °C`;
  document.getElementById('tinggiOutput').innerText = `${data.tinggi_air ?? '-'} cm`;
  document.getElementById('pakanOutput').innerText = data.status_pakan ? 'ON' : 'OFF';
});

// === Ambil dan Tampilkan Jadwal Pakan ===
const jadwalRef = ref(database, 'jadwal_pakan');

onValue(jadwalRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    document.getElementById('jadwal_pagi').value = data.pagi ?? '';
    document.getElementById('jadwal_sore').value = data.sore ?? '';
    document.getElementById('jadwal_malam').value = data.malem ?? '';
    document.getElementById('jumlah_takar').value = data.jumlah_takar ?? '';
  }
});

// === Simpan Jadwal Pakan ke Firebase ===
const settingForm = document.querySelector(".settingBox");

settingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const pagi = document.getElementById('jadwal_pagi').value;
  const sore = document.getElementById('jadwal_sore').value;
  const malam = document.getElementById('jadwal_malam').value;
  const jumlahTakar = parseInt(document.getElementById('jumlah_takar').value);

  if (isNaN(jumlahTakar)) {
    alert("Jumlah takar harus berupa angka.");
    return;
  }

  set(jadwalRef, {
    pagi,
    sore,
    malem: malam,
    jumlah_takar: jumlahTakar
  })
    .then(() => alert("Jadwal pakan berhasil disimpan!"))
    .catch((error) => {
      console.error("Gagal menyimpan data:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    });
});

// === Ambil Data Riwayat dari Firestore ===
async function fetchHistoryData() {
  try {
    const q = query(
      collection(firestore, "history"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    const sensorLogs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        timestamp: data.timestamp.toDate(),
        tds: data.tds,
        turbidity: data.turbidity,
        ph_air: data.ph_air,
        suhu_air: data.suhu_air,
        tinggi_air: data.tinggi_air
      };
    });

    updateTable(sensorLogs);
    updateChart(sensorLogs);
  } catch (error) {
    console.error("Gagal mengambil data riwayat:", error);
  }
}

// === Tampilkan Data ke Tabel ===
function updateTable(sensorLogs) {
  const tbody = document.getElementById('sensorDataBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  sensorLogs.forEach(log => {
    const turbidityBadge = log.turbidity === "Jernih"
      ? `<span style="color: white; background-color: green; padding: 2px 8px; border-radius: 4px;">${log.turbidity}</span>`
      : `<span style="color: white; background-color: red; padding: 2px 8px; border-radius: 4px;">${log.turbidity ?? '-'}</span>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${dayjs(log.timestamp).format('DD-MM-YYYY HH:mm')}</td>
      <td>${log.tds ?? '-'}</td>
      <td>${turbidityBadge}</td>
      <td>${log.ph_air ?? '-'}</td>
      <td>${log.suhu_air ?? '-'}</td>
      <td>${log.tinggi_air ?? '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// === Update Grafik Sensor ===
function updateChart(sensorLogs) {
  const labels = sensorLogs.map(log => dayjs(log.timestamp).format('HH:mm')).reverse();
  const tdsData = sensorLogs.map(log => log.tds).reverse();
  const phData = sensorLogs.map(log => log.ph_air).reverse();
  const suhuData = sensorLogs.map(log => log.suhu_air).reverse();
  const tinggiData = sensorLogs.map(log => log.tinggi_air).reverse();

  const ctx = document.getElementById('sensorChart')?.getContext('2d');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'TDS (ppm)',
          data: tdsData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'pH Air',
          data: phData,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Suhu Air (°C)',
          data: suhuData,
          borderColor: 'rgba(255, 206, 86, 1)',
          backgroundColor: 'rgba(255, 206, 86, 0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Tinggi Air (cm)',
          data: tinggiData,
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.1)',
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Waktu'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Nilai Sensor'
          },
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// === Jalankan saat halaman dimuat ===
window.addEventListener('DOMContentLoaded', fetchHistoryData);
