import TutoringSession from '../TutoringSession';

export default function TutoringSessionExample() {
  return (
    <div className="p-4 bg-background space-y-4 max-w-md">
      <TutoringSession
        id="1"
        tutor="Dr. Sarah Johnson"
        subject="Calculus I & II"
        time="Today, 2:00 PM - 4:00 PM"
        location="Building A, Room 305"
        availability="Available"
      />
      <TutoringSession
        id="2"
        tutor="Prof. Michael Chen"
        subject="Computer Science"
        time="Tomorrow, 3:00 PM - 5:00 PM"
        location="CS Lab, Room 120"
        availability="Limited"
      />
    </div>
  );
}
