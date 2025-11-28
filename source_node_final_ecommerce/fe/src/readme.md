# thiết kế dữ liệu mẫu

Ok, làm sẵn bộ “code thuộc tính” cho từng loại danh mục để bạn nhét vào `Category.attributes` nhé 👇
(Format gợi ý: `code` dùng trong DB, `label` hiển thị, `type` là `"text" | "number" | "color" | "select"`)

---

## 1. Điện thoại (`phone`)

```js
[
  { code: "brand",          label: "Thương hiệu",         type: "select" },
  { code: "model",          label: "Model",               type: "text"   },
  { code: "color",          label: "Màu sắc",             type: "color"  },
  { code: "storage",        label: "Dung lượng bộ nhớ",   type: "select" }, // 64GB, 128GB...
  { code: "ram",            label: "RAM",                 type: "select" }, // 4GB, 8GB...
  { code: "screen_size",    label: "Kích thước màn hình", type: "number" }, // inch
  { code: "screen_type",    label: "Loại màn hình",       type: "select" }, // OLED, IPS...
  { code: "refresh_rate",   label: "Tần số quét",         type: "number" }, // Hz
  { code: "battery_capacity", label: "Dung lượng pin (mAh)", type: "number" },
  { code: "os",             label: "Hệ điều hành",        type: "select" }, // Android, iOS
  { code: "chipset",        label: "Chip xử lý",          type: "text"   },
  { code: "camera_main",    label: "Camera sau (MP)",     type: "number" },
  { code: "camera_front",   label: "Camera trước (MP)",   type: "number" },
  { code: "sim_type",       label: "Loại SIM",            type: "select" }, // 1 SIM, 2 SIM, eSIM
  { code: "water_resistant",label: "Kháng nước/bụi",      type: "select" }  // IP67, IP68...
]
```

---

## 2. Máy tính để bàn (`desktop_pc`)

```js
[
  { code: "brand",        label: "Thương hiệu",        type: "select" },
  { code: "cpu",          label: "CPU",                type: "text"   },
  { code: "ram",          label: "RAM",                type: "select" },
  { code: "storage",      label: "Ổ cứng",             type: "select" }, // 512GB SSD, 1TB HDD...
  { code: "gpu",          label: "Card đồ họa",        type: "text"   },
  { code: "psu",          label: "Nguồn",              type: "text"   },
  { code: "case_type",    label: "Loại case",          type: "select" }, // Mini, Mid, Full
  { code: "os",           label: "Hệ điều hành",       type: "select" },
  { code: "warranty_months", label: "Bảo hành (tháng)", type: "number" }
]
```

---

## 3. Laptop (`laptop`)

```js
[
  { code: "brand",           label: "Thương hiệu",           type: "select" },
  { code: "model",           label: "Model",                 type: "text"   },
  { code: "cpu",             label: "CPU",                   type: "text"   },
  { code: "ram",             label: "RAM",                   type: "select" },
  { code: "storage",         label: "Ổ cứng",                type: "select" },
  { code: "gpu",             label: "Card đồ họa",           type: "text"   },
  { code: "screen_size",     label: "Kích thước màn hình",   type: "number" },
  { code: "screen_resolution", label: "Độ phân giải",       type: "text"   },
  { code: "refresh_rate",    label: "Tần số quét",           type: "number" },
  { code: "weight_kg",       label: "Khối lượng (kg)",       type: "number" },
  { code: "battery_wh",      label: "Pin (Wh)",              type: "number" },
  { code: "os",              label: "Hệ điều hành",          type: "select" },
  { code: "usage_type",      label: "Dòng máy",              type: "select" } // Văn phòng, Gaming, Đồ họa...
]
```

---

## 4. Đồng hồ (`watch` – bao gồm đồng hồ đeo tay / smartwatch)

```js
[
  { code: "brand",           label: "Thương hiệu",            type: "select" },
  { code: "watch_type",      label: "Loại đồng hồ",           type: "select" }, // Cơ, Quartz, Smartwatch
  { code: "gender",          label: "Giới tính",              type: "select" }, // Nam, Nữ, Unisex
  { code: "case_material",   label: "Chất liệu vỏ",           type: "select" }, // Thép, Nhựa, Titan...
  { code: "strap_material",  label: "Chất liệu dây",          type: "select" }, // Da, Kim loại, Cao su...
  { code: "strap_color",     label: "Màu dây",                type: "color"  },
  { code: "dial_color",      label: "Màu mặt",                type: "color"  },
  { code: "dial_size_mm",    label: "Đường kính mặt (mm)",    type: "number" },
  { code: "water_resistance",label: "Chống nước",             type: "select" }, // 3ATM, 5ATM...
  { code: "features",        label: "Tính năng",              type: "text"   } // ghi text tự do: đo nhịp tim...
]
```

---

## 5. Mỹ phẩm (`cosmetic` – skincare, makeup)

```js
[
  { code: "brand",          label: "Thương hiệu",           type: "select" },
  { code: "product_line",   label: "Dòng sản phẩm",         type: "text"   },
  { code: "category",       label: "Loại mỹ phẩm",          type: "select" }, // Serum, Kem dưỡng, Son...
  { code: "shade",          label: "Tông màu",              type: "select" }, // cho makeup, son
  { code: "shade_color",    label: "Màu hiển thị",          type: "color"  }, // mã màu minh họa
  { code: "volume_ml",      label: "Dung tích (ml)",        type: "number" },
  { code: "skin_type",      label: "Loại da phù hợp",       type: "select" }, // Dầu, Khô, Hỗn hợp...
  { code: "spf",            label: "Chỉ số SPF",            type: "number" },
  { code: "ingredient_highlight", label: "Thành phần nổi bật", type: "text" },
  { code: "origin_country", label: "Xuất xứ",               type: "select" }
]
```

---

## 6. Tablet (`tablet`)

Gần giống điện thoại, nhưng thêm một số phần như hỗ trợ bút, bàn phím:

```js
[
  { code: "brand",           label: "Thương hiệu",           type: "select" },
  { code: "model",           label: "Model",                 type: "text"   },
  { code: "color",           label: "Màu sắc",               type: "color"  },
  { code: "storage",         label: "Dung lượng bộ nhớ",     type: "select" },
  { code: "ram",             label: "RAM",                   type: "select" },
  { code: "screen_size",     label: "Kích thước màn hình",   type: "number" },
  { code: "screen_type",     label: "Loại màn hình",         type: "select" },
  { code: "battery_capacity",label: "Dung lượng pin (mAh)",  type: "number" },
  { code: "os",              label: "Hệ điều hành",          type: "select" },
  { code: "sim_support",     label: "Hỗ trợ SIM/4G/5G",      type: "select" },
  { code: "pen_support",     label: "Hỗ trợ bút cảm ứng",    type: "select" },
  { code: "keyboard_support",label: "Hỗ trợ bàn phím rời",   type: "select" }
]
```

---

### Cách dùng trong Category

Ví dụ Category “Điện thoại”:

```js
attributes: [
  { code: "brand", label: "Thương hiệu", type: "select" },
  { code: "color", label: "Màu sắc", type: "color" },
  { code: "storage", label: "Dung lượng bộ nhớ", type: "select" },
  { code: "ram", label: "RAM", type: "select" },
  { code: "screen_size", label: "Kích thước màn hình", type: "number" },
  // chọn vài cái quan trọng thôi, không cần nhét hết
]
```

Nếu bạn muốn, mình có thể giúp chọn **bộ “core attributes” ngắn gọn** cho mỗi category để dùng thật trong đồ án (mỗi loại chỉ 4–6 cái quan trọng nhất) thay vì list dài như trên.
