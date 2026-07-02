import { Link, Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import BrandLoader from '../components/ui/BrandLoader';
import ServiceCategory3DIcon from '../components/vendors/ServiceCategory3DIcon';
import { getCategoryById } from '../constants/workerProfessions';
import { getServiceCategoryContent } from '../constants/serviceCategoryContent';
import { usePageSeo } from '../hooks/usePageSeo';
import { SITE_NAME } from '../constants/seoConfig';

export default function ServiceCategoryDetail() {
  const { categoryId } = useParams();
  const category = getCategoryById(categoryId);
  const content = getServiceCategoryContent(categoryId, category?.label);

  usePageSeo(
    category
      ? {
          title: `${category.label} in Patna | ${SITE_NAME}`,
          description: content.summary,
          path: `/our-vendors/category/${categoryId}`,
          keywords: `${category.label} Patna, ${category.label} services Bihar, Harsh To Let Services vendors`,
          jsonLdId: 'seo-jsonld-page',
        }
      : null
  );

  const { data, isLoading } = useQuery({
    queryKey: ['publicVendors', categoryId, 'preview'],
    queryFn: async () => {
      const params = new URLSearchParams({ categoryId });
      const res = await api.get(`/workers/public?${params.toString()}`);
      return res.data;
    },
    enabled: Boolean(categoryId),
  });

  if (!category) {
    return <Navigate to="/our-vendors" replace />;
  }

  const vendors = data?.vendors || [];
  const preview = vendors.slice(0, 6);

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="bg-[#0a1020] text-white py-6 sm:py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/our-vendors"
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-gold mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            All vendors
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <ServiceCategory3DIcon categoryId={categoryId} size="lg" className="svc-3d-tile--flat" />
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold">{category.label}</h1>
              <p className="mt-2 text-white/80 text-sm sm:text-base leading-relaxed">{content.summary}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        <section className="bg-white rounded-xl border border-stone-200 p-5 sm:p-8 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-navy mb-3">About this service in Patna</h2>
          {content.details.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="text-stone-600 text-sm sm:text-base leading-relaxed mb-3 last:mb-0">
              {paragraph}
            </p>
          ))}
          {category.professions?.length > 0 && (
            <div className="mt-5 pt-5 border-t border-stone-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">Includes</p>
              <ul className="flex flex-wrap gap-2">
                {category.professions.map((p) => (
                  <li
                    key={p}
                    className="rounded-full bg-stone-100 px-3 py-1 text-xs sm:text-sm text-navy"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-navy">Available vendors</h2>
            <Link
              to={`/our-vendors?categoryId=${encodeURIComponent(categoryId)}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline shrink-0"
            >
              Browse all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <BrandLoader />
          ) : preview.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-500">
              <p>No vendors listed in this category yet.</p>
              <Link to="/job-apply" className="text-gold font-medium text-sm mt-2 inline-block hover:underline">
                Register as a vendor →
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {preview.map((vendor) => (
                <li key={vendor.id}>
                  <Link
                    to={`/our-vendors/vendor/${vendor.id}`}
                    className="block bg-white rounded-xl border border-stone-200 p-4 hover:border-gold/50 hover:shadow-md transition-all"
                  >
                    <p className="font-bold text-navy line-clamp-1">{vendor.name}</p>
                    <p className="text-sm text-gold mt-0.5 line-clamp-1">{vendor.profession}</p>
                    {vendor.description && (
                      <p className="text-xs text-stone-500 mt-2 line-clamp-2">{vendor.description}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
