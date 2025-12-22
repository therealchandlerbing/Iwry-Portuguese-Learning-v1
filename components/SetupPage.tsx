import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface SetupPageProps {
  onSetupComplete: () => void;
}

interface DbStatus {
  connected: boolean;
  tables?: {
    users: boolean;
    sessions: boolean;
    user_progress: boolean;
  };
  error?: string;
}

const SetupPage: React.FC<SetupPageProps> = ({ onSetupComplete }) => {
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/setup');
      const data = await response.json();
      setStatus(data);

      // If all tables exist, setup is complete
      if (data.connected && data.tables?.users && data.tables?.sessions && data.tables?.user_progress) {
        onSetupComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check database status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const initializeDatabase = async () => {
    try {
      setInitializing(true);
      setError(null);

      const response = await fetch('/api/setup', {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        await checkStatus();
      } else {
        setError(data.error || 'Failed to initialize database');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize database');
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 z-[9998]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 mx-auto animate-spin" />
          <p className="mt-4 text-slate-600">Checking database status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 z-[9998]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Database Setup</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Initialize the database to enable user accounts
          </p>
        </div>

        {/* Connection Status */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-600 text-sm">Database Connection</span>
            {status?.connected ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>

          {status?.connected && (
            <>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600 text-sm">Users Table</span>
                {status.tables?.users ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600 text-sm">Sessions Table</span>
                {status.tables?.sessions ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600 text-sm">User Progress Table</span>
                {status.tables?.user_progress ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-300" />
                )}
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Not Connected Warning */}
        {!status?.connected && (
          <div className="mb-6 p-4 bg-amber-50 rounded-xl">
            <p className="text-amber-700 text-sm">
              <strong>Database not connected.</strong> Please create a Postgres database in your Vercel project's Storage tab and redeploy.
            </p>
          </div>
        )}

        {/* Initialize Button */}
        {status?.connected && !(status.tables?.users && status.tables?.sessions && status.tables?.user_progress) && (
          <button
            onClick={initializeDatabase}
            disabled={initializing}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initializing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Initializing...
              </>
            ) : (
              'Initialize Database'
            )}
          </button>
        )}

        {/* Refresh Button */}
        <button
          onClick={checkStatus}
          className="w-full mt-3 bg-slate-100 text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all"
        >
          Refresh Status
        </button>
      </div>

      <p className="mt-8 text-slate-400 text-xs font-medium">
        Iwry - Personal Brazilian Portuguese Companion
      </p>
    </div>
  );
};

export default SetupPage;
