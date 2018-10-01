import Web3 from 'web3';

let web3Service = {
  instance: null
}


web3Service.promise = new Promise((resolve, reject) => {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', () => {
    var results
    var web3 = window.web3
  //   // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider.
      web3 = new Web3(web3.currentProvider);
      console.log('Injected web3 detected.');
    } else {
      var provider = new Web3.providers.HttpProvider(process.env.REACT_APP_PROVIDER_URL);
      web3 = new Web3(provider);
      console.log('No web3 instance injected, using Local web3.');
    }
    web3Service.instance = web3
    resolve(web3);
  });
});

export default web3Service