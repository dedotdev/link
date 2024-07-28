import { Contract } from "dedot/contracts"
import { LinkContractApi } from "@/contracts/link"
import { useInkathon } from "@/provider.tsx"
import { useEffect, useState } from "react"

export default function useLinkContract() {
  const [contract, setContract] = useState<Contract<LinkContractApi>>()
  const { api, activeChain, deployments } = useInkathon();

  useEffect(() => {
    if (!api || !activeChain || !deployments) return;

    const deployment = deployments.find(d => activeChain.network === d.networkId)!;

    const contract = new Contract<LinkContractApi>(api, deployment.abi as any, deployment.address.toString());
    setContract(contract);
  }, [api, activeChain, deployments])

  return { contract };
}
