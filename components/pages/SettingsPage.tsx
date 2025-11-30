
import React from 'react';
import { useLocalization } from '../../hooks/useLocalization';

const SettingsPage: React.FC = () => {
    const { t } = useLocalization();

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">{t('settings')}</h3>
            <p className="text-gray-600 dark:text-gray-400">
                Application settings and preferences will be available here in a future update.
            </p>
            {/* Example Setting */}
            <div className="mt-6 border-t dark:border-gray-700 pt-6">
                <h4 className="text-lg font-medium mb-2">Notification Preferences</h4>
                <div className="flex items-center">
                    <input type="checkbox" id="email-notifications" className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"/>
                    <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        Receive email notifications for critical alerts.
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
