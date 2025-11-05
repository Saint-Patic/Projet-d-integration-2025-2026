import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.129.224:3300/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    console.log("API Request:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("API Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    const errorDetails = {
      message: error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    };

    console.error("API Error:", errorDetails);

    if (error.code === "ECONNABORTED") {
      console.error(
        "Request timeout - Check if your backend server is running"
      );
    } else if (error.message === "Network Error") {
      console.error("Network Error - Possible causes:");
      console.error("1. Backend server is not running");
      console.error("2. Incorrect baseURL configuration");
      console.error("3. CORS issues");
      console.error("4. Device/emulator cannot reach the backend");
    }

    return Promise.reject(error);
  }
);

export default api;
