import { useWallet } from "../hooks/useWallet";

export default function WalletComponent() {
  const { address, progress } = useWallet();

  return (
    <div
      className="flex flex-col items-center justify-center space-y-6 w-full max-w-2xl mx-auto"
      style={{ color: "black" }}
    >
      {address && (
        <div className="w-full text-center">
          <p
            className="bg-gray-100 text-gray-700 font-bold border border-gray-300 rounded-md py-2 px-4 mx-auto inline-block mt-4"
            style={{ maxWidth: "90%" }}
          >
            Address: {address}
          </p>
        </div>
      )}
      <p>
        {progress === 1 ? <p>Logging in...</p> : null}
        {progress === 2 ? <p>Logged in!</p> : null}
      </p>
    </div>
  );
}
