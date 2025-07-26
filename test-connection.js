// Script test kết nối với backend
const axios = require('axios');

const testConnection = async () => {
  try {
    console.log('Testing connection to backend...');
    
    // Test ping endpoint
    const pingResponse = await axios.get('http://localhost:8888/api/ping');
    console.log('✅ Ping successful:', pingResponse.data);
    
    // Test banners endpoint
    const bannersResponse = await axios.get('http://localhost:8888/api/banners');
    console.log('✅ Banners endpoint working:', bannersResponse.data);
    
    console.log('🎉 All tests passed! Backend is running correctly.');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('Please make sure backend is running on http://localhost:8888');
  }
};

testConnection(); 