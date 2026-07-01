class ReaderModel {
  constructor() {
    this.apiUrl = "/api/v1/users";
  }

  // Hàm sinh Headers thông minh
  // Nếu requireToken = true (mặc định), sẽ tự động lấy token từ localStorage
  getHeaders(requireToken = true) {
    const headers = {
      "Content-Type": "application/json",
    };
    if (requireToken) {
      const token = localStorage.getItem("token"); // Lấy token từ biến của bạn
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        console.warn("Cảnh báo: Không tìm thấy token trong localStorage!");
      }
    }
    return headers;
  }

  // Phân trang
  getReadersByPage(filteredList, page, itemsPerPage) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredList.slice(start, end);
  }

  // Lọc dữ liệu
  filterReaders(allReaders, { query, status }) {
    return allReaders.filter((reader) => {
      const safeQuery = query ? query.toLowerCase().trim() : "";
      const matchQuery =
        !safeQuery ||
        reader.id.toString().includes(safeQuery) ||
        (reader.fullName &&
          reader.fullName.toLowerCase().includes(safeQuery)) ||
        (reader.email && reader.email.toLowerCase().includes(safeQuery)) ||
        (reader.phone && reader.phone.includes(safeQuery));

      const matchStatus =
        !status ||
        (reader.status && reader.status.toUpperCase() === status.toUpperCase());

      return matchQuery && matchStatus;
    });
  }

  // ==========================================
  // CÁC HÀM GỌI API
  // ==========================================

  // 1. Admin lấy danh sách (BẮT BUỘC có Token)
  async fetchReaders(role = "user") {
    const response = await fetch(`${this.apiUrl}?role=${role}`, {
      method: "GET",
      headers: this.getHeaders(true),
    });
    if (!response.ok) throw new Error("Lỗi khi lấy danh sách độc giả");
    return await response.json();
  }

  // 2. Lấy chi tiết 1 độc giả
  async fetchReaderById(id) {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: "GET",
      headers: this.getHeaders(true), // Nghịch đảo: isOwnProfile = true thì requireToken = false
    });
    if (!response.ok) throw new Error("Không tìm thấy độc giả");
    return await response.json();
  }

  // 3. Admin tạo độc giả mới (BẮT BUỘC có Token)
  async createReader(readerData) {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(readerData),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Lỗi khi tạo độc giả mới");
    }
    return response.json();
  }

  // 4. Cập nhật thông tin độc giả
  async updateReader(id, readerData) {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: "PUT",
      headers: this.getHeaders(true),
      body: JSON.stringify(readerData),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Lỗi khi cập nhật thông tin");
    }
    return response.json();
  }

  // 5. Admin Khóa/Mở khóa tài khoản (BẮT BUỘC có Token)
  async changeStatus(id, newStatus) {
    const response = await fetch(
      `${this.apiUrl}/${id}/status?status=${newStatus}`,
      {
        method: "PATCH",
        headers: this.getHeaders(true),
      },
    );
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Lỗi khi thay đổi trạng thái");
    }
    return response.json();
  }

  // 6. Admin Xóa tài khoản (BẮT BUỘC có Token)
  async deleteReader(id) {
    const response = await fetch(`${this.apiUrl}/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Lỗi khi xóa độc giả.");
    }
    return true;
  }

  // 7. Admin Reset mật khẩu (BẮT BUỘC có Token)
  async resetPassword(id, onPassword) {
    const response = await fetch(`${this.apiUrl}/${id}/password`, {
      method: "PATCH",
      headers: this.getHeaders(true),
      body: JSON.stringify(onPassword),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Lỗi khi reset mật khẩu");
    }
    return response.json();
  }

  // 8. Cập nhật Mã sinh viên (MSV)
  async updateMsv(id, newMsv) {
    const response = await fetch(`${this.apiUrl}/${id}/msv`, {
      method: "PATCH",
      headers: this.getHeaders(true),
      body: JSON.stringify({ msv: newMsv }),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Lỗi khi cập nhật Mã sinh viên");
    }
    return response.json();
  }
}
