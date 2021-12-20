/*
* This is an experimental file, which uses linked modules for @hashgraph/sdk and @hashgraph/cryptography
* */

const {EcdsaPublicKey, PrivateKey, PublicKey, EcdsaPrivateKey, KeyList} = require('@hashgraph/cryptography');
const {Client, AccountCreateTransaction, AccountId, Hbar, Transaction, TransferTransaction} = require('@hashgraph/sdk');

const account = require('../../constant');
// main
(async () => {
	/* create the operator */
	const privateKey = PrivateKey.fromString(account.operator.privateKey);
	// const publicKey = PublicKey.fromString(account.operator.publicKey);
	const operatorId = AccountId.fromString(account.operator.accountId);
	const client = Client.forNetwork(account.network);
	client.setOperator(operatorId, account.operator.privateKey);

	// FIXME: temporary solution as of non-working hethers symlink
	const walletKey = "0x02b5c42d67d0114b3b99d3c73264e61cd020a57ef42c865a564e3c1c7fc98de474";
	const ecdsaKey = EcdsaPublicKey.fromString(walletKey);

	/* prepare account create transaction */
	let tx = await new AccountCreateTransaction()
		.setInitialBalance(new Hbar(5))
		.setKey(ecdsaKey)
		// .setNodeAccountIds([new AccountId(0, 0, 3)])
		.freezeWith(client);

	try {
		console.log('Sending:', tx);
		const resp = await tx.execute(client);
		const receipt = await resp.getReceipt(client);
		console.log(receipt);
	} catch (err) {
		console.log(err);
		client.close();
	}

})();


// const tx = await new TransferTransaction()
// 	.addHbarTransfer("0.0.98", Hbar.fromTinybars(10))
// 	.addHbarTransfer(account.operator.accountId, Hbar.fromTinybars(-10))
// 	.freezeWith(client)
