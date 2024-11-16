import { AccountData, DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { useContext, useEffect, useState } from "react";
import { NilChainAddressPrefix } from "@nillion/client-core";
import { SigningStargateClient } from "@cosmjs/stargate";
import { NillionContext, UserCredentials } from "@nillion/client-react-hooks";
import { UserCredentials as ClientUserCredentials } from "@nillion/client-vms";

export function useNillionWallet() {
  const context = useContext(NillionContext);
  if (!context) {
    throw new Error(
      "NillionContext not set; did you wrap your app with `<NillionProvider>`?",
    );
  }

  const [stuff, setStuff] = useState<{
    providerWithSigner: SigningStargateClient | null;
    acc0: AccountData | null;
  }>({ providerWithSigner: null, acc0: null });

  const SEED = "example-secret-seed";

  // TODO generate this for a new user
  const SECRET_KEY =
    "090457f88be8a82c39533e68edbb055e899152a0aff6a4402f9f31f2cc87fae4";

  // TODO move to env or something
  const RPC = "https://nillion-testnet.rpc.decentrio.ventures";
  const privateKey = Uint8Array.from(Buffer.from(SECRET_KEY, "hex"));

  useEffect(() => {
    (async () => {
      const signer = await DirectSecp256k1Wallet.fromKey(
        privateKey,
        NilChainAddressPrefix,
      );

      let acc = await signer.getAccounts();
      let acc0 = acc[0];

      const providerWithSigner = await SigningStargateClient.connectWithSigner(
        RPC,
        signer,
      );
      providerWithSigner;

      const credentials: UserCredentials = {
        userSeed: SEED,
        signer: async () => signer,
      };
      context.client.setUserCredentials(
        credentials as unknown as ClientUserCredentials,
      );
      await context.client.connect();

      setStuff({ providerWithSigner, acc0 });
    })();
  }, []); // TODO add pk stuff here

  return stuff;
}

// export function useNillionAuth(): UseNillionAuthContext {
//     const context = useContext(NillionContext);
//     if (!context) {
//       throw new Error(
//         "NillionContext not set; did you wrap your app with `<NillionProvider>`?",
//       );
//     }

//     const authenticated = context.client.ready;

//     return {
//       authenticated,
//       login: (credentials: UserCredentials) => {
//         if (authenticated) {
//           Log("Client already logged in.");
//           return Promise.resolve(true);
//         } else {
//           const creds = { ...credentials };
//           if (!creds.signer) {
//             creds.signer = "keplr";
//           }
//           context.client.setUserCredentials(
//             creds as unknown as ClientUserCredentials,
//           );
//           return context.client.connect();
//         }
//       },
//       logout: context.logout,
//     };
//   }
