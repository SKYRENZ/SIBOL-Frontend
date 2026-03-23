import React, { useState } from 'react';
import { Mail, Phone, MapPin, Facebook } from 'lucide-react';
import emailjs from '@emailjs/browser';

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize EmailJS with public key from env
  React.useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey) {
      emailjs.init(publicKey);
    } else {
      console.error('EmailJS public key is not configured');
    }
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

      if (!serviceId || !templateId) {
        throw new Error('EmailJS credentials are not configured');
      }

      // Send email using EmailJS
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: 'sibol.ucc@gmail.com',
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }
      );

      setSuccessMessage('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to send message. Please try again.');
      console.error('Email error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Open Gmail compose window
    window.open(`https://mail.google.com/mail/?view=cm&to=sibol.ucc@gmail.com`, '_blank');
  };

  return (
    <section className="h-screen min-h-[700px] max-h-[1080px] px-4 sm:px-6 md:px-8 py-16 sm:py-20 bg-[#88AB8E] snap-start flex items-center justify-center">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
        {/* Contact Info */}
        <div className="text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-5">
            Let's discuss
            <br />
            on something <span className="text-[#2D5F2E]">cool</span>
            <br />
            together
          </h2>

          <div className="space-y-3 md:space-y-4 mt-5 md:mt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium mb-1 text-sm md:text-base">Location</div>
                <div className="text-white/90 text-xs md:text-sm">
                  University of Caloocan City, Biglang Awa St, Sangandaan, Caloocan, Metro Manila, Philippines
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium mb-1 text-sm md:text-base">Email</div>
                <a
                  href="mailto:sibol.ucc@gmail.com"
                  onClick={handleEmailClick}
                  className="text-white/90 hover:text-white text-xs md:text-sm transition-colors"
                >
                  sibol.ucc@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium mb-1 text-sm md:text-base">Phone</div>
                <a href="tel:+639123456789" className="text-white/90 hover:text-white text-xs md:text-sm">
                  +63 912 345 6789
                </a>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 mt-6">
            <a
              href="https://www.facebook.com/profile.php?id=61586997429108"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <div>
              <div className="font-medium mb-1 text-sm md:text-base">Facebook</div>
                <a
                  href="https://www.facebook.com/profile.php?id=61586997429108"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-white transition-colors duration-200 font-medium text-sm"
                >
                  SIBOL
                </a>
              </div>
            </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl p-6 md:p-7 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {successMessage && (
              <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleFormChange}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5F2E] focus:border-transparent text-sm"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleFormChange}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5F2E] focus:border-transparent text-sm"
                required
              />
            </div>

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5F2E] focus:border-transparent text-sm"
              required
            />

            <textarea
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleFormChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5F2E] focus:border-transparent resize-none text-sm"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-[#2D5F2E] text-white rounded-lg hover:bg-[#234A23] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-sm md:text-base"
            >
              {loading ? 'SENDING...' : 'SEND MESSAGE'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
