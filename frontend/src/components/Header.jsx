import React from 'react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const getStep = () => {
    if (location.pathname === '/page1') return 1;
    if (location.pathname === '/page2') return 2;
    if (location.pathname === '/page3') return 3;
    return 0;
  };

  const currentStep = getStep();

  const stepClass = (stepNumber) => {
    const isActive = currentStep === stepNumber;
    return isActive
      ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium'
      : 'w-6 h-6 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center text-sm font-medium';
  };

  const textClass = (stepNumber) => {
    return currentStep === stepNumber ? 'ml-2 font-semibold text-black' : 'ml-2 text-gray-600';
  };

  return (
    <div className="flex items-center space-x-6 mt-4 justify-center">
      {/* Step 1 */}
      <div className="flex items-center">
        <div className={stepClass(1)}>1</div>
        <span className={textClass(1)}>Upload Document</span>
      </div>

      <div className="h-px bg-gray-400 w-8"></div>

      {/* Step 2 */}
      <div className="flex items-center">
        <div className={stepClass(2)}>2</div>
        <span className={textClass(2)}>Capture Selfie</span>
      </div>

      <div className="h-px bg-gray-400 w-8"></div>

      {/* Step 3 */}
      <div className="flex items-center">
        <div className={stepClass(3)}>3</div>
        <span className={textClass(3)}>Verification Status</span>
      </div>
    </div>
  );
};

export default Header;
