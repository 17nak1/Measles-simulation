
const newLog = (origLog, color, ...args) => {
  origLog(...args);

  let p = document.createElement('pre');
  p.innerText = args.map(a => typeof a === 'string'? a : JSON.stringify(a, null, 2)).join(' ');
  p.style.color = color;
  document.body.appendChild(p);
}

// Rebind the window's console log and error so that they also
// print to the document body with *colors*
let _consoleLog = console.log;
let _consoleErr = console.error;
console.log = newLog.bind(null, _consoleLog, 'black');
console.error = newLog.bind(null, _consoleErr, 'red');

// Loading the page
document.addEventListener('DOMContentLoaded', () => {
  fetch('js/worker-bundle.js')
  .then(response => response.text())
  .then((workerBundle) => {
    // self.workerfn gets set by the workerBundle (see worker-src/index.js)
    const workerFn = `(async (...args) => {
      ${workerBundle}
      return await self.workerfn(...args);
    })`;
    start(workerFn);
  });
})

function start (workerFn) {
  let dataCases, dataCovar;
  document.getElementById('file1-upload').onchange = function () {
    var file = this.files[0]
    dataCovar = []
    var reader = new FileReader ()
    reader.onload = function () {
      var lines = this.result.split('\n')
      for (var line = 1; line < lines.length; line++) {
        if(lines[line].length) {
          dataCovar.push(lines[line].split(','))
        }
      }
    }
    reader.readAsText(file)
  }
 
  document.getElementById('file2-upload').onchange = function () {
    var file = this.files[0]
    dataCases = []
    var reader = new FileReader ()
    reader.onload = function () {
      var lines = this.result.split('\n')
      for (var line = 1; line < lines.length; line++) {
        if(lines[line].length) {
          dataCases.push(lines[line].split(','))
        }
      }
    }
    reader.readAsText(file)
  }


  const runComputeFor = async function( n, data) {
    console.log("Deploying job...");
    let job = dcp.compute.do(n, workerFn, data);
    
    job.public = { name: 'Measles-simulation' } 
    job.work.on('console', (msg) => console.log("Got console event:", msg));
    job.work.on('uncaughtException', (e) => console.error(e));

    job.on('accepted', () => {
      console.log("Job accepted");
    });

    job.on('status', (status) => {
      console.log("Got a status update:", status);
    });

    job.on('cancel', (m) => console.log("Job was cancelled", m));
    job.on('result', (ev) => console.log("Got a result:", ev));
    let results = await job.exec(dcp.compute.marketValue);
    // console.log(results)
    console.log("Done.");
  }

  let runButton = document.getElementById('go-button');
  runButton.onclick = function () {
    let data = [[{
      maxFail : 500,
      dataCases : dataCases,
      dataCovar : dataCovar,
      runSaveStates : 1,
      parameters : { R0: 3.132490e+01, amplitude: 3.883620e-01, gamma: 7.305000e+01, mu: 6.469830e-04, sigma: 4.566000e+01,
                rho: 4.598709e-01, psi:1.462546e-01,
                S_0: 3.399189e-02, E_0: 2.336327e-04, I_0: 4.221789e-07, R_0: 9.657741e-01 },
      Np : 10000 ,
      dt : 1 / 365.25,// Input from pomp model
      timeZero : 1940}
    ]];
    
    runComputeFor(2, data)
  };
}


function trigerPlotTrajectory(dataInput, PlotParamName) {
  let times = [];
  let data = [];
  let simHarranged = [];
  for (let i = 0; i < dataInput.length; i++) {
    times.push(dataInput[i][0]);
    data.push(dataInput[i][1]);
    simHarranged.push(dataInput[i][2]);
  }

  var trace1 = {
    x: times,
    y: data,
    mode: 'lines',
    line: {color: "#00a473"},
    name: 'data'
  }; 

  // var trace2 = {
  //   x: times,
  //   y: simHarranged,
  //   mode: 'lines',
  //   line: {color: "#1c3583"},
  //   name: ' trajectory'
  // };

  var dataPlot = [trace1];
  plot2D(dataPlot, PlotParamName)
}

function plot2D(data, PlotParamName) {

  var layout = {
    width: 600,
    height: 600,
    autosize: false,
    margin: {'b': 100},
    xaxis: {
      title: {
        text: 'time',
        font: {
          family: 'Courier New, monospace',
          size: 20,
          color: '#7f7f7f'
        }
      },
    },
    scene: {
      xaxis: {
      },
      yaxis: {
        title: "F",
        rangemode: 'tozero',
      }
    },
    
    legend: {
    x: 1,
    y: 1
    }
  };

  Plotly.newPlot(PlotParamName, data, layout, { scrollZoom: true }); 
}