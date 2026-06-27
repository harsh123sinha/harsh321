import { useQuery } from '@tanstack/react-query';
import { Building2, Shield, Users, Award } from 'lucide-react';
import api from '../utils/api';
import SearchBar from '../components/search/SearchBar';
import FeaturedPropertiesCarousel from '../components/properties/FeaturedPropertiesCarousel';
import FeaturedProjectsCarousel from '../components/properties/FeaturedProjectsCarousel';
import BrandLoader from '../components/ui/BrandLoader';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/** One neutral surface after the hero — navy + gold accents only on hero, CTA, and highlights */
const canvas = 'bg-stone-100';
const sectionShell = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';
const sectionTitle =
  'text-center text-2xl font-bold tracking-tight text-navy sm:text-3xl md:text-4xl';
const sectionAccent = 'mx-auto mb-3 h-0.5 w-12 rounded-full bg-gold sm:mb-4 sm:w-14';
const sectionSubtitle = 'mt-2 text-center text-sm text-stone-600 sm:text-base';

const Home = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['homeData'],
    queryFn: async () => {
      const response = await api.get('/public/home');
      return response.data;
    },
  });

  const features = [
    {
      icon: Shield,
      title: 'Verified Properties',
      description: 'All properties are verified by our team',
    },
    {
      icon: Users,
      title: 'Trusted Agents',
      description: 'Work with certified real estate agents',
    },
    {
      icon: Building2,
      title: 'Wide Selection',
      description: 'Thousands of properties across Patna',
    },
    {
      icon: Award,
      title: 'Best Deals',
      description: 'Get the best prices in the market',
    },
  ];

  return (
    <div className={`min-h-screen ${canvas}`}>
      {/* Hero — plain dark band + underline search */}
      <section className="relative flex min-h-[54vh] items-center overflow-hidden bg-[#0a1020] sm:min-h-[60vh] md:min-h-[66vh]">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" aria-hidden />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pb-12 sm:pt-16 md:px-8 md:pb-14 md:pt-20">
          <div className="mx-auto mb-7 max-w-4xl text-center sm:mb-9 md:mb-11">
            <span className="htls-hero-fade-up htls-hero-fade-up-1 mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md sm:mb-5 sm:px-4 sm:py-1.5 sm:text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.9)]" />
              Patna&apos;s trusted property platform
            </span>

            <h1 className="flex flex-col items-center gap-2 text-balance sm:gap-2.5 md:gap-3">
              <span className="htls-shimmer-text htls-hero-fade-up htls-hero-fade-up-2 block px-1 text-3xl font-extrabold leading-[1.05] tracking-tight xs:text-4xl sm:text-6xl sm:leading-none md:text-7xl lg:text-8xl">
                HarshToLetServices
              </span>
              <span className="htls-shimmer-text htls-hero-fade-up htls-hero-fade-up-3 block text-sm font-semibold leading-snug tracking-[0.2em] sm:text-base md:text-lg md:tracking-[0.24em]">
                Find · Visit · Move In
              </span>
            </h1>

            <div
              className="htls-hero-glow-line mx-auto mt-4 h-px w-14 origin-center bg-gradient-to-r from-transparent via-gold to-transparent sm:mt-5 md:mt-6 md:w-20"
              aria-hidden
            />

            <p className="htls-hero-fade-up htls-hero-fade-up-4 text-pretty mx-auto mt-4 max-w-md px-1 text-xs font-normal leading-relaxed text-white/75 sm:mt-5 sm:max-w-lg sm:text-sm md:mt-6 md:max-w-xl">
              Buy, rent, or sell across Patna — verified listings, trusted agents, zero hassle.
            </p>
          </div>

          <div className="htls-hero-fade-up htls-hero-fade-up-4 mx-auto w-full max-w-6xl px-1 sm:px-2">
            <SearchBar variant="underline" />
          </div>
        </div>
      </section>

      {/* Stats — same canvas as rest of page; soft inset panel */}
      {data?.stats && (
        <section className={`border-b border-stone-200/80 ${canvas} py-10 sm:py-12`}>
          <div className={sectionShell}>
            <div className="mx-auto max-w-4xl rounded-2xl border border-stone-200/90 bg-white/90 px-4 py-6 shadow-sm sm:px-8 sm:py-8">
              <div className="grid grid-cols-3 gap-4 sm:gap-6 sm:divide-x sm:divide-stone-200/70">
                <div className="text-center sm:px-4">
                  <p className="mb-1 text-2xl font-bold tabular-nums text-gold sm:mb-2 sm:text-3xl md:text-4xl">
                    {data.stats.totalProperties}+
                  </p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-stone-600 sm:text-xs md:text-sm">
                    Properties
                  </p>
                </div>
                <div className="text-center sm:px-4">
                  <p className="mb-1 text-2xl font-bold tabular-nums text-gold sm:mb-2 sm:text-3xl md:text-4xl">
                    {data.stats.totalUsers}+
                  </p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-stone-600 sm:text-xs md:text-sm">
                    Happy Clients
                  </p>
                </div>
                <div className="text-center sm:px-4">
                  <p className="mb-1 text-2xl font-bold tabular-nums text-gold sm:mb-2 sm:text-3xl md:text-4xl">
                    {data.stats.yearsOfExperience}+
                  </p>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-stone-600 sm:text-xs md:text-sm">
                    Years Experience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Projects — above individual properties */}
      <section className={`border-b border-stone-200/80 ${canvas} py-12 sm:py-16`}>
        <div className={sectionShell}>
          <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end">
            <div className="text-center sm:text-left">
              <div className={sectionAccent} aria-hidden />
              <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl md:text-4xl">
                Featured Projects
              </h2>
              <p className="mt-2 text-sm text-stone-600 sm:text-base">
                New enclaves & apartment developments
              </p>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-sm font-semibold text-gold hover:text-navy"
            >
              See all projects
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div>
            {isLoading ? (
              <BrandLoader />
            ) : data?.featuredProjects?.length > 0 ? (
              <FeaturedProjectsCarousel projects={data.featuredProjects.slice(0, 12)} />
            ) : (
              <div className="py-10 text-center">
                <Building2 className="mx-auto mb-3 h-12 w-12 text-stone-400" />
                <p className="text-stone-600 text-sm">No projects listed yet</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured — same canvas; property cards supply white */}
      <section className={`border-b border-stone-200/80 ${canvas} py-12 sm:py-16`}>
        <div className={sectionShell}>
          <div className={sectionAccent} aria-hidden />
          <h2 className={sectionTitle}>Featured Properties</h2>
          <p className={sectionSubtitle}>Handpicked properties just for you</p>

          <div className="mt-8 sm:mt-10">
            {isLoading ? (
              <BrandLoader />
            ) : data?.featuredProperties?.length > 0 ? (
              <FeaturedPropertiesCarousel
                properties={data.featuredProperties.slice(0, 20)}
              />
            ) : (
              <div className="py-12 text-center">
                <Building2 className="mx-auto mb-4 h-16 w-16 text-stone-400" />
                <p className="text-stone-600">No featured properties available</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA — matches hero */}
      <section className="relative isolate overflow-hidden bg-[#0a1020] py-14 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" aria-hidden />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-white sm:mb-5 sm:text-3xl md:text-4xl">
            Ready to Find Your Dream Property?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-white/75 sm:mb-10 sm:text-base md:text-lg">
            Join thousands of satisfied customers and start your property search today
          </p>
          <div className="mx-auto flex max-w-md flex-col justify-center gap-3 sm:max-w-lg sm:flex-row sm:gap-4">
            <a
              href="/signup"
              className="touch-target inline-flex items-center justify-center rounded-full bg-gold px-8 py-3 text-center text-sm font-bold text-navy shadow-[0_8px_32px_rgba(212,175,55,0.35)] transition hover:bg-gold-light hover:shadow-[0_12px_40px_rgba(212,175,55,0.45)] sm:py-3.5 sm:text-base"
            >
              Get Started
            </a>
            <a
              href="/rent"
              className="touch-target inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-8 py-3 text-center text-sm font-semibold text-white backdrop-blur-md transition hover:border-gold/50 hover:bg-white/10 sm:py-3.5 sm:text-base"
            >
              Browse Properties
            </a>
          </div>
        </div>
      </section>

      {/* Why Choose — back to same canvas; white cards */}
      <section className={`${canvas} pb-16 pt-12 sm:pb-20 sm:pt-16`}>
        <div className={sectionShell}>
          <div className={sectionAccent} aria-hidden />
          <h2 className={sectionTitle}>Why Choose Us?</h2>
          <p className={sectionSubtitle}>What makes HarshToLetServices different</p>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group flex flex-col rounded-2xl border border-stone-200/90 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5"
              >
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/15 to-gold/5 ring-1 ring-gold/25 transition group-hover:ring-gold/40 sm:h-16 sm:w-16">
                  <feature.icon className="h-7 w-7 text-gold sm:h-8 sm:w-8" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-navy sm:text-xl">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-stone-600 sm:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
