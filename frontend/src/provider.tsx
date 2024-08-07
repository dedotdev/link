import {
  accountArraysAreEqual,
  accountsAreEqual,
  allSubstrateWallets,
  enableWallet,
  getNightlyConnectAdapter,
  getSubstrateChain,
  getSubstrateWallet,
  isWalletInstalled,
  nightlyConnect,
  registerDeployments,
  SubstrateChain,
  SubstrateDeployment,
  SubstrateWallet,
  UseInkathonError,
  UseInkathonErrorCode,
} from "@scio-labs/use-inkathon"
import { InjectedAccount, InjectedExtension, Unsubcall } from "@polkadot/extension-inject/types"
import { Signer } from "@polkadot/types/types"
import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { ApiOptions, DedotClient, ISubstrateClient, LegacyClient, WsProvider } from "dedot"
import { SubstrateApi } from "dedot/chaintypes"
import { RpcVersion } from "dedot/types"

type UseInkathonProviderContextType = {
  isInitializing?: boolean;
  isInitialized?: boolean;
  isConnecting?: boolean;
  isConnected?: boolean;
  error?: UseInkathonError;
  activeChain?: SubstrateChain;
  switchActiveChain?: (chain: SubstrateChain) => Promise<void>;
  api?: ISubstrateClient<SubstrateApi[RpcVersion]>;
  provider?: WsProvider;
  connect?: (chain?: SubstrateChain, wallet?: SubstrateWallet, lastActiveAccountAddress?: string) => Promise<void>;
  disconnect?: () => void;
  accounts?: InjectedAccount[];
  activeAccount?: InjectedAccount;
  activeExtension?: InjectedExtension;
  activeSigner?: Signer;
  setActiveAccount?: Dispatch<SetStateAction<InjectedAccount | undefined>>;
  lastActiveAccount?: InjectedAccount;
  deployments?: SubstrateDeployment[];
  supportedWallets?: SubstrateWallet[];
};

const UseInkathonProviderContext = createContext<UseInkathonProviderContextType | null>(null)

/**
 * Primary useInkathon hook that exposes `UseInkathonProviderContext`.
 */
export const useInkathon = () => {
  const context = useContext(UseInkathonProviderContext)
  if (!context) throw new Error("useInkathon must be used within a UseInkathonProvider")
  return context
}

/**
 * Main provider that needs to be wrapped around the app (see README)
 * to use `useInkathon` and other hooks anywhere.
 */
export interface UseInkathonProviderProps extends PropsWithChildren {
  appName: string
  defaultChain: SubstrateChain | SubstrateChain["network"]
  connectOnInit?: boolean
  deployments?: Promise<SubstrateDeployment[]>
  apiOptions?: ApiOptions
  supportedWallets?: SubstrateWallet[]
}

