
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Page, Notification } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { FiUpload, FiBarChart2, FiShield, FiChevronDown, FiChevronUp, FiDatabase, FiCloudDrizzle, FiPercent, FiClock } from 'react-icons/fi';
import { GiTomato, GiCorn, GiWheat, GiCottonFlower, GiPotato, GiGrain, GiSeedling } from "react-icons/gi";
import { FaLightbulb } from 'react-icons/fa';

interface HomePageProps {
  setPage: (page: Page) => void;
  addNotification: (message: string, type: Notification['type']) => void;
}

const PlantOfTheDay: React.FC = () => {
    const { t } = useLocalization();
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Construct plant data dynamically using translation keys
    const plantData = useMemo(() => [
      { 
        name: t('plants.tomato.name'), 
        disease: t('plants.tomato.disease'), 
        tip: t('plants.tomato.tip'), 
        icon: <GiTomato className="w-12 h-12 text-white" />,
        cause: t('plants.tomato.cause'),
        funFact: t('plants.tomato.funFact')
      },
      { 
        name: t('plants.corn.name'), 
        disease: t('plants.corn.disease'), 
        tip: t('plants.corn.tip'), 
        icon: <GiCorn className="w-12 h-12 text-white" />,
        cause: t('plants.corn.cause'),
        funFact: t('plants.corn.funFact')
      },
      { 
        name: t('plants.wheat.name'), 
        disease: t('plants.wheat.disease'), 
        tip: t('plants.wheat.tip'), 
        icon: <GiWheat className="w-12 h-12 text-white" />,
        cause: t('plants.wheat.cause'),
        funFact: t('plants.wheat.funFact')
      },
      { 
        name: t('plants.cotton.name'), 
        disease: t('plants.cotton.disease'), 
        tip: t('plants.cotton.tip'), 
        icon: <GiCottonFlower className="w-12 h-12 text-white" />,
        cause: t('plants.cotton.cause'),
        funFact: t('plants.cotton.funFact')
      },
      {
        name: t('plants.potato.name'),
        disease: t('plants.potato.disease'),
        tip: t('plants.potato.tip'),
        icon: <GiPotato className="w-12 h-12 text-white" />,
        cause: t('plants.potato.cause'),
        funFact: t('plants.potato.funFact')
      },
      {
        name: t('plants.rice.name'),
        disease: t('plants.rice.disease'),
        tip: t('plants.rice.tip'),
        icon: <GiGrain className="w-12 h-12 text-white" />,
        cause: t('plants.rice.cause'),
        funFact: t('plants.rice.funFact')
      },
      {
        name: t('plants.soybean.name'),
        disease: t('plants.soybean.disease'),
        tip: t('plants.soybean.tip'),
        icon: <GiSeedling className="w-12 h-12 text-white" />,
        cause: t('plants.soybean.cause'),
        funFact: t('plants.soybean.funFact')
      }
    ], [t]);

    const todayPlant = useMemo(() => plantData[new Date().getDate() % plantData.length], [plantData]);

    return (
        <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/10 h-full flex flex-col justify-between animate-fade-in animate-slide-up">
            <div>
                <h3 className="text-xl font-bold mb-4 text-green-300">{t('plantOfTheDay')}</h3>
                <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 bg-white/10 p-3 rounded-full">{todayPlant.icon}</div>
                    <div>
                        <p className="text-2xl font-bold text-white">{todayPlant.name}</p>
                        <p className="text-sm text-gray-400">{t('commonConcern')}: <span className="font-semibold text-gray-300">{todayPlant.disease}</span></p>
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                <p className="text-sm font-semibold text-gray-300 flex items-center"><FiShield className="mr-2 text-blue-400"/> {t('preventionTip')}</p>
                <p className="text-sm text-gray-400">{todayPlant.tip}</p>
            </div>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-40' : 'max-h-0'}`}>
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-300">{t('cause')}</h4>
                        <p className="text-sm text-gray-400">{todayPlant.cause}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-300 flex items-center"><FaLightbulb className="mr-2 text-yellow-400"/> {t('aiFunFact')}</p>
                        <p className="text-sm text-gray-400">{todayPlant.funFact}</p>
                    </div>
                </div>
            </div>
             <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-center items-center mt-4 text-xs font-semibold text-blue-300 hover:text-blue-200">
                {isExpanded ? t('viewLess') : t('viewDetails')}
                {isExpanded ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
            </button>
        </div>
    );
};

const HomePage: React.FC<HomePageProps> = ({ setPage, addNotification }) => {
  const { t } = useLocalization();
  
  const summaryData = [
    { title: t('detectionSummary'), value: '1,245', icon: <FiDatabase className="w-6 h-6 text-blue-300"/> },
    { title: t('environmentFactors'), value: '28°C, 85%', icon: <FiCloudDrizzle className="w-6 h-6 text-sky-300"/> },
    { title: t('avgAccuracy'), value: '95.2%', icon: <FiPercent className="w-6 h-6 text-green-300"/> },
  ];

  const recentDetections = [
      { plant: t('plants.tomato.name'), disease: t('plants.tomato.disease'), confidence: 96, status: t('diseased'), time: '5 ' + t('time.mAgo') },
      { plant: t('plants.corn.name'), disease: t('healthy'), confidence: 99, status: t('healthy'), time: '30 ' + t('time.mAgo') },
      { plant: t('plants.wheat.name'), disease: t('plants.wheat.disease'), confidence: 88, status: t('diseased'), time: '1 ' + t('time.hAgo') },
      { plant: t('plants.tomato.name'), disease: 'Septoria Leaf Spot', confidence: 91, status: t('diseased'), time: '3 ' + t('time.hAgo') },
  ];


  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-full">
        <div className="flex-grow space-y-6">
            {/* Welcome Banner */}
            <div className="bg-white/5 dark:bg-gray-800/30 backdrop-blur-lg p-8 rounded-3xl shadow-2xl text-center border border-white/10">
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400 mb-2">
                    {t('welcome')}
                </h1>
                <p className="text-lg text-gray-300 mb-3">
                    {t('welcomeSub')}
                </p>
            </div>
            
            {/* Farm Intelligence Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {summaryData.map((item, index) => (
                <div key={index} className="bg-white/5 dark:bg-gray-800/30 backdrop-blur-lg p-4 rounded-2xl shadow-lg border border-white/10 flex items-center space-x-4 card-glow-hover">
                  <div className="p-3 bg-gray-900/50 rounded-full">{item.icon}</div>
                  <div>
                    <p className="text-sm text-gray-400">{item.title}</p>
                    <p className="text-xl font-bold text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-1 card-glow-hover border border-transparent rounded-2xl">
                     <PlantOfTheDay />
                </div>
                <div className="lg:col-span-1 space-y-6 flex flex-col">
                     <div className="bg-white/5 dark:bg-gray-800/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/10 text-left card-glow-hover cursor-pointer flex-grow flex flex-col justify-center" onClick={() => setPage('upload')}>
                        <div className="flex items-center mb-3">
                            <div className="p-3 bg-green-500/20 rounded-lg mr-4"><FiUpload className="w-7 h-7 text-green-300" /></div>
                            <h3 className="text-xl font-semibold text-white">{t('newDetection')}</h3>
                        </div>
                        <p className="text-gray-400">{t('newDetectionDesc')}</p>
                    </div>
                     <div className="bg-white/5 dark:bg-gray-800/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/10 text-left card-glow-hover cursor-pointer flex-grow flex flex-col justify-center" onClick={() => setPage('analytics')}>
                        <div className="flex items-center mb-3">
                            <div className="p-3 bg-blue-500/20 rounded-lg mr-4"><FiBarChart2 className="w-7 h-7 text-blue-300" /></div>
                            <h3 className="text-xl font-semibold text-white">{t('viewAnalytics')}</h3>
                        </div>
                        <p className="text-gray-400">{t('viewAnalyticsDesc')}</p>
                    </div>
                </div>
            </div>
            
            {/* Recent AI Detections */}
            <div className="bg-white/5 dark:bg-gray-800/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/10">
              <h3 className="text-xl font-bold mb-4 text-gray-200">{t('recentDetections')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase">
                    <tr>
                      <th className="py-2 px-4">{t('plantType')}</th>
                      <th className="py-2 px-4">{t('detectionResult')}</th>
                      <th className="py-2 px-4 text-center">{t('confidence')}</th>
                      <th className="py-2 px-4 text-center">{t('status')}</th>
                      <th className="py-2 px-4 text-right">{t('date')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {recentDetections.map((detection, index) => (
                      <tr key={index} className="border-t border-white/10">
                        <td className="py-3 px-4 font-semibold">{detection.plant}</td>
                        <td className="py-3 px-4">{detection.disease}</td>
                        <td className="py-3 px-4 text-center">{detection.confidence}%</td>
                        <td className="py-3 px-4 text-center">
                           <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            detection.status === t('healthy') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                          }`}>
                            {detection.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-400 flex items-center justify-end">
                          <FiClock className="mr-1.5" size={12}/>{detection.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
      
      {/* Footer */}
      <footer className="text-center py-4 border-t border-white/10 text-xs text-gray-500 flex-shrink-0">
        {t('footer')}
      </footer>
    </div>
  );
};

export default HomePage;
