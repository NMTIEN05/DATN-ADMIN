import React, { useState } from 'react';
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw } from 'lucide-react';

const ProductDetail = () => {
  // Mock data từ API
  const productData = {
    "_id": "685afd4c4c6e31a94d42d073",
    "title": "iPhone 13 256GB | Chính hãng VN/A",
    "slug": "iphone-13",
    "capacity": "256",
    "imageUrl": [
      "https://res.cloudinary.com/dhy3a5frj/image/upload/v1750793340/eczrpyzafczxvybsdduy.png"
    ],
    "description": "Điện thoại iPhone 13 256GB bộ nhớ có giá cao hơn một chút so với bản tiêu chuẩn 128GB. Cụ thể, iPhone 13 256GB có giá bán khoảng 21.490.000 đồng (Mức giá sẽ có giao đồng theo thời gian tùy vào chương trình khuyến mãi). Ngoài ra, giá bán iP13 256GB bộ nhớ trong cũng sẽ có sự khác biệt nhẹ giữa các phiên bản màu sắc.",
    "priceDefault": 1234,
    "categoryId": {
      "name": "iPhone",
      "description": "Điện Thoại"
    },
    "variants": [
      {
        "_id": "685afd4c4c6e31a94d42d077",
        "name": "iPhone 13 256GB | Chính hãng VN/A - Xanh",
        "imageUrl": [
          "https://res.cloudinary.com/dhy3a5frj/image/upload/v1750793347/djhisqy8dck1h82vvrtp.png"
        ],
        "price": 21490000,
        "oldPrice": 24990000,
        "stock": 11,
        "attributes": [
          {
            "attributeId": {
              "name": "Màu sắc"
            },
            "attributeValueId": {
              "value": "Xanh"
            }
          }
        ]
      },
      {
        "_id": "685afd4c4c6e31a94d42d07d",
        "name": "iPhone 13 256GB | Chính hãng VN/A - Trắng",
        "imageUrl": [
          "https://res.cloudinary.com/dhy3a5frj/image/upload/v1750793514/ig2v9fwfrvjbwttxzzmr.png"
        ],
        "price": 21490000,
        "oldPrice": 24990000,
        "stock": 2332,
        "attributes": [
          {
            "attributeId": {
              "name": "Màu sắc"
            },
            "attributeValueId": {
              "value": "Trắng"
            }
          }
        ]
      }
    ],
    "soldCount": 1256
  };

  const [selectedVariant, setSelectedVariant] = useState(productData.variants[0]);
  const [selectedImage, setSelectedImage] = useState(selectedVariant.imageUrl[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateDiscount = (oldPrice, newPrice) => {
    if (!oldPrice) return 0;
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setSelectedImage(variant.imageUrl[0]);
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => Math.min(prev + 1, selectedVariant.stock));
    } else {
      setQuantity(prev => Math.max(prev - 1, 1));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="text-sm text-gray-500">
            <span>Trang chủ</span> / 
            <span className="mx-1">{productData.categoryId.name}</span> / 
            <span className="text-gray-900 font-medium">{productData.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <img 
                src={selectedImage} 
                alt={selectedVariant.name}
                className="w-full h-96 object-contain"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex space-x-2">
              {productData.variants.map((variant) => (
                <button
                  key={variant._id}
                  onClick={() => setSelectedImage(variant.imageUrl[0])}
                  className={`w-20 h-20 bg-white rounded-lg border-2 p-2 ${
                    selectedImage === variant.imageUrl[0] ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img 
                    src={variant.imageUrl[0]} 
                    alt={variant.name}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {productData.title}
              </h1>
              
              {/* Rating & Reviews */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="ml-2 text-gray-600">4.8 (2,145 đánh giá)</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">Đã bán {productData.soldCount.toLocaleString()}</span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-red-600">
                  {formatPrice(selectedVariant.price)}
                </span>
                {selectedVariant.oldPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(selectedVariant.oldPrice)}
                    </span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm font-medium">
                      -{calculateDiscount(selectedVariant.oldPrice, selectedVariant.price)}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Màu sắc</h3>
              <div className="flex space-x-3">
                {productData.variants.map((variant) => (
                  <button
                    key={variant._id}
                    onClick={() => handleVariantChange(variant)}
                    className={`px-4 py-2 border-2 rounded-lg font-medium transition-colors ${
                      selectedVariant._id === variant._id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {variant.attributes[0].attributeValueId.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Số lượng</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange('decrease')}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange('increase')}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= selectedVariant.stock}
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-600">
                  {selectedVariant.stock} sản phẩm có sẵn
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Thêm vào giỏ hàng</span>
              </button>
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  isWishlisted 
                    ? 'border-red-500 bg-red-50 text-red-600' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Buy Now Button */}
            <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Mua ngay
            </button>

            {/* Product Features */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Miễn phí vận chuyển toàn quốc</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">Bảo hành chính hãng 12 tháng</span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-700">Đổi trả trong 7 ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-4">Mô tả sản phẩm</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">{productData.description}</p>
            
            <h3 className="text-xl font-semibold mb-3">Thông số kỹ thuật</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Màn hình</h4>
                <p className="text-gray-600">Super Retina XDR OLED 6.1 inch</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Chip xử lý</h4>
                <p className="text-gray-600">Apple A15 Bionic</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Bộ nhớ trong</h4>
                <p className="text-gray-600">{productData.capacity}GB</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Camera</h4>
                <p className="text-gray-600">Camera kép 12MP</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
