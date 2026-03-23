import React, { useState } from 'react';
import { Mail, Phone, MapPin, Facebook } from 'lucide-react';

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your form submission logic here
  };

  return (
    <section className="py-12 sm:py-14 md:py-16 lg:py-16 px-4 sm:px-6 md:px-8 lg:px-12 bg-[#88AB8E] snap-start scroll-mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16">
        {/* Contact Info */}
        <div className="text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Let's discuss
            <br />
            on something <span className="text-[#2D5F2E]">cool</span>
            <br />
            together
          </h2>

          <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-5 md:mt-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="font-medium mb-1 text-sm sm:text-base">Location</div>
                <div className="text-white/90 text-xs sm:text-sm">
                  University of Caloocan City, Biglang Awa St, Sangandaan, Caloocan, Metro Manila, Philippines
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="font-medium mb-1 text-sm sm:text-base">Email</div>
                <a href="mailto:sibol@gmail.com" className="text-white/90 hover:text-white text-xs sm:text-sm">
                  sibol@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="font-medium mb-1 text-sm sm:text-base">Phone</div>
                <a href="tel:+639123456789" className="text-white/90 hover:text-white text-xs sm:text-sm">
                  +63 912 345 6789
                </a>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-7">
            <a
              href="https://www.facebook.com/profile.php?id=61586997429108"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleFormChange}
                className="px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5F2E] focus:border-transparent text-xs sm:text-sm"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleFormChange}
                className="px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5F2E] focus:border-transparent text-xs sm:text-sm"
                required
              />
            </div>

            <input
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleFormChange}
              className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5F2E] focus:border-transparent text-xs sm:text-sm"
              required
            />

            <textarea
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleFormChange}
              rows={4}
              className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5F2E] focus:border-transparent resize-none text-xs sm:text-sm"
              required
            />

            <button
              type="submit"
              className="w-full px-5 py-2.5 sm:px-6 sm:py-3 bg-[#2D5F2E] text-white rounded-lg hover:bg-[#234A23] transition-colors duration-200 font-medium text-sm sm:text-base"
            >
              SEND MESSAGE
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
