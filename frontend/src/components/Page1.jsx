import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE_MB = 10;

const Page1 = () => {
  const navigate = useNavigate();

  const [aadharFile, setAadharFile] = useState(null);
  const [dob, setDob] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [ocrAccuracy, setOcrAccuracy] = useState('');
  const [clarity, setClarity] = useState('');
  const [lighting, setLighting] = useState('');
  const [language, setLanguage] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [status, setStatus] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const [blur, setBlur] = useState(null);
  const [brightness, setBrightness] = useState(null);
  const [facesDetected, setFacesDetected] = useState(null);
  const [ocrScoreRaw, setOcrScoreRaw] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > MAX_FILE_SIZE) {
      alert(`File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setAadharFile(file);
  };

  const handleSubmit = async () => {
    if (!aadharFile || !language) {
      alert('Please upload Aadhaar and select language.');
      return;
    }

    const formData = new FormData();
    formData.append('aadhaar', aadharFile);
    formData.append('language', language);

    try {
      const response = await fetch('http://localhost:5000/aadhaar-check', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Server error while verifying Aadhaar');

      const data = await response.json();

      setDob(data.dob || 'Not detected');
      setName(data.name || 'Not detected');
      setGender(data.gender || 'Not detected');
      setOcrAccuracy(`${data.ocr_score || 0}%`);
      setClarity(data.blur <= 100 ? 'Poor' : 'Good');
      setLighting(
        data.brightness < 80
          ? 'Too Dim'
          : data.brightness > 180
          ? 'Too Bright'
          : 'Adequate'
      );
      setStatus(data.status);
      setWarnings(data.warnings || []);
      setPreviewImage(`data:image/jpeg;base64,${data.aadhaar_base64}`);

      setBlur(data.blur ?? null);
      setBrightness(data.brightness ?? null);
      setFacesDetected(data.faces_detected ?? null);
      setOcrScoreRaw(data.ocr_score ?? null);
    } catch (error) {
      alert(error.message);
    }
  };

  const calculateAge = (dobStr) => {
    if (!dobStr || dobStr === 'Not detected') return '';
    const parts = dobStr.includes('/') ? dobStr.split('/') : dobStr.split('-');
    let day, month, year;
    if (parts[0].length === 4) {
      [year, month, day] = parts;
    } else {
      [day, month, year] = parts;
    }
    const dobDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) age--;
    return age;
  };

  const handleNext = () => {
    if (status !== 'pass') {
      alert('Image validation failed. Please upload a valid Aadhaar.');
      return;
    }

    if (!dob || dob === 'Not detected') {
      alert('Date of Birth could not be detected. Please upload a clearer Aadhaar card.');
      return;
    }

    navigate('/page2', {
      state: {
        aadhaarFile: aadharFile,
        aadhaarAnalysis: {
          name,
          gender,
          dob,
          ocrAccuracy,
          ocr_score: ocrScoreRaw,
          blur,
          brightness,
          lighting,
          clarity,
          language,
          status,
          warnings,
          faces_detected: facesDetected,
        },
      },
    });
  };

  const TooltipInfo = ({ text }) => (
    <div className="relative group flex items-center mr-2">
      <div className="w-4 h-4 bg-gray-400 text-xs text-white rounded-full flex items-center justify-center font-semibold cursor-pointer">
        i
      </div>
      <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 w-max max-w-xs z-10 whitespace-nowrap shadow-lg">
        {text}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-6 flex flex-col">
      <div className="flex justify-between max-w-6xl mx-auto gap-10 mt-10">
        {/* Upload Form */}
        <div className="w-1/2 flex flex-col space-y-6 bg-white p-6 rounded-lg shadow-md min-h-[450px]">
          <div>
            <h2 className="text-xl font-semibold mb-2">Upload Aadhaar</h2>
            <div className="border-2 border-dashed border-gray-400 p-8 text-center rounded-md text-gray-600 flex flex-col items-center justify-center space-y-4">
              <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <i className="ri-file-upload-line text-5xl text-black-600 mb-2"></i>
                <span className="text-lg">
                  Drag and drop a file here <br /> or click to select (Max: {MAX_FILE_SIZE_MB}MB)
                </span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="language" className="block text-md font-medium mb-1">
              Select Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border border-gray-400 p-2 w-full rounded text-md"
            >
              <option value="">Choose Language</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition text-lg cursor-pointer"
          >
            Submit
          </button>
        </div>

        {/* Extracted Info */}
        <div className="w-1/2 bg-white p-6 rounded-lg shadow-md space-y-5">
          <h2 className="text-xl font-semibold text-blue-700 mb-2">Preview & Extracted Data</h2>

          {previewImage && (
            <img src={previewImage} alt="Aadhaar Preview" className="h-32 object-contain rounded border mb-4" />
          )}

          <div className="space-y-3 text-md">
            <div className="flex items-center">
              <TooltipInfo text="DOB as detected from the Aadhaar card." />
              <p><strong>DOB:</strong>&nbsp;{dob}</p>
            </div>

            {dob && dob !== 'Not detected' && (
              <div className="flex items-center">
                <TooltipInfo text="Calculated from the DOB mentioned in the Aadhaar card." />
                <p><strong>Age:</strong>&nbsp;{calculateAge(dob)}</p>
              </div>
            )}

            <div className="flex items-center">
              <TooltipInfo text="How well the Aadhaar text was extracted. Higher is better." />
              <p>
                OCR Accuracy:&nbsp;
                <span className={`font-semibold ${parseInt(ocrAccuracy) < 20 ? 'text-red-600' : parseInt(ocrAccuracy) < 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {ocrAccuracy}
                </span>
              </p>
            </div>

            <div className="flex items-center">
              <TooltipInfo text="Indicates if the image is blurry. Blurry images can reduce accuracy." />
              <p>
                Image Clarity:&nbsp;
                <span className={`font-semibold ${clarity === 'Poor' ? 'text-red-600' : 'text-green-600'}`}>
                  {clarity}
                </span>
              </p>
            </div>

            <div className="flex items-center">
              <TooltipInfo text="Assesses if the lighting is too dark, too bright, or acceptable." />
              <p>
                Lighting:&nbsp;
                <span className={`font-semibold ${lighting === 'Too Bright' || lighting === 'Too Dim' ? 'text-red-600' : 'text-green-600'}`}>
                  {lighting}
                </span>
              </p>
            </div>

            <p>Language: <span className="font-semibold">{language}</span></p>

            {warnings.length > 0 && (
              <div className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                <strong>Warnings:</strong>
                <ul className="list-disc list-inside mt-1">
                  {warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {status === 'fail' && (
              <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                ❌ Image validation failed. Please re-upload a clearer image.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4 px-10">
        <button
          onClick={handleNext}
          disabled={status === 'fail' || !dob || dob === 'Not detected'}
          className={`px-6 py-2 rounded text-lg cursor-pointer transition ${
            status === 'fail' || !dob || dob === 'Not detected'
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-green-700'
          }`}
        >
          Next ➤
        </button>
      </div>
    </div>
  );
};

export default Page1;
