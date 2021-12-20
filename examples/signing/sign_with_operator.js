const {EcdsaPublicKey, PrivateKey, PublicKey, EcdsaPrivateKey, KeyList} = require('@hashgraph/cryptography');
const {Client, AccountCreateTransaction, AccountId, Hbar, Transaction, TransferTransaction} = require('@hashgraph/sdk');
const account = require('../../constant');


// main
(async () => {
	/* create the operator */
	const privateKey = PrivateKey.fromString(account.operator.privateKey);
	const publicKey = PublicKey.fromString(account.operator.publicKey);
	const operatorId = AccountId.fromString(account.operator.accountId);
	const client = Client.forNetwork(account.network);
	client.setOperator(operatorId, privateKey);

	const tx = await new TransferTransaction()
		.addHbarTransfer("0.0.98", Hbar.fromTinybars(100))
		.addHbarTransfer(operatorId, Hbar.fromTinybars(-100))
		.freezeWith(client);
	await tx.signWithOperator(client);

	const response = await tx.execute(client);
	console.log(response);
})();
