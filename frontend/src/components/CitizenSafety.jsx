import React, { useState, useEffect } from 'react';

export default function CitizenSafety({ citizenId, incidentId }) {
  const [alertData, setAlertData] = useState(null);
  const [guidance, setGuidance] = useState(null);
  const [observationText, setObservationText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch specific alert
        if (incidentId) {
            const aRes = await fetch(`http://127.0.0.1:8000/api/national/citizen-alerts?incident_id=${incidentId}`);
            const aData = await aRes.json();
            const myAlert = aData.records.find(a => a.citizen_id === citizenId && a.status !== "CREATED" && a.status !== "APPROVED");
            setAlertData(myAlert || null);
            
            // Get Preparedness
            if (myAlert) {
                const gRes = await fetch(`http://127.0.0.1:8000/api/national/preparedness?hazard_type=Flood&risk_level=${myAlert.severity}`);
                const gData = await gRes.json();
                setGuidance(gData.record);
            }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [citizenId, incidentId]);

  async function acknowledgeAlert() {
    if (!alertData) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/national/citizen-alerts/${alertData.alert_id}/acknowledge`, { method: 'POST' });
      if (res.ok) {
        setAlertData({ ...alertData, status: 'ACKNOWLEDGED' });
        alert("Alert Acknowledged. Stay safe.");
      }
    } catch(e) {
      console.error(e);
    }
  }

  async function submitObservation() {
    if (!observationText.trim() || !incidentId) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/national/citizen-observations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: incidentId,
          description: observationText,
          latitude: 15.365,
          longitude: 75.125,
          demo: true
        })
      });
      if (res.ok) {
        setObservationText("");
        alert("Observation submitted. EOC will review it.");
      }
    } catch(e) {
      console.error(e);
    }
  }

  if (loading) return <div className="p-4 bg-white border border-gray-300 rounded shadow w-[400px]">Loading Safety Dashboard...</div>;

  return (
    <div className="bg-white border-2 border-red-200 rounded-lg shadow-lg w-[400px] flex flex-col font-sans">
      <div className="bg-red-600 text-white p-3 rounded-t-lg">
        <h2 className="font-bold text-lg text-center">CITIZEN SAFETY APP</h2>
        <p className="text-xs text-center text-red-200">DEMO CITIZEN VIEW - DO NOT RELY ON THIS FOR REAL EMERGENCIES</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {!alertData ? (
          <p className="text-gray-600 italic">No active alerts for you at this time.</p>
        ) : (
          <div className="space-y-4">
            <div className={`p-3 border rounded ${alertData.severity === 'CRITICAL' ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'}`}>
              <h3 className="font-bold text-red-800">{alertData.title}</h3>
              <p className="text-sm mt-1">{alertData.message}</p>
              
              <div className="mt-3 text-xs text-gray-500">
                <p>Status: <span className="font-bold text-gray-700">{alertData.status}</span></p>
                <p>Delivered via: {alertData.channel}</p>
              </div>

              {alertData.status !== "ACKNOWLEDGED" && (
                <button 
                  onClick={acknowledgeAlert}
                  className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded shadow"
                >
                  ACKNOWLEDGE ALERT
                </button>
              )}
            </div>

            {guidance && (
              <div className="text-sm">
                <h4 className="font-bold text-green-700 border-b pb-1 mb-2">WHAT TO DO</h4>
                <ul className="list-disc pl-5 mb-3 text-gray-700 space-y-1">
                  {guidance.actions.map((act, i) => <li key={`act-${i}`}>{act}</li>)}
                </ul>

                <h4 className="font-bold text-red-700 border-b pb-1 mb-2">WHAT TO AVOID</h4>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  {guidance.avoid.map((av, i) => <li key={`av-${i}`}>{av}</li>)}
                </ul>
              </div>
            )}
            
            <div className="mt-4 p-3 border rounded bg-gray-50">
                <h4 className="font-bold text-sm text-gray-800 mb-2">Submit Observation</h4>
                <textarea 
                    className="w-full text-sm border p-2 rounded h-16" 
                    placeholder="e.g., Water is 2ft high on Main St..."
                    value={observationText}
                    onChange={e => setObservationText(e.target.value)}
                />
                <button onClick={submitObservation} className="mt-2 bg-blue-600 text-white font-bold text-xs px-3 py-1 rounded w-full">SUBMIT TO EOC</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
