import { Card, CardBody, CardHeader } from "@nextui-org/react";
import PropTypes from "prop-types";

/**
 * Versatile skeleton loader component for different content types
 */
const SkeletonLoader = ({ type = "card", count = 1, className = "", animated = true }) => {
  const baseClasses = `bg-default-200 rounded-lg ${animated ? "animate-pulse" : ""}`;

  const renderSkeleton = (index) => {
    switch (type) {
      case "search-result":
        return (
          <Card key={index} className={`w-full mb-4 ${className}`}>
            <CardBody className="p-6">
              <div className="space-y-4">
                {/* Title skeleton */}
                <div className={`h-6 w-3/4 ${baseClasses}`} />
                {/* Subtitle skeleton */}
                <div className={`h-4 w-1/2 ${baseClasses}`} />
                {/* Content skeleton */}
                <div className="space-y-2">
                  <div className={`h-4 w-full ${baseClasses}`} />
                  <div className={`h-4 w-5/6 ${baseClasses}`} />
                  <div className={`h-4 w-4/5 ${baseClasses}`} />
                </div>
                {/* Action buttons skeleton */}
                <div className="flex gap-3 mt-4">
                  <div className={`h-8 w-24 ${baseClasses}`} />
                  <div className={`h-8 w-32 ${baseClasses}`} />
                </div>
              </div>
            </CardBody>
          </Card>
        );

      case "recommendation":
        return (
          <Card key={index} className={`w-full mb-6 ${className}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start w-full">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${baseClasses}`} />
                  <div className="space-y-2">
                    <div className={`h-4 w-32 ${baseClasses}`} />
                    <div className={`h-3 w-24 ${baseClasses}`} />
                  </div>
                </div>
                <div className={`h-6 w-16 rounded-full ${baseClasses}`} />
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className={`h-3 w-20 ${baseClasses}`} />
                  <div className={`h-4 w-full ${baseClasses}`} />
                </div>
                <div className="space-y-2">
                  <div className={`h-3 w-16 ${baseClasses}`} />
                  <div className={`h-4 w-4/5 ${baseClasses}`} />
                </div>
                <div className="space-y-2">
                  <div className={`h-4 w-full ${baseClasses}`} />
                  <div className={`h-4 w-3/4 ${baseClasses}`} />
                </div>
              </div>
            </CardBody>
          </Card>
        );

      case "chat-message":
        return (
          <div key={index} className={`flex gap-3 mb-4 ${className}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 ${baseClasses}`} />
            <div className="flex-1 space-y-2">
              <div className={`h-4 w-3/4 ${baseClasses}`} />
              <div className={`h-4 w-1/2 ${baseClasses}`} />
            </div>
          </div>
        );

      case "form-field":
        return (
          <div key={index} className={`space-y-2 mb-4 ${className}`}>
            <div className={`h-4 w-24 ${baseClasses}`} />
            <div className={`h-12 w-full rounded-lg ${baseClasses}`} />
          </div>
        );

      case "table-row":
        return (
          <div key={index} className={`flex gap-4 p-4 border-b border-default-200 ${className}`}>
            <div className={`h-4 w-1/4 ${baseClasses}`} />
            <div className={`h-4 w-1/3 ${baseClasses}`} />
            <div className={`h-4 w-1/6 ${baseClasses}`} />
            <div className={`h-4 w-1/4 ${baseClasses}`} />
          </div>
        );

      case "filter":
        return (
          <Card key={index} className={`w-full ${className}`}>
            <CardHeader className="pb-2">
              <div className={`h-5 w-24 ${baseClasses}`} />
            </CardHeader>
            <CardBody className="space-y-3">
              {[1, 2, 3].map((section) => (
                <div key={section} className="space-y-2 border border-default-200/70 rounded-md p-3">
                  <div className={`h-4 w-20 ${baseClasses}`} />
                  <div className={`h-3 w-28 ${baseClasses}`} />
                  <div className={`h-3 w-24 ${baseClasses}`} />
                </div>
              ))}
            </CardBody>
          </Card>
        );

      case "card":
      default:
        return (
          <Card key={index} className={`w-full mb-4 ${className}`}>
            <CardHeader>
              <div className={`h-6 w-1/2 ${baseClasses}`} />
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className={`h-4 w-full ${baseClasses}`} />
                <div className={`h-4 w-4/5 ${baseClasses}`} />
                <div className={`h-4 w-3/5 ${baseClasses}`} />
              </div>
            </CardBody>
          </Card>
        );
    }
  };

  return <div className="space-y-4">{Array.from({ length: count }, (_, index) => renderSkeleton(index))}</div>;
};

SkeletonLoader.propTypes = {
  type: PropTypes.oneOf([
    "card",
    "search-result",
    "recommendation",
    "chat-message",
    "form-field",
    "table-row",
    "filter",
  ]),
  count: PropTypes.number,
  className: PropTypes.string,
  animated: PropTypes.bool,
};

export default SkeletonLoader;
