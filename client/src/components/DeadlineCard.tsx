import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DeadlineCardProps {
  id: string;
  title: string;
  dueDate: string;
  course?: string;
  urgency: "overdue" | "today" | "thisWeek" | "upcoming";
  description?: string;
}

const urgencyConfig = {
  overdue: {
    badge: "Overdue",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    borderColor: "border-l-destructive",
  },
  today: {
    badge: "Due Today",
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
    borderColor: "border-l-orange-500",
  },
  thisWeek: {
    badge: "This Week",
    color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20",
    borderColor: "border-l-yellow-500",
  },
  upcoming: {
    badge: "Upcoming",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    borderColor: "border-l-blue-500",
  },
};

export default function DeadlineCard({ title, dueDate, course, urgency, description }: DeadlineCardProps) {
  const config = urgencyConfig[urgency];

  return (
    <Card 
      data-testid={`card-deadline-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className={cn("p-4 border-l-4 hover-elevate cursor-pointer", config.borderColor)}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold leading-tight">{title}</h3>
            {course && (
              <p className="text-sm text-muted-foreground mt-1">{course}</p>
            )}
          </div>
        </div>
        <Badge variant="outline" className={config.color}>
          {config.badge}
        </Badge>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground mb-3 ml-7 line-clamp-2">{description}</p>
      )}
      <div className="flex items-center gap-2 text-sm ml-7">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono">{dueDate}</span>
      </div>
    </Card>
  );
}
