import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F6F7F5]">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center bg-[#F6F7F5]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#4F6F6F] rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
            <span className="text-white font-bold text-2xl italic">H</span>
          </div>
          <span className="text-3xl font-bold text-[#1F2933] tracking-tight">HealthScan</span>
        </div>
        <div className="hidden lg:flex space-x-10 text-[#4F6F6F] font-bold">
          <a href="#features" className="hover:text-[#8FB9A8] transition-colors">Platform</a>
          <a href="#solutions" className="hover:text-[#8FB9A8] transition-colors">Solutions</a>
          <a href="#about" className="hover:text-[#8FB9A8] transition-colors">Enterprise</a>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/login" className="text-[#4F6F6F] font-bold hover:text-[#8FB9A8] transition-colors">
            Login
          </Link>
          <Link href="/signup" className="btn-primary px-8">
            Join HealthScan
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-16 pb-24 flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2 space-y-10 animate-in fade-in slide-in-from-left duration-1000">
          <div className="inline-block px-5 py-2 bg-[#4F6F6F]/10 border border-[#4F6F6F]/20 rounded-full text-[#4F6F6F] text-sm font-bold tracking-wide uppercase">
            SECURE HEALTHCARE ECOSYSTEM
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-[#1F2933] leading-[1.1]">
            Secure Digital Pathology <br />
            <span className="text-[#4F6F6F]">Report Management</span>
          </h1>
          <p className="text-xl text-[#6B7280] max-w-xl leading-relaxed font-medium">
            HealthScan connects laboratories, doctors, and patients through a secure digital system, enabling instant access, seamless sharing, and AI-driven health insights.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
            <Link href="/signup" className="btn-primary text-xl py-5 px-10 shadow-xl shadow-[#4F6F6F]/20">
              Get Started for Free
            </Link>
            <button className="btn-secondary text-xl py-5 px-10 flex items-center justify-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#4F6F6F]/10 flex items-center justify-center">
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-[#4F6F6F] border-b-[5px] border-b-transparent ml-1" />
              </span>
              <span>Watch Product Demo</span>
            </button>
          </div>
          <div className="flex items-center space-x-5 pt-8">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-2xl border-4 border-[#F6F7F5] bg-[#8FB9A8] shadow-md flex items-center justify-center text-[#1F2933] font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-lg text-[#6B7280] font-bold tracking-tight">Trusted by 10k+ medical practitioners</p>
          </div>
        </div>

        <div className="lg:w-1/2 relative animate-in fade-in slide-in-from-right duration-1000">
          <div className="relative z-10 glass-card p-4 shadow-2xl border-white/50 bg-white/40 backdrop-blur-xl">
            <div className="rounded-2xl overflow-hidden shadow-2xl relative aspect-[4/3]">
              <Image 
                src="/images/hero-illustration.png" 
                alt="HealthScan Medical Dashboard Illustration" 
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          <div className="absolute -top-16 -right-16 w-80 h-80 bg-[#4F6F6F]/15 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-[#8FB9A8]/20 rounded-full blur-3xl -z-10" />
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="bg-white py-32 border-y border-[#E2E8F0]">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-[#1F2933] mb-6">Empowering Modern Pathology</h2>
            <p className="text-xl text-[#6B7280] font-medium leading-relaxed">Everything you need to manage, analyze, and share medical reports in a unified digital platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Secure Report Storage',
                desc: 'Military-grade encryption for all medical records. HIPAA-compliant cloud storage ensuring your data is always safe and accessible.',
                icon: '🔒'
              },
              {
                title: 'Role-Based Access',
                desc: 'Tailored experiences for Doctors, Patients, and Pathology Labs. Granular permissions ensure privacy and efficient workflow.',
                icon: '👥'
              },
              {
                title: 'Instant Report Access',
                desc: 'No more waiting for physical copies. Get real-time notifications and download digital reports as soon as they are ready.',
                icon: '⚡'
              },
              {
                title: 'Voice Assistance',
                desc: 'Hands-free report summaries and navigation. Multilingual support allows patients to understand reports in their preferred language.',
                icon: '🎙️'
              },
              {
                title: 'AI-Based Insights',
                desc: 'Automated trend analysis and diagnostic highlights. Our AI helps identify critical patterns from historical report data.',
                icon: '🧠'
              },
              {
                title: 'Unified Ecosystem',
                desc: 'Connecting laboratories, clinics, and patients in one seamless network for faster communication and better healthcare outcomes.',
                icon: '🤝'
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-[#F6F7F5]/50 border border-transparent hover:border-[#4F6F6F]/20 hover:bg-white hover:shadow-2xl hover:shadow-[#4F6F6F]/5 transition-all duration-500 group">
                <div className="w-16 h-16 bg-white rounded-2xl mb-8 flex items-center justify-center text-3xl shadow-lg border border-[#E2E8F0] group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-[#1F2933] mb-4">{feature.title}</h3>
                <p className="text-[#6B7280] leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="bg-[#F6F7F5]/30 py-32">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-black text-[#1F2933] mb-6 tracking-tight">Built for Every Stakeholder</h2>
            <p className="text-xl text-[#6B7280] font-medium leading-relaxed">HealthScan creates a seamless flow of information across the entire diagnostic journey.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: 'Patients',
                desc: 'Access your full diagnostic history instantly. Securely share reports with specialist teams and track health trends over time.',
                color: 'bg-[#8FB9A8]',
                label: 'Personal Health Portal',
                image: '/images/patient-journey.png'
              },
              {
                title: 'Physicians',
                desc: 'Get instant notifications when lab results are ready. Review histories, visualize data, and manage patient files from a single dashboard.',
                color: 'bg-[#4F6F6F]',
                label: 'Clinical Decision Hub',
                image: '/images/physician-hub.png'
              },
              {
                title: 'Pathology Labs',
                desc: 'Automate report distribution. Securely upload digital records, manage patient directories, and monitor laboratory throughput.',
                color: 'bg-[#1F2933]',
                label: 'LIMS Integration',
                image: '/images/lab-integration.png'
              }
            ].map((item, idx) => (
              <div key={idx} className="group rounded-[40px] bg-white shadow-xl shadow-[#4F6F6F]/5 border border-[#E2E8F0] hover:border-[#4F6F6F]/30 transition-all duration-500 overflow-hidden flex flex-col items-stretch">
                <div className="relative h-60 overflow-hidden">
                   <Image 
                      src={item.image} 
                      alt={item.title} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                     <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em]">
                       {item.label}
                     </div>
                   </div>
                </div>
                <div className="p-10 flex flex-col h-full">
                  <h3 className="text-3xl font-black text-[#1F2933] mb-4 tracking-tight">{item.title}</h3>
                  <p className="text-[#6B7280] leading-relaxed font-medium text-lg mb-8 flex-grow">{item.desc}</p>
                  <div className="pt-6 border-t border-[#F1F5F9]">
                    <Link href="/signup" className="text-[#4F6F6F] font-black uppercase text-xs tracking-widest hover:text-[#8FB9A8] flex items-center gap-3 transition-colors">
                      Explore Dashboard
                      <span className="text-xl">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-20 border-t border-[#E2E8F0]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-12">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#4F6F6F] rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                <span className="text-white font-bold text-2xl italic">H</span>
              </div>
              <span className="text-3xl font-black text-[#1F2933] tracking-tight">HealthScan</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-[#4F6F6F] font-bold">
              <a href="#" className="hover:text-[#8FB9A8] transition-colors">Product</a>
              <a href="#" className="hover:text-[#8FB9A8] transition-colors">Security</a>
              <a href="#" className="hover:text-[#8FB9A8] transition-colors">API Docs</a>
              <a href="#" className="hover:text-[#8FB9A8] transition-colors">Contact</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-[#F1F5F9] gap-6">
            <p className="text-[#6B7280] font-medium">&copy; 2026 HealthScan Digital Health. Licensed for clinical use.</p>
            <div className="flex space-x-8 text-[#6B7280] font-bold text-sm">
              <a href="#" className="hover:text-[#1F2933]">Privacy Policy</a>
              <a href="#" className="hover:text-[#1F2933]">Terms of Service</a>
              <a href="#" className="hover:text-[#1F2933]">Compliance (HIPAA)</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
