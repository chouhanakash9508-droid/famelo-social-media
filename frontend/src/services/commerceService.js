import api from './api';

export const commerceService = {
  getProduct: async (productId) => {
    const res = await api.get(`/api/products/${productId}`);
    return res.data;
  },

  createProduct: async (data) => {
    const res = await api.post('/api/products', data);
    return res.data;
  },

  getMyProducts: async () => {
    const res = await api.get('/api/products/me');
    return res.data;
  },

  updateProduct: async (productId, data) => {
    const res = await api.put(`/api/products/${productId}`, data);
    return res.data;
  },

  attachProductToReel: async (reelId, productId) => {
    const res = await api.post(`/api/reels/${reelId}/product`, { product_id: productId });
    return res.data;
  },

  removeProductFromReel: async (reelId) => {
    const res = await api.delete(`/api/reels/${reelId}/product`);
    return res.data;
  },

  getCart: async () => {
    const res = await api.get('/api/cart');
    return res.data;
  },

  addToCart: async (productId, quantity = 1, variant = null) => {
    const res = await api.post('/api/cart/items', { product_id: productId, quantity, variant });
    return res.data;
  },

  removeFromCart: async (productId) => {
    const res = await api.delete(`/api/cart/items/${productId}`);
    return res.data;
  },

  createOrder: async (data) => {
    const res = await api.post('/api/orders', data);
    return res.data;
  },

  getMyOrders: async () => {
    const res = await api.get('/api/orders/me');
    return res.data;
  },

  getOrder: async (orderId) => {
    const res = await api.get(`/api/orders/${orderId}`);
    return res.data;
  },

  getSellerOrders: async () => {
    const res = await api.get('/api/orders/seller');
    return res.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const res = await api.put(`/api/orders/${orderId}/status`, { status });
    return res.data;
  },

  createPaymentOrder: async (orderId) => {
    const res = await api.post('/api/payments/create-order', { order_id: orderId });
    return res.data;
  },

  verifyPayment: async (orderId, payload) => {
    const res = await api.post('/api/payments/verify', { order_ref: orderId, ...payload });
    return res.data;
  },

  createReturn: async (orderId, reason, evidenceUrls = []) => {
    const res = await api.post('/api/returns', { order_id: orderId, reason, evidence_urls: evidenceUrls });
    return res.data;
  },

  getMyReturns: async () => {
    const res = await api.get('/api/returns/me');
    return res.data;
  },

  getSellerProfile: async () => {
    const res = await api.get('/api/seller/profile');
    return res.data;
  },

  createSellerProfile: async (data) => {
    const res = await api.post('/api/seller/profile', data);
    return res.data;
  },

  adminGetOrders: async () => {
    const res = await api.get('/api/admin/orders');
    return res.data;
  },

  adminGetProducts: async () => {
    const res = await api.get('/api/admin/products');
    return res.data;
  },

  adminUpdateProductStatus: async (productId, status) => {
    const res = await api.put(`/api/admin/products/${productId}/status`, { status });
    return res.data;
  },

  adminGetReturns: async () => {
    const res = await api.get('/api/admin/returns');
    return res.data;
  },
};

export default commerceService;
