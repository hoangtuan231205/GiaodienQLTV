/**
 * Borrow Form Component
 * Unified form for borrowing - supports both single book mode and book selection mode
 * 
 * Architecture:
 * - BorrowForm.html: Template structure (cached after first load)
 * - BorrowForm.js: Form logic and event handling (this file)
 * 
 * Features:
 * - Template caching for performance
 * - SINGLE BOOK MODE: Pre-filled book title (read-only) + date selection
 * - SELECTION MODE: Book dropdown with search + date selection
 * - Modal overlay with close button
 * - Configurable callbacks
 * 
 * Usage:
 *   // Mode 1: Single book (for BookDetail page - "Borrow Now")
 *   BorrowForm.create({ book: { id: 5, title: "Book Title" }, onSubmit: callback })
 *   
 *   // Mode 2: Book selection (for Reservation page - "New Reservation")
 *   BorrowForm.create({ books: [...], mode: 'selection', onSubmit: callback })
 */
class BorrowForm {
    static templateCache = null;
    static defaultTodayDate = new Date().toISOString().split('T')[0];

    /**
     * Validate pickup date with business rules:
     * - Cannot pick yesterday
     * - If picking today, must be before 3 PM (15:00)
     * @static
     * @param {string} pickupDate - Date in YYYY-MM-DD format
     * @returns {Object} { valid: boolean, message: string }
     */
    static validatePickupDate(pickupDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = new Date(pickupDate);
        selectedDate.setHours(0, 0, 0, 0);

        const currentHour = new Date().getHours();

        // Rule 1: Cannot pick yesterday
        if (selectedDate < today) {
            return {
                valid: false,
                message: 'Vui lòng chọn ngày phù hợp (không thể chọn ngày hôm qua)'
            };
        }

        // Rule 2: If picking today and current time is after 3 PM (15:00)
        if (selectedDate.getTime() === today.getTime() && currentHour >= 15) {
            return {
                valid: false,
                message: 'Đã hết thời gian chọn mượn sách vui lòng chọn vào ngày tiếp theo'
            };
        }

        return { valid: true, message: '' };
    }

    /**
     * Format date to LocalDateTime format (YYYY-MM-DDTHH:mm:ss)
     * Default time: 09:00:00 (9 AM pickup)
     * @static
     * @param {string} pickupDate - Date in YYYY-MM-DD format
     * @returns {string} Formatted date as YYYY-MM-DDTHH:mm:ss
     */
    static formatPickupDate(pickupDate) {
        return `${pickupDate}T09:00:00`;
    }

    /**
     * Load and cache template from BorrowForm.html
     * @private
     * @static
     * @returns {Promise<string>} - Template HTML string
     */
    static async _loadTemplate() {
        if (BorrowForm.templateCache) {
            return BorrowForm.templateCache;
        }

        try {
            const response = await fetch('/app/user/components/BorrowForm.html');
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const template = doc.querySelector('#borrow-form-template');

            if (template) {
                BorrowForm.templateCache = template.innerHTML;
                console.log('Mẫu BorrowForm đã được tải');
                return BorrowForm.templateCache;
            } else {
                console.warn('Phần tử mẫu không tìm thấy trong BorrowForm.html');
                return '';
            }
        } catch (error) {
            console.error('Lỗi tải mẫu BorrowForm:', error);
            return '';
        }
    }

    /**
     * Create a borrow form modal
     * @static
     * @param {Object} options - Configuration options
     * @param {Object} options.book - Book object with id and title (for single mode)
     * @param {Array} options.books - Array of book objects (for selection mode)
     * @param {string} options.mode - 'single' (default) or 'selection'
     * @param {Function} options.onSubmit - Callback when form is submitted
     * @returns {Promise<HTMLElement>} - Modal form DOM element
     */

