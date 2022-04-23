const BN = require('bn.js');

const {
  connect,
  utils,
  keyStores,
  transactions
} = require('near-api-js');


// Wallet config
const WALLET_ACCOUNT_ID = 'my-account.testnet';
const privateKey = process.env.SENDER_PRIVATE_KEY;

const TOKEN_CONTRACT_ID = 'f5cfbc74057c610c8ef151a439252680ac68c6dc.factory.bridge.near';

// Target account to transfer token
const TARGET_ACCOUNT_ID = 'sub-acct2.my-account.testnet';

// Network config
const NETWORK_ID = 'testnet';
const DEFAULT_GAS = new BN('120000000000000');

const keyPair = utils.KeyPair.fromString(privateKey);
const keyStore = new keyStores.InMemoryKeyStore();

keyStore.setKey(NETWORK_ID, WALLET_ACCOUNT_ID, keyPair);

const nearConfig = {
  networkId: NETWORK_ID,
  keyStore,
  nodeUrl: `https://rpc.${NETWORK_ID}.near.org`,
  walletUrl: `https://wallet.${NETWORK_ID}.near.org`,
  helperUrl: `https://helper.${NETWORK_ID}.near.org`,
}

async function main() {

  const near = await connect(nearConfig);
  const account = await near.account(WALLET_ACCOUNT_ID);

  console.log('Sending transactions...');

  const depositTx = transactions.functionCall(
    'storage_deposit',
    { account_id: TARGET_ACCOUNT_ID },
    DEFAULT_GAS,
    new BN('12500000000000000000000')
  );

  const transferTx = transactions.functionCall(
    'ft_transfer',
    {
      receiver_id: TARGET_ACCOUNT_ID,
      amount: new BN(1).mul(new BN(10).pow(new BN(17))).toString()
    },
    DEFAULT_GAS,
    1
  );

  const receipt = await account.signAndSendTransaction({
    receiverId: TOKEN_CONTRACT_ID,
    actions: [depositTx, transferTx]
  });

  console.log(receipt);
}

main();