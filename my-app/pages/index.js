import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState, useEffect, useRef } from 'react';
import { providers, Contract } from "ethers";
import Web3Modal, { getInjectedProviderName } from "web3modal";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {

  const [provider, setProvider] = useState();
  const [account, setAccount] = useState();

  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState('unknown');
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedWalletName, setConnectedWalletName] = useState(null);
  const web3ModalRef = useRef();
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading, setLoading] = useState(false);


  const getNumberOfWhitelisted = async() => {
    try{
      const provider = await getProviderOrSigner()
      const whitelistContract = new Contract(WHITELIST_CONTRACT_ADDRESS, abi, provider)
      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted()
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch(error){
      console.error("getNumberofWhitelisted: ",error);
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
      console.error("checkIfAddressInWhitelisted: ",error);
    }
  }
  
  const getProviderOrSigner = async(needSigner = false) => {
    try {
      // connect Metamask
      // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
      const instance = await web3ModalRef.current.connect();
      setProvider(instance);
      const provider = new providers.Web3Provider(instance);
      const accounts = await provider.listAccounts();
      if(accounts) setAccount(accounts[0]);
      setWalletConnected(true);
      const providerName = getInjectedProviderName();
      setConnectedWalletName(providerName);
      // If user is not connected to the Rinkeby network, throw an error
      const { chainId } = await provider.getNetwork();
      if (chainId !== 5) {
        throw new Error("Change network to Goerli");
      }

      if (needSigner) {
        const signer = provider.getSigner();
        return signer;
      }
      return provider;

    } catch(error) {
      window.alert(error);
      console.error("getProviderOrSigner: ",error);
    }
  };  

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
      console.error("addToWhitelist: ",error);
    }
  }

  const disconnectWallet = async() => {
    await web3ModalRef.current.clearCachedProvider();
    setWalletConnected(false);
    setConnectedWalletName();
    setAccount();
  }

  const connectWallet = async() => {
    try {
      await getProviderOrSigner();
      //setWalletConnected(true);
      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (error) {
      console.error("getNumberofWhitelisted: ",error);
    }
  }

  const renderButton = () => {
    if(walletConnected){  
      if(loading) {
        return ( 
          <>
            <button className={styles.button}>loading...</button>
            <button onClick={disconnectWallet} className={styles.button}>Disconnect Wallet</button>
          </> 

        )
      }
      else if(!joinedWhitelist){
        return(
          <>
            <button className={styles.button} onClick={addToWhitelist}>Join Whitelist</button>
            <button onClick={disconnectWallet} className={styles.button}>Disconnect Wallet</button>
          </>
        ) 
      } else {
        return(
          <div className={styles.description}>
            Thankyou for joining the whitelist!
            <button onClick={disconnectWallet} className={styles.button}>Disconnect Wallet</button> 
          </div>
        )
      }
    } else {
      return <button onClick={connectWallet} className={styles.button}>Connect Wallet</button>
    }
  }

  const funcConnectedWalletName = () => {
    if(!walletConnected)
      return(
        <p>No wallet connected</p>
      )

    else return (<p>{connectedWalletName} is the connected wallet</p>)
  }

  const providerOptions = {
    binancechainwallet: {
      package: true
    }
  };

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        console.log("accountsChanged", accounts);
        if (accounts) setAccount(accounts[0]);
        checkIfAddressInWhitelist();
      };
      
      provider.on("accountsChanged", handleAccountsChanged);
    }
  }, [provider]);

  useEffect(() => {
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby", // optional
        cacheProvider: true, // optional
        providerOptions, // required
        disableInjectedProvider: false,
        theme:'dark'
      });      
    }
  },[walletConnected]);


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
            {funcConnectedWalletName()}
            <p>Current Account : {account}</p>
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