/**
 * ReviewModel.js - Gọi API Review từ Backend
 * Chỉ làm việc fetch API với Authorization Bearer token
 * Trả về JSON
 */
class ReviewModel {
    constructor() {
        this.apiUrl = '/api/v1/reviews';
    }

    /**
     * Helper - Lấy token từ localStorage
     */
    _getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Helper - Gửi request fetch
     */
    async _fetchAPI(endpoint, method = 'GET', body = null) {
        const token = this._getToken();
        if (!token) throw new Error('Chưa đăng nhập');

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        if (body) options.body = JSON.stringify(body);

        const response = await fetch(endpoint, options);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        return response.json();
    }

    /**
     * Lấy tất cả reviews
     * GET /api/v1/reviews
     */
    getAllReviews() {
        return this._fetchAPI(this.apiUrl);
    }

    /**
     * Lấy reviews theo bookId
     * GET /api/v1/reviews/book/{bookId}
     */
    getReviewsByBookId(bookId) {
        return this._fetchAPI(`${this.apiUrl}/book/${bookId}`);
    }

    /**
     * Tạo review mới
     * POST /api/v1/reviews
     */
    async createReview(formData) {
        return await this._fetchAPI(this.apiUrl, 'POST', {
            userId: formData.userId,
            bookId: formData.bookId,
            rating: formData.rating,
            comment: formData.comment
        });
    }

    /**
     * Cập nhật review
     * PUT /api/v1/reviews/{id}
     */
    async updateReview(id, formData) {
        return await this._fetchAPI(`${this.apiUrl}/${id}`, 'PUT', {
            userId: formData.userId,
            bookId: formData.bookId,
            rating: formData.rating,
            comment: formData.comment
        });
    }

    /**
     * Xóa review
     * DELETE /api/v1/reviews/{id}
     */
    async deleteReview(id) {
        return await this._fetchAPI(`${this.apiUrl}/${id}`, 'DELETE');
    }
}
