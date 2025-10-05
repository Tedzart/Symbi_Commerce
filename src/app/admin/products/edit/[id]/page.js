'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

async function fetchProductData(id) {
  const res = await fetch(`/api/admin/products?id=${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return await res.json();
}

export default function EditProduct({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [product, setProduct] = useState({
    name: '',
    price: 0,
    stock: 0,
    description: '',
    image_url: '',
    category: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productData = await fetchProductData(id);
        setProduct(productData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WEBP)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert('Image size should be less than 2MB');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const { imageUrl } = await res.json();
      setProduct(prev => ({ ...prev, image_url: imageUrl }));
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });

      if (!res.ok) throw new Error('Failed to update product');
      
      router.push('/admin/products');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <button
          onClick={() => router.push('/admin/products')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
            <input
              type="number"
              name="stock"
              value={product.stock}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={product.category || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={product.description || ''}
            onChange={handleChange}
            rows="4"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
    
<div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
          <div className="flex items-center gap-4">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt="Product preview"
                className="h-32 w-32 object-cover rounded border"
                onError={(e) => {
                  e.target.src = '/placeholder-product.png';
                }}
              />
            ) : (
              <div className="h-32 w-32 bg-gray-100 rounded border flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
            )}

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                className={`px-4 py-2 rounded-md ${
                  uploading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {uploading ? 'Uploading...' : 'Browse Computer'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Supports JPG, PNG, WEBP (Max 2MB)
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Update Product
          </button>
        </div>
        
        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>
    </div>
  );
} 


