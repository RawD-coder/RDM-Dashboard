const API_URL =
"https://script.google.com/macros/s/AKfycbxEZLydgr_7WNStW2mmiFTNVxFqMLQ8ViZOV8GrkL03c_qYljGqam_oukKr1V-yMHW1hw/exec";

let salesChart = null;
let topBooksChart = null;

function rupiah(num) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(num || 0);
}

document.addEventListener("DOMContentLoaded", () => {

    const exportBtn = document.getElementById("exportPDF");

    if (exportBtn) {

        exportBtn.addEventListener("click", () => {

            html2pdf()
                .set({
                    margin: 10,
                    filename: "laporan-penjualan.pdf",
                    html2canvas: {
                        scale: 2
                    }
                })
                .from(document.body)
                .save();

        });

    }

    loadData();

});

async function loadData() {

    try {

        const response = await fetch(API_URL);

        const data = await response.json();

        console.log("DATA:", data);

        processData(data);

    } catch (err) {

        console.error(err);

        alert("Gagal mengambil data dari Google Sheets");

    }

}

function processData(data) {

    const general = data.general || [];
    const monthly = data.monthly || [];

    if (!general.length || !monthly.length) {
        alert("Data kosong");
        return;
    }

    //--------------------------------
    // KPI
    //--------------------------------

    const totalRow = general[57];

    const revenue = Number(totalRow?.[10] || 0);
    const profit = Number(totalRow?.[11] || 0);

    const books = general.slice(4, 57);

    document.getElementById("revenue").textContent =
        rupiah(revenue);

    document.getElementById("profit").textContent =
        rupiah(profit);

    document.getElementById("titleCount").textContent =
        books.length;

    const bestSeller = books.reduce((best, current) => {

        const sold = Number(current[4] || 0);

        if (sold > best.sold) {
            return {
                sold,
                title: current[2]
            };
        }

        return best;

    }, {
        sold: 0,
        title: "-"
    });

    document.getElementById("topSeller").textContent =
        bestSeller.title;

    //--------------------------------
    // Revenue Bulanan
    //--------------------------------

    const totalMonthly = monthly[54];

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des"
    ];

    const revenueData = [
        Number(totalMonthly[4] || 0),
        Number(totalMonthly[6] || 0),
        Number(totalMonthly[8] || 0),
        Number(totalMonthly[10] || 0),
        Number(totalMonthly[12] || 0),
        Number(totalMonthly[14] || 0),
        Number(totalMonthly[16] || 0),
        Number(totalMonthly[18] || 0),
        Number(totalMonthly[20] || 0),
        Number(totalMonthly[22] || 0),
        Number(totalMonthly[24] || 0),
        Number(totalMonthly[26] || 0)
    ];

    buildMonthFilter(months, revenueData);

    renderRevenueChart(months, revenueData);

    //--------------------------------
    // Ranking Buku
    //--------------------------------

    const ranking = books
        .map(book => ({
            code: book[1],
            title: book[2],
            sold: Number(book[4] || 0),
            revenue: Number(book[10] || 0),
            profit: Number(book[11] || 0)
        }))
        .sort((a, b) => b.sold - a.sold);

    renderTopBooks(ranking);

    renderTable(ranking);

}

function buildMonthFilter(months, revenueData) {

    const select =
        document.getElementById("monthFilter");

    select.innerHTML = "";

    select.innerHTML +=
        `<option value="all">Semua Bulan</option>`;

    months.forEach((month, index) => {

        select.innerHTML +=
            `<option value="${index}">
                ${month}
             </option>`;

    });

    select.onchange = function () {

        if (this.value === "all") {

            renderRevenueChart(
                months,
                revenueData
            );

        } else {

            const i = Number(this.value);

            renderRevenueChart(
                [months[i]],
                [revenueData[i]]
            );

        }

    };

}

function renderRevenueChart(labels, values) {

    const ctx =
        document.getElementById("salesChart");

    if (!ctx) return;

    if (salesChart)
        salesChart.destroy();

    salesChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels,

            datasets: [{

                label: "Revenue",

                data: values

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}

function renderTopBooks(ranking) {

    const ctx =
        document.getElementById("topBooksChart");

    if (!ctx) return;

    if (topBooksChart)
        topBooksChart.destroy();

    const top10 =
        ranking.slice(0, 10);

    topBooksChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels:
                top10.map(x => x.title),

            datasets: [{

                label: "Qty Sold",

                data:
                    top10.map(x => x.sold)

            }]

        },

        options: {

            indexAxis: "y",

            responsive: true,

            maintainAspectRatio: false

        }

    });

}

function renderTable(ranking) {

    const tbody =
        document.getElementById("rankingTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    ranking.forEach((book, index) => {

        tbody.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${book.code}</td>
            <td>${book.title}</td>
            <td>${book.sold.toLocaleString("id-ID")}</td>
            <td>${rupiah(book.revenue)}</td>
            <td>${rupiah(book.profit)}</td>
        </tr>`;
    });

}