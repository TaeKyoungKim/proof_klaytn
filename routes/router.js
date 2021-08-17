const route = require('express').Router()
const Caver = require('caver-js')
const proof_json = require('../build/contracts/Proof.json')
const cav = new Caver('https://api.baobab.klaytn.net:8651')

const CaverExtKAS = require('caver-js-ext-kas')
const { json } = require('body-parser')
const caver = new CaverExtKAS()


const accessKeyId = "KASKN4M8PEC06CMF0U6AAKL4";
const secretAccessKey = "hIWCQgjO2BuvjC6yREZ3ea2LardV6TqE_FZENjpT";


const smartcontract = new cav.klay.Contract(proof_json.abi, proof_json.networks[1001].address)
var account = cav.klay.accounts.createWithAccountKey("0xe9433afb79d13552d06c5fecbadb89f27e6629bd", "0x793f79eb40f9fada0d23e629cee093228c14bcc046ec2b9a7de39e500a90f026")
cav.klay.accounts.wallet.add(account)

const chainId = 1001 // 클레이튼 테스트 네트워크 접속 ID 

caver.initKASAPI(chainId, accessKeyId, secretAccessKey) //KAS console 초기화

const keyringContainer = new caver.keyringContainer()
const keyring = keyringContainer.keyring.createFromPrivateKey('0x37b7b801fd88f47a30bd849b0ace4dd29b777d5a6dd0b9cdb56dc065e9f91a8f')
keyringContainer.add(keyring)       //klaytn Keyring 설정 


async function create_wallet(){     //wallet 생성 function
    const wallet = await caver.kas.wallet.createAccount()   //wallet 생성
    console.log(wallet);
}


async function create_token(){      //토큰 생성 function
    const kip7 = await caver.kct.kip7.deploy({
        name: 'masan2',     //토큰 이름
        symbol: 'KR',       //토큰 심볼
        decimals: 0,        //토큰의 소수점 자리 수
        initialSupply: '100000000', //토큰의 발행량
    }, keyring.address, keyringContainer) // keyringContainer를 이용하여 주소 등록
    console.log(kip7._address)
}


async function token_trans(_address){       //token 송금 function
    const kip7 = new caver.kct.kip7('0xe3a6Ba4063104740F91CB9D3108a2547bf339E2c')       //생성된 토큰의 Address 입력
    kip7.setWallet(keyringContainer)        //kip7 내의 wallet 설정        
    const receipt = await kip7.transfer(_address, '10', { from: keyring.address })       //transfer('토큰 받는 주소', 토큰 양, {from:'트랜젝션을 일으키는 주소'})
    console.log(receipt);
}

async function balanceOf(_address){
    const kip7 = new caver.kct.kip7('0xe3a6Ba4063104740F91CB9D3108a2547bf339E2c')       //생성된 토큰의 Address 입력
    kip7.setWallet(keyringContainer)        //kip7 내의 wallet 설정  
    const receipt = await kip7.balanceOf(_address)  //balanceOf('토큰 조회할 주소')
    console.log(receipt);
    return receipt
}


route.get('/', (req, res)=>{
    // balanceOf()
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
            token_trans("0xF5B549F58F2B66B768A76EB5F7fccCd1795D6C0f")
            receipt = balanceOf("0xF5B549F58F2B66B768A76EB5F7fccCd1795D6C0f")
            data =  receipt.toString()
            res.render("input.html", {data:data})
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