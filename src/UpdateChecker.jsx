import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Download } from 'lucide-react';

const UpdateChecker = () => {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    if (window.api && window.api.onUpdateStatus) {
      window.api.onUpdateStatus((updateStatus) => {
        setStatus(updateStatus);
        setChecking(false);
      });
    }
    
    if (window.api && window.api.onUpdateProgress) {
      window.api.onUpdateProgress((updateProgress) => {
        setProgress(updateProgress);
      });
    }
  }, []);

  const handleCheckUpdates = async () => {
    setChecking(true);
    setStatus('Checking for updates...');
    try {
      await window.api.checkForUpdates();
      setLastChecked(new Date().toLocaleTimeString());
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      setChecking(false);
    }
  };

  const getStatusIcon = () => {
    if (checking) return <RefreshCw className="animate-spin w-4 h-4" />;
    if (status.includes('available')) return <Download className="w-4 h-4 text-blue-500" />;
    if (status.includes('error')) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (status.includes('latest')) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <RefreshCw className="w-4 h-4" />;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCheckUpdates}
            disabled={checking}
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {getStatusIcon()}
            <span>{checking ? 'Checking...' : 'Check Updates'}</span>
          </button>
          {status && (
            <div className="text-xs text-gray-600 max-w-xs">
              {status}
              {progress && (
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  <span className="text-xs">{progress.percent.toFixed(1)}%</span>
                </div>
              )}
              {lastChecked && !checking && status && !status.includes('Checking') && (
                <span className="text-gray-400 ml-1">(Last checked: {lastChecked})</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateChecker;