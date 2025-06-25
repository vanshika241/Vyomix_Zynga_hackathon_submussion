import React, { useState } from 'react';
import axios from 'axios';

function FaceMatchForm() {
  const [aadhaar, setAadhaar] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aadhaar || !selfie) {
      alert("Please upload both Aadhaar and Selfie");
      return;
    }

    const formData = new FormData();
    formData.append('aadhaar', aadhaar);
    formData.append('selfie', selfie);

    try {
      const res = await axios.post('/verify-match', formData); // ✅ Relative URL for Vite proxy
      setResponse(res.data);
    } catch (error) {
      console.error("Verification failed", error);
      alert("Verification failed. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "800px", margin: "auto" }}>
      <h2>Face Match Verification</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Aadhaar Image:
            <input type="file" accept="image/*" onChange={e => setAadhaar(e.target.files[0])} required />
          </label>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Selfie Image:
            <input type="file" accept="image/*" onChange={e => setSelfie(e.target.files[0])} required />
          </label>
        </div>
        <button type="submit">Verify</button>
      </form>

      {response && (
        <div>
          <h3>Match Result</h3>
          <p><strong>Status:</strong> {response.status}</p>
          <p><strong>Match:</strong> {response.match ? "✅ Match" : "❌ No Match"}</p>
          <p><strong>Confidence:</strong> {response.confidence !== null ? `${response.confidence}%` : "N/A"}</p>

          <div style={{ display: "flex", gap: "40px", marginTop: "20px", flexWrap: "wrap" }}>
            <div>
              <h4>Aadhaar Face</h4>
              <img
                src={`/${response.aadhaar_face_url}`} // ✅ Relative path
                alt="Aadhaar Face"
                width="200"
                height="200"
                style={{ objectFit: "cover", border: "1px solid #ccc" }}
              />
              <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(response.aadhaar_analysis, null, 2)}</pre>
            </div>

            <div>
              <h4>Selfie Face</h4>
              <img
                src={`/${response.selfie_face_url}`} // ✅ Relative path
                alt="Selfie Face"
                width="200"
                height="200"
                style={{ objectFit: "cover", border: "1px solid #ccc" }}
              />
              <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(response.selfie_analysis, null, 2)}</pre>
            </div>
          </div>

          {response.warnings.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h4>Warnings</h4>
              <ul>
                {response.warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FaceMatchForm;
