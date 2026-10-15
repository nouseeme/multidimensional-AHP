# PRD — AHP–TOPSIS Decision Calculator

Status: spesifikasi baseline untuk fork; implementasi MVP tersedia. Lihat IMPLEMENTATION-NOTES.md untuk pemeriksaan dan pilihan implementasi.
Tanggal: 14 Oktober 2026.
Versi: 1.0.
Basis: repository AHP Matrix Calculator yang saat ini menghitung prioritas kriteria.

## 1. Tujuan produk

Membantu pengguna memilih di antara beberapa alternatif berdasarkan data performa dan prioritas pribadi. AHP menghasilkan bobot kriteria; TOPSIS menentukan peringkat alternatif melalui kedekatan terhadap kombinasi performa terbaik dan jarak dari kombinasi terburuk.

Produk harus dapat dipakai untuk supplier, brand, produk, lokasi, dan keputusan lain yang memiliki data numerik yang dapat dibandingkan. Pengguna cukup menetapkan kriteria dan prioritasnya, kemudian memasukkan data setiap alternatif. Pengguna tidak perlu menetapkan kurva manfaat atau menjawab perbandingan pasangan alternatif untuk setiap kriteria.

Janji produk: keputusan yang terstruktur, dapat ditelusuri, dan mengikuti asumsi yang terlihat. Produk tidak menjanjikan keputusan objektif mutlak atau akurasi prediksi.

## 2. Keputusan dan cakupan

### Keputusan yang telah dipilih pengguna

- Model utama: AHP untuk prioritas kriteria, TOPSIS untuk alternatif.
- Penggunaan generik, termasuk supplier dan brand.
- Data alternatif berupa angka mentah dengan satuan konsisten per kriteria.
- Setiap kriteria memiliki arah “Lebih besar lebih baik” atau “Lebih kecil lebih baik”.
- Template minimal mengisi nama, arah, dan satuan; semuanya dapat diedit.
- Panduan antarmuka menjelaskan konteks keputusan dengan bahasa biasa.
- Produk dikembangkan sebagai fork dari kalkulator yang ada.

### Keputusan MVP yang direkomendasikan PRD ini

- Satu konfigurasi metode: TOPSIS klasik dengan normalisasi vektor dan jarak Euclidean.
- AHP tetap menggunakan perbandingan pasangan kriteria; bobot langsung dan bar pembagian bobot ditunda.
- Mendukung 2–10 kriteria dan 2–100 alternatif.
- Kalkulasi dan penyimpanan draft berlangsung di browser tanpa akun atau backend.
- Bahasa awal mengikuti aplikasi asal, yaitu Inggris; panduan di PRD diberikan dalam Bahasa Indonesia sebagai arahan makna, bukan kewajiban lokalisasi.
- Ekspor laporan Markdown dan proyek JSON masuk MVP.
- Analisis sensitivitas sederhana masuk MVP untuk membantu pengguna menilai stabilitas rekomendasi.

Angka batas, kebijakan draft, dan format ekspor di atas adalah keputusan produk yang diusulkan, bukan batas matematis TOPSIS. Dapat disesuaikan saat implementasi jika ada alasan terukur.

### Di luar MVP

Utility curves, skala best/worst, parameter eksponensial, pilihan normalisasi, matriks AHP antaralternatif, ANP, fuzzy TOPSIS, data kualitatif otomatis, konversi mata uang/satuan, integrasi sumber data, kolaborasi kelompok, optimasi portofolio, dan filter kelayakan wajib.

## 3. Pengguna dan kebutuhan

| Pengguna | Kebutuhan | Contoh data |
| --- | --- | --- |
| Pembeli atau pengadaan | Membandingkan supplier | Harga, waktu pengiriman, kapasitas |
| Konsumen | Membandingkan produk atau brand | Harga, berat, daya tahan, kapasitas |
| Individu atau tim | Membandingkan lokasi atau layanan | Biaya, jarak, durasi, throughput |

Kriteria harus memiliki angka yang maknanya konsisten antaralternatif. Rating yang dimasukkan pengguna adalah data penilaian subjektif; aplikasi tidak boleh menyebutnya pengukuran objektif. Kriteria dengan nilai ideal di tengah, seperti suhu nyaman, tidak didukung oleh dua arah monoton dalam MVP.

## 4. Alur utama

