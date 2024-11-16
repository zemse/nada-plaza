import { CheckCircle2 } from "lucide-react";

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

export default function NFCDataDisplay({ data, onClose }: NFCDataDisplayProps) {
  return (
    <div className='bg-white rounded-lg shadow-lg p-6 max-w-lg w-full mx-auto'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center space-x-2'>
          <CheckCircle2 className='h-6 w-6 text-green-500' />
          <h2 className='text-xl font-semibold text-gray-900'>
            Tag Scanned Successfully
          </h2>
        </div>
        <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
          ×
        </button>
      </div>

      <div className='space-y-4'>
        <div className='border-b pb-2'>
          <p className='text-sm text-gray-500'>Serial Number</p>
          <p className='font-mono text-gray-900'>{data.serialNumber}</p>
        </div>

        <div>
          <p className='text-sm text-gray-500 mb-2'>Records</p>
          {data.records.map((record, index) => (
            <div key={index} className='bg-gray-50 rounded-md p-3 mb-2'>
              <p className='text-sm font-medium text-gray-700'>
                Type: {record.recordType}
              </p>
              {record.encoding && (
                <p className='text-sm text-gray-600'>
                  Encoding: {record.encoding}
                </p>
              )}
              {record.lang && (
                <p className='text-sm text-gray-600'>Language: {record.lang}</p>
              )}
              <p className='mt-1 font-mono text-sm break-all'>{record.data}</p>
            </div>
          ))}
        </div>

        <div className='text-right text-sm text-gray-500'>
          Scanned at: {data.timestamp}
        </div>
      </div>
    </div>
  );
}