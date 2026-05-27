import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const mockPitches = [
  {
    id: 1,
    name: 'Green Valley Cricket Ground',
    location: 'Downtown Sports Complex',
    price_per_hour: 500
  },
  {
    id: 2,
    name: 'Sunset Cricket Pitch',
    location: 'Westside Park',
    price_per_hour: 750
  },
  {
    id: 3,
    name: 'Riverside Ground',
    location: 'Riverside Avenue',
    price_per_hour: 600
  },
  {
    id: 4,
    name: 'Champions Cricket Stadium',
    location: 'North Sports District',
    price_per_hour: 1000
  }
]

function PitchList() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handlePitchClick = (pitch) => {
    navigate(`/pitches/${pitch.id}`, { state: { pitch } })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Pitches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPitches.map((pitch) => (
            <div
              key={pitch.id}
              onClick={() => handlePitchClick(pitch)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900">{pitch.name}</h3>
              <p className="text-gray-600 mt-2">{pitch.location}</p>
              <div className="mt-4">
                <span className="text-2xl font-bold text-indigo-600">₹{pitch.price_per_hour}</span>
                <span className="text-gray-500">/hour</span>
              </div>
              <button className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition">
                View Slots
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PitchList