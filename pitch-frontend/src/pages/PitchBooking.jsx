import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function PitchBooking() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const pitch = location.state?.pitch

  const [selectedDate, setSelectedDate] = useState('2026-05-27')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [reservationStarted, setReservationStarted] = useState(false)
  const [reservationTime, setReservationTime] = useState(0) 
  const [bookedSlots, setBookedSlots] = useState([])

  const generateSlots = () => {
    const slots = []
    for (let hour = 6; hour < 18; hour++) {
      const startHour = hour
      const endHour = hour + 1
      slots.push({
        id: `${hour}`,
        time: `${startHour.toString().padStart(2, '0')}:00 – ${endHour.toString().padStart(2, '0')}:00`,
        start: hour
      })
    }
    return slots
  }

  const slots = generateSlots()

  useEffect(() => {
    const mockBooked = [7, 8, 12]
    setBookedSlots(mockBooked)
  }, [])

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
    if (bookedSlots.includes(parseInt(slot.id))) {
      return
    }
    setSelectedSlot(slot)
  }

  const handleConfirmBooking = () => {
    // Reset reservation state after confirming
    setReservationStarted(false);
    setReservationTime(0);
    if (!selectedSlot) return
    alert(`Booking confirmed for ${pitch?.name}\nDate: ${selectedDate}\nSlot: ${selectedSlot.time}`)
    navigate('/pitches')
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
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Slot Availability */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Slots</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot) => {
              const isBooked = bookedSlots.includes(parseInt(slot.id))
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
                  setReservationStarted(true);
                  setReservationTime(10);
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