export const UseInkathonProvider: FC<UseInkathonProviderProps> = ({
                                                                    children,
                                                                    appName,
                                                                    defaultChain,
                                                                    connectOnInit,
                                                                    deployments: _deployments,
                                                                    apiOptions,
                                                                    supportedWallets = allSubstrateWallets,
                                                                  }) => {
  // Check if default chain was provided
  if (
    !defaultChain ||
    (typeof defaultChain === "string" && getSubstrateChain(defaultChain) === undefined)
  ) {
    throw new Error(
      "None or invalid `defaultChain` provided with `UseInkathonProvider`. Forgot to set environment variable?",
    )
  }

  // Setup state variables
  const isInitializing = useRef(false)
  const isInitialized = useRef(false)
  const [isConnecting, setIsConnecting] = useState(connectOnInit)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<UseInkathonError | undefined>()
  const [activeChain, setActiveChain] = useState<SubstrateChain>(
    (typeof defaultChain === "string"
      ? getSubstrateChain(defaultChain)
      : defaultChain) as SubstrateChain,
  )
  const [api, setApi] = useState<ISubstrateClient<SubstrateApi[RpcVersion]>>()
  const [provider, setProvider] = useState<WsProvider>()
  const [accounts, setAccounts] = useState<InjectedAccount[]>([])
  const [activeAccount, setActiveAccount] = useState<InjectedAccount>()
  const [lastActiveAccount, setLastActiveAccount] = useState<InjectedAccount>()
  const activeExtension = useRef<InjectedExtension>()
  const activeSigner = useRef<Signer>()
  const unsubscribeAccounts = useRef<Unsubcall>()
  const [deployments, setDeployments] = useState<SubstrateDeployment[]>([])

  // Register given deployments
  useEffect(() => {
    if (_deployments) registerDeployments(setDeployments, _deployments)
  }, [])

  // Initialize polkadot-js/api
  const initialize = async (chain?: SubstrateChain): Promise<DedotClient | undefined> => {
    isInitializing.current = true
    setIsConnected(false)
    setError(undefined)

    const _chain = chain || activeChain
    let _api: DedotClient | undefined
    let _provider: WsProvider | undefined
    try {
      // The current substrate-contract-node does not seem to working fine
      // with the new JSON-RPC API, we'll use the LegacyClient for now in development
      // For production, we should use the DedotClient which build on top of the new JSON-RPC specs.
      const isDevelopment = _chain.network === 'development';
      const Client = isDevelopment ? LegacyClient : DedotClient;

      const _api = await Client.new({
        provider: new WsProvider(_chain.rpcUrls[0]),
        cacheMetadata: true,
        ...apiOptions,
      });

      _provider = _api.provider as WsProvider;

      api?.disconnect()
      setApi(_api)
      provider?.disconnect()
      setProvider(_provider)
      isInitialized.current = true

      // Update active chain if switching
      if (activeChain.network !== _chain.network) setActiveChain(_chain)
    } catch (e) {
      const message = "Error while initializing Polkadot.js API"
      console.error(message, e)
      setError({ code: UseInkathonErrorCode.InitializationError, message })
      setIsConnected(false)
      setIsConnecting(false)
      setApi(undefined)
      setProvider(undefined)
      isInitialized.current = false
    }

    isInitializing.current = false
    return _api
  }

  // Updates account list and active account
  const updateAccounts = (
    injectedAccounts: InjectedAccount[],
    lastActiveAccountAddress?: string,
  ) => {
    const newAccounts = injectedAccounts || []
    // Find active account in new accounts or fallback to latest account
    const _lastAccount = lastActiveAccountAddress
      ? { address: lastActiveAccountAddress }
      : lastActiveAccount
    const newAccount =
      newAccounts.find((a) => accountsAreEqual(a, _lastAccount)) || newAccounts?.[0]

    // Update accounts and active account
    if (!accountArraysAreEqual(accounts, newAccounts)) {
      setAccounts(() => newAccounts)
    }
    if (!accountsAreEqual(activeAccount, newAccount)) {
      setActiveAccount(() => newAccount)
    }
    setIsConnected(!!newAccount)
  }
  useEffect(() => {
    if (activeAccount && !accountsAreEqual(activeAccount, lastActiveAccount)) {
      setLastActiveAccount(() => activeAccount)
    }
  }, [activeAccount])

  // Connect to injected wallet
  const connect = async (
    chain?: SubstrateChain,
    wallet?: SubstrateWallet,
    lastActiveAccountAddress?: string,
    isInitialConnect?: boolean,
  ) => {
    setError(undefined)
    setIsConnecting(true)
    setIsConnected(!!activeAccount)

    // Make sure api is initialized & connected to provider
    if (!(api?.status === 'connected') || (chain && chain.network !== activeChain.network)) {
      const _api = await initialize(chain)
      if (!(_api?.status === 'connected')) return
    }

    try {
      // Determine installed wallets
      const wallets = supportedWallets.filter((w) => {
        if (!isWalletInstalled(w)) return false
        // Prevent NightlyConnect to pop up on init when no other wallet is available
        if (isInitialConnect && w.id === nightlyConnect.id) return false
        return true
      })
      if (!wallets?.length) {
        const message = "No Substrate-compatible extension detected"
        setError({
          code: UseInkathonErrorCode.NoSubstrateExtensionDetected,
          message,
        })
        throw new Error(message)
      }

      // Determine wallet to use
      const preferredWallet = wallet && wallets.find((w) => w.id === wallet.id)
      const _wallet = preferredWallet || wallets[0]

      // Enable wallet
      const extension = await enableWallet(_wallet, appName)
      activeExtension.current = extension
      activeSigner.current = extension?.signer as Signer

      // Query & keep listening to injected accounts
      unsubscribeAccounts.current?.()
      const unsubscribe = extension?.accounts.subscribe((accounts) => {
        updateAccounts(accounts, lastActiveAccountAddress)
      })
      unsubscribeAccounts.current = unsubscribe
    } catch (e: any) {
      console.error("Error while connecting wallet:", e)
      activeExtension.current = undefined
      activeSigner.current = undefined
      setIsConnected(false)
    } finally {
      setIsConnecting(false)
    }
  }

  // Keep active signer up to date
  useEffect(() => {
    api?.setSigner(activeSigner.current as Signer)
  }, [api, activeSigner.current])

  // Disconnect
  const disconnect = async (disconnectApi?: boolean) => {
    if (disconnectApi) {
      await provider?.disconnect()
      await api?.disconnect()
      return
    }
    if (activeExtension.current?.name === nightlyConnect.id) {
      const adapter = await getNightlyConnectAdapter(appName)
      await adapter?.disconnect()
    }
    setIsConnected(false)
    updateAccounts([])
    unsubscribeAccounts.current?.()
    unsubscribeAccounts.current = undefined
    activeExtension.current = undefined
    activeSigner.current = undefined
    isInitialized.current = false
  }

  // API Disconnection listener
  useEffect(() => {
    if (!api) return
    const handler = () => {
      disconnect()
    }
    api?.on("disconnected", handler)
    return () => {
      api?.off("disconnected", handler)
    }
  }, [api])

  // Initialize
  useEffect(() => {
    if (isInitialized.current || isInitializing.current) return
    connectOnInit ? connect(undefined, undefined, undefined, true) : initialize()
    return () => {
      unsubscribeAccounts.current?.()
    }
  }, [])

  // Switch active chain
  const switchActiveChain = async (chain: SubstrateChain) => {
    const activeWallet = activeExtension.current && getSubstrateWallet(activeExtension.current.name)
    await connect(chain, activeWallet)
  }

  return (
    <UseInkathonProviderContext.Provider
      value={{
        isInitializing: isInitializing.current,
        isInitialized: isInitialized.current,
        isConnecting,
        isConnected,
        error,
        activeChain,
        switchActiveChain,
        api,
        provider,
        connect,
        disconnect,
        accounts,
        activeAccount,
        activeExtension: activeExtension.current,
        activeSigner: activeSigner.current,
        setActiveAccount,
        lastActiveAccount,
        deployments,
        supportedWallets,
      }}
    >
      {children}
    </UseInkathonProviderContext.Provider>
  )
}
