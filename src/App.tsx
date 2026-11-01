import { lazy, Suspense, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowDownUp,
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  ChevronRight,
  Code2,
  Command,
  GitBranch,
  Grid2X2,
  type LucideIcon,
  Layers,
  Menu,
  Network,
  Search,
  Settings2,
  Sparkles,
  TextCursorInput,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { modules, pageTitles, parsePage, type PageId } from "./data/catalog";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { PlaybackDemo } from "./components/PlaybackDemo";
import { ModuleArt } from "./components/ModuleArt";
import { SortingPage } from "./pages/SortingPage";
import { TreePage } from "./pages/TreePage";
import { GraphPage } from "./pages/GraphPage";
import { StringPage } from "./pages/StringPage";
import { GreedyPage } from "./pages/GreedyPage";
import { DPPage } from "./pages/DPPage";
const PerformancePage = lazy(() =>
  import("./pages/PerformancePage").then((module) => ({
    default: module.PerformancePage,
  })),
);
import { GuidePage } from "./pages/GuidePage";

const icons = {
  sorting: ArrowDownUp,
  trees: GitBranch,
  graphs: Network,
  strings: TextCursorInput,
  greedy: Zap,
  dp: Grid2X2,
};
const validSpeed = (value: unknown): value is number =>
  typeof value === "number" && [0.25, 0.5, 1, 1.5, 2, 3].includes(value);
const validPage = (value: unknown): value is PageId =>
  typeof value === "string" && Object.hasOwn(pageTitles, value);

export default function App() {
  const [page, setPage] = useState<PageId>(() => parsePage(location.hash));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [speed, setSpeed] = useLocalStorage("algoviz.speed", 1, validSpeed);
  const [recent, setRecent] = useLocalStorage<PageId>(
    "algoviz.recent",
    "dashboard",
    validPage,
  );
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const onHash = () => {
      setPage(parsePage(location.hash));
      setMobileOpen(false);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    document.title = `${pageTitles[page]} · AlgoViz Studio`;
  }, [page]);
  function navigate(next: PageId) {
    location.hash = next;
    setPage(next);
    setMobileOpen(false);
    if (modules.some((m) => m.id === next)) setRecent(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  const filtered = modules.filter((m) =>
    `${m.title} ${m.algorithms.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const navButton = (id: PageId, label: string, Icon: LucideIcon) => (
    <button
      key={id}
      className={`nav-item ${page === id ? "selected" : ""}`}
      aria-current={page === id ? "page" : undefined}
      onClick={() => navigate(id)}
    >
      <Icon size={18} />
      <span>{label}</span>
      {page === id && <span className="nav-dot" />}
    </button>
  );
  return (
    <div className="app-shell">
      {mobileOpen && (
        <button
          aria-label="Close navigation overlay"
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`sidebar ${mobileOpen ? "open" : ""}`}
        aria-label="Main navigation"
      >
        <a
          className="brand"
          href="#dashboard"
          onClick={() => navigate("dashboard")}
        >
          <span className="brand-mark">
            <Workflow size={23} />
          </span>
          <span>
            AlgoViz<span className="brand-studio">STUDIO</span>
          </span>
        </a>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>
        <div className="workspace-label">
          <span className="tiny-dot" /> PERSONAL LEARNING SPACE
        </div>
        <nav>
          {navButton("dashboard", "Dashboard", Layers)}
          <p className="nav-label">EXPLORE ALGORITHMS</p>
          {modules.map((m) => navButton(m.id, m.title, icons[m.id]))}
          <p className="nav-label">GO DEEPER</p>
          {navButton("performance", "Performance Lab", ChartNoAxesCombined)}
          {navButton("guide", "Learning Guide", BookOpen)}
        </nav>
        <div className="sidebar-footer">
          <span className="tiny-dot" /> Local workspace <Code2 size={15} />
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{pageTitles[page]}</strong>
          </div>
          <div className="header-right">
            <span className="local-badge">
              <span className="tiny-dot" /> Runs locally
            </span>
            <span className="header-divider" />
            <span className="avatar" title="Personal workspace">
              AV
            </span>
          </div>
        </header>
        <main id="main-content" key={page}>
          {page === "dashboard" ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    LEARN BY SEEING. UNDERSTAND BY DOING.
                  </div>
                  <h1>
                    A little curiosity.
                    <br className="small-break" /> A lot of discovery
                    <span className="accent">.</span>
                  </h1>
                  <p>
                    Your workspace for exploring algorithms, one meaningful step
                    at a time.
                  </p>
                </div>
                <span className="phase-pill">
                  <span className="tiny-dot" /> All learning paths available
                </span>
              </div>
              <section className="hero panel">
                <div className="hero-copy">
                  <span className="hero-kicker">
                    <Sparkles size={14} /> THE INTERACTIVE ALGORITHM EXPLORER
                  </span>
                  <h2>
                    Make the invisible
                    <br />
                    <span>make sense.</span>
                  </h2>
                  <p>
                    See the logic. Follow the decisions. Build an intuition for
                    the algorithms behind the code.
                  </p>
                  <button
                    className="primary-button"
                    onClick={() => navigate("sorting")}
                  >
                    Start exploring <ArrowRight size={17} />
                  </button>
                  <span className="hero-footnote">
                    An open learning lab. No account needed.
                  </span>
                </div>
                <div className="hero-visual" aria-hidden="true">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="visual-label">
                    <span className="tiny-dot" /> IDEAS → UNDERSTANDING
                  </div>
                  <div className="hero-bars">
                    {[32, 58, 42, 82, 64, 95, 74, 112, 92, 135].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={reducedMotion ? false : { scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        style={{
                          height: h,
                          background:
                            i > 6
                              ? "linear-gradient(0deg,#8b5cf633,#ac83ff)"
                              : "linear-gradient(0deg,#29d3c422,#49e5cc)",
                        }}
                      >
                        <span>
                          {[12, 24, 18, 35, 28, 42, 32, 49, 40, 58][i]}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="visual-caption">
                    <Code2 size={14} /> A new perspective on problem solving
                  </div>
                </div>
              </section>
              <div className="stats-grid">
                {[
                  {
                    number: "20",
                    label: "Algorithms implemented",
                    detail: "Across 6 core DAA topics",
                    icon: Code2,
                  },
                  {
                    number: "6",
                    label: "Learning paths",
                    detail: "From sorting to dynamic programming",
                    icon: GitBranch,
                  },
                  {
                    number: "1",
                    label: "Shared playback engine",
                    detail: "Pause, rewind, and take your time",
                    icon: Settings2,
                  },
                  {
                    number: "100%",
                    label: "Local-first workspace",
                    detail: "No login. No server. Just learning.",
                    icon: Command,
                  },
                ].map((s) => (
                  <div className="stat" key={s.label}>
                    <s.icon size={19} />
                    <div>
                      <strong>{s.number}</strong>
                      <h3>{s.label}</h3>
                      <p>{s.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <section>
                <div className="section-heading explore-heading">
                  <div>
                    <span className="eyebrow">CHOOSE YOUR NEXT CHALLENGE</span>
                    <h2>Explore the algorithm universe</h2>
                  </div>
                  <label className="search">
                    <Search size={16} />
                    <input
                      aria-label="Search algorithm categories"
                      placeholder="Find an algorithm…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                      <button
                        aria-label="Clear search"
                        onClick={() => setQuery("")}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </label>
                </div>
                <div className="module-grid">
                  {filtered.map((m, i) => (
                    <motion.button
                      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`module-card ${m.color}`}
                      key={m.id}
                      onClick={() => navigate(m.id)}
                    >
                      <div className="card-top">
                        <span className="module-icon">
                          {(() => {
                            const Icon = icons[m.id];
                            return <Icon size={20} />;
                          })()}
                        </span>
                        <span className="module-count">
                          {m.algorithms.length} algorithms
                        </span>
                      </div>
                      <ModuleArt kind={m.symbol} />
                      <div className="card-bottom">
                        <h3>
                          {m.title}
                          <ArrowRight size={17} />
                        </h3>
                        <p>{m.subtitle}</p>
                        <div className="algorithm-tags">
                          {m.algorithms.slice(0, 2).map((a) => (
                            <span key={a}>{a}</span>
                          ))}
                          {m.algorithms.length > 2 && (
                            <span>+{m.algorithms.length - 2}</span>
                          )}
                        </div>
                        <span className="planned-label">
                          Available · Explore execution
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
                {!filtered.length && (
                  <div className="empty-state">
                    <Search size={25} />
                    <h3>No algorithms found</h3>
                    <p>Try “sort”, “KMP”, or “tree”.</p>
                    <button
                      className="secondary-button"
                      onClick={() => setQuery("")}
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </section>
              <PlaybackDemo speed={speed} onSpeed={setSpeed} />
              <section className="bottom-grid">
                <div className="panel learning-callout">
                  <BookOpen size={26} />
                  <div>
                    <h3>Don’t just watch. Understand why.</h3>
                    <p>
                      Explore the project roadmap and the ideas behind the lab.
                    </p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => navigate("guide")}
                  >
                    Open learning guide <ArrowRight size={16} />
                  </button>
                </div>
                {recent !== "dashboard" && (
                  <button
                    className="panel recent-card"
                    onClick={() => navigate(recent)}
                  >
                    <span className="eyebrow">RECENTLY VISITED</span>
                    <strong>
                      {pageTitles[recent]} <ArrowRight size={16} />
                    </strong>
                    <span>Open interactive execution</span>
                  </button>
                )}
              </section>
            </>
          ) : page === "sorting" ? (
            <SortingPage speed={speed} onSpeed={setSpeed} />
          ) : page === "trees" ? (
            <TreePage speed={speed} onSpeed={setSpeed} />
          ) : page === "graphs" ? (
            <GraphPage speed={speed} onSpeed={setSpeed} />
          ) : page === "strings" ? (
            <StringPage speed={speed} onSpeed={setSpeed} />
          ) : page === "greedy" ? (
            <GreedyPage speed={speed} onSpeed={setSpeed} />
          ) : page === "dp" ? (
            <DPPage speed={speed} onSpeed={setSpeed} />
          ) : page === "performance" ? (
            <Suspense
              fallback={
                <section className="panel empty-state" role="status">
                  Loading performance lab…
                </section>
              }
            >
              <PerformancePage />
            </Suspense>
          ) : (
            <GuidePage />
          )}
          <footer className="page-footer">
            <span>
              AlgoViz Studio <span className="footer-dot">·</span> See the
              logic. Build the intuition.
            </span>
            <span>
              Designed for discovery <Sparkles size={12} />
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}

