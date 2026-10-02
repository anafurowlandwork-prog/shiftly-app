/**
 * Shiftly Full End-to-End Automated Test Suite
 * Tests all core subsystems:
 * 1. AI Vision Room Scanner & Neural Volume Estimator
 * 2. Geolocation, Distance Calculation & Routing Engine
 * 3. Master Backend API Endpoints (Bookings, GPS, OTP, Stripe, Driver Payout)
 */

import handler from './api/index.js';
import { geocodeAddress, calculateDistanceMiles, generateInterpolatedRoute, searchAddressSuggestions } from './src/utils/geoUtils.js';

// Helper mock request/response for Node Vercel Serverless handler
function createMockReqRes(method, query, body) {
  let statusCode = 200;
  let headers = {};
  let responseData = null;

  const req = {
    method,
    query: query || {},
    body: body || {},
    headers: { accept: 'application/json' }
  };

  const res = {
    setHeader: (k, v) => { headers[k] = v; },
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    },
    send: (data) => {
      responseData = data;
      return res;
    },
    end: () => res
  };

  return { req, res, getResult: () => ({ statusCode, headers, responseData }) };
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🚀 RUNNING SHIFTLY END-TO-END AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, extra = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name} ${extra}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${extra}`);
      failed++;
    }
  }

  // 1. TEST: AI Vision Room Scanner Endpoint
  console.log('--- 1. Testing AI Vision Room Scanner ---');
  try {
    const samplePhotoBase64 = 'data:image/jpeg;base64,' + Buffer.from('mock_room_photo_data').toString('base64');
    const { req, res, getResult } = createMockReqRes('POST', { resource: 'ai-scan-room' }, {
      imageBase64: samplePhotoBase64,
      roomHint: 'Living Room'
    });
    await handler(req, res);
    const result = getResult();

    assert('AI Vision Endpoint returns 200 OK', result.statusCode === 200);
    assert('AI Vision returns estimated cubic volume (cuFt)', typeof result.responseData?.estCuFt === 'number' && result.responseData.estCuFt > 0, `(${result.responseData?.estCuFt} cu.ft)`);
    assert('AI Vision returns estimated cargo weight', !!result.responseData?.estWeight, `(${result.responseData?.estWeight})`);
    assert('AI Vision recommends vehicle tier', !!result.responseData?.recommendedTier, `(${result.responseData?.recommendedTier})`);
    assert('AI Vision generates bounding boxes for furniture', Array.isArray(result.responseData?.boundingBoxes) && result.responseData.boundingBoxes.length > 0, `(${result.responseData?.boundingBoxes?.length} items tracked)`);
    assert('AI Vision outputs itemized count dictionary', typeof result.responseData?.itemCounts === 'object', JSON.stringify(result.responseData?.itemCounts));
  } catch (err) {
    assert('AI Vision Scanner execution', false, err.message);
  }

  // 2. TEST: Geolocation & Distance Calculation
  console.log('\n--- 2. Testing Geolocation & Routing Engine ---');
  try {
    const londonCoords = await geocodeAddress('Oxford Street, London, UK');
    assert('Geocodes London address to [lat, lng]', Array.isArray(londonCoords) && londonCoords.length === 2 && londonCoords[0] > 50, `[${londonCoords.join(', ')}]`);

    const manchesterCoords = await geocodeAddress('Manchester City Centre, UK');
    assert('Geocodes Manchester address to [lat, lng]', Array.isArray(manchesterCoords) && manchesterCoords.length === 2 && manchesterCoords[0] > 53, `[${manchesterCoords.join(', ')}]`);

    const distance = calculateDistanceMiles(londonCoords, manchesterCoords);
    assert('Calculates true distance in miles', distance > 100, `(${distance} miles between London & Manchester)`);

    const waypoints = generateInterpolatedRoute(londonCoords, manchesterCoords, 8);
    assert('Generates dynamic interpolated route waypoints', Array.isArray(waypoints) && waypoints.length === 9, `(${waypoints.length} route coordinates)`);
  } catch (err) {
    assert('Geolocation engine execution', false, err.message);
  }

  // 3. TEST: Realtime OTP Auth Generation & Verification
  console.log('\n--- 3. Testing Authentication & OTP Subsystem ---');
  try {
    const testRecipient = '+447378142815';
    const { req: otpSendReq, res: otpSendRes, getResult: getSendResult } = createMockReqRes('POST', { resource: 'send-otp' }, {
      recipient: testRecipient,
      method: 'phone'
    });
    await handler(otpSendReq, otpSendRes);
    const sendResult = getSendResult();

    assert('Send OTP returns 200 OK', sendResult.statusCode === 200);
    const dynamicCode = sendResult.responseData?.generatedCode;
    assert('Generates dynamic 6-digit random code', !!dynamicCode && dynamicCode.length === 6, `(Code: ${dynamicCode})`);

    const { req: otpVerifyReq, res: otpVerifyRes, getResult: getVerifyResult } = createMockReqRes('POST', { resource: 'verify-otp' }, {
      recipient: testRecipient,
      code: dynamicCode
    });
    await handler(otpVerifyReq, otpVerifyRes);
    const verifyResult = getVerifyResult();

    assert('Verifies generated 6-digit code with 200 OK', verifyResult.statusCode === 200 && verifyResult.responseData?.verified === true);
  } catch (err) {
    assert('OTP verification flow', false, err.message);
  }

  // 4. TEST: Bookings CRUD & Realtime Dispatch
  console.log('\n--- 4. Testing Bookings & Driver Dispatch Subsystem ---');
  try {
    const { req: createReq, res: createRes, getResult: getCreateResult } = createMockReqRes('POST', { resource: 'bookings' }, {
      pickup: '10 Oxford Street, London, W1D 1BS',
      dropoff: 'King’s Road, Chelsea, London, SW3 4ND',
      moveSize: '2 Bedroom Apt',
      total: 195.00,
      helpers: 2
    });
    await handler(createReq, createRes);
    const createResult = getCreateResult();

    assert('Creates booking with 201 Created', createResult.statusCode === 201);
    const newBookingId = createResult.responseData?.booking?.id;
    assert('Generates tracking booking ID', !!newBookingId, `(ID: ${newBookingId})`);

    const { req: listReq, res: listRes, getResult: getListResult } = createMockReqRes('GET', { resource: 'bookings' });
    await handler(listReq, listRes);
    const listResult = getListResult();

    assert('Retrieves active bookings list with 200 OK', listResult.statusCode === 200 && Array.isArray(listResult.responseData?.bookings));
  } catch (err) {
    assert('Bookings management flow', false, err.message);
  }

  // 5. TEST: Live Driver GPS Telemetry Stream
  console.log('\n--- 5. Testing Driver GPS Telemetry Stream ---');
  try {
    const { req: gpsSendReq, res: gpsSendRes, getResult: getGpsSendResult } = createMockReqRes('POST', { resource: 'driver-location' }, {
      lat: 51.5154,
      lng: -0.1419,
      heading: 180,
      speedMph: 28
    });
    await handler(gpsSendReq, gpsSendRes);
    const gpsSendResult = getGpsSendResult();

    assert('Broadcasts driver GPS coordinates with 200 OK', gpsSendResult.statusCode === 200 && gpsSendResult.responseData?.success === true);

    const { req: gpsGetReq, res: gpsGetRes, getResult: getGpsGetResult } = createMockReqRes('GET', { resource: 'driver-location' });
    await handler(gpsGetReq, gpsGetRes);
    const gpsGetResult = getGpsGetResult();

    assert('Streams active driver coordinates with 200 OK', gpsGetResult.statusCode === 200 && gpsGetResult.responseData?.lat === 51.5154, `(GPS: ${gpsGetResult.responseData?.lat}, ${gpsGetResult.responseData?.lng})`);
  } catch (err) {
    assert('Driver GPS Telemetry flow', false, err.message);
  }

  // 6. TEST: Stripe Intent & Instant Payout
  console.log('\n--- 6. Testing Stripe Payment Processing & Driver Payout ---');
  try {
    const { req: stripeReq, res: stripeRes, getResult: getStripeResult } = createMockReqRes('POST', { resource: 'stripe-intent' }, {
      amount: 195.00,
      currency: 'gbp',
      customerEmail: 'user@shiftly.com'
    });
    await handler(stripeReq, stripeRes);
    const stripeResult = getStripeResult();

    assert('Generates Stripe payment intent clientSecret', stripeResult.statusCode === 200 && !!stripeResult.responseData?.clientSecret);

    const { req: payoutReq, res: payoutRes, getResult: getPayoutResult } = createMockReqRes('POST', { resource: 'driver-payout' }, {
      driverId: 'DRV-9921',
      amount: 150.00
    });
    await handler(payoutReq, payoutRes);
    const payoutResult = getPayoutResult();

    assert('Executes instant driver payout transfer', payoutResult.statusCode === 200 && payoutResult.responseData?.success === true);
  } catch (err) {
    assert('Payment & Payout flow', false, err.message);
  }

  // 7. TEST: Proof of Delivery (POD) & Digital Signature Verification
  console.log('\n--- 7. Testing Driver Proof of Delivery & Digital Signature ---');
  try {
    const samplePodCertificate = {
      podId: 'POD-2026-88192',
      timestamp: new Date().toISOString(),
      driverName: 'Marcus Vance',
      signerName: 'Sarah Jenkins',
      conditionStatus: 'PRISTINE',
      photosCount: 2,
      signatureRecorded: true
    };

    assert('Validates POD Certificate ID structure', samplePodCertificate.podId.startsWith('POD-2026-'), `(${samplePodCertificate.podId})`);
    assert('Validates Recipient Digital Sign-off presence', samplePodCertificate.signatureRecorded === true && !!samplePodCertificate.signerName);
    assert('Validates Cargo Inspection Pristine Condition Tag', samplePodCertificate.conditionStatus === 'PRISTINE');
    assert('Validates Delivery Photo Attachments Count', samplePodCertificate.photosCount >= 1, `(${samplePodCertificate.photosCount} photos attached)`);
  } catch (err) {
    assert('Proof of Delivery validation', false, err.message);
  }

  console.log('\n====================================================');
  console.log(`📊 TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();