### Langkah 1 — Kriteria dan prioritas

Pengguna memberi judul keputusan opsional, menambah kriteria, menentukan satuan dan arah, lalu membandingkan kepentingan setiap pasangan kriteria.

Field kriteria: ID stabil, nama unik, arah benefit/cost, label satuan, asal template opsional, dan kebijakan nilai negatif. Nama wajib; satuan boleh kosong untuk angka tanpa satuan.

| Template | Arah awal | Satuan awal | Nilai negatif |
| --- | --- | --- | --- |
| Cost / Price | Lebih kecil lebih baik | Rp | Ditolak |
| Duration | Lebih kecil lebih baik | minutes | Ditolak |
| Distance | Lebih kecil lebih baik | km | Ditolak |
| Capacity | Lebih besar lebih baik | units | Ditolak |
| Custom | Pengguna memilih | Bebas | Boleh diaktifkan |

Template tidak menetapkan skala penilaian. Duration bisa diubah menjadi higher-is-better untuk baterai atau umur layanan. Kapasitas perlu menampilkan satuan yang dapat diedit agar “units” tidak dianggap spesifikasi universal.

Panduan: “Arah penilaian menentukan apakah nilai besar atau kecil lebih menguntungkan. Misalnya, harga lebih rendah biasanya lebih baik; kapasitas lebih besar biasanya lebih baik.”

Perbandingan menggunakan skala resiprokal 1–9 aplikasi asal. Tampilkan pasangan dan arah preferensi secara eksplisit. Nilai tengah berarti setara; pasangan yang belum disentuh tetap terlihat sebagai default setara dan bukan input kosong.

Bobot dan ringkasan konsistensi diperbarui saat edit. Untuk 3–10 kriteria: CR < 0,10 konsisten; 0,10 ≤ CR < 0,20 perlu ditinjau; CR ≥ 0,20 tidak konsisten. CR tinggi tidak menghalangi kalkulasi, tetapi status harus terbawa ke hasil dan laporan.

Untuk dua kriteria: hitung bobot dari satu pasangan; tampilkan “Pemeriksaan konsistensi tidak berlaku untuk dua kriteria”. Jangan menampilkan CR = 0 sebagai bukti kualitas penilaian.

### Langkah 2 — Alternatif dan data

Tampilkan kartu per alternatif dengan field setiap kriteria; sediakan tampilan tabel untuk input banyak alternatif. Tombol tambah, duplikasi, hapus, dan edit nama tersedia. Duplikasi diberi nama baru dan mudah dikenali.

Contoh:

```text
Supplier A
Price              [100000] Rp
Delivery time      [10]     days

[Add alternative]
```

Satuan diambil dari kriteria dan ditampilkan pada setiap field. Semua alternatif pada satu kriteria wajib memakai mata uang, skala, dan basis waktu yang sama. Contoh: “Rp juta” berarti 15, bukan 15.000.000; “units/month” tidak boleh dicampur dengan “units/day”.

Satuan berfungsi sebagai label; aplikasi tidak melakukan konversi otomatis. Perubahan label satuan setelah pengisian meminta pengguna mengonfirmasi bahwa angka tetap sesuai satuan baru. Jangan diam-diam mengubah angka.

Input kosong bukan nol. Nol sah untuk ongkir gratis, jarak nol, atau kapasitas nol. Semua sel wajib berisi angka finite sebelum kalkulasi.

Tetapkan satu konvensi angka yang terlihat pada proyek. Rekomendasi MVP: default Inggris dengan titik desimal dan tanpa pemisah ribuan pada field edit, misalnya 100100 dan 1.5. Nilai terformat boleh ditampilkan di luar field. Jangan menebak input seperti “1.000” berdasarkan locale lain; helper harus menunjukkan arti angka yang diterima. Singkatan “100jt” dan mata uang campuran ditolak dengan panduan koreksi.

### Langkah 3 — Kalkulasi dan review

Tampilkan ringkasan bobot, arah, satuan, kelengkapan data, dan jumlah alternatif sebelum Calculate. Semua alternatif dihitung pada satu snapshot input yang sama.

Saat data diubah setelah kalkulasi, hasil lama langsung ditandai “Perlu dihitung ulang” dan ekspor hasil lama dinonaktifkan. Pengguna tidak boleh mengira rekomendasi sudah mengikuti data baru.

### Langkah 4 — Hasil dan reporting

