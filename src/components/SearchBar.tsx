import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="relative">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Paste a statement or claim to find academic citations..."
          className="min-h-[120px] pr-16 text-lg resize-none shadow-lg border-2 focus-visible:ring-primary"
          disabled={isLoading}
        />
        <div className="absolute bottom-4 right-4">
          <Button
            type="submit"
            size="lg"
            disabled={!query.trim() || isLoading}
            className="shadow-glow hover:shadow-xl transition-all duration-300"
          >
            {isLoading ? (
              <Sparkles className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span className="ml-2">Find Citations</span>
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-3 text-center">
        AI-powered search across Semantic Scholar, CrossRef, and arXiv
      </p>
    </form>
  );
}
