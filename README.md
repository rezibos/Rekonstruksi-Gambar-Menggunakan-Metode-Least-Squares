# 🖼️ Image Restoration menggunakan Least Squares Method (LSM)

Aplikasi web untuk rekonstruksi gambar yang rusak menggunakan metode **Least Squares Method** dalam mata kuliah Aljabar Linear.

---

## 👥 Anggota Kelompok

| Nama | NIM |
|------|-----|
| **Fachrezi Bachri** | 2401020010 |
| **Haikal Fachry Akbar** | 2401020027 |
| **Raga Akbar** | 2301020062 |
| **Dzaky Ribal Faiz** | 2401020035 |

---

## 📌 Tujuan Proyek

Proyek ini bertujuan untuk:

1. **Mengimplementasikan** konsep Least Squares Method (LSM) dalam penyelesaian sistem overdetermined
2. **Menerapkan** teori Aljabar Linear dalam kasus nyata image processing
3. **Membangun** aplikasi yang dapat merestorasi gambar yang rusak akibat noise dan piksel hilang
4. **Meminimalkan error** rekonstruksi menggunakan weighted averaging dengan Gaussian weighting
5. **Menganalisis** performa metode LSM menggunakan metrik RMSE (Root Mean Square Error)

---

## 🎯 Deskripsi Aplikasi

Aplikasi ini merupakan implementasi **Least Squares Method** untuk **Image Restoration**. Ketika sebuah gambar mengalami kerusakan berupa:
- **Noise** (gangguan acak pada piksel)
- **Piksel hilang** (area hitam pada gambar)

LSM dapat digunakan untuk mengembalikan gambar mendekati kondisi aslinya dengan cara:
- Mengestimasi nilai piksel yang hilang dari piksel tetangga
- Mengurangi noise menggunakan weighted averaging
- Mengoptimalkan rekonstruksi berdasarkan informasi lokal (window 3×3)

### 🔬 Metode yang Digunakan

**Least Squares Method (LSM)** adalah teknik optimisasi matematika yang meminimalkan jumlah kuadrat error antara nilai yang diamati dan nilai prediksi.

**Formula Gaussian Weighting:**
```
w = e^(-distance²/2)
```

Dimana piksel yang lebih dekat mendapat bobot lebih tinggi, menghasilkan rekonstruksi yang smooth dan natural.

---

## 🚀 Cara Instalasi

