import { useWallet } from "../hooks/useWallet";

export default function WalletComponent() {
  const { address, progress } = useWallet();

  return (
    <div
      className="flex flex-col items-center justify-center space-y-6 w-full max-w-2xl mx-auto"
      style={{ color: "black" }}
    >
      {address && <p>Address: {address}</p>}
      <p>
        {progress === 1 ? <p>Logging in...</p> : null}
        {progress === 2 ? <p>Logged in!</p> : null}
      </p>
    </div>
  );
}
