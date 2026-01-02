# 🧪 Test Checklist: Create Lesson Form ("Introduction to Motors")

## ✅ Pre-Test Setup

- [ ] Frontend chạy tại `http://localhost:5173`
- [ ] Backend API chạy tại `http://localhost:8000`
- [ ] User đã login vào admin panel
- [ ] Có ít nhất 1 subcourse tồn tại trong database

---

## 🎯 Test Case 1: Create Lesson với Dữ Liệu Đầy Đủ

### 1. Navigate to Lessons Management

- [ ] Click vào "Quản lý Bài Học" / "Lessons" trong admin menu
- [ ] Form hiển thị với danh sách bài học hiện tại

### 2. Click "+ Tạo Bài Học"

- [ ] Modal mở ra với header "Tạo bài học mới"
- [ ] Form khởi tạo với tab "Cơ bản" (Basic) mặc định
- [ ] 9 tabs hiển thị đúng: 📝 📋 🎯 🏗️ 📋 🔨 📄 📎 💪 ❓
- [ ] Có nút "✕" để đóng modal
- [ ] Nút "Hủy" và "✓ Lưu bài học" hiển thị ở dưới

### 3. Fill Basic Info Tab

- [ ] Chọn Subcourse: "Select any available subcourse"
- [ ] Title: "Introduction to Motors"
- [ ] Slug: "introduction-to-motors"
- [ ] Overview: "Bài học này giới thiệu các khái niệm cơ bản về động cơ..."
- [ ] Status: "Nháp" (Draft)
- [ ] ✅ **Không có validation error**

### 4. Fill Objectives Tab (🎯)

- [ ] Kiến thức: "Hiểu được cấu tạo và nguyên lý hoạt động của động cơ điện"
- [ ] Tư duy: "Phân tích mối quan hệ giữa lý thuyết và thực hành..."
- [ ] Kỹ năng: "Lắp ráp và kiểm tra động cơ đơn giản..."
- [ ] Thái độ: "Phát triển tính cẩn thận và trách nhiệm..."
- [ ] ✅ **Tất cả 4 fields có dữ liệu**

### 5. Fill Models Tab (🏗️)

- [ ] Thêm Model 1:
  - Tên: "Motor Basics Model"
  - Mô tả: "Mô hình cơ bản về cấu tạo của động cơ điện DC"
  - Upload file (optional): Chọn 1 ảnh hoặc video
- [ ] Thêm Model 2:
  - Tên: "Motor Circuits Model"
  - Mô tả: "Mô hình mạch điện điều khiển động cơ"
  - Upload file (optional)
- [ ] Click "+ Thêm mô hình" thêm model (nếu cần)
- [ ] ✅ **2 models tồn tại, có thể xóa từng cái**

### 6. Fill Preparation Tab (📋)

- [ ] Ghi chú: "Chuẩn bị các vật dụng sau:\n1. Động cơ DC nhỏ\n2. Pin AA\n3. Dây dẫn..."
- [ ] Upload file (optional): Chọn 1 ảnh, video, hoặc PDF
- [ ] ✅ **Notes khác rỗng, media optional**

### 7. Fill Builds Tab (🔨)

- [ ] Thêm Build 1:
  - Loại: PDF
  - Tiêu đề: "Assembly Instructions (PDF)"
  - Mô tả: "Hướng dẫn từng bước lắp ráp động cơ"
  - Upload PDF (optional)
- [ ] Thêm Build 2:
  - Loại: Hình ảnh / Slides
  - Tiêu đề: "Visual Slides"
  - Mô tả: "Bộ ảnh minh hoạ chi tiết các bước lắp ráp"
  - Upload ảnh (optional)
- [ ] ✅ **2 builds có type khác nhau (pdf, images)**

### 8. Fill Content Blocks Tab (📄)

