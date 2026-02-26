import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { motion } from "framer-motion";
import { forwardRef } from "react";

/**
 * Enhanced Auth Form Container with animations and consistent styling
 */

const EnhancedAuthForm = forwardRef((props, ref) => {
  const { children, title, subtitle, className = "", headerContent, footerContent, ...restProps } = props;

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full p-4 bg-gradient-to-br from-background to-default-50">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-md">
        <Card
          ref={ref}
          className={`
              card-enhanced
              glass-morphism
              border border-default-200/50
              shadow-xl
              backdrop-blur-md
              ${className}
            `.trim()}
          {...restProps}
        >
          {(title || subtitle || headerContent) && (
            <CardHeader className="flex flex-col gap-2 px-6 py-6">
              {title && <h1 className="text-2xl font-bold text-center text-foreground hierarchy-2">{title}</h1>}
              {subtitle && <p className="text-default-500 text-center text-sm font-medium">{subtitle}</p>}
              {headerContent}
              <Divider className="mt-2" />
            </CardHeader>
          )}

          <CardBody className="px-6 py-6 gap-4">{children}</CardBody>

          {footerContent && (
            <>
              <Divider />
              <div className="px-6 py-4">{footerContent}</div>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
});

EnhancedAuthForm.displayName = "EnhancedAuthForm";

export default EnhancedAuthForm;
