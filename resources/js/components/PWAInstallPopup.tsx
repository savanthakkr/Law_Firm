import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PWAInstallPopupProps {
  isVisible: boolean;
  onInstall: () => void;
  onClose: () => void;
  appName: string;
  appIcon?: string;
  themeColors?: any;
}

export default function PWAInstallPopup({ 
  isVisible, 
  onInstall, 
  onClose, 
  appName,
  appIcon,
  themeColors
}: PWAInstallPopupProps) {
  const { t } = useTranslation();
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl w-full max-w-sm mx-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            {appIcon ? (
              <img src={appIcon} alt={appName} className="w-12 h-12 rounded-2xl" />
            ) : (
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: themeColors?.primary || '#3B82F6' }}>
                <Smartphone className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {t("Install")} {appName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("Add to home screen")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-2">
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {t("Install this app on your device for quick access and a better experience. It works offline and loads faster.")}
          </p>
        </div>

        {/* Features */}
        <div className="px-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-300">{t("Works offline")}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-300">{t("Fast loading")}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-300">{t("Home screen access")}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 text-gray-600 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {t("Not now")}
          </button>
          <button
            onClick={onInstall}
            className="flex-1 py-3 px-4 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: themeColors?.primary || '#3B82F6' }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            <Download className="w-4 h-4" />
            {t("Install")}
          </button>
        </div>
      </div>
    </div>
  );
}