import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { requestHandler } from "../utils";
import BookingServices from "../services/index";
import toast from 'react-hot-toast';
import { useSocket } from "../context/SocketContext";

function PitchBooking() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const pitch = location.state?.pitch

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [slots, setSlots] = useState([]);
  const [reservationStarted, setReservationStarted] = useState(false)
  const [reservationTime, setReservationTime] = useState(0) 
  const [bookingId, setBookingId] = useState(0); 
  const [isConnected, setConnected] = useState(false); 

  const generateSlots = (apiSlots) => {
    const slots = [];

    for (let hour = 6; hour < 18; hour++) {
      const startHour = hour;
      const endHour = hour + 1;

      const matchedSlot = apiSlots.find((slot) => {
        const apiHour = new Date(slot.startTime).getHours();
        return apiHour === hour;
      });

      // Generate timestamps for this slot
      const startDate = new Date(selectedDate);
      startDate.setHours(startHour, 0, 0, 0);

      const endDate = new Date(selectedDate);
      endDate.setHours(endHour, 0, 0, 0);

      slots.push({
        id: `${hour}`,
        time: `${startHour.toString().padStart(2, "0")}:00 – ${endHour
          .toString()
          .padStart(2, "0")}:00`,
        start: hour,
        available: matchedSlot?.available ?? true,
        startTimestamp: startDate.toISOString(),
        endTimestamp: endDate.toISOString(),
      });
    }

    return slots;
  };

  const fetchSlots = async () => {
      await requestHandler(
        async () => await BookingServices.getSlotByPitchId(id, selectedDate),
        null,
        (res) => {
          const slots = generateSlots(res.data);
          setSlots(slots);
        },
        (error) => {
          console.error(error);
        }
      );
  };
  const OnConnect = () => {
    console.log(isConnected);
    setConnected(true);
  };
  const OnDisconnect = () => {
    setConnected(false);  
  };

  const onSlotBooked = (data) => {
    
    const selected = new Date(selectedDate);

    const bookingStart = new Date(data.slot.start_time);

    // Check if booking belongs to selected date
    const isSameDate =
      bookingStart.getFullYear() === selected.getFullYear() &&
      bookingStart.getMonth() === selected.getMonth() &&
      bookingStart.getDate() === selected.getDate();
    
    if (!isSameDate) {
      return;
    }

    // Extract booked hour
    const bookedHour = bookingStart.getHours();
    
    setSlots((prevSlots) =>
      prevSlots.map((slot) => {
        if (Number(slot.id) === Number(bookedHour)) {
          return {
            ...slot,
            available: false,
          };
        }

        return slot;
      })
    );
    
  };
  const { socket } = useSocket();
  const CONNECTED_EVENT = "connected";
  const DISCONNECT_EVENT = "disconnect";
  const SLOT_BOOKED_EVENT = "slotBooked";
  useEffect(() => {
    if (!socket) return;
    socket.on(CONNECTED_EVENT, OnConnect);
    socket.on(DISCONNECT_EVENT, OnDisconnect);
    socket.on(SLOT_BOOKED_EVENT, onSlotBooked);

    return () => {
      socket.off(CONNECTED_EVENT, OnConnect);
      socket.off(DISCONNECT_EVENT, OnDisconnect);
    };
  }, [socket, selectedDate]);

  
  

  const reserveSlot = async () => {    
    const reserveSlotParams = {
      pitchId: id,
      date: new Date(),
      starttimeStamp: selectedSlot.startTimestamp,
      endTimestamp: selectedSlot.endTimestamp,
    };

    const res = await BookingServices.reserveBooking(reserveSlotParams);
    setBookingId(res.data.data.id);
    fetchSlots();
  };  


  useEffect(() => {
    fetchSlots();
  }, [selectedDate])

  // Countdown timer for reservation
  useEffect(() => {
    if (reservationStarted && reservationTime > 0) {
      const timer = setInterval(() => {
        setReservationTime(prev => {
          if (prev <= 1) {
            // Reservation expired
            setReservationStarted(false);
            setSelectedSlot(null);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [reservationStarted, reservationTime]);

  const handleSlotSelect = (slot) => {
    if (!slots.filter(s => s.id == slot.id)[0].available) {
      return
    }
    setSelectedSlot(slot)
  }

  const handleConfirmBooking = async() => {
    // Reset reservation state after confirming
    setReservationStarted(false);
    setReservationTime(0);
    
    

    if (!bookingId || bookingId == 0) {
      toast.error("something went wrong.")
    }

    await BookingServices.confirmBooking(bookingId);
    fetchSlots();
    if (!selectedSlot) return
    toast.success(`Booking confirmed for ${pitch?.name}\nDate: ${selectedDate}\nSlot: ${selectedSlot.time}`)    
  }

  if (!pitch) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Pitch not found. <button onClick={() => navigate('/pitches')} className="text-indigo-600">Go back to pitches</button></p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/pitches')}
                className="text-gray-500 hover:text-gray-700 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Cricket Pitch Booking</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name || 'User'}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Pitch Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{pitch.name}</h2>
          <p className="text-gray-600 mt-2">{pitch.location}</p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-indigo-600">₹{pitch.price_per_hour}</span>
            <span className="text-gray-500">/hour</span>
          </div>
        </div>

        {/* Date Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
          <div className="text-2xl font-bold text-gray-800 mb-2">
            Current date: {selectedDate}
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); }}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Slot Availability */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Slots</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot) => {
              const isBooked = !slot.available;
              const isSelected = selectedSlot?.id === slot.id
              return (
                <div
                  key={slot.id}
                  onClick={() => handleSlotSelect(slot)}
                  className={`p-4 rounded-lg border-2 text-center transition ${
                    isBooked
                      ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                      : isSelected
                      ? 'bg-indigo-100 border-indigo-500 cursor-pointer'
                      : 'bg-white border-gray-300 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <div className="font-medium text-gray-900">{slot.time}</div>
                  <div className={`mt-2 text-sm ${
                    isBooked ? 'text-red-600' : isSelected ? 'text-indigo-600 font-semibold' : 'text-green-600'
                  }`}>
                    {isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Reservation / Confirmation */}
          {selectedSlot && !reservationStarted && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  reserveSlot();
                  setReservationStarted(true);
                  setReservationTime(120);
                }}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition font-semibold"
              >
                Reserve Slot
              </button>
            </div>
          )}
          {reservationStarted && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">Reservation expires in {reservationTime} seconds</p>
              <div className="flex items-center justify-between mb-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600">Selected Pitch:</p>
                  <p className="font-semibold text-gray-900">{pitch.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date:</p>
                  <p className="font-semibold text-gray-900">{selectedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Time Slot:</p>
                  <p className="font-semibold text-gray-900">{selectedSlot.time}</p>
                </div>
              </div>
              <button
                onClick={handleConfirmBooking}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition font-semibold"
              >
                Confirm Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PitchBooking