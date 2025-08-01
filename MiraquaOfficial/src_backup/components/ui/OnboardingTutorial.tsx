
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, Lightbulb, Target } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: string;
  highlight?: boolean;
}

interface OnboardingTutorialProps {
  steps: TutorialStep[];
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ 
  steps, 
  isVisible, 
  onComplete, 
  onSkip 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isVisible && steps[currentStep]?.target) {
      const element = document.querySelector(steps[currentStep].target) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight effect
        if (steps[currentStep].highlight) {
          element.style.boxShadow = '0 0 0 4px rgba(34, 197, 94, 0.3)';
          element.style.borderRadius = '8px';
          element.style.transition = 'all 0.3s ease';
        }
      }
    }

    return () => {
      // Cleanup highlight
      if (targetElement && steps[currentStep]?.highlight) {
        targetElement.style.boxShadow = '';
        targetElement.style.borderRadius = '';
      }
    };
  }, [currentStep, isVisible, steps, targetElement]);

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getTooltipPosition = () => {
    if (!targetElement || currentStepData.position === 'center') {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const tooltipOffset = 16;

    switch (currentStepData.position) {
      case 'top':
        return {
          position: 'fixed' as const,
          bottom: `${window.innerHeight - rect.top + tooltipOffset}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
          zIndex: 1000
        };
      case 'bottom':
        return {
          position: 'fixed' as const,
          top: `${rect.bottom + tooltipOffset}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
          zIndex: 1000
        };
      case 'left':
        return {
          position: 'fixed' as const,
          top: `${rect.top + rect.height / 2}px`,
          right: `${window.innerWidth - rect.left + tooltipOffset}px`,
          transform: 'translateY(-50%)',
          zIndex: 1000
        };
      case 'right':
        return {
          position: 'fixed' as const,
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + tooltipOffset}px`,
          transform: 'translateY(-50%)',
          zIndex: 1000
        };
      default:
        return {
          position: 'fixed' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000
        };
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/60 z-[999]" onClick={onSkip} />
      
      {/* Tutorial tooltip */}
      <Card 
        className="border-0 shadow-2xl bg-white max-w-sm w-full"
        style={getTooltipPosition()}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-green-600" />
              </div>
              <Badge variant="outline" className="text-xs">
                {currentStep + 1} of {steps.length}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSkip}
              className="p-1 h-auto text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {currentStepData.description}
            </p>
            
            {currentStepData.action && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-blue-800">{currentStepData.action}</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep 
                      ? 'bg-green-600' 
                      : index < currentStep 
                        ? 'bg-green-300' 
                        : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            <Button 
              size="sm"
              onClick={handleNext}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-1"
            >
              <span>{isLastStep ? 'Finish' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default OnboardingTutorial;
