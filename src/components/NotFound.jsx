import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="mb-6">Sorry, the page you’re looking for doesn’t exist.</p>
      <Link
        to="/"
        className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Go Home
      </Link>
    </div>
  )
}