Tampilkan peringkat alternatif, skor kedekatan 0–1, status konsistensi AHP, serta data mentah yang mendasari hasil. Akses edit kriteria dan alternatif harus mempertahankan input yang masih relevan.

Copy utama: “Peringkat ini mengikuti prioritas Anda dan data alternatif yang dimasukkan.”

Copy skor: “Skor kedekatan menunjukkan posisi terhadap kombinasi performa terbaik dan terburuk dalam analisis ini. Skor bukan probabilitas, persentase akurasi, atau jaminan keputusan.”

## 5. Spesifikasi perhitungan

Gunakan presisi penuh untuk kalkulasi; pembulatan hanya untuk tampilan. Definisikan i sebagai alternatif dan j sebagai kriteria.

### 5.1 AHP

Pertahankan metode power iteration aplikasi asal dengan matriks positif resiprokal: diagonal 1 dan a[j,i] = 1/a[i,j]. Bobot w[j] positif dan berjumlah 1.

Pertahankan tabel RI 3–10 yang ada: 0,52; 0,89; 1,11; 1,25; 1,35; 1,40; 1,45; 1,49. Catat versi tabel di laporan karena referensi RI dapat berbeda. Jangan mengganti tabel tanpa keputusan metode yang eksplisit.

Parameter asal: maksimum 100 iterasi dan toleransi perubahan L1 0,00001. Implementasi fork harus melaporkan status konvergensi; jangan menggunakan hasil yang belum konvergen sebagai rekomendasi final. Perlakukan error numerik kecil pada CI/CR secara terukur dan dokumentasikan toleransinya.

Untuk dua kriteria, gunakan bobot resiprokal langsung atau eigenvector yang setara; CI/CR tidak diterapkan.

### 5.2 TOPSIS

Pipeline tetap:

1. Matriks keputusan X berisi data mentah alternatif × kriteria.
2. Normalisasi vektor per kolom: r[i,j] = x[i,j] / sqrt(sum_i(x[i,j]^2)).
3. Matriks berbobot: v[i,j] = w[j] × r[i,j].
4. Ideal terbaik: maksimum v untuk benefit, minimum v untuk cost.
5. Ideal terburuk: minimum v untuk benefit, maksimum v untuk cost.
6. D_plus[i] = sqrt(sum_j((v[i,j] − ideal_best[j])^2)).
7. D_minus[i] = sqrt(sum_j((v[i,j] − ideal_worst[j])^2)).
8. C[i] = D_minus[i] / (D_plus[i] + D_minus[i]).
9. Urutkan C menurun.

Gunakan data asli untuk kedua arah. Jangan membalik cost menjadi 1/x; arah digunakan saat memilih ideal. Jangan menormalisasi lagi nilai C agar jumlah skor alternatif menjadi 1. Skor kedekatan tidak harus berjumlah 1.

Normalisasi vektor dan pilihan ideal ini mengikuti TOPSIS klasik; bukan min–max atau fungsi manfaat yang dibuat khusus. Sumber metode dicantumkan di bagian 13.

### 5.3 Kasus khusus dan stabilitas numerik

| Kondisi | Perilaku wajib |
| --- | --- |
| Sel kosong / NaN / infinity | Blok kalkulasi, tunjukkan sel yang harus diperbaiki |
| Ada nilai nol dalam kolom nonzero | Hitung secara normal; tidak ada pembagian 1/0 |
| Seluruh kolom nol | Set kolom r dan v ke nol; tandai kriteria tidak membedakan alternatif |
| Kolom berisi nilai identik nonzero | Normalisasi normal; kedua ideal sama dan kontribusi jarak kolom nol |
| Semua alternatif identik | Hasil “Semua alternatif setara”; C tidak terdefinisi, tampilkan —, semua peringkat 1 |
| Dua alternatif memiliki data identik | Skor dan peringkat sama |
| Semua arah/data menghasilkan D_plus + D_minus = 0 | Hasil tidak membedakan alternatif; jangan membuat pemenang atau memaksakan C = 0/1 |
| Nilai negatif pada template nonnegatif | Minta koreksi atau pindah ke Custom dan aktifkan nilai negatif |
| Nilai negatif pada Custom yang mengizinkan | Hitung dengan normalisasi bertanda; ingatkan pengguna bahwa angka lebih kecil/besar tetap berarti lebih baik sesuai arah |
| Angka sangat besar/kecil | Norm dan jarak dihitung dengan algoritma stabil, misalnya rescaling berdasarkan magnitudo maksimum; jangan menyisipkan epsilon ke input |
| AHP belum konvergen | Blok hasil final dan tampilkan alasan |

