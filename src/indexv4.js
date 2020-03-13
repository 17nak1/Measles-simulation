
/**
 * Proxy for console log/error/etc that will log normally but also
 * append the message to the document body and format objects nicely.
 * 
 * @param {function} origLog - The original logging function that's being proxied
 * @param {string} color - A CSS color string that will be used to style the text
 * @param {...*} args - Any additional arguments will be included in the log message
 */
const newLog = (origLog, color, ...args) => {
  origLog(...args);

  let p = document.createElement('pre');
  p.innerText = args.map(a => typeof a === 'string'? a : JSON.stringify(a, null, 2)).join(' ');
  p.style.color = color;
  document.body.appendChild(p);
}
// Rebind the window's console log and error so that they also
// print to the document body with *colors*
let _consoleLog = console.log,
  _consoleErr = console.error;
console.log = newLog.bind(null, _consoleLog, 'black');
console.error = newLog.bind(null, _consoleErr, 'red');
const v4 = dcp['protocol-v4'];
const deployJob = async () => {
  // k = await new dcp.wallet.Keystore("0x623cc56fe8fbd48531ed4058824d6f0725c0e13eca49574410c8cd0ed021b0ec");
  // k1 = await new dcp.wallet.Keystore();
  // sched = new v4.Connection('http://localhost:3000/DCPv4', k);
  // sched.send('heapPeek').then(res=>console.log('ok', res.payload)).catch(err=>console.error('nope', err.code, err.stack));
  // sched.send('heapStats').then(res=>console.log('ok', res.payload)).catch(err=>console.error('nope', err.code, err.stack));
  // sched.send('countJobs',{all:true, owner: k1}).then(res=>console.log('ok', res.payload)).catch(err=>console.error('nope', err.code, err.stack));
  
  
  console.log("Deploying job...");

  let job = dcp.compute.for(1, 2, async function(n){
    progress();
    let ping = () => new Promise(resolve => setTimeout(() => {
      progress();
      resolve();
    }, 2000));

    console.log("It works!", n);
    await ping(); // Simulate doing some work
    return n * 2;
  });
 
    
  job.work.on('console', (msg) => console.log("Got console event:", msg));
  job.work.on('uncaughtException', (e) => console.error(e));
  // job.work.on('myFavEvent', (msg) => console.log("Got my fav event:", msg));

  job.on('accepted', () => {
    console.log("Job accepted");
    // setTimeout(async () => {
    // 	console.warn("Cancelling job.......");
    // 	console.log('Receipt:', await job.cancel());
    // }, 1500);
  });
  window.job = job;
  
  job.on('status', (status) => {
    console.log("Got a status update:", status);
  });

  // job.on('cancel', (m) => console.log("Job was cancelled", m));
  // job.on('result', (ev) => console.log("Got a result:", ev));
  // job.requires('dcp-core/serialize.js');
  // let results = await job.exec(0.0001);
  

  // console.log("Done.");
  // console.log("Results are:", (await results.values()));
}

const main = () => {
  document.getElementById('go-button').addEventListener('click', deployJob);
}

document.addEventListener('DOMContentLoaded', main, false);
