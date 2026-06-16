import React, { useState } from 'react';
import { useCall } from '../hooks/useCall';
import {
  Video,
  Keyboard,
  ArrowRight,
  LogOut,
  Sparkles,
  Terminal,
  Briefcase,
  GraduationCap,
  MapPin,
  Code,
  Cpu,
  Globe,
  ArrowLeft,
  ClipboardList,
  Linkedin
} from 'lucide-react';

interface HomeProps {
  onNavigateToRoom: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigateToRoom }) => {
  const { createMeeting, username, logout, login, isAuthenticated } = useCall();
  const [meetingIdInput, setMeetingIdInput] = useState<string>('');
  const [displayNameInput, setDisplayNameInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showCallFlow, setShowCallFlow] = useState<boolean>(false);

  const handleCreate = async () => {
    try {
      setLoading(true);
      setLocalError(null);
      const newRoomId = await createMeeting();
      console.log('[HOME]: Meeting created successfully: ', newRoomId);
      onNavigateToRoom(newRoomId);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to create meeting room.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = meetingIdInput.trim().toLowerCase();

    // Validate format (xxx-xxx-xxx)
    const roomRegex = /^[a-z]{3}-[a-z]{3}-[a-z]{3}$/;
    if (!roomRegex.test(cleanId)) {
      setLocalError('Invalid Meeting ID format. Must be like "abc-def-ghi"');
      return;
    }

    setLocalError(null);
    onNavigateToRoom(cleanId);
  };

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayNameInput.trim()) {
      login(displayNameInput.trim());
    }
  };

  const projects = [
    {
      title: 'Video Meeting App',
      description: 'A premium, secure video meeting application featuring instant room creation, custom display-name lobbies, screen sharing, and interactive live chat.',
      tags: ['React.js', 'Node.js', 'Express.js', 'WebSockets', 'Tailwind CSS'],
      icon: Video,
    },
    {
      title: 'Speech Evaluator',
      description: 'An AI-powered spoken language assessment platform that evaluates user speech patterns, pronunciation, grammar, and fluency in real-time.',
      tags: ['React.js', 'Node.js', 'Azure Speech SDK', 'Whisper AI', 'REST API'],
      icon: Cpu,
    },
    {
      title: 'CoachAI',
      description: 'Intelligent virtual coaching assistant that interacts with users utilizing conversational AI models, speech-to-text, and voice generation.',
      tags: ['React.js', 'Node.js', 'ChatGPT API', 'Whisper AI', 'Speech-to-Text', 'Text-to-Speech'],
      icon: Sparkles,
    },
    {
      title: 'Resume Evaluator',
      description: 'Automated candidate vetting platform that parses resumes, matches applicant profiles with job descriptions, and returns comprehensive scoring reports.',
      tags: ['MERN Stack', 'AI Integration', 'REST API Development', 'Responsive UI'],
      icon: ClipboardList,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />

      {/* Top Navbar */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-dark-900/50 backdrop-blur-md relative z-10">
        {showCallFlow ? (
          <button
            onClick={() => setShowCallFlow(false)}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portfolio</span>
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <Terminal className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-sm tracking-wider text-white leading-none">SHIVAM LODHI</span>
              <span className="text-[9px] text-brand-400 font-bold tracking-wider uppercase mt-1">Full Stack Developer</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <>
              <span className="text-xs text-slate-400 font-semibold bg-white/5 border border-white/10 rounded-full px-3 py-1">
                Hi, <span className="text-slate-100">{username}</span>
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors bg-white/5 border border-white/10 rounded-lg p-1.5 px-3 cursor-pointer font-bold"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 relative z-10 flex items-center justify-center">
        {!showCallFlow ? (
          /* PORTFOLIO VIEW */
          <div className="max-w-5xl w-full flex flex-col gap-16 py-8 animate-fade-in">
            {/* Hero / Pitch Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Text & CTA */}
              <div className="lg:col-span-7 flex flex-col text-left">
                <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold rounded-full px-3.5 py-1 self-start mb-6 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-brand-400 animate-spin" /> Available for Roles
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4">
                  Shivam Lodhi
                </h1>
                <h2 className="text-lg md:text-xl font-bold text-slate-300 mb-6">
                  Full Stack Developer <span className="text-slate-500 font-normal">|</span> <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-indigo-400">MERN & AI Specialist</span>
                </h2>

                <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium max-w-xl">
                  Post Graduate (MCA) Full Stack Developer with 2+ years of professional experience building high-performance MERN stack applications, robust REST APIs, and integrating sophisticated AI voice and text models with cloud architectures.
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-400 mb-10">
                  <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2">
                    <MapPin className="w-3.5 h-3.5 text-brand-400" /> Gwalior, India
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Kommonify Ventures
                  </span>
                  <a
                    href="https://www.linkedin.com/in/shivamlodhi2001/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:border-brand-500/30 hover:bg-white/10 transition-all rounded-xl px-3.5 py-2 text-slate-300 hover:text-white"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-blue-400" /> LinkedIn Profile
                  </a>
                </div>

                <button
                  onClick={() => setShowCallFlow(true)}
                  className="glass-btn-primary self-start px-8 py-4 flex items-center justify-center gap-3 font-bold tracking-wide text-sm shadow-xl shadow-brand-500/20 cursor-pointer"
                >
                  <Video className="w-5 h-5 animate-pulse" />
                  <span>Start Video Meeting App</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Right Column: Quick Stats Grid */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                {[
                  { value: '2+ Years', label: 'Professional Exp.', icon: Briefcase, color: 'text-brand-400' },
                  { value: '4+ Deployed', label: 'Production Projects', icon: Cpu, color: 'text-indigo-400' },
                  { value: 'MERN Stack', label: 'Core Specialization', icon: Code, color: 'text-emerald-400' },
                  { value: 'AI Integration', label: 'ChatGPT, Whisper & TTS', icon: Sparkles, color: 'text-pink-400' },
                  { value: 'AWS Cloud', label: 'EC2 & Amplify', icon: Globe, color: 'text-amber-400' },
                  { value: 'MCA Graduate', label: 'MITS Gwalior (2024)', icon: GraduationCap, color: 'text-cyan-400' },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="glass-card p-5 rounded-2xl border-white/5 flex flex-col justify-between h-28 hover:-translate-y-1 transition-all duration-300 group hover:border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <stat.icon className={`w-5 h-5 ${stat.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-500">Highlight</span>
                    </div>
                    <div>
                      <div className="text-base font-extrabold text-white">{stat.value}</div>
                      <div className="text-[9px] font-bold text-slate-400 mt-0.5">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Projects Section */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-1.5 text-left">
                <span className="text-[10px] font-extrabold text-brand-400 uppercase tracking-widest">Portfolio</span>
                <h3 className="text-2xl font-extrabold text-white">Featured Projects</h3>
                <div className="w-10 h-0.5 bg-brand-500 mt-1 rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, idx) => (
                  <div
                    key={idx}
                    className="glass-card p-6 rounded-2xl border-white/5 flex flex-col justify-between hover:border-brand-500/20 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-9 h-9 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
                          <project.icon className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-md">Project</span>
                      </div>
                      <h4 className="text-base font-bold text-white mb-2">{project.title}</h4>
                      <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium">{project.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[9px] font-bold bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Experience details grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Side: Specializations & Timeline */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="glass-card p-6 rounded-2xl border-white/5 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-3">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Full Stack Development',
                      'MERN Stack',
                      'AI Integration',
                      'REST API Development',
                      'Cloud Deployment',
                      'Responsive Web Applications'
                    ].map((spec, sIdx) => (
                      <span key={sIdx} className="text-[10px] font-bold bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-lg px-3 py-1.5">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border-white/5 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-3">Education & Experience</h4>
                  <div className="flex gap-3.5 items-start">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                      <GraduationCap className="w-4.5 h-4.5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">Master of Computer Applications (MCA)</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5">Madhav Institute of Technology & Science (MITS)</div>
                      <div className="text-[9px] text-slate-500 font-semibold mt-0.5">Graduation Year: 2024 | Gwalior, India</div>
                    </div>
                  </div>
                  <div className="flex gap-3.5 items-start border-t border-white/5 pt-4">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <Briefcase className="w-4.5 h-4.5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">Full Stack Developer (MERN)</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5">Kommonify Ventures (Kommon School)</div>
                      <div className="text-[9px] text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-0.5 rounded-full inline-block mt-1.5">Current Position</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Detailed Tech Cloud */}
              <div className="lg:col-span-7">
                <div className="glass-card p-6 rounded-2xl border-white/5 flex flex-col gap-6 h-full">
                  <h4 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-3">Technical Toolkit</h4>
                  {[
                    { category: 'Core Technologies', skills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'MySQL', 'JavaScript', 'Redux', 'WebSockets'], color: 'border-brand-500/20 text-brand-300' },
                    { category: 'AI & Cloud', skills: ['ChatGPT Integration', 'Azure Speech SDK', 'Whisper AI', 'Speech-to-Text', 'Text-to-Speech', 'AWS EC2', 'AWS Amplify'], color: 'border-indigo-500/20 text-indigo-300' },
                    { category: 'Deployment & Tooling', skills: ['AWS EC2', 'AWS Amplify', 'Git', 'GitHub', 'CI/CD Pipelines'], color: 'border-emerald-500/20 text-emerald-300' }
                  ].map((cat, cIdx) => (
                    <div key={cIdx} className="flex flex-col gap-2.5">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{cat.category}</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className={`text-[10px] font-semibold bg-white/5 border rounded-lg px-2.5 py-1 ${cat.color}`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : !isAuthenticated ? (
          /* INLINE NAME REGISTRATION VIEW */
          <div className="max-w-md w-full p-8 glass-card rounded-2xl border-white/5 relative overflow-hidden shadow-2xl animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-500 to-indigo-500" />

            <div className="text-center mb-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-500/20">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-wide">Enter the Arena</h1>
              <p className="text-slate-400 text-xs mt-1.5 font-medium leading-relaxed">
                Please enter your display name to access the video calling lobby.
              </p>
            </div>

            <form onSubmit={handleInlineSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  Your Display Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={displayNameInput}
                    onChange={(e) => setDisplayNameInput(e.target.value)}
                    placeholder="e.g. Shivam Lodhi"
                    className="w-full glass-input text-sm"
                    maxLength={20}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!displayNameInput.trim()}
                className="w-full glass-btn-primary py-3 flex items-center justify-center font-bold tracking-wide cursor-pointer"
              >
                Get Started
              </button>
            </form>
          </div>
        ) : (
          /* VIDEO MEET APP LOBBY */
          <div className="max-w-md w-full flex flex-col gap-6 animate-fade-in">
            {localError && (
              <div className="bg-rose-600/15 border border-rose-500/20 rounded-xl p-4 text-xs font-semibold text-rose-400 w-full text-center">
                {localError}
              </div>
            )}

            {/* Action Card Forms */}
            <div className="glass-card p-8 rounded-2xl border-white/5 flex flex-col gap-8 shadow-2xl relative w-full">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-500 to-indigo-500" />

              {/* Create Meeting */}
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-bold tracking-wider text-slate-300 uppercase">Start a New Meeting</h2>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full glass-btn-primary py-3.5 flex items-center justify-center gap-2.5 font-bold tracking-wide shadow-brand-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Video className="w-5 h-5 animate-pulse" />
                  {loading ? 'Generating Room...' : 'Create Meeting'}
                </button>
              </div>

              {/* Divider line */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Join Meeting */}
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-bold tracking-wider text-slate-300 uppercase">Join an Existing Meeting</h2>
                <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    {/* <Keyboard className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" /> */}
                    <input
                      type="text"
                      required
                      value={meetingIdInput}
                      onChange={(e) => setMeetingIdInput(e.target.value)}
                      placeholder="Enter ID: e.g. abc-def-ghi"
                      className="w-full glass-input pl-12 py-3 text-sm font-semibold tracking-wider placeholder:tracking-normal placeholder:font-normal"
                      maxLength={11}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!meetingIdInput.trim()}
                    className="glass-btn-secondary px-6 py-3.5 flex items-center justify-center gap-2 cursor-pointer text-slate-200 border-white/10 hover:border-brand-500/30 hover:text-white"
                  >
                    <span className="font-bold tracking-wide">Join</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer credits */}
      <footer className="h-14 border-t border-white/5 flex items-center justify-between px-6 text-[10px] text-slate-500 font-medium z-10">
        <span>Designed & Developed by Shivam Lodhi. © 2026.</span>
        <a
          href="https://www.linkedin.com/in/shivamlodhi2001/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-brand-400 transition-colors"
        >
          <Linkedin className="w-3.5 h-3.5 text-blue-400" /> LinkedIn Profile
        </a>
      </footer>
    </div>
  );
};
