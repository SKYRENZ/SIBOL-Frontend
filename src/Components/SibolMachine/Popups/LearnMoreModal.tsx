import React from 'react';
import { X } from 'lucide-react';

interface LearnMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageName: string;
  stageNumber: number;
}

const LearnMoreModal: React.FC<LearnMoreModalProps> = ({
  isOpen,
  onClose,
  stageName,
  stageNumber,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left side with half-circle and content */}
          <div className="relative w-full md:w-1/2 bg-[#2D5F2E] text-white p-8 flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute -right-1/3 -top-1/3 w-full h-[200%] rounded-full bg-[#3a7a3b] opacity-50"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-2">Stage {stageNumber}</h2>
              <h1 className="text-4xl font-bold mb-6">{stageName}</h1>
              <p className="text-lg opacity-90 mb-8">
                Learn more about this stage of the SIBOL process and how it contributes to the overall production.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-white"></div>
                  <div>
                    <h3 className="font-semibold">Process Details</h3>
                    <p className="text-sm opacity-80">Detailed information about this specific stage's process.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-white"></div>
                  <div>
                    <h3 className="font-semibold">Key Parameters</h3>
                    <p className="text-sm opacity-80">Important metrics and settings for optimal performance.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8">
              <div className="h-1 w-16 bg-white/30 mb-4"></div>
              <p className="text-sm opacity-80">
                This stage is part of the SIBOL production workflow, ensuring quality and efficiency.
              </p>
            </div>
          </div>

          {/* Right side with Lili character */}
          <div className="relative w-full md:w-1/2 bg-[#F8FAF8] p-8 flex flex-col items-center justify-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            
            <div className="relative w-full max-w-xs">
              <div className="absolute -top-20 -left-10 w-40 h-40 bg-[#E8F3E9] rounded-full"></div>
              <img 
                src="/images/lili.png" 
                alt="Lili"
                className="relative z-10 w-full max-w-xs mx-auto"
              />
            </div>
            
            <div className="mt-8 text-center max-w-sm">
              <h3 className="text-2xl font-bold text-[#1F3527] mb-3">Need Help?</h3>
              <p className="text-[#4B6757] mb-6">
                Our team is here to assist you with any questions about this stage or the SIBOL process.
              </p>
              <button className="px-6 py-2.5 bg-[#2D5F2E] text-white rounded-full font-medium hover:bg-[#3a7a3b] transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnMoreModal;
