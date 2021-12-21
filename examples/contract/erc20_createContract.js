const {PrivateKey, PublicKey} = require('@hashgraph/cryptography');
const {Client, AccountId, Hbar, FileCreateTransaction, FileAppendTransaction, FileContentsQuery, ContractCreateTransaction, ContractFunctionParameters} = require('@hashgraph/sdk');
const contract = require("./erc20_contract.json"); // Import the compiled contract


const account = {
    "operator": {
        "accountId": "0.0.1546615",
        "publicKey": "302a300506032b65700321004b912a7c0602657c6890869f2c6943a1bbd649ad580e3a7d40d95a3a2a4ed795",
        "privateKey": "302e020100300506032b657004220420c7cb0caa71b05f62dafaf426052b317dad25aa66228d6faa3291712efd86c6b8"
      },
    "network": {
        "0.testnet.hedera.com:50211": "0.0.3"
        // "1.testnet.hedera.com:50211": "0.0.4",
        // "2.testnet.hedera.com:50211": "0.0.5",
        // "3.testnet.hedera.com:50211": "0.0.6"
    }
};

function * chunkOfSize(contractCodeString, maxBytes) {
    let buf = Buffer.from(contractCodeString, 'utf8');
    while (buf.length) {
        yield buf.slice(0, maxBytes).toString();
        buf = buf.slice(maxBytes);
    }
}

// main
(async () => {
    /* create the operator */
   const privateKey = PrivateKey.fromString(account.operator.privateKey);
//    const publicKey = PublicKey.fromString(account.operator.publicKey);
   const operatorId = AccountId.fromString(account.operator.accountId);
   const client = Client.forNetwork(account.network);
   client.setOperator(operatorId, privateKey);

    // The contract bytecode is located on the `object` field
    const contractByteCode = contract.object;
    console.log(`contractByteCode length: ${contractByteCode.length} `);

    let chunks = [];
    for (let str of chunkOfSize(contractByteCode, 4096)) { //6Kib -> 6144b/3072hex
        chunks.push(str);
        console.log(`chunk bytes size:`, Buffer.byteLength(str, 'utf8'));
    }
    
    // Create a file on Hedera which contains the contract bytecode.
    // Note: The contract bytecode **must** be hex encoded, it should not
    // be the actual data the hex represents 
    const fileTransactionResponse = await new FileCreateTransaction()
        .setKeys([client.operatorPublicKey])
        .setContents(chunks[0])
        .setMaxTransactionFee(new Hbar(5))
        .execute(client);
  
    const fileReceipt = await fileTransactionResponse.getReceipt(client);
    console.log(fileReceipt);
 
    const fileId = fileReceipt.fileId;
    console.log(`contract bytecode file ID: ${fileId}`);

    if (chunks.length > 1) {
        for (var i = 1; i < chunks.length; i++) {
            await (
                await new FileAppendTransaction()
                    .setNodeAccountIds([fileTransactionResponse.nodeId])
                    .setFileId(fileId)
                    .setContents(chunks[i])
                    .setMaxTransactionFee(new Hbar(5))
                    .execute(client)
            ).getReceipt(client);
        }
    }

    const contents = await new FileContentsQuery()
        .setFileId(fileId)
        .execute(client);

    console.log("File content length according to `FileInfoQuery`:", contents.length);

    // Create the contract
    const contractTransactionResponse = await new ContractCreateTransaction()
        // Set the parameters that should be passed to the contract constructor
        // In this case we are passing in a Uint256 with the value 1000000000
        // as the only parameter that is passed to the contract
        .setConstructorParameters(
            new ContractFunctionParameters()
                .addUint256(1000000000))
        .setGas(300000)
        .setBytecodeFileId(fileId)
        .setAdminKey(client.operatorPublicKey)
        .execute(client);

    const contractReceipt = await contractTransactionResponse.getReceipt(client);
    const contractId = contractReceipt.contractId;

    console.log(`new contract ID: ${contractId}`);
    
})();