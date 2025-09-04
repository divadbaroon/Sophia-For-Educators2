"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FeedbackItem } from "@/types";
import { CheckCircle, XCircle } from "lucide-react";

type Props = {
  item: FeedbackItem;
  onOpen: (item: FeedbackItem) => void;
};

export const ResultItemCard = ({ item, onOpen }: Props) => {
  const isPassed = item.severity === "success";

  const bgColor = isPassed ? "bg-[var(--color-success)]/10" : "bg-destructive/10";
  const borderColor = isPassed ? "border-[var(--color-success)]/20" : "border-destructive/20";
  const iconColor = isPassed ? "text-[var(--color-success)]" : "text-destructive";
  const Icon = isPassed ? CheckCircle : XCircle;

  return (
    <Card className={cn("transition-all", bgColor, borderColor)}>
      <CardHeader className="transition-colors">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-card-foreground text-balance">{item.title}</h3>
              <Icon className={cn("w-5 h-5 shrink-0", iconColor)} />
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1 text-pretty">{item.description}</p>
            )}
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-transparent cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen(item);
                }}
              >
                View Results
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
