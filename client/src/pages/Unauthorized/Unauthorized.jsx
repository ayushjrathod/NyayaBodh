import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="mb-4 text-3xl font-bold text-center text-gray-800">Unauthorized Access</h1>
        <p className="mb-8 text-center text-gray-600">
          Sorry, you don't have permission to access this page. Please contact your administrator if you believe this is
          an error.
        </p>
        <div className="flex justify-center">
          <Link
            to="/"
            className="flex items-center px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}
