const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const Web3 = require('web3');
const web3 = new Web3();
const CryptoJS = require('crypto-js');
const { createHash } = require('crypto');

let encode = (key)  => {
  return '0x'+Buffer.from(formatPublicKey(key), 'utf8').toString('hex');
}

let splitKeyInto2 = (key) => {
  let without04 = key.substring(2)
  return ['0x'+without04.substring(0,64), '0x'+without04.substring(64)]
}

let formatPublicKey = (key) => {
  let pub = key.getPublic();
  return pub.encode('hex');
}

let formatPrivateKey = (key) => {
  let priv = key.getPrivate();
  return priv.toString(16);
}

let createBundle = (id, numOTKs=10)  => {
  let ik = ec.genKeyPair();
  ik.getPublic();
  let spk = ec.genKeyPair();
  let signature = ik.sign((encode(spk))).toDER('hex');
  return {id,ik,spk,signature}
}

let formatPublicBundle = (bundle) => {
  let ikPublic = formatPublicKey(bundle.ik);
  let spkPublic = formatPublicKey(bundle.spk);
  return {
    id: bundle.id,
    ik: ikPublic,
    spk: spkPublic,
    signature: bundle.signature,
  }
}

let verifyPKSig = (publicBundle)  => {
  const ik = ec.keyFromPublic(publicBundle.ik, 'hex');
  const spk = ec.keyFromPublic(publicBundle.spk, 'hex');
  return ik.verify(encode(spk), publicBundle.signature);
}

let sendMessage = (sendersBundle, receiversPublicBundle, text) => {
  if(!verifyPKSig(receiversPublicBundle)) throw new Error("Receivers bundle signature failed");

  let sendersEphemeralKey = ec.genKeyPair();
  let dh1 = sendersBundle.ik.derive(ec.keyFromPublic(receiversPublicBundle.spk, 'hex').getPublic()).toString(16);
  let dh2 = sendersEphemeralKey.derive(ec.keyFromPublic(receiversPublicBundle.ik, 'hex').getPublic()).toString(16);
  let dh3 = sendersEphemeralKey.derive(ec.keyFromPublic(receiversPublicBundle.spk, 'hex').getPublic()).toString(16);

  let hash = createHash('sha256');
  hash.update(`${dh1}${dh2}${dh3}`);
  let sk = hash.digest('hex');
  let encrypted = encrypt(text, sk);
  if(encrypted.slice(0,2)!='0x') encrypted='0x'+encrypted;

  return {
    ik: formatPublicKey(sendersBundle.ik),
    ek: formatPublicKey(sendersEphemeralKey),
    sk: sk.toString('hex'),
    text: encrypted
  }
}

let getSharedSecret = (receiversBundle, message)  => {
  let dh1 = receiversBundle.spk.derive(ec.keyFromPublic(message.ik, 'hex').getPublic()).toString(16);
  let dh2 = receiversBundle.ik.derive(ec.keyFromPublic(message.ek, 'hex').getPublic()).toString(16);
  let dh3 = receiversBundle.spk.derive(ec.keyFromPublic(message.ek, 'hex').getPublic()).toString(16);
  let hash = createHash('sha256');
  hash.update(`${dh1}${dh2}${dh3}`);
  let sk = hash.digest('hex');
  return sk;
}

let encrypt = (text, key) => {
  text = String(text)
  var keyEnc = CryptoJS.enc.Hex.parse(key);
  let ivEnc = CryptoJS.enc.Base64.parse("MDAwMDAwMDAwMDAwMDAwMA==");
  let result = CryptoJS.AES.encrypt(text, keyEnc, {iv: ivEnc, mode: CryptoJS.mode.CFB});
  return result.ciphertext.toString(CryptoJS.enc.Hex)
}

let decrypt = (ciphertext, key) => {
  if(ciphertext.slice(0,2) == '0x') ciphertext = ciphertext.slice(2);
  var keyEnc = CryptoJS.enc.Hex.parse(key);
  let ivEnc = CryptoJS.enc.Base64.parse("MDAwMDAwMDAwMDAwMDAwMA==");
  let cipher = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Hex.parse(ciphertext)
  });
  let result = CryptoJS.AES.decrypt(cipher, keyEnc, {iv: ivEnc, mode: CryptoJS.mode.CFB});
  return result.toString(CryptoJS.enc.Utf8)
}

let receiveMessage = (receiversBundle, message) => {
  let sk = getSharedSecret(receiversBundle, message);
  let decrypted = decrypt(message.text, sk);
  return decrypted;
}

let convertToUint8Array = (string)  => {
  let bytes = new Uint8Array(Math.ceil(string.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(string.substr(i * 2, 2), 16);
  }
  return bytes
}

let saveBundle = (bundle) => {
  let ikPriv = formatPrivateKey(bundle.ik);
  let spkPriv = formatPrivateKey(bundle.spk);
  return {
    id: bundle.id,
    ik: ikPriv,
    spk: spkPriv,
    signature: bundle.signature
  }
}

let loadBundle = (savedBundle) => {
  let ik = ec.keyFromPrivate(savedBundle.ik, 'hex');
  let spk = ec.keyFromPrivate(savedBundle.spk, 'hex');
  ik.getPublic()
  spk.getPublic()
  return {
    id: savedBundle.id,
    ik: ik,
    spk: spk,
    signature: savedBundle.signature
  }
}

let makeNbytes = (hexstring,n=32) => {
  if(hexstring.slice(0,2) === '0x') hexstring = hexstring.slice(2)
  while(hexstring.length < n*2){
    hexstring = '0' + hexstring;
  }
  while(hexstring.length > n*2){
    hexstring = hexstring.slice(1);
  }
  return '0x'+hexstring;
}


let joinKeysInto1 = (key1, key2)  => {
  return '04'+key1.substring(2)+key2.substring(2)
}


// let main = () => {
//   let aliceBundle = createBundle(1);
//   let alicePublicBundle = formatPublicBundle(aliceBundle);

//   let bobBundle = createBundle(2);
//   let bobPublicBundle = formatPublicBundle(bobBundle);

//   let message = sendMessage(aliceBundle, bobPublicBundle, "This is a message");
//   let receivedMessage = receiveMessage(bobBundle, message);
// }

module.exports = {
  encrypt,
  decrypt,
  createBundle,
  formatPublicBundle,
  sendMessage,
  joinKeysInto1,
  receiveMessage,
  splitKeyInto2,
  saveBundle,
  loadBundle,
  getSharedSecret,
  makeNbytes
}
