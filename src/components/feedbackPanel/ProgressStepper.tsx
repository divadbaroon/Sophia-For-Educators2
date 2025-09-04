"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  currentStep?: number;
  steps?: string[];
};

export const ProgressStepper = ({ currentStep = 0, steps }: Props) => {
  const progressSteps =
    steps || ["Decomposing Prompt", "Setting up test cases", "Running test cases", "Processing results"];

  return (
    <Card className="bg-card border border-border">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-card-foreground mb-2">Running Tests</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we analyze your prompt and run test cases
            </p>
          </div>

          <div className="overflow-x-auto">
            <div className="space-y-6 min-w-max pb-8">
              <div className="flex items-start justify-center gap-4 px-4">
                {progressSteps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                          currentStep > index && "bg-[var(--color-success)] text-white",
                          currentStep === index && "bg-blue-500 text-white",
                          currentStep < index && "bg-muted text-muted-foreground"
                        )}
                      >
                        {currentStep > index ? <Check className="w-4 h-4" /> : index + 1}
                      </div>
                      <div className="text-center w-24 h-8 flex items-start justify-center">
                        <p
                          className={cn(
                            "text-xs font-medium transition-all text-center leading-tight",
                            currentStep > index && "text-[var(--color-success)]",
                            currentStep === index && "text-blue-500",
                            currentStep < index && "text-muted-foreground"
                          )}
                        >
                          {step}
                        </p>
                      </div>
                    </div>
                    {index < progressSteps.length - 1 && (
                      <div className="mx-4 w-8 h-0.5 bg-muted">
                        <div
                          className={cn(
                            "h-full transition-all duration-500",
                            currentStep > index ? "bg-[var(--color-success)]" : "bg-muted"
                          )}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
