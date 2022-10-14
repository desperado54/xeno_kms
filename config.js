import ENV from './env/test.json' assert {type: "json"};
import XGT_ABI from './metadata/XGToken.json' assert {type: "json"};
import XGT_ADDR from './metadata/XGToken-address.json' assert {type: "json"};
import CHARM_ABI from './metadata/Charm.json' assert {type: "json"};
import CHARM_ADDR from './metadata/Charm-address.json' assert {type: "json"};
import {} from 'dotenv/config';
import {ethers} from 'ethers';
import {getSigners} from './security/crypto.js'

const rpcProviders = {};
const wsProviders = {};
const signers = {};
const networks = [];
const xgtAddresses = {};
const charmAddresses = {};

const keys = Object.keys(ENV);
const pks = await getSigners(keys);
for (let i = 0; i < keys.length; i++) {
    const networkId = keys[i];
    const rpcProvider = new ethers.providers.JsonRpcProvider(ENV[networkId].web3_http_endpoint);
    rpcProviders[networkId] = rpcProvider;
    const wsProvider = new ethers.providers.WebSocketProvider(ENV[networkId].web3_ws_endpoint);
    wsProviders[networkId] = wsProvider;

    const xgtAddress = XGT_ADDR[networkId];
    xgtAddresses[networkId] = xgtAddress;
    const charmAddress = CHARM_ADDR[networkId];
    charmAddresses[networkId] = charmAddress;

    const wlts = [];
    for(let i = 0; i < pks.get(networkId).length; i++) {
        const pk = pks.get(networkId)[i];
        wlts.push(new ethers.Wallet(pk, rpcProvider));
    }
    signers[networkId] = wlts;

    networks.push(networkId);
}

const AssetType = {
    XGT : 'governance token',
    XCHR : 'charm nft'
}
function buildConfig() {
    let config = {
    'networks':networks,
    'AssetType':AssetType,
    'confirmations':24,
    'rpcProviders': rpcProviders,
    'wsProviders': wsProviders,
    'signers': signers,
    //'owner': process.env.OWNER_ADDRESS,
    'xgtABI': XGT_ABI.abi,
    'xgtAddresses': xgtAddresses,
    'charmABI': CHARM_ABI.abi,
    'charmAddresses': charmAddresses,
    'nftStorageToken':process.env.NFT_STORAGE_TOKEN
    };

    console.log('loading.........')
    return config;
}

const config = buildConfig();

export default config;