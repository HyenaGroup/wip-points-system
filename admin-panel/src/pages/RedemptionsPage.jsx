import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRedemptions, updateRedemptionStatus } from '../services/api';
import { Award, Clock, CheckCircle, XCircle, Package } from 'lucide-react';

const RedemptionsPage = () => {
  const { token } = useAuth();
  const [redemptions, setRedemptions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRedemptions();
  }, [filter]);

  const fetchRedemptions = async () => {
    try {
      const status = filter === 'all' ? null : filter;
      const data = await getRedemptions(token, status);
      setRedemptions(data);
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (redemptionId, newStatus) => {
    const notes = prompt('หมายเหตุ (ถ้ามี):');
    
    try {
      await updateRedemptionStatus(token, redemptionId, newStatus, notes);
      fetchRedemptions();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('เกิดข้อผิดพลาดในการอัพเดทสถานะ');
    }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">การแลกของรางวัล</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'ทั้งหมด' : 
               status === 'pending' ? 'รอดำเนินการ' :
               status === 'approved' ? 'อนุมัติแล้ว' :
               status === 'completed' ? 'เสร็จสิ้น' : 'ยกเลิก'}
            </button>
          ))}
        </div>
      </div>

      {redemptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Award size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">ไม่พบรายการแลกของรางวัล</p>
        </div>
      ) : (
        <div className="space-y-4">
          {redemptions.map((redemption) => (
            <div
              key={redemption.redemption_id}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">
                    {redemption.reward_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {redemption.display_name} ({redemption.line_user_id})
                  </p>
                </div>
                {getStatusBadge(redemption.status)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-600">รหัสการแลก</p>
                  <p className="font-mono font-bold text-blue-600">
                    {redemption.redemption_code}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">แต้มที่ใช้</p>
                  <p className="font-bold text-gray-800">
                    {redemption.points_used.toLocaleString()} แต้ม
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">วันที่แลก</p>
                  <p className="text-sm text-gray-800">
                    {formatDate(redemption.redeemed_at)}
                  </p>
                </div>
                {redemption.completed_at && (
                  <div>
                    <p className="text-xs text-gray-600">วันที่เสร็จสิ้น</p>
                    <p className="text-sm text-gray-800">
                      {formatDate(redemption.completed_at)}
                    </p>
                  </div>
                )}
              </div>

              {redemption.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">หมายเหตุ: </span>
                    {redemption.notes}
                  </p>
                </div>
              )}

              {redemption.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(redemption.redemption_id, 'approved')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    อนุมัติ
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(redemption.redemption_id, 'cancelled')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              )}

              {redemption.status === 'approved' && (
                <button
                  onClick={() => handleStatusUpdate(redemption.redemption_id, 'completed')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  ทำเครื่องหมายว่าเสร็จสิ้น
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RedemptionsPage;