### Prerequisites
Pastikan sudah terinstall:
- **Node.js** (v14 atau lebih baru) - Download di [nodejs.org](https://nodejs.org)
- **npm** (Node Package Manager) - Terinstall otomatis dengan Node.js

### Langkah Instalasi

1. **Clone atau Download Repository**
```bash
git clone <repository-url>
cd image-restoration
```

Atau download ZIP dan extract, lalu buka folder di terminal/command prompt.

2. **Install Dependencies**
```bash
npm install
```

3. **Install Tailwind CSS**
```bash
npm install -D tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.17
```

4. **Install Lucide React (Icons)**
```bash
npm install lucide-react
```

5. **Buat File Konfigurasi Tailwind**

**File: `tailwind.config.js`** (di root folder, sejajar dengan package.json)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**File: `postcss.config.js`** (di root folder)
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

6. **Edit `src/index.css`**

Ganti **SEMUA ISI** file `src/index.css` dengan:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

7. **Copy Kode Aplikasi**

Copy kode aplikasi ke file `src/App.js`

8. **Jalankan Aplikasi**
```bash
npm start
```

Aplikasi akan terbuka otomatis di browser pada `http://localhost:3000`

---

## 📖 Cara Penggunaan

### 1️⃣ Upload Gambar
- Klik area **"Upload Gambar Anda"** (kotak dengan icon upload)
- Pilih file gambar dari komputer (format: PNG, JPG, JPEG)
- Gambar asli akan muncul di bagian **"Original"**

### 2️⃣ Atur Parameter Kerusakan
Sesuaikan parameter sesuai kebutuhan:

**Level Noise** (0-100):
- Mengatur intensitas noise/gangguan pada gambar
- 0 = tidak ada noise
- 100 = noise maksimal
- **Rekomendasi: 20-40** untuk hasil realistis

**Piksel Hilang** (0-50%):
- Persentase piksel yang akan dihilangkan (menjadi hitam)
- 0% = tidak ada piksel hilang
- 50% = setengah gambar hilang
- **Rekomendasi: 10-30%** untuk hasil optimal

### 3️⃣ Rusak Gambar
- Klik tombol **"Rusak Gambar"** (tombol biru)
- Gambar rusak akan muncul di bagian **"Gambar Rusak"**
- Anda akan melihat efek noise dan area hitam (piksel hilang)

### 4️⃣ Restore Gambar dengan LSM
- Klik tombol **"Restore Sekarang"** (tombol biru gelap)
- Tunggu proses restorasi (beberapa detik)
- Hasil restorasi akan muncul di bagian **"Hasil Restore"**

### 5️⃣ Analisis Hasil
Setelah restorasi selesai, akan muncul **Hasil Analisis Performa**:

- **RMSE Gambar Rusak**: Mengukur seberapa rusak gambar (nilai tinggi = lebih rusak)
- **RMSE Hasil Restore**: Mengukur error hasil restore (nilai rendah = lebih baik)
- **Peningkatan**: Persentase perbaikan kualitas gambar

💡 **Semakin tinggi persentase peningkatan, semakin baik performa LSM!**

### 6️⃣ Download Hasil (Opsional)
- Klik tombol **"Download"** di bawah gambar yang ingin didownload
- Tersedia untuk gambar rusak dan hasil restore

### 7️⃣ Reset
- Klik tombol **"Reset"** untuk memulai dari awal dengan gambar baru

---

## 📊 Metrik Evaluasi

### RMSE (Root Mean Square Error)
```
RMSE = √(Σ(pixel_original - pixel_predicted)² / N)
```

- **RMSE lebih rendah** = gambar lebih mendekati original
- **Peningkatan** = (RMSE_noisy - RMSE_restored) / RMSE_noisy × 100%

---

## 🔧 Troubleshooting

### Error: "Can't resolve 'lucide-react'"
```bash
npm install lucide-react
```

### Error: Tailwind CSS tidak bekerja
1. Pastikan file `tailwind.config.js` dan `postcss.config.js` sudah dibuat
2. Pastikan `src/index.css` berisi `@tailwind` directives
3. Restart aplikasi: `Ctrl+C` lalu `npm start`

### Error: "Image is not a constructor"
Sudah diperbaiki dengan menggunakan `ImageIcon` dari lucide-react

### Aplikasi tidak jalan
```bash
# Stop aplikasi (Ctrl+C)
npm cache clean --force
npm install
npm start
```

---

## 💻 Teknologi yang Digunakan

- **React.js** - Library JavaScript untuk UI
- **Tailwind CSS** - Framework CSS untuk styling
- **Lucide React** - Icon library
- **Canvas API** - Untuk manipulasi gambar
- **JavaScript** - Implementasi algoritma LSM

---

## 📁 Struktur Folder

```
image-restoration/
├── node_modules/
├── public/
├── src/
│   ├── App.js              # Kode utama aplikasi
│   ├── index.js            # Entry point
│   └── index.css           # Tailwind CSS
├── tailwind.config.js      # Konfigurasi Tailwind
├── postcss.config.js       # Konfigurasi PostCSS
├── package.json            # Dependencies
└── README.md               # Dokumentasi ini
```

---

## 🧮 Konsep Aljabar Linear yang Diterapkan

### 1. Sistem Overdetermined
Ketika jumlah persamaan (piksel tetangga) lebih banyak dari variabel (nilai piksel yang dicari), LSM mencari solusi terbaik yang meminimalkan error.

### 2. Weighted Averaging
```
pixel_restored = Σ(weight_i × pixel_i) / Σ(weight_i)
```
Dimana `weight_i = e^(-distance²/2)` (Gaussian weighting)

### 3. Minimisasi Error Kuadrat
```
min Σ(y_observed - y_predicted)²
```

### 4. Matrix Operations
Setiap piksel dihitung berdasarkan matriks tetangga 3×3:
```
[p1  p2  p3]
[p4  px  p5]
[p6  p7  p8]
```

---

## 📝 Kesimpulan

Aplikasi ini berhasil mengimplementasikan **Least Squares Method** untuk rekonstruksi gambar. Metode LSM terbukti efektif dalam:
- Mengembalikan piksel yang hilang
- Mengurangi noise pada gambar
- Memberikan hasil yang smooth dan natural

Hasil evaluasi menggunakan metrik RMSE menunjukkan peningkatan kualitas gambar yang signifikan setelah proses restorasi.

---