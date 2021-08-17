

## []()

#### 클레이튼 기반 테스트 네트워크인 baobab 네트워에 truffle을 이용해여 배포한다.

1. truffle 명령어를 이용하여 프로젝트 생성하고 vscode로 편집

   ```powershell
   truffle init proofdocument_klaytn
   
   cd proofdocument_klaytn
   
   code .
   ```

   

2. contracts/Proof.sol 파일 생성후 다음과 같이 코딩

```solidity
pragma solidity >=0.4.22 <0.9.0;

contract Proof {
    
    mapping (bytes32 => bool) private proofs;
    
    function storeProof(bytes32 proof) private {
        proofs[proof] = true;
    }
    
    function notarize(string memory document) public {
        storeProof(prooffor(document));
    }
    
    function prooffor(string memory document) private pure returns(bytes32){
        return sha256(bytes(document));
        
    }

    function checkDocument(string memory document) public view returns (bool) {
        return proofs[prooffor(document)];
    }
    
}
```





3. Proof.sol을 컴파일 한다.

   ```powershell
   truffle compile
   ```

   build폴더가 생성되는것을 확인할 수 있고Proof.json과 Migrations.json 파일이 build/contracts 폴더에 생성되는 것을 확인 할 수 있다.

   

4. klaytn기반 바오밥 테스트 네트워크에 컴파일한 파일을 migrate하기 위해서 migrations/2_deploy_proof.js

   생성후 다음과 같이 코드를 추가한다.

   ```javascript
   const Proof = artifacts.require("Proof");
   
   module.exports = function (deployer) {
     deployer.deploy(Proof);
   };
   
   ```

   

