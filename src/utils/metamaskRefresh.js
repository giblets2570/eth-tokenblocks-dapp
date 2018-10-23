import web3Service from 'utils/getWeb3';

var account;

export let refresh = async () => {
  try {
    await web3Service.promise
    let web3 = web3Service.instance
    console.log(web3)
    account = web3.eth.accounts[0];
    let accountInterval = setInterval(function() {
      if (web3.eth.accounts[0] !== account) {
        window.location.reload(false);
      }
    }, 100);
  }catch(e){

  }
}
