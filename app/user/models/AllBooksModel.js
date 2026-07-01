/**
 * AllBooksModel
 * Handles API communication for the All Books page
 * Fetches books, categories, and related data
 */
class AllBooksModel {
    constructor() {
        this.apiBooksUrl = '/api/v1/books';
        this.apiCategoriesUrl = '/api/v1/categories';
    }

    /**
     * Get authorization header with token
     * @private
     * @returns {Object} Headers object with authorization
     */
    _getHeaders() {
        const token = localStorage.getItem("token");
        return {
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` })
        };
    }

    /**
     * Fetch all books from API
     * @returns {Promise<Array>} Array of book objects
     */
    async fetchAllBooks() {
        try {
            const response = await fetch(this.apiBooksUrl, {
                method: "GET",
                headers: this._getHeaders()
            });

            if (!response.ok) {
                console.warn(`Lỗi API: ${response.status}`);
                return [];
            }

            const data = await response.json();
            console.log("Books from API:", data);

            // Handle both array and object response formats
            return Array.isArray(data) ? data : (data.data || data.books || []);
        } catch (error) {
            console.error("Lỗi tải sách:", error);
            return [];
        }
    }

    /**
     * Fetch all categories from API
     * @returns {Promise<Array>} Array of category objects
     */
    async fetchCategories() {
        try {
            const response = await fetch(this.apiCategoriesUrl, {
                method: "GET",
                headers: this._getHeaders()
            });

            // Try to parse JSON regardless of status
            const data = await response.json();
            console.log("Categories response status:", response.status);
            console.log("Categories data from API:", data);

            // Handle different response formats
            if (Array.isArray(data) && data.length > 0) {
                console.log("Got categories as array");
                return data;
            } else if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
                console.log("Got categories from data.data");
                return data.data;
            } else if (data && data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
                console.log("Got categories from data.categories");
                return data.categories;
            }

            console.log("Không tìm thấy dữ liệu danh mục, trả về mảng trống");
            return [];
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
            return [];
        }
    }

    /**
     * Extract unique categories from books array
     * @param {Array} books - Array of book objects
     * @returns {Array} Array of unique category objects
     */
    extractCategoriesFromBooks(books) {
        if (!books || books.length === 0) {
            return [];
        }

        const categoryMap = new Map();

        books.forEach((book, index) => {
            if (index === 0) {
                console.log("First book structure:", book);
                console.log("First book keys:", Object.keys(book));
            }

            if (book.category_id && !categoryMap.has(book.category_id)) {
                let categoryName = null;

                // Priority 1: Backend returns category_name via @JsonGetter
                if (book.category_name) {
                    categoryName = book.category_name;
                    console.log(`✅ Got category_name from backend for ID ${book.category_id}: "${categoryName}"`);
                }
                // Priority 2: camelCase variant
                else if (book.categoryName) {
                    categoryName = book.categoryName;
                }
                // Priority 3: category object with name
                else if (book.category && typeof book.category === 'object' && book.category.name) {
                    categoryName = book.category.name;
                }
                // Priority 4: categoryObj
                else if (book.categoryObj && book.categoryObj.name) {
                    categoryName = book.categoryObj.name;
                }

                // Fallback to ID
                if (!categoryName) {
                    categoryName = `Category ${book.category_id}`;
                    console.log(`⚠️ Không tìm thấy category_name cho ID ${book.category_id}, sử dụng dự phòng`);
                }

                const category = {
                    id: book.category_id,
                    name: categoryName
                };
                categoryMap.set(book.category_id, category);
            }
        });

        const result = Array.from(categoryMap.values());
        console.log("Extracted categories:", result);
        return result;
    }

    /**
     * Build a map from category ID to category name
     * @param {Array} categories - Array of category objects
     * @returns {Object} Map with category ID as key and name as value
     */
    buildCategoryNameMap(categories) {
        const map = {};
        if (Array.isArray(categories)) {
            categories.forEach(cat => {
                if (cat.id && cat.name) {
                    map[cat.id] = cat.name;
                }
            });
        }
        console.log("Built category name map:", map);
        return map;
    }
}
