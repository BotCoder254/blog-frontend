const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const publicApi = {
  // Get published posts for a tenant
  getPosts: async (tenantSlug, params = {}) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/api/public/tenants/${tenantSlug}/posts?${searchParams}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }
    
    return response.json();
  },

  // Get single published post
  getPost: async (tenantSlug, slug) => {
    const response = await fetch(
      `${API_BASE_URL}/api/public/tenants/${tenantSlug}/posts/${slug}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.status}`);
    }
    
    return response.json();
  },

  // Get related posts
  getRelatedPosts: async (tenantSlug, slug) => {
    const response = await fetch(
      `${API_BASE_URL}/api/public/tenants/${tenantSlug}/posts/${slug}/related`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch related posts: ${response.status}`);
    }
    
    return response.json();
  },

  // Get RSS feed URL
  getRSSUrl: (tenantSlug) => {
    return `${API_BASE_URL}/api/public/tenants/${tenantSlug}/rss.xml`;
  }
};

export default publicApi;