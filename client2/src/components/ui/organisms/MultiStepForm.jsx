import { Card, CardBody, CardHeader, Progress } from "@nextui-org/react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import PropTypes from "prop-types";
import Button from "../atoms/Button";

/**
 * MultiStepForm organism component for handling multi-step forms
 */
const MultiStepForm = ({
  title,
  steps,
  currentStep,
  progress,
  isFirstStep,
  isLastStep,
  onNext,
  onPrev,
  onSubmit,
  isSubmitting = false,
  children,
  className = "",
}) => {
  const currentStepData = steps[currentStep];

  return (
    <div className={`flex justify-center items-center min-h-screen bg-background p-4 ${className}`}>
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">{title}</h2>
            {currentStepData && (
              <p className="text-sm text-default-500 mt-1">
                Step {currentStep + 1} of {steps.length}: {currentStepData.title}
              </p>
            )}
          </div>
          <Progress 
            value={progress} 
            className="max-w-md" 
            color="primary"
            aria-label={`Form progress: ${Math.round(progress)}%`}
          />
        </CardHeader>
        
        <CardBody>
          <div className="mb-6">
            {children}
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              variant="bordered"
              color="default"
              isDisabled={isFirstStep}
              onClick={onPrev}
              startContent={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? "bg-primary" : "bg-default-300"
                  }`}
                  aria-label={`Step ${index + 1} ${index < currentStep ? "completed" : index === currentStep ? "current" : "upcoming"}`}
                />
              ))}
            </div>
            
            {isLastStep ? (
              <Button
                color="success"
                onClick={onSubmit}
                isLoading={isSubmitting}
                startContent={!isSubmitting && <Check className="w-4 h-4" />}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            ) : (
              <Button
                color="primary"
                onClick={onNext}
                endContent={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

MultiStepForm.propTypes = {
  title: PropTypes.string.isRequired,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      component: PropTypes.node,
    })
  ).isRequired,
  currentStep: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired,
  isFirstStep: PropTypes.bool.isRequired,
  isLastStep: PropTypes.bool.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default MultiStepForm;