5. baobab network정보를 truffle-config.js 파일에  일정한 규칙으로 다음과 같이 작성한다.

   다음과 같이 작성하기 위해서는 

   1) klaytn wallet 사이트에 접속하여 Acount 생성

   ![image-20210814152933933](https://user-images.githubusercontent.com/25717861/129437443-c22a1e6b-cc46-4340-977f-b7b9fb21e5eb.png)



​		작성시 Private Key , Klaytn Wallet Key , address 는 파일을 만들어 따로 꼭 보관하자.



```javascript
/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

const HDWalletProvider = require('@truffle/hdwallet-provider');
// const infuraKey = "fj4jll3k.....";
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();

const NETWORK_ID = '1001'
const GASLIMIT = '8500000'

const URL = "https://api.baobab.klaytn.net:8651"
const PRIVATE_KEY = "클레이튼 월렛 생성시 private key 입력"
module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    baobab:{
      provider:()=>{new HDWalletProvider(PRIVATE_KEY,URL)},
      network_id:NETWORK_ID,
      gas:GASLIMIT,
      gasPrice:null
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      // version: "0.5.1",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  },

  // Truffle DB is currently disabled by default; to enable it, change enabled: false to enabled: true
  //
  // Note: if you migrated your contracts prior to enabling this field in your Truffle project and want
  // those previously migrated contracts available in the .db directory, you will need to run the following:
  // $ truffle migrate --reset --compile-all

  db: {
    enabled: false
  }
};

```



truffle deploy 명령어를 이용하여 바오밥 테스트 네트워크에 migrate한다.

```powershell
truffle deploy --network baobab
```



https://api.baobab.klaytn:8651 블록체인 네트워크와 nodejs를 활용하여 컨트렉트 명령를 수행할 수 있는데 

테스트 해본다.

app_test.js파일을 생성후 다음과 같은 코드를 추가한다.



```javascript
const Caver = require('caver-js')
const proof_json = require('./build/contracts/Proof.json')
const cav = new Caver('https://api.baobab.klaytn.net:8651')
const smartcontract = new cav.klay.Contract(proof_json.abi, proof_json.networks[1001].address)
// var account = cav.klay.accounts.createWithAccountKey("지갑생성시 address", "지갑생성시 privatekey")
// cav.klay.accounts.wallet.add(account)
// console.log(account.address)
// smartcontract.methods.notarize("문서1").send({
//     from:"지갑생성시 어드레스",
//     gas:8500000
// }).then(receipt=>{
//     console.log(receipt)
// })
smartcontract.methods.checkDocument("문서2").call().then(data=>{
    console.log(data)
})
```



http://localhost:8080 웹서와 http://api.baobab.klaytn.net:8651 블록체인 네트워크 서버와 상호 연동을 하는 

DAPP을 만들기 위해 먼저



app.js 파일을 생성후 다음과 같은 코드를 추가한다.

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const apiRouter = require('./routes/router')
const path = require('path')

app.set('views' , path.resolve(__dirname+'/views'))
app.set('view engine' , 'ejs')
app.engine('html', require('ejs').renderFile)


app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(apiRouter)

var port = 8080
app.listen(port , ()=>{
    console.log(`Server is Runing at http://localhost:${port}`)
})
```



라우팅 기능을 만들어서 app.use 메소드를 이용하여 미들웨어로 등록을 하기 위해



routes/router.js 파일생성후 다음과 같은 코드를 추가한다.

```javascript
const route = require('express').Router()


route.get('/', (req, res)=>{
    res.render("index.html")
})

module.exports = route;
```





http://localhost:8080 GET방식으로 요청이 오면 index.html 을 랜더링 하기 위해  views/index.html



```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>문서입력</title>
</head>
<body>
    <%= %>
    <h1>문서입력페이지</h1>
    <form action="/input" method="POST">
        <input type="text" name="desc" placeholder="인증내용입력">
        <input type="submit" value="인증저장">
    </form>
</body>
</html>
```





![image-20210814171848738](https://user-images.githubusercontent.com/25717861/129439839-907d532f-7f64-40a1-b29f-bbaf87fd1689.png)

문서의 내용을 간단히 적고 인증저장 버튼을 누루면 POST 방식으로 http://localhost:8080/input 주소로 

 문서의 내용데이터를 같이 보내고 

서버는 그것을 받아서 http://api.baobab.klaytn.net:8651 의 콘트렉트 함수중 notraize 함수를 실행시켜서 

블록체인 네트워크에 문서가 참임을 저장한다.



routes/router.js 파일을 다음과 같이 수정한다.



```html
const route = require('express').Router()
const Caver = require('caver-js')
const proof_json = require('../build/contracts/Proof.json')
const cav = new Caver('https://api.baobab.klaytn.net:8651')

const smartcontract = new cav.klay.Contract(proof_json.abi, proof_json.networks[1001].address)
var account = cav.klay.accounts.createWithAccountKey("지갑생성시 address", "지갑생성시 privatekey")
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


module.exports = route;
```





서버 재실행후 다시확인다.





문선의 내용의 진위여부를 판단할 수 있는 기능 구현



routes/router.js 에 다음과 같이 추가 한다.

```javascript
....

route.post('/proof', (req, res)=>{
    var document = req.body.proof
    smartContract.methods.checkDocument(document)
    .call()
    .then(
        data=>{
            console.log(data)
            res.render('proof_result.html', {proof : data})
        })
    
})

.....
```



views/proof_result.html 파일 생성후 담과 같이 코드 추가한다.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PROOF</title>
</head>
<body>
    <h1>결과페이지</h1>
    <h1> <%= proof %></h1>
</body>
</html>
```





klaytn 기반에 자체 토큰을 생성후 문서 인증을 전송하면 자제 토큰을 보상으로 주는 시스템 구현하기 위해

route.js다음과 같이 수정한다.



```javascript
const route = require('express').Router()
const Caver = require('caver-js')
const proof_json = require('../build/contracts/Proof.json')
const cav = new Caver('https://api.baobab.klaytn.net:8651')

const CaverExtKAS = require('caver-js-ext-kas')
const caver = new CaverExtKAS()


const accessKeyId = "kas accessKeyID";
const secretAccessKey = "kassecretAccessKey" ;


const smartcontract = new cav.klay.Contract(proof_json.abi, proof_json.networks[1001].address)
var account = cav.klay.accounts.createWithAccountKey("klay 개인지갑생성시 주소", "private Key")
cav.klay.accounts.wallet.add(account)

const chainId = 1001 // 클레이튼 테스트 네트워크 접속 ID 

caver.initKASAPI(chainId, accessKeyId, secretAccessKey) //KAS console 초기화

const keyringContainer = new caver.keyringContainer()
const keyring = keyringContainer.keyring.createFromPrivateKey('privateKey')
keyringContainer.add(keyring)       //klaytn Keyring 설정 


async function create_wallet(){     //wallet 생성 function
    const wallet = await caver.kas.wallet.createAccount()   //wallet 생성
    console.log(wallet);
}

// create_wallet()
async function create_token(){      //토큰 생성 function
    const kip7 = await caver.kct.kip7.deploy({
        name: 'Jinju1',     //토큰 이름
        symbol: 'JONE',       //토큰 심볼
        decimals: 0,        //토큰의 소수점 자리 수
        initialSupply: '100000000', //토큰의 발행량
    }, keyring.address, keyringContainer) // keyringContainer를 이용하여 주소 등록
    console.log(kip7._address)
}

// create_token()

async function token_trans(){       //token 송금 function
    const kip7 = new caver.kct.kip7('token 생성시 주소(kip7._address)')       //생성된 토큰의 Address 입력
    kip7.setWallet(keyringContainer)        //kip7 내의 wallet 설정        
    const receipt = await kip7.transfer('전송하고자하는 상대방 월렛주소', '100', { from: keyring.address })       //transfer('토큰 받는 주소', 토큰 양, {from:'트랜젝션을 일으키는 주소'})
    console.log(receipt);
}

token_trans()

async function balanceOf(){
    const kip7 = new caver.kct.kip7('token 생성시 주소(kip7._address)')       //생성된 토큰의 Address 입력
    kip7.setWallet(keyringContainer)        //kip7 내의 wallet 설정  
    const receipt = await kip7.balanceOf('조회할 주소')  //balanceOf('토큰 조회할 주소')
    console.log(receipt);
}

// balanceOf()

route.get('/', (req, res)=>{
    
    res.render("index.html")
})

route.post('/input',(req, res)=>{
    console.log(req.body.desc)
    var document = req.body.desc

    smartcontract.methods.notarize(document).send({
    from: account.address,
    gas: 200000
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
    smartContract.methods.checkDocument(document)
    .call()
    .then(
        data=>{
            console.log(data)
            res.render('proof_result.html', {proof : data})
        })
    
})

module.exports = route;

```



위에 코드에서 create_wallet() , create_token() 함수를 실행시켜서 토큰을 생성시킨다.



문서를  인증요청을 하면 인증요청을 한 유저에게 10 JONE 전송하는 시스템 구현을 위해 다음과 같이 코드를

수정한다.



```javascript
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
```

