Berdasarkan file excel yg saya upload, saya ingin membuat halaman di vercel app, untuk laporan penjualan toko buku bulanan dan seluruhnya, berikan rekomendasi pengambilan data dari excel atau google sheets.
Buatkan file html yg sesuai dengan kondisi tersebut.const API_URL =
"https://script.google.com/macros/s/AKfycbxEZLydgr_7WNStW2mmiFTNVxFqMLQ8ViZOV8GrkL03c_qYljGqam_oukKr1V-yMHW1hw/exec";

let chart;

async function loadData() {

```
const res = await fetch(API_URL);
const data = await res.json();

processData(data);
```

}

function processData(data){

```
const monthly = data.monthly;

const labels = [];
const revenue = [];

const monthMap = {
  2:"Jan",
  4:"Feb",
  6:"Mar",
  8:"Apr",
  10:"May",
  12:"Jun",
  14:"Jul",
  16:"Aug",
  18:"Sep",
  20:"Oct",
  22:"Nov",
  24:"Dec"
};

Object.entries(monthMap).forEach(([col,name])=>{

    let total = 0;

    for(let i=2;i<monthly.length;i++){
        total += Number(monthly[i][col] || 0);
    }

    labels.push(name);
    revenue.push(total);
});

renderChart(labels,revenue);
```

}

function renderChart(labels,data){

```
const ctx =
  document.getElementById('salesChart');

chart = new Chart(ctx,{
  type:'bar',
  data:{
    labels,
    datasets:[{
      label:'Revenue',
      data
    }]
  }
});
```

}

function exportPDF(){

```
window.print();
```

}

loadData();
