import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState, useEffect, useRef } from 'react';
import { providers, Contract } from "ethers";
import Web3Modal, { getInjectedProviderName } from "web3modal";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  const [_provider, setProvider] = useState(null);

  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedWalletName, setConnectedWalletName] = useState(null);
  const web3ModalRef = useRef();
  const [joinedWhitelist, setJoinedWhitelist] = useState(null);
  const [loading, setLoading] = useState(false);

  const getNumberOfWhitelisted = async() => {
    try{
      const provider = await getProviderOrSigner()
      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, provider)
      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted()
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch(error){
      console.error(error);
      window.alert(`getNumberofWhitelisted function says: ${error}`)
    }
  }

  const checkIfAddressInWhitelist = async() => {
    try{
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);
      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(address);
      setJoinedWhitelist(_joinedWhitelist);
    } catch(error){
      console.error(error);
      window.alert(`function checkIfAddressInWhitelist says: ${error}`);
    }
  }
  
  const getProviderOrSigner = async(needSigner = false) => {
    try {
      // Connect to Metamask
      // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
      const instance = await web3ModalRef.current.connect();
      const provider = new providers.Web3Provider(instance);
      setProvider(provider);
      const providerName = getInjectedProviderName()
      setConnectedWalletName(providerName);
      provider.on("disconnect", () => {
        window.alert("wallet disconnected");
      });

      // If user is not connected to the Rinkeby network, let them know and throw an error
      const { chainId } = await provider.getNetwork();
      if (chainId !== 4) {
        window.alert("Change the network to Rinkeby");
        throw new Error("Change network to Rinkeby");
      }

      if (needSigner) {
        const signer = provider.getSigner();
        return signer;
      }
      return provider;

    } catch(error) {
      console.error(error);
      window.alert(`function getProviderOrSigner says: ${error}`);
    }
  };
  
  const connectWallet = async() => {
    try {
      // Get the provider from web3Modal
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (error) {
      console.error(error);
      window.alert(`function getProviedOrSigner: ${error}`)
    }
  }

  const addToWhitelist = async() => {
    try {
      //setLoading(true);
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, signer);
      const tx = await whitelistContract.addingAddresses();
      window.alert(`tx initiated`);
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      // get the updated number of addresses in the whitelist
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
      // await whitelistContract.addingAddresses();
      // setLoading(false);
      // await getNumberOfWhitelisted();
      // setJoinedWhitelist(true);
    } catch(error) {
      window.alert(`addToWhitelist says: ${error}`);
      console.error(error);
    }
  }

  const renderButton = () => {
    if(walletConnected){  
      if(loading) {
        return <button className={styles.button}>loading...</button>
      }
      else if(!joinedWhitelist){
        return <button className={styles.button} onClick={addToWhitelist}>Join Whitelist</button>
      } else {
        return(
          <div className={styles.description}>
            Thankyou for joining the whitelist!
          </div>
        )
      }
    } else {
      return <button onClick={connectWallet} className={styles.button}>Connect Wallet</button>
    }
  }
  
  const providerOptions = {
    binancechainwallet: {
      package: true
    }
  };

  useEffect(() => {
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby", // optional
        cacheProvider: true, // optional
        providerOptions, // required
        disableInjectedProvider: false
      });      
    }
    connectWallet();
  },[walletConnected])

  // _provider.on("accountsChanged", (a) => {
  //   window.location.reload();
  // });

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name = 'description' content = 'Whitelist-Dapp'/>
        <link rel = 'icon' href = '/favicon.ico' />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
            <p>{connectedWalletName} is the selected provider</p>
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>
      <footer className={styles.footer}>
        Made with &#10084; by Manav
      </footer>
    </div>
  )
}