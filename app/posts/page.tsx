import { MoveRight, Sparkles, Clock, User, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SearchInput from "@/lib/components/SearchInput";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q || "";
  const page = parseInt(searchParams.page || "1");
  const limit = 6;
  const offset = (page - 1) * limit;

  // Build Supabase Query
  let dbQuery = supabase
    .from("posts")
    .select(`
      *,
      users (
        name
      )
    `, { count: "exact" });

  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,body.ilike.%${query}%`);
  }

  const { data: posts, error, count } = await dbQuery
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching posts:", error);
  }

  const totalPages = count ? Math.ceil(count / limit) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <section style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>All Stories</h1>
        <p className="text-muted">Explore the latest insights from our community of writers.</p>
      </section>

      {/* Search Bar */}
      <SearchInput initialQuery={query} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <article key={post.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden' }}>
                <img 
                  src={post.image_url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800"} 
                  alt={post.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <User size={14} /> {post.users?.name || "Anonymous"}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={14} /> {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 style={{ fontSize: '1.5rem' }}>{post.title}</h3>
              <p className="text-muted" style={{ fontSize: '0.95rem', flexGrow: 1 }}>
                {post.summary}
              </p>
              <Link href={`/posts/${post.id}`} style={{ fontWeight: '600', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Read Full Story <MoveRight size={16} />
              </Link>
            </article>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }} className="glass-card">
            <p className="text-muted">No stories found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          <Link 
            href={`/posts?page=${page - 1}${query ? `&q=${query}` : ""}`}
            className={`btn-secondary ${page <= 1 ? "disabled" : ""}`}
            style={{ pointerEvents: page <= 1 ? "none" : "auto", opacity: page <= 1 ? 0.5 : 1 }}
          >
            <ChevronLeft size={18} /> Previous
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link 
                key={p}
                href={`/posts?page=${p}${query ? `&q=${query}` : ""}`}
                className="badge"
                style={{ 
                  background: p === page ? 'var(--primary)' : 'var(--glass-bg)',
                  color: p === page ? 'white' : 'var(--foreground)',
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer'
                }}
              >
                {p}
              </Link>
            ))}
          </div>
          <Link 
            href={`/posts?page=${page + 1}${query ? `&q=${query}` : ""}`}
            className={`btn-secondary ${page >= totalPages ? "disabled" : ""}`}
            style={{ pointerEvents: page >= totalPages ? "none" : "auto", opacity: page >= totalPages ? 0.5 : 1 }}
          >
            Next <ChevronRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}
