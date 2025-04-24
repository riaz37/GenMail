import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  Bot,
  Sparkles,
  Zap,
  Mail,
  Search,
  Command,
  Shield,
  Clock,
  Star,
  Heart,
  Users,
  Award,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  Settings2,
} from "lucide-react";
import { api } from "@/trpc/server";
import { StatsSection } from "@/components/StatsSection";

const LandingPage = async () => {
  const { userId } = auth();
  if (userId) {
    return redirect("/mail");
  }

  const features = [
    {
      title: "AI-Powered Assistant",
      description:
        "Smart email drafting and response suggestions powered by advanced AI.",
      icon: <Bot className="h-6 w-6 text-primary" />,
    },
    {
      title: "Command Palette",
      description:
        "Quick actions and navigation with powerful keyboard shortcuts.",
      icon: <Command className="h-6 w-6 text-primary" />,
    },
    {
      title: "Smart Categorization",
      description:
        "Automatic email organization and priority inbox management.",
      icon: <Sparkles className="h-6 w-6 text-primary" />,
    },
  ];

  const benefits = [
    {
      title: "Lightning Fast",
      description:
        "Experience email at the speed of thought with our optimized interface.",
      icon: <Zap className="h-6 w-6" />,
    },
    {
      title: "Privacy First",
      description:
        "Your data is encrypted and secure. We never read your emails.",
      icon: <Shield className="h-6 w-6" />,
    },
    {
      title: "Time Saving",
      description: "Save hours weekly with AI-powered email management.",
      icon: <Clock className="h-6 w-6" />,
    },
  ];

  const stats = await api.stats.getStats();

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      features: [
        "Basic email management",
        "Smart categorization",
        "Command palette",
        "3 AI-powered responses/day",
      ],
    },
    {
      name: "Pro",
      price: "$9.99",
      features: [
        "Everything in Free",
        "Unlimited AI responses",
        "Priority support",
        "Custom workflows",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Everything in Pro",
        "Custom integration",
        "Dedicated support",
        "SLA guarantees",
      ],
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#4f4f4f0a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f0a_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-24 md:py-32">
          <div className="space-y-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-900/10 bg-gray-900/5 px-4 py-2 dark:border-gray-100/10 dark:bg-gray-100/10">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">AI-Powered Email Client</span>
            </div>
            <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent dark:from-gray-100 dark:to-gray-400 md:text-6xl">
              Experience Email,
              <br />
              Reimagined with AI
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-400">
              GenMail combines the power of artificial intelligence with elegant
              design to transform your email experience.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="text-lg">
                <Link href="/mail">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg">
                <Link href="#features">See Features</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mx-auto mt-8 max-w-6xl px-4">
          <div className="relative overflow-hidden rounded-2xl border shadow-2xl">
            <Image
              src="/demo.png"
              alt="GenMail Interface"
              width={2000}
              height={1200}
              className="w-full"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white/50 py-24 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">Powerful Features</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Everything you need for a better email experience
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-transform duration-300 hover:scale-105 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-4 w-fit rounded-lg bg-primary/10 p-3">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white/50 py-20 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.stats.map(
              (stat: { number: string; label: string }, index: number) => (
                <div key={index} className="text-center">
                  <h3 className="mb-2 text-4xl font-bold text-primary">
                    {stat.number}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Simple steps to get started with GenMail
            </p>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                icon: <Settings2 className="h-8 w-8" />,
                title: "1. Connect Your Email",
                description: "Securely connect your existing email account",
              },
              {
                icon: <MessageSquare className="h-8 w-8" />,
                title: "2. Start Composing",
                description: "Experience AI-powered email writing",
              },
              {
                icon: <CheckCircle className="h-8 w-8" />,
                title: "3. Enjoy Automation",
                description: "Let smart features handle the rest",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 p-4">
                  {step.icon}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose the plan that works for you
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-xl border-2 bg-white p-8 shadow-lg dark:bg-gray-800 ${plan.popular ? "border-primary" : "border-transparent"} `}
              >
                {plan.popular && (
                  <span className="rounded-full bg-primary px-3 py-1 text-sm text-white">
                    Popular
                  </span>
                )}
                <h3 className="mt-4 text-2xl font-bold">{plan.name}</h3>
                <p className="my-4 text-4xl font-bold">{plan.price}</p>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-24 dark:bg-gray-800">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold text-white">
            Ready to transform your email experience?
          </h2>
          <p className="mb-8 text-gray-400">
            Join thousands of users who have already switched to GenMail
          </p>
          <Button
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            <Link href="/mail">Get Started Now</Link>
          </Button>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 text-center text-gray-600 dark:text-gray-400">
        <div className="flex items-center justify-center gap-2">
          Made with <Heart className="h-4 w-4 fill-red-500 text-red-500" /> by
          <a
            href="https://github.com/riaz37"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold transition-colors hover:text-gray-900 dark:hover:text-white"
          >
            Riaz
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