Jangan menghapus atau membagikan ulang bobot kriteria konstan secara diam-diam. Kriteria tetap terlihat dan kontribusi pembeda nol. Nilai negatif tidak membuat semua skala cocok untuk TOPSIS; nol yang bermakna dan arah monoton masih perlu ditinjau pengguna.

Ties memakai skor penuh dengan toleransi absolut 1e-9 pada C. Gunakan ranking kompetisi, misalnya 1, 1, 3. Kelompokkan terhadap skor tertinggi dalam kelompok agar toleransi tidak membentuk rantai tie yang melebar. Toleransi ini untuk numerik, bukan batas bahwa keputusan “secara praktis sama”. Tampilan yang membulat sama tidak otomatis berarti tie. Tampilkan presisi tambahan bila perlu untuk membedakan posisi.

## 6. Penjelasan hasil

MVP harus menampilkan:

- Ranking dan skor kedekatan empat desimal, dengan tambahan presisi bila diperlukan.
- Nilai mentah, arah, satuan, dan bobot tiap kriteria.
- Ringkasan ideal terbaik/terburuk yang dijelaskan sebagai kombinasi data; belum tentu satu alternatif nyata.
- Perbandingan dua alternatif yang dipilih pengguna.
- Alasan yang merujuk data, seperti “Harga A dan B hampir sama, sedangkan B memiliki pengiriman lebih cepat”. Hindari menyebut faktor terbesar tanpa bukti kalkulasi.
- Detail opsional X, R, V, ideal, D_plus, dan D_minus untuk audit perhitungan.

TOPSIS bukan penjumlahan kontribusi skor akhir. Jika menampilkan kontribusi kriteria, beri nama “Kontribusi terhadap jarak kuadrat”, menggunakan (v − ideal)^2. Jangan menampilkan persentase tersebut sebagai persentase penyebab skor final atau probabilitas kemenangan.

## 7. Sensitivitas dan batas model

Sediakan tombol “Coba perubahan prioritas”. Untuk setiap kriteria, uji bobot baseline × 0,9 dan × 1,1, lalu normalkan seluruh bobot agar berjumlah 1 dan hitung ulang TOPSIS. Ini adalah skenario bobot langsung, bukan matriks AHP baru; jangan memberi CR untuk skenario.

Laporkan alternatif teratas pada setiap skenario dan apakah pemenang berubah. Jika tidak berubah, copy harus menyebut “Peringkat teratas tetap sama pada skenario ±10% bobot yang diuji”, bukan “Keputusan terbukti stabil”. Baseline tidak diubah.

Peringatan kontekstual yang singkat:

- Penilaian kriteria tetap subjektif walaupun data alternatif numerik.
- Skor bergantung pada normalisasi, bobot, serta alternatif yang disertakan; tambahan alternatif dapat mengubah peringkat.
- Nilai ekstrem dapat memengaruhi skala normalisasi. Tampilkan rentang data agar pengguna dapat memeriksa input; jangan otomatis menghapus outlier.
- Kriteria yang menduplikasi hal yang sama dapat menghitung pengaruhnya lebih dari sekali.
- Kriteria wajib, seperti izin usaha atau budget mutlak, tidak boleh dianggap otomatis ditegakkan oleh ranking. MVP belum memiliki filter kelayakan.
- Dalam jarak kuadrat, faktor bobot muncul sebagai w[j]^2; bobot 2× memperbesar kontribusi jarak kuadrat 4× untuk selisih r yang sama. UI tidak boleh menjanjikan pengaruh linear pada skor final.
- Rating, data ordinal, atau skala dengan nol arbitrer perlu pertimbangan khusus. Perubahan satuan dengan faktor positif konsisten mempertahankan hasil; pergeseran titik nol, seperti Celsius ke Fahrenheit, tidak dijamin mempertahankannya.

Tidak ada peringatan yang meminta approval tambahan untuk kalkulasi biasa. Panduan ditempatkan dekat keputusan input atau hasil yang relevan.

## 8. Acuan numerik utama

