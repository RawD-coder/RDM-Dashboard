const API_URL =
"https://script.google.com/macros/s/AKfycbxEZLydgr_7WNStW2mmiFTNVxFqMLQ8ViZOV8GrkL03c_qYljGqam_oukKr1V-yMHW1hw/exec";

let chart;

async function loadData() {

    const res = await fetch(API_URL);
    const data = await res.json();

    console.log(data);

    processData(data);
}

function processData(data){

    const monthly = data.monthly;
	const general = data.general;

const totalRevenue = general[57][10];
const totalProfit = general[57][11];
const totalTitle = general.slice(4,57).length;

let topBook = "";
let topQty = 0;

for(let i=4;i<57;i++){

  const title = general[i][2];
  const sold = Number(general[i][4]) || 0;

  if(sold > topQty){
      topQty = sold;
      topBook = title;
  }
}

document.getElementById("revenue").innerHTML =
"Rp " + Number(totalRevenue).toLocaleString("id-ID");

document.getElementById("profit").innerHTML =
"Rp " + Number(totalProfit).toLocaleString("id-ID");

document.getElementById("titleCount").innerHTML =
totalTitle;

document.getElementById("topSeller").innerHTML =
topBook;

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
}

function renderChart(labels,data){

    const ctx = document.getElementById('salesChart');

    chart = new Chart(ctx,{
      type:'bar',
      data:{
        labels,
        datasets:[{
          label:'Revenue',
          data:data
        }]
      }
    });
}

function exportPDF(){
    window.print();
}

loadData();