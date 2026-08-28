# Product Requirements Document (PRD)
# Pundi — Personal Finance Manager (PWA)

> **Catatan tentang nama produk:** "Pundi" digunakan sebagai nama kerja (working name) sementara di dokumen ini agar mudah dirujuk. Nama, logo, palet warna, dan seluruh aset visual dirancang orisinal dan **tidak berasal dari, tidak meniru, dan tidak terafiliasi dengan** aplikasi "Money Manager: Pengeluaran" atau aplikasi pihak ketiga manapun. Referensi aplikasi tersebut hanya digunakan untuk memahami *kategori fitur umum* pada aplikasi manajemen keuangan pribadi (expense tracker), bukan sebagai sumber desain, copywriting, atau implementasi.

**Versi Dokumen:** 1.0
**Tanggal:** 29 Agustus 2026
**Status:** Draft untuk review teknis
**Target Pembaca:** Product Owner, Frontend/Fullstack Engineer, UX Designer, QA

---

## Daftar Isi

1. Product Overview
2. Problem Statement
3. Product Vision
4. Goals
5. Non-Goals
6. Target Users
7. User Personas
8. Core User Journeys
9. Feature List
10. Functional Requirements
11. Business Logic
12. Daily Spending Limit Algorithm
13. Budget Logic
14. Transaction Logic
15. Wallet Logic
16. Savings Logic
17. Debt Logic
18. Asset Logic
19. Event Logic
20. Recurring Transaction Logic
21. Reports & Analytics
22. Data Model
23. IndexedDB Architecture
24. PWA Architecture
25. Offline Strategy
26. Backup & Restore
27. Security & Privacy
28. UX Requirements
29. Responsive Requirements
30. Accessibility
31. Edge Cases
32. User Stories
33. Acceptance Criteria
34. MVP Scope
35. V1 Scope
36. Future Scope
37. Performance Requirements
38. Technical Constraints
39. Risks
40. Open Questions
41. Development Roadmap

---

## 1. Product Overview

Pundi adalah aplikasi **manajemen keuangan pribadi berbasis web** yang dibangun sebagai **Progressive Web App (PWA)** menggunakan Next.js. Aplikasi ini memungkinkan pengguna mencatat pemasukan dan pengeluaran, mengelola beberapa wallet/rekening, membuat budget, melacak target tabungan, mencatat hutang-piutang, mengelola aset, serta melihat laporan keuangan — **seluruhnya tanpa akun, tanpa server, dan tanpa koneksi internet setelah instalasi awal**.

Seluruh data disimpan secara lokal di perangkat pengguna menggunakan **IndexedDB**, menjadikan aplikasi ini *offline-first* dan *privacy-first*. Pengguna memiliki kendali penuh atas datanya, termasuk kemampuan backup dan restore manual dalam bentuk file.

Fitur pembeda utama Pundi adalah **Daily Spending Limit** — sebuah rekomendasi harian dinamis yang menjawab pertanyaan "berapa yang aman saya keluarkan hari ini?", bukan sekadar "uang saya habis untuk apa?".

---

## 2. Problem Statement

Kebanyakan aplikasi pencatatan keuangan pribadi bersifat **reaktif**: pengguna mencatat transaksi, lalu di akhir bulan melihat laporan tentang apa yang sudah terjadi. Masalah yang belum terjawab dengan baik oleh kebanyakan aplikasi:

1. **Pengguna tidak tahu apakah pengeluaran hari ini "aman"** relatif terhadap sisa waktu dan sisa budget yang dimiliki.
2. **Budget bulanan terasa abstrak.** Angka "Rp1.000.000/bulan" tidak memberi tahu keputusan konkret hari ini.
3. **Pengeluaran tidak merata sepanjang bulan** — pengguna sering menghabiskan budget di awal bulan tanpa sadar, lalu kesulitan di akhir bulan.
4. **Data keuangan tersebar** di berbagai wallet (cash, bank, e-wallet) tanpa satu tampilan gabungan.
5. **Aplikasi keuangan sering mewajibkan akun/cloud**, padahal banyak pengguna ingin privasi penuh dan tidak ingin data finansial mereka berada di server pihak ketiga.
6. **Hutang, piutang, target tabungan, dan aset** sering dikelola terpisah (catatan manual, spreadsheet, aplikasi berbeda-beda) padahal saling berhubungan dengan kondisi keuangan yang sama.

---

## 3. Product Vision

> "Membantu pengguna membuat keputusan finansial harian yang lebih baik, dengan menjawab satu pertanyaan sederhana: **'Dengan uang yang saya punya sekarang, berapa yang aman saya keluarkan hari ini?'** — sepenuhnya privat, sepenuhnya offline, tanpa akun."

Pundi bukan aplikasi yang membatasi atau menghakimi pengguna. Pundi adalah *co-pilot* keuangan yang memberi konteks dan rekomendasi real-time, sambil tetap membiarkan pengguna mengambil keputusan akhir.

---

## 4. Goals

- G1 — Memungkinkan pencatatan transaksi (income/expense/transfer) dalam **≤ 3 langkah** dari halaman manapun.
- G2 — Menyediakan **Daily Spending Limit** yang akurat, dinamis, dan mudah dipahami di dashboard dan halaman budget.
- G3 — Mendukung multi-wallet dengan perhitungan saldo yang selalu konsisten.
- G4 — Berfungsi **100% offline** setelah pemuatan pertama, termasuk create/read/update/delete seluruh data inti.
- G5 — Tidak menyimpan data pengguna di server manapun; seluruh data hidup di perangkat pengguna.
- G6 — Menyediakan backup/restore yang andal (tidak ada kehilangan data akibat browser storage terhapus tanpa peringatan).
- G7 — Terasa seperti aplikasi native saat digunakan di iPhone melalui Safari, termasuk saat di-*install* ke Home Screen.
- G8 — Menyediakan laporan yang membantu pengguna memahami pola keuangan mereka (cash flow, kategori, budget performance).

## 5. Non-Goals

- NG1 — **Bukan** aplikasi multi-device sync / cloud backup otomatis (di luar MVP dan V1; lihat Future Scope).
- NG2 — **Bukan** aplikasi multi-user/kolaboratif (family sharing) pada MVP/V1.
- NG3 — **Bukan** aplikasi investasi/trading; asset tracking bersifat pencatatan manual, bukan integrasi bursa real-time.
- NG4 — **Bukan** aplikasi perbankan; tidak ada open banking / bank feed automation.
- NG5 — Tidak mewajibkan akun, login, atau autentikasi untuk penggunaan dasar.
- NG6 — Tidak mengirimkan data transaksi ke server manapun (tidak ada analytics yang membocorkan data finansial personal).
- NG7 — Tidak menjadi *clone* aplikasi manapun secara desain, nama, atau branding.

---

## 6. Target Users

- Individu (18–40 tahun) yang ingin mengontrol pengeluaran harian, terutama mahasiswa, pekerja muda, dan freelancer dengan pemasukan tidak selalu tetap.
- Pengguna yang peduli privasi data finansial dan enggan membuat akun di aplikasi keuangan.
- Pengguna dengan banyak wallet (cash, bank, e-wallet) yang ingin satu tampilan gabungan.
- Pengguna yang pernah mencoba aplikasi budgeting tapi berhenti karena budget terasa tidak actionable secara harian.
- Pengguna iPhone yang mengakses aplikasi terutama melalui Safari dan ingin pengalaman seperti aplikasi native tanpa App Store.

## 7. User Personas

**Persona 1 — Rani, 22, Mahasiswa Tingkat Akhir**
Menerima uang bulanan dari orang tua + kadang freelance. Sering kehabisan uang di minggu ke-3. Butuh tahu batas aman harian, bukan sekadar total bulanan. Menggunakan Cash, DANA, dan rekening BCA. Menggunakan iPhone, tidak ingin install app besar dari App Store.

**Persona 2 — Dimas, 27, Karyawan Swasta**
Gaji bulanan tetap + kadang bonus. Punya cicilan, tabungan untuk menikah, dan ingin memantau aset (laptop, motor). Ingin laporan bulanan yang jelas: planned vs actual. Peduli privasi — tidak mau data gaji tersimpan di cloud pihak ketiga.

**Persona 3 — Sinta, 31, Freelancer**
Pemasukan tidak tetap dari berbagai klien. Butuh mencatat piutang klien yang belum bayar, dan hutang ke supplier. Butuh event tracking untuk melacak biaya per-proyek.

## 8. Core User Journeys

1. **Onboarding cepat** → Buka aplikasi pertama kali → Pilih currency & buat wallet pertama → Set saldo awal → Masuk ke Dashboard (tanpa akun, tanpa form panjang).
2. **Mencatat pengeluaran harian** → Tap FAB → Pilih "Expense" → Isi nominal, kategori, wallet → Simpan → Kembali ke halaman sebelumnya, saldo & daily limit ter-update instan.
3. **Membuat budget & memantau limit harian** → Buat budget bulanan untuk kategori "Food" → Dashboard menampilkan Daily Spending Limit khusus kategori tersebut → Setiap transaksi baru memperbarui limit hari berikutnya.
4. **Menabung untuk tujuan** → Buat Savings Goal "MacBook" → Sistem merekomendasikan nominal tabungan harian/mingguan/bulanan → Pengguna melakukan "deposit" dari salah satu wallet.
5. **Mencatat hutang piutang** → Tambah piutang ke teman → Catat pembayaran parsial → Sistem menghitung sisa piutang otomatis.
6. **Melihat laporan bulanan** → Buka Reports → Pilih periode → Lihat cash flow, expense by category, budget performance.
7. **Backup sebelum ganti perangkat** → Buka Settings → Export Backup → Simpan file JSON → Di perangkat baru → Import Backup → Data pulih penuh.
8. **Install ke Home Screen iPhone** → Buka Safari → Share → Add to Home Screen → Ikon Pundi muncul → Dibuka sebagai aplikasi standalone.

---

## 9. Feature List