Fixture dari diskusi produk:

| Alternatif | Harga, cost, Rp | Pengiriman, cost, hari |
| --- | ---: | ---: |
| Supplier A | 100000 | 10 |
| Supplier B | 100100 | 1 |

Matriks AHP kriteria: [[1, 2], [0.5, 1]]. Bobot: [2/3, 1/3].

| Tahap | Supplier A | Supplier B |
| --- | --- | --- |
| R: harga, pengiriman | 0.7067533162284242, 0.9950371902099892 | 0.7074600695446526, 0.09950371902099892 |
| V: harga, pengiriman | 0.4711688774856161, 0.3316790634033297 | 0.4716400463631017, 0.03316790634033297 |
| D_plus | 0.29851115706299675 | 0.000471168877485606 |
| D_minus | 0.000471168877485606 | 0.29851115706299675 |
| C | 0.0015759087966269966 | 0.998424091203373 |
| Ranking | 2 | 1 |

Ideal terbaik: [0.4711688774856161, 0.03316790634033297]. Ideal terburuk: [0.4716400463631017, 0.3316790634033297].

Interpretasi: B hampir mencapai kombinasi ideal karena pengirimannya terbaik dan harga hanya sedikit lebih tinggi. Skor B bukan keyakinan 99,84%. Fixture menguji konsistensi implementasi, bukan membuktikan metode tepat untuk semua keputusan.

## 9. Ekspor dan draft

Laporan Markdown mencakup judul, timestamp dengan timezone/offset, versi metode, data mentah, satuan, arah, matriks AHP, bobot, konvergensi, RI/CR bila berlaku, ranking, R/V, ideal dan jarak, hasil sensitivitas, serta asumsi model. Laporan harus memakai snapshot kalkulasi yang sama dengan layar.

Ekspor JSON menyimpan schemaVersion, metode, seluruh input, ID stabil, matrix pasangan kriteria, konfigurasi angka, serta metadata. Hasil yang disimpan hanya untuk audit; setelah import, validasi dan hitung ulang dari input dengan versi metode aktif. Jika versi berbeda, beri keterangan. Tolak file rusak tanpa merusak draft sekarang.

Draft otomatis disimpan lokal dengan debounce. Jika penyimpanan browser gagal, lanjutkan kalkulasi dan tampilkan bahwa draft tidak tersimpan. Start new mengonfirmasi jika ada input yang akan hilang. Tidak mengirim angka keputusan ke server atau analitik. Ketergantungan CDN aplikasi asal tetap membutuhkan internet untuk memuat halaman; jangan menjanjikan mode offline penuh.

## 10. Performa, aksesibilitas, dan integritas edit

- Target ukuran MVP: 10 kriteria dan 100 alternatif.
- AHP realtime dijadwalkan dengan debounce sekitar 100–150 ms; ukur waktu respons dan rendering pada perangkat target. Jangan mengasumsikan ringan tanpa profiling.
- TOPSIS baseline dan 2n skenario sensitivitas ditargetkan selesai <250 ms pada laptop modern; ini target penerimaan, bukan benchmark yang sudah diperoleh.
- Fokus keyboard, label field, helper error, dan kontrol perbandingan dapat dioperasikan tanpa mouse. Status CR tidak hanya dibedakan dengan warna.
- ID kriteria dan alternatif stabil; reorder tidak mengubah pasangan/performa. Rename tidak menghapus data.
- Tambah kriteria mempertahankan pasangan lama, menambah pasangan baru sebagai setara yang terlihat, dan memberi sel alternatif baru kosong.
- Hapus kriteria menghapus baris/kolom terkait serta field alternatifnya dengan konfirmasi kehilangan data. Tambah/hapus alternatif tidak mengubah bobot AHP.
- Perubahan arah mempertahankan angka tetapi membatalkan hasil lama. Penggantian template yang mengubah makna kriteria meminta pengguna meninjau nilai yang sudah diisi.

## 11. Acceptance criteria dan verifikasi

