import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSalesRecords, processPoints } from '../services/api';
import { TrendingUp, Users, DollarSign, Calendar, Play } from 'lucide-react';

const DashboardPage = () => {
  const { token } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const data = await getSalesRecords(token);
      setSales(data);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPoints = async () => {
    if (!confirm('ต้องการประมวลผลแต้มสำหรับยอดขายที่รอดำเนินการใช่หรือไม่?')) {
      return;
    }

    setProcessing(true);
    try {
      const result = await processPoints(token);
      alert(`ประมวลผลสำเร็จ!\nประมวลผล: ${result.processed} รายการ\nข้าม: ${result.skipped} รายการ`);
      fetchSales();
    } catch (error) {
      console.error('Error processing points:', error);
      alert('เกิดข้อผิดพลาดในการประมวลผล');
    } finally {
      setProcessing(false);
    }
  };

  const stats = {
    totalSales: sales.reduce((sum, s) => sum + parseFloat(s.amount), 0),
    processedSales: sales.filter(s => s.processed).length,
    pendingSales: sales.filter(s => !s.processed).length,
    totalRecords: sales.length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <button
          onClick={handleProcessPoints}
          disabled={processing || stats.pendingSales === 0}
          className="flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          <Play size={20} className="mr-2" />
          {processing ? 'กำลังประมวลผล...' : 'ประมวลผลแต้ม (T+1)'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">ยอดขายทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-800">
                ฿{stats.totalSales.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign size={40} className="text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">รายการทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.totalRecords.toLocaleString()}
              </p>
            </div>
            <Calendar size={40} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">ประมวลผลแล้ว</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.processedSales.toLocaleString()}
              </p>
            </div>
            <TrendingUp size={40} className="text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">รอดำเนินการ</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.pendingSales.toLocaleString()}
              </p>
            </div>
            <Users size={40} className="text-orange-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">ยอดขายล่าสุด</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LINE User ID</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ยอดขาย</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">แต้มที่ได้</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales.slice(0, 10).map((sale) => (
                <tr key={sale.record_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {new Date(sale.sale_date).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                    {sale.line_user_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-right font-semibold">
                    ฿{parseFloat(sale.amount).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-right">
                    {sale.points_earned || '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {sale.processed ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        ประมวลผลแล้ว
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        รอดำเนินการ
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
