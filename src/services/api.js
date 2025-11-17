const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      ...options,
    };

    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password) {
    return this.request('/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Tenant endpoints
  async getTenants() {
    return this.request('/tenants');
  }

  async createTenant(tenantData) {
    return this.request('/tenants', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    });
  }

  async checkSlugAvailability(slug) {
    return this.request(`/tenants/check-slug/${encodeURIComponent(slug)}`);
  }

  async switchTenant(tenantId) {
    return this.request(`/tenants/${tenantId}/switch`, {
      method: 'POST',
    });
  }

  // Post endpoints
  async getPosts(tenantId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tenants/${tenantId}/posts${queryString ? '?' + queryString : ''}`);
  }

  async getPost(tenantId, postId) {
    return this.request(`/tenants/${tenantId}/posts/${postId}`);
  }

  async getPostBySlug(tenantId, slug) {
    return this.request(`/tenants/${tenantId}/posts/slug/${slug}`);
  }

  async createPost(tenantId, postData) {
    return this.request(`/tenants/${tenantId}/posts`, {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updatePost(tenantId, postId, postData) {
    return this.request(`/tenants/${tenantId}/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(tenantId, postId) {
    return this.request(`/tenants/${tenantId}/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async checkPostSlugAvailability(tenantId, slug) {
    return this.request(`/tenants/${tenantId}/posts/check-slug/${encodeURIComponent(slug)}`);
  }

  // Media endpoints
  async uploadMedia(tenantId, formData) {
    return this.request(`/tenants/${tenantId}/media/upload`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async getMedia(tenantId, filename) {
    return this.request(`/tenants/${tenantId}/media/${filename}`);
  }
}

export default new ApiService();