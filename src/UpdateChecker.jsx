import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Download, X } from 'lucide-react';

const UpdateChecker = () => {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(null);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (window.api) {
      if (window.api.onUpdateStatus) {
        window.api.onUpdateStatus((updateStatus) => {
          setStatus(updateStatus);
          setChecking(false);
          
          if (updateStatus === 'Update available' || updateStatus === 'downloaded' || updateStatus.startsWith('Error')) {
            setIsVisible(true);
          } else if (updateStatus === 'latest' && !checking) {
            // briefly show latest then hide
            setIsVisible(true);
            setTimeout(() => setIsVisible(false), 3000);
          }
        });
      }
      
      if (window.api.onUpdateAvailable) {
        window.api.onUpdateAvailable((info) => {
          setUpdateInfo(info);
        });
      }

      if (window.api.onUpdateProgress) {
        window.api.onUpdateProgress((updateProgress) => {
          setProgress(updateProgress);
        });
      }
    }
  }, [checking]);

  const handleDownload = async () => {
    try {
      await window.api.downloadUpdate();
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  const handleRestart = () => {
    window.api.quitAndInstall();
  };

  const closeToast = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 w-80 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${status === 'downloaded' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
              {status === 'downloaded' ? <CheckCircle size={20} /> : <Download size={20} />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {status === 'downloaded' ? 'Update Ready' : 'Software Update'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {updateInfo ? `Version ${updateInfo.version}` : 'Checking...'}
              </p>
            </div>
          </div>
          <button 
            onClick={closeToast}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {status === 'Update available' && (
            <>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                A new version of SCTTM is available. Update now to get the latest features and improvements.
              </p>
              <button
                onClick={handleDownload}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2"
              >
                <Download size={14} />
                <span>Update Now</span>
              </button>
            </>
          )}

          {status === 'downloaded' && (
            <>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Update downloaded and ready to install. The application will restart to apply the changes.
              </p>
              <button
                onClick={handleRestart}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-green-500/20 flex items-center justify-center space-x-2"
              >
                <RefreshCw size={14} />
                <span>Restart to Apply</span>
              </button>
            </>
          )}

          {(status === 'Checking for updates...' || progress) && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                <span>{progress ? 'Downloading...' : 'Checking...'}</span>
                {progress && <span>{Math.round(progress.percent)}%</span>}
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${progress ? 'bg-blue-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600 w-1/3 animate-shimmer'}`}
                  style={progress ? { width: `${progress.percent}%` } : {}}
                />
              </div>
            </div>
          )}

          {status === 'latest' && (
            <div className="flex items-center space-x-2 text-green-600 py-1">
              <CheckCircle size={14} />
              <span className="text-xs font-medium">You're up to date!</span>
            </div>
          )}

          {status.startsWith('Error') && (
            <div className="flex items-start space-x-2 text-red-500 bg-red-50 dark:bg-red-950/30 p-2 rounded-lg border border-red-100 dark:border-red-900/50">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span className="text-[11px] font-medium leading-tight">{status}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateChecker;