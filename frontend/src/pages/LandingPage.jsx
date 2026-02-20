import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Users,
  Target,
  Mail,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
  Check,
  Star,
  Linkedin,
  Menu,
  X,
  Download,
  Gift,
  BookOpen,
  Smartphone
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLeadMagnet, setShowLeadMagnet] = useState(false);
  const [leadMagnetEmail, setLeadMagnetEmail] = useState('');
  const [leadMagnetName, setLeadMagnetName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);

  const handleLeadMagnetSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.post(`${API}/lead-magnet/subscribe`, {
        email: leadMagnetEmail,
        first_name: leadMagnetName,
        source: 'linkedin_guide'
      });

      if (response.data.success) {
        setDownloadReady(true);
        toast.success('Success! Your guide is ready to download.');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = () => {
    // Download the actual PDF playbook
    const pdfUrl = 'https://customer-assets.emergentagent.com/job_bf31783e-7e9c-47ad-b065-3e62a7895ee8/artifacts/7c9fmulw_EarnRM_LinkedIn_Lead_Generation_Playbook_Agency_Edition.pdf';
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = 'EarnRM_LinkedIn_Lead_Generation_Playbook_Agency_Edition.pdf';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success('Guide downloaded! Check your downloads folder.');
    setShowLeadMagnet(false);
    setDownloadReady(false);
    setLeadMagnetEmail('');
    setLeadMagnetName('');
  };

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Lead Management',
      description: 'Capture, organize, and nurture leads from LinkedIn and other sources with AI-powered scoring.'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Deal Pipeline',
      description: 'Visual Kanban boards to track deals from prospect to close. Never lose sight of opportunities.'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email Campaigns',
      description: 'AI-assisted email drafting and campaign management. Connect with Kit.com for automation.'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Smart Analytics',
      description: 'Real-time insights into your sales pipeline, team performance, and revenue forecasts.'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'AI Assistant',
      description: 'Let AI score leads, draft emails, and surface insights so you can focus on closing.'
    },
    {
      icon: <Linkedin className="w-6 h-6" />,
      title: 'LinkedIn Integration',
      description: 'Import contacts via CSV or scrape profiles. Build your pipeline from the world\'s largest B2B network.'
    }
  ];

  const testimonials = [
    {
      quote: "earnrm transformed how we handle leads. The AI scoring saves us hours every week.",
      author: "Sarah Chen",
      role: "Head of Sales, TechFlow",
      image: "https://images.unsplash.com/photo-1675526607070-f5cbd71dde92?w=100&h=100&fit=crop&crop=faces"
    },
    {
      quote: "Finally, a CRM that doesn't require a PhD to use. Simple, powerful, effective.",
      author: "Marcus Williams",
      role: "Founder, GrowthLab",
      image: "https://images.unsplash.com/photo-1755190897791-7040dfdb988f?w=100&h=100&fit=crop&crop=faces"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center" data-testid="logo-link">
              <img 
                src="https://customer-assets.emergentagent.com/job_leadhub-app-2/artifacts/9ans91q7_earnrm_mark_purple.svg" 
                alt="earnrm" 
                className="h-10 w-10"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-[#A100FF] transition-colors" data-testid="nav-features">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-[#A100FF] transition-colors" data-testid="nav-pricing">Pricing</a>
              <a href="#testimonials" className="text-slate-600 hover:text-[#A100FF] transition-colors" data-testid="nav-testimonials">Testimonials</a>
              <Link to="/support" className="text-slate-600 hover:text-[#A100FF] transition-colors" data-testid="nav-support">Support</Link>
              <button
                onClick={() => setShowLeadMagnet(true)}
                className="text-[#A100FF] hover:text-purple-700 font-medium transition-colors flex items-center gap-1"
                data-testid="nav-free-guide"
              >
                <Gift className="w-4 h-4" />
                Free Guide
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" data-testid="login-btn">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-[#A100FF] hover:bg-purple-700" data-testid="get-started-btn">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 py-4 px-6">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-slate-600 hover:text-[#A100FF]">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-[#A100FF]">Pricing</a>
              <a href="#testimonials" className="text-slate-600 hover:text-[#A100FF]">Testimonials</a>
              <Link to="/support" className="text-slate-600 hover:text-[#A100FF]">Support</Link>
              <button
                onClick={() => { setShowLeadMagnet(true); setMobileMenuOpen(false); }}
                className="text-[#A100FF] font-medium text-left flex items-center gap-2"
              >
                <Gift className="w-4 h-4" />
                Free LinkedIn Guide
              </button>
              <Link to="/login">
                <Button variant="ghost" className="w-full justify-start">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button className="w-full bg-[#A100FF] hover:bg-purple-700">Get Started Free</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Apple-inspired glass design */}
      <section className="pt-24 pb-16 px-6 relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-white to-slate-50/50" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#A100FF]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100/30 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* Logo Wordmark - larger and prominent */}
              <img 
                src="https://customer-assets.emergentagent.com/job_leadhub-app-2/artifacts/8movyjrt_earnrm_wordmark_purple.svg" 
                alt="earnrm" 
                className="h-12 lg:h-14"
              />
              
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#111111] tracking-tight leading-[1.1]" data-testid="hero-title">
                Your CRM that
                <br />
                <span>p<span className="text-[#A100FF]">AI</span>s</span> you back
              </h1>
              
              <p className="text-lg lg:text-xl text-slate-600 max-w-lg leading-relaxed" data-testid="hero-description">
                The CRM that runs your marketing and sales department. LinkedIn lead generation, 
                AI-powered insights, and team collaboration — without the complexity.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link to="/signup">
                  <Button size="lg" className="bg-[#A100FF] hover:bg-purple-600 h-14 px-8 rounded-2xl text-base font-semibold shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5" data-testid="hero-cta-primary">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 rounded-2xl text-base font-semibold border-2 border-slate-200 hover:border-[#A100FF] hover:text-[#A100FF] bg-white/80 backdrop-blur-sm transition-all"
                  onClick={() => setShowLeadMagnet(true)}
                  data-testid="hero-cta-guide"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Free LinkedIn Guide
                </Button>
              </div>

              {/* Social proof with glass effect */}
              <div className="flex items-center gap-5 pt-4">
                <div className="flex -space-x-3">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces" alt="User" className="w-11 h-11 rounded-full border-2 border-white object-cover shadow-sm" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces" alt="User" className="w-11 h-11 rounded-full border-2 border-white object-cover shadow-sm" />
                  <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=faces" alt="User" className="w-11 h-11 rounded-full border-2 border-white object-cover shadow-sm" />
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=faces" alt="User" className="w-11 h-11 rounded-full border-2 border-white object-cover shadow-sm" />
                  <div className="w-11 h-11 rounded-full border-2 border-white bg-gradient-to-br from-[#A100FF] to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">+500</div>
                </div>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                    <span className="ml-2 text-sm font-semibold text-slate-700">4.9</span>
                  </div>
                  <p className="text-sm text-slate-500">Trusted by 500+ teams</p>
                </div>
              </div>
            </div>

            {/* Hero image with glass card overlay */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100">
                <img
                  src="https://customer-assets.emergentagent.com/job_ec98bdb3-0edd-4c4d-a872-3506f378be5d/artifacts/dxg4md11_Goddess%20of%20Europe.png"
                  alt="earnrm - European Business Excellence"
                  className="w-full"
                  data-testid="hero-image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
              
              {/* Floating glass card - Apple Liquid Glass style */}
              <div className="absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 p-4 border border-white/50">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-[#A100FF] to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">New Lead Scored</p>
                    <p className="text-sm text-slate-500">AI Score: 87/100</p>
                  </div>
                </div>
              </div>
              
              {/* Second floating card - top right */}
              <div className="absolute -top-3 -right-3 lg:-top-4 lg:-right-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 p-3 border border-white/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white rotate-[-45deg]" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Revenue</p>
                    <p className="font-bold text-emerald-600">+34%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Magnet Banner - Apple-inspired glass effect */}
      <section className="py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#A100FF] to-purple-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-3 mb-6 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full">
            <BookOpen className="w-5 h-5 text-white" />
            <span className="text-white/90 font-medium">Free Resource</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4" data-testid="lead-magnet-banner-title">
            LinkedIn Lead Generation Playbook
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto text-lg">
            Learn the exact strategies our top users use to generate 10x more qualified leads from LinkedIn. 
            Includes templates, scripts, and automation tips.
          </p>
          <Button
            size="lg"
            className="bg-white text-[#A100FF] hover:bg-white/90 h-14 px-8 rounded-2xl text-base font-semibold shadow-xl transition-all hover:-translate-y-0.5"
            onClick={() => setShowLeadMagnet(true)}
            data-testid="lead-magnet-banner-btn"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Free Guide
          </Button>
        </div>
      </section>

      {/* Features Section - Apple-inspired */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 bg-purple-100 px-4 py-1.5 rounded-full">
              <Zap className="w-4 h-4 text-[#A100FF]" />
              <span className="text-sm font-medium text-[#A100FF]">Powerful Features</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-4" data-testid="features-title">
              Everything you need to grow
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Inspired by the best of HubSpot and Salesforce, without the bloat. 
              Simple tools that just work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white/70 backdrop-blur-sm border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden group"
                data-testid={`feature-card-${index}`}
              >
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#A100FF] to-purple-600 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 bg-emerald-100 px-4 py-1.5 rounded-full">
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">Simple Pricing</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-4" data-testid="pricing-title">
              Start free, scale when ready
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Start free with your team. Scale when you're ready.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-slate-200 rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 bg-white" data-testid="pricing-free">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Starter</h3>
                <p className="text-slate-500 mb-6">Perfect for small teams getting started</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-slate-900">€0</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-[#A100FF]" />
                    </div>
                    Up to 3 users
                  </li>
                  <li className="flex items-center text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-[#A100FF]" />
                    </div>
                    500 leads
                  </li>
                  <li className="flex items-center text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-[#A100FF]" />
                    </div>
                    Basic AI scoring
                  </li>
                  <li className="flex items-center text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-[#A100FF]" />
                    </div>
                    Email support
                  </li>
                </ul>
                <Link to="/signup">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-2 border-slate-200 hover:border-[#A100FF] hover:text-[#A100FF] font-semibold transition-all" data-testid="pricing-free-btn">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan - Monthly */}
            <Card className="border-2 border-[#A100FF] relative rounded-2xl shadow-xl shadow-purple-500/10 bg-gradient-to-b from-white to-purple-50/30" data-testid="pricing-pro">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-[#A100FF] to-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg shadow-purple-500/30">
                  Most Popular
                </span>
              </div>
              <CardContent className="p-8 pt-10">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Pro</h3>
                <p className="text-slate-500 mb-6">For growing teams that need more power</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold text-slate-900">€15</span>
                  <span className="text-slate-500">/user/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-[#A100FF] flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    Unlimited users
                  </li>
                  <li className="flex items-center text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-[#A100FF] flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    Unlimited leads
                  </li>
                  <li className="flex items-center text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-[#A100FF] flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    Advanced AI features
                  </li>
                  <li className="flex items-center text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-[#A100FF] flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    LinkedIn integration
                  </li>
                  <li className="flex items-center text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-[#A100FF] flex items-center justify-center mr-3">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    Priority support
                  </li>
                </ul>
                <Link to="/signup">
                  <Button className="w-full h-12 rounded-xl bg-[#A100FF] hover:bg-purple-600 font-semibold shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/30" data-testid="pricing-pro-btn">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan - Annual */}
            <Card className="border-slate-200 bg-slate-50" data-testid="pricing-annual">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Pro Annual</h3>
                <p className="text-slate-600 mb-6">Save 20% with annual billing</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-slate-900">€12</span>
                  <span className="text-slate-600">/user/month</span>
                </div>
                <p className="text-[#A100FF] font-medium mb-6">Save 20% annually</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-slate-600">
                    <Check className="w-5 h-5 text-[#A100FF] mr-2" />
                    Everything in Pro
                  </li>
                  <li className="flex items-center text-slate-600">
                    <Check className="w-5 h-5 text-[#A100FF] mr-2" />
                    20% discount
                  </li>
                  <li className="flex items-center text-slate-600">
                    <Check className="w-5 h-5 text-[#A100FF] mr-2" />
                    5% extra for crypto
                  </li>
                  <li className="flex items-center text-slate-600">
                    <Shield className="w-5 h-5 text-purple-500 mr-2" />
                    Stripe, PayPal, ETH
                  </li>
                </ul>
                <Link to="/pricing">
                  <Button variant="outline" className="w-full" data-testid="pricing-annual-btn">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4" data-testid="testimonials-title">
              Loved by sales teams
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              See what our customers have to say about earnrm.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800 border-slate-700" data-testid={`testimonial-${index}`}>
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-lg text-slate-300 mb-6">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-white">{testimonial.author}</p>
                      <p className="text-sm text-slate-400">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-purple-50 to-white" id="mobile-apps">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#A100FF] font-semibold text-sm uppercase tracking-wide">Mobile App</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-2 mb-4">
              Take earnrm everywhere
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Install earnrm on your phone or tablet. Works on iOS, Android, and desktop — no app store needed.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-slate-100 max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <img src="/icon-192.png" alt="earnrm" className="w-16 h-16 rounded-2xl shadow-md" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">earnrm PWA</h3>
                    <p className="text-slate-500 text-sm">Install directly from your browser</p>
                  </div>
                </div>
                <ul className="space-y-3 mb-6 text-slate-600">
                  {['Full CRM on mobile', 'Works offline', 'Push notifications', 'Home screen icon', 'Fast & lightweight'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <p className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-[#A100FF]" /> How to install
                  </p>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p><strong>Chrome / Edge:</strong> Click the install icon in the address bar, or Menu → Install app</p>
                    <p><strong>Safari (iOS):</strong> Tap Share → Add to Home Screen</p>
                    <p><strong>Android:</strong> Tap the "Add to Home Screen" banner that appears</p>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-[#A100FF] hover:bg-purple-700 h-12"
                  data-testid="pwa-install-btn"
                  onClick={() => {
                    if (window.deferredPWAPrompt) {
                      window.deferredPWAPrompt.prompt();
                    } else {
                      toast.success('Open this site in Chrome or Safari and follow the install instructions above!');
                    }
                  }}
                >
                  <Download className="w-5 h-5 mr-2" /> Install earnrm App
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Ready to transform your sales?
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of teams using earnrm to close more deals with less effort.
            Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-[#A100FF] hover:bg-purple-700 h-12 px-8" data-testid="cta-signup">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-12 px-8" data-testid="cta-login">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <img 
                src="https://customer-assets.emergentagent.com/job_leadhub-app-2/artifacts/u9efkh3m_earnrm_logo_horizontal_light_notag_purpleword.png" 
                alt="earnrm" 
                className="h-8 mb-4 brightness-0 invert"
              />
              <p className="text-slate-400 text-sm mb-4">
                Your CRM that p<span className="text-[#A100FF] font-bold">AI</span>s you back. Simplify your workflow, grow your business.
              </p>
              <div className="text-sm text-slate-500">
                <p className="font-medium text-slate-400">Fintery Ltd.</p>
                <p>Canbury Works, Units 6 and 7</p>
                <p>Canbury Business Park, Elm Crescent</p>
                <p>Kingston upon Thames, Surrey, KT2 6HJ, UK</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <a href="#features" className="block text-slate-400 hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="block text-slate-400 hover:text-white transition-colors">Pricing</a>
                <Link to="/support" className="block text-slate-400 hover:text-white transition-colors">Support & FAQ</Link>
                <button
                  onClick={() => setShowLeadMagnet(true)}
                  className="block text-slate-400 hover:text-white transition-colors text-left"
                >
                  Free Guide
                </button>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link to="/support#legal" className="block text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
                <Link to="/support#legal" className="block text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="/support#legal" className="block text-slate-400 hover:text-white transition-colors">Cookie Policy</Link>
                <Link to="/support#contact" className="block text-slate-400 hover:text-white transition-colors">Contact Us</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} earnrm by Fintery Ltd. All rights reserved.
            </p>
            <p className="text-xs text-slate-600">
              support@earnrm.com | Company No. registered in England & Wales
            </p>
          </div>
        </div>
      </footer>

      {/* Lead Magnet Modal */}
      <Dialog open={showLeadMagnet} onOpenChange={setShowLeadMagnet}>
        <DialogContent className="max-w-md" data-testid="lead-magnet-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="w-6 h-6 text-[#A100FF]" />
              Free LinkedIn Lead Generation Playbook
            </DialogTitle>
          </DialogHeader>
          
          {!downloadReady ? (
            <form onSubmit={handleLeadMagnetSubmit} className="space-y-4 pt-4">
              <div className="p-4 bg-purple-50 rounded-lg mb-4">
                <p className="text-sm text-purple-800 font-medium mb-2">What you'll learn:</p>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Profile optimization for lead gen
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Connection request templates
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Engagement & conversion tactics
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Automation best practices
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">First Name</label>
                <Input
                  type="text"
                  placeholder="Your first name"
                  value={leadMagnetName}
                  onChange={(e) => setLeadMagnetName(e.target.value)}
                  data-testid="lead-magnet-name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address *</label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={leadMagnetEmail}
                  onChange={(e) => setLeadMagnetEmail(e.target.value)}
                  required
                  data-testid="lead-magnet-email"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#A100FF] hover:bg-purple-700 h-12"
                disabled={submitting}
                data-testid="lead-magnet-submit"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Get Free Guide
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-slate-500">
                We'll also send you occasional tips. Unsubscribe anytime.
              </p>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-[#A100FF]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">You're all set!</h3>
              <p className="text-slate-600 mb-6">
                Click below to download your LinkedIn Lead Generation Playbook.
              </p>
              <Button
                onClick={handleDownload}
                className="w-full bg-[#A100FF] hover:bg-purple-700 h-12"
                data-testid="lead-magnet-download"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Playbook
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
