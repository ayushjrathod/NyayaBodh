import PropTypes from "prop-types";
import { Button, Card, CardBody } from "@nextui-org/react";
import { 
  Search, 
  FileText, 
  MessageSquare, 
  Users, 
  Database,
  AlertCircle,
  Inbox,
  BookOpen
} from "lucide-react";

/**
 * Reusable empty state component with different variants
 */
const EmptyState = ({
  type = "default",
  title,
  description,
  actionLabel,
  onAction,
  icon: CustomIcon,
  className = "",
  size = "md"
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case "search":
        return {
          icon: Search,
          title: title || "No Results Found",
          description: description || "Try adjusting your search terms or filters to find what you're looking for.",
          actionLabel: actionLabel || "Clear Filters"
        };
      
      case "messages":
        return {
          icon: MessageSquare,
          title: title || "No Messages Yet",
          description: description || "Start a conversation by sending your first message.",
          actionLabel: actionLabel || "Send Message"
        };
      
      case "documents":
        return {
          icon: FileText,
          title: title || "No Documents Found",
          description: description || "Upload or create your first document to get started.",
          actionLabel: actionLabel || "Upload Document"
        };
      
      case "users":
        return {
          icon: Users,
          title: title || "No Users Found",
          description: description || "No users match your current criteria.",
          actionLabel: actionLabel || "Add User"
        };
      
      case "data":
        return {
          icon: Database,
          title: title || "No Data Available",
          description: description || "There's no data to display at the moment.",
          actionLabel: actionLabel || "Refresh"
        };
      
      case "error":
        return {
          icon: AlertCircle,
          title: title || "Something Went Wrong",
          description: description || "We encountered an error while loading your data.",
          actionLabel: actionLabel || "Try Again"
        };
      
      case "inbox":
        return {
          icon: Inbox,
          title: title || "Your Inbox is Empty",
          description: description || "You're all caught up! No new items to review.",
          actionLabel: actionLabel || null
        };
      
      case "legal":
        return {
          icon: BookOpen,
          title: title || "No Legal Cases Found",
          description: description || "No cases match your search criteria. Try different keywords or filters.",
          actionLabel: actionLabel || "Browse All Cases"
        };
      
      default:
        return {
          icon: Inbox,
          title: title || "Nothing Here Yet",
          description: description || "This section is empty. Check back later or try a different action.",
          actionLabel: actionLabel || null
        };
    }
  };

  const content = getDefaultContent();
  const IconComponent = CustomIcon || content.icon;
  
  const sizeClasses = {
    sm: {
      container: "py-8",
      icon: "w-12 h-12",
      iconContainer: "w-16 h-16",
      title: "text-lg",
      description: "text-sm",
      spacing: "space-y-3"
    },
    md: {
      container: "py-12",
      icon: "w-16 h-16",
      iconContainer: "w-20 h-20",
      title: "text-xl",
      description: "text-base",
      spacing: "space-y-4"
    },
    lg: {
      container: "py-16",
      icon: "w-20 h-20",
      iconContainer: "w-24 h-24",
      title: "text-2xl",
      description: "text-lg",
      spacing: "space-y-6"
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${currentSize.container} ${className}`}>
      <div className={`${currentSize.spacing} max-w-md mx-auto`}>
        {/* Icon */}
        <div className={`${currentSize.iconContainer} bg-default-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
          <IconComponent className={`${currentSize.icon} text-default-400`} />
        </div>
        
        {/* Title */}
        <h3 className={`${currentSize.title} font-semibold text-foreground mb-2`}>
          {content.title}
        </h3>
        
        {/* Description */}
        <p className={`${currentSize.description} text-default-500 leading-relaxed mb-6`}>
          {content.description}
        </p>
        
        {/* Action Button */}
        {(content.actionLabel || onAction) && (
          <Button
            color="primary"
            variant="flat"
            onPress={onAction}
            className="font-medium"
          >
            {content.actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

EmptyState.propTypes = {
  type: PropTypes.oneOf([
    "default",
    "search", 
    "messages", 
    "documents", 
    "users", 
    "data", 
    "error", 
    "inbox",
    "legal"
  ]),
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  icon: PropTypes.elementType,
  className: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
};

export default EmptyState;