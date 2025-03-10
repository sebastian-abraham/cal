import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if the environment variable is set
if (!process.env.ACTIVITY_ENGINE_URL) {
    console.warn('Warning: ACTIVITY_ENGINE_URL is not set. Using default URL.');
  }

//Url where the activity engine is running
const API_BASE_URL = process.env.ACTIVITY_ENGINE_URL || 'http://localhost:5000';
const API_ENDPOINT = `${API_BASE_URL}/course-progress/initialize-progress`;
const CONFIG_FILE = path.join(__dirname, 'enrollment-config.json');

// Function to read config file
const loadConfig = () => {
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading config file:', error);
    process.exit(1);
  }
};

// Function to enroll students
const enrollStudents = async () => {
  const config = loadConfig();
  
  if (!config.courseInstanceId || !config.studentIds || !config.modules) {
    console.error('Missing required fields in config file.');
    process.exit(1);
  }
  
  const payload = {
    courseInstanceId: config.courseInstanceId,
    studentIds: config.studentIds,
    modules: config.modules
  };
  
  try {
    const response = await axios.post(API_ENDPOINT, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Enrollment successful:', response.data);
  } catch (error) {
    console.error('Error enrolling students:', error.response?.data || error.message);
  }
};

export { enrollStudents };
