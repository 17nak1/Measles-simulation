

const pfilter = require('./pfilter.js');

// Add the workerfn to the self namespace so it can be called by whatever wraps the output bundle
const workerfn = self.workerfn = async (...args) => {
  const work = (resolve, reject) => () => {
    let result;
    let date = new Date();
    try {
      progress();
      console.error("STARTING TRAJMATCH");
      result = pfilter.run(...args);
    } catch (e) {
      console.error(e);
      result =  NaN;
    }
    console.debug(new Date() - date)
    resolve(result);
  }

  return await new Promise((resolve, reject) => {
    work(resolve, reject)();
  });
}

export default workerfn;
