import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const { query, userId } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Searching for:", query);

    // Step 1: Use AI to expand the query for better academic search
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let expandedQuery = query;
    
    // Only try to expand if API key exists
    if (LOVABLE_API_KEY) {
      try {
        expandedQuery = await expandQuery(query, LOVABLE_API_KEY);
        console.log("Expanded query:", expandedQuery);
      } catch (err) {
        console.error("Query expansion failed, using original query:", err);
      }
    } else {
      console.log("LOVABLE_API_KEY not found, using original query");
    }

    // Step 2: Search multiple academic databases in parallel
    const [semanticResults, crossrefResults] = await Promise.allSettled([
      searchSemanticScholar(expandedQuery),
      searchCrossRef(expandedQuery),
    ]);

    // Combine and deduplicate results
    const allResults: any[] = [];
    
    if (semanticResults.status === "fulfilled" && semanticResults.value) {
      allResults.push(...semanticResults.value);
    } else {
      console.error("Semantic Scholar failed:", semanticResults.status === "rejected" ? semanticResults.reason : "No results");
    }
    
    if (crossrefResults.status === "fulfilled" && crossrefResults.value) {
      allResults.push(...crossrefResults.value);
    } else {
      console.error("CrossRef failed:", crossrefResults.status === "rejected" ? crossrefResults.reason : "No results");
    }

    // Check if we got any results
    if (allResults.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No results found. Please try a different search term.",
          query,
          expandedQuery 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Step 3: Deduplicate by DOI or title similarity
    const uniqueResults = deduplicateResults(allResults);
    
    // Step 4: Rank results (basic scoring)
    const rankedResults = rankResults(uniqueResults, query);

    // Step 5: Store search history (optional, only if userId provided)
    if (userId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from("search_history").insert({
            user_id: userId,
            query,
            expanded_query: expandedQuery,
            results: rankedResults.slice(0, 10),
          });
        }
      } catch (err) {
        console.error("Failed to store search history:", err);
        // Don't fail the request if history storage fails
      }
    }

    return new Response(
      JSON.stringify({
        query,
        expandedQuery,
        results: rankedResults.slice(0, 10),
        totalFound: rankedResults.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in search-citations:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: "Please check the server logs for more information"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function expandQuery(query: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an academic research assistant. Expand the user's statement into a precise academic search query. Extract key concepts, add relevant synonyms, and identify the main research topic. Return ONLY the expanded search query, no explanation.",
          },
          {
            role: "user",
            content: `Expand this statement into an academic search query: "${query}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI query expansion failed:", response.status, errorText);
      return query;
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || query;
  } catch (error) {
    console.error("Error expanding query:", error);
    return query;
  }
}

async function searchSemanticScholar(query: string): Promise<any[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodedQuery}&limit=10&fields=title,authors,year,abstract,url,citationCount,publicationDate,externalIds`,
      {
        headers: {
          'User-Agent': 'Supabase-Edge-Function'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Semantic Scholar API error:", response.status, errorText);
      return [];
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      console.log("No results from Semantic Scholar");
      return [];
    }

    return data.data.map((paper: any) => ({
      title: paper.title || "Untitled",
      authors: paper.authors?.map((a: any) => a.name).join(", ") || "Unknown",
      year: paper.year || (paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : null),
      abstract: paper.abstract || "No abstract available",
      url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
      source: "Semantic Scholar",
      citationCount: paper.citationCount || 0,
      doi: paper.externalIds?.DOI,
    }));
  } catch (error) {
    console.error("Semantic Scholar search error:", error);
    return [];
  }
}

async function searchCrossRef(query: string): Promise<any[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.crossref.org/works?query=${encodedQuery}&rows=10`,
      {
        headers: {
          'User-Agent': 'Supabase-Edge-Function (mailto:your-email@example.com)'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("CrossRef API error:", response.status, errorText);
      return [];
    }

    const data = await response.json();
    
    if (!data.message?.items || data.message.items.length === 0) {
      console.log("No results from CrossRef");
      return [];
    }

    return data.message.items.map((item: any) => ({
      title: item.title?.[0] || "Untitled",
      authors: item.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()).join(", ") || "Unknown",
      year: item.published?.["date-parts"]?.[0]?.[0] || null,
      abstract: item.abstract || "No abstract available",
      url: item.URL || (item.DOI ? `https://doi.org/${item.DOI}` : null),
      source: "CrossRef",
      citationCount: item["is-referenced-by-count"] || 0,
      doi: item.DOI,
    }));
  } catch (error) {
    console.error("CrossRef search error:", error);
    return [];
  }
}

function deduplicateResults(results: any[]): any[] {
  const seen = new Set<string>();
  const unique: any[] = [];

  for (const result of results) {
    const key = result.doi || result.title.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(result);
    }
  }

  return unique;
}

function rankResults(results: any[], originalQuery: string): any[] {
  const queryLower = originalQuery.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 2);
  
  return results
    .map((result) => {
      let score = 0;
      const titleLower = result.title.toLowerCase();
      const abstractLower = result.abstract.toLowerCase();
      
      // Exact query match in title
      if (titleLower.includes(queryLower)) {
        score += 10;
      }
      
      // Individual term matches in title
      queryTerms.forEach(term => {
        if (titleLower.includes(term)) {
          score += 3;
        }
      });
      
      // Abstract relevance
      if (abstractLower.includes(queryLower)) {
        score += 5;
      }
      
      // Individual term matches in abstract
      queryTerms.forEach(term => {
        if (abstractLower.includes(term)) {
          score += 1;
        }
      });
      
      // Citation count (logarithmic scale to prevent dominance)
      score += Math.log(result.citationCount + 1) * 0.5;
      
      // Recency bonus (papers from last 5 years)
      const currentYear = new Date().getFullYear();
      if (result.year && currentYear - result.year <= 5) {
        score += 3;
      }
      
      // Source preference (slight boost for Semantic Scholar)
      if (result.source === "Semantic Scholar") {
        score += 0.5;
      }
      
      return { ...result, relevanceScore: score };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
