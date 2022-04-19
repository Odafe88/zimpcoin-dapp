import React, { useState, useEffect } from "react"
import { ethers, utils } from "ethers"

import abi from "./contract/Zimp.json"

function App() {

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [inputValue, setInputValue] = useState({ walletAddress: "", transferAmount: "", burnAmount: "", mintAmount: "" });
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenTotalSupply, setTokenTotalSupply] = useState(0);
  const [isTokenOwner, setIsTokenOwner] = useState(false);
  const [tokenOwnerAddress, setTokenOwnerAddress] = useState(null);
  const [yourWalletAddress, setYourWalletAddress] = useState(null);
  const [error, setError] = useState(null);


  const contractAddress = '0xDA4B3B7E3Ee3dE4cB02bDD62469c4C53e46E669c';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        setIsWalletConnected(true);
        setYourWalletAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Install a MetaMask wallet to get our token.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getTokenInfo = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        let tokenName = await tokenContract.name();
        let tokenSymbol = await tokenContract.symbol();
        let tokenOwner = await tokenContract.owner();
        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply)

        setTokenName(`${tokenName}`);
        setTokenSymbol(tokenSymbol);
        setTokenTotalSupply(tokenSupply);
        setTokenOwnerAddress(tokenOwner);

        if (account.toLowerCase() === tokenOwner.toLowerCase()) {
          setIsTokenOwner(true)
        }
      }
    } catch (error) {
      console.log(error);
    }
  }


  const transferToken = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await tokenContract.transfer(inputValue.walletAddress, utils.parseEther(inputValue.transferAmount));
        console.log("Transfering tokens...");
        await txn.wait();
        console.log("Tokens Transfered", txn.hash);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const burnTokens = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await tokenContract.burn(utils.parseEther(inputValue.burnAmount));
        console.log("Burning tokens...");
        await txn.wait();
        console.log("Tokens burned...", txn.hash);

        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply)
        setTokenTotalSupply(tokenSupply);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const mintTokens = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);

        let tokenOwner = await tokenContract.owner();
        const txn = await tokenContract.mint(tokenOwner, utils.parseEther(inputValue.mintAmount));
        console.log("Minting tokens...");
        await txn.wait();
        console.log("Tokens minted...", txn.hash);

        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply)
        setTokenTotalSupply(tokenSupply);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our token.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getTokenInfo();
  }, [])


  return (
    <div className="mx-0 my-0 min-h-screen bg-black text-white py-8">
      <main className="mx-8 my-4  border-4 border-slate-800 rounded-lg">
        <div className="text-xl p-2 text-center sm: text-left text-4xl sm:py-5 border-b-4 border-slate-800 sm:px-10 bg-gray-900 font-bold text-violet-400 text-center">
          <h2 className="headline">
            <span className="bg-clip-text text-transparent bg-gradient-to-tr from-indigo-500 to-purple-900">Zimp Coin</span>
          </h2>
        </div>
        <section className="customer-section px-4 text-center lg:px-10 pt-5 pb-10">
          {error && <p className="text-2xl text-red-700">{error}</p>}
          <div className="mt-5 flex text-center">
            <span className="mx-2 lg:mr-5mx-2 lg:mr-5"><strong>Coin:</strong> {tokenName} </span>
            <span className="mx-2 lg:mr-5"><strong>Ticker:</strong>  {tokenSymbol} </span>
            <span className="mx-2 lg:mr-5"><strong>Total Supply:</strong>  {tokenTotalSupply}</span>
          </div>
          <div className="mt-7 mb-9">
            <form className="flex flex-col border rounded-lg border-gray-600">
              <input
                type="text"
                className="px-6 py-3 text-white border-none rounded-t-lg outline-none bg-gray-800 placeholder-gray-200 focus: placeholder-transparent focus-within:ring-indigo-500 z-40"
                onChange={handleInputChange}
                name="walletAddress"
                placeholder="Wallet Address"
                value={inputValue.walletAddress}
              />
              <input
                type="text"
                className="px-6 py-3 text-white border-none outline-none bg-gray-800 placeholder-gray-200 focus: placeholder-transparent focus-within:ring-indigo-500"
                onChange={handleInputChange}
                name="transferAmount"
                placeholder={`0.0000 ${tokenSymbol}`}
                value={inputValue.transferAmount}
              />
              <button
                className="font-bold px-4 py-3 text-sm tracking-wider text-gray-100 uppercase transition-colors duration-200 transform bg-indigo-800 hover: bg-indigo-700"
                onClick={transferToken}>Transfer Tokens</button>
            </form>
          </div>
          {isTokenOwner && (
            <section className="">
              <div className="mt-10 mb-10">
                <form className="flex flex-col border rounded-lg border-gray-600">
                  <input
                    type="text"
                    className="px-6 py-3 text-gray-100 border-none rounded-t-lg outline-none bg-gray-800 placeholder-gray-200 focus: placeholder-transparent focus-within:ring-indigo-500 z-40"
                    onChange={handleInputChange}
                    name="burnAmount"
                    placeholder={`0.0000 ${tokenSymbol}`}
                    value={inputValue.burnAmount}
                  />
                  <button
                    className="font-bold px-4 py-3 text-sm tracking-wider text-gray-100 uppercase transition-colors duration-200 transform bg-indigo-800 hover: bg-indigo-700 z-30"
                    onClick={burnTokens}>
                    Burn Tokens
                  </button>
                </form>
              </div>
              <div className="mt-10 mb-10">
                <form className="flex flex-col border rounded-lg border-gray-600">
                  <input
                    type="text"
                    className="px-6 py-3 text-gray-100 border-none rounded-t-lg outline-none bg-gray-800 placeholder-gray-200 focus: placeholder-transparent focus-within:ring-indigo-500 z-40"
                    onChange={handleInputChange}
                    name="mintAmount"
                    placeholder={`0.0000 ${tokenSymbol}`}
                    value={inputValue.mintAmount}
                  />
                  <button
                    className="font-bold px-4 py-3 text-sm tracking-wider text-gray-100 uppercase transition-colors duration-200 transform bg-indigo-800 hover: bg-indigo-700 z-30"
                    onClick={mintTokens}>
                    Mint Tokens
                  </button>
                </form>
              </div>
            </section>
          )}
          <div className="mt-5">
            <p className="font-sm lg:font-bold"><span className="font-sm">Contract Address: </span>{contractAddress}</p>
          </div>
          <div className="mt-5">
            <p><span className="font-sm font-semibold lg:font-bold">Token Owner Address: </span>{tokenOwnerAddress}</p>
          </div>
          <div className="mt-5">
            {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{yourWalletAddress}</p>}
            <button className="bg-indigo-500 px-5 py-3 mt-5 rounded-lg text-slate-100 font-bold" onClick={checkIfWalletIsConnected}>
              {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
            </button>
          </div>

        </section>
      </main>
    </div>
  );
}

export default App;
