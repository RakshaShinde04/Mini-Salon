import { GET as getServices } from '../src/app/api/services/route.ts';
import { GET as getBookings, POST as postBooking } from '../src/app/api/bookings/route.ts';
import { PATCH as patchBooking } from '../src/app/api/bookings/[id]/route.ts';
import { GET as getSlots } from '../src/app/api/slots/route.ts';
import { POST as postChat } from '../src/app/api/chat/route.ts';

// Simple NextRequest mock
function mockReq(url, method = 'GET', body = null) {
  return {
    url,
    method,
    json: async () => body,
  };
}

async function runTests() {
  console.log('--- Starting API Verification Tests ---');

  // 1. GET /api/services
  const resServices = await getServices();
  const dataServices = await resServices.json();
  console.log('1. GET /services: OK, count =', dataServices.data?.length);
  if (!dataServices.success || dataServices.data.length < 5) {
    throw new Error('Services test failed');
  }

  // 2. POST /bookings - Missing fields
  const resMissing = await postBooking(
    mockReq('http://localhost/api/bookings', 'POST', { customer_name: 'Test' })
  );
  console.log('2. POST /bookings (missing fields): status =', resMissing.status);
  if (resMissing.status !== 400) throw new Error('Missing fields check failed');

  // 3. POST /bookings - Invalid phone (not 10 digits)
  const resPhone = await postBooking(
    mockReq('http://localhost/api/bookings', 'POST', {
      customer_name: 'Test User',
      phone: '12345',
      service: 'Haircut',
      date: '2026-10-25',
      time: '15:00',
    })
  );
  console.log('3. POST /bookings (invalid phone): status =', resPhone.status);
  if (resPhone.status !== 400) throw new Error('Phone validation check failed');

  // 4. POST /bookings - Valid booking
  const resValid = await postBooking(
    mockReq('http://localhost/api/bookings', 'POST', {
      customer_name: 'Test User',
      phone: '9988776655',
      service: 'Haircut',
      date: '2026-10-25',
      time: '15:00',
    })
  );
  const dataValid = await resValid.json();
  console.log('4. POST /bookings (valid): status =', resValid.status, 'id =', dataValid.data?.id);
  if (resValid.status !== 201) throw new Error('Valid booking creation failed');

  // 5. POST /bookings - Double booking check (same date & time)
  const resDouble = await postBooking(
    mockReq('http://localhost/api/bookings', 'POST', {
      customer_name: 'Another User',
      phone: '9123456780',
      service: 'Hair Spa',
      date: '2026-10-25',
      time: '15:00',
    })
  );
  console.log('5. POST /bookings (double booking): status =', resDouble.status);
  if (resDouble.status !== 409) throw new Error('Double booking prevention check failed');

  // 6. PATCH /bookings/:id - Status update
  const resPatch = await patchBooking(
    mockReq('http://localhost/api/bookings/' + dataValid.data.id, 'PATCH', { status: 'Done' }),
    { params: Promise.resolve({ id: String(dataValid.data.id) }) }
  );
  const dataPatch = await resPatch.json();
  console.log('6. PATCH /bookings/:id status =', resPatch.status, 'new status =', dataPatch.data?.status);
  if (dataPatch.data?.status !== 'Done') throw new Error('Status update failed');

  // 7. GET /api/slots
  const resSlots = await getSlots(mockReq('http://localhost/api/slots?date=2026-10-25'));
  const dataSlots = await resSlots.json();
  const bookedSlot = dataSlots.slots.find((s) => s.time === '15:00');
  console.log('7. GET /slots: slot 15:00 available =', bookedSlot?.available);
  if (bookedSlot?.available !== false) throw new Error('Slots check failed');

  // 8. POST /api/chat - Hinglish query & out-of-scope query
  const resChatPrice = await postChat(
    mockReq('http://localhost/api/chat', 'POST', { message: 'Hair spa ka charge kitna hai?' })
  );
  const dataChatPrice = await resChatPrice.json();
  console.log('8a. AI Chat (Hinglish price query):', dataChatPrice.reply);

  const resChatOutOfScope = await postChat(
    mockReq('http://localhost/api/chat', 'POST', { message: 'Ghar pe aakar service doge kya?' })
  );
  const dataChatOutOfScope = await resChatOutOfScope.json();
  console.log('8b. AI Chat (Out of scope decline):', dataChatOutOfScope.reply);

  console.log('✅ ALL BACKEND & DATABASE TESTS PASSED PERFECTLY!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
