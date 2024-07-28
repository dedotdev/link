import { useEffect, useMemo } from "react"
import Lottie from "react-lottie"
import animationData from "../../assets/resolve.json"
import { Footer } from "./footer"
import toast from "react-hot-toast"
import { hexToString } from "dedot/utils"
import { useInkathon } from "@/provider.tsx"
import useLinkContract from "@/hooks/useLinkContract.ts"

const DELAY = 6000

const DEFAULT_CALLER = '5EeG3x2qiUMU8LkRz4WGyy9kFhLY3u1AQwZz9aidvis58jqj';

export const Resolve: React.FC<{ slug: string }> = ({ slug }) => {
  const { activeAccount } = useInkathon();
  const { contract } = useLinkContract();

  const mounted = useMemo(() => {
    return Date.now()
  }, [])

  useEffect(() => {
    if (!contract) return;

    (async () => {
      const caller = activeAccount?.address || DEFAULT_CALLER;
      const result = await contract.query.resolve(slug, { caller });

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
  }, [contract])

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
