// ...imports remain same
import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { useNavigate, useLocation } from 'react-router-dom';

const InfoIcon = ({ text }) => (
  <div className="relative group inline-block">
    <div className="w-5 h-5 border border-gray-500 rounded-full text-xs text-gray-700 flex items-center justify-center cursor-pointer">
      i
    </div>
    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm rounded p-2 w-56 hidden group-hover:block z-50">
      {text}
    </div>
  </div>
);

const Page2 = () => {
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const passedAadhaarFile = location.state?.aadhaarFile || null;
  const passedAadhaarAnalysis = location.state?.aadhaarAnalysis || null;

  const [selfie, setSelfie] = useState(null);
  const [captured, setCaptured] = useState(false);
  const [selfieFile, setSelfieFile] = useState(null);

  const [declarations, setDeclarations] = useState({
    faceVisible: false,
    eyesOpen: false,
    lightingGood: false,
    noMask: false,
  });

  const [analysis, setAnalysis] = useState({
    isValid: '',
    faceClear: '',
    eyesClear: '',
    lighting: '',
  });

  const handleCheckboxChange = (e) => {
    setDeclarations({
      ...declarations,
      [e.target.name]: e.target.checked,
    });
  };

  const captureSelfie = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setSelfie(imageSrc);
    setCaptured(true);
    setAnalysis({
      isValid: '',
      faceClear: '',
      eyesClear: '',
      lighting: '',
    });
  };

  const handleSubmit = async () => {
    if (!selfie) {
      alert('Please capture a selfie before submitting.');
      return;
    }

    try {
      const blob = await fetch(selfie).then((res) => res.blob());
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
      setSelfieFile(file);

      const formData = new FormData();
      formData.append('selfie', file);

      const response = await fetch('http://localhost:5000/selfie-check', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.error) {
        alert(result.error);
        setAnalysis({
          isValid: 'Rejected',
          faceClear: 'N/A',
          eyesClear: 'N/A',
          lighting: 'N/A',
        });
        return;
      }

      const { status, face_clarity, eyes_visibility, lighting, warnings } = result;

      setAnalysis({
        isValid: status === 'pass' ? 'Accepted' : 'Not Clear',
        faceClear: face_clarity,
        eyesClear: eyes_visibility,
        lighting: lighting,
      });

      if (status !== 'pass') {
        alert(`Validation failed:\n${warnings.join('\n')}`);
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong during selfie validation.');
      setAnalysis({
        isValid: 'Rejected',
        faceClear: 'N/A',
        eyesClear: 'N/A',
        lighting: 'N/A',
      });
    }
  };

  const canProceed =
    analysis.isValid === 'Accepted' &&
    Object.values(declarations).every((val) => val === true);

  const handleNext = () => {
    if (!selfieFile) {
      alert('Selfie file is missing. Please submit again.');
      return;
    }

    navigate('/page3', {
      state: {
        selfieFile,
        selfieAnalysis: analysis,
        aadhaarFile: passedAadhaarFile,
        aadhaarAnalysis: passedAadhaarAnalysis,
        matchStatus: declarations,
        message: 'Selfie analysis successful. You may proceed.',
      },
    });
  };

  return (
    <div className="h-screen bg-white px-6 py-4 flex items-center justify-center">
      <div className="flex w-full max-w-7xl h-full gap-6">
        {/* Left Section */}
        <div className="w-[55%] h-full flex flex-col justify-start">
          <h2 className="text-xl font-semibold text-black mb-2">Capture Selfie</h2>

          <div className="rounded-md overflow-hidden bg-gray-100 border border-gray-400 h-[55vh] flex justify-center items-center">
            {captured && selfie ? (
              <img src={selfie} alt="Captured Selfie" className="h-full w-full object-cover" />
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex space-x-4 mt-4">
            <button
              onClick={captureSelfie}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Capture
            </button>

            <button
              onClick={() => {
                setSelfie(null);
                setCaptured(false);
                setAnalysis({
                  isValid: '',
                  faceClear: '',
                  eyesClear: '',
                  lighting: '',
                });
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-[45%] h-full flex flex-col justify-start">
          <div className="bg-green-100 p-5 rounded-lg mb-3">
            <h3 className="font-bold text-lg text-green-900 mb-3">Selfie Declarations:</h3>
            <div className="space-y-3 text-md text-green-900">
              {Object.entries(declarations).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name={key}
                    checked={value}
                    onChange={handleCheckboxChange}
                    className="accent-green-600 w-5 h-5"
                  />
                  <span className="flex items-center gap-2">
                    {{
                      faceVisible: 'My entire face is clearly visible.',
                      eyesOpen: 'Both eyes are open and looking at camera.',
                      lightingGood: 'Lighting is sufficient and even.',
                      noMask: 'No face coverings are worn.',
                    }[key]}
                    <InfoIcon
                      text={{
                        faceVisible: 'Ensure full face is in frame without being turned.',
                        eyesOpen: 'Eyes should be open and visible without obstruction.',
                        lightingGood: 'Avoid dark or overly bright selfies.',
                        noMask: 'Do not wear masks, sunglasses or hats.',
                      }[key]}
                    />
                  </span>
                </label>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-4"
            >
              Submit Selfie
            </button>
          </div>

          <div className="border-2 border-blue-700 rounded-lg p-4 bg-blue-50 mb-2">
            <h2 className="text-md font-semibold text-blue-700 mb-3 border-b border-blue-400 pb-2">
              Selfie Analysis
            </h2>
            <div className="space-y-2 text-md text-black">
              <p>Status: <span className="font-semibold text-blue-800">{analysis.isValid}</span></p>
              <p>Face Clarity: <span className="font-semibold text-blue-800">{analysis.faceClear}</span></p>
              <p>Eyes Visibility: <span className="font-semibold text-blue-800">{analysis.eyesClear}</span></p>
              <p>Lighting: <span className="font-semibold text-blue-800">{analysis.lighting}</span></p>
            </div>
          </div>

          <div className="text-right mt-1">
            <button
              disabled={!canProceed}
              onClick={handleNext}
              className={`px-6 py-2 rounded ${
                canProceed
                  ? 'bg-blue-600 hover:bg-green-700 cursor-pointer text-white'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page2;