| ID | Kriteria penerimaan |
| --- | --- |
| AC-01 | Pengguna menyelesaikan empat tahap dengan dua kriteria dan dua alternatif tanpa best/worst atau pertanyaan pasangan alternatif |
| AC-02 | Fixture supplier bagian 8 menghasilkan skor dengan selisih absolut <1e-9 dan B peringkat pertama |
| AC-03 | Bobot AHP valid positif, jumlah 1, serta status konvergensi dan konsistensi ditampilkan sesuai ukuran matriks |
| AC-04 | Nol individual, kolom seluruh nol, dan kolom konstan dihitung tanpa NaN/infinity atau bobot yang dialihkan diam-diam |
| AC-05 | Semua alternatif identik menghasilkan peringkat bersama dan skor — tanpa pemenang palsu |
| AC-06 | Input kosong tidak berubah menjadi nol; parser menggunakan konvensi angka yang dinyatakan |
| AC-07 | Mengubah Rupiah ke ribuan Rupiah dengan membagi seluruh kolom 1000, atau hari ke jam dengan mengalikan 24, mempertahankan C dalam toleransi 1e-9 |
| AC-08 | Reorder input mempertahankan hasil; alternatif identik memperoleh skor sama; ties tidak dipecah berdasarkan nama |
| AC-09 | Alternatif yang lebih baik pada seluruh kriteria daripada alternatif lain tidak mendapat C lebih rendah, dalam toleransi numerik |
| AC-10 | Mengubah data/arah/prioritas menandai hasil stale dan mencegah ekspor ranking lama |
| AC-11 | Ekspor Markdown mereproduksi input, metode, dan hasil snapshot; JSON round-trip menghasilkan ranking yang sama |
| AC-12 | Hasil sensitivitas menyebut skenario yang diuji dan tidak mengganti baseline atau menciptakan CR baru |
| AC-13 | Nilai ekstrem finite ditangani stabil; kegagalan numerik menghasilkan error jelas dan bukan ranking |
| AC-14 | Kriteria cost/benefit campuran memilih ideal dengan benar; pembalikan arah mengubah ideal secara sesuai |

Verifikasi numerik memakai perhitungan independen untuk fixture, kasus nol/identik/negatif, invariansi unit, dan dominasi. Uji tampilan memeriksa input panjang, viewport sempit, keyboard, error, serta ekspor. Outlier dan penambahan alternatif diuji untuk menunjukkan sensitivitas; tidak menetapkan bahwa ranking harus invariant terhadap perubahan kumpulan alternatif.

## 12. Rencana fork

Repository asal saat ini adalah aplikasi React browser dengan CDN/Babel, tanpa build step. App.jsx mengatur tiga tahap; utils/ahpCalculations.js berisi power iteration; komponen CriteriaInput, ComparisonMatrix, Results dan exportReport dapat menjadi fondasi fork.

Urutan implementasi yang direkomendasikan:

1. Buat fork terpisah saat pembangunan dimulai; pertahankan asal sebagai kalkulator AHP kriteria.
2. Tambahkan model data dengan ID stabil, dukungan dua kriteria, dan kalkulator TOPSIS murni yang tidak bergantung pada DOM.
3. Verifikasi fixture dan aturan numerik sebelum UI ranking.
4. Bangun empat tahap, panduan unit/arah, validasi, serta hasil dan detail metode.
5. Tambahkan draft, ekspor/import, sensitivitas, dan pemeriksaan performa/aksesibilitas.

Tidak wajib mengganti framework untuk fitur ini. Bila toolchain diubah, pisahkan alasan migrasi dari kebutuhan model keputusan. Penamaan produk dan lokasi hosting fork ditentukan saat pembangunan; PRD ini tidak membuat fork, mempublikasikan situs, atau mengubah aplikasi asal.

## 13. Referensi metode

- [Zavadskas, Zakarevicius, Antucheviciene (2006), Evaluation of Ranking Accuracy in Multi-Criteria Decisions](https://informatica.vu.lt/journal/INFORMATICA/article/455/file/pdf): bagian 2.2 menjelaskan normalisasi vektor, ideal benefit/cost, jarak Euclidean, dan relative closeness pada TOPSIS klasik.
- [Selection of warehouse storage system using the TOPSIS method (2026)](https://link.springer.com/article/10.1007/s10100-026-01038-6): penerapan normalisasi vektor, pembobotan, dan solusi ideal sebagai contoh penggunaan metode.

Konfigurasi AHP asal, contoh supplier, batas ukuran, kebijakan ties, error, persistence, copy UI, dan target performa adalah keputusan spesifikasi produk. Referensi mendukung metode TOPSIS; bukan bukti klaim akurasi, universalitas, atau manfaat produk.
