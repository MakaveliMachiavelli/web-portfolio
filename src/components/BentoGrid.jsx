import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import LiveSystemClock from './bento/LiveSystemClock';
import OperatingSystemStackCard from './bento/OperatingSystemStackCard';
import FocusMusicPlayerCard from './bento/FocusMusicPlayerCard';
import SwarmPipelineCard from './bento/SwarmPipelineCard';
import AiVideoCinemaCard from './bento/AiVideoCinemaCard';

import {
  Send,
  CheckCircle2,
  Bot,
  Zap,
  Search,
  Cpu,
  Clock,
  Copy,
  Check,
  Mail,
  Film,
  Activity,
  ArrowRight,
  ArrowDown,
  Briefcase,
  Globe,
  Headphones,
  Layers,
  Layout,
  ShieldCheck,
  ShoppingBag,
  Scissors,
  Video,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Real-world Multi-Agent & Operational Workflows engineered by Allen
const SWARM_PIPELINES = [
  {
    id: 'agent-system-design',
    shortTitle: 'Agent & System Design',
    title: 'Autonomous Multi-Agent Client Ingestion & Operations System',
    category: 'AI Agent Architecture & Operations',
    tag: 'Multi-Agent Swarm • n8n • Claude & DeepSeek • Supabase • Docker',
    summary: 'End-to-end automated multi-agent system: captures inbound client requests across email and Slack, dispatches specialized AI agents to research and draft solutions, runs background tool actions via n8n, and delivers verified results with built-in human escalation.',
    latency: '< 120ms Execution',
    accuracy: '99.9% Reliable',
    savedHours: '35 hrs/wk',
    nodes: [
      {
        id: 'n1',
        title: 'Inbound Request Intake & Intent Detection',
        type: 'trigger',
        icon: Search,
        status: 'Inquiry captured from Slack, Email, or CRM and categorized',
        details: {
          event_source: 'Inbound Webhooks (Slack, Email, CRM, Web Form)',
          payload_validation: 'Structured JSON validation and initial spam/safety check',
          intent_routing: 'Fast AI classifier identifies client need, sentiment, and urgency',
          queue_dispatch: 'Asynchronous task queue ready for agent processing'
        },
        time: '18ms'
      },
      {
        id: 'n2',
        title: 'Specialized Multi-Agent Research & Drafting',
        type: 'agent',
        icon: Bot,
        status: 'Dispatched to Research, Drafting & QA Agents',
        details: {
          agent_swarm: 'Supervisor Agent coordinates Research, Drafting & QA sub-agents',
          reasoning_engine: 'Claude 3.7 Sonnet & DeepSeek-R1 for complex multi-step reasoning',
          knowledge_base: 'Company SOPs, vector memory database & Obsidian knowledge base',
          quality_check: 'Cross-checks drafted response against business rules and data'
        },
        time: '45ms'
      },
      {
        id: 'n3',
        title: 'Tool Execution & Workflow Automation',
        type: 'tool',
        icon: Cpu,
        status: 'n8n triggers tools, updates databases, and runs background actions',
        details: {
          workflow_engine: 'n8n Automation Engine + Model Context Protocol (MCP)',
          database_sync: 'Supabase / PostgreSQL database updated with rollback protection',
          integrations: 'External APIs, Google Workspace, calendar booking & CRM sync',
          hosting_setup: 'Self-hosted Docker microservices on cloud VPS'
        },
        time: '38ms'
      },
      {
        id: 'n4',
        title: 'Final Delivery & Human Review Fallback',
        type: 'output',
        icon: CheckCircle2,
        status: 'Delivers verified output with instant human escalation if needed',
        details: {
          delivery_channels: 'Instant response sent via Email, Slack notification, or CRM update',
          human_safety_net: 'Confidence < 95% automatically alerts team member for review',
          audit_trail: 'Complete step-by-step history logged for operational transparency',
          business_impact: 'Eliminates 35+ hours weekly of repetitive administrative work'
        },
        time: '12ms'
      }
    ]
  },
  {
    id: 'podcast-clipping',
    shortTitle: 'Podcast Clipping',
    title: 'Podcast Repurposing & Short-Form Video Workflow',
    category: 'Podcast & Short-Form Editing',
    tag: 'Podcast • Stream Clipping • CapCut & Premiere • 24–48h SLA',
    summary: 'Transforming 60-minute episodes into 5–8 high-retention vertical shorts: finding viral hooks, cutting dead air, 9:16 vertical framing, animated captions, B-roll overlays, and scheduled publishing.',
    latency: '24–48h Delivery',
    accuracy: '100% Client Retention',
    savedHours: '15 hrs/wk',
    nodes: [
      {
        id: 'n1',
        title: 'Reviewing Raw Footage & Finding Viral Hooks',
        type: 'trigger',
        icon: Headphones,
        status: 'Audio Transcribed & Timestamps Indexed',
        details: {
          input_media: '60-min Studio Podcast (4K / 1080p + 24-bit WAV)',
          tool: 'Descript / Premiere Speech-to-Text / Whisper',
          hook_scoring: 'Selected top 5 engaging moments with strong hook potential',
          target_length: '30–60s vertical cuts'
        },
        time: '35ms'
      },
      {
        id: 'n2',
        title: 'Pacing, Trimming Dead Air & 9:16 Framing',
        type: 'tool',
        icon: Scissors,
        status: 'Jump Cuts & Multi-Cam Split Formatted',
        details: {
          editing_engine: 'Adobe Premiere Pro & CapCut Desktop',
          pacing: 'Zero dead air, removed awkward breaths, punch zooms for energy',
          framing: 'Dynamic speaker tracking & split-screen framing for 9:16',
          cuts_count: '42 micro-cuts per 45s clip'
        },
        time: '48ms'
      },
      {
        id: 'n3',
        title: 'Animated Captions, Sound FX & B-Roll Overlays',
        type: 'agent',
        icon: Zap,
        status: 'Hormozi / Creator Captions & SFX Mixed',
        details: {
          typography: 'High-contrast animated captions with colorful highlights',
          sound_design: 'Whooshes, risers, bass hits & clean voice leveling',
          visual_assets: 'Curated B-roll, pop-up icons, stickers & motion graphics',
          tool: 'CapCut Desktop • After Effects • Canva Assets'
        },
        time: '52ms'
      },
      {
        id: 'n4',
        title: 'Multi-Platform Scheduling & Publishing',
        type: 'output',
        icon: CheckCircle2,
        status: 'Approved & Scheduled Across All Channels',
        details: {
          platforms: ['TikTok', 'Instagram Reels', 'YouTube Shorts', 'Facebook Reels'],
          metadata: 'SEO titles, hashtags, description copy, and custom cover frames',
          dispatch: 'Meta Business Suite, TikTok & YouTube Studio queue',
          turnaround: 'Delivered within 24–48 hours'
        },
        time: '18ms'
      }
    ]
  },
  {
    id: 'web-prototyping',
    shortTitle: 'Web Apps & Mockups',
    title: 'Interactive Web Apps & Client Mockup Prototyping',
    category: 'Web Engineering',
    tag: 'React • TypeScript • Tailwind CSS • Vite',
    summary: 'Full-cycle web development and rapid client prototyping: turning concepts and wireframes into interactive, responsive web applications like the Artisan Beadfit customizer.',
    latency: 'Sub-second UX',
    accuracy: '100% Responsive',
    savedHours: '30 hrs/sprint',
    nodes: [
      {
        id: 'n1',
        title: 'Client Wireframe & UX Requirements',
        type: 'trigger',
        icon: Search,
        status: 'Scope & Customizer Logic Defined',
        details: {
          client_brief: 'Interactive bracelet builder with wrist measurement & live price calculation',
          design_tokens: 'Luxury dark theme, glassmorphism, responsive canvas loop',
          target_devices: 'Mobile, Tablet, Desktop'
        },
        time: '15ms'
      },
      {
        id: 'n2',
        title: 'Component Architecture & State Engine',
        type: 'agent',
        icon: Layout,
        status: 'React & TypeScript State Machine Active',
        details: {
          state_engine: 'Real-time bead capacity constraint & dynamic pricing calculation',
          geometry: 'Dynamic circular trigonometry bead distribution',
          type_safety: 'Strict TypeScript interfaces for bead inventory & orders'
        },
        time: '32ms'
      },
      {
        id: 'n3',
        title: 'Interactive Prototype & Canvas Testing',
        type: 'tool',
        icon: Cpu,
        status: '60 FPS Canvas Preview Verified',
        details: {
          framework: 'React 18 + Vite + Tailwind CSS',
          interactions: 'Drag-and-drop bead slots, live wrist slider, instant total calculation',
          test_coverage: 'Verified across Chrome, Safari iOS & Firefox'
        },
        time: '28ms'
      },
      {
        id: 'n4',
        title: 'Production Build & Client Handoff',
        type: 'output',
        icon: CheckCircle2,
        status: 'Deploy-Ready Web Application',
        details: {
          deliverable: 'Artisan Beadfit Production Customizer Web App',
          client_review: 'Instant live demo link & clean GitHub repository handoff',
          turnaround: 'Rapid MVP delivery within 1–5 days depending on complexity'
        },
        time: '14ms'
      }
    ]
  },
  {
    id: 'agentlab-media',
    shortTitle: 'AgentLab PH',
    title: 'AgentLab PH: Automated Video Creation & Publishing',
    category: 'Programmatic Video Pipelines',
    tag: 'Oracle VPS • PostgreSQL DB • Obsidian Vault • Docker • 24/7 Server',
    summary: 'Automating video production from research to final upload: AI voice generation, subtitle sync, React-based video rendering, and scheduled publishing to FB, IG, and YouTube.',
    latency: '53.4s Video',
    accuracy: '100% Code-Rendered',
    savedHours: '20 hrs/wk',
    nodes: [
      {
        id: 'n1',
        title: 'Topic Research & Script Generation',
        type: 'trigger',
        icon: Search,
        status: 'Topic Research & Data Sourced',
        details: {
          knowledge_vault: 'Obsidian Notes & Topic Database',
          macro_sources: ['Philippine News', 'Bloomberg', 'BSP Circulars', 'Community Datasets'],
          panel_consensus: 'AI script synthesis from curated news & community trends',
          target_duration: '56.5s 9:16 vertical short'
        },
        time: '18ms'
      },
      {
        id: 'n2',
        title: 'AI Voiceover & Word-by-Word Subtitle Sync',
        type: 'tool',
        icon: Headphones,
        status: 'Word Timestamps Aligned',
        details: {
          tts_model: 'Kokoro (Natural AI Voice)',
          voice: 'af_heart @ 24kHz (1.05x speed)',
          alignment_engine: 'faster-whisper (Word-level timestamps)',
          script_path: 'factory-nblm-ph/audio/generate_pipeline.py'
        },
        time: '42ms'
      },
      {
        id: 'n3',
        title: 'Remotion Automated Video Rendering',
        type: 'agent',
        icon: Film,
        status: '1,602 Frames Rendered @ 30 FPS',
        details: {
          framework: 'Remotion 4.0 (React Video Engine)',
          composition_id: 'autoflow (1080x1920)',
          primitives: ['AbsoluteFill', 'Audio', 'Easing', 'interpolate', 'useCurrentFrame'],
          source_file: 'pipeline-shorts/autoflow/src/AutoflowVideo.tsx'
        },
        time: '64ms'
      },
      {
        id: 'n4',
        title: 'Automated Multi-Platform Social Upload',
        type: 'output',
        icon: CheckCircle2,
        status: 'Scheduled & Posted to FB, IG & YouTube',
        details: {
          dispatch_engine: 'Composio.dev Automated Social Tools',
          facebook: 'FB Reels & Page Auto-Post',
          instagram: 'IG Reels Auto-Publish',
          youtube: 'YouTube Shorts API Upload & Tagging',
          automation: 'Automated AgentLab PH trigger on cloud server'
        },
        time: '24ms'
      }
    ]
  },
  {
    id: 'cx-collections',
    shortTitle: 'Enterprise CX',
    title: 'Customer Support & Finance Operations Workflow',
    category: 'Operations & CX',
    tag: 'Regulated Finance & Insurance',
    summary: '4 years of customer support experience in insurance and finance, translated into fast, reliable customer workflows with clear escalation rules.',
    latency: '82ms',
    accuracy: '99.8%',
    savedHours: '25 hrs/wk',
    nodes: [
      {
        id: 'n1',
        title: 'Inbound Customer Ticket & Request',
        type: 'trigger',
        icon: Mail,
        status: 'Ticket Ingested & Tagged',
        details: {
          channel: 'Zendesk / Support Webhook',
          intent: 'Disputed insurance claim & repayment term restructure',
          risk_level: 'High Priority / Compliance Scope'
        },
        time: '12ms'
      },
      {
        id: 'n2',
        title: 'Customer Tone Analysis & Guidelines Check',
        type: 'agent',
        icon: ShieldCheck,
        status: 'De-escalation Protocol Applied',
        details: {
          guardrails: 'Strict Fair Debt Collection & Insurance compliance',
          sentiment_score: 'Frustrated / Urgent (Severity 4/5)',
          escalation_needed: false
        },
        time: '36ms'
      },
      {
        id: 'n3',
        title: 'Account & Policy Verification',
        type: 'tool',
        icon: Cpu,
        status: 'Coverage & Amortization Verified',
        details: {
          policy_lookup: 'Policy Tier #BPO-7741',
          restructure_options: ['3-Month Amortization Freeze', 'Reduced Interest Restructure'],
          calc_accuracy: '100% verified against SOP'
        },
        time: '22ms'
      },
      {
        id: 'n4',
        title: 'Accurate Resolution & Fast Escalation',
        type: 'output',
        icon: CheckCircle2,
        status: 'Resolution Drafted & Logged',
        details: {
          action: 'Sent empathetic, compliant settlement schedule',
          supervisor_fallback: 'Human supervisor fallback ready',
          status: 'Resolved in 1.4s'
        },
        time: '12ms'
      }
    ]
  },
  {
    id: 'live-commerce',
    shortTitle: 'Live Commerce',
    title: 'Multi-Store Inventory Sync & Live Selling',
    category: 'E-Commerce Ops',
    tag: 'TikTok Shop • Shopee • Lazada',
    summary: 'Real-time flash deal updates, cross-store inventory syncing across TikTok Shop, Shopee, and Lazada, and instant buyer confirmations.',
    latency: '68ms',
    accuracy: '100%',
    savedHours: '18 hrs/wk',
    nodes: [
      {
        id: 'n1',
        title: 'Live Stream Product Pinning & Deals',
        type: 'trigger',
        icon: Zap,
        status: 'Product Pinned on Live Stream',
        details: {
          platforms: ['TikTok Shop Live', 'Shopee Live', 'Lazada Live'],
          sku: 'GEM-OPAL-NATURAL-042',
          allocated_flash_stock: 25
        },
        time: '15ms'
      },
      {
        id: 'n2',
        title: 'Cross-Store Stock Reservation',
        type: 'tool',
        icon: ShoppingBag,
        status: 'Multi-Store Inventory Reserved',
        details: {
          shopee_stock: 'Reserved 10 units',
          tiktok_stock: 'Reserved 10 units',
          lazada_stock: 'Reserved 5 units',
          sync_latency: 'Sub-100ms API lock'
        },
        time: '28ms'
      },
      {
        id: 'n3',
        title: 'Flash Discounts & Voucher Activation',
        type: 'agent',
        icon: Bot,
        status: 'Live Voucher Code Activated',
        details: {
          discount_type: 'Flash Broadcast 15% Off',
          time_remaining: '04:59 minutes',
          max_claims_per_buyer: 1
        },
        time: '18ms'
      },
      {
        id: 'n4',
        title: 'Instant Confirmation & Order Packing',
        type: 'output',
        icon: CheckCircle2,
        status: 'Order Ingested & Waybill Generated',
        details: {
          buyer_dm: 'Checkout link sent via direct message',
          fulfillment: 'Pushed to warehouse packing queue',
          seller_rating: '5.0-Star seller rating maintained'
        },
        time: '14ms'
      }
    ]
  },
  {
    id: 'ab-benchmark',
    shortTitle: 'A/B Benchmark',
    title: 'Video Comparison & Quality Testing',
    category: 'Programmatic Video Pipelines',
    tag: 'build_sidebyside.py',
    summary: 'Side-by-side video testing tool that compares custom video builds against baseline versions to verify quality and pacing.',
    latency: '48s Render',
    accuracy: '100% Deterministic',
    savedHours: '10 hrs/wk',
    nodes: [
      {
        id: 'n1',
        title: 'Generating Both Video Versions',
        type: 'trigger',
        icon: Clock,
        status: 'Batch Beat Sheet Dispatched',
        details: {
          input_beat_sheet: 'TOPIC-DECISION.md',
          build_a: 'Allen Custom Remotion Pipeline',
          build_b: 'Alternative Baseline Pipeline'
        },
        time: '22ms'
      },
      {
        id: 'n2',
        title: 'Side-by-Side Video Assembly',
        type: 'tool',
        icon: Film,
        status: 'Side-by-Side Panel Assembled',
        details: {
          script: 'build_sidebyside.py',
          filter_complex: 'hstack=inputs=2',
          resolution: '2160x1920 composite',
          output: 'public/IMG_7963.MP4'
        },
        time: '34ms'
      },
      {
        id: 'n3',
        title: 'Pacing & Readability Evaluation',
        type: 'agent',
        icon: Bot,
        status: 'Winner Selected: Allen Build',
        details: {
          metrics: ['Subtitle Readability', 'Visual Pacing', 'Audio Normalization'],
          score_allen: '9.4/10',
          score_baseline: '7.8/10'
        },
        time: '28ms'
      },
      {
        id: 'n4',
        title: 'Selecting Winning Video for Publishing',
        type: 'output',
        icon: CheckCircle2,
        status: 'Winning Video Tagged for Publishing',
        details: {
          status: 'Auto-approved for automated social posting',
          verified_file: 'factory-nblm-ph/video-v2/final.mp4'
        },
        time: '16ms'
      }
    ]
  }
];

// AgentLab PH Programmatic Media Engine Clips (100% Code-Rendered 9:16 Vertical Video)
const AGENTLAB_REMOTION_CLIPS = [
  {
    id: 'agentlab-1500mw',
    title: '1500MW Power for AI: Energy Grid Analysis',
    genre: 'AgentLab PH • Energy & AI Infrastructure',
    tag: 'Remotion 4.0 • Kokoro TTS',
    tools: 'Remotion 4.0 • React • Kokoro TTS (24kHz) • faster-whisper',
    desc: 'Autonomous 9:16 vertical short. Code-rendered kinetic typography, data visualizations, word-level audio alignment, and zero stock footage.',
    src: '/1500mw_power_for_ai.mp4',
    poster: '/power_ai_poster.webp',
    fallbackSrc: '/1500MW-POWER-FOR-AI-UPLOAD.mp4',
    res: '1080×1920',
    fps: '30 FPS',
    ratio: '9:16 Short',
    badge: '1500MW AI Power',
  },
  {
    id: 'ab-comparison',
    title: 'Side-by-Side Pipeline Evaluation Reel',
    genre: 'AgentLab PH • A/B Benchmark',
    tag: 'build_sidebyside.py • FFmpeg',
    tools: 'build_sidebyside.py • FFmpeg • Remotion vs Baseline',
    desc: 'Automated A/B evaluation panel testing Allen custom Remotion pipeline directly against alternative pipeline build.',
    src: '/IMG_7963.MP4',
    poster: '/benchmark_poster.webp',
    fallbackSrc: '/IMG_7963.MP4',
    res: '1920×1830',
    fps: '30 FPS',
    ratio: 'A/B Split',
    badge: 'A/B Benchmark',
  },
  {
    id: 'remotion-ozempic',
    title: 'AI Medical Study: 400k Reddit Analysis',
    genre: 'AgentLab PH • Reddit Analysis',
    tag: 'Remotion 4.0 • Kokoro TTS',
    tools: 'Remotion 4.0 • React • Kokoro TTS (24kHz) • faster-whisper',
    desc: 'Programmatic 9:16 vertical short. Code-rendered kinetic typography, word-level audio alignment, zero stock footage.',
    src: '/IMG_8260.MP4',
    poster: '/remotion_poster.webp',
    fallbackSrc: '/IMG_8260.MP4',
    res: '1080×1920',
    fps: '30 FPS',
    ratio: '9:16 Short',
    badge: 'Reddit Case Study',
  },
];

// Allen's Core Specializations with verified metrics and descriptions
const ROLES = [
  {
    id: 'agent-builder-system-design',
    icon: Bot,
    label: 'AI Agent Builder & System Design',
    headline: 'Multi-Agent Swarms, Autonomous System Design & Workflow Engineering',
    desc: 'Architecting scalable multi-agent systems and resilient event-driven pipelines. Designing custom agent swarms with memory persistence, tool calling (MCP, APIs, Webhooks), autonomous data ingestion (n8n, Python, Docker), and LLM reasoning engines (Claude, OpenAI, DeepSeek) to automate mission-critical business operations end-to-end with zero human bottleneck.',
    skills: ['System Design', 'AI Agent Building', 'Multi-Agent Swarms', 'n8n Automations', 'Event-Driven Architecture', 'Tool Calling & MCP', 'Vector Memory / RAG', 'PostgreSQL & Supabase', 'Docker & Cloud VPS', 'Python Automation'],
    metric: 'Autonomous Multi-Agent Architecture • Scalable System Design',
    prompt: 'I want to hire you to design an autonomous AI agent system and architect our workflow automation.'
  },
  {
    id: 'video-editing',
    icon: Scissors,
    label: 'Podcast & Short-Form Editing',
    headline: 'Podcast Repurposing, Short-Form Content & High-Retention Editing',
    desc: 'Creating high-engagement short-form videos for podcasters, creators, and brands. Specializing in podcast clipping, talking-head pacing, jump cuts, animated subtitles, sound effects, B-roll overlays, and high-converting video ads. Fast 24–48h turnaround in CapCut & Premiere Pro.',
    skills: ['Podcast Clipping', 'CapCut Desktop', 'Adobe Premiere Pro', 'Animated Captions', 'Sound Design & SFX', 'YouTube Shorts & Reels', 'UGC Video Ads', 'Hook Variation Testing', 'Descript Audio'],
    metric: '24–48h Delivery • High Viewer Retention',
    prompt: 'I need a video editor to clip our podcasts and produce high-retention short-form content.'
  },
  {
    id: 'creative-va',
    icon: Briefcase,
    label: 'Creative & Executive VA',
    headline: 'Social Media Publishing, Asset Management & Creative Operations',
    desc: 'Managing your full publishing workflow and daily operations: scheduling posts on YouTube Studio, TikTok, and Meta Business Suite, organizing your Google Drive and Dropbox files, coordinating thumbnail designs, managing your email inbox, and creating clear Notion step-by-step guides.',
    skills: ['Content Scheduling', 'YouTube Studio', 'Meta Business Suite', 'Google Workspace', 'Notion', 'Slack Updates', 'Inbox Management', 'Step-by-Step SOPs', 'Canva Graphics', 'File Organization'],
    metric: 'Zero-Micromanagement Operations',
    prompt: 'Looking for a reliable Creative & Executive VA to manage our content publishing and day-to-day operations.'
  },
  {
    id: 'agentlab',
    icon: Film,
    label: 'Programmatic Video Pipelines',
    headline: 'Code-Rendered Video Creation & Autonomous Social Publishing',
    desc: 'Building automated video workflows: topic research, natural AI voiceovers, automatic subtitle alignment, code-rendered video in Remotion, and scheduled posting to Facebook, Instagram, and YouTube.',
    skills: ['Remotion 4.0', 'TypeScript', 'Neural Voice (Kokoro)', 'Auto Subtitles', 'Social Auto-Post', 'n8n Workflows', 'Obsidian Notes', 'Docker', 'Linux Server', 'PostgreSQL', 'Telegram Bot'],
    metric: 'Automated 9:16 Video Generation',
    prompt: 'I want to discuss building an automated video and publishing system.'
  },
  {
    id: 'cx-bpo',
    icon: ShieldCheck,
    label: 'Enterprise CX & Operations',
    headline: '4 Years Enterprise BPO Experience Applied to Daily Operations',
    desc: 'Bringing 4 years of frontline contact-center experience in regulated finance and insurance into daily business operations. Clear async communication, strict deadline discipline, and dependable customer service with human escalation.',
    skills: ['Clear Communication', 'Customer Support', 'Process Compliance', 'Zendesk / CRM', 'Slack Updates', 'Human Escalation', 'Conflict De-escalation'],
    metric: '4+ Years Enterprise Reliability',
    prompt: 'Looking for a dependable customer support and operations specialist with clear communication.'
  },
  {
    id: 'live-commerce',
    icon: ShoppingBag,
    label: 'E-Commerce & Supply Ops',
    headline: 'E-Commerce Store Operations, Live Selling & Supply Logistics',
    desc: 'Managing online marketplace stores and hands-on physical workshop logistics. Handling product listings, multi-store inventory synchronization, live stream selling schedules, and fast order fulfillment across TikTok Shop, Shopee, and Lazada.',
    skills: ['TikTok Shop', 'Shopee Seller Center', 'Lazada Seller Center', 'Live Selling', 'Multi-Store Inventory', 'Workshop Scheduling', 'Supply Logistics', 'Order Fulfillment', 'Product SEO'],
    metric: 'Active Store & Supply Management',
    prompt: 'Looking for an operations partner who understands e-commerce store operations, live selling, and physical supply chain logistics.'
  },
  {
    id: 'ai-cinema',
    icon: Film,
    label: 'Cinematic AI Directing',
    headline: 'Cinematic AI Video Direction, Motion Choreography & Storytelling',
    desc: 'Directing high-definition AI cinematic videos with dynamic camera movement, custom visual effects, and professional sound design in Premiere Pro, CapCut, and After Effects.',
    skills: ['Google Flow', 'Google Veo', 'Adobe Premiere Pro', 'CapCut Desktop', 'After Effects', 'Sound Design & SFX'],
    metric: '1440p High-Definition Cinematic Sequences',
    prompt: 'I’d like to collaborate on AI-generated video production, cinematic storytelling, and post-production directing.'
  },
  {
    id: 'web-dev',
    icon: Globe,
    label: 'Web Apps & Client Mockups',
    headline: 'Custom Web Applications, Interactive Mockups & E-Commerce Builders',
    desc: 'Developing fast, high-converting web applications and interactive client mockups. Featured project: Artisan Beadfit — a full-featured bracelet customization e-commerce web app with real-time geometric preview, dynamic sizing calculation, and smooth responsive checkout.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Interactive Mockups', 'E-Commerce Builders', 'HTML5 Canvas', 'Responsive UI', 'Supabase', 'GitHub'],
    metric: 'Full Web App & Rapid Client Prototyping',
    prompt: 'I need an interactive web application or client prototype built with React and modern UI.'
  },
];

