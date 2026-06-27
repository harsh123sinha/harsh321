import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import api from '../utils/api';
import FeaturedProjectsCarousel from '../components/properties/FeaturedProjectsCarousel';
import BrandLoader from '../components/ui/BrandLoader';

const canvas = 'bg-stone-100';
const sectionShell = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

const Projects = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get('/public/projects');
      return response.data;
    },
  });

  const projects = data?.projects || [];

  return (
    <div className={`min-h-screen ${canvas}`}>
      <div className="bg-[#0a1020] text-white pb-8 pt-8 sm:pb-10 sm:pt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Featured Projects</h1>
          <p className="text-white/75 text-sm sm:text-base">
            Enclaves & apartment developments across Patna
          </p>
        </div>
      </div>

      <div className={`${sectionShell} py-10 sm:py-14`}>
        {isLoading ? (
          <BrandLoader />
        ) : projects.length > 0 ? (
          <FeaturedProjectsCarousel projects={projects} />
        ) : (
          <div className="py-16 text-center">
            <Building2 className="mx-auto mb-4 h-16 w-16 text-stone-400" />
            <p className="text-stone-600">No featured projects yet.</p>
            <Link to="/" className="mt-4 inline-block text-gold hover:underline">
              Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
