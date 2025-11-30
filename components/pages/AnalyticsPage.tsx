
import React from 'react';
import { Theme } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiImage, FiZap, FiTarget, FiThermometer, FiDroplet, FiAlertTriangle } from 'react-icons/fi';
import { FaFlask } from 'react-icons/fa';

interface AnalyticsPageProps {
  theme: Theme;
}

const Gauge: React.FC<{ value: number; maxValue: number; label: string; unit: string; icon: React.ReactNode; color: string }> = ({ value, maxValue, label, unit, icon, color }) => {
  const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100));
  const angle = (percentage / 100) * 180;
  const strokeDasharray = `${angle} 180`;

  return (
    <div className="bg-white/10 dark:bg-gray-800/50 p-4 rounded-2xl shadow-lg border border-white/10 flex flex-col items-center text-center flex-1">
      <div className="relative w-32 h-16 mb-2">
        <svg viewBox="0 0 180 90" className="w-full h-full">
          <path d="M10 80 A 80 80 0 0 1 170 80" strokeWidth="12" strokeLinecap="round" className="text-gray-700" fill="none" />
          <path d="M10 80 A 80 80 0 0 1 170 80" strokeWidth="12" strokeLinecap="round" style={{ stroke: color, transition: 'stroke-dasharray 0.5s ease' }} fill="none" strokeDasharray={strokeDasharray} />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center">
            <div className="flex items-baseline">
                <span className="text-2xl font-bold text-white">{value}</span>
                <span className="text-md text-gray-300">{unit}</span>
            </div>
        </div>
      </div>
      <div className="flex items-center text-sm">
        <span className="mr-2" style={{color}}>{icon}</span>
        <h3 className="font-semibold text-gray-300">{label}</h3>
      </div>
    </div>
  );
};


const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ theme }) => {
  const { t } = useLocalization();

  const weeklyData = [
    { name: 'Mon', detections: 4 },
    { name: 'Tue', detections: 3 },
    { name: 'Wed', detections: 5 },
    { name: 'Thu', detections: 2 },
    { name: 'Fri', detections: 7 },
    { name: 'Sat', detections: 6 },
    { name: 'Sun', detections: 8 },
  ];
  
  const Card = ({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string; color: string }) => (
    <div className="bg-white/5 dark:bg-gray-800/30 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/10 flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div>
        <h3 className="text-2xl font-semibold mb-4">{t('detectionSummary')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card icon={<FiImage size={24} className="text-white"/>} title={t('totalAnalyzed')} value="1,245" color="bg-blue-500"/>
          <Card icon={<FiZap size={24} className="text-white"/>} title={t('avgAccuracy')} value="95.2%" color="bg-green-500"/>
          <Card icon={<FiTarget size={24} className="text-white"/>} title={t('mostCommon')} value="Late Blight" color="bg-red-500"/>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Trend Chart */}
        <div className="lg:col-span-2 bg-white/5 dark:bg-gray-800/30 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold mb-4">{t('weeklyTrend')}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                 <defs>
                    <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#48BB78" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#48BB78" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}/>
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#A0AEC0' : '#4A5568'}/>
                <YAxis stroke={theme === 'dark' ? '#A0AEC0' : '#4A5568'}/>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1a202c' : '#FFFFFF',
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                    borderRadius: '0.75rem'
                  }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Legend />
                <Bar dataKey="detections" fill="url(#colorDetections)" name={t('detections')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Environment Factors */}
        <div className="space-y-6">
            <div className="bg-white/5 dark:bg-gray-800/30 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">{t('environmentFactors')}</h3>
                <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                    <Gauge value={28} maxValue={50} label="Temperature" unit="°C" icon={<FiThermometer/>} color="#ef4444" />
                    <Gauge value={85} maxValue={100} label="Humidity" unit="%" icon={<FiDroplet/>} color="#3b82f6" />
                    <Gauge value={6.2} maxValue={14} label="Soil pH" unit="" icon={<FaFlask/>} color="#f59e0b" />
                </div>
            </div>
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-200 p-4 rounded-r-lg shadow-lg">
                <div className="flex items-center">
                    <FiAlertTriangle className="mr-3" size={24}/>
                    <div>
                        <p className="font-bold">{t('alertBox')}</p>
                        <p>{t('alertMsg')}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
