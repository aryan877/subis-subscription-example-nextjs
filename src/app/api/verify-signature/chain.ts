// Define the Chain interface
interface Chain {
  id: number;
  name: string | null;
  rpcUrl: string | null;
  blockExplorerUrl?: string | null;
  unsupported?: boolean;
}

// Define the chains object with the Chain type
const chains: Record<string, Chain> = {
  zkSync: {
    id: 324,
    name: "zkSync",
    rpcUrl: "https://mainnet.era.zksync.io",
    blockExplorerUrl: "https://explorer.zksync.io",
  },
  zkSyncSepoliaTestnet: {
    id: 300,
    name: "zkSync Sepolia Testnet",
    rpcUrl: "https://rpc.ankr.com/eth_sepolia",
    blockExplorerUrl: "https://sepolia.etherscan.io",
  },
  zkSyncGoerliTestnet: {
    id: 280,
    name: "zkSync Goerli Testnet",
    rpcUrl: "https://testnet.era.zksync.dev",
    blockExplorerUrl: "https://goerli.explorer.zksync.io",
  },
  dockerizedLocalNode: {
    id: 270,
    name: "Dockerized local node",
    rpcUrl: "http://localhost:3050",
    blockExplorerUrl: "http://localhost:3010",
  },
  inMemoryLocalNode: {
    id: 260,
    name: "In-memory local node",
    rpcUrl: "http://127.0.0.1:8011",
  },
};

// Define the defaultChain object with the Chain type
const defaultChain: Chain = chains.zkSync;

export { chains, defaultChain };
