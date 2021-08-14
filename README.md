## proofdocument_klaytn 프로젝트

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



