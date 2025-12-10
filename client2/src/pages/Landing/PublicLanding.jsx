import { Button, Card, CardBody, Chip } from "@nextui-org/react";
import { Layers, Mic, ShieldCheck, Sparkles, Timer } from "lucide-react";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import docFeatures from "../../assets/features.json";
import logoNB from "../../assets/logoNB.png";

const PublicLanding = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const marqueeDocs = docFeatures.slice(0, 6);

  return (
    <div className="min-h-screen bg-white text-foreground font-Inter">
      <style>{`
        @keyframes logoMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .logo-marquee {
          animation: logoMarquee 28s linear infinite;
        }
        .logo-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:20px_20px] opacity-60 pointer-events-none" />
        <div
          className={`absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full ${
            isDarkMode
              ? "bg-[radial-gradient(circle_600px_at_50%_200px,#fbfbfb15,transparent_70%)]"
              : "bg-[radial-gradient(circle_600px_at_50%_200px,#d5c5ff25,transparent_70%)]"
          } blur-3xl pointer-events-none`}
        />

        <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <img src={logoNB} alt="NyayBodh" className="h-10 w-10" loading="lazy" />
            <div>
              <p className="font-bold text-lg text-neutral-900">NyayBodh</p>
              <p className="text-xs text-neutral-700">AI Legal Copilot</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              as={RouterLink}
              to="/login"
              variant="light"
              color="primary"
              className="btn-hover-lift text-neutral-700"
            >
              Log in
            </Button>
            <Button as={RouterLink} to="/login" color="primary" className="btn-hover-lift shadow-lg" variant="solid">
              Get started
            </Button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 pb-16 relative z-10">
          <section className="flex flex-col items-center text-center gap-6 pt-28">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-black/60 border border-primary/20 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">NyayBodh · AI legal copilot</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-tight text-neutral-900">
              Brief your matter,{" "}
              <span className="italic bg-gradient-to-r from-primary via-primary/80 to-neutral-800 bg-clip-text text-transparent">
                we surface judgments with citations.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-700 max-w-3xl">
              Dictate facts, issues, and reliefs. NyayBodh blends semantic + entity search, chats with judgments, and
              assembles citations so you move from query to draft fast.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                as={RouterLink}
                to="/login"
                color="primary"
                size="lg"
                className="btn-hover-lift shadow-lg bg-primary text-primary-foreground"
              >
                Start a search
              </Button>
              <Button
                as={RouterLink}
                to="/semantic"
                variant="bordered"
                size="lg"
                className="btn-hover-lift text-primary-foreground"
              >
                Explain a scenario
              </Button>
            </div>
            <p className="text-sm text-neutral-700">Available on web. Built for Indian legal research.</p>
            <div className="w-full max-w-4xl pt-4">
              <div className="flex items-center justify-center gap-3 bg-default-100/80 backdrop-blur border border-default-200 rounded-full px-6 py-3 shadow-lg shadow-primary/5">
                <Sparkles className="w-4 h-4 text-primary" />
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                    <span
                      key={bar}
                      className="w-1 rounded-full bg-primary"
                      style={{ height: `${8 + (bar % 4) * 4}px` }}
                    />
                  ))}
                </div>
                <p className="text-base text-white whitespace-nowrap">
                  AI research engine + document automation in one workspace
                </p>
              </div>
            </div>
          </section>

          <section className="mt-14 rounded-2xl bg-foreground text-background px-4 py-8 md:px-6 md:py-10 card-enhanced">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div className="space-y-4">
                <h2 className="hierarchy-2 text-background">NyayBodh is made for you.</h2>
                <p className="text-background/80">
                  Voice-first research and drafting that fits advocates, in-house teams, paralegals, students, and
                  researchers. Keep parties, provisions, judges, and citations together—without juggling tabs.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Advocates",
                    "In-house",
                    "Paralegals",
                    "Law students",
                    "Researchers",
                    "Compliance",
                    "Founders",
                    "Policy teams",
                    "Multilingual",
                  ].map((role) => (
                    <Chip key={role} variant="flat" size="sm" className="text-black">
                      {role}
                    </Chip>
                  ))}
                </div>
              </div>
              <Card className="bg-white text-black border border-black">
                <CardBody className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">Voice-first, legally aware</p>
                      <p className="text-sm text-black/80">
                        Dictate facts, issues, and reliefs—NyayBodh keeps the context and returns grounded results.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">Structured outputs</p>
                      <p className="text-sm text-black/80">
                        Parties, provisions, judges, statutes, and summaries organized for quick review or drafting.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">Accessibility built-in</p>
                      <p className="text-sm text-black/80">
                        Screen reader controls, skip links, contrast-aware styles, and Hindi/English toggles.
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </section>

          <section className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-700">Templates ready to generate</h2>
              </div>
            </div>
            <div
              className="relative overflow-hidden bg-white border border-black text-black"
              style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)" }}
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-white via-white/90 to-transparent backdrop-blur-sm" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-white via-white/90 to-transparent backdrop-blur-sm" />
              <div className="logo-marquee flex gap-3 min-w-[200%] py-2">
                {[...Array(2)].map((_, loopIndex) => (
                  <div key={loopIndex} className="flex gap-3">
                    {marqueeDocs.map((doc) => (
                      <Card
                        key={`${doc.id}-${loopIndex}`}
                        className="card-enhanced w-[260px] flex-shrink-0 bg-white border border-black/50 text-black"
                      >
                        <CardBody className="h-full flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold leading-tight">{doc.name}</p>
                            <Chip variant="flat" size="sm" className="text-black border border-black/30">
                              {doc.shortName}
                            </Chip>
                          </div>
                          <p className="text-sm text-black/80 leading-relaxed line-clamp-3">{doc.description}</p>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-700">Security, accessibility, and performance</h2>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="card-enhanced bg-white border border-black text-black">
                <CardBody className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <p className="font-semibold leading-tight">Role-aware access</p>
                  </div>
                  <p className="text-sm text-black/80">
                    Admin-only DocGen routes, protected search results, and token-based auth across flows.
                  </p>
                </CardBody>
              </Card>
              <Card className="card-enhanced bg-white border border-black text-black">
                <CardBody className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-primary" />
                    <p className="font-semibold leading-tight">Inclusive experience</p>
                  </div>
                  <p className="text-sm text-black/80">
                    Voice input, screen reader controls, skip links, and WCAG-friendly focus outlines.
                  </p>
                </CardBody>
              </Card>
              <Card className="card-enhanced bg-white border border-black text-black">
                <CardBody className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-primary" />
                    <p className="font-semibold leading-tight">Responsive & cached</p>
                  </div>
                  <p className="text-sm text-black/80">
                    Cached search results, lazy-loaded heavy routes, and mobile-ready layouts for faster previews.
                  </p>
                </CardBody>
              </Card>
            </div>
          </section>

          <footer
            className="mt-16 border-t border-black bg-transparent text-black"
            style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)" }}
          >
            <div className="max-w-6xl mx-auto px-6 md:px-8 py-10 flex flex-col gap-10">
              <div className="grid gap-8 md:grid-cols-4 items-start">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <img src={logoNB} alt="NyayBodh" className="h-10 w-10" loading="lazy" />
                    <div>
                      <p className="font-semibold text-lg">NyayBodh</p>
                      <p className="text-xs text-black/70">AI legal copilot</p>
                    </div>
                  </div>
                  <p className="text-sm text-black/70 max-w-xs">
                    Voice-first legal research and drafting with automation built in.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="font-semibold">Company</p>
                  <div className="flex flex-col gap-2 text-sm text-black/80">
                    <RouterLink to="/contact" className="hover:text-primary transition-colors">
                      About
                    </RouterLink>
                    <RouterLink to="/resources" className="hover:text-primary transition-colors">
                      Resources
                    </RouterLink>
                    <RouterLink to="/contact" className="hover:text-primary transition-colors">
                      Contact
                    </RouterLink>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="font-semibold">Product</p>
                  <div className="flex flex-col gap-2 text-sm text-black/80">
                    <RouterLink to="/login" className="hover:text-primary transition-colors">
                      Start a search
                    </RouterLink>
                    <RouterLink to="/semantic" className="hover:text-primary transition-colors">
                      Explain a scenario
                    </RouterLink>
                    <RouterLink to="/resources" className="hover:text-primary transition-colors">
                      Guides & updates
                    </RouterLink>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="font-semibold">Support</p>
                  <div className="flex flex-col gap-2 text-sm text-black/80">
                    <RouterLink to="/contact" className="hover:text-primary transition-colors">
                      Talk to us
                    </RouterLink>
                    <RouterLink to="/login" className="hover:text-primary transition-colors">
                      Sign in
                    </RouterLink>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-black/30 flex flex-col gap-6 items-center text-center">
                <div className="flex flex-wrap gap-4 text-xs text-black/70 justify-center">
                  <span>© {new Date().getFullYear()} NyayBodh</span>
                </div>
                <div className="flex items-center gap-4 justify-center">
                  <img src={logoNB} alt="NyayBodh" className="h-18 w-18 md:h-20 md:w-20" loading="lazy" />
                  <p className="text-7xl md:text-9xl font-black tracking-tight leading-none">NyayBodh</p>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default PublicLanding;
