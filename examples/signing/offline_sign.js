const {EcdsaPublicKey, PrivateKey, PublicKey, EcdsaPrivateKey, KeyList} = require('@hashgraph/cryptography');
const {Client, AccountCreateTransaction, AccountId, Hbar, Transaction, TransferTransaction, TransactionId} = require('@hashgraph/sdk');
const account = require('../../constant');

// main
(async () => {
	/* create the operator */
	const privateKey = PrivateKey.fromString(account.operator.privateKey);

	const publicKey = PublicKey.fromString(account.operator.publicKey);
	const operatorId = AccountId.fromString(account.operator.accountId);

	const client = Client.forNetwork(account.network).setOperator(operatorId, privateKey);

	const tx = await new TransferTransaction()
		.addHbarTransfer("0.0.98", Hbar.fromTinybars(100))
		.addHbarTransfer(operatorId, Hbar.fromTinybars(-100))
		.setTransactionId(TransactionId.generate(operatorId))
		.setNodeAccountIds([AccountId.fromString("0.0.3")])
		.freeze();

	const bytes = await tx.toBytesAsync();
	const sig = privateKey.sign(bytes);
	tx.addSignature(publicKey, sig);

	const txFromBytes = Transaction.fromBytes(bytes);
	const response = await txFromBytes.execute(client);
	console.log(response);
})();
