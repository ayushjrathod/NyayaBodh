import { Button, Card } from "@nextui-org/react";
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

          <Link to="/login">
            <Button variant="solid" color="primary" startContent={<ArrowLeft />}>

              Go Back
            </Button>
          </Link>


        </div>
      </Card>
    </div>
  );
}
