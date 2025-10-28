import SuggestedQuery from '../SuggestedQuery';

export default function SuggestedQueryExample() {
  const queries = [
    "Today's events",
    "Tutoring hours",
    "Upcoming deadlines",
    "Career fair schedule"
  ];

  return (
    <div className="p-4 bg-background">
      <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
      <div className="flex flex-wrap gap-2">
        {queries.map((query) => (
          <SuggestedQuery 
            key={query}
            query={query}
            onClick={(q) => console.log('Clicked:', q)}
          />
        ))}
      </div>
    </div>
  );
}
