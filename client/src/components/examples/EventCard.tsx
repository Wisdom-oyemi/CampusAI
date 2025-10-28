import EventCard from '../EventCard';

export default function EventCardExample() {
  return (
    <div className="p-4 bg-background max-w-sm">
      <EventCard
        id="1"
        title="AI Workshop: Building Campus Apps"
        date="Oct 30, 2025"
        time="2:00 PM - 4:00 PM"
        location="Engineering Building, Room 205"
        category="Academic"
        description="Learn how to build AI-powered applications for campus use. Featuring NVIDIA Nemotron integration."
      />
    </div>
  );
}
