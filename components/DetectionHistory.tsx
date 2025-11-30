
import React from 'react';
import { HistoryEntry } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { FiEye, FiTrash2 } from 'react-icons/fi';

interface DetectionHistoryProps {
  history: HistoryEntry[];
  onViewReport: (entry: HistoryEntry) => void;
  onDelete: (entryId: string) => void;
}

const DetectionHistory: React.FC<DetectionHistoryProps> = ({ history, onViewReport, onDelete }) => {
  const { t } = useLocalization();

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/5 dark:bg-gray-800/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/10">
      <h3 className="text-xl font-bold mb-4">{t('historyTitle')}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-900/40 dark:bg-gray-700/50 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">{t('date')}</th>
              <th scope="col" className="px-6 py-3">{t('plantType')}</th>
              <th scope="col" className="px-6 py-3">{t('detectedDisease')}</th>
              <th scope="col" className="px-6 py-3">{t('confidence')}</th>
              <th scope="col" className="px-6 py-3">{t('status')}</th>
              <th scope="col" className="px-6 py-3">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => {
              const status = entry.result.disease_name.includes('healthy') ? 'Healthy' : 'Diseased';
              return (
                <tr key={entry.id} className="bg-white/5 border-b border-white/10 dark:bg-gray-800/50 dark:border-gray-700/50 hover:bg-white/10 dark:hover:bg-gray-600/50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">{entry.date}</td>
                  <td className="px-6 py-4 text-gray-300">{entry.plantType}</td>
                  <td className="px-6 py-4 font-medium text-gray-200 dark:text-white">{entry.result.disease_name.replace(/_/g, ' ')}</td>
                  <td className="px-6 py-4 text-gray-300">{entry.result.confidence}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        status === 'Healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {status === 'Healthy' ? t('healthy') : t('diseased')}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center space-x-4">
                    <button 
                        onClick={() => onViewReport(entry)} 
                        className="flex items-center text-blue-400 hover:text-blue-300 font-semibold text-xs px-2 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                        title="View Full Report"
                    >
                        <FiEye className="mr-1.5"/> View Report
                    </button>
                    <button 
                        onClick={() => onDelete(entry.id)} 
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                        title="Delete Entry"
                    >
                        <FiTrash2 size={16}/>
                    </button>
                  </td>
                </tr>
              )}
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetectionHistory;