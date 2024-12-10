import { Card } from "@nextui-org/react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="flex font-inter items-center justify-center min-h-screen bg-background">
      <Card className="p-8 ounded-lg shadow-md max-w-md w-full">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="mb-4  text-3xl font-bold text-center text-foreground">Unauthorized Access</h1>
        <p className="mb-8 text-center text-foreground-400">
          Sorry, you don't have permission to access this page. Please contact your administrator if you believe this is
          an error.
        </p>
        <div className="flex justify-center">
          <Link
            to="/"
            className="flex items-center px-4 py-2 font-medium text-fo bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Link>
        </div>
      </Card>
    </div>
  );
}
