const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const startRecording = async (matchId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/recordings/start/${matchId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error starting recording:', error);
    throw error;
  }
};

export const stopRecording = async (matchId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/recordings/stop/${matchId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error stopping recording:', error);
    throw error;
  }
};

export const savePositions = async (recordingId, positions) => {
  try {
    const response = await fetch(`${BASE_URL}/api/recordings/positions/${recordingId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ positions })
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving positions:', error);
    throw error;
  }
};

export const getRecordingData = async (matchId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/recordings/${matchId}`);
    return await response.json();
  } catch (error) {
    console.error('Error getting recording data:', error);
    throw error;
  }
};