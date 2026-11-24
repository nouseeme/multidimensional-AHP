export const LOCALES = { en: 'English', tr: 'Türkçe', id: 'Bahasa Indonesia' } as const;
export type Locale = keyof typeof LOCALES;
type Interpolations = Readonly<Record<string, string | number>>;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && Object.hasOwn(LOCALES, value);
}

const messages: Readonly<Record<string, readonly [turkish: string, indonesian: string]>> = {
  Language: ['Dil', 'Bahasa'],
  Project: ['Proje', 'Proyek'],
  'Project actions': ['Proje işlemleri', 'Tindakan proyek'],
  'New decision': ['Yeni karar', 'Keputusan baru'],
  'Try supplier example': ['Tedarikçi örneğini dene', 'Coba contoh pemasok'],
  'Import project': ['Projeyi içe aktar', 'Impor proyek'],
  'Export JSON': ['JSON olarak dışa aktar', 'Ekspor JSON'],
  'Step {step} of {total}': ['{total} adımın {step}. adımı', 'Langkah {step} dari {total}'],
  Dismiss: ['Kapat', 'Tutup'],
  'Product specification': ['Ürün özellikleri', 'Spesifikasi produk'],
  'Built on AHP Matrix Calculator': [
    'AHP Matrix Calculator temel alınmıştır',
    'Dikembangkan dari AHP Matrix Calculator',
  ],
  'Decision summary': ['Karar özeti', 'Ringkasan keputusan'],
  'Close decision summary': ['Karar özetini kapat', 'Tutup ringkasan keputusan'],
  'Drafts save on this device': [
    'Taslaklar bu cihaza kaydedilir',
    'Draf disimpan di perangkat ini',
  ],
  'Draft saved locally': ['Taslak bu cihaza kaydedildi', 'Draf tersimpan di perangkat ini'],
  'Saving draft…': ['Taslak kaydediliyor…', 'Menyimpan draf…'],
  'Local saving is unavailable. Export JSON to keep your work.': [
    'Bu cihaza kayıt yapılamıyor. Çalışmanızı saklamak için JSON olarak dışa aktarın.',
    'Penyimpanan lokal tidak tersedia. Ekspor JSON untuk menyimpan pekerjaan Anda.',
  ],
  'Draft could not be saved. Export JSON to keep your work.': [
    'Taslak kaydedilemedi. Çalışmanızı saklamak için JSON olarak dışa aktarın.',
    'Draf gagal disimpan. Ekspor JSON untuk menyimpan pekerjaan Anda.',
  ],
  'Calculate your decision from the review step first.': [
    'Önce gözden geçirme adımında sıralamayı hesaplayın.',
    'Hitung peringkat pada langkah peninjauan terlebih dahulu.',
  ],
  '{count} field needs attention.': ['{count} alanı kontrol edin.', 'Periksa {count} kolom.'],
  '{count} fields need attention.': ['{count} alanı kontrol edin.', 'Periksa {count} kolom.'],
  'Start a new decision? Export your current project first if you want to keep it.': [
    'Yeni bir karar başlatılsın mı? Mevcut projenizi saklamak istiyorsanız önce dışa aktarın.',
    'Mulai keputusan baru? Ekspor proyek saat ini terlebih dahulu jika ingin menyimpannya.',
  ],
  'Load the supplier example? This replaces your current draft.': [
    'Tedarikçi örneği yüklensin mi? Mevcut taslağınızın yerini alır.',
    'Muat contoh pemasok? Ini akan menggantikan draf saat ini.',
  ],
  'Complete the highlighted fields before calculating.': [
    'Hesaplamadan önce işaretli alanları doldurun.',
    'Lengkapi kolom yang ditandai sebelum menghitung.',
  ],
  'Delete this criterion and its alternative values?': [
    'Bu ölçüt ve seçeneklere ait değerleri silinsin mi?',
    'Hapus kriteria ini beserta nilainya untuk semua alternatif?',
  ],
  'Delete this alternative and its data?': [
    'Bu seçenek ve verileri silinsin mi?',
    'Hapus alternatif ini beserta datanya?',
  ],
  'Project files must be smaller than 2 MB.': [
    'Proje dosyaları 2 MB’den küçük olmalıdır.',
    'Ukuran berkas proyek harus kurang dari 2 MB.',
  ],
  'Import this project and replace your current draft?': [
    'Bu proje içe aktarılsın ve mevcut taslağın yerini alsın mı?',
    'Impor proyek ini dan ganti draf saat ini?',
  ],
  'This project used another method version. Results will be recalculated with the current method.':
    [
      'Bu proje, yöntemin farklı bir sürümünü kullanıyordu. Sonuçlar güncel yöntemle yeniden hesaplanacak.',
      'Proyek ini memakai versi metode yang berbeda. Hasil akan dihitung ulang dengan metode saat ini.',
    ],
  'Project imported. Review the inputs and calculate fresh results.': [
    'Proje içe aktarıldı. Girdileri gözden geçirin ve sonuçları yeniden hesaplayın.',
    'Proyek telah diimpor. Tinjau masukan lalu hitung ulang hasilnya.',
  ],
  'Changing this unit does not convert any numbers. Are the existing values already correct in the new unit?':
    [
      'Birimi değiştirmek sayıları dönüştürmez. Mevcut değerler yeni birimde doğru mu?',
      'Mengganti satuan tidak mengonversi angka. Apakah nilai yang ada sudah sesuai dengan satuan baru?',
    ],
  'Alternative {number}': ['Seçenek {number}', 'Alternatif {number}'],
  '{name} copy': ['{name} kopyası', 'Salinan {name}'],
  'Choose a delivery supplier': ['Teslimat için tedarikçi seçin', 'Pilih pemasok pengiriman'],
  'Supplier A': ['Tedarikçi A', 'Pemasok A'],
  'Supplier B': ['Tedarikçi B', 'Pemasok B'],
  Price: ['Fiyat', 'Harga'],
  'Delivery time': ['Teslimat süresi', 'Waktu pengiriman'],
  Duration: ['Süre', 'Durasi'],
  Distance: ['Mesafe', 'Jarak'],
  Capacity: ['Kapasite', 'Kapasitas'],
  Custom: ['Özel ölçüt', 'Kriteria khusus'],
  days: ['gün', 'hari'],
  units: ['adet', 'unit'],
  'Both criteria are equally important.': [
    'İki ölçüt eşit derecede önemli.',
    'Kedua kriteria sama pentingnya.',
  ],
  '{favored} is {ratio}× as important as {other}.': [
    '{favored}, {other} ölçütünden {ratio} kat daha önemli.',
    '{favored} {ratio} kali sepenting {other}.',
  ],
  'Complete your criteria': ['Ölçütleri tamamlayın', 'Lengkapi kriteria'],
  'Review priorities: calculation did not converge': [
    'Öncelikleri gözden geçirin. Hesaplama yakınsamadı.',
    'Tinjau prioritas. Perhitungan tidak konvergen.',
  ],
  'Two criteria · consistency not applicable': [
    'İki ölçüt · tutarlılık testi uygulanmaz',
    'Dua kriteria · uji konsistensi tidak berlaku',
  ],
  Consistent: ['Tutarlı', 'Konsisten'],
  'Review comparisons': ['Karşılaştırmaları gözden geçirin', 'Tinjau perbandingan'],
  'Not applicable': ['Uygulanmaz', 'Tidak berlaku'],
  'Did not converge': ['Yakınsamadı', 'Tidak konvergen'],
  'Unnamed criterion': ['Adsız ölçüt', 'Kriteria tanpa nama'],
  Unnamed: ['Adsız', 'Tanpa nama'],
  'From the last calculation. Your draft has changed.': [
    'Son hesaplamaya ait. Taslağınız değişti.',
    'Dari perhitungan terakhir. Draf Anda telah berubah.',
  ],
  'The ranking uses the weights shown here.': [
    'Sıralama burada gösterilen ağırlıkları kullanır.',
    'Peringkat menggunakan bobot yang ditampilkan di sini.',
  ],
  'Weights update as you compare your criteria.': [
    'Ölçütleri karşılaştırdıkça ağırlıklar güncellenir.',
    'Bobot diperbarui saat Anda membandingkan kriteria.',
  ],
  'Enter one value per criterion for each alternative.': [
    'Her seçenek için her ölçüte bir değer girin.',
    'Masukkan satu nilai per kriteria untuk setiap alternatif.',
  ],
  'Check your weights and data before calculating.': [
    'Hesaplamadan önce ağırlıkları ve verileri kontrol edin.',
    'Periksa bobot dan data sebelum menghitung.',
  ],
  'Untitled decision': ['Adsız karar', 'Keputusan tanpa judul'],
  Criteria: ['Ölçütler', 'Kriteria'],
  Alternatives: ['Seçenekler', 'Alternatif'],
  'Data entered': ['Girilen veriler', 'Data terisi'],
  '{done} of {total} values': ['{total} değerden {done} tanesi', '{done} dari {total} nilai'],
  'Criterion weights': ['Ölçüt ağırlıkları', 'Bobot kriteria'],
  'Criteria & priorities': ['Ölçütler ve öncelikler', 'Kriteria dan prioritas'],
  'Choose what to measure, then compare how much each criterion matters.': [
    'Neyi ölçeceğinizi seçin, ardından ölçütlerin önemini karşılaştırın.',
    'Pilih apa yang akan diukur, lalu bandingkan tingkat kepentingan setiap kriteria.',
  ],
  'Enter the measured values for each option.': [
    'Her seçeneğe ait ölçüm değerlerini girin.',
    'Masukkan nilai terukur untuk setiap alternatif.',
  ],
  'Review your decision': ['Kararınızı gözden geçirin', 'Tinjau keputusan Anda'],
  'Check the weights, values, and units before ranking the alternatives.': [
    'Seçenekleri sıralamadan önce ağırlıkları, değerleri ve birimleri kontrol edin.',
    'Periksa bobot, nilai, dan satuan sebelum mengurutkan alternatif.',
  ],
  Results: ['Sonuçlar', 'Hasil'],
  'Complete the inputs and calculate to see a ranking.': [
    'Sıralamayı görmek için girdileri tamamlayıp hesaplayın.',
    'Lengkapi masukan lalu hitung untuk melihat peringkat.',
  ],
  'Decision name': ['Karar adı', 'Nama keputusan'],
  optional: ['isteğe bağlı', 'opsional'],
  'e.g. Choose our next supplier': [
    'ör. Yeni tedarikçimizi seçin',
    'mis. Pilih pemasok berikutnya',
  ],
  'Your criteria': ['Ölçütleriniz', 'Kriteria Anda'],
  Criterion: ['Ölçüt', 'Kriteria'],
  'Criterion {number}': ['Ölçüt {number}', 'Kriteria {number}'],
  'Move {name} up': ['{name} ölçütünü yukarı taşı', 'Pindahkan {name} ke atas'],
  'Move {name} down': ['{name} ölçütünü aşağı taşı', 'Pindahkan {name} ke bawah'],
  'Delete {name}': ['{name} öğesini sil', 'Hapus {name}'],
  'Duplicate {name}': ['{name} seçeneğini çoğalt', 'Duplikat {name}'],
  Unit: ['Birim', 'Satuan'],
  'Name your criterion': ['Ölçüte ad verin', 'Beri nama kriteria'],
  'e.g. hours': ['ör. saat', 'mis. jam'],
  'Preferred direction': ['Tercih yönü', 'Arah preferensi'],
  'Lower is better': ['Daha düşük değer daha iyi', 'Nilai lebih rendah lebih baik'],
  'Higher is better': ['Daha yüksek değer daha iyi', 'Nilai lebih tinggi lebih baik'],
  'Allow negative numbers': ['Negatif değerlere izin ver', 'Izinkan angka negatif'],
  '(e.g. net cost after credits)': [
    '(ör. indirim sonrası net maliyet)',
    '(mis. biaya bersih setelah potongan)',
  ],
  'Use the same unit for every alternative. Unit changes preserve the values you entered.': [
    'Tüm seçeneklerde aynı birimi kullanın. Birimi değiştirdiğinizde girdiğiniz değerler değişmez.',
    'Gunakan satuan yang sama untuk semua alternatif. Mengubah satuan tidak mengubah nilai yang sudah dimasukkan.',
  ],
  'Compare priorities': ['Öncelikleri karşılaştırın', 'Bandingkan prioritas'],
  '{count} comparison': ['{count} karşılaştırma', '{count} perbandingan'],
  '{count} comparisons': ['{count} karşılaştırma', '{count} perbandingan'],
  'Move toward the criterion that matters more. The center means equal importance.': [
    'Kaydırıcıyı daha önemli ölçüte doğru kaydırın. Orta nokta eşit önemi gösterir.',
    'Geser ke arah kriteria yang lebih penting. Posisi tengah berarti keduanya sama penting.',
  ],
  vs: ['ve', 'vs'],
  'Importance: {left} versus {right}': [
    'Önem karşılaştırması: {left} ve {right}',
    'Perbandingan kepentingan: {left} dan {right}',
  ],
  'Favor left': ['Sol daha önemli', 'Kiri lebih penting'],
  Equal: ['Eşit', 'Sama'],
  'Favor right': ['Sağ daha önemli', 'Kanan lebih penting'],
  'Default: equal': ['Varsayılan: eşit', 'Bawaan: sama'],
  'Continue to alternatives': ['Seçeneklere geç', 'Lanjut ke alternatif'],
  'Enter a value.': ['Bir değer girin.', 'Masukkan nilai.'],
  unitless: ['birimsiz', 'tanpa satuan'],
  'Alternative name': ['Seçenek adı', 'Nama alternatif'],
  alternative: ['seçenek', 'alternatif'],
  Alternative: ['Seçenek', 'Alternatif'],
  'Edit alternative data': ['Seçenek verilerini düzenle', 'Edit data alternatif'],
  Actions: ['İşlemler', 'Tindakan'],
  '{count} alternative': ['{count} seçenek', '{count} alternatif'],
  '{count} alternatives': ['{count} seçenek', '{count} alternatif'],
  Cards: ['Kartlar', 'Kartu'],
  Table: ['Tablo', 'Tabel'],
  'Use plain numbers like {integer} or {decimal}. Enter {zero} for zero and leave unknown values blank.':
    [
      '{integer} veya {decimal} gibi sayılar girin. Ondalık ayırıcı olarak nokta kullanın. Sıfır için {zero} girin, bilinmeyen değerleri boş bırakın.',
      'Masukkan angka seperti {integer} atau {decimal}. Gunakan titik sebagai pemisah desimal. Masukkan {zero} untuk nol dan kosongkan nilai yang belum diketahui.',
    ],
  'Add alternative': ['Seçenek ekle', 'Tambah alternatif'],
  'Back to criteria': ['Ölçütlere dön', 'Kembali ke kriteria'],
  'Review decision': ['Kararı gözden geçir', 'Tinjau keputusan'],
  'Alternative data': ['Seçenek verileri', 'Data alternatif'],
  'Your decision': ['Kararınız', 'Keputusan Anda'],
  'Check your data ranges': ['Veri aralıklarını kontrol edin', 'Periksa rentang data'],
  '{min} to {max}': ['{min} ile {max} arası', '{min} hingga {max}'],
  'All figures in a column must use the same units and time basis. A rating is still your judgment, even when entered as a number.':
    [
      'Bir sütundaki tüm değerler aynı birimi ve zaman aralığını kullanmalıdır. Sayıyla ifade edilen puanlar da kişisel değerlendirmedir.',
      'Semua angka dalam satu kolom harus menggunakan satuan dan periode yang sama. Skor dalam bentuk angka tetap merupakan penilaian Anda.',
    ],
  'How your ranking is calculated': ['Sıralama nasıl hesaplanır?', 'Cara peringkat dihitung'],
  'Your comparisons set the priorities. TOPSIS puts different units on comparable scales, applies those priorities, and measures each option against the best and worst combinations in this set.':
    [
      'Karşılaştırmalarınız öncelikleri belirler. TOPSIS farklı birimleri karşılaştırılabilir ölçeklere taşır, ağırlıkları uygular ve her seçeneğin en iyi ve en kötü değerlerden oluşan bileşimlere uzaklığını ölçer.',
      'Perbandingan Anda menentukan prioritas. TOPSIS menyetarakan skala dari berbagai satuan, menerapkan bobot, lalu mengukur jarak setiap alternatif terhadap kombinasi nilai terbaik dan terburuk.',
    ],
  'This ranking does not enforce mandatory requirements such as a strict budget or permit. Similar or duplicated criteria can count the same factor twice.':
    [
      'Bu sıralama bütçe sınırı veya izin gibi zorunlu koşulları denetlemez. Benzer veya yinelenen ölçütler aynı etkeni iki kez hesaba katabilir.',
      'Peringkat ini tidak memeriksa persyaratan wajib seperti batas anggaran atau izin. Kriteria yang serupa atau berulang dapat menghitung faktor yang sama dua kali.',
    ],
  'Edit alternatives': ['Seçenekleri düzenle', 'Edit alternatif'],
  'Calculate ranking': ['Sıralamayı hesapla', 'Hitung peringkat'],
  'Criterion comparison matrix': ['Ölçüt karşılaştırma matrisi', 'Matriks perbandingan kriteria'],
  'Raw decision matrix · X': ['Ham karar matrisi · X', 'Matriks keputusan mentah · X'],
  'Vector-normalized matrix · R': [
    'Vektörle normalize edilmiş matris · R',
    'Matriks normalisasi vektor · R',
  ],
  'Weighted matrix · V': ['Ağırlıklı matris · V', 'Matriks berbobot · V'],
  'Ideal combinations': ['İdeal bileşimler', 'Kombinasi ideal'],
  Best: ['En iyi', 'Terbaik'],
  Worst: ['En kötü', 'Terburuk'],
  'These ideal combinations may draw values from different alternatives. They do not have to be actual options.':
    [
      'İdeal bileşimler farklı seçeneklerin değerlerinden oluşabilir; mevcut bir seçeneğe karşılık gelmeleri gerekmez.',
      'Kombinasi ideal dapat mengambil nilai dari beberapa alternatif dan tidak harus berupa alternatif nyata.',
    ],
  'Euclidean distances': ['Öklid uzaklıkları', 'Jarak Euclidean'],
  'To best': ['En iyiye uzaklık', 'Ke terbaik'],
  'To worst': ['En kötüye uzaklık', 'Ke terburuk'],
  'AHP converged after {count} iterations. RI table: original-calculator-ri-v1. Calculation uses full precision; displayed numbers are rounded.':
    [
      'AHP {count} yinelemede yakınsadı. RI tablosu: original-calculator-ri-v1. Hesaplama tam hassasiyetle yapılır; gösterilen sayılar yuvarlanır.',
      'AHP mencapai konvergensi setelah {count} iterasi. Tabel RI: original-calculator-ri-v1. Perhitungan menggunakan presisi penuh; angka yang ditampilkan dibulatkan.',
    ],
  'Review and calculate': ['Gözden geçir ve hesapla', 'Tinjau dan hitung'],
  'Your inputs changed.': ['Girdileriniz değişti.', 'Masukan Anda berubah.'],
  'These results belong to the previous calculation. Recalculate before exporting a report.': [
    'Bu sonuçlar önceki hesaplamaya ait. Raporu dışa aktarmadan önce yeniden hesaplayın.',
    'Hasil ini berasal dari perhitungan sebelumnya. Hitung ulang sebelum mengekspor laporan.',
  ],
  Recalculate: ['Yeniden hesapla', 'Hitung ulang'],
  'All alternatives are equal': ['Tüm seçenekler eşit', 'Semua alternatif setara'],
  'The data does not distinguish these options. No recommendation can be made.': [
    'Veriler seçenekleri ayırt etmiyor. Öneri yapılamıyor.',
    'Data tidak membedakan alternatif ini. Rekomendasi tidak dapat diberikan.',
  ],
  'These alternatives share first place within the numerical tolerance.': [
    'Bu seçenekler sayısal tolerans dahilinde birinciliği paylaşıyor.',
    'Alternatif ini berbagi peringkat pertama dalam batas toleransi numerik.',
  ],
  'Ranks first for the criteria and data in this decision.': [
    'Bu kararın ölçütleri ve verilerine göre birinci sırada.',
    'Menempati peringkat pertama berdasarkan kriteria dan data keputusan ini.',
  ],
  'TOPSIS closeness score': ['TOPSIS yakınlık puanı', 'Skor kedekatan TOPSIS'],
  'The 0–1 scale measures relative closeness to the ideal combination.': [
    '0–1 ölçeği ideal bileşime göreli yakınlığı ölçer.',
    'Skala 0–1 mengukur kedekatan relatif terhadap kombinasi ideal.',
  ],
  'All alternatives': ['Tüm seçenekler', 'Semua alternatif'],
  '{count} evaluated': ['{count} seçenek değerlendirildi', '{count} alternatif dievaluasi'],
  'Your criterion judgments need review. Ranking remains available, but revise conflicting comparisons before relying on it.':
    [
      'Ölçüt karşılaştırmalarını gözden geçirin. Sıralamayı kullanmadan önce çelişkili karşılaştırmaları düzeltin.',
      'Tinjau penilaian antarkriteria. Perbaiki perbandingan yang bertentangan sebelum mengandalkan peringkat.',
    ],
  'No differences on {criteria}. These criteria do not distinguish the alternatives; their weights have not been reassigned.':
    [
      '{criteria} için değerler aynı. Bu ölçütler seçenekleri ayırt etmiyor ve ağırlıkları yeniden dağıtılmadı.',
      'Tidak ada perbedaan pada {criteria}. Kriteria tersebut tidak membedakan alternatif dan bobotnya tidak dialihkan.',
    ],
  'Compare original values': ['Özgün değerleri karşılaştırın', 'Bandingkan nilai asli'],
  'First alternative': ['Birinci seçenek', 'Alternatif pertama'],
  'Second alternative': ['İkinci seçenek', 'Alternatif kedua'],
  'Compare alternatives': ['Seçenekleri karşılaştır', 'Bandingkan alternatif'],
  'Criterion / priority': ['Ölçüt / öncelik', 'Kriteria / prioritas'],
  'Better value': ['Daha iyi değer', 'Nilai lebih baik'],
  'A better value on one criterion does not guarantee a higher overall rank. Closeness combines distances across all criteria.':
    [
      'Bir ölçütte daha iyi olmak genel sıralamada üst sırayı garanti etmez. Yakınlık hesabı tüm ölçütlerdeki uzaklıkları birleştirir.',
      'Nilai yang lebih baik pada satu kriteria tidak menjamin peringkat keseluruhan yang lebih tinggi. Kedekatan menggabungkan jarak dari semua kriteria.',
    ],
  'What if your priorities change?': [
    'Öncelikler değişirse ne olur?',
    'Bagaimana jika prioritas berubah?',
  ],
  'Hide scenarios': ['Senaryoları gizle', 'Sembunyikan skenario'],
  'Test ±10% weights': ['Ağırlıkları ±%10 ile test et', 'Uji perubahan bobot ±10%'],
  'Try a small relative change to each weight, one at a time. All weights are then rescaled to total 100%.':
    [
      'Her ağırlığı sırayla küçük bir oranda değiştirin. Sonra tüm ağırlıklar toplamı %100 olacak şekilde ölçeklenir.',
      'Ubah setiap bobot sedikit secara bergantian. Semua bobot kemudian disesuaikan agar totalnya 100%.',
    ],
  'The top-ranked set changes in some tested scenarios.': [
    'Test edilen bazı senaryolarda en üst sıradaki seçenekler değişiyor.',
    'Alternatif peringkat teratas berubah dalam beberapa skenario uji.',
  ],
  'The top-ranked set stays the same in the tested ±10% weight scenarios.': [
    'Test edilen ±%10 ağırlık senaryolarında en üst sıradaki seçenekler değişmiyor.',
    'Alternatif peringkat teratas tetap sama dalam skenario perubahan bobot ±10% yang diuji.',
  ],
  'Sensitivity scenarios': ['Duyarlılık senaryoları', 'Skenario sensitivitas'],
  Change: ['Değişim', 'Perubahan'],
  'Top alternatives': ['En üst sıradaki seçenekler', 'Alternatif teratas'],
  Outcome: ['Sonuç', 'Hasil'],
  Changed: ['Değişti', 'Berubah'],
  'Same top set': ['Üst sıra aynı', 'Peringkat teratas tetap'],
  'These scenarios do not change your original AHP judgments. They have no separate consistency ratio and do not establish certainty.':
    [
      'Senaryolar ilk AHP karşılaştırmalarını değiştirmez. Ayrı bir tutarlılık oranları yoktur ve kesinlik göstermezler.',
      'Skenario ini tidak mengubah penilaian AHP awal. Skenario tidak memiliki rasio konsistensi tersendiri dan tidak membuktikan kepastian.',
    ],
  'Inspect the calculation': ['Hesaplamayı incele', 'Periksa perhitungan'],
  'Matrices, ideals, and distances': [
    'Matrisler, idealler ve uzaklıklar',
    'Matriks, nilai ideal, dan jarak',
  ],
  'Results depend on the alternatives included, your priorities, and the normalization method. Adding an alternative or an extreme value can change the ranking. The tested weight scenarios cover only a small part of that uncertainty.':
    [
      'Sonuçlar seçilen seçeneklere, önceliklere ve normalizasyon yöntemine bağlıdır. Yeni bir seçenek veya uç değer eklemek sıralamayı değiştirebilir. Ağırlık senaryoları bu belirsizliğin yalnızca küçük bir bölümünü kapsar.',
      'Hasil bergantung pada alternatif, prioritas, dan metode normalisasi. Menambahkan alternatif atau nilai ekstrem dapat mengubah peringkat. Skenario bobot yang diuji hanya mencakup sebagian kecil ketidakpastian tersebut.',
    ],
  'Edit inputs': ['Girdileri düzenle', 'Edit masukan'],
  'Project JSON': ['Proje JSON’u', 'JSON proyek'],
  'Download report': ['Raporu indir', 'Unduh laporan'],
  'Add 2–10 criteria.': ['2–10 ölçüt ekleyin.', 'Tambahkan 2–10 kriteria.'],
  'Use a unique criterion name.': [
    'Benzersiz bir ölçüt adı kullanın.',
    'Gunakan nama kriteria yang berbeda.',
  ],
  'Name this criterion.': ['Bu ölçüte ad verin.', 'Beri nama kriteria ini.'],
  'Add 2–100 alternatives.': ['2–100 seçenek ekleyin.', 'Tambahkan 2–100 alternatif.'],
  'Use a unique alternative name.': [
    'Benzersiz bir seçenek adı kullanın.',
    'Gunakan nama alternatif yang berbeda.',
  ],
  'Name this alternative.': ['Bu seçeneğe ad verin.', 'Beri nama alternatif ini.'],
  'Negative values are not allowed for this criterion.': [
    'Bu ölçüt için negatif değerlere izin verilmez.',
    'Nilai negatif tidak diizinkan untuk kriteria ini.',
  ],
  'Enter a value. Zero is allowed.': [
    'Bir değer girin. Sıfır girebilirsiniz.',
    'Masukkan nilai. Nol diperbolehkan.',
  ],
  'Use numbers such as 100100 or 1.5. No commas or suffixes.': [
    '100100 veya 1.5 gibi sayılar girin. Virgül veya birim kullanmayın.',
    'Masukkan angka seperti 100100 atau 1.5. Jangan gunakan koma atau satuan.',
  ],
  'Enter a finite number.': ['Sonlu bir sayı girin.', 'Masukkan angka berhingga.'],
  'This file is not valid JSON.': [
    'Bu dosya geçerli bir JSON değil.',
    'Berkas ini bukan JSON yang valid.',
  ],
  'Unsupported project format. Use a Decision Studio JSON export.': [
    'Proje biçimi desteklenmiyor. Decision Studio’dan dışa aktarılmış bir JSON kullanın.',
    'Format proyek tidak didukung. Gunakan JSON hasil ekspor Decision Studio.',
  ],
  'This project exceeds the supported limits.': [
    'Bu proje desteklenen sınırları aşıyor.',
    'Proyek ini melebihi batas yang didukung.',
  ],
  'Invalid project entry.': ['Geçersiz proje girdisi.', 'Entri proyek tidak valid.'],
  'Invalid project identifier.': ['Geçersiz proje kimliği.', 'Pengenal proyek tidak valid.'],
  'Invalid or duplicated project identifiers.': [
    'Geçersiz veya yinelenen proje kimlikleri.',
    'Pengenal proyek tidak valid atau berulang.',
  ],
  'Invalid project name.': ['Geçersiz proje adı.', 'Nama proyek tidak valid.'],
  'Invalid criterion settings.': ['Geçersiz ölçüt ayarları.', 'Pengaturan kriteria tidak valid.'],
  'Only Custom criteria may allow negative values.': [
    'Yalnızca özel ölçütler negatif değer alabilir.',
    'Hanya kriteria khusus yang boleh memiliki nilai negatif.',
  ],
  'Invalid criterion unit.': ['Geçersiz ölçüt birimi.', 'Satuan kriteria tidak valid.'],
  'Invalid criterion comparisons.': [
    'Geçersiz ölçüt karşılaştırmaları.',
    'Perbandingan kriteria tidak valid.',
  ],
  'Invalid alternative values.': ['Geçersiz seçenek değerleri.', 'Nilai alternatif tidak valid.'],
  'Invalid numeric field.': ['Geçersiz sayısal alan.', 'Kolom angka tidak valid.'],
  'Invalid value in {name}: {criterion}.': [
    '{name} seçeneğinde geçersiz değer: {criterion}.',
    'Nilai tidak valid pada {name}: {criterion}.',
  ],
  'Invalid project title.': ['Geçersiz proje başlığı.', 'Judul proyek tidak valid.'],
  'Complete all decision inputs before calculating.': [
    'Hesaplamadan önce tüm karar girdilerini tamamlayın.',
    'Lengkapi semua masukan sebelum menghitung.',
  ],
  'The priority calculation did not converge. Review the comparisons.': [
    'Öncelik hesabı yakınsamadı. Karşılaştırmaları gözden geçirin.',
    'Perhitungan prioritas tidak konvergen. Tinjau perbandingan.',
  ],
  'Invalid TOPSIS inputs.': ['Geçersiz TOPSIS girdileri.', 'Masukan TOPSIS tidak valid.'],
  'The numeric range could not be evaluated safely.': [
    'Sayısal aralık güvenli biçimde hesaplanamadı.',
    'Rentang angka tidak dapat dihitung dengan aman.',
  ],
  'AHP needs a positive square matrix with 2–10 criteria.': [
    'AHP için 2–10 ölçütlü pozitif bir kare matris gerekir.',
    'AHP membutuhkan matriks persegi positif dengan 2–10 kriteria.',
  ],
  'The AHP matrix must be reciprocal with a diagonal of 1.': [
    'AHP matrisi karşılıklı olmalı ve köşegen değerleri 1 olmalıdır.',
    'Matriks AHP harus resiprokal dengan diagonal bernilai 1.',
  ],
  'Review priorities': ['Öncelikleri gözden geçirin', 'Tinjau prioritas'],
  Inconsistent: ['Tutarsız', 'Tidak konsisten'],
  'Decision report': ['Karar raporu', 'Laporan keputusan'],
  Calculated: ['Hesaplama zamanı', 'Waktu perhitungan'],
  Method: ['Yöntem', 'Metode'],
  'RI table': ['RI tablosu', 'Tabel RI'],
  Ranking: ['Sıralama', 'Peringkat'],
  Rank: ['Sıra', 'Peringkat'],
  Closeness: ['Yakınlık', 'Kedekatan'],
  'Distance to best': ['En iyiye uzaklık', 'Jarak ke terbaik'],
  'Distance to worst': ['En kötüye uzaklık', 'Jarak ke terburuk'],
  'Not defined': ['Tanımsız', 'Tidak terdefinisi'],
  'Closeness is relative to this analysis. It is not confidence, accuracy, or a probability. Scores are not normalized to sum to 1.':
    [
      'Yakınlık puanı bu analize göredir. Güven, doğruluk ya da olasılık belirtmez. Puanlar toplamları 1 olacak şekilde normalize edilmez.',
      'Kedekatan bersifat relatif terhadap analisis ini. Skor ini tidak menyatakan keyakinan, akurasi, atau probabilitas. Jumlah skor tidak dinormalisasi menjadi 1.',
    ],
  'Criteria and priorities': ['Ölçütler ve öncelikler', 'Kriteria dan prioritas'],
  Direction: ['Yön', 'Arah'],
  Weight: ['Ağırlık', 'Bobot'],
  'AHP status': ['AHP durumu', 'Status AHP'],
  Converged: ['Yakınsama', 'Konvergensi'],
  Iterations: ['Yineleme sayısı', 'Jumlah iterasi'],
  'Not applicable for two criteria': [
    'İki ölçüt için uygulanmaz',
    'Tidak berlaku untuk dua kriteria',
  ],
  'AHP comparisons': ['AHP karşılaştırmaları', 'Perbandingan AHP'],
  'Raw data (X)': ['Ham veriler (X)', 'Data mentah (X)'],
  'Vector-normalized data (R)': [
    'Vektörle normalize edilmiş veriler (R)',
    'Data normalisasi vektor (R)',
  ],
  'Weighted data (V)': ['Ağırlıklı veriler (V)', 'Data berbobot (V)'],
  Ideal: ['İdeal', 'Ideal'],
  'Criteria with no differences': ['Değerleri aynı olan ölçütler', 'Kriteria tanpa perbedaan'],
  None: ['Yok', 'Tidak ada'],
  'All alternatives are indistinguishable; closeness is undefined.': [
    'Seçenekler ayırt edilemiyor; yakınlık puanı tanımsız.',
    'Semua alternatif tidak dapat dibedakan; kedekatan tidak terdefinisi.',
  ],
  'Weight sensitivity': ['Ağırlık duyarlılığı', 'Sensitivitas bobot'],
  'Relative change': ['Göreli değişim', 'Perubahan relatif'],
  'Scenario weights': ['Senaryo ağırlıkları', 'Bobot skenario'],
  'Top set changed': ['En üst sıradaki seçenekler değişti', 'Alternatif teratas berubah'],
  Yes: ['Evet', 'Ya'],
  No: ['Hayır', 'Tidak'],
  'Scenarios perturb one baseline weight and renormalize all weights. They are not new AHP judgments and have no consistency ratio. Stability only refers to these scenarios.':
    [
      'Her senaryoda bir başlangıç ağırlığı değiştirilir ve tüm ağırlıklar yeniden normalize edilir. Senaryolar yeni AHP değerlendirmeleri değildir ve tutarlılık oranları yoktur. Kararlılık yalnızca test edilen senaryoları kapsar.',
      'Setiap skenario mengubah satu bobot dasar dan menormalisasi ulang semua bobot. Skenario ini bukan penilaian AHP baru dan tidak memiliki rasio konsistensi. Stabilitas hanya berlaku pada skenario yang diuji.',
    ],
  Assumptions: ['Varsayımlar', 'Asumsi'],
  'AHP weights represent stated preferences. TOPSIS uses vector normalization and Euclidean distances.':
    [
      'AHP ağırlıkları belirtilen tercihleri temsil eder. TOPSIS vektör normalizasyonu ve Öklid uzaklıklarını kullanır.',
      'Bobot AHP mewakili preferensi yang dinyatakan. TOPSIS menggunakan normalisasi vektor dan jarak Euclidean.',
    ],
  'All alternatives use the same units, scale, and time basis within each criterion. No conversion is performed.':
    [
      'Her ölçütte tüm seçenekler aynı birimi, ölçeği ve zaman aralığını kullanır. Dönüştürme yapılmaz.',
      'Untuk setiap kriteria, semua alternatif memakai satuan, skala, dan periode yang sama. Tidak ada konversi.',
    ],
  'Adding alternatives, extreme inputs, and correlated criteria can affect ranking.': [
    'Yeni seçenekler, uç değerler ve birbiriyle ilişkili ölçütler sıralamayı etkileyebilir.',
    'Alternatif tambahan, nilai ekstrem, dan kriteria yang berkorelasi dapat memengaruhi peringkat.',
  ],
  'Higher/lower directions assume monotonic preference. Ratings remain subjective.': [
    'Daha yüksek veya daha düşük değer yönü monoton tercih varsayımına dayanır. Puanlar özneldir.',
    'Arah nilai lebih tinggi atau lebih rendah mengasumsikan preferensi monoton. Penilaian tetap subjektif.',
  ],
  'This ranking does not enforce mandatory eligibility constraints.': [
    'Sıralama zorunlu uygunluk koşullarını denetlemez.',
    'Peringkat ini tidak memeriksa syarat kelayakan wajib.',
  ],
  'Squared distances contain squared weights; final closeness is not a linear sum of criterion scores.':
    [
      'Uzaklıkların kareleri ağırlıkların karelerini içerir. Yakınlık sonucu ölçüt puanlarının doğrusal toplamı değildir.',
      'Kuadrat jarak mencakup kuadrat bobot. Kedekatan akhir bukan jumlah linear dari skor kriteria.',
    ],
};

export function translate(locale: Locale, key: string, values: Interpolations = {}): string {
  const localized =
    locale === 'en' || !Object.hasOwn(messages, key) ? key : messages[key][locale === 'tr' ? 0 : 1];
  return localized.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : match,
  );
}
