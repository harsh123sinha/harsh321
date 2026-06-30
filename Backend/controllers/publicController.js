import { propertyModel } from '../models/propertyModel.js';
import { userModel } from '../models/userModel.js';
import { buildSitemapXml } from '../utils/sitemap.js';

// Get homepage data (featured properties + stats)
export const getHomeData = async (req, res) => {
  try {
    const featuredProperties = await propertyModel.getFeatured(20);
    const featuredProjects = await propertyModel.getHomeProjects(12);

    const totalUsers = await userModel.getCount();
    const totalProperties = await propertyModel.getCount();
    const yearsOfExperience = parseInt(process.env.YEARS_OF_EXPERIENCE) || 15;

    res.json({
      success: true,
      featuredProperties,
      featuredProjects,
      stats: {
        totalUsers,
        totalProperties,
        yearsOfExperience
      }
    });
  } catch (error) {
    console.error('Get home data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all featured projects
export const getFeaturedProjects = async (req, res) => {
  try {
    const projects = await propertyModel.getAllProjects();
    res.json({ success: true, projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Single featured project detail
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await propertyModel.findProjectById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const relatedProjects = await propertyModel.getRelatedProjects(id, 8);

    res.json({
      success: true,
      project,
      relatedProjects,
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get random properties (for buyer dashboard, etc.)
export const getRandomProperties = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const properties = await propertyModel.getRandom(limit);

    res.json({
      success: true,
      properties
    });
  } catch (error) {
    console.error('Get random properties error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get stats only
export const getStats = async (req, res) => {
  try {
    const totalUsers = await userModel.getCount();
    const totalProperties = await propertyModel.getCount();
    const yearsOfExperience = parseInt(process.env.YEARS_OF_EXPERIENCE) || 15;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProperties,
        yearsOfExperience
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/** XML sitemap for search engines (static pages + active listings). */
export const getSitemap = async (req, res) => {
  try {
    const listings = await propertyModel.getSitemapListings();
    const xml = buildSitemapXml(listings);
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('Get sitemap error:', error);
    res.status(500).send('Sitemap unavailable');
  }
};
