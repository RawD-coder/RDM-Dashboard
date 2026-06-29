const API_URL =
"https://script.google.com/macros/s/AKfycbxEZLydgr_7WNStW2mmiFTNVxFqMLQ8ViZOV8GrkL03c_qYljGqam_oukKr1V-yMHW1hw/exec";

let salesChart;
let topBooksChart;

function rupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);
}

async function loadData() {

    try {

        const response = await fetch(API_URL);
        const data = await response.json();

        console.log(data);

        processData(data);

    } catch (error) {

        console.error(error);

        alert("Gagal mengambil data");

    }
}

function processData(data) {

    const general = data.general;
    const monthly = data.monthly;

    //--------------------------------
    // KPI
    //--------------------------------

    const totalRevenue = Number(general[57][10]);
    const totalProfit = Number(general[57][11]);

    const books = general.slice(4, 57);

    const totalTitle = books.length;

    let topBook = "";
    let topQty = 0;

    books.forEach(book => {

        const sold = Number(book[4]) || 0;

        if (sold > topQty) {
            topQty = sold;
            topBook = book[2];
        }

    });

    document.getElementById("revenue").innerHTML =
        rupiah(totalRevenue);

    document.getElementById("profit").innerHTML =
        rupiah(totalProfit);

    document.getElementById("titleCount").innerHTML =
        totalTitle;

    document.getElementById("topSeller").innerHTML =
        topBook;

    //--------------------------------
    // DATA BULANAN
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

    renderSalesChart(months, revenueData);

    //--------------------------------
    // TOP 10 BUKU
    //--------------------------------

    const ranking = books
        .map(book => ({
            code: book[1],
            title: book[2],
            sold: Number(book[4]) || 0,
            revenue: Number(book[10]) || 0,
            profit: Number(book[11]) || 0
        }))
        .sort((a, b) => b.sold - a.sold);

    renderTopBooksChart(ranking);

    renderTable(ranking);

}

function buildMonthFilter(months, revenueData) {

    const select =
        document.getElementById("monthFilter");

    select.innerHTML = "";

    const allOption =
        document.createElement("option");

    allOption.value = "all";
    allOption.textContent = "Semua Bulan";

    select.appendChild(allOption);

    months.forEach((month, index) => {

        const option =
            document.createElement("option");

        option.value = index;
        option.textContent = month;

        select.appendChild(option);

    });

    select.addEventListener("change", function () {

        const value = this.value;

        if (value === "all") {

            renderSalesChart(
                months,
                revenueData
            );

        } else {

            renderSalesChart(
                [months[value]],
                [revenueData[value]]
            );

        }

    });

}

function renderSalesChart(labels, data) {

    const ctx =
        document.getElementById("salesChart");

    if (salesChart) {
        salesChart.destroy();
    }

    salesChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels,

            datasets: [{

                label: "Revenue",

                data

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    display: true
                }

            }

        }

    });

}

function renderTopBooksChart(ranking) {

    const top10 =
        ranking.slice(0, 10);

    const ctx =
        document.getElementById("topBooksChart");

    if (topBooksChart) {
        topBooksChart.destroy();
    }

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

            responsive: true

        }

    });

}

function renderTable(ranking) {

    const tbody =
        document.getElementById("rankingTable");

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

        </tr>

        `;

    });

}

document
.getElementById("exportPDF")
.addEventListener("click", () => {

    html2pdf()

        .set({

            margin: 10,

            filename:
                "laporan-penjualan-buku.pdf",

            html2canvas: {

                scale: 2

            }

        })

        .from(document.body)

        .save();

});

loadData();