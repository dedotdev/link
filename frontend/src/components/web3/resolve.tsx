import { useEffect, useMemo, useState } from "react"
import Lottie from "react-lottie"
import animationData from "../../assets/resolve.json"
import { Footer } from "./footer"
import toast from "react-hot-toast"
import { hexToString } from "dedot/utils"
import { useInkathon } from "@/provider.tsx"
import useLinkContract from "@/hooks/useLinkContract.ts"

const DELAY = 2000;

const DEFAULT_CALLER = "5EeG3x2qiUMU8LkRz4WGyy9kFhLY3u1AQwZz9aidvis58jqj"

export const Resolve: React.FC<{ slug: string }> = ({ slug }) => {
  const { activeAccount } = useInkathon()
  const { contract } = useLinkContract()
  const [notFound, setNotFound] = useState<boolean>()

  const mounted = useMemo(() => {
    return Date.now()
  }, [])

  useEffect(() => {
    if (!contract) return;

    (async () => {
      try {
        const caller = activeAccount?.address || DEFAULT_CALLER
        const { data } = await contract.query.resolve(slug, { caller })

        if (data) {
          const location = hexToString(data)
          console.log("Resolved url", location)

          if (mounted + DELAY < Date.now()) {
            window.location.href = location
          } else {
            setTimeout(
              () => {
                window.location.href = location
              },
              DELAY - (Date.now() - mounted),
            )
          }
        } else {
          toast.error(`No registered url for slug: ${slug}`)
          setNotFound(true)
        }
      } catch (e: any) {
        console.error(e) // DispatchError, LangError ...
        toast.error("Unable to resolve link")
      }
    })()
  }, [contract])

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <main className="flex h-screen w-screen flex-col items-center justify-center">
        {notFound ? (
          <>
            <h1 className="text-[48px] mb-4 text-red-500">Oops!</h1>
            <h1 className="text-2xl mb-8">Slug <b className='text-ink-text'>{slug}</b> not found.</h1>

            <a href="/" className="underline" target="_blank">
              Shrink your own link?
            </a>
          </>
        ) : (
          <>
            <div className="pointer-events-none">
              <Lottie
                speed={4}
                options={{
                  loop: false,
                  autoplay: true,
                  animationData: animationData,
                  rendererSettings: {
                    preserveAspectRatio: "xMidYMid slice",
                  },
                }}
                height={600}
                width={600}
              />
            </div>
            <h1 className="text-2xl text-ink-text">Upscaling link...</h1>

            <a href="/" className="underline" target="_blank">
              Shrink your own link?
            </a>
          </>
        )}
      </main>
      <div className="w-full py-2">
        <Footer />
      </div>
    </div>
  )
}
