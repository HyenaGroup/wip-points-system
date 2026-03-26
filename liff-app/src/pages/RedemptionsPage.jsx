import { useEffect, useState } from 'react';
import { useLiff } from '../contexts/LiffContext';
import { getRedemptions } from '../services/api';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { Award, Clock, CheckCircle, XCircle, Package } from 'lucide-react';

const RedemptionsPage = () => {
  const { isReady, accessToken } = useLiff();
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (isReady && accessToken) {
        try {
          const data = await getRedemptions(accessToken);
          setRedemptions(data);
        } catch (error) {
          console.error('Error fetching redemptions:', error);
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: 'รอดำเนินการ',
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-800'
      },
      approved: {
        label: 'อนุมัติแล้ว',
        icon: CheckCircle,
        className: 'bg-blue-100 text-blue-800'
      },
      completed: {
        label: 'เสร็จสิ้น',
        icon: Package,
        className: 'bg-green-100 text-green-800'
      },
      cancelled: {
        label: 'ยกเลิก',
        icon: XCircle,
        className: 'bg-red-100 text-red-800'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${config.className}`}>
        <Icon size={14} className="mr-1" />
        {config.label}
      </span>
    );
  };

  if (!isReady || loading) {
    return <Loading />;
  }

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ประวัติการแลกของรางวัล</h2>

        {redemptions.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow">
            <Award size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">ยังไม่มีประวัติการแลกของรางวัล</p>
          </div>
        ) : (
          <div className="space-y-4">
            {redemptions.map((redemption) => (
              <div
                key={redemption.redemption_id}
                className="bg-white rounded-xl p-4 shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">
                      {redemption.reward_name}
                    </h3>
                    {redemption.reward_description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {redemption.reward_description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">รหัสการแลก:</span>
                    <span className="font-mono font-bold text-primary">
                      {redemption.redemption_code}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">แต้มที่ใช้:</span>
                    <span className="font-bold text-gray-800">
                      {redemption.points_used.toLocaleString()} แต้ม
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">วันที่แลก:</span>
                    <span className="text-gray-800">
                      {formatDate(redemption.redeemed_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">สถานะ:</span>
                  {getStatusBadge(redemption.status)}
                </div>

                {redemption.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">หมายเหตุ: </span>
                      {redemption.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RedemptionsPage;
