class BookModel {
  constructor() {
    this.apiUrl = "/api/v1/books";
    this.allBooks = []; // Bộ nhớ đệm chứa toàn bộ sách từ Server
  }

  // --- HÀM LỌC VÀ PHÂN TRANG (Xử lý cục bộ) ---

  getBooksByPage(filteredList, page, itemsPerPage) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredList.slice(start, end);
  }

  filterBooks(allBooks, { query, category, publisher, status }) {
    const q = query ? query.toLowerCase() : "";
    return allBooks.filter((book) => {
      // 1. Lọc theo từ khóa
      const matchQuery = !q ||
        book.title.toLowerCase().includes(q) ||
        book.id.toString().includes(q);

      // 2. Lọc theo Thể loại (Thống nhất dùng categoryId)
      const bookCatId = book.categoryId || book.category_id;
      const matchCat = !category || String(bookCatId) === String(category);

      // 3. Lọc theo Nhà xuất bản
      const bookPubId = book.publisherId || book.publisher_id;
      const matchPub = !publisher || String(bookPubId) === String(publisher);

      // 4. Lọc theo Tình trạng
      let matchStatus = true;
      if (status === "available") matchStatus = book.availableQty > 0;
      if (status === "out_of_stock") matchStatus = book.availableQty === 0;

      return matchQuery && matchCat && matchPub && matchStatus;
    });
  }

  // --- CÁC HÀM GỌI API ---

  // Helper hàm để lấy Headers (Tránh lặp lại việc lấy Token)
  getHeaders(isUpload = false) {
    const token = localStorage.getItem("token");
    const headers = { "Authorization": `Bearer ${token}` };
    if (!isUpload) headers["Content-Type"] = "application/json";
    return headers;
  }

  async fetchBooks() {
    const res = await fetch(this.apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });

    if (!res.ok) {
      throw new Error("Không thể lấy danh sách sách");
    }

    this.allBooks = await res.json(); // QUAN TRỌNG: Phải gán dữ liệu vào đây
    return this.allBooks;
  }

  async fetchBookById(id) {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) throw new Error("Không tìm thấy sách");
    return await response.json();
  }

  async createBook(bookData) {
    const res = await fetch(this.apiUrl, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(bookData),
    });

    if (!res.ok) throw new Error("Lỗi khi thêm sách mới");
    return await res.json();
  }

  async updateBook(id, bookData) {
    const res = await fetch(`${this.apiUrl}/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(bookData),
    });

    if (!res.ok) throw new Error("Lỗi khi cập nhật sách");
    return await res.json();
  }

  async deleteBook(id) {
    const res = await fetch(`${this.apiUrl}/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    if (!res.ok) throw new Error("Lỗi khi xóa sách");
    return true;
  }

  // --- XỬ LÝ UPLOAD ẢNH ---
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/v1/upload", {
      method: "POST",
      headers: this.getHeaders(true), // isUpload = true để không có Content-Type JSON
      body: formData,
    });

    if (!res.ok) throw new Error("Không thể upload ảnh!");
    const result = await res.json();
    return result.url;
  }
}