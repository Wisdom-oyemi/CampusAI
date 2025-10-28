import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock } from "lucide-react";

export interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: "Academic" | "Social" | "Career" | "Sports" | "Arts";
  description?: string;
}

const categoryColors = {
  Academic: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  Social: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  Career: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
  Sports: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
  Arts: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20",
};

export default function EventCard({ title, date, time, location, category, description }: EventCardProps) {
  return (
    <Card 
      data-testid={`card-event-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className="p-4 hover-elevate cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-lg leading-tight">{title}</h3>
        <Badge variant="outline" className={categoryColors[category]}>
          {category}
        </Badge>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
      )}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono">{date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono">{time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>{location}</span>
        </div>
      </div>
    </Card>
  );
}
