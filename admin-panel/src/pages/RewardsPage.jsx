import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRewards, createReward, updateReward, deleteReward } from '../services/api';
import { Gift, Plus, Edit, Save, X, Trash2 } from 'lucide-react';

const RewardsPage = () => {
  const { token } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pointsRequired: '',
    stock: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const data = await getRewards(token);
      setRewards(data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateReward(token, editingId, {
          name: formData.name,
          description: formData.description,
          pointsRequired: parseInt(formData.pointsRequired),
          stock: parseInt(formData.stock),
          imageUrl: formData.imageUrl
        });
      } else {
        await createReward(token, {
          name: formData.name,
          description: formData.description,
          pointsRequired: parseInt(formData.pointsRequired),
          stock: parseInt(formData.stock),
          imageUrl: formData.imageUrl
        });
      }
      
      setFormData({ name: '', description: '', pointsRequired: '', stock: '', imageUrl: '' });
      setShowForm(false);
      setEditingId(null);
      fetchRewards();
    } catch (error) {
      console.error('Error saving reward:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleEdit = (reward) => {
    setFormData({
      name: reward.name,
      description: reward.description || '',
      pointsRequired: reward.points_required.toString(),
      stock: reward.stock.toString(),
      imageUrl: reward.image_url || ''
    });
    setEditingId(reward.reward_id);
    setShowForm(true);
  };

  const handleToggleActive = async (reward) => {
    try {
      await updateReward(token, reward.reward_id, {
        active: !reward.active
      });
      fetchRewards();
    } catch (error) {
      console.error('Error toggling reward:', error);
    }
  };

  const handleDelete = async (reward) => {
    if (!confirm(`ต้องการลบ "${reward.name}" ใช่หรือไม่? การลบจะไม่สามารถกู้คืนได้`)) {
      return;
    }
    try {
      await deleteReward(token, reward.reward_id);
      fetchRewards();
    } catch (error) {
      console.error('Error deleting reward:', error);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">จัดการของรางวัล</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', description: '', pointsRequired: '', stock: '', imageUrl: '' });
          }}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          {showForm ? <X size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
          {showForm ? 'ยกเลิก' : 'เพิ่มของรางวัล'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {editingId ? 'แก้ไขของรางวัล' : 'เพิ่มของรางวัลใหม่'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อของรางวัล *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                คำอธิบาย
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  แต้มที่ต้องใช้ *
                </label>
                <input
                  type="number"
                  value={formData.pointsRequired}
                  onChange={(e) => setFormData({ ...formData, pointsRequired: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนคงเหลือ *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL รูปภาพ
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              <Save size={20} className="inline mr-2" />
              บันทึก
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <div
            key={reward.reward_id}
            className={`bg-white rounded-lg shadow overflow-hidden ${
              !reward.active ? 'opacity-60' : ''
            }`}
          >
            {reward.image_url && (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={reward.image_url}
                  alt={reward.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                  }}
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                {!reward.image_url && <Gift size={32} className="text-blue-600" />}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    reward.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {reward.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {reward.name}
              </h3>
            
            {reward.description && (
              <p className="text-sm text-gray-600 mb-4">
                {reward.description}
              </p>
            )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">แต้มที่ต้องใช้:</span>
                  <span className="font-bold text-blue-600">
                    {reward.points_required.toLocaleString()} แต้ม
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">คงเหลือ:</span>
                  <span className="font-bold text-gray-800">
                    {reward.stock.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(reward)}
                  className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Edit size={16} className="mr-1" />
                  แก้ไข
                </button>
                <button
                  onClick={() => handleToggleActive(reward)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    reward.active
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {reward.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                </button>
                <button
                  onClick={() => handleDelete(reward)}
                  className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rewards.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Gift size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">ยังไม่มีของรางวัล</p>
        </div>
      )}
    </div>
  );
};

export default RewardsPage;