| Modul | Fitur |
|---|---|
| Transaksi | Expense, Income, Transfer, edit, delete, attachment/receipt (image), search & filter |
| Wallet | Multi-wallet, tipe wallet, saldo otomatis, archive wallet |
| Kategori & Tag | Default categories, custom categories, tag multi-pilih |
| Budget | Budget per periode, per kategori/wallet/tag, rollover, **Daily Spending Limit** |
| Savings Goal | Target tabungan, deposit/withdrawal, rekomendasi menabung |
| Debt & Receivable | Hutang & piutang, pembayaran parsial, riwayat pembayaran |
| Asset | Pencatatan aset, riwayat nilai, gain/loss |
| Event | Event/project tracking, budget per event |
| Recurring | Transaksi berulang otomatis |
| Reports | Cash flow, expense by category, daily spending, budget performance, wallet report |
| Calendar | Kalender transaksi harian |
| Dashboard | Ringkasan saldo, income/expense, daily limit, savings progress, recent transactions (customizable) |
| Backup/Restore | Export/import JSON, validasi schema |
| Settings | Currency, theme, language, start of week, payday, reset data |
| PWA | Installable, offline, splash screen, standalone mode |

---

## 10. Functional Requirements

### FR-1 Transaction Management
- FR-1.1 Pengguna dapat membuat transaksi Expense, Income, dan Transfer.
- FR-1.2 Setiap transaksi wajib memiliki: amount (> 0), wallet, tanggal. Field lain opsional.
- FR-1.3 Pengguna dapat mengedit dan menghapus transaksi kapan pun, termasuk transaksi lampau.
- FR-1.4 Perubahan transaksi harus langsung memperbarui saldo wallet terkait secara atomik.
- FR-1.5 Transaksi dapat memiliki lampiran gambar (struk), disimpan sebagai Blob di IndexedDB.
- FR-1.6 Transfer wajib melibatkan dua wallet berbeda dan tidak dihitung sebagai income/expense pada laporan cash flow.

### FR-2 Wallet Management
- FR-2.1 Pengguna dapat membuat wallet tak terbatas jumlahnya.
- FR-2.2 Wallet memiliki saldo yang dihitung dari opening balance + seluruh mutasi.
- FR-2.3 Wallet dapat di-archive (disembunyikan dari pilihan transaksi baru) tapi tidak dihapus jika memiliki riwayat transaksi.
- FR-2.4 Total Balance di Dashboard = jumlah saldo seluruh wallet aktif (non-archived), dengan opsi menyertakan wallet archived.

### FR-3 Budget & Daily Spending Limit
- FR-3.1 Pengguna dapat membuat budget dengan periode dan cakupan (kategori/wallet/tag/semua) yang fleksibel.
- FR-3.2 Sistem menghitung ulang Daily Spending Limit setiap kali ada transaksi baru yang eligible terhadap budget tersebut.
- FR-3.3 Sistem tidak pernah memblokir transaksi karena melebihi limit — hanya memberi indikasi visual.

### FR-4 Savings Goal
- FR-4.1 Pengguna dapat membuat target tabungan dengan/atau tanpa deadline.
- FR-4.2 Deposit/withdrawal pada savings goal wajib terhubung ke sebuah wallet (mengurangi/menambah saldo wallet tsb).

### FR-5 Debt & Receivable
- FR-5.1 Pengguna dapat mencatat hutang (utang saya) dan piutang (orang berutang ke saya).
- FR-5.2 Pembayaran dapat parsial, dan opsional terhubung ke transaksi wallet.

### FR-6 Asset
- FR-6.1 Pengguna dapat mencatat aset dengan nilai awal dan riwayat perubahan nilai.

### FR-7 Event
- FR-7.1 Pengguna dapat membuat event dan mengaitkan transaksi ke event tersebut untuk melacak total biaya.

### FR-8 Recurring Transaction
- FR-8.1 Sistem otomatis membuat transaksi baru sesuai jadwal recurring saat aplikasi dibuka (bukan background job, karena tidak ada server).

### FR-9 Reports
- FR-9.1 Sistem menyediakan minimal 7 jenis laporan (lihat Bagian 21).

### FR-10 Backup & Restore
- FR-10.1 Pengguna dapat export seluruh data menjadi 1 file JSON dan import kembali dengan validasi schema.

### FR-11 PWA & Offline
- FR-11.1 Aplikasi dapat di-install ke Home Screen dan berjalan standalone tanpa browser chrome.
- FR-11.2 Seluruh fitur inti berfungsi tanpa koneksi internet setelah pemuatan pertama.

---

## 11. Business Logic

Prinsip inti business logic Pundi:

1. **Single Source of Truth per Wallet** — saldo wallet **tidak pernah disimpan sebagai angka statis yang diedit langsung**, melainkan selalu berupa hasil kalkulasi dari `openingBalance` + seluruh transaksi terkait wallet tersebut (income, expense, transfer in, transfer out). Ini menghindari drift data akibat edit manual.
2. **Immutability of History, Mutability of State** — transaksi historis dapat diedit/dihapus, tetapi setiap perubahan memicu **rekalkulasi turunan** (saldo wallet, budget spent, daily limit, savings progress) — bukan penyesuaian selisih manual.
3. **Derived, not Duplicated** — nilai seperti "total spent budget", "remaining budget", "daily limit" adalah **derived values** yang dihitung saat dibutuhkan (atau di-cache dan diinvalidasi saat data sumber berubah), bukan field yang disimpan independen dan rawan tidak sinkron.
4. **Non-blocking Guidance** — sistem tidak pernah mencegah pengguna menyimpan transaksi karena melebihi budget/limit. Validasi hanya untuk integritas data (amount > 0, wallet valid), bukan untuk *judgement* finansial pengguna.
5. **Local Timezone Consistency** — seluruh perhitungan tanggal (hari ini, sisa hari, periode budget) menggunakan **timezone perangkat pengguna** secara konsisten pada saat kalkulasi dilakukan.

---

## 12. Daily Spending Limit Algorithm

Ini adalah logika inti pembeda produk. Spesifikasi berikut **wajib** diimplementasikan persis seperti ini agar hasil konsisten di seluruh bagian aplikasi (Dashboard, Budget Detail, Reports).

### 12.1 Definisi Variabel

```
budgetLimit        = nominal total budget untuk periode berjalan
eligibleExpenses    = total expense yang termasuk cakupan budget ini,
                      dihitung dari periodStart s.d. HARI INI (inklusif),
                      TIDAK termasuk transfer
periodStart         = tanggal mulai periode budget berjalan
periodEnd           = tanggal akhir periode budget berjalan (null jika unlimited)
today               = tanggal hari ini (device local time, jam dinolkan / date-only)
remainingBudget     = budgetLimit - eligibleExpenses
remainingDays       = jumlah hari tersisa TERMASUK hari ini, dihitung s.d. periodEnd
dailyLimit          = nominal rekomendasi pengeluaran untuk HARI INI
```

### 12.2 Formula Utama

```
remainingBudget = budgetLimit - eligibleExpenses

remainingDays   = (periodEnd - today).inDays + 1     // hari ini termasuk dihitung
                  clamp minimum menjadi 1             // lihat 12.4 "hari terakhir"

dailyLimit      = remainingBudget > 0
                    ? remainingBudget / remainingDays
                    : 0                               // lihat 12.5 "overspending"
```

**Keputusan desain — hari ini termasuk `remainingDays`:** Ya. Alasan: pengguna membuka aplikasi *di pagi/siang hari itu* dan berhak tahu berapa yang masih boleh dibelanjakan **hari ini juga**, bukan mulai besok. Jika hari ini tidak dihitung, limit hari terakhir periode akan selalu 0/undefined padahal masih ada waktu belanja di hari itu.

### 12.3 Perhitungan `eligibleExpenses`

`eligibleExpenses` untuk sebuah budget adalah jumlah dari seluruh **Transaction** dengan `type = expense`, `date` berada dalam rentang `[periodStart, today]`, dan yang memenuhi **BudgetRule** budget tersebut (lihat Bagian 13.2 tentang cakupan kategori/wallet/tag). Transfer **tidak pernah** dihitung sebagai expense pada budget manapun.

### 12.4 Penanganan Hari Terakhir Periode

Pada hari terakhir periode (`today == periodEnd`): `remainingDays = 1`, sehingga `dailyLimit = remainingBudget`. Ini benar secara logis: seluruh sisa budget "harus" dianggap sebagai jatah hari itu karena besok periode sudah berganti (dan budget baru — jika recurring — akan mulai dari nol).

### 12.5 Penanganan Overspending / Remaining Budget Negatif

Jika `eligibleExpenses > budgetLimit` maka `remainingBudget` bernilai negatif.
- `dailyLimit` **di-clamp menjadi `0`** (bukan angka negatif — angka negatif tidak actionable bagi pengguna).
- Sistem menampilkan status **OVER BUDGET** dan pesan eksplisit: *"Kamu sudah melewati budget sebesar Rp{abs(remainingBudget)}"*.
- Selama sisa periode, dailyLimit tetap `0` sampai: (a) `eligibleExpenses` turun (transaksi dihapus/diedit), atau (b) periode baru dimulai.

### 12.6 Penanganan Budget Belum Dimulai

Jika `today < periodStart`: Daily Spending Limit **tidak dihitung/ditampilkan**. UI menampilkan status **UPCOMING** dengan countdown: *"Budget ini mulai berlaku dalam N hari"*. `eligibleExpenses` = 0 karena belum ada transaksi dalam rentang.

### 12.7 Penanganan Budget Sudah Berakhir

Jika `today > periodEnd`: Daily Spending Limit **tidak lagi relevan**, diganti dengan ringkasan final: total spent, remaining (jika ada sisa, ditampilkan sebagai "sisa tidak terpakai"), dan status akhir (**COMPLETED — WITHIN BUDGET** atau **COMPLETED — OVER BUDGET**). Jika budget bersifat recurring (misal budget bulanan otomatis), sistem membuat instance budget baru untuk periode berikutnya secara otomatis saat terdeteksi (lihat 13.6).

