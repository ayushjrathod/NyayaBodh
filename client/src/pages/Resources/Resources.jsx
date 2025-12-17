import { Card, CardBody, CardHeader, Chip, Link } from "@nextui-org/react";
import { BookOpen, Gavel, Globe, Newspaper, ShieldCheck } from "lucide-react";

const resources = [
  {
    title: "Supreme Court of India",
    description: "Official judgments, cause lists, and daily orders from the Supreme Court of India.",
    url: "https://www.sci.gov.in",
    icon: <Gavel className="w-5 h-5 text-primary" />,
    tags: ["Judgments", "Cause List"],
  },
  {
    title: "eCourts Services",
    description: "District and subordinate court case status, orders, and causelists.",
    url: "https://ecourts.gov.in",
    icon: <Globe className="w-5 h-5 text-primary" />,
    tags: ["Case Status", "District Courts"],
  },
  {
    title: "India Code",
    description: "Authoritative repository of Central Acts with full-text bare acts and amendments.",
    url: "https://www.indiacode.nic.in",
    icon: <BookOpen className="w-5 h-5 text-primary" />,
    tags: ["Statutes", "Bare Acts"],
  },
  {
    title: "PRS Legislative Research",
    description: "Bill summaries, standing committee reports, and session trackers for Parliament.",
    url: "https://prsindia.org",
    icon: <Newspaper className="w-5 h-5 text-primary" />,
    tags: ["Bills", "Policy Briefs"],
  },
  {
    title: "Ministry of Law & Justice",
    description: "Notifications, Gazette publications, and official legal policy updates.",
    url: "https://lawmin.gov.in",
    icon: <ShieldCheck className="w-5 h-5 text-primary" />,
    tags: ["Notifications", "Gazette"],
  },
  {
    title: "Legislative Department - Gazette",
    description: "Central Gazette archives for ordinances, rules, and delegated legislation.",
    url: "https://egazette.nic.in",
    icon: <BookOpen className="w-5 h-5 text-primary" />,
    tags: ["Gazette", "Rules"],
  },
];

const Resources = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 space-y-2">
          <p className="text-sm uppercase tracking-wide text-default-500">Resource Center</p>
          <h1 className="hierarchy-2">Trusted legal research links</h1>
          <p className="text-default-600">
            Curated official sources for judgments, statutes, gazettes, and parliamentary research. All links go to the
            original sites.
          </p>
        </div>

        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          {resources.map((item) => (
            <Card key={item.title} className="card-enhanced">
              <CardHeader className="flex gap-3 items-start">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">{item.icon}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">{item.title}</p>
                  </div>
                  <p className="text-sm text-default-600 leading-relaxed">{item.description}</p>
                </div>
              </CardHeader>
              <CardBody className="flex items-center justify-between gap-3 pt-0">
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Chip key={tag} size="sm" variant="flat">
                      {tag}
                    </Chip>
                  ))}
                </div>
                <Link
                  isExternal
                  href={item.url}
                  color="primary"
                  className="font-semibold hover:underline"
                  aria-label={`Open ${item.title}`}
                >
                  Visit
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resources;
