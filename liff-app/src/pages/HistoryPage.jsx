import { useEffect, useState } from 'react';
import { useLiff } from '../contexts/LiffContext';
import { getPointsHistory } from '../services/api';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const HistoryPage = () => {
  const { isReady, accessToken } = useLiff();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (isReady && accessToken) {
        try {
          const data = await getPointsHistory(accessToken);
          setHistory(data);
        } catch (error) {
          console.error('Error fetching history:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [isReady, accessToken]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isReady || loading) {
    return <Loading />;
  }

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ประวัติการใช้แต้ม</h2>

        {history.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">ยังไม่มีประวัติการใช้แต้ม</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((transaction) => {
              const isEarn = transaction.type === 'earn';
              const amount = Math.abs(transaction.amount);
              
              return (
                <div
                  key={transaction.transaction_id}
                  className="bg-white rounded-xl p-4 shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <div
                        className={`rounded-full p-2 mr-3 ${
                          isEarn ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        {isEarn ? (
                          <TrendingUp size={20} className="text-green-600" />
                        ) : (
                          <TrendingDown size={20} className="text-red-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {transaction.description || (isEarn ? 'รับแต้ม' : 'ใช้แต้ม')}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          isEarn ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isEarn ? '+' : '-'}{amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">แต้ม</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HistoryPage;
