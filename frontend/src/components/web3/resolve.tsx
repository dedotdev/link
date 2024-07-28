import { useInkathon } from "@scio-labs/use-inkathon"
import { useEffect, useMemo, useState } from "react"
import Lottie from "react-lottie"
import animationData from "../../assets/resolve.json"
import { Footer } from "./footer"
import toast from "react-hot-toast"
import { DedotClient, WsProvider } from "dedot"
import { Contract } from "dedot/contracts"
import { LinkContractApi } from "@/contracts/link"
import { hexToString } from "@polkadot/util"

const DELAY = 6000

export const Resolve: React.FC<{ slug: string }> = ({ slug }) => {
  const { activeAccount, activeChain, deployments } = useInkathon();
  const [client, setClient] = useState<DedotClient>();

  const mounted = useMemo(() => {
    return Date.now()
  }, [])

  useEffect(() => {
    if (!activeChain) return;

    DedotClient.new(new WsProvider(activeChain.rpcUrls[0]))
      .then(setClient);
  }, [activeChain]);

  useEffect(() => {
    if (!client || !deployments || !activeChain) return;

    (async () => {
      const deployment = deployments.find(d => activeChain.network === d.networkId)!;

      const contract = new Contract<LinkContractApi>(client, deployment.abi as any, deployment.address.toString());
      const result = await contract.query.resolve(slug, { caller: activeAccount?.address || '5EeG3x2qiUMU8LkRz4WGyy9kFhLY3u1AQwZz9aidvis58jqj' });

      if (result.isOk && result.data.isOk) {
        if (result.data.value) {
          const location = hexToString(result.data.value);
          console.log('Resolved Location', location);

          if (mounted + DELAY < Date.now()) {
            window.location.href = location;
          } else {
            setTimeout(
              () => {
                window.location.href = location;
              },
              DELAY - (Date.now() - mounted),
            )
          }
        } else {
          toast.error(`No register url at slug: ${slug}`);
          setTimeout(() =>{
            window.location.href = `/?slug=${slug}`;
          }, 2_000);
        }
      } else {
        console.error(result);
        toast.error("Unable to resolve link")
      }
    })();
  }, [client, deployments])

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <main className="flex h-screen w-screen flex-col items-center justify-center">
        <div className="pointer-events-none">
          <Lottie
            speed={2.5}
            options={{
              loop: false,
              autoplay: true,

              animationData: animationData,

              rendererSettings: {
                preserveAspectRatio: "xMidYMid slice",
              },
            }}
            height={400}
            width={400}
          />
        </div>
        <h1 className="text-2xl text-ink-text">Upscaling link...</h1>

        <a href="/" className="underline" target="_blank">
          Shrink your own link?
        </a>
      </main>
      <div className="w-full py-2">
        <Footer />
      </div>
    </div>
  )
}
