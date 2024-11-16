import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface NFCData {
  serialNumber: string;
  records: Array<{
    recordType: string;
    data: string;
    encoding?: string;
    lang?: string;
  }>;
  timestamp: string;
}

interface NFCDataDisplayProps {
  data: NFCData;
  onClose: () => void;
}

interface UserProfile {
  uuid: string;
  name: string;
  title: string | null;
  bio: string;
  avatar: {
    fullUrl: string;
  };
}

interface APIResponse {
  success: boolean;
  message: UserProfile;
}

export default function NFCDataDisplay({ data, onClose }: NFCDataDisplayProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        // Find the URL record
        const urlRecord = data.records.find(
          (record) =>
            record.recordType === "url" ||
            (record.recordType === "text" && record.data.startsWith("http"))
        );
        if (!urlRecord) {
          throw new Error("No valid URL found in NFC tag");
        }

        const response = await fetch(
          "https://api.nadaplaza.bytes31.com/trsage",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              apiUrl: urlRecord.data,
            }),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const result: APIResponse = await response.json();
        if (result.success) {
          setUserProfile(result.message);
        } else {
          throw new Error("Failed to get user profile");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [data]);

  return (
    <div className='bg-white rounded-lg shadow-lg p-6 max-w-lg w-full mx-auto'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center space-x-2'>
          <CheckCircle2 className='h-6 w-6 text-green-500' />
          <h2 className='text-xl font-semibold text-gray-900'>
            Tag Scanned Successfully
          </h2>
        </div>
        <button
          onClick={onClose}
          className='text-gray-500 hover:text-gray-700 text-2xl'
        >
          ×
        </button>
      </div>

      {loading && (
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading profile...</p>
        </div>
      )}

      {error && (
        <div className='bg-red-50 text-red-600 p-4 rounded-lg'>{error}</div>
      )}

      {userProfile && (
        <div className='space-y-6'>
          <div className='flex flex-col items-center'>
            <img
              src={userProfile.avatar.fullUrl}
              alt={userProfile.name}
              className='w-32 h-32 rounded-full object-cover shadow-lg'
            />
            <h3 className='mt-4 text-2xl font-bold text-gray-900'>
              {userProfile.name}
            </h3>
            {userProfile.title && (
              <p className='text-gray-600'>{userProfile.title}</p>
            )}
          </div>

          <div className='border-t pt-4'>
            <p className='text-sm text-gray-500'>
              Scanned at: {data.timestamp}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