    /**
     * Populate template with book data based on mode
     * @private
     * @static
     * @param {string} template - Template HTML string
     * @param {string} mode - 'single' or 'selection'
     * @param {Object} book - Book data object (for single mode)
     * @param {Array} books - Array of book objects (for selection mode)
     * @returns {HTMLElement} - Populated modal element
     */
    static _populateTemplate(template, mode, book, books) {
        // Pickup date is no longer in template - removed
        let html = template;

        // Convert HTML string to DOM element
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        const modal = wrapper.firstElementChild;

        // Configure based on mode
        if (mode === 'single') {
            // Hide book selection, show book title
            const bookSelectGroup = modal.querySelector('#book-select-group');
            const bookSelect = modal.querySelector('#book-select');
            const bookTitleGroup = modal.querySelector('#book-title-group');

            if (bookSelectGroup) bookSelectGroup.style.display = 'none';
            if (bookSelect) bookSelect.removeAttribute('required'); // Remove required for hidden field
            if (bookTitleGroup) bookTitleGroup.style.display = 'block';

            // Pre-fill book data
            const bookTitleInput = modal.querySelector('#book-title-display');
            const bookIdInput = modal.querySelector('#book-id');

            if (bookTitleInput) {
                bookTitleInput.value = book.title || 'Unknown Title';
            }
            if (bookIdInput) {
                bookIdInput.value = book.id || '';
            }
        } else if (mode === 'selection') {
            // Show book selection, hide book title
            const bookSelectGroup = modal.querySelector('#book-select-group');
            const bookSelect = modal.querySelector('#book-select');
            const bookTitleGroup = modal.querySelector('#book-title-group');

            if (bookSelectGroup) bookSelectGroup.style.display = 'block';
            if (bookSelect) bookSelect.setAttribute('required', 'required'); // Set required for visible field
            if (bookTitleGroup) bookTitleGroup.style.display = 'none';

            // Populate book dropdown
            const bookSelect_el = modal.querySelector('#book-select');
            if (bookSelect_el && books && books.length > 0) {
                books.forEach(b => {
                    const option = document.createElement('option');
                    option.value = b.id;
                    option.textContent = b.title;
                    bookSelect_el.appendChild(option);
                });
            }
        }

        return modal;
    }

    /**
     * Setup all event listeners for the form
     * @private
     * @static
     * @param {HTMLElement} modal - Modal element
     * @param {string} mode - 'single' or 'selection'
     * @param {Object} book - Book data (for single mode)
     * @param {Array} books - Array of book objects (for selection mode)
     * @param {Function} onSubmit - Submit callback
     */
    static _setupEventListeners(modal, mode, book, books, onSubmit) {
        // Pickup date is no longer used - removed from form

        // Close button
        const closeBtn = modal.querySelector('.modal-close-btn');
        const closeBtnAlt = modal.querySelector('.close-modal-btn');
        const overlay = modal.querySelector('.borrow-modal-overlay');

        const closeModal = () => {
            modal.remove();
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        if (closeBtnAlt) {
            closeBtnAlt.addEventListener('click', closeModal);
        }
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal();
            });
        }

        // Form submission
        const form = modal.querySelector('#borrow-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                let bookId;

                if (mode === 'single') {
                    bookId = form.querySelector('#book-id').value;
                } else if (mode === 'selection') {
                    const bookSelect = form.querySelector('#book-select');
                    bookId = bookSelect.value;

                    if (!bookId || bookId === '') {
                        alert('Vui lòng chọn một cuốn sách');
                        return;
                    }
                }

                if (onSubmit) {
                    try {
                        await onSubmit({
                            bookId: parseInt(bookId)
                            // Pickup date is no longer sent - backend handles it automatically
                        });
                        closeModal();
                    } catch (error) {
                        console.error('Lỗi trong hàm gọi lại onSubmit:', error);
                        alert('Lỗi: ' + error.message);
                    }
                } else {
                    console.warn('Không có hàm gọi lại onSubmit được cung cấp');
                    closeModal();
                }
            });
        }
    }
}
