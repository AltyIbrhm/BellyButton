import React, { useEffect, useState } from 'react';
import { fetchDashboardData } from '../services';

const Home: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchDashboardData()
      .then(res => setData(res))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  const renderError = (err: any) => {
    if (!err) return null;
    return (
      <div className="text-red-500 bg-red-100 p-4 rounded mb-4 max-w-xl w-full text-left">
        <strong>Error:</strong> {err.message || String(err)}
        {err.response && (
          <>
            <br />
            <strong>Status:</strong> {err.response.status} {err.response.statusText}
            <br />
            <strong>Response:</strong> <pre>{JSON.stringify(err.response.data, null, 2)}</pre>
          </>
        )}
        {err.request && !err.response && (
          <>
            <br />
            <strong>Request:</strong> {JSON.stringify(err.request)}
          </>
        )}
        <br />
        <strong>Config:</strong> <pre>{JSON.stringify(err.config, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Dashboard Home</h1>
      <p className="text-lg text-gray-600 mb-4">Welcome to your new React dashboard!</p>
      {loading && <p>Loading dashboard data...</p>}
      {renderError(error)}
      {data && (
        <pre className="bg-gray-900 text-white p-4 rounded w-full max-w-xl overflow-x-auto text-left">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default Home;
