import DeadlineCard from '../DeadlineCard';

export default function DeadlineCardExample() {
  return (
    <div className="p-4 bg-background space-y-4 max-w-md">
      <DeadlineCard
        id="1"
        title="Project Proposal Submission"
        dueDate="Oct 28, 2025 11:59 PM"
        course="CS 401: Senior Capstone"
        urgency="today"
        description="Submit your final project proposal including team members, project scope, and timeline."
      />
      <DeadlineCard
        id="2"
        title="Midterm Exam"
        dueDate="Nov 2, 2025 2:00 PM"
        course="MATH 301: Linear Algebra"
        urgency="thisWeek"
      />
    </div>
  );
}
