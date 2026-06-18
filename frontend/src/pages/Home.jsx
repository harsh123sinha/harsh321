import { useQuery } from '@tanstack/react-query';
import { Building2, Shield, Users, Award } from 'lucide-react';
import api from '../utils/api';
import SearchBar from '../components/search/SearchBar';
import FeaturedPropertiesCarousel from '../components/properties/FeaturedPropertiesCarousel';

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
      {/* Hero — brand navy (only dark band above the fold) */}
      <section className="relative flex min-h-[52vh] items-center overflow-hidden bg-navy sm:min-h-[58vh] md:min-h-[64vh]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_65%_at_50%_-10%,rgba(212,175,55,0.14),transparent_52%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy-light/25 via-transparent to-black/30"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" aria-hidden />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pb-12 sm:pt-16 md:px-8 md:pb-14 md:pt-20">
          <div className="mx-auto mb-8 max-w-4xl text-center sm:mb-10 md:mb-12">
            <h1 className="flex flex-col items-center gap-2 text-balance sm:gap-2.5 md:gap-3">
              <span className="block px-1 text-3xl font-extrabold leading-[1.05] tracking-tight text-gold drop-shadow-[0_2px_28px_rgba(212,175,55,0.28)] xs:text-4xl sm:text-6xl sm:leading-none md:text-7xl lg:text-8xl">
                HarshToLetServices
              </span>
              <span className="block text-sm font-semibold leading-snug tracking-wide text-white/95 sm:text-base md:text-lg">
                Find, Visit, Move In
              </span>
            </h1>

            <div
              className="mx-auto mt-4 h-px w-12 bg-gradient-to-r from-transparent via-gold/75 to-transparent sm:mt-5 md:mt-6 md:w-16"
              aria-hidden
            />

            <p className="text-pretty mx-auto mt-4 max-w-md px-1 text-xs font-normal leading-relaxed text-white/85 sm:mt-5 sm:max-w-lg sm:text-sm md:mt-6 md:max-w-xl md:text-sm">
              Buy, Rent, or Sell Properties Across Patna with Ease
            </p>
          </div>

          <div className="mx-auto flex w-full justify-center px-1 sm:px-2">
            <div className="w-full max-w-4xl rounded-xl border border-white/25 bg-white/98 px-2 py-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] ring-1 ring-white/40 backdrop-blur-sm sm:px-3 sm:py-2 md:max-w-5xl md:px-4 md:py-2.5">
              <SearchBar />
            </div>
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

      {/* Featured — same canvas; property cards supply white */}
      <section className={`border-b border-stone-200/80 ${canvas} py-12 sm:py-16`}>
        <div className={sectionShell}>
          <div className={sectionAccent} aria-hidden />
          <h2 className={sectionTitle}>Featured Properties</h2>
          <p className={sectionSubtitle}>Handpicked properties just for you</p>

          <div className="mt-8 sm:mt-10">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-gold" />
              </div>
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

      {/* CTA — navy with depth; gold ties to hero */}
      <section className="relative isolate overflow-hidden bg-navy py-14 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,rgba(212,175,55,0.1),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-navy-light/15"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" aria-hidden />

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
              className="touch-target inline-flex items-center justify-center rounded-lg bg-gold px-8 py-3 text-center text-sm font-bold text-navy shadow-md transition hover:bg-gold-light sm:py-3.5 sm:text-base"
            >
              Get Started
            </a>
            <a
              href="/rent"
              className="touch-target inline-flex items-center justify-center rounded-lg border border-white/40 bg-white/5 px-8 py-3 text-center text-sm font-semibold text-white backdrop-blur-[2px] transition hover:border-gold/60 hover:bg-white/10 sm:py-3.5 sm:text-base"
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
                className="flex flex-col rounded-2xl border border-stone-200/90 bg-white p-6 text-center shadow-sm transition hover:border-gold/35 hover:shadow-md"
              >
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold/12 ring-1 ring-gold/20 sm:h-16 sm:w-16">
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
