const route = require('express').Router()
const Caver = require('caver-js')
const proof_json = require('../build/contracts/Proof.json')
const cav = new Caver('https://api.baobab.klaytn.net:8651')

const smartcontract = new cav.klay.Contract(proof_json.abi, proof_json.networks[1001].address)
var account = cav.klay.accounts.createWithAccountKey("0xe9433afb79d13552d06c5fecbadb89f27e6629bd", "0x793f79eb40f9fada0d23e629cee093228c14bcc046ec2b9a7de39e500a90f026")
cav.klay.accounts.wallet.add(account)

route.get('/', (req, res)=>{
    res.render("index.html")
})

route.post('/input',(req, res)=>{
    console.log(req.body.desc)
    var document = req.body.desc
    
    smartcontract.methods.notarize(document).send({
    from:account.address,
    gas:200000
    }).then(
        receipt=> {
            console.log(receipt)
            res.redirect("/proof")
        })
    
})


route.get('/proof', (req ,res)=>{
    res.render('proof.html')
})


route.post('/proof', (req, res)=>{
    var document = req.body.proof
    smartcontract.methods.checkDocument(document)
    .call()
    .then(
        data=>{
            console.log(data)
            res.render('proof_result.html', {proof : data})
        })
    
})
module.exports = route;