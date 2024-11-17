import { useWallet } from "../hooks/useWallet";

interface Props {
  address: string;
  progress: number;
}

export default function WalletComponent(props: Props) {
  const { address, progress } = props;
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
      <div className="mt-4">
        {progress === 1 && (
          <div
            className="text-blue-600 bg-blue-100 border border-blue-300 rounded-md py-2 px-4 text-center max-w-sm mx-auto"
            style={{ fontWeight: "bold" }}
          >
            Logging in...
          </div>
        )}
        {progress === 2 && (
          <div
            className="text-green-600 bg-green-100 border border-green-300 rounded-md py-2 px-4 text-center max-w-sm mx-auto"
            style={{ fontWeight: "bold" }}
          >
            Logged in!
          </div>
        )}
      </div>
    </div>
  );
}
