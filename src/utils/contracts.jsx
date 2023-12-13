import { ethers } from "ethers";
import { ROUTER_ADDR } from "../abis/address";
import ROUTERABI from "../abis/RouterABI.json";

export const RPC_ENDPOINT = "https://evmexplorer.velas.com/rpc";

export const getContract = (abi, address, signer) => {
  const simpleRpcProvider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT);
  const signerOrProvider = signer ?? simpleRpcProvider;
  return new ethers.Contract(address, abi, signerOrProvider);
};

export const getRouterContract = (signer) => {
  return getContract(ROUTERABI, ROUTER_ADDR, signer);
};
