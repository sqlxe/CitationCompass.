import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ResultsList } from "@/components/ResultsList";
import { BookOpen, Sparkles, Database, Zap } from "lucide-react";
import { toast } from "sonner";

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

interface SearchResults {
  query: string;
  expandedQuery: string;
  results: Citation[];
  totalFound: number;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-citations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        }
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data);
      
      toast.success(`Found ${data.totalFound} citations`, {
        description: "Results ranked by relevance and citation count",
      });
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search", {
        description: "Please try again or rephrase your query",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI-Powered Academic Search
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Citation Finder
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
            Find credible academic citations for any statement instantly. 
            Powered by AI and trusted academic databases.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 px-4">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </section>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/30 rounded-full animate-spin border-t-primary" />
            <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            Searching academic databases...
          </p>
        </div>
      )}

      {/* Results Section */}
      {results && !isLoading && (
        <section className="py-8 px-4">
          <ResultsList
            results={results.results}
            expandedQuery={results.expandedQuery}
            totalFound={results.totalFound}
          />
        </section>
      )}

      {/* Features Section - Show when no results */}
      {!results && !isLoading && (
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              How It Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">AI Query Expansion</h3>
                <p className="text-muted-foreground">
                  Our AI expands your statement into precise academic search terms
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                  <Database className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold">Multi-Source Search</h3>
                <p className="text-muted-foreground">
                  Search across Semantic Scholar, CrossRef, and arXiv simultaneously
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold">Smart Ranking</h3>
                <p className="text-muted-foreground">
                  Results ranked by relevance, citation count, and recency
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t mt-20 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" />
            Citation Finder - Find credible sources for your research
          </p>
          <p className="mt-2">
            Powered by Semantic Scholar, CrossRef, and arXiv APIs
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
