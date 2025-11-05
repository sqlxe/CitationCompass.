import { ExternalLink, BookOpen, Users, Calendar, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

interface CitationCardProps {
  citation: Citation;
  onSave?: () => void;
}

export function CitationCard({ citation, onSave }: CitationCardProps) {
  const copyAPA = () => {
    const apa = `${citation.authors} (${citation.year}). ${citation.title}. Retrieved from ${citation.url}`;
    navigator.clipboard.writeText(apa);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 gradient-card border-l-4 border-l-primary animate-fade-in-up">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 leading-tight">
              {citation.title}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-3 text-base">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {citation.authors}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {citation.year}
              </span>
              {citation.citationCount > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Star className="w-3 h-3" />
                  {citation.citationCount} citations
                </Badge>
              )}
            </CardDescription>
          </div>
          <Badge className="shrink-0">{citation.source}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2">
          <BookOpen className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
          <p className="text-sm text-foreground/80 line-clamp-3">
            {citation.abstract}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            asChild
            className="gap-2"
          >
            <a href={citation.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              View Paper
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyAPA}
          >
            Copy APA Citation
          </Button>
          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
            >
              Save
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
