import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Shield,
  BrainCircuit,
  Radar,
  Siren,
  MapPin,
  Users,
  ArrowRight,
  FlaskConical,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GuardianAI — From Manual SOS to Proactive AI Safety" },
      {
        name: "description",
        content:
          "GuardianAI is an AI-powered women safety platform: a behavioural Digital Twin, anomaly detection, risk scoring, safety alerts and automatic emergency escalation.",
      },
      { property: "og:title", content: "GuardianAI — Proactive AI Women Safety" },
      {
        property: "og:description",
        content:
          "Behavioural Digital Twin, anomaly detection, risk scoring and automatic emergency escalation.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: BrainCircuit,
    title: "AI Digital Twin",
    text: "Learns your normal active hours, routes and movement patterns to form a personal baseline.",
  },
  {
    icon: Radar,
    title: "Anomaly detection",
    text: "Statistical deviation scoring — never random — with optional Gemini reasoning on the backend.",
  },
  {
    icon: Siren,
    title: "Automatic escalation",
    text: "If you don't answer a high-risk alert in time, the emergency workflow starts on its own.",
  },
  {
    icon: MapPin,
    title: "Live location",
    text: "Leaflet + OpenStreetMap map with location history captured through the browser.",
  },
  {
    icon: Users,
    title: "Trusted contacts",
    text: "Prioritised contacts receive the emergency event, risk level and last known position.",
  },
  {
    icon: FlaskConical,
    title: "Demo mode",
    text: "Run the full twelve-step detection-to-resolution story, clearly marked as simulated.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold">GuardianAI</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="hidden rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground sm:block"
          >
            Create account
          </Link>
        </div>
      </header>

      <section className="hero-gradient">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
            AI-powered proactive safety
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">
            From manual SOS to proactive AI safety
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            GuardianAI builds a behavioural Digital Twin of your everyday routine, watches for
            meaningful deviations, and escalates to your trusted contacts when you cannot respond.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-display font-bold text-primary-foreground"
            >
              Open the app <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="rounded-xl border border-border px-6 py-3 font-display font-bold"
            >
              Create an account
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Demo login: demo@guardianai.local · Demo@1234
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-2xl font-bold">What GuardianAI does</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className="surface-glow rounded-2xl border border-border bg-card p-6">
              <Icon className="h-6 w-6 text-accent" />
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-muted-foreground">
          <p>
            GuardianAI is an assistive safety tool and does not replace local emergency services.
            Emergency notifications in this build are simulated unless a verified external provider
            is configured.
          </p>
          <p className="mt-2">React + TypeScript frontend · Java 21 + Spring Boot + MongoDB backend</p>
        </div>
      </footer>
    </div>
  );
}
