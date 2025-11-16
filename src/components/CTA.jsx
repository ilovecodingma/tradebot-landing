import { useState } from 'react';

const CTA = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://formspree.io/f/mjkjeqnb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message
        })
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('전송 실패. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('전송 실패. 다시 시도해주세요.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <section id="cta-section" className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-2xl p-12 border-2 border-green-400">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">문의가 접수되었습니다!</h2>
              <p className="text-lg text-gray-600 mb-6">
                {formData.name}님, 감사합니다.<br />
                1-2일 내로 {formData.email}로 연락드리겠습니다.
              </p>
              <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded text-left">
                <p className="text-sm text-gray-700">
                  <strong className="text-green-700">다음 단계:</strong><br />
                  1. 이메일로 상담 일정 안내<br />
                  2. 1:1 화상 상담 진행<br />
                  3. 노트북 원격 설치
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="cta-section" className="py-20 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 text-white">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              1:1 상담 신청
            </h2>
            <p className="text-xl text-primary-100">
              이메일 남겨주시면 24시간 내 연락드립니다<br />
              프리미엄 설치 서비스
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-lg">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors text-lg"
                  placeholder="홍길동"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-lg">
                  이메일 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors text-lg"
                  placeholder="example@email.com"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-lg">
                  문의 내용
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors text-lg resize-none"
                  placeholder="설치 관련 궁금한 점이나 요청사항을 자유롭게 작성해주세요"
                />
                <p className="text-sm text-gray-500 mt-2">
                  선택사항입니다. 비워두셔도 괜찮습니다.
                </p>
              </div>

              <button
                type="submit"
                className="w-full btn-primary bg-primary-600 hover:bg-primary-700 py-5 text-xl"
              >
                💬 상담 신청하기
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-2">또는 직접 문의하기</p>
              <a
                href="mailto:support@example.com"
                className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
              >
                📧 support@example.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
