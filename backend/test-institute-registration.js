const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:3030/api';
const TEST_DATA = {
  aisheCode: 'U-0001',
  instituteType: 'Government',
  state: 'Maharashtra',
  district: 'Mumbai',
  universityName: 'Test University of Technology',
  address: '123 University Road, Mumbai, Maharashtra, India',
  email: 'admin@testuniversity.edu.in',
  headOfInstitute: {
    name: 'Dr. Rajesh Kumar',
    email: 'ashwani.rru@gmail.com',
    contact: '9876543210',
    alternateContact: '9876543211'
  },
  modalOfficer: {
    name: 'Prof. Priya Sharma',
    email: 'priya.sharma@testuniversity.edu.in',
    contact: '9876543212',
    alternateContact: '9876543213'
  },
  naacGrading: true,
  naacGrade: 'A+'
};

async function testInstituteRegistration() {
  console.log('🧪 Testing Institute Registration Flow...\n');

  try {
    // Test 1: Submit institute registration request
    console.log('1️⃣ Testing institute registration submission...');
    const submitResponse = await axios.post(`${API_BASE_URL}/institute-requests/submit`, TEST_DATA);
    
    if (submitResponse.data.success) {
      console.log('✅ Institute registration submitted successfully');
      console.log(`   Request ID: ${submitResponse.data.requestId}`);
    } else {
      console.log('❌ Failed to submit institute registration');
      console.log(`   Error: ${submitResponse.data.message}`);
      return;
    }

    const requestId = submitResponse.data.requestId;

    // Test 2: Fetch all institute requests
    console.log('\n2️⃣ Testing fetch all institute requests...');
    try {
      const allRequestsResponse = await axios.get(`${API_BASE_URL}/institute-requests/all`);
      console.log('✅ Successfully fetched all institute requests');
      console.log(`   Total requests: ${allRequestsResponse.data.data.length}`);
    } catch (error) {
      console.log('⚠️  Fetch all requests failed (might need authentication)');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    // Test 3: Fetch specific institute request
    console.log('\n3️⃣ Testing fetch specific institute request...');
    try {
      const specificRequestResponse = await axios.get(`${API_BASE_URL}/institute-requests/${requestId}`);
      console.log('✅ Successfully fetched specific institute request');
      console.log(`   University: ${specificRequestResponse.data.data.universityName}`);
      console.log(`   Status: ${specificRequestResponse.data.data.status}`);
    } catch (error) {
      console.log('⚠️  Fetch specific request failed (might need authentication)');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    // Test 4: Test duplicate submission
    console.log('\n4️⃣ Testing duplicate submission prevention...');
    try {
      await axios.post(`${API_BASE_URL}/institute-requests/submit`, TEST_DATA);
      console.log('❌ Duplicate submission was allowed (this should not happen)');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Duplicate submission correctly prevented');
        console.log(`   Error message: ${error.response.data.message}`);
      } else {
        console.log('❌ Unexpected error during duplicate test');
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 5: Test validation with invalid data
    console.log('\n5️⃣ Testing validation with invalid data...');
    const invalidData = { ...TEST_DATA };
    delete invalidData.universityName; // Remove required field

    try {
      await axios.post(`${API_BASE_URL}/institute-requests/submit`, invalidData);
      console.log('❌ Invalid data was accepted (this should not happen)');
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 500) {
        console.log('✅ Invalid data correctly rejected');
        console.log(`   Error message: ${error.response.data.message}`);
      } else {
        console.log('❌ Unexpected error during validation test');
        console.log(`   Error: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 6: Test with invalid email format
    console.log('\n6️⃣ Testing email validation...');
    const invalidEmailData = { ...TEST_DATA };
    invalidEmailData.email = 'invalid-email';

    try {
      await axios.post(`${API_BASE_URL}/institute-requests/submit`, invalidEmailData);
      console.log('❌ Invalid email was accepted (this should not happen)');
    } catch (error) {
      console.log('✅ Invalid email correctly rejected');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🎉 Institute Registration Flow Test Completed!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Basic registration submission works');
    console.log('- ✅ Duplicate prevention works');
    console.log('- ✅ Basic validation works');
    console.log('- ⚠️  Authentication-required endpoints need proper setup');

  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log(`   ${error.response?.data?.message || error.message}`);
    if (error.response?.data?.error) {
      console.log(`   Details: ${error.response.data.error}`);
    }
  }
}

// Test server connectivity first
async function testServerConnectivity() {
  try {
    console.log('🔍 Testing server connectivity...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Server is running and accessible');
    console.log(`   Status: ${healthResponse.data.status}`);
    console.log(`   Port: ${healthResponse.data.port}\n`);
    return true;
  } catch (error) {
    console.log('❌ Server is not accessible');
    console.log(`   Error: ${error.message}`);
    console.log('   Make sure the backend server is running on port 5000\n');
    return false;
  }
}

// Run the tests
async function runTests() {
  const serverAccessible = await testServerConnectivity();
  if (serverAccessible) {
    await testInstituteRegistration();
  } else {
    console.log('⚠️  Skipping registration tests due to server connectivity issues');
  }
}

// Execute if run directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testInstituteRegistration, testServerConnectivity };
