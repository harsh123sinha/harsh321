import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Building2, ChevronLeft, ChevronRight, X, FileText, ArrowLeft } from 'lucide-react';
import api, { getImageUrl } from '../utils/api';
import {
  formatBhkOptions,
  formatSqftRange,
  formatProjectPriceFrom,
  getProjectTypeLabel,
  parseImageUrls,
  DEFAULT_SITE_INQUIRY_PHONE,
} from '../utils/helpers';
import MaskedPhoneActionButton from '../components/properties/MaskedPhoneActionButton';
import FeaturedProjectsCarousel from '../components/properties/FeaturedProjectsCarousel';
import BrandLoader from '../components/ui/BrandLoader';
import { usePageSeo } from '../hooks/usePageSeo';
import { buildProjectJsonLd } from '../constants/seoConfig';

const CONTACT_PHONE =
  import.meta.env.VITE_CONTACT_OFFICE_1 || DEFAULT_SITE_INQUIRY_PHONE;

const ProjectDetail = () => {
  const { id } = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    setCurrentImageIndex(0);
    setShowLightbox(false);
  }, [id]);

  const { data, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await api.get(`/public/projects/${id}`);
      return response.data;
    },
  });

  const project = data?.project;
  const images = project ? parseImageUrls(project.image_url) : [];
  const mainImage = images[0] || null;
  const cityLabel = project?.city || 'Patna';

  usePageSeo(
    project
      ? {
          title: `${project.title} — New Project in ${cityLabel} | Harsh To Let Services`,
          description: `${project.title} in ${cityLabel} — ${getProjectTypeLabel(project.project_type)}. ${(project.description || '').slice(0, 140)}…`,
          path: `/projects/${id}`,
          image: mainImage ? getImageUrl(mainImage) : undefined,
          keywords: `new project Patna, ${cityLabel} apartment, real estate project Bihar, enclave Patna`,
          jsonLd: buildProjectJsonLd(project, `/projects/${id}`),
          jsonLdId: 'seo-jsonld-page',
        }
      : null
  );

  if (isLoading) {
    return <BrandLoader fullScreen />;
  }

  const relatedProjects = data?.relatedProjects || [];

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-navy mb-2">Project Not Found</h2>
          <Link to="/projects" className="text-gold hover:underline">
            Browse all projects
          </Link>
        </div>
      </div>
    );
  }

  const bhkLabel = formatBhkOptions(project.bhk_options);
  const sqftLabel = formatSqftRange(project.sqft_from, project.sqft_to);
  const pdfUrl = project.enclave_pdf_url?.trim() || '';

  const nextImage = () => setCurrentImageIndex((p) => (p + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((p) => (p - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            All projects
          </Link>
        </div>
      </div>

      {/* Gallery */}
      <div className="bg-white">
        <div className="max-w-5xl mx-auto">
          {images.length > 0 ? (
            <div className="relative aspect-[16/10] sm:aspect-[2/1] bg-navy/10">
              <img
                src={getImageUrl(images[currentImageIndex])}
                alt={project.title}
                className="h-full w-full object-cover cursor-pointer"
                onClick={() => setShowLightbox(true)}
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white sm:left-4 sm:p-3"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white sm:right-4 sm:p-3"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center bg-navy/5">
              <Building2 className="h-16 w-16 text-stone-300" />
            </div>
          )}
        </div>
      </div>

      {/* Main content — single column, no lead-capture sidebar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-full bg-navy px-3 py-0.5 text-xs font-semibold text-white">
              {getProjectTypeLabel(project.project_type)}
            </span>
            {project.featured ? (
              <span className="rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-navy">
                Featured
              </span>
            ) : null}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy leading-tight">
            {project.title}
          </h1>
          {project.developer_name && (
            <p className="mt-1 text-base text-stone-600">
              by <span className="font-semibold text-navy">{project.developer_name}</span>
            </p>
          )}
          <p className="mt-2 flex items-start gap-2 text-stone-600">
            <MapPin className="h-5 w-5 shrink-0 text-gold" />
            <span>
              {project.location}, {project.city}
            </span>
          </p>
          {project.marketed_by && (
            <p className="mt-1 text-sm text-stone-500">Marketed by {project.marketed_by}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-stone-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Starting price</p>
            <p className="mt-1 text-2xl font-bold text-gold">{formatProjectPriceFrom(project.price)}</p>
          </div>
          {(bhkLabel || sqftLabel) && (
            <div className="rounded-xl bg-white p-4 shadow-sm border border-stone-100">
              {bhkLabel && (
                <p className="text-sm font-semibold text-navy">{bhkLabel}</p>
              )}
              {sqftLabel && (
                <p className="mt-1 text-sm text-stone-600">{sqftLabel}</p>
              )}
            </div>
          )}
        </div>

        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-gold bg-gold/10 px-5 py-3 text-sm font-bold text-navy transition hover:bg-gold/20"
          >
            <FileText className="h-5 w-5 text-gold" />
            See project PDF
          </a>
        )}

        <div className="rounded-xl bg-white p-5 sm:p-6 shadow-sm border border-stone-100">
          <h2 className="text-lg font-bold text-navy mb-3">About this project</h2>
          <p className="text-stone-700 leading-relaxed whitespace-pre-line">
            {project.description || '—'}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 sm:p-6 shadow-sm border border-stone-100">
          <h2 className="text-lg font-bold text-navy mb-2">Contact Harsh To Let Services</h2>
          <p className="text-sm text-stone-600 mb-4">
            Speak with our team about this project — not the builder directly.
          </p>
          <MaskedPhoneActionButton phoneRaw={CONTACT_PHONE} className="max-w-md" />
        </div>

        {relatedProjects.length > 0 && (
          <div className="pt-4">
            <h2 className="text-xl sm:text-2xl font-bold text-navy mb-6">More Featured Projects</h2>
            <FeaturedProjectsCarousel projects={relatedProjects} />
          </div>
        )}
      </div>

      {showLightbox && images.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
          <button
            type="button"
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white"
          >
            <X className="h-8 w-8" />
          </button>
          <img
            src={getImageUrl(images[currentImageIndex])}
            alt={project.title}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