### 12.8 Penanganan Budget Tanpa Batas Waktu (Unlimited / Ongoing)

Budget dengan `periodEnd = null` (mode "custom tanpa akhir") **tidak didukung untuk Daily Spending Limit** karena pembagian per hari membutuhkan titik akhir. Aturan: jika pengguna memilih period type `daily/weekly/monthly/yearly`, sistem **wajib** menetapkan `periodEnd` otomatis berdasarkan siklus tersebut (mis. bulanan → akhir bulan berjalan). Opsi "custom" tanpa tanggal akhir hanya diperbolehkan untuk budget bertipe **tracking only** (tanpa Daily Spending Limit, hanya menampilkan total spent vs limit).

### 12.9 Rekalkulasi Dinamis (Unused & Overspent Carry Behavior)

Setiap transaksi expense baru yang eligible terhadap sebuah budget memicu rekalkulasi **langsung** (bukan batch/async):

- **Jika pengeluaran hari ini < dailyLimit hari ini** → sisa (`unused`) otomatis "mengalir" ke perhitungan hari berikutnya, karena `remainingBudget` untuk besok sudah memperhitungkan `eligibleExpenses` aktual hari ini (bukan `dailyLimit` yang direkomendasikan). Tidak ada field terpisah untuk "unused amount" — ini murni konsekuensi dari formula di 12.2 dihitung ulang keesokan harinya dengan `remainingDays` berkurang 1 dan `eligibleExpenses` bertambah sesuai aktual.
- **Jika pengeluaran hari ini > dailyLimit hari ini** → `remainingBudget` besok otomatis lebih kecil, dan karena `remainingDays` juga berkurang 1, `dailyLimit` besok akan lebih kecil dari hari ini (redistribusi defisit ke sisa hari secara merata).

Contoh (sesuai spesifikasi produk):
```
Limit hari ini    : Rp33.333
Actual hari ini   : Rp50.000  (overspend Rp16.667)
remainingDays besok (contoh): 23
remainingBudget besok = remainingBudget_kemarin - 50.000
dailyLimit besok = remainingBudget_besok / 23   → otomatis lebih kecil
```

### 12.10 Status & Threshold

Dua jenis status ditampilkan terpisah karena mengukur hal berbeda:

**A. Daily Status** (membandingkan pengeluaran **hari ini** terhadap `dailyLimit` **hari ini**):

| Status | Kondisi (default threshold, dapat dikonfigurasi di Settings) |
|---|---|
| `SAFE` | `todaySpent / dailyLimit ≤ 70%` |
| `WARNING` | `70% < todaySpent / dailyLimit ≤ 100%` |
| `EXCEEDED` | `todaySpent / dailyLimit > 100%` |

Jika `dailyLimit = 0` (karena over budget, lihat 12.5) dan `todaySpent > 0` → status otomatis `EXCEEDED`.

**B. Overall Budget Status** (membandingkan total `eligibleExpenses` terhadap `budgetLimit` sepanjang periode):

| Status | Kondisi |
|---|---|
| `ON_TRACK` | `eligibleExpenses ≤ budgetLimit` dan proyeksi akhir periode (lihat catatan) masih ≤ budgetLimit |
| `AT_RISK` | `eligibleExpenses ≤ budgetLimit` tapi proyeksi akhir periode akan melebihi budgetLimit |
| `OVER_BUDGET` | `eligibleExpenses > budgetLimit` |

*Catatan proyeksi:* `projectedTotal = eligibleExpenses + (dailyLimit_sebelum_rekalkulasi_hari_ini × sisa hari)` — digunakan hanya sebagai sinyal visual sekunder (badge kecil), tidak wajib ditampilkan di MVP.

Threshold 70%/100% disimpan di `AppSettings.dailyLimitThresholds` agar dapat dikonfigurasi (V1).

### 12.11 Daily Limit History

