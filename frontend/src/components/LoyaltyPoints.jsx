import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from '../axiosConfig';
import { Award, History, TrendingUp } from 'lucide-react';

const LoyaltyPoints = () => {
  const { user } = useContext(AuthContext);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        const [statusRes, historyRes] = await Promise.all([
          axios.get('/loyalty/status', {
            headers: { Authorization: `Bearer ${user.token}` }
          }),
          axios.get('/loyalty/history', {
            headers: { Authorization: `Bearer ${user.token}` }
          })
        ]);
        setStatus(statusRes.data);
        setHistory(historyRes.data);
      } catch (err) {
        setError('Failed to load loyalty data');
        console.error('Error fetching loyalty data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLoyaltyData();
    }
  }, [user]);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Bronze': return 'bg-amber-100 text-amber-800';
      case 'Silver': return 'bg-gray-100 text-gray-800';
      case 'Gold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) return <div className="text-center p-4">Loading loyalty data...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
  if (!status) return <div className="text-center p-4">No loyalty data available</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Current Status Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Loyalty Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-4">
            <Award className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Current Tier</p>
              <p className={`text-lg font-semibold ${getTierColor(status.tier)} px-3 py-1 rounded-full inline-block`}>
                {status.tier}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Points Balance</p>
              <p className="text-lg font-semibold">{status.points} points</p>
            </div>
          </div>
        </div>
        
        {status.nextTier && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600">
              {status.pointsToNextTier} points needed to reach {status.nextTier} tier
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ 
                  width: `${Math.min(100, ((status.points / (status.points + status.pointsToNextTier)) * 100))}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Points History</h2>
        <div className="space-y-4">
          {history.map((transaction) => (
            <div 
              key={transaction._id} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <History className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`font-semibold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.points > 0 ? '+' : ''}{transaction.points} points
              </span>
            </div>
          ))}
          {history.length === 0 && (
            <p className="text-center text-gray-500">No transaction history available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPoints; 