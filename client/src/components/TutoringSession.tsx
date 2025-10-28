import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, Clock, MapPin } from "lucide-react";

export interface TutoringSessionProps {
  id: string;
  tutor: string;
  subject: string;
  time: string;
  location: string;
  availability: "Available" | "Limited" | "Full";
}

export default function TutoringSession({ tutor, subject, time, location, availability }: TutoringSessionProps) {
  const initials = tutor.split(' ').map(n => n[0]).join('');
  const isAvailable = availability === "Available";

  return (
    <Card data-testid={`card-tutoring-${subject.toLowerCase().replace(/\s+/g, '-')}`} className="p-4">
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="font-semibold leading-tight">{tutor}</h4>
              <div className="flex items-center gap-1.5 mt-1">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{subject}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono">{time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{location}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              data-testid="button-book-session"
              size="sm"
              disabled={!isAvailable}
              onClick={() => console.log('Booking session with', tutor)}
            >
              {isAvailable ? "Book Session" : availability}
            </Button>
            <span className={`text-xs ${isAvailable ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
              {availability}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
