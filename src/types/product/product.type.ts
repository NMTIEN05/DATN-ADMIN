export interface AttributeRef {
  attributeId: {
    _id: string;
    name: string;
  };
  attributeValueId: {
    _id: string;
    value: string;
    imageUrl?: string;
  };
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  priceDefault: number;
  categoryId: string;
  variants: Variant[];
}

export interface Variant {
  _id: string;
  
  sku: string;
  name: string;
  imageUrl: string;
  price: number;
  stock: number;
  attributes: AttributeRef[];
  color?: string;     // thêm thủ công khi format
  storage?: string;   // thêm thủ công khi format
  deletedAt?: string | null; // <== Bổ sung dòng này
}
