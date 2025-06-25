import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const defaultAadhaarURL = 'https://via.placeholder.com/300x200?text=Aadhaar+Image';
const defaultSelfieURL = 'https://via.placeholder.com/300x200?text=Selfie+Image';

const InfoIcon = ({ text }) => (
  <div className="relative group inline-block mr-2">
    <div className="w-5 h-5 border border-gray-500 rounded-full text-xs text-gray-700 flex items-center justify-center cursor-pointer">
      i
    </div>
    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-black text-white text-xs rounded p-2 w-56 hidden group-hover:block z-50">
      {text}
    </div>
  </div>
);

const Page3 = () => {
  const location = useLocation();
  const {
    aadhaarFile,
    selfieFile,
    matchStatus,
    aadhaarAnalysis,
    selfieAnalysis
  } = location.state || {};

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatch = async () => {
      if (!aadhaarFile || !selfieFile) {
        setError('Files are missing from previous steps.');
        return;
      }

      const formData = new FormData();
      formData.append('aadhaar', aadhaarFile);
      formData.append('selfie', selfieFile);

      // Append Aadhaar analysis fields if available
      if (aadhaarAnalysis) {
        formData.append('aadhaar_dob', aadhaarAnalysis.dob || '');
        formData.append('aadhaar_age', aadhaarAnalysis.age || '');
        formData.append('aadhaar_ocr_score', aadhaarAnalysis.ocr_score || '');
        formData.append('aadhaar_blur', aadhaarAnalysis.blur || '');
        formData.append('aadhaar_brightness', aadhaarAnalysis.brightness || '');
        formData.append('aadhaar_faces', aadhaarAnalysis.faces_detected || '');
      }

      // Append Selfie analysis fields if available
      if (selfieAnalysis) {
        formData.append('selfie_blur', selfieAnalysis.blur || '');
        formData.append('selfie_brightness', selfieAnalysis.brightness || '');
      }

      try {
        const response = await fetch('http://localhost:5000/verify-match', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.error || 'Face match failed.');
        } else {
          setResult(data);
        }
      } catch (err) {
        setError('Server error during face verification.');
      }
    };

    fetchMatch();
  }, [aadhaarFile, selfieFile]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold px-6 text-center">
        {error}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Verifying match, please wait...
      </div>
    );
  }

  const {
    status,
    confidence,
    face_images,
    warnings,
    aadhaar_analysis,
    selfie_analysis,
    match_threshold
  } = result;

  // Fallback to passed analysis if backend does not return them
  const finalAadhaarAnalysis = aadhaar_analysis || aadhaarAnalysis || {};
  const finalSelfieAnalysis = selfie_analysis || selfieAnalysis || {};

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 flex flex-col items-center">
      <div className={`w-full max-w-4xl rounded-xl p-6 shadow-lg mb-8 ${
        status === 'verified' ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500'
      }`}>
        <div className="w-full flex justify-between items-center gap-6 mb-4">
          <div className="text-center flex-1">
            <h4 className="text-md font-medium text-gray-700 mb-2">Aadhaar</h4>
            <img
              src={aadhaarFile ? URL.createObjectURL(aadhaarFile) : defaultAadhaarURL}
              alt="Aadhaar"
              className="h-40 w-full max-w-xs object-contain rounded shadow border mx-auto"
            />
          </div>
          <div className="w-28 text-center">
            <h2 className={`text-xl font-bold ${status === 'verified' ? 'text-green-700' : 'text-red-700'}`}>
              {status === 'verified' ? 'Verified' : 'Not Verified'}
            </h2>
            <p className="text-sm text-gray-700 mt-2">
              Confidence: {confidence !== null ? `${confidence}%` : 'N/A'}
            </p>
            <p className="text-xs text-gray-600">Threshold: {match_threshold}%</p>
          </div>
          <div className="text-center flex-1">
            <h4 className="text-md font-medium text-gray-700 mb-2">Selfie</h4>
            <img
              src={selfieFile ? URL.createObjectURL(selfieFile) : defaultSelfieURL}
              alt="Selfie"
              className="h-40 w-full max-w-xs object-contain rounded shadow border mx-auto"
            />
          </div>
        </div>

        <div className="w-full flex justify-around gap-6 mt-3">
          {face_images?.aadhaar_face && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Aadhaar Face</p>
              <img
                src={face_images.aadhaar_face}
                alt="Aadhaar Face"
                className="h-28 w-28 object-cover border rounded shadow"
              />
            </div>
          )}
          {face_images?.selfie_face && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Selfie Face</p>
              <img
                src={face_images.selfie_face}
                alt="Selfie Face"
                className="h-28 w-28 object-cover border rounded shadow"
              />
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-blue-700 mb-2">Aadhaar Analysis</h4>
            <p className="mb-1"><strong>DOB:</strong> {aadhaarAnalysis?.dob || 'N/A'}</p>
            <p className="mb-1"><strong>Age:</strong> {aadhaarAnalysis?.age || '22'}</p>
            <p className="mb-1"><strong>OCR Score:</strong> {aadhaarAnalysis?.ocr_score || 'N/A'}</p>
            <p className="mb-1"><strong>Clarity (Blur):</strong> {aadhaarAnalysis?.blur || 'N/A'}</p>
            <p className="mb-1"><strong>Brightness:</strong> {aadhaarAnalysis?.brightness || 'N/A'}</p>
            <p className="mb-1"><strong>Faces Detected:</strong> {aadhaarAnalysis?.faces_detected || 'N/A'}</p>
          </div>
          <div>
            <h4 className="font-bold text-blue-700 mb-2">Selfie Analysis</h4>
            <p className="mb-1"><strong>Clarity (Blur):</strong> {finalSelfieAnalysis?.blur || 'N/A'}</p>
            <p className="mb-1"><strong>Brightness:</strong> {finalSelfieAnalysis?.brightness || 'N/A'}</p>
          </div>
        </div>

        {matchStatus && (
          <div className="mt-6">
            <h4 className="font-bold text-green-700 mb-2">Selfie Declarations</h4>
            <ul className="list-disc list-inside text-green-800">
              {Object.entries(matchStatus).map(([key, value]) => (
                <li key={key} className="flex items-center mb-1">
                  {`${key.replace(/([A-Z])/g, ' $1')}:`} <strong className="ml-2">{value ? '✔️ Yes' : '❌ No'}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}

        {warnings?.length > 0 && (
          <div className="mt-6">
            <h4 className="font-bold text-red-700 mb-2">Warnings:</h4>
            <ul className="list-disc list-inside text-red-600">
              {warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page3;
