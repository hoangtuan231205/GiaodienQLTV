/**
 * Reservation Model Class
 * Gọi API reservations từ backend
 * Trả về dữ liệu JSON
 */
class ReservationModel {
    constructor() {
        this.apiUrl = '/api/v1/reservations';
        this.apiAuthorsUrl = '/api/v1/authors';
        // Cache authors để tránh fetch nhiều lần
        this.authorsCache = new Map();
    }

    /**
     * Helper - Lấy token từ localStorage
     */
    _getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Helper - Gửi request fetch
     * Handle responses that might not be JSON (e.g., 204 No Content, plain text)
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

        // Check content-type BEFORE reading body
        const contentType = response.headers.get('content-type') || '';
        const contentLength = response.headers.get('content-length');

        // If no content or not JSON, return success
        if (!contentType || contentLength === '0' || response.status === 204) {
            return { success: true };
        }

        // Check if content is JSON
        const isJson = contentType.includes('application/json');

        if (!isJson) {
            // Content is not JSON (could be text, empty, etc)
            return { success: true };
        }

        // Parse as JSON
        return await response.json();
    }
    /**
     * Fetch tên tác giả từ author ID
     */
    async _fetchAuthorName(authorId) {
        // Check cache first
        if (this.authorsCache.has(authorId)) {
            return this.authorsCache.get(authorId);
        }

        try {
            const author = await this._fetchAPI(`${this.apiAuthorsUrl}/${authorId}`);
            const name = author.name || `Tác giả ${authorId}`;
            this.authorsCache.set(authorId, name);
            return name;
        } catch (error) {
            console.warn(`Không thể fetch tác giả ID ${authorId}:`, error);
            return 'Tác giả không xác định';
        }
    }

    /**
     * Lấy tất cả đặt chỗ của người dùng kèm chi tiết sách
     * GET /api/v1/reservations/details
     * Fetch thêm tên tác giả nếu có authorId
     */
    async getUserReservationsWithBooks() {
        try {
            const data = await this._fetchAPI(`${this.apiUrl}/details`);

            // If no data or not array, return as-is
            if (!Array.isArray(data)) return data;

            // Fetch author names for items that have authorId but no author name
            const enrichedData = await Promise.all(
                data.map(async (res) => {
                    let authorName = res.author || res.authorName || 'Tác giả không xác định';

                    // If we have authorId but no author name, fetch it
                    if (res.authorId && !res.author && !res.authorName) {
                        try {
                            authorName = await this._fetchAuthorName(res.authorId);
                        } catch (err) {
                            console.warn(`Không thể lấy tên tác giả cho ID ${res.authorId}:`, err);
                            // Keep fallback
                        }
                    }

                    // Extract barcode from multiple possible field names
                    const barcode = res.book_copy_barcode ||
                        res.bookCopyBarcode ||
                        res.barcode ||
                        res.copyBarcode ||
                        (res.bookCopy && res.bookCopy.barcode) ||
                        'N/A';

                    console.log('Reservation data - checking barcode:', {
                        id: res.id,
                        book_copy_barcode: res.book_copy_barcode,
                        bookCopyBarcode: res.bookCopyBarcode,
                        barcode: res.barcode,
                        copyBarcode: res.copyBarcode,
                        bookCopy: res.bookCopy,
                        finalBarcode: barcode
                    });

                    return {
                        ...res,
                        title: res.title || res.bookTitle || 'Không xác định',
                        author: authorName,
                        cover: res.cover || res.image_url || res.imageUrl || res.image || res.thumb || '',
                        book_copy_barcode: barcode
                    };
                })
            );

            return enrichedData;
        } catch (error) {
            console.error('ReservationModel.getUserReservationsWithBooks() error:', error);
            throw error;
        }
    }

    /**
     * Tạo đặt chỗ mới
     * POST /api/v1/reservations
     */
    createReservation(bookId) {
        return this._fetchAPI(this.apiUrl, 'POST', { bookId: parseInt(bookId) });
    }

    /**
     * Cập nhật đặt chỗ
     * PUT /api/v1/reservations/{id}
     */
    updateReservation(reservationId, updateData) {
        return this._fetchAPI(`${this.apiUrl}/${reservationId}`, 'PUT', updateData);
    }

    /**
     * Xác nhận lấy sách
     * PATCH /api/v1/reservations/{id}/pickup
     */
    confirmPickup(reservationId) {
        return this._fetchAPI(`${this.apiUrl}/${reservationId}/pickup`, 'PATCH');
    }

    /**
     * Hủy đặt chỗ
     * DELETE /api/v1/reservations/{id}
     */
    cancelReservation(reservationId) {
        return this._fetchAPI(`${this.apiUrl}/${reservationId}`, 'DELETE');
    }

    /**
     * Lấy danh sách sách có sẵn để đặt chỗ
     * GET /api/v1/books
     */
    async getAvailableBooks() {
        try {
            const apiBooksUrl = '/api/v1/books';
            const data = await this._fetchAPI(apiBooksUrl, 'GET');

            // Handle both array and object response formats
            const books = Array.isArray(data) ? data : (data.data || data.books || []);

            // Transform to match BorrowForm format: { id, title }
            return books.map(book => ({
                id: book.id,
                title: book.title || book.name || 'Unknown'
            }));
        } catch (error) {
            console.error('Lỗi tải danh sách sách:', error);
            return [];
        }
    }
}