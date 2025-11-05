import { CitationCard } from "./CitationCard";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Citation {
  title: string;
  authors: string;
  year: number;
  abstract: string;
  url: string;
  source: string;
  citationCount: number;
  relevanceScore?: number;
}

interface ResultsListProps {
  results: Citation[];
  expandedQuery?: string;
  totalFound: number;
}

export function ResultsList({ results, expandedQuery, totalFound }: ResultsListProps) {
  if (results.length === 0) {
    return (
      <Alert className="max-w-4xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No results found</AlertTitle>
        <AlertDescription>
          Try rephrasing your query or using different keywords
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {expandedQuery && (
        <div className="bg-accent/50 p-4 rounded-lg border border-border">
          <p className="text-sm font-medium text-accent-foreground">
            AI-Expanded Query: <span className="font-normal">{expandedQuery}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Found {totalFound} relevant citations
          </p>
        </div>
      )}

      <div className="space-y-4">
        {results.map((citation, index) => (
          <CitationCard key={index} citation={citation} />
        ))}
      </div>
    </div>
  );
}
