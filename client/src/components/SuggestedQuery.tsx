import { Button } from "@/components/ui/button";

interface SuggestedQueryProps {
  query: string;
  onClick: (query: string) => void;
}

export default function SuggestedQuery({ query, onClick }: SuggestedQueryProps) {
  return (
    <Button
      data-testid={`button-suggested-query-${query.toLowerCase().replace(/\s+/g, '-')}`}
      variant="outline"
      size="sm"
      onClick={() => onClick(query)}
      className="text-sm whitespace-nowrap"
    >
      {query}
    </Button>
  );
}
