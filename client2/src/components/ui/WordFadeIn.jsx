"use client";

import { motion } from "framer-motion";
import { cn } from "../../utils/utils";

export const WordFadeIn = ({ words }) => {
  if (!words) return null;
  
  // Split into sections
  const sections = words.split(/(?=(?:Background|Legal Issues|Judgment|Tasks|Conclusion):)/i);
  
  return (
    <div className="space-y-4">
      {sections.map((section, sectionIndex) => {
        const [sectionTitle, ...sectionContent] = section.split(':');
        const content = sectionContent.join(':').trim(); // Rejoin in case there were other colons
        
        if (!content) return null;
        
        return (
          <div key={sectionIndex} className="space-y-2">
            {sectionTitle && (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: sectionIndex * 0.2 }}
                className="font-semibold text-lg"
              >
                {sectionTitle}:
              </motion.h3>
            )}
            <div className="space-x-1">
              {content.split(' ').map((word, index) => (
                <motion.span
                  key={`${sectionIndex}-${word}-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: (sectionIndex * 0.2) + (index * 0.05),
                    ease: "easeOut"
                  }}
                  className="inline-block"
                >
                  {word}{' '}
                </motion.span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
