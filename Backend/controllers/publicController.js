import { propertyModel } from '../models/propertyModel.js';
import { userModel } from '../models/userModel.js';

// Get homepage data (featured properties + stats)
export const getHomeData = async (req, res) => {
  try {
    // Get featured properties
    const featuredProperties = await propertyModel.getFeatured(20);

    // Get stats
    const totalUsers = await userModel.getCount();
    const totalProperties = await propertyModel.getCount();
    const yearsOfExperience = parseInt(process.env.YEARS_OF_EXPERIENCE) || 15;

    res.json({
      success: true,
      featuredProperties,
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