- [ ] Thêm Block 1:
  - Tiêu đề: "How Electric Motors Work"
  - Tiêu đề phụ: "Nguyên lý hoạt động"
  - Mô tả: "Giải thích chi tiết về từ trường..."
  - Văn bản sử dụng: "Dùng cho phần lý thuyết..."
  - Văn bản ví dụ: "Ví dụ: Khi dòng điện chạy qua..."
  - Upload media (optional)
- [ ] Thêm Block 2:
  - Tiêu đề: "Common Motor Applications"
  - Tiêu đề phụ: "Ứng dụng thực tế"
  - Mô tả: "Các ứng dụng của động cơ..."
  - Văn bản sử dụng, ví dụ, media...
- [ ] ✅ **2 content blocks đầy đủ dữ liệu**

### 9. Fill Attachments Tab (📎)

- [ ] Thêm Attachment 1:
  - Tiêu đề: "Motor Assembly Code"
  - Loại tệp: SB3
  - Mô tả: "Mã Scratch để lập trình..."
  - Upload file (optional)
- [ ] Thêm Attachment 2:
  - Tiêu đề: "Circuit Diagram (PDF)"
  - Loại tệp: PDF
  - Mô tả: "Sơ đồ mạch điện hoàn chỉnh"
  - Upload file (optional)
- [ ] ✅ **2 attachments, types khác nhau (SB3, PDF)**

### 10. Fill Challenges Tab (💪)

- [ ] Thêm Challenge 1:
  - Tiêu đề: "Build a Simple Motor"
  - Tiêu đề phụ: "Thử thách lắp ráp"
  - Mô tả: "Học viên cần lắp ráp một động cơ hoạt động..."
  - Hướng dẫn: "1. Chuẩn bị các vật liệu...\n2. Theo hướng dẫn..."
  - Upload media (optional)
- [ ] ✅ **1 challenge có đầy đủ hướng dẫn**

### 11. Fill Quizzes Tab (❓)

- [ ] Thêm Quiz 1 (Single Choice):
  - Tiêu đề: "What is the main principle..."
  - Mô tả: "Câu hỏi về nguyên lý hoạt động..."
  - Loại: "Một lựa chọn"
  - Lựa chọn 1: "Từ trường và lực Lorentz" ✓ (Đúng)
    - Giải thích: "Chính xác! Động cơ hoạt động..."
  - Lựa chọn 2: "Lực ma sát" (Sai)
    - Giải thích: "Không đúng..."
  - Lựa chọn 3: "Áp suất chất lỏng" (Sai)
    - Giải thích: "Không đúng..."
- [ ] Thêm Quiz 2 (Multiple Choice):
  - Tiêu đề: "Which of the following..."
  - Loại: "Nhiều lựa chọn"
  - Lựa chọn: "Quạt điện" ✓, "Máy giặt" ✓, "Ô tô" ✓, "Bàn chải" (X)
  - Giải thích cho mỗi lựa chọn
- [ ] ✅ **2 quizzes, types khác nhau (single, multiple)**

---

## 🚀 Test Case 2: Submit Form & Verify Success

### 1. Click "✓ Lưu bài học"

- [ ] Button chuyển sang "⏳ Đang lưu..." (disabled)
- [ ] Modal không đóng (giữ nguyên)
- [ ] Không hiển thị error message

### 2. Verify API Call

- [ ] Backend nhận request tạo lesson
- [ ] Payload có structure đúng (không thiếu field)
- [ ] Nested arrays/objects được serialized đúng

### 3. Wait for Response

- [ ] Response trả về lesson object với id
- [ ] Modal đóng tự động
- [ ] Quay lại danh sách lessons
- [ ] Lesson "Introduction to Motors" hiển thị trong list
- [ ] ✅ **Thông báo success (nếu có)**

---

## ❌ Test Case 3: Validation & Error Handling

### 1. Try Submit Blank Form

- [ ] Click "+ Tạo Bài Học"
- [ ] Click "✓ Lưu bài học" ngay (không điền gì)
- [ ] Validation errors hiển thị bằng **tiếng Việt**:
  - "Tiểu khóa là bắt buộc"
  - "Tiêu đề là bắt buộc"
  - "Slug là bắt buộc"
