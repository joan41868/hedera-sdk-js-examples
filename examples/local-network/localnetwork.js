const {Client, PrivateKey, AccountBalanceQuery} = require("@hashgraph/sdk");

const localAccount = {
	operator: {
		// genesis is the operator
		accountId: "0.0.2",
		privateKey: "302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137",
		publicKey: "302a300506032b65700321000aa8e21064c61eab86e2a9c164565b4e7a9a4146106e0a6cd03a8c395a110e92"
	},
	network: {
		"127.0.0.1:50211": "0.0.3",
		"127.0.0.1:50212": "0.0.4",
		"127.0.0.1:50213": "0.0.5"
	}
};

// main
(async () => {
	const privKey = PrivateKey.fromString(localAccount.operator.privateKey);
	const client = Client.forNetwork(localAccount.network)
		.setOperator(localAccount.operator.accountId, privKey);
	/* Query the balance of the ledger funding account */
	const query = await new AccountBalanceQuery()
		.setAccountId("0.0.98")
		.execute(client);
	console.log(query);
})();
