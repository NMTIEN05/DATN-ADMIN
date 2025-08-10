import axiosInstance from '../../utils/axiosInstance';

export type Blog = {
    _id: string;
    largeTitle: string;
    smallTitle: string;
    description: string;
    content: string;
    imageUrl?: string;
    author?: string;
    slug?: string;
    published?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

export type CreateBlogRequest = {
    largeTitle: string;
    smallTitle: string;
    description: string;
    content: string;
    image?: File | null;
    author?: string;
    published?: boolean;
};

export type UpdateBlogRequest = Partial<CreateBlogRequest>;

export const blogService = {
    async list(params?: { status?: 'published' | 'draft' }) {
        const res = await axiosInstance.get('/blog', { params });
        return res.data as Blog[];
    },

    async getById(id: string) {
        const res = await axiosInstance.get(`/blog/${id}`);
        return res.data as Blog;
    },

    async create(data: CreateBlogRequest) {
        const form = new FormData();
        form.append('largeTitle', data.largeTitle);
        form.append('smallTitle', data.smallTitle);
        form.append('description', data.description);
        form.append('content', data.content);
        if (data.author) form.append('author', data.author);
        if (typeof data.published === 'boolean') form.append('published', String(data.published));
        if (data.image) form.append('image', data.image);

        const res = await axiosInstance.post('/blog', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data as Blog;
    },

    async update(id: string, data: UpdateBlogRequest) {
        const form = new FormData();
        if (data.largeTitle) form.append('largeTitle', data.largeTitle);
        if (data.smallTitle) form.append('smallTitle', data.smallTitle);
        if (data.description) form.append('description', data.description);
        if (data.content) form.append('content', data.content);
        if (typeof data.published === 'boolean') form.append('published', String(data.published));
        if (data.author) form.append('author', data.author);
        if (data.image) form.append('image', data.image);

        const res = await axiosInstance.put(`/blog/${id}`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res.data as Blog;
    },

    async remove(id: string) {
        await axiosInstance.delete(`/blog/${id}`);
    },
};


