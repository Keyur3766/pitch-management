import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { requestHandler } from '../utils'
import BookingServices from '../services/index'






function PitchList() {
  const navigate = useNavigate();
  const [pitches, setPitches] = useState([]);
  const { user, logout } = useAuth()
  const [bookings, setBookings] = useState([]);

  const handlePitchClick = (pitch) => {
    navigate(`/pitches/${pitch.id}`, { state: { pitch } })
  }

  


  useEffect(() => {
    const fetchPitches = async () => {
      await requestHandler(
        async () => await BookingServices.getPitches(),
        null,
        (res) => {
          setPitches(res.data);
        },
        (error) => {
          console.warn(error);
        }
      );
    };

    const fetchBooking = async () => {
      await requestHandler(
        async () => await BookingServices.getBookings(),
        null,
        (res) => {
          setBookings(res.data);
        },
        (error) => {
          console.warn(error);
        }
      );
    };

    fetchPitches();
    fetchBooking();
    
  }, []);

  

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Cricket Pitch Booking
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user?.name || "User"}
              </span>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Available Pitches
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pitches.map((pitch) => (
            <div
              key={pitch.id}
              onClick={() => handlePitchClick(pitch)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {pitch.name}
              </h3>
              <p className="text-gray-600 mt-2">{pitch.location}</p>
              <div className="mt-4">
                <span className="text-2xl font-bold text-indigo-600">
                  ₹{pitch.price_per_hour}
                </span>
                <span className="text-gray-500">/hour</span>
              </div>
              <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition">
                View Slots
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Available Pitches
        </h2>
        <div className="relative flex flex-col w-full h-full overflow-scroll bg-gray-100 rounded-lg bg-clip-border">
          <table className="w-full text-left table-auto min-w-max text-slate-800">
            <thead>
              <tr className="text-slate-500 border-b border-slate-300 bg-slate-50">
                <th className="p-4">
                  <p className="text-sm leading-none font-normal">Pitch Name</p>
                </th>

                <th className="p-4">
                  <p className="text-sm leading-none font-normal">Start Time</p>
                </th>

                <th className="p-4">
                  <p className="text-sm leading-none font-normal">End Time</p>
                </th>

                <th className="p-4">
                  <p className="text-sm leading-none font-normal">Location</p>
                </th>

                <th className="p-4">
                  <p className="text-sm leading-none font-normal">Price</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings?.length > 0 ? (
                bookings?.map((booking) => (
                  <tr
                    key={booking.bookingId}
                    className="hover:bg-slate-50 border-b border-slate-200"
                  >
                    {/* Pitch Name */}
                    <td className="p-4">
                      <p className="text-sm font-bold">{booking.pitch.name}</p>
                    </td>

                    {/* Start Time */}
                    <td className="p-4">
                      <p className="text-sm">
                        {new Date(booking.slot.startTime).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </td>

                    {/* End Time */}
                    <td className="p-4">
                      <p className="text-sm">
                        {new Date(booking.slot.endTime).toLocaleString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </td>

                    {/* Location */}
                    <td className="p-4">
                      <p className="text-sm">{booking.pitch.location}</p>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <p className="text-sm font-medium">
                        ₹{booking.pitch.price_per_hour}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PitchList