// Tools & Technologies accurately mapped to Allen's production systems
const TOOLS = [
  // Pillar 1: AI & Media (Programmatic Video, Podcast Editing & AI Cinema)
  { name: 'CapCut Desktop', category: 'AI & Media', src: '/tools/capcut.svg', invert: false, desc: 'Short-form video editing, pacing cuts, animated captions & audio mixing' },
  { name: 'Premiere Pro', category: 'AI & Media', src: '/tools/premiere.svg', invert: false, desc: 'Podcast clipping, multi-camera editing, color grading & audio finishing' },
  { name: 'After Effects', category: 'AI & Media', src: '/tools/aftereffects.svg', invert: false, desc: 'Motion graphics, title animations, B-roll overlays & visual effects' },
  { name: 'Descript', category: 'AI & Media', src: '/tools/descript.svg', invert: false, desc: 'Audio cleanup, transcript editing & quick clip selection' },
  { name: 'Remotion 4.0', category: 'AI & Media', src: '/tools/remotion.svg', invert: false, desc: 'Automated video creation using React code' },
  { name: 'Kokoro TTS', category: 'AI & Media', src: '/tools/kokoro.svg', invert: false, desc: 'Natural-sounding AI voiceover synthesis' },
  { name: 'faster-whisper', category: 'AI & Media', src: '/tools/whisper.svg', invert: false, desc: 'Accurate word-by-word subtitle alignment' },
  { name: 'Composio.dev', category: 'AI & Media', src: '/tools/composio.svg', invert: false, desc: 'Automated social posting to Facebook, Instagram & YouTube' },
  { name: 'n8n', category: 'AI & Media', src: '/tools/n8n.svg', invert: false, desc: 'Automated workflows connecting apps and services' },
  { name: 'Google Veo', category: 'AI & Media', src: '/tools/googleveo.svg', invert: false, desc: 'Cinematic AI video generation and directing' },
  { name: 'FFmpeg Engine', category: 'AI & Media', src: '/tools/ffmpeg.svg', invert: false, desc: 'Fast video rendering, resizing & format conversion' },

  // Pillar 2: LLMs & AI
  { name: 'Claude', category: 'LLMs & AI', src: '/tools/claude.svg', invert: false, desc: 'Scriptwriting, complex logic & code development' },
  { name: 'Llama', category: 'LLMs & AI', src: '/tools/meta.svg', invert: false, desc: 'Open-source AI models & structured text generation' },
  { name: 'DeepSeek', category: 'LLMs & AI', src: '/tools/deepseek.svg', invert: false, desc: 'Deep analytical reasoning & problem solving' },
  { name: 'OpenAI', category: 'LLMs & AI', src: '/tools/openai.svg', invert: false, desc: 'Creative script ideation & visual analysis' },
  { name: 'Gemini', category: 'LLMs & AI', src: '/tools/gemini.svg', invert: false, desc: 'Document research, long-form content & media analysis' },
  { name: 'Groq', category: 'LLMs & AI', src: '/tools/groq.svg', invert: false, desc: 'Lightning-fast AI responses and automated tasks' },

  // Pillar 3: Code & Cloud
  { name: 'TypeScript', category: 'Code & Cloud', src: '/tools/typescript.svg', invert: false, desc: 'Reliable, type-safe web and video code' },
  { name: 'GitHub', category: 'Code & Cloud', src: '/tools/github.svg', invert: false, desc: 'Version control, team collaboration & automated deployments' },
  { name: 'Python', category: 'Code & Cloud', src: '/tools/python.svg', invert: false, desc: 'Automation scripts, web scraping & data handling' },
  { name: 'PostgreSQL / SQL', category: 'Code & Cloud', src: '/tools/postgresql.svg', invert: false, desc: 'Database management, data storage & task queues' },
  { name: 'Supabase', category: 'Code & Cloud', src: '/tools/supabase.svg', invert: false, desc: 'Realtime database, user authentication & file storage' },
  { name: 'Docker', category: 'Code & Cloud', src: '/tools/docker.svg', invert: false, desc: 'Containerized apps and reliable deployment environments' },
  { name: 'Oracle Cloud VPS', category: 'Code & Cloud', src: '/tools/oracle.svg', invert: false, desc: '24/7 always-on cloud server for background tasks' },
  { name: 'Ubuntu Linux', category: 'Code & Cloud', src: '/tools/linux.svg', invert: false, desc: 'Linux server administration & scheduled jobs' },
  { name: 'Telegram C2', category: 'Code & Cloud', src: '/tools/telegram.svg', invert: false, desc: 'Custom Telegram bot for remote notifications & alerts' },
  { name: 'React', category: 'Code & Cloud', src: '/tools/react.svg', invert: false, desc: 'Interactive modern web interfaces and components' },
  { name: 'Tailwind CSS', category: 'Code & Cloud', src: '/tools/tailwind.svg', invert: false, desc: 'Clean, modern styling and responsive layouts' },

  // Pillar 4: Operations & E-Commerce
  { name: 'YouTube Studio', category: 'Operations & E-Com', src: '/tools/youtube.svg', invert: false, desc: 'Video uploads, SEO titles/tags, chapters & thumbnail testing' },
  { name: 'Meta Business Suite', category: 'Operations & E-Com', src: '/tools/meta.svg', invert: false, desc: 'Reels & post publishing, content calendar & performance analytics' },
  { name: 'Canva Pro', category: 'Operations & E-Com', src: '/tools/canva.svg', invert: false, desc: 'YouTube thumbnails, social graphics & brand assets' },
  { name: 'Google Workspace', category: 'Operations & E-Com', src: '/tools/googleworkspace.svg', invert: false, desc: 'Organized Google Drive folders, shared docs & project trackers' },
  { name: 'Slack', category: 'Operations & E-Com', src: '/tools/slack.svg', invert: false, desc: 'Team communication, async updates & automated alerts' },
  { name: 'Notion OS', category: 'Operations & E-Com', src: '/tools/notion.svg', invert: false, desc: 'Content calendars, clear step-by-step SOPs & company wikis' },
  { name: 'Obsidian Vault', category: 'Operations & E-Com', src: '/tools/obsidian.svg', invert: false, desc: 'Personal knowledge base, research notes & idea tracking' },
  { name: 'TikTok Shop', category: 'Operations & E-Com', src: '/tools/tiktok.svg', invert: false, desc: 'Product listings, order management & live selling setup' },
  { name: 'Shopee Seller', category: 'Operations & E-Com', src: '/tools/shopee.svg', invert: false, desc: 'Product catalog, promotional campaigns & store management' },
  { name: 'Lazada Seller Center', category: 'Operations & E-Com', src: '/tools/lazada.svg', invert: false, desc: 'Order fulfillment, flash sales & inventory tracking' },
  { name: 'OBS Studio', category: 'Operations & E-Com', src: '/tools/obs.svg', invert: false, desc: 'Multi-camera live streaming and clean audio setup' },
  { name: 'Zendesk Suite', category: 'Operations & E-Com', src: '/tools/zendesk.svg', invert: false, desc: 'Customer support, ticket management & timely issue resolution' },
];

export default function BentoGrid() {
  const gridRef = useRef(null);

  // Selected Role for Interactive Dossier (Default to AI Agent Builder)
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);

  // Form State
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedContact, setCopiedContact] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Cinematic 3D Cybernetic Scroll Animation
  useEffect(() => {
    // 1. Initial 3D Spatial Stagger for Cards
    gsap.set('.bento-card', {
      opacity: 0,
      y: 60,
      rotateX: 14,
      scale: 0.94,
      transformPerspective: 1200,
      transformOrigin: '50% 0%',
    });

    // 2. Batch trigger as cards enter viewport with smooth 3D unfolding & neon activation
    const batch = ScrollTrigger.batch('.bento-card', {
      start: 'top 88%',
      once: true,
      onEnter: (batchElements) => {
        gsap.to(batchElements, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.85,
          stagger: 0.08,
          ease: 'power3.out',
          overwrite: true,
          onComplete: () => {
            batchElements.forEach((el) => {
              el.classList.add('neon-active');
              gsap.set(el, { clearProps: 'transform' });
            });
          },
        });
      },
    });

    // 3. Kinetic Header Unfold on scroll into Bento section
    const headerTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#about',
        start: 'top 80%',
        once: true,
      },
    });

    headerTl
      .fromTo(
        '.bento-header-badge',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
      )
      .fromTo(
        '.bento-header-title',
        { opacity: 0, y: 35, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo(
        '.bento-header-desc',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.5'
      )
      .fromTo(
        '.bento-header-clock',
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' },
        '-=0.4'
      );

    return () => {
      batch.forEach((st) => st.kill());
      headerTl.kill();
    };
  }, []);

  // Spotlight Direct Ref & Animation Frame (Zero React Re-render, Caches Rect to eliminate layout thrashing)
  const spotlightRef = useRef(null);
  const rafRef = useRef(null);
  const rectRef = useRef(null);

  useEffect(() => {
    const updateRect = () => {
      if (gridRef.current) {
        rectRef.current = gridRef.current.getBoundingClientRect();
      }
    };
    updateRect();
    window.addEventListener('resize', updateRect, { passive: true });
    window.addEventListener('scroll', updateRect, { passive: true });
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, []);

  // Mouse move handler for ambient spotlight - throttled to 60fps with cached rect
  const handleMouseMove = (e) => {
    if (!gridRef.current || !spotlightRef.current) return;
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!gridRef.current || !spotlightRef.current) return;
      if (!rectRef.current) {
        rectRef.current = gridRef.current.getBoundingClientRect();
      }
      const rect = rectRef.current;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      spotlightRef.current.style.background = `radial-gradient(800px circle at ${x}% ${y}%, rgba(255, 107, 0, 0.06), rgba(255, 255, 255, 0.02), transparent 70%)`;
    });
  };

  // Form Submit Handler: opens native mail client with prefilled inquiry
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    setIsSubmitted(true);
    const subject = encodeURIComponent(`Project Inquiry: ${selectedRole.label}`);
    const body = encodeURIComponent(trimmed);
    window.location.href = `mailto:allenolavidez@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleCopyDraft = () => {
    if (!message.trim()) return;
    navigator.clipboard.writeText(message);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  // One-click prompt filler
  const handleQuickPrompt = (promptText) => {
    setMessage(promptText);
    const input = document.getElementById('message-input');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Copy Contact Handler
  const handleCopyContact = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedContact(true);
    setTimeout(() => setCopiedContact(false), 2000);
  };

  return (
    <section
      id="about"
      ref={gridRef}
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-screen bg-transparent pt-20 pb-32 sm:pb-40 px-4 sm:px-6 md:px-10 lg:px-16 overflow-x-clip z-10"
    >

      {/* 1. Interactive Cursor Spotlight Aura */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
        style={{
          background: 'radial-gradient(800px circle at 50% 50%, rgba(255, 107, 0, 0.06), rgba(255, 255, 255, 0.02), transparent 70%)',
        }}
      />

      {/* 2. Cybernetic Blueprint Dot Grid & Line Pattern with smooth bottom fade */}
      <div className="absolute inset-0 bg-cyber-grid opacity-40 pointer-events-none z-10 [mask-image:linear-gradient(to_bottom,black_70%,transparent_96%)]" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none z-10 [mask-image:linear-gradient(to_bottom,black_70%,transparent_96%)]" />

      {/* 3. Soft Ambient Light Dissolving from Hero */}
      <div className="absolute top-0 inset-x-0 h-56 bg-gradient-to-b from-[#FF6B00]/15 via-amber-500/5 to-transparent pointer-events-none z-10" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-64 bg-orange-500/15 rounded-full blur-[160px] pointer-events-none z-10" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-white/[0.02] rounded-full blur-[140px] pointer-events-none z-10" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-orange-500/[0.03] rounded-full blur-[140px] pointer-events-none z-10" />

      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-12 relative z-10">
        {/* Cybernetic HUD Telemetry */}
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pb-3 mb-4 select-none border-b border-white/[0.05]">
          <span className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse" />
            <span>SEC: 01_OPERATIONAL_MATRIX</span>
          </span>
          <span className="hidden sm:inline text-neutral-500">LOC: 14.5995° N, 120.9842° E // 4YR ENTERPRISE DISCIPLINE</span>
          <span className="text-emerald-400/90 font-medium">SYS: ONLINE // 60 FPS</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="bento-header-badge text-xs font-mono uppercase tracking-widest text-orange-400 mb-3 font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span>Creative &amp; Executive VA • AI Agent Builder • System Design</span>
            </p>
            <h2 className="bento-header-title font-syne font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
              Engineered for impact. <br />
              <span className="text-neutral-400 font-normal">Delivered with precision.</span>
            </h2>
            <p className="bento-header-desc text-neutral-400 text-xs sm:text-sm md:text-base max-w-2xl mt-3 font-sans leading-relaxed">
              From executive administration and multi-agent system design to programmatic AI video workflows and rapid web prototyping — high-leverage operational execution built to scale your business autonomously.
            </p>

            {/* High-Impact Client Engagement Tracks */}
            <div className="flex flex-wrap items-center gap-2 pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-400/25 text-orange-300 text-xs font-mono shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span className="font-semibold text-white">Track A:</span> Creative &amp; Executive VA
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-300 text-xs font-mono shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="font-semibold text-white">Track B:</span> AI Agent Builder &amp; System Design
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-400/25 text-orange-300 text-xs font-mono shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span className="font-semibold text-white">Track C:</span> Media Systems &amp; AI Cinema
              </div>
            </div>
          </div>

          {/* Minimalist Location & Timezone Indicator */}
          <div className="bento-header-clock flex items-center gap-3 p-1.5 px-4 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl text-xs font-mono text-neutral-300 self-start md:self-end shrink-0">
            <span className="flex items-center gap-2 text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Manila GMT+8</span>
            </span>
            <span className="text-neutral-600">•</span>
            <LiveSystemClock />
          </div>
        </div>
      </div>

      {/* Grid Matrix */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">

        {/* Profile Card */}
        <div className="bento-card glass-card relative lg:col-span-4 min-h-[520px] p-5 sm:p-6 rounded-[28px] overflow-hidden group border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between bg-black/40 backdrop-blur-xl">
          
          <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-white/10 group-hover:border-orange-500/30 transition-all shadow-lg shrink-0 bg-neutral-900">
            <img
              src="/mine_pic.webp"
              alt="Allen Profile"
              className="w-full h-full object-cover object-[center_top] transition-transform duration-700 group-hover:scale-105"
            />

            {/* Subtle border & bottom gradient vignette for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

            {/* Bottom Floating Status Strips (placed over hoodie area so hair & face remain 100% unobscured) */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 border border-white/15 backdrop-blur-md text-[10px] font-mono text-neutral-300 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Available for Hire</span>
              </div>

              <span className="text-[10px] font-mono text-neutral-400 bg-black/75 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md shadow-md">
                Direct Hire
              </span>
            </div>
          </div>

          {/* 2. Executive Bio & Skills Info Panel */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-syne font-extrabold text-2xl text-white tracking-wide">
                  Allen
                </h3>
                <p className="text-xs text-orange-400 font-mono font-medium mt-0.5">
                  Creative &amp; Executive VA • AI Agent Builder • System Design
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopyContact('allenolavidez@gmail.com')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white text-neutral-200 hover:text-black transition-all cursor-pointer border border-white/10 shadow-lg"
                title="Copy allenolavidez@gmail.com"
              >
                {copiedContact ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-neutral-300 text-xs sm:text-[13px] leading-relaxed font-sans">
              High-trust Executive Virtual Assistant, AI Agent Builder, and System Design specialist. Combining executive administrative rigor with autonomous multi-agent architecture: executive calendar &amp; inbox triage, custom multi-agent workflow orchestration (n8n, Claude, Remotion), high-retention video production, e-commerce store operations, and rapid web prototyping. Backed by 4 years of enterprise BPO contact-center discipline.
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
              {ROLES.map((role) => {
                const IconComponent = role.icon;
                const isSelected = selectedRole.id === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 cursor-pointer text-left ${
                      isSelected
                        ? 'bg-white text-black font-semibold shadow-sm ring-1 ring-white/20'
                        : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5 hover:text-white'
                    }`}
                  >
                    <IconComponent className={`w-3 h-3 shrink-0 ${isSelected ? 'text-black' : 'text-orange-400'}`} />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Core Specializations & Direct Transmission Card */}
        <div className="bento-card glass-card relative lg:col-span-8 min-h-[500px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300">
          <div>
            {/* Top Badge & Header */}
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span>Core Competencies &amp; Specializations</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300">
                Interactive Dossier
              </span>
            </div>

            <h3 className="font-syne font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-2 leading-tight">
              High-leverage execution across executive operations, video &amp; tech.
            </h3>

            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal mb-5">
              Select any capability below to review daily responsibilities, verified toolchains, and exact client deliverables.
            </p>

            {/* Interactive Roles Selector Pills */}
            <div className="flex flex-wrap gap-2 mb-5">
              {ROLES.map((role) => {
                const IconComponent = role.icon;
                const isSelected = selectedRole.id === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black font-semibold shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5 hover:text-white'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-orange-400'}`} />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Live Role Dossier Box */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedRole.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl mb-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h4 className="font-syne font-bold text-base sm:text-lg text-white">
                      {selectedRole.headline}
                    </h4>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-500/15 border border-orange-400/25 text-orange-300 font-medium shrink-0 self-start sm:self-auto">
                      {selectedRole.metric}
                    </span>
                  </div>

                  <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mb-4">
                    {selectedRole.desc}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRole.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[11px] font-mono text-neutral-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickPrompt(selectedRole.prompt)}
                      className="text-xs font-mono text-orange-400 hover:text-orange-300 flex items-center gap-1.5 transition-colors cursor-pointer group"
                    >
                      <span>Inquire about this</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Interactive Direct Message Input Form */}
          <div className="pt-3 border-t border-white/10">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleFormSubmit}
                  className="flex flex-col sm:flex-row gap-3 w-full"
                >
                  <div className="relative flex-1">
                    <input
                      id="message-input"
                      name="message"
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Send a project inquiry, opportunity, or note to Allen..."
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm active:scale-95 transition-all shrink-0 cursor-pointer shadow-md"
                  >
                    <span>Connect</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 w-full"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <p className="text-xs sm:text-sm text-emerald-200 font-medium">
                      Inquiry prepared! Launching your email composer for Allen.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyDraft}
                      className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-mono transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      title="Copy message draft"
                    >
                      {copiedDraft ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <a
                      href={`mailto:allenolavidez@gmail.com?subject=${encodeURIComponent(`Project Inquiry: ${selectedRole.label}`)}&body=${encodeURIComponent(message)}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-200 text-xs font-mono transition-colors inline-flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Open Email</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false);
                        setMessage('');
                      }}
                      className="text-xs font-mono text-emerald-400 hover:text-white underline underline-offset-4 cursor-pointer ml-1"
                    >
                      New
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <SwarmPipelineCard pipelines={SWARM_PIPELINES} />
        <AiVideoCinemaCard clips={AGENTLAB_REMOTION_CLIPS} />
        <OperatingSystemStackCard tools={TOOLS} />
        <FocusMusicPlayerCard />
      </div>

      {/* Continuous Ethereal Luminous Conduit into Artisan Beadfit */}
      <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none z-20 flex flex-col items-center justify-end">
        <div className="w-[1px] h-20 bg-gradient-to-b from-orange-500/40 via-amber-400/60 to-transparent" />
        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_10px_#ff6b00] animate-pulse" />
      </div>

    </section>
  );
}
