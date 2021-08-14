const Caver = require('caver-js')
const proof_json = require('./build/contracts/Proof.json')
const cav = new Caver('https://api.baobab.klaytn.net:8651')


const smartcontract = new cav.klay.Contract(proof_json.abi, proof_json.networks[1001].address)
var account = cav.klay.accounts.createWithAccountKey("0xe9433afb79d13552d06c5fecbadb89f27e6629bd", "0x793f79eb40f9fada0d23e629cee093228c14bcc046ec2b9a7de39e500a90f026")
cav.klay.accounts.wallet.add(account)

// console.log(account.address)
smartcontract.methods.notarize("문서1").send({
    from:"0xe9433afb79d13552d06c5fecbadb89f27e6629bd",
    gas:8500000
}).then(receipt=>{
    console.log(receipt)
})

smartcontract.methods.checkDocument("문서2").call().then(data=>{
    console.log(data)
})