import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiff } from '../contexts/LiffContext';
import { registerUser } from '../services/api';
import Loading from '../components/Loading';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const { isReady, accessToken, profile } = useLiff();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phoneNumber: ''
  });
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.firstName.trim()) {
      setError('กรุณากรอกชื่อ');
      setLoading(false);
      return;
    }
    if (!form.lastName.trim()) {
      setError('กรุณากรอกนามสกุล');
      setLoading(false);
      return;
    }
    if (!form.phoneNumber) {
      setError('กรุณากรอกเบอร์โทรศัพท์');
      setLoading(false);
      return;
    }
    if (!consentAccepted) {
      setError('กรุณายอมรับนโยบายความเป็นส่วนตัว');
      setLoading(false);
      return;
    }

    const cleaned = form.phoneNumber.replace(/[^0-9]/g, '');
    if (!/^0\d{8,9}$/.test(cleaned)) {
      setError('กรุณากรอกเบอร์โทรให้ถูกต้อง เช่น 0812345678');
      setLoading(false);
      return;
    }

    try {
      await registerUser(accessToken, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        address: form.address.trim(),
        phoneNumber: cleaned
      });
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.error || 'ไม่สามารถลงทะเบียนได้';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) return <Loading />;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-green-800 mb-2">ลงทะเบียนสำเร็จ!</h2>
          <p className="text-gray-600">ยินดีต้อนรับสู่ระบบสะสมแต้ม</p>
          <p className="text-sm text-gray-400 mt-3">กำลังเข้าสู่หน้าหลัก...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-center mb-3">
            {profile?.pictureUrl && (
              <img
                src={profile.pictureUrl}
                alt="Profile"
                className="w-14 h-14 rounded-full border-3 border-white mr-4"
              />
            )}
            <div>
              <h2 className="text-xl font-bold">สมัครสมาชิก</h2>
              <p className="text-sm opacity-90">กรอกข้อมูลเพื่อเริ่มสะสมแต้ม</p>
            </div>
          </div>
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 mt-2">
            <UserPlus size={16} className="mr-2 opacity-75" />
            <span className="text-sm opacity-90">
              สวัสดี, {profile?.displayName || 'คุณลูกค้า'}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="สมชาย"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="ใจดี"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="0812345678"
                maxLength={10}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                ที่อยู่
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="บ้านเลขที่ ซอย ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                rows={3}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* PDPA Consent */}
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="mt-1 mr-3 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary flex-shrink-0"
              />
              <div className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold text-gray-800">ฉันยอมรับ</span>
                <span className="text-blue-600 font-medium"> นโยบายความเป็นส่วนตัว (PDPA)</span>
                <p className="mt-2 text-xs text-gray-600">
                  ข้าพเจ้ายินยอมให้เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล (ชื่อ-นามสกุล, เบอร์โทรศัพท์, ที่อยู่, ประวัติการซื้อ) 
                  เพื่อวัตถุประสงค์ในการสะสมแต้ม แลกของรางวัล และรับข้อมูลโปรโมชั่น
                </p>
              </div>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 rounded-xl p-4 flex items-start">
              <AlertCircle size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !consentAccepted}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-4 rounded-xl shadow-lg disabled:opacity-50 text-lg"
          >
            {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
          </button>

          {/* Info */}
          <p className="text-xs text-gray-400 text-center leading-relaxed px-4">
            เบอร์โทรจะใช้สำหรับผูกข้อมูลยอดซื้อกับบัญชี LINE ของคุณ
            <br />
            เบอร์โทร 1 เบอร์ ผูกได้กับ LINE 1 บัญชีเท่านั้น
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