Setiap kali hari berganti (terdeteksi saat aplikasi dibuka dan `lastOpenedDate < today`), sistem menyimpan snapshot **hari sebelumnya** ke tabel `DailyLimitHistory`: `{ budgetId, date, limit, actual, difference }`. Snapshot bersifat **write-once** (tidak diubah lagi setelah hari itu lewat) agar riwayat tetap akurat meski transaksi hari itu kemudian diedit — namun jika pengguna mengedit transaksi pada tanggal lampau, sistem menandai snapshot terkait sebagai `recalculated: true` dan memperbarui `actual` (lihat Edge Case #12).

---

## 13. Budget Logic

### 13.1 Periode Budget

| Period Type | `periodEnd` dihitung otomatis sebagai |
|---|---|
| daily | akhir hari yang sama (`periodStart`) |
| weekly | 6 hari setelah `periodStart` (mengikuti `startDayOfWeek` di Settings) |
| biweekly | 13 hari setelah `periodStart` |
| monthly | hari terakhir bulan `periodStart` (menangani 28/29/30/31 secara otomatis) |
| yearly | 31 Desember tahun `periodStart` (atau 364/365 hari setelahnya jika custom start) |
| custom | `periodEnd` wajib diisi manual oleh pengguna |

### 13.2 Cakupan Budget (BudgetRule)

Sebuah Budget memiliki 0..n `BudgetRule` yang mendefinisikan filter transaksi eligible:
- Jika tidak ada rule sama sekali → cakupan = **semua expense**.
- Jika ada rule kategori → hanya expense dengan kategori dalam daftar tersebut.
- Rule dapat dikombinasikan (kategori DAN wallet DAN tag) — kombinasi antar-tipe rule bersifat **AND**, sedangkan nilai dalam satu tipe rule bersifat **OR** (mis. kategori Food ATAU Transport, DAN wallet Cash).

### 13.3 Overall Budget vs Category Budget

Pengguna dapat memiliki **1 Overall Budget** (cakupan semua expense) dan **banyak Category/Wallet/Tag Budget** secara bersamaan. Keduanya dihitung **independen** — sebuah expense yang masuk Category Budget "Food" juga tetap dihitung dalam Overall Budget jika ada. Ini disengaja: kategori budget adalah "sub-alokasi" dari kondisi keuangan yang sama, bukan sistem terpisah. Dashboard menampilkan Overall Budget sebagai default; Category Budget ditampilkan di halaman Budget masing-masing.

### 13.4 Rollover Behavior

Setiap Budget memiliki `rolloverEnabled: boolean`.
- `false` (default) → sisa budget periode ini **hangus**; periode berikutnya mulai dari `budgetLimit` penuh.
- `true` → sisa (`remainingBudget` positif di akhir periode) **ditambahkan** ke `budgetLimit` periode berikutnya. Jika `remainingBudget` negatif (over budget), selisih **dikurangkan** dari `budgetLimit` periode berikutnya (opsional, dapat dinonaktifkan lewat `rolloverIncludesOverspend: boolean`, default `true`).

### 13.5 Interaksi Category Budget dengan Overall Budget

Category Budget **tidak** mengurangi kapasitas Overall Budget secara otomatis (tidak ada sub-alokasi hard-lock). Namun UI Dashboard/Budget menampilkan indikator jika total seluruh Category Budget aktif melebihi Overall Budget, sebagai peringatan perencanaan (bukan error).

### 13.6 Recurring Budget (Auto-renew per Periode)

Budget dengan `period` selain `custom` memiliki `autoRenew: boolean` (default `true`). Saat `today > periodEnd` dan `autoRenew = true`, sistem otomatis membuat instance Budget baru untuk periode berikutnya dengan `budgetLimit` sama (± rollover), saat aplikasi dibuka.

---

## 14. Transaction Logic

- **Amount** selalu disimpan sebagai **integer dalam satuan terkecil mata uang** (mis. untuk IDR yang tidak memiliki subunit praktis, disimpan sebagai integer rupiah penuh; untuk currency dengan desimal seperti USD, disimpan sebagai integer sen/cent) untuk menghindari floating-point error. Formatting desimal dilakukan di layer presentasi berdasarkan `currency.decimalDigits`.
- **Expense** mengurangi saldo wallet terkait. **Income** menambah saldo wallet terkait. **Transfer** mengurangi wallet asal dan menambah wallet tujuan dalam **satu operasi atomik** (satu IndexedDB transaction mencakup dua perubahan).
- Edit transaksi: sistem menghitung ulang efek saldo dengan cara **membatalkan efek lama, lalu menerapkan efek baru** dalam satu operasi atomik — bukan menghitung selisih manual (menghindari bug akumulasi).
- Delete transaksi: efek saldo dibatalkan sepenuhnya; jika transaksi terkait ke Budget/Event/SavingsGoal/DebtPayment, referensi terkait diperbarui/dilepas sesuai Bagian 31 (Edge Cases).
- Transaksi tidak boleh memiliki `amount ≤ 0`; validasi dilakukan di form level sebelum submit.

---

## 15. Wallet Logic

```
walletBalance = openingBalance
              + Σ(income.amount di wallet ini)
              - Σ(expense.amount di wallet ini)
              + Σ(transferIn.amount ke wallet ini)
              - Σ(transferOut.amount dari wallet ini)
```

- Perhitungan dilakukan **on-read** dengan agregasi indexed query (bukan disimpan sebagai field yang diedit manual), namun untuk performa (lihat Bagian 41) hasil dapat **di-cache** di field `Wallet.cachedBalance` yang diinvalidasi/diperbarui setiap ada mutasi transaksi terkait wallet tersebut (write-through cache, bukan source of truth).
- Wallet dapat memiliki saldo negatif (mis. kartu kredit) — tidak divalidasi sebagai error, hanya ditampilkan dengan warna berbeda.
- Archived wallet tetap menyimpan riwayat transaksi dan dihitung dalam laporan historis, tapi tidak muncul di pilihan wallet untuk transaksi baru dan tidak dihitung di "Total Balance" default (dapat di-toggle).

---

## 16. Savings Logic

```
progressPercentage   = min(currentAmount / targetAmount, 100%)
remainingAmount       = max(targetAmount - currentAmount, 0)
daysUntilDeadline     = (deadline - today).inDays   (jika deadline diisi)

recommendedPerDay     = remainingAmount / max(daysUntilDeadline, 1)
recommendedPerWeek    = recommendedPerDay × 7
recommendedPerMonth   = recommendedPerDay × 30
```

- Jika tanpa `deadline`: rekomendasi per hari/minggu/bulan **tidak ditampilkan** (diganti dengan progress saja), karena tidak ada basis waktu.
- Jika `deadline` sudah lewat dan `currentAmount < targetAmount`: status berubah menjadi **OVERDUE**, `daysUntilDeadline` di-clamp minimum 1 untuk mencegah pembagian negatif/nol, dan ditampilkan pesan "Target terlewat, sisa Rp{remainingAmount} yang perlu ditabung."
- **Deposit** ke savings goal = transaksi khusus yang mengurangi saldo wallet sumber dan menambah `currentAmount` goal. **Withdrawal** = kebalikannya. Setiap deposit/withdrawal dicatat di `SavingsTransaction` (riwayat), dan **opsional** tercermin sebagai Transfer di wallet (direkomendasikan: ya, agar cash flow wallet tetap akurat — deposit ke tabungan dianggap transfer ke "virtual wallet" goal tersebut, bukan expense).

---

## 17. Debt Logic

```
remainingBalance = principalAmount - Σ(payments.amount)
status = remainingBalance <= 0 ? 'PAID' : (dueDate < today ? 'OVERDUE' : 'ONGOING')
```

- `Debt.direction`: `I_OWE` (hutang saya) atau `OWED_TO_ME` (piutang).
- Setiap `DebtPayment` opsional terhubung ke sebuah `Transaction` (expense untuk melunasi hutang saya, income untuk menerima pembayaran piutang) agar tercermin di saldo wallet dan cash flow. Jika pengguna memilih "catat saja tanpa pengaruh ke wallet" (mis. hutang dianggap sudah dicatat sebelumnya), payment tetap tersimpan tanpa `linkedTransactionId`.
- Partial payment tidak boleh melebihi `remainingBalance` saat itu — jika pengguna mencoba, sistem menawarkan untuk membulatkan ke `remainingBalance` (bukan menolak transaksi).

---

## 18. Asset Logic

```
currentTotalAssets = Σ(asset.currentValue) untuk semua asset aktif
gainLoss (per asset)  = currentValue - initialValue
gainLossPercentage    = gainLoss / initialValue × 100%
```

- Setiap perubahan `currentValue` dicatat sebagai entri baru di `AssetValueHistory` (append-only), bukan overwrite — `Asset.currentValue` adalah nilai dari entri history terbaru (denormalized untuk performa baca).
- Asset **tidak** memengaruhi saldo wallet secara otomatis (aset ≠ wallet). Pembelian aset dapat dicatat sebagai Expense biasa oleh pengguna secara manual, terhubung opsional via `note`/`Event`.

---

## 19. Event Logic

```
eventTotalSpending = Σ(expense.amount WHERE transaction.eventId = event.id)
eventRemaining      = event.budgetAmount - eventTotalSpending   (jika event.budgetAmount diisi)
```

- Event bersifat opsional pada field Transaction (`eventId?: string`).
- Event dapat memiliki `budgetAmount` opsional; jika kosong, halaman event hanya menampilkan total spending tanpa progress bar.
- Event tidak memiliki batas waktu wajib — dapat berstatus `ongoing` tanpa `endDate`.

---

## 20. Recurring Transaction Logic

- Field kunci: `frequency` (`daily/weekly/monthly/yearly/custom`), `interval` (mis. setiap 2 minggu), `startDate`, `endDate?`, `nextOccurrenceDate`, `isActive`.
- **Mekanisme generate (tanpa background job/server):** saat aplikasi dibuka (`app mount` di client), sistem membandingkan `nextOccurrenceDate` tiap RecurringTransaction aktif dengan `today`. Untuk setiap occurrence yang `nextOccurrenceDate ≤ today` (bisa lebih dari satu jika aplikasi lama tidak dibuka), sistem:
  1. Membuat `Transaction` baru sesuai template, dengan `date = nextOccurrenceDate` (bukan `today`, agar histori akurat).
  2. Menghitung `nextOccurrenceDate` berikutnya sesuai frequency.
  3. Mengulang hingga `nextOccurrenceDate > today` atau melewati `endDate`.
- Sebelum mengeksekusi otomatis, sistem menampilkan **konfirmasi ringkas** (mis. modal "3 transaksi berulang akan ditambahkan: Gaji, Kos, Internet — Lanjutkan?") pada MVP, agar pengguna tidak kaget dengan transaksi yang tiba-tiba muncul. (V1 dapat menambahkan opsi "auto-add tanpa konfirmasi" per-item di Settings.)
- Menonaktifkan (`isActive = false`) recurring tidak menghapus transaksi yang sudah ter-generate sebelumnya.

---

## 21. Reports & Analytics

| Report | Deskripsi | Sumber Data |
|---|---|---|
| Cash Flow | Income vs Expense per periode (line/bar chart) | Transaction (exclude transfer) |
| Expense by Category | Pie/donut + tabel persentase | Transaction type=expense, group by category |
| Daily Spending | Bar chart pengeluaran per hari dalam periode | Transaction type=expense, group by date |
| Monthly Summary | Income, Expense, Saving (Income−Expense), Net Cash Flow | Aggregasi bulanan |
| Budget Performance | Budget vs actual per budget aktif/selesai | Budget + eligibleExpenses |
| Daily Limit Performance | Grafik Daily Limit vs Actual dari `DailyLimitHistory` | DailyLimitHistory |
| Wallet Report | Saldo & mutasi per wallet dalam periode | Transaction group by wallet |
| Savings Report | Progress seluruh savings goal | SavingsGoal + SavingsTransaction |

Semua report mendukung filter periode (bulan ini, bulan lalu, 3 bulan, custom range) dan filter tambahan (wallet/kategori/tag/event) sesuai Bagian 26.

---

## 22. Data Model

Model logis (bukan skema server) — seluruh entity di bawah adalah **IndexedDB Object Store** yang dikelola melalui Dexie.js (lihat Bagian 23).

### 22.1 Entity: `AppSettings` (singleton, 1 record)
| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| id | string | ✓ | selalu `'app-settings'` |
| currency | string (ISO 4217) | ✓ | default `'IDR'` |
| theme | `'light'\|'dark'\|'system'` | ✓ | default `'system'` |
| language | `'id'\|'en'` | ✓ | default `'id'` |
| startDayOfWeek | `0-6` | ✓ | default `1` (Senin) |
| payday | number (1-31) | ✗ | opsional |
| dailyLimitThresholds | `{ warning: number, exceeded: number }` | ✓ | default `{70,100}` |
| schemaVersion | number | ✓ | untuk migrasi |
| dashboardLayout | string[] | ✗ | urutan widget dashboard |

### 22.2 Entity: `Wallet`
| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| id | uuid | ✓ | PK |
| name | string | ✓ | |
| type | enum(`bank,cash,ewallet,savings,credit_card,other`) | ✓ | |
| openingBalance | integer | ✓ | dalam satuan terkecil currency |
| cachedBalance | integer | ✓ | write-through cache |
| icon | string | ✓ | key ikon, bukan file eksternal |
| color | string (hex) | ✓ | |
| currency | string | ✓ | default = `AppSettings.currency` |
| isArchived | boolean | ✓ | default false |
| createdAt | datetime | ✓ | |
| sortOrder | number | ✓ | untuk drag-reorder |

Index: `isArchived`, `sortOrder`.

### 22.3 Entity: `Transaction`
| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| id | uuid | ✓ | PK |
| type | enum(`expense,income,transfer`) | ✓ | |
| amount | integer | ✓ | > 0 |
| walletId | uuid (FK Wallet) | ✓ | untuk expense/income; untuk transfer = wallet asal |
| toWalletId | uuid (FK Wallet) | expense/income: ✗, transfer: ✓ | hanya untuk transfer |
| categoryId | uuid (FK Category) | expense/income: ✓, transfer: ✗ | |
| date | date | ✓ | tanggal transaksi (bisa lampau/masa depan) |
| time | string (HH:mm) | ✗ | |
| note | string | ✗ | |
| tagIds | uuid[] | ✗ | many-to-many via array |
| eventId | uuid (FK Event) | ✗ | |
| attachmentBlobId | uuid (FK Attachment) | ✗ | |
| recurringId | uuid (FK RecurringTransaction) | ✗ | jika hasil auto-generate |
| createdAt | datetime | ✓ | |
| updatedAt | datetime | ✓ | |

Index: `date`, `walletId`, `categoryId`, `eventId`, `type`, compound `[type+date]`.

### 22.4 Entity: `Category`
| Field | Tipe | Wajib |
|---|---|---|
| id | uuid | ✓ |
| name | string | ✓ |
| type | enum(`expense,income`) | ✓ |
| icon | string | ✓ |
| color | string | ✓ |
| isDefault | boolean | ✓ |
| isArchived | boolean | ✓ |
| sortOrder | number | ✓ |

### 22.5 Entity: `Tag`
| id (uuid) | name (string, unique) | color (string) |

### 22.6 Entity: `Budget`
| Field | Tipe | Wajib |
|---|---|---|
| id | uuid | ✓ |
| name | string | ✓ |
| amountLimit | integer | ✓ |
| period | enum(`daily,weekly,biweekly,monthly,yearly,custom`) | ✓ |
| periodStart | date | ✓ |
| periodEnd | date (nullable) | conditional (lihat 12.8) |
| rolloverEnabled | boolean | ✓ |
| rolloverIncludesOverspend | boolean | ✓ |
| autoRenew | boolean | ✓ |
| isActive | boolean | ✓ |
| parentBudgetId | uuid | ✗ | untuk instance hasil auto-renew, merujuk budget induk |

### 22.7 Entity: `BudgetRule`
| id | budgetId (FK) | ruleType (`category\|wallet\|tag`) | valueId (FK sesuai ruleType) |

### 22.8 Entity: `SavingsGoal`
| id | name | targetAmount | currentAmount | deadline (nullable) | icon | color | isCompleted | createdAt |

### 22.9 Entity: `SavingsTransaction`
| id | savingsGoalId (FK) | type(`deposit\|withdrawal`) | amount | walletId (FK) | date | note |

### 22.10 Entity: `Debt`
| id | direction(`I_OWE\|OWED_TO_ME`) | personName | principalAmount | date | dueDate (nullable) | note | status(`ongoing,paid,overdue`) |

### 22.11 Entity: `DebtPayment`
| id | debtId (FK) | amount | date | linkedTransactionId (nullable FK) | note |

### 22.12 Entity: `Asset`
| id | name | type(`investment,vehicle,property,electronics,valuables,other`) | initialValue | currentValue (denormalized) | acquisitionDate | notes | isArchived |

### 22.13 Entity: `AssetValueHistory`
| id | assetId (FK) | value | date | note |

### 22.14 Entity: `Event`
| id | name | budgetAmount (nullable) | startDate (nullable) | endDate (nullable) | icon | color | isArchived |

### 22.15 Entity: `RecurringTransaction`
| id | templateType(`expense,income,transfer`) | amount | walletId | toWalletId (nullable) | categoryId (nullable) | frequency | interval | startDate | endDate (nullable) | nextOccurrenceDate | isActive | note |

### 22.16 Entity: `DailyLimitHistory`
| id | budgetId (FK) | date | limit | actual | difference | recalculated (boolean) |

### 22.17 Entity: `Attachment`
| id | blob (Blob) | mimeType | createdAt |

### 22.18 Entity: `BackupMetadata`
| id | lastBackupDate (nullable) | lastRestoreDate (nullable) | schemaVersionAtLastBackup |

### 22.19 Relationship Summary

```
Wallet 1---n Transaction (walletId, toWalletId)
Category 1---n Transaction
Tag n---n Transaction (via tagIds array)
Event 1---n Transaction
Budget 1---n BudgetRule
SavingsGoal 1---n SavingsTransaction --- n---1 Wallet
Debt 1---n DebtPayment ---0..1--- Transaction
Asset 1---n AssetValueHistory
RecurringTransaction 1---n Transaction (generated)
Budget 1---n DailyLimitHistory
Transaction 0..1---1 Attachment
```

---

## 23. IndexedDB Architecture

**Rekomendasi teknis:** gunakan **Dexie.js** sebagai wrapper IndexedDB. Alasan: Dexie menyediakan API Promise-based yang jauh lebih ergonomis daripada IndexedDB native, mendukung **versioned schema migration** bawaan (`db.version(n).stores({...})`), mendukung compound index, dan memiliki `dexie-react-hooks` (`useLiveQuery`) untuk reactive UI tanpa perlu state management manual untuk data — cocok dengan pola offline-first.

### 23.1 Pemetaan Object Store

Setiap entity di Bagian 22 = 1 object store, dengan `id` sebagai keyPath, dan index sesuai kebutuhan query (tercantum di masing-masing entity).

```
db.version(1).stores({
  appSettings: 'id',
  wallets: 'id, isArchived, sortOrder',
  transactions: 'id, date, walletId, categoryId, eventId, type, [type+date]',
  categories: 'id, type, isArchived',
  tags: 'id, name',
  budgets: 'id, isActive, periodEnd',
  budgetRules: 'id, budgetId, ruleType',
  savingsGoals: 'id, isCompleted',
  savingsTransactions: 'id, savingsGoalId, date',
  debts: 'id, direction, status',
  debtPayments: 'id, debtId, date',
  assets: 'id, isArchived',
  assetValueHistory: 'id, assetId, date',
  events: 'id, isArchived',
  recurringTransactions: 'id, isActive, nextOccurrenceDate',
  dailyLimitHistory: 'id, budgetId, date, [budgetId+date]',
  attachments: 'id',
  backupMetadata: 'id',
})
```

### 23.2 Prinsip Operasi

- **Create/Update:** selalu dibungkus `db.transaction('rw', [...stores terkait], async () => {...})` agar operasi lintas-store (mis. Transaction + update cachedBalance Wallet) bersifat atomik — jika satu langkah gagal, seluruh operasi di-rollback otomatis oleh IndexedDB.
- **Read:** query menggunakan index yang relevan (`where('date').between(start,end)`, dst.), tidak pernah full table scan untuk dataset besar.
- **Delete:** soft-consideration diterapkan pada entity yang direferensikan entity lain (Category, Wallet, Tag) — lihat Bagian 31. Entity yang murni milik pengguna tanpa referensi luar (Transaction, DebtPayment, SavingsTransaction) dihapus hard-delete.

### 23.3 Skema Migrasi

- Setiap perubahan struktur data menaikkan `db.version(n)` di Dexie dengan definisi `stores` baru + fungsi `.upgrade(tx => {...})` untuk transformasi data lama ke format baru.
- `AppSettings.schemaVersion` disimpan terpisah dari versi Dexie internal, digunakan khusus untuk validasi kompatibilitas **file backup** (lihat Bagian 26).
- Migrasi dijalankan otomatis oleh Dexie saat `db.open()` dipanggil pertama kali setelah update aplikasi. Jika migrasi gagal (exception), aplikasi menampilkan halaman **Recovery Mode** (lihat 26.5) alih-alih crash total.

---

## 24. PWA Architecture

### 24.1 Manifest

`manifest.json` (atau `manifest.webmanifest` via Next.js App Router) mendefinisikan:
```
name, short_name, icons (192, 512, maskable), start_url: '/',
display: 'standalone', background_color, theme_color,
orientation: 'portrait'
```

### 24.2 iOS-specific Requirements

Karena target utama Safari iPhone, sertakan meta tag khusus di `<head>` (via Next.js `metadata`/`generateMetadata` atau `<Head>`):
```
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Pundi" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<link rel="apple-touch-startup-image" ... /> untuk beberapa ukuran splash screen iPhone
```
Catatan: iOS Safari **tidak** mendukung Web App Manifest splash screen secara otomatis — splash screen custom harus disediakan lewat `apple-touch-startup-image` per ukuran device, atau diterima menggunakan native launch (warna solid background_color) sebagai fallback yang lebih sederhana untuk MVP.

### 24.3 Service Worker & Caching Strategy

Rekomendasi: gunakan `next-pwa` (berbasis Workbox) untuk generate service worker otomatis dari build Next.js.

| Resource | Strategy | Alasan |
|---|---|---|
| App shell (JS/CSS/HTML) | Cache First, versioned by build hash | Aset statis tidak berubah antar-deploy yang sama |
| Fonts & icons | Cache First | Statis |
| Halaman Next.js (RSC/route) | Stale-While-Revalidate | Selalu bisa dibuka offline, update saat online tanpa blocking |
| API eksternal opsional (mis. exchange rate) | Network First dengan fallback cache lama | Data boleh sedikit basi saat offline |
| Data pengguna (transaksi, dsb.) | **Tidak melalui service worker** | Seluruhnya read/write langsung ke IndexedDB di client, bukan network request |

### 24.4 Update Flow

Service worker baru terdeteksi → tampilkan toast non-intrusive "Update tersedia, muat ulang untuk memperbarui" → pengguna tap → `skipWaiting()` + reload. Update **tidak pernah** memaksa reload otomatis tanpa aksi pengguna (mencegah kehilangan input form yang sedang diisi).

---

## 25. Offline Strategy

| Pertanyaan | Jawaban |
|---|---|
| Bagaimana data disimpan? | IndexedDB via Dexie, per object store sesuai Bagian 23. |
| Bagaimana data dimuat? | `useLiveQuery` (Dexie React Hooks) melakukan query langsung ke IndexedDB saat komponen mount, reaktif terhadap perubahan tanpa perlu refetch manual. |
| Bagaimana data di-update? | Melalui fungsi service-layer yang membungkus operasi dalam Dexie transaction atomik (Bagian 23.2), dipanggil langsung dari client, tanpa request ke server manapun. |
| Bagaimana data dihapus? | Sama seperti update — operasi Dexie transaction, dengan pre-check referential integrity (Bagian 31). |
| Bagaimana data dimigrasikan? | Dexie versioned migration (Bagian 23.3), berjalan otomatis saat app load setelah update. |
| Bagaimana backup/restore dilakukan? | Manual export/import file JSON (Bagian 26) — bukan sinkronisasi otomatis. |

**Kebutuhan internet hanya untuk:**
1. Pemuatan pertama kali (download app shell + precache service worker).
2. Update aplikasi (fetch build baru).
3. Fitur opsional yang secara eksplisit butuh eksternal data (mis. fetch exchange rate terbaru — dengan fallback ke rate tersimpan terakhir jika offline, lihat Bagian 34 Currency).

Tidak ada fitur inti (transaksi, wallet, budget, savings, debt, asset, event, reports) yang membutuhkan internet setelah pemuatan pertama berhasil dan service worker ter-install.

---

## 26. Backup & Restore

### 26.1 Format Export

File JSON tunggal berisi:
```json
{
  "meta": {
    "app": "pundi",
    "schemaVersion": 1,
    "exportedAt": "2026-08-29T10:00:00Z",
    "checksum": "sha256-..."
  },
  "data": {
    "appSettings": {...},
    "wallets": [...],
    "transactions": [...],
    "categories": [...],
    "tags": [...],
    "budgets": [...],
    "budgetRules": [...],
    "savingsGoals": [...],
    "savingsTransactions": [...],
    "debts": [...],
    "debtPayments": [...],
    "assets": [...],
    "assetValueHistory": [...],
    "events": [...],
    "recurringTransactions": [...],
    "dailyLimitHistory": [...]
  }
}
```
Catatan: `Attachment` (Blob gambar struk) disertakan sebagai **base64-encoded string** di dalam masing-masing record attachment agar tetap portable dalam satu file JSON (dengan trade-off ukuran file lebih besar — didokumentasikan ke pengguna saat export jika ukuran > threshold, mis. 20MB, dengan opsi "export tanpa lampiran").

### 26.2 Proses Export

1. Baca seluruh object store dalam satu Dexie read-transaction (snapshot konsisten).
2. Hitung checksum (SHA-256 dari `JSON.stringify(data)`) untuk deteksi korupsi saat restore.
3. Trigger download file `pundi-backup-YYYYMMDD-HHmm.json` via Blob + `<a download>`.

### 26.3 Proses Restore (Import)

1. Pengguna memilih file → dibaca sebagai teks → `JSON.parse`.
2. **Validasi schema** menggunakan Zod (atau setara) terhadap struktur `meta` dan setiap array `data.*` — field wajib, tipe data, referential ID format.
3. **Validasi checksum** (opsional tapi direkomendasikan) untuk deteksi file yang dimodifikasi/corrupt.
4. Jika `meta.schemaVersion` lebih lama dari versi aplikasi saat ini → jalankan **migration transform** (fungsi murni per versi, sama seperti Dexie upgrade tapi dioperasikan di level data JSON) sebelum data dimasukkan ke IndexedDB.
5. Jika **valid**: tampilkan preview ringkas ("142 transaksi, 5 wallet, 3 budget akan di-import") dan pilihan **Replace All** (hapus data existing lalu import) atau **Merge** (V1 — gabungkan berdasarkan ID, konflik ID existing menang/diskip, ditandai untuk review manual).
6. Seluruh proses tulis ke IndexedDB dibungkus **satu Dexie transaction besar** — jika ada error di tengah proses, seluruh perubahan di-rollback, **data existing tidak tersentuh**.
7. Jika file **tidak valid** (gagal validasi schema/checksum): tampilkan pesan error spesifik ("Baris ke-N pada 'transactions' tidak memiliki field 'amount' yang valid") dan **hentikan proses tanpa mengubah data apapun**.

### 26.4 Reminder Backup

Aplikasi menampilkan pengingat non-intrusive (banner dismissible di Settings/Dashboard) jika `BackupMetadata.lastBackupDate` lebih dari 30 hari yang lalu — mendorong kebiasaan backup tanpa memaksa.

### 26.5 Recovery Mode (Migrasi/DB Gagal Total)

Jika `db.open()` gagal (exception tidak tertangani oleh migrasi normal), aplikasi masuk **Recovery Mode**: halaman minimal yang **tidak bergantung pada schema terbaru**, hanya menawarkan: (a) *"Coba lagi"*, (b) *"Export data mentah apa adanya"* (baca IndexedDB versi lama secara raw, best-effort), (c) *"Reset aplikasi"* (dengan peringatan tegas). Prinsip: **jangan pernah otomatis menghapus database** hanya karena satu proses migrasi gagal.

---

## 27. Security & Privacy

- Tidak ada data transaksi, saldo, atau informasi finansial personal yang dikirim ke server manapun (termasuk tidak ada analytics pihak ketiga yang mengirim payload berisi data finansial; jika ada analytics produk, batasi hanya ke event non-sensitif seperti "screen_viewed", bukan data nominal).
- Tidak ada sistem akun/login pada MVP/V1 → tidak ada password untuk dibobol, tidak ada credential yang bisa bocor dari sisi Pundi.
- **File backup bersifat sensitif** (berisi seluruh data finansial dalam bentuk plain JSON). Pengguna diberi peringatan eksplisit saat export: *"File ini berisi seluruh data keuangan kamu. Simpan di tempat aman."*
- **Rekomendasi V1/Future:** opsi **Encrypt Backup** menggunakan Web Crypto API (AES-GCM) dengan passphrase yang diinput pengguna saat export; passphrase yang sama diperlukan saat import. Passphrase **tidak pernah disimpan** di mana pun oleh aplikasi — jika lupa, backup tidak dapat dipulihkan (didokumentasikan jelas ke pengguna).
- Karena tanpa autentikasi, siapa pun yang memiliki akses fisik ke perangkat/browser pengguna dapat membuka aplikasi dan melihat data. **Rekomendasi Future:** app-level PIN/biometric lock (menggunakan WebAuthn jika tersedia) sebagai lapisan tambahan, bukan pengganti keamanan device itu sendiri.

---

## 28. UX Requirements

- **Minim langkah untuk mencatat transaksi**: FAB selalu terlihat di semua halaman utama → tap → pilih tipe → form singkat dengan default cerdas (wallet terakhir dipakai, tanggal hari ini, kategori paling sering dipakai muncul di atas) → simpan.
- **Feedback instan**: setelah transaksi disimpan, saldo dan daily limit di halaman manapun harus terlihat ter-update tanpa reload (via reactive query).
- **Desain minim dekorasi**: hindari card bertumpuk berlebihan; prioritaskan angka dan status yang jelas dibaca dalam < 2 detik.
- **Non-punitive tone**: pesan saat over budget/limit bersifat informatif, bukan menghakimi (mis. "Kamu sudah melewati limit hari ini sebesar Rp16.667" — bukan "Kamu boros!").
- **Empty states** yang membantu (mis. belum ada wallet → CTA jelas "Buat wallet pertamamu").

---

## 29. Responsive Requirements

- **Mobile-first**, breakpoint dasar dirancang untuk 320px–480px (prioritas iPhone SE s.d. iPhone Pro Max) sebagai layout default (bukan hasil "menyusutkan" desktop).
- Navigasi utama: **Bottom Navigation** (Home, Transactions, Budget, Reports, More) + **Floating Action Button** di atas bottom nav untuk Expense/Income/Transfer (expandable speed-dial saat ditekan).
- Tablet (≥768px) dan Desktop (≥1024px): layout beralih ke sidebar navigation + multi-kolom (mis. dashboard 2-3 kolom), tetap nyaman digunakan tapi bukan prioritas desain utama — gunakan CSS breakpoint Tailwind (`sm/md/lg`) untuk progressive enhancement dari base mobile layout.
- Safe-area insets (`env(safe-area-inset-*)`) wajib diterapkan pada bottom navigation dan FAB agar tidak tertutup home indicator iPhone.

---

## 30. Accessibility

- Kontras teks minimal memenuhi WCAG AA (4.5:1 untuk teks normal, 3:1 untuk teks besar/ikon).
- Touch target minimal **44×44px** (standar iOS HIG) untuk seluruh elemen interaktif.
- Semua form field memiliki `<label>` terasosiasi (bukan hanya placeholder).
- Status (SAFE/WARNING/EXCEEDED, income/expense) selalu disertai **indikator teks/ikon**, tidak hanya warna (color-blind friendly).
- Struktur heading semantik (`h1`-`h3`) konsisten per halaman untuk navigasi screen reader.
- Seluruh interaksi (termasuk FAB, modal, chart) dapat diakses via keyboard di mode desktop (`tab`, `enter`, `esc` untuk menutup modal).

---

## 31. Edge Cases

| # | Edge Case | Solusi |
|---|---|---|
| 1 | Budget Rp0 | Diperbolehkan disimpan sebagai "tracking only"; `dailyLimit` selalu 0, status langsung `OVER_BUDGET` begitu ada expense apapun. Validasi form memperingatkan (bukan blocking) jika amountLimit = 0. |
| 2 | Budget sudah habis (remaining = 0 tepat) | `dailyLimit = 0`, status `EXCEEDED` jika ada tambahan expense, `ON_TRACK` (tepi) jika tidak ada tambahan hingga akhir periode. |
| 3 | Budget over-limit | Lihat 12.5 — dailyLimit clamp 0, tampilkan nominal kelebihan. |
| 4 | Remaining budget negatif | Sama seperti #3; ditampilkan sebagai "Over Rp{X}" bukan "-Rp{X}" agar tidak ambigu. |
| 5 | Hari terakhir budget | Lihat 12.4 — `remainingDays = 1`. |
| 6 | Budget dimulai di tengah bulan | `periodStart` = tanggal pilihan user; `periodEnd` tetap dihitung sesuai jenis period (mis. monthly → akhir bulan berjalan, bukan +30 hari), sehingga periode pertama boleh lebih pendek dari 1 bulan penuh. |
| 7 | Budget berakhir di tengah bulan (custom) | Diperbolehkan; `remainingDays` dihitung sampai `periodEnd` custom tersebut, bukan akhir bulan kalender. |
| 8 | Leap year | Perhitungan `remainingDays` menggunakan library date (`date-fns`) yang aware terhadap kalender aktual, termasuk 29 Februari — tidak ada hardcode 365/366. |
| 9 | Februari 28/29 | `periodEnd` bulanan dihitung via `endOfMonth()` (date-fns), otomatis benar untuk Februari kabisat/non-kabisat. |
| 10 | User mengganti tanggal perangkat | Sistem tidak melakukan validasi/koreksi tanggal device (di luar kendali aplikasi web); seluruh kalkulasi tetap konsisten berdasarkan `Date.now()` device saat itu. Didokumentasikan sebagai batasan yang diketahui (known limitation), bukan bug. |
| 11 | Transaksi tanggal masa lalu | Diperbolehkan penuh; memicu rekalkulasi `eligibleExpenses` budget yang periodenya mencakup tanggal tsb, serta `DailyLimitHistory` pada tanggal tsb ditandai `recalculated: true` (Bagian 12.11). |
| 12 | Edit transaksi lama | Efek saldo lama dibatalkan → efek baru diterapkan (Bagian 14); budget & history terkait dihitung ulang. |
| 13 | Hapus transaksi lama | Efek saldo dibatalkan; jika terhubung ke DebtPayment/SavingsTransaction, entitas terkait tersebut **tidak otomatis terhapus** — ditandai `linkedTransactionId: null` dan pengguna diberi notifikasi untuk meninjau. |
| 14 | Hapus kategori yang sudah dipakai | **Tidak diizinkan hard-delete.** Sistem menawarkan: (a) *Archive* (kategori disembunyikan dari pilihan baru tapi tetap tampil di transaksi lama), atau (b) *Reassign* — pindahkan seluruh transaksi ke kategori lain sebelum kategori dihapus. |
| 15 | Hapus wallet yang punya transaksi | **Tidak diizinkan hard-delete** jika ada transaksi terkait. Tawarkan *Archive* wallet. Hard-delete hanya diizinkan untuk wallet kosong (0 transaksi). |
| 16 | Transfer ke wallet yang sama | Divalidasi & **ditolak** di form level ("Wallet asal dan tujuan tidak boleh sama") sebelum submit. |
| 17 | Income negatif | Divalidasi & ditolak (`amount` harus > 0; arah income/expense ditentukan oleh `type`, bukan tanda angka). |
| 18 | Expense negatif | Sama seperti #17. |
| 19 | Decimal currency | Amount disimpan sebagai integer di satuan terkecil (Bagian 14); untuk currency berdesimal (USD/EUR), form menerima input desimal lalu dikonversi ×10^decimalDigits sebelum disimpan. |
| 20 | Nominal sangat besar | Gunakan tipe `number` JS standar (aman hingga 2^53−1 ≈ 9 kuadriliun satuan terkecil — jauh melebihi kebutuhan realistis); tampilkan formatting ribuan agar tetap terbaca. |
| 21 | Dua budget overlap (mis. dua Category Budget Food dengan periode tumpang tindih) | Diizinkan (tidak ada exclusivity constraint); UI menampilkan badge peringatan "Ada budget lain yang tumpang tindih untuk kategori ini" saat pembuatan budget baru terdeteksi overlap. |
| 22 | Satu transaksi masuk beberapa budget | Diizinkan by design (Bagian 13.3) — satu expense Food masuk hitungan Category Budget "Food" **dan** Overall Budget sekaligus, independen. |
| 23 | Offline (saat pertama buka tanpa internet) | Jika app shell belum pernah ter-cache, aplikasi **tidak dapat dimuat** (butuh 1x load online pertama) — ditampilkan pesan jelas jika `fetch` awal gagal. Setelah 1x berhasil dimuat & service worker terinstall, seluruh fitur inti berjalan offline penuh. |
| 24 | IndexedDB gagal terbuka/tidak didukung | Deteksi via feature check saat boot; jika gagal, tampilkan halaman fallback menjelaskan browser/mode tidak didukung, sarankan keluar dari Private Browsing atau update browser. |
| 25 | Backup file corrupt | Ditolak di tahap validasi (Bagian 26.3 langkah 2-3); data existing tidak tersentuh; pesan error spesifik ditampilkan. |
| 26 | Restore backup versi schema lama | Migration transform dijalankan otomatis sebelum import (Bagian 26.3 langkah 4); jika versi backup lebih baru dari aplikasi (downgrade case), tolak import dengan pesan "Update aplikasi terlebih dahulu". |
| 27 | Browser storage penuh (quota exceeded) | Tangkap exception `QuotaExceededError` dari Dexie; tampilkan pesan aktionable ("Penyimpanan penuh — hapus lampiran lama atau bebaskan storage browser") tanpa membuat aplikasi crash; operasi yang gagal di-rollback otomatis oleh transaction. |
| 28 | Safari Private Browsing | Safari private mode membatasi/mempartisi IndexedDB dan menghapusnya saat sesi berakhir. Deteksi kondisi ini (mis. quota sangat kecil) dan tampilkan **peringatan proaktif** saat pertama dibuka: "Kamu sedang di mode Private — data tidak akan tersimpan permanen. Gunakan mode normal." |
| 29 | User menghapus website data / clear browser storage | Data hilang permanen (tidak dapat dipulihkan oleh aplikasi). Mitigasi: reminder backup berkala (Bagian 26.4) + dokumentasi jelas di Settings tentang risiko ini. |
| 30 | User ganti perangkat | Data tidak otomatis pindah (Bagian 5). Solusi resmi: export backup di perangkat lama → import di perangkat baru. Didokumentasikan jelas di Settings/onboarding. |

---

## 32. User Stories

- Sebagai pengguna, saya ingin **membuat wallet baru**, agar saya bisa memisahkan saldo cash dan rekening bank saya.
- Sebagai pengguna, saya ingin **menambahkan income**, agar pemasukan saya tercatat dan saldo wallet saya bertambah otomatis.
- Sebagai pengguna, saya ingin **menambahkan expense**, agar saya tahu ke mana uang saya pergi.
- Sebagai pengguna, saya ingin **melakukan transfer antar wallet**, agar saya bisa mencatat perpindahan uang cash ke rekening tanpa dianggap sebagai pengeluaran.
- Sebagai pengguna, saya ingin **membuat budget**, agar saya punya batas jelas untuk kategori pengeluaran tertentu.
- Sebagai pengguna, saya ingin **melihat daily spending limit**, agar saya tahu berapa yang aman saya keluarkan hari ini tanpa perlu menghitung manual.
- Sebagai pengguna, saya ingin **melihat sisa budget**, agar saya bisa merencanakan pengeluaran sampai akhir periode.
- Sebagai pengguna, saya ingin **membuat target tabungan**, agar saya termotivasi menabung untuk tujuan tertentu dengan rekomendasi nominal yang jelas.
- Sebagai pengguna, saya ingin **mencatat hutang saya**, agar saya tidak lupa kewajiban pembayaran.
- Sebagai pengguna, saya ingin **mencatat piutang saya**, agar saya tidak lupa uang yang harus ditagih.
- Sebagai pengguna, saya ingin **membuat transaksi berulang**, agar saya tidak perlu mencatat gaji/kos/tagihan setiap bulan secara manual.
- Sebagai pengguna, saya ingin **membuat event**, agar saya bisa melacak total biaya untuk proyek/liburan tertentu.
- Sebagai pengguna, saya ingin **melihat laporan keuangan**, agar saya memahami pola pemasukan dan pengeluaran saya.
- Sebagai pengguna, saya ingin **melakukan backup data**, agar saya tidak kehilangan data jika terjadi sesuatu pada perangkat saya.
- Sebagai pengguna, saya ingin **melakukan restore data**, agar saya bisa memulihkan data di perangkat baru.
- Sebagai pengguna, saya ingin **menggunakan aplikasi tanpa internet**, agar saya tetap bisa mencatat transaksi kapan pun dan di mana pun.
- Sebagai pengguna, saya ingin **menginstall aplikasi ke Home Screen iPhone**, agar aplikasi terasa seperti aplikasi native tanpa harus lewat App Store.

---

## 33. Acceptance Criteria

**AC-1 — Daily Spending Limit (dasar)**
```
Given budget = Rp1.000.000, eligibleExpenses = Rp200.000, remainingDays = 24
When user membuka halaman Budget Detail
Then system menampilkan:
  - Remaining Budget = Rp800.000
  - Daily Spending Limit = Rp33.333 (dibulatkan)
```

**AC-2 — Daily Spending Limit (rekalkulasi setelah expense baru)**
```
Given kondisi AC-1
When user menambahkan expense Rp50.000 pada hari ini yang eligible terhadap budget tsb
Then system harus:
  - memperbarui eligibleExpenses menjadi Rp250.000
  - memperbarui remainingBudget menjadi Rp750.000
  - menampilkan Daily Status = EXCEEDED (karena Rp50.000 > Rp33.333 limit hari ini)
  - menghitung ulang Daily Spending Limit untuk BESOK menggunakan remainingDays = 23
```

**AC-3 — Overspending / Over Budget**
```
Given budgetLimit = Rp500.000, eligibleExpenses = Rp600.000
When user membuka halaman Budget Detail
Then system menampilkan:
  - status Overall = OVER_BUDGET
  - pesan "Kamu sudah melewati budget sebesar Rp100.000"
  - Daily Spending Limit = Rp0
```

**AC-4 — Multi-wallet Balance**
```
Given Wallet A openingBalance = Rp1.000.000, tidak ada mutasi lain
When user menambahkan expense Rp100.000 dari Wallet A
Then Wallet A balance menjadi Rp900.000, dan Total Balance dashboard berkurang Rp100.000
```

**AC-5 — Transfer tidak memengaruhi cash flow**
```
Given user melakukan transfer Rp200.000 dari BCA ke DANA
When user membuka Report Cash Flow bulan ini
Then transfer TIDAK muncul sebagai income maupun expense pada report tersebut
And saldo BCA berkurang Rp200.000, saldo DANA bertambah Rp200.000
```

**AC-6 — Savings Goal Progress**
```
Given SavingsGoal target = Rp15.000.000, current = Rp5.000.000, deadline 30 Juni 2027 (300 hari lagi dari hari ini)
When user membuka halaman Savings Goal
Then system menampilkan:
  - progress = 33.3%
  - remaining = Rp10.000.000
  - recommendedPerDay ≈ Rp33.333
```

**AC-7 — Hapus Kategori yang Terpakai**
```
Given kategori "Food" digunakan oleh 20 transaksi
When user mencoba menghapus kategori "Food"
Then system MENOLAK hard-delete dan menampilkan opsi Archive atau Reassign
And 20 transaksi tersebut tidak kehilangan data kategori
```

**AC-8 — Backup Restore Gagal Validasi**
```
Given user meng-import file backup yang tidak memiliki field wajib "amount" pada salah satu transaksi
When proses validasi schema dijalankan
Then import DIBATALKAN, data existing TIDAK berubah sama sekali
And system menampilkan pesan error yang menyebutkan lokasi masalah
```

**AC-9 — Offline Core Functionality**
```
Given aplikasi sudah pernah dimuat sebelumnya dan service worker ter-install
When perangkat dalam mode Airplane Mode
Then user tetap dapat: membuka dashboard, melihat transaksi, membuat transaksi baru,
     mengedit/menghapus transaksi, melihat budget & daily limit, tanpa error jaringan
```

**AC-10 — Install PWA di iPhone**
```
Given user membuka aplikasi via Safari di iPhone
When user memilih Share → Add to Home Screen
Then ikon aplikasi muncul di Home Screen dengan nama & icon custom
And saat dibuka dari Home Screen, aplikasi tampil dalam mode standalone (tanpa address bar Safari)
```

---

## 34. MVP Scope

Prioritas sesuai instruksi produk (Transaction → Wallet → Budget → Daily Spending Limit → Dashboard → Reports → Local Storage → Backup/Restore):

- ✅ Transaction: Expense, Income, Transfer (CRUD penuh, tanpa attachment)
- ✅ Wallet: CRUD, tipe wallet, saldo otomatis, archive
- ✅ Category: default categories + CRUD dasar (archive, tanpa reassign kompleks — cukup blokir delete jika terpakai)
- ✅ Budget: overall + category budget, periode daily/weekly/monthly, **Daily Spending Limit penuh sesuai Bagian 12**
- ✅ Dashboard: Total Balance, Income, Expense, Net Cash Flow, Daily Spending Limit, Recent Transactions (layout tetap, belum customizable)
- ✅ Reports dasar: Cash Flow, Expense by Category, Monthly Summary
- ✅ IndexedDB (Dexie) sebagai storage, offline-first penuh untuk seluruh fitur di atas
- ✅ Backup (export JSON) & Restore (import JSON) dengan validasi schema
- ✅ PWA installable + offline caching + responsive mobile-first
- ✅ Settings dasar: currency, theme, reset data

## 35. V1 Scope

- Tag system + filter berdasarkan tag
- Budget by wallet/tag (selain kategori), rollover behavior
- Savings Goal lengkap (deposit/withdrawal, rekomendasi menabung)
- Debt & Receivable lengkap (partial payment, linked transaction)
- Recurring Transaction
- Event tracking
- Calendar view
- Search & filter lanjutan (date range, amount range, multi-filter kombinasi)
- Reports lanjutan: Daily Spending, Budget Performance, Daily Limit Performance, Wallet Report, Savings Report
- Dashboard customizable (reorder/hide widget)
- Attachment/receipt pada transaksi
- Threshold Daily Limit dapat dikonfigurasi
- Multi-currency dengan exchange rate manual/fetch opsional
- Financial Planner (Planned vs Actual)
- Language switch (ID/EN)

## 36. Future Scope

- Asset tracking + value history + gain/loss
- Encrypted backup (passphrase-based)
- App-level PIN/biometric lock
- Cloud backup opsional (mis. sinkron ke penyimpanan pribadi pengguna seperti iCloud Drive/Google Drive via file picker — bukan server milik aplikasi)
- Multi-device sync (jika suatu saat dibutuhkan, harus tetap opsional dan tidak mewajibkan akun terpusat)
- Widget iOS (jika platform mendukung dari PWA)
- Shared/family budgeting
- Data export ke CSV/Excel untuk keperluan pajak/akuntansi

---

## 37. Performance Requirements

- **Initial load:** app shell tampil (skeleton/dashboard kosong) dalam < 2 detik pada koneksi 4G setelah cache terisi (< 1 detik untuk kunjungan berikutnya berkat service worker cache-first).
- **Transaction save:** operasi simpan ke IndexedDB dan update UI harus terasa **instan** (< 100ms perceived latency) — gunakan optimistic UI update yang langsung mencerminkan hasil sebelum konfirmasi write selesai (aman karena `useLiveQuery` akan otomatis konsisten begitu write selesai).
- **Dashboard rendering:** tidak boleh melakukan agregasi penuh seluruh riwayat transaksi setiap render; gunakan index tanggal untuk membatasi query ke periode aktif, dan cache saldo wallet (Bagian 15) alih-alih rekalkulasi penuh setiap saat.
- **Chart rendering:** gunakan library ringan (Recharts/Chart.js) dengan data yang sudah di-agregasi di layer JS (bukan re-agregasi di setiap re-render); hindari re-render chart saat state tidak relevan berubah (memoization).
- **List transaksi panjang:** terapkan **virtualization** (mis. `react-virtual`/`react-window`) atau **pagination berbasis cursor** (IndexedDB `openCursor` dengan index `date`) begitu jumlah transaksi melebihi ~500 per view, agar scrolling tetap mulus di iPhone.
- **Bundle size:** manfaatkan Next.js code-splitting per rute agar halaman Reports (yang memuat chart library) tidak membebani initial load Dashboard.

---

## 38. Technical Constraints

- **Framework:** Next.js (App Router) + React + TypeScript — direkomendasikan **static export / client-heavy rendering** untuk sebagian besar halaman (karena tidak ada server database, sebagian besar logic berjalan di client); Next.js tetap berguna untuk routing, code-splitting, dan tooling build/PWA.
- **Styling:** Tailwind CSS.
- **Storage:** IndexedDB via Dexie.js (primary), `localStorage` hanya untuk preferensi ringan non-kritis yang perlu dibaca sebelum IndexedDB siap (mis. `theme` awal untuk mencegah flash-of-wrong-theme).
- **State management:** kombinasi `useLiveQuery` (Dexie) untuk data domain (reaktif langsung dari DB) + state management ringan (Zustand atau React Context) untuk UI state non-persisten (mis. modal terbuka, filter sementara).
- **Validation:** Zod untuk validasi form dan validasi schema backup.
- **Date handling:** date-fns (timezone-aware, leap-year safe, tidak menghitung manual).
- **Charting:** Recharts atau Chart.js.
- **PWA tooling:** next-pwa (Workbox-based).
- **Tidak ada:** MySQL, PostgreSQL, MongoDB, Firebase, Supabase, server database, authentication server, backend database — sesuai instruksi produk.
- **Browser target:** Safari iOS (utama), Chrome/Edge/Firefox modern (sekunder).

---

## 39. Risks

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Safari iOS membatasi kapasitas & retensi IndexedDB (terutama Private Mode) | Kehilangan data | Deteksi & peringatan proaktif (Edge Case #28), reminder backup berkala |
| Pengguna menghapus browser data tanpa backup | Kehilangan data permanen | Reminder backup, dokumentasi jelas saat onboarding |
| Kompleksitas formula Daily Spending Limit menimbulkan bug kalkulasi | Rekomendasi salah, merusak kepercayaan pengguna | Unit test menyeluruh untuk seluruh edge case Bagian 12 & 31, gunakan fungsi pure/terisolasi untuk formula |
| Tidak ada sinkronisasi multi-device dapat dianggap kekurangan oleh sebagian pengguna | Adopsi terbatas untuk kasus pengguna multi-device | Dikomunikasikan jelas sebagai trade-off privasi sejak awal (positioning produk) |
| iOS Safari memiliki dukungan PWA yang lebih terbatas dibanding Android (mis. push notification terbatas) | Fitur notifikasi/reminder terbatas | Rancang fitur inti agar tidak bergantung pada push notification |

---

## 40. Open Questions

1. Apakah dibutuhkan opsi **merge** saat restore backup di MVP, atau cukup **replace all** saja untuk MVP dan merge ditunda ke V1? *(Rekomendasi: replace all saja di MVP, lebih sederhana dan lebih sedikit edge case konflik ID.)*
2. Apakah Daily Spending Limit perlu ditampilkan per-kategori sekaligus di Dashboard (bukan hanya Overall), atau cukup satu ringkasan utama di Dashboard dan detail per kategori di halaman Budget? *(Rekomendasi: satu ringkasan utama di Dashboard untuk kejelasan, detail lengkap di halaman Budget.)*
3. Apakah exchange rate (multi-currency) di V1 perlu fetch otomatis dari API eksternal, atau cukup input manual oleh pengguna? *(Rekomendasi: manual dulu di V1, fetch otomatis opsional di Future — mengurangi ketergantungan internet.)*
4. Apakah dibutuhkan konfirmasi eksplisit setiap kali recurring transaction ter-generate (berpotensi mengganggu jika banyak), atau cukup notifikasi ringkas setelahnya? *(Perlu keputusan Product Owner berdasarkan riset pengguna lanjutan.)*

---

## 41. Development Roadmap

**Fase 0 — Foundation (1-2 minggu)**
Setup Next.js + TypeScript + Tailwind, setup Dexie schema v1, setup next-pwa & manifest, setup design token dasar (lihat catatan desain di Bagian 28-30).

**Fase 1 — MVP Core (3-5 minggu)**
Wallet CRUD → Transaction CRUD (expense/income/transfer) → Category default + CRUD dasar → Dashboard dasar → offline verification di iPhone Safari.

**Fase 2 — Budget & Daily Spending Limit (2-3 minggu)**
Budget CRUD, BudgetRule, implementasi penuh algoritma Bagian 12 dengan unit test edge case, integrasi ke Dashboard & halaman Budget Detail.

**Fase 3 — Reports Dasar & Backup/Restore (2 minggu)**
Cash Flow, Expense by Category, Monthly Summary; Export/Import JSON dengan validasi Zod; Recovery Mode dasar.

**Fase 4 — Polish MVP & Release (1-2 minggu)**
Accessibility pass, performance pass (Bagian 37), PWA install flow testing di berbagai device iPhone, QA seluruh Acceptance Criteria Bagian 33.

**Fase 5 — V1 (setelah MVP stabil & feedback awal)**
Tag, Savings Goal, Debt/Receivable, Recurring Transaction, Event, Calendar View, Reports lanjutan, Dashboard customizable, Attachment.

**Fase 6 — Future**
Asset tracking, Encrypted backup, PIN/biometric lock, opsi cloud backup pribadi pengguna, multi-currency lanjutan, Financial Planner.

---

*Akhir dokumen. Dokumen ini adalah spesifikasi produk & fungsional — implementasi kode dilakukan pada fase development terpisah mengacu pada dokumen ini.*
