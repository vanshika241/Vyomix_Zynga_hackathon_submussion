import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const Page0 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Logo Section */}
      <div className="py-6 px-10">
        <Logo />
      </div>
       
        {/* Services Section */}
      <div className="py-12 px-10 bg-gray-50">
        <h3 className="text-3xl font-semibold text-center text-gray-800 mb-10">
          Our Verification Steps
        </h3>

        <div className="flex justify-center gap-10 flex-wrap">
          {/* Card 1 */}
{/* Card 1 */}
<div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6 w-80 text-center hover:shadow-2xl transition-all">
  <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-blue-50 rounded-full">
    <i className="ri-file-upload-line text-5xl text-blue-600"></i>
  </div>
  <h4 className="text-xl font-bold mb-2 text-blue-600">Upload Aadhar</h4>
  <p className="text-gray-600">Upload a simulated Aadhar card to extract age and photo using OCR.</p>
</div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6 w-80 text-center hover:shadow-2xl transition-all">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
              alt="Capture Selfie"
              className="w-20 h-20 mx-auto mb-4"
            />
            <h4 className="text-xl font-bold mb-2 text-green-600">Capture Selfie</h4>
            <p className="text-gray-600">Take a selfie live on camera to match with the document image.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6 w-80 text-center hover:shadow-2xl transition-all">
            <img
              src="https://cdn-icons-png.flaticon.com/512/190/190411.png"
              alt="Verification Result"
              className="w-20 h-20 mx-auto mb-4"
            />
            <h4 className="text-xl font-bold mb-2 text-purple-600">Verification Result</h4>
            <p className="text-gray-600">Get a result showing if the face matches and age criteria is met.</p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center py-12">
        <h2 className="text-5xl font-bold text-gray-800 mb-6">Get Verified</h2>
        <button
          onClick={() => navigate('/page1')}
          className="text-lg px-8 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition cursor-pointer"
        >
          Get Started ➤
        </button>
      </div>

     
    </div>
  );
};

export default Page0;
