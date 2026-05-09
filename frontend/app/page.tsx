'use client';

import { motion } from 'framer-motion';
import { Zap, FileCode, Sparkles, ArrowRight, Check, Code2, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const features = [
    "AI-optimized project structure",
    "Specialized AI skills for your stack",
    "Complete documentation",
    "Firebase & Supabase support",
    "TypeScript & JavaScript",
    "Production-ready code"
  ];

  const stats = [
    { value: "6", label: "Framework options" },
    { value: "2", label: "Languages supported" },
    { value: "20+", label: "Files generated" }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-zinc-950 to-purple-950/20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div id="main-content" className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 md:mb-32 relative"
        >
          {/* Animated background glow */}
          <motion.div
            className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-2xl"
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              {/* Animated dots */}
              <div className="flex gap-1.5">
                <motion.div 
                  className="w-2 h-2 bg-indigo-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div 
                  className="w-2 h-2 bg-purple-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2
                  }}
                />
                <motion.div 
                  className="w-2 h-2 bg-pink-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4
                  }}
                />
              </div>
              
              <motion.h1 
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              >
                VibeArchitect
              </motion.h1>
            </div>
            
            <p className="text-zinc-400 text-base md:text-lg font-light tracking-wider">
              <span className="text-indigo-400 font-medium">AI-First</span> Boilerplate Generator
            </p>
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-20 md:mb-32 text-center"
        >
          {/* Alpha Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-6"
          >
            <span className="text-lg">🚧</span>
            <span className="text-sm font-semibold text-indigo-300">Alpha Demo</span>
            <span className="px-2 py-0.5 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-full">
              v0.1.0
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-bold text-zinc-100 mb-6 md:mb-8 leading-tight">
            Generate production-ready
            <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI-optimized boilerplates
            </span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 mb-10 md:mb-12 leading-relaxed max-w-3xl mx-auto">
            Create structured, well-documented project templates designed for AI coding assistants. 
            Get a complete codebase with architecture docs, dependency maps, and AI guidelines in seconds.
          </p>
          
          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/generator"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-zinc-100 text-zinc-900 rounded-xl text-base font-semibold hover:bg-white transition-all duration-200 shadow-lg shadow-zinc-900/20"
            >
              <Zap className="w-5 h-5" />
              Start Generating
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-800/80 border border-zinc-700 text-zinc-100 rounded-xl text-base font-semibold hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200"
            >
              <Sparkles className="w-5 h-5" />
              Learn More
            </a>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 md:gap-12 pt-12 md:pt-16 mt-12 md:mt-16 border-t border-zinc-800/50">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
              >
                <div className="text-3xl md:text-5xl font-bold bg-gradient-to-br from-indigo-400 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-zinc-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          id="features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-20 md:mb-32"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Everything you need to start building
            </h3>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Production-ready boilerplates with AI-optimized structure and documentation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + idx * 0.1 }}
                className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl hover:border-zinc-700/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-indigo-400" />
                  </div>
                  <p className="text-zinc-300 font-medium">{feature}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-20 md:mb-32"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Supported Technologies
            </h3>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Choose from popular frameworks and tools
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Next.js", desc: "React Framework" },
              { name: "React", desc: "UI Library" },
              { name: "Astro", desc: "Static Sites" },
              { name: "TypeScript", desc: "Type Safety" },
              { name: "Firebase", desc: "Backend Service" },
              { name: "Supabase", desc: "Open Source BaaS" },
              { name: "Tailwind CSS", desc: "Utility-First CSS" },
              { name: "SCSS", desc: "CSS Preprocessor" }
            ].map((tech, idx) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + idx * 0.05 }}
                className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-center hover:border-zinc-700/70 hover:bg-zinc-900/70 transition-all"
              >
                <h4 className="text-zinc-100 font-semibold mb-1">{tech.name}</h4>
                <p className="text-zinc-500 text-sm">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* AI Skills */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="mb-20 md:mb-32"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              AI Skills Included
            </h3>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Every boilerplate includes specialized best practices guides auto-selected for your tech stack
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
              <h4 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                <span className="text-2xl">✅</span>
                Core Skills (Always Included)
              </h4>
              <ul className="space-y-2 text-zinc-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                  <span><strong>Accessibility</strong> - WCAG 2.2 guidelines, ARIA best practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                  <span><strong>Frontend Design</strong> - Modern UI/UX patterns, design systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                  <span><strong>SEO</strong> - Meta tags, structured data, performance</span>
                </li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
              <h4 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Tech-Specific Skills (Auto-Detected)
              </h4>
              <ul className="space-y-2 text-zinc-300 text-sm">
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <span>React, Next.js, Astro guides</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <span>TypeScript/JavaScript best practices</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <span>Tailwind CSS/SCSS patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <span>Database optimization (PostgreSQL, MongoDB, MySQL)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <span>Backend patterns (Node.js, FastAPI)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <p className="text-zinc-500 text-sm">
              📁 Located in <code className="px-2 py-1 bg-zinc-800 rounded text-indigo-400">.agents/skills/</code> directory
            </p>
          </div>
        </motion.section>

        {/* Use Cases */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-20 md:mb-32"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Perfect for any project
            </h3>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              From MVPs to production apps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Rapid Prototyping",
                desc: "Get your MVP up and running in minutes with a solid foundation that scales.",
                examples: ["Startup MVPs", "Hackathon projects", "Proof of concepts"]
              },
              {
                title: "Production Apps",
                desc: "Build production-ready applications with best practices baked in from day one.",
                examples: ["SaaS platforms", "E-commerce sites", "Internal tools"]
              },
              {
                title: "Learning Projects",
                desc: "Study well-structured codebases with comprehensive documentation and examples.",
                examples: ["Tutorial projects", "Code examples", "Architecture study"]
              },
              {
                title: "Client Work",
                desc: "Start client projects with professional structure and clear documentation.",
                examples: ["Agency projects", "Freelance work", "Consulting"]
              }
            ].map((useCase, idx) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + idx * 0.1 }}
                className="p-8 bg-zinc-900/50 border border-zinc-800/50 rounded-xl hover:border-zinc-700/70 transition-colors"
              >
                <h4 className="text-xl font-bold text-zinc-100 mb-3">{useCase.title}</h4>
                <p className="text-zinc-400 mb-4 leading-relaxed">{useCase.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {useCase.examples.map(example => (
                    <span key={example} className="px-3 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-xs text-zinc-400">
                      {example}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Why Choose */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mb-20 md:mb-32"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Why VibeArchitect?
            </h3>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Built for developers who value quality and speed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "AI-Optimized",
                desc: "Every boilerplate is designed to work seamlessly with AI coding assistants like Cursor and Windsurf. Includes comprehensive documentation, clear architecture, and AI-friendly code structure."
              },
              {
                title: "Production-Ready",
                desc: "No toy examples. Get real, production-grade code with proper error handling, type safety, and best practices. Ready to deploy from day one."
              },
              {
                title: "Time-Saving",
                desc: "Skip the boring setup and configuration. Focus on building your unique features while we handle the foundation. Save hours or even days of initial setup."
              },
              {
                title: "Well-Documented",
                desc: "Complete documentation including README, architecture guides, dependency maps, and AI context files. Understand your codebase instantly."
              },
              {
                title: "Customizable",
                desc: "Choose your preferred stack: framework, language, backend, and styling. Get exactly what you need, nothing you don't."
              },
              {
                title: "Free & Open",
                desc: "Completely free to use. No hidden costs, no subscriptions. Generate unlimited boilerplates for any project."
              }
            ].map((benefit, idx) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + idx * 0.1 }}
                className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl"
              >
                <h4 className="text-lg font-bold text-zinc-100 mb-3">{benefit.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* How it works */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mb-20 md:mb-32"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
              Simple, fast, powerful
            </h3>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Three steps to your perfect boilerplate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Code2 className="w-6 h-6" />, title: "Describe", desc: "Tell us what you want to build" },
              { icon: <Sparkles className="w-6 h-6" />, title: "Generate", desc: "AI creates your optimized structure" },
              { icon: <Rocket className="w-6 h-6" />, title: "Download", desc: "Get your production-ready code" }
            ].map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + idx * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-300">
                  {step.icon}
                </div>
                <h4 className="text-xl font-bold text-zinc-100 mb-2">{step.title}</h4>
                <p className="text-zinc-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* About the Project */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mb-20 md:mb-32"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
                About VibeArchitect
              </h3>
              <p className="text-zinc-400 text-lg">
                Built for the AI-first development era
              </p>
            </div>

            <div className="space-y-8">
              <div className="p-8 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                <h4 className="text-xl font-bold text-zinc-100 mb-4">The Vision</h4>
                <p className="text-zinc-400 leading-relaxed mb-4">
                  VibeArchitect was created to solve a common problem: starting new projects takes too much time. 
                  Setting up the folder structure, configuring tools, writing boilerplate code, and creating documentation 
                  can take hours or even days before you write your first line of actual business logic.
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  With the rise of AI coding assistants like Cursor and Windsurf, there's a new opportunity: 
                  generate not just code, but <span className="text-zinc-200 font-medium">AI-optimized project structures</span> that 
                  work seamlessly with these tools from day one.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                  <h4 className="text-lg font-bold text-zinc-100 mb-3">What Makes It Different</h4>
                  <ul className="space-y-2 text-zinc-400 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">•</span>
                      <span>AI-friendly documentation (README, ARCHITECTURE.md, KNOWLEDGE_GRAPH.md)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">•</span>
                      <span>Cursor rules (.cursorrules) pre-configured for your stack</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">•</span>
                      <span>Clear dependency maps and architecture diagrams</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">•</span>
                      <span>Production-ready code, not tutorials</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                  <h4 className="text-lg font-bold text-zinc-100 mb-3">Built With</h4>
                  <ul className="space-y-2 text-zinc-400 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span><span className="text-zinc-200 font-medium">Gemini 2.5 Flash</span> - AI generation engine</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span><span className="text-zinc-200 font-medium">Next.js 15</span> - Frontend framework</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span><span className="text-zinc-200 font-medium">FastAPI</span> - Backend API</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span><span className="text-zinc-200 font-medium">Python</span> - Template engine</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-8 bg-gradient-to-br from-indigo-950/30 via-zinc-900/50 to-purple-950/30 border border-zinc-800/50 rounded-xl">
                <h4 className="text-xl font-bold text-zinc-100 mb-4">For the Build with AI LATAM Event</h4>
                <p className="text-zinc-400 leading-relaxed mb-4">
                  This project was created for the <span className="text-indigo-400 font-medium">Build with AI LATAM</span> event, 
                  showcasing how AI can accelerate not just coding, but the entire development workflow. 
                  It demonstrates practical AI integration that developers can use in their daily work.
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  The goal is to show that AI tools are most powerful when they're designed to work together with developers, 
                  not replace them. VibeArchitect handles the repetitive setup work, so you can focus on building unique features 
                  that make your project special.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-center py-16 px-6 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-4">
            Ready to build something amazing?
          </h3>
          <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
            Start generating your AI-optimized boilerplate now
          </p>
          <Link
            href="/generator"
            className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-100 text-zinc-900 rounded-xl text-base font-semibold hover:bg-white transition-all duration-200 shadow-lg shadow-zinc-900/20"
          >
            <Zap className="w-5 h-5" />
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 pt-8 border-t border-zinc-900"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 text-xs text-zinc-600">
            <p>Powered by Gemini 2.5 Flash</p>
            <span className="hidden md:inline text-zinc-800">•</span>
            <p>Built for the Build with AI LATAM event by</p>
            <a 
              href="https://listerineh.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sebastian Alvarez
            </a>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
