import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function App() {
    const [mood, setMood] = useState('');
    const [moodLogs, setMoodLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMoodLogs();
    }, []);

    const logMood = async () => {
        try {
            const now = new Date();
            const utcDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000).toISOString();

            await axios.post('http://localhost:5000/log_mood', {
                user_id: 1,
                mood,
                date: utcDate,
            });
            fetchMoodLogs();
        } catch (err) {
            console.error("Error logging mood:", err);
            setError(err.message || "Error logging mood");
        }
    };

    const fetchMoodLogs = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('http://localhost:5000/mood_logs');
            // Parse the date strings into Date objects
            const parsedData = response.data.map(item => ({
                ...item,
                date: new Date(item.date),
            }));
            setMoodLogs(parsedData);
        } catch (err) {
            console.error("Error fetching mood logs:", err);
            setError(err.message || "Error fetching mood logs");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        // Format the date to a more readable format
        return new Date(date).toLocaleDateString(); // e.g., "3/2/2025"
    };

    return (
        <div>
            <h1>Mood Tracker</h1>

            {error && <div style={{ color: 'red' }}>Error: {error}</div>}

            <select value={mood} onChange={(e) => setMood(e.target.value)}>
                <option value="">Select Mood</option>
                <option value="Happy">Happy</option>
                <option value="Sad">Sad</option>
                <option value="Neutral">Neutral</option>
            </select>
            <button onClick={logMood} disabled={loading}>
                {loading ? "Logging..." : "Log Mood"}
            </button>

            <h2>Mood Chart</h2>
            {loading ? (
                <div>Loading mood data...</div>
            ) : moodLogs.length > 0 ? (
                <BarChart width={700} height={400} data={moodLogs}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis />
                    <Tooltip formatter={(value) => `<p>The Mood is ${value} at the Given Time!`}/>
                    <Legend />
                    <Bar dataKey="mood" fill="#8884d8" />
                </BarChart>
            ) : (
                <div>No mood data available.</div>
            )}
        </div>
    );
}

export default App;
