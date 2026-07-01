class AuthModel {
  constructor() {
    // API Endpoint gốc cho auth. Hãy thay đổi nếu API thực tế của bạn khác
    this.apiUrl = "/api/v1/auth";
  }

  // Hàm xử lý gọi API Đăng nhập
  async login(email, password) {
    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Nếu response không thành công (status code không phải 2xx)
      // if (!response.ok) {
      //   // Đọc nội dung trả về dưới dạng text trước, vì nó có thể không phải là JSON
      //   const errorText = await response.text();
      //   try {
      //     // Thử parse text đó thành JSON. Nếu thành công, lấy message từ đó.
      //     const errorJson = JSON.parse(errorText);
      //     throw new Error(
      //       errorJson.message || errorJson.error || "Đăng nhập thất bại.",
      //     );
      //   } catch (e) {
      //     // Nếu không parse được JSON, nghĩa là server trả về text thuần.
      //     // Ném lỗi với nội dung text đó.
      //     throw new Error(errorText || "Đăng nhập thất bại.");
      //   }
      // }
      // Tìm đến đoạn catch lỗi trong login hoặc register
      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          // Ở đây Backend trả về { "error": "..." } nên ta lấy errorJson.error
          throw new Error(errorJson.error || "Đăng nhập thất bại.");
        } catch (e) {
          // Nếu parse lỗi thì dùng e.message (chính là chuỗi "Tài khoản hoặc...")
          // Hoặc dùng errorText nếu nó là string thuần
          throw new Error(e.name === "SyntaxError" ? errorText : e.message);
        }
      }
      // Nếu response thành công, chắc chắn là JSON hợp lệ
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Hàm xử lý gọi API Đăng ký
  async register(userData) {
    try {
      const response = await fetch(`${this.apiUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(
            errorJson.error || errorJson.message || "Đăng ký thất bại.",
          );
        } catch (e) {
          throw new Error(e.message || errorText || "Đăng ký thất bại.");
        }
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}
