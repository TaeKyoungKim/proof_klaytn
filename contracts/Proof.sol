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