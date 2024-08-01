<img src="./.images/header.png" />

# link! ‒ The Unstoppable URL Shortener<br/> ![built-with-ink][i1]

[i1]: /.images/badge_flat.svg


### Overview

This is a port of https://tiny.ink using [Dedot](https://dedot.dev) to show-case how dapps can interact with ink! smart contracts with type-safe APIs from Dedot.

The dapp is live at: https://link.dedot.dev.

The contract is deployed on [POP Network](https://popnetwork.xyz/) ([address](https://github.com/dedotdev/link/blob/master/contracts/deployments/link/pop-network.ts))

### Development

1. Generate [Types & APIs](https://github.com/dedotdev/link/tree/master/contracts/deployments/types/link) for the link contract using dedot cli

```shell
pnpm typink

# OR
dedot typink -m ./contracts/deployments/link/link.json -o ./contracts/deployments/types
```

2. Deploy the contract. Make sure to have a local [subtrate-contract-node](https://github.com/paritytech/substrate-contracts-node) running on you local at https://127.0.0.1:9944

```sh
# In `contracts` folder
pnpm run script deploy
```

3. Create a `.env.local` to specify default chain for local development in `frontend` folder

```.env
VITE_DEFAULT_CHAIN='development'
```

4. Start development application

```shell
pnpm dev
```