- [ ] ✅ **Form không submit**

### 2. Try Invalid Slug

- [ ] Title: "Test Lesson"
- [ ] Slug: "Test-Lesson-123!" (chứa khoảng trắng, ký tự đặc biệt)
- [ ] Submit
- [ ] Error: "Slug chỉ chứa chữ cái thường, số và dấu gạch ngang"
- [ ] ✅ **Validation message tiếng Việt**

### 3. Try Upload Invalid File

- [ ] Tab Models
- [ ] Click chọn file
- [ ] Chọn file .exe hoặc .zip (không phải image/video/PDF)
- [ ] Alert: "Chỉ cho phép tệp hình ảnh, video hoặc PDF"
- [ ] ✅ **File không được thêm**

### 4. Try Upload Large File

- [ ] Upload file > 50MB
- [ ] Alert: "Tệp quá lớn (tối đa 50MB)"
- [ ] ✅ **File bị từ chối**

---

## 🔄 Test Case 4: Edit Existing Lesson

### 1. Click "Xem" trên lesson vừa tạo

- [ ] Navigate đến edit page (hoặc modal)
- [ ] Form load dữ liệu cũ
- [ ] Tab "Cơ bản" hiển thị: Title, Slug, Status cũ

### 2. Modify 1 Field

- [ ] Thay đổi Title: "Introduction to Motors - Advanced"
- [ ] Click "✓ Lưu bài học"

### 3. Verify Changes

- [ ] Reload page
- [ ] Lesson vẫn tồn tại với tên mới
- [ ] ✅ **Edit thành công, không mất dữ liệu nested**

---

## 🔧 Test Case 5: UI/UX & Responsiveness

### 1. Tab Navigation

- [ ] Click từng tab, data được giữ lại
- [ ] Scroll về dưới trong tab không bị jump
- [ ] Active tab highlight rõ ràng (blue background)

### 2. Mobile Responsiveness

- [ ] Mở DevTools (F12) → Toggle device toolbar
- [ ] Chọn "iPhone 12" / "iPad"
- [ ] Form vẫn readable, không bị vỡ layout
- [ ] Buttons tapped được dễ dàng

### 3. Error Messages

- [ ] Validation errors hiển thị **bên dưới input** (tiếng Việt)
- [ ] Server errors hiển thị ở **top of modal** (tiếng Việt)
- [ ] ✅ **Rõ ràng, dễ hiểu**

### 4. Close Modal

- [ ] Click nút "✕" ở góc header
- [ ] Hoặc nhấn Escape key
- [ ] Modal đóng, quay lại danh sách
- [ ] ✅ **Form data không bị lưu nếu không submit**

---

## 📋 Final Checklist

### Code Quality

- [ ] Không có console errors
- [ ] Không có console warnings
- [ ] TypeScript compile không lỗi
- [ ] Không có "uncontrolled" input warnings
- [ ] Không có missing key trong lists

### Data Integrity

- [ ] Objectives là single object (không array)
- [ ] Models, Builds, Quizzes là arrays
- [ ] Nested data được submit đúng structure
- [ ] Reload → fetch lại → dữ liệu không mất

### UX Excellence

- [ ] Form rõ ràng, dễ hiểu
- [ ] Tiêu đề tabs rõ ràng (icons + text)
- [ ] Buttons có hover states
- [ ] Loading state hiển thị
- [ ] Error messages giúp ích

### Performance

- [ ] Form load < 1s
- [ ] Submit < 2s
- [ ] No lag khi tab switching
- [ ] File upload preview smooth

---

## 🎉 Success Criteria

✅ **All test cases PASS**
✅ **No errors in console**
✅ **UI responsive & beautiful**
✅ **Data persists correctly**
✅ **Vietnamese messages throughout**

**Status: READY FOR PRODUCTION** 🚀
