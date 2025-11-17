const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

export const publicApi = {
  // Get published posts for a tenant
  getPosts: async (tenantSlug, params = {}) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });

    const url = `${BASE_URL}/public/tenants/${tenantSlug}/posts?${searchParams}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch posts: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  },

  // Get single published post
  getPost: async (tenantSlug, slug) => {
    const response = await fetch(
      `${BASE_URL}/public/tenants/${tenantSlug}/posts/${slug}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.status}`);
    }
    
    return response.json();
  },

  // Get related posts
  getRelatedPosts: async (tenantSlug, slug) => {
    const response = await fetch(
      `${BASE_URL}/public/tenants/${tenantSlug}/posts/${slug}/related`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch related posts: ${response.status}`);
    }
    
    return response.json();
  },

  // Get popular tags
  getTags: async (tenantSlug, query = '') => {
    const searchParams = new URLSearchParams();
    if (query) searchParams.append('query', query);
    
    const response = await fetch(
      `${BASE_URL}/public/tenants/${tenantSlug}/tags?${searchParams}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.status}`);
    }
    
    return response.json();
  },

  // Get RSS feed URL
  getRSSUrl: (tenantSlug) => {
    return `${BASE_URL}/public/tenants/${tenantSlug}/rss.xml`;
  },

  // Debug methods
  debug: {
    getAllTenants: async () => {
      const response = await fetch(`${BASE_URL}/debug/tenants`);
      return response.json();
    },
    
    getTenantBySlug: async (slug) => {
      const response = await fetch(`${BASE_URL}/debug/tenants/${slug}`);
      return response.json();
    },
    
    getAllPosts: async () => {
      const response = await fetch(`${BASE_URL}/debug/posts/all`);
      return response.json();
    },
    
    getPublishedPosts: async () => {
      const response = await fetch(`${BASE_URL}/debug/posts/published`);
      return response.json();
    }
  }
};

export default publicApi;