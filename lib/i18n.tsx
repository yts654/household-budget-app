"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export type Locale = "en" | "ja" | "vi";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Locale, string>> = {
  // ===== Brand =====
  "brand.name": { en: "Kakeibo", ja: "家計簿", vi: "Kakeibo" },
  "brand.subtitle": { en: "Budget Tracker", ja: "家計管理", vi: "Quản lý chi tiêu" },
  "brand.fullTitle": { en: "Household Budget Tracker", ja: "家計簿 - 予算管理ツール", vi: "Quản lý ngân sách gia đình" },

  // ===== Navigation =====
  "nav.dashboard": { en: "Dashboard", ja: "ダッシュボード", vi: "Tổng quan" },
  "nav.transactions": { en: "Transactions", ja: "取引履歴", vi: "Giao dịch" },
  "nav.portfolio": { en: "Portfolio", ja: "資産管理", vi: "Danh mục" },
  "nav.analytics": { en: "Analytics", ja: "分析", vi: "Phân tích" },
  "nav.settings": { en: "Settings", ja: "設定", vi: "Cài đặt" },
  "nav.home": { en: "Home", ja: "ホーム", vi: "Trang chủ" },
  "nav.txns": { en: "Txns", ja: "取引", vi: "GD" },

  // ===== Summary Cards =====
  "summary.monthlyIncome": { en: "Monthly Income", ja: "月間収入", vi: "Thu nhập tháng" },
  "summary.monthlyExpenses": { en: "Monthly Expenses", ja: "月間支出", vi: "Chi tiêu tháng" },
  "summary.balance": { en: "Balance", ja: "収支", vi: "Số dư" },
  "summary.savingsRate": { en: "Savings Rate", ja: "貯蓄率", vi: "Tỷ lệ tiết kiệm" },

  // ===== Monthly Chart =====
  "chart.monthlyOverview": { en: "Monthly Overview", ja: "月別概要", vi: "Tổng quan hàng tháng" },
  "chart.income": { en: "Income", ja: "収入", vi: "Thu nhập" },
  "chart.expenses": { en: "Expenses", ja: "支出", vi: "Chi tiêu" },

  // ===== Category Chart =====
  "chart.spendingByCategory": { en: "Spending by Category", ja: "カテゴリ別支出", vi: "Chi tiêu theo danh mục" },
  "chart.total": { en: "Total", ja: "合計", vi: "Tổng" },

  // ===== Budget Progress =====
  "budget.progress": { en: "Budget Progress", ja: "予算進捗", vi: "Tiến độ ngân sách" },
  "budget.noData": { en: "No expense data this month", ja: "今月の支出データがありません", vi: "Không có dữ liệu chi tiêu tháng này" },

  // ===== Sidebar =====
  "sidebar.monthlyGoal": { en: "Monthly Goal", ja: "月間目標", vi: "Mục tiêu tháng" },
  "sidebar.keepUnder": { en: "Keep spending under", ja: "支出上限", vi: "Giữ chi tiêu dưới" },
  "sidebar.spent": { en: "spent", ja: "使用済み", vi: "đã chi" },

  // ===== Transactions View =====
  "transactions.all": { en: "All Transactions", ja: "すべての取引", vi: "Tất cả giao dịch" },
  "transactions.entries": { en: "entries", ja: "件", vi: "mục" },
  "transactions.noData": { en: "No transactions this month", ja: "今月の取引がありません", vi: "Không có giao dịch tháng này" },
  "transactions.add": { en: "Add Transaction", ja: "取引を追加", vi: "Thêm giao dịch" },

  // ===== Add Transaction Dialog =====
  "addTx.title": { en: "New Transaction", ja: "新規取引", vi: "Giao dịch mới" },
  "addTx.dialogDesc": { en: "Enter the details for a new income or expense entry. Amounts are in JPY.", ja: "新しい収入または支出の詳細を入力してください。金額は日本円で入力します。", vi: "Nhập chi tiết cho khoản thu nhập hoặc chi tiêu mới. Số tiền tính bằng JPY." },
  "addTx.addEntry": { en: "Add Entry", ja: "追加", vi: "Thêm" },
  "addTx.type": { en: "Type", ja: "種別", vi: "Loại" },
  "addTx.expense": { en: "Expense", ja: "支出", vi: "Chi tiêu" },
  "addTx.income": { en: "Income", ja: "収入", vi: "Thu nhập" },
  "addTx.category": { en: "Category", ja: "カテゴリ", vi: "Danh mục" },
  "addTx.amount": { en: "Amount", ja: "金額", vi: "Số tiền" },
  "addTx.description": { en: "Description", ja: "説明", vi: "Mô tả" },
  "addTx.date": { en: "Date", ja: "日付", vi: "Ngày" },
  "addTx.placeholder.desc": { en: "Grocery shopping", ja: "食料品の買い物", vi: "Mua sắm tạp hóa" },

  // ===== Analytics View =====
  "analytics.summary": { en: "Summary", ja: "概要", vi: "Tóm tắt" },
  "analytics.income": { en: "Income", ja: "収入", vi: "Thu nhập" },
  "analytics.expenses": { en: "Expenses", ja: "支出", vi: "Chi tiêu" },
  "analytics.netSavings": { en: "Net Savings", ja: "純貯蓄", vi: "Tiết kiệm ròng" },
  "analytics.incomeSources": { en: "Income Sources", ja: "収入源", vi: "Nguồn thu nhập" },
  "analytics.expenseCategories": { en: "Expense Categories", ja: "支出カテゴリ", vi: "Danh mục chi tiêu" },
  "analytics.vs": { en: "vs", ja: "vs", vi: "so với" },
  "analytics.source": { en: "Source", ja: "収入源", vi: "Nguồn" },
  "analytics.category": { en: "Category", ja: "カテゴリ", vi: "Danh mục" },
  "analytics.change": { en: "Change", ja: "変動", vi: "Thay đổi" },
  "analytics.new": { en: "New", ja: "新規", vi: "Mới" },
  "analytics.noIncomeData": { en: "No income data for comparison", ja: "比較する収入データがありません", vi: "Không có dữ liệu thu nhập để so sánh" },
  "analytics.noExpenseData": { en: "No expense data for comparison", ja: "比較する支出データがありません", vi: "Không có dữ liệu chi tiêu để so sánh" },

  // ===== Analytics Summary Text =====
  "analytics.incomeRose": { en: "Income rose", ja: "収入が上昇", vi: "Thu nhập tăng" },
  "analytics.comparedTo": { en: "compared to", ja: "と比較して", vi: "so với" },
  "analytics.reaching": { en: "reaching", ja: "に達しました", vi: "đạt" },
  "analytics.incomeDeclined": { en: "Income declined", ja: "収入が減少", vi: "Thu nhập giảm" },
  "analytics.from": { en: "from", ja: "から", vi: "từ" },
  "analytics.totaling": { en: "totaling", ja: "合計", vi: "tổng cộng" },
  "analytics.incomeSteady": { en: "Income remained steady at", ja: "収入は安定しています：", vi: "Thu nhập ổn định ở mức" },
  "analytics.spendingIncreased": { en: "Spending increased by", ja: "支出が増加", vi: "Chi tiêu tăng" },
  "analytics.to": { en: "to", ja: "まで", vi: "lên" },
  "analytics.spendingDropped": { en: "Spending dropped", ja: "支出が減少", vi: "Chi tiêu giảm" },
  "analytics.downTo": { en: "down to", ja: "まで下がり", vi: "xuống còn" },
  "analytics.spendingFlat": { en: "Spending held flat at", ja: "支出は横ばいです：", vi: "Chi tiêu giữ nguyên ở mức" },
  "analytics.savingsImproved": { en: "Net savings improved to", ja: "純貯蓄が改善：", vi: "Tiết kiệm ròng cải thiện lên" },
  "analytics.savingsWere": { en: "Net savings were", ja: "純貯蓄：", vi: "Tiết kiệm ròng là" },
  "analytics.deficit": { en: "The month ended with a deficit of", ja: "今月は赤字でした：", vi: "Tháng này kết thúc với thâm hụt" },
  "analytics.biggestIncrease": { en: "Biggest increase:", ja: "最大の増加：", vi: "Tăng nhiều nhất:" },
  "analytics.largestCut": { en: "Largest cut:", ja: "最大の削減：", vi: "Giảm nhiều nhất:" },

  // ===== Portfolio View =====
  "portfolio.assetAllocation": { en: "Asset Allocation", ja: "資産配分", vi: "Phân bổ tài sản" },
  "portfolio.byCategory": { en: "By Category", ja: "カテゴリ別", vi: "Theo danh mục" },
  "portfolio.netWorth": { en: "Net Worth", ja: "純資産", vi: "Giá trị ròng" },
  "portfolio.allAssets": { en: "All Assets", ja: "すべての資産", vi: "Tất cả tài sản" },
  "portfolio.holdings": { en: "holdings", ja: "件", vi: "khoản" },
  "portfolio.noAssets": { en: "No assets recorded", ja: "資産が登録されていません", vi: "Chưa có tài sản nào" },
  "portfolio.addAsset": { en: "Add Asset", ja: "資産を追加", vi: "Thêm tài sản" },
  "portfolio.types": { en: "types", ja: "種類", vi: "loại" },
  "portfolio.items": { en: "items", ja: "件", vi: "mục" },

  // ===== Asset Allocation Names =====
  "allocation.liquid": { en: "Liquid", ja: "流動資産", vi: "Thanh khoản" },
  "allocation.investment": { en: "Investment", ja: "投資", vi: "Đầu tư" },
  "allocation.fixed": { en: "Fixed", ja: "固定資産", vi: "Cố định" },
  "allocation.savings": { en: "Savings", ja: "貯蓄", vi: "Tiết kiệm" },
  "allocation.other": { en: "Other", ja: "その他", vi: "Khác" },

  // ===== Asset Summary Cards =====
  "assetSummary.accumulated": { en: "Accumulated Savings", ja: "累計貯蓄", vi: "Tiết kiệm tích lũy" },
  "assetSummary.fromBudget": { en: "From monthly budget", ja: "月間予算から", vi: "Từ ngân sách hàng tháng" },
  "assetSummary.investments": { en: "Investments", ja: "投資", vi: "Đầu tư" },
  "assetSummary.stocksEtf": { en: "Stocks, ETFs, Crypto", ja: "株式、ETF、暗号資産", vi: "Cổ phiếu, ETF, Crypto" },
  "assetSummary.liquidFixed": { en: "Liquid + Fixed", ja: "流動 + 固定", vi: "Thanh khoản + Cố định" },
  "assetSummary.liquid": { en: "Liquid", ja: "流動", vi: "Thanh khoản" },

  // ===== Add Asset Dialog =====
  "addAsset.title": { en: "New Asset", ja: "新規資産", vi: "Tài sản mới" },
  "addAsset.description": { en: "Register a new asset holding. Amounts are in JPY.", ja: "新しい資産を登録します。金額は日本円です。", vi: "Đăng ký tài sản mới. Số tiền tính bằng JPY." },
  "addAsset.submit": { en: "Add Asset", ja: "追加", vi: "Thêm" },
  "addAsset.category": { en: "Category", ja: "カテゴリ", vi: "Danh mục" },
  "addAsset.name": { en: "Name", ja: "名称", vi: "Tên" },
  "addAsset.institution": { en: "Institution", ja: "金融機関", vi: "Tổ chức" },
  "addAsset.currentValue": { en: "Current Value", ja: "現在の評価額", vi: "Giá trị hiện tại" },
  "addAsset.note": { en: "Note", ja: "メモ", vi: "Ghi chú" },
  "addAsset.optional": { en: "optional", ja: "任意", vi: "tùy chọn" },
  "addAsset.placeholder.name": { en: "e.g. Main Savings, Toyota Stock", ja: "例：メイン貯蓄、トヨタ株", vi: "VD: Tiết kiệm chính, Cổ phiếu Toyota" },
  "addAsset.placeholder.institution": { en: "e.g. MUFG Bank, SBI Securities", ja: "例：三菱UFJ銀行、SBI証券", vi: "VD: Ngân hàng MUFG, SBI Securities" },
  "addAsset.placeholder.note": { en: "e.g. NISA account, matures 2027", ja: "例：NISA口座、2027年満期", vi: "VD: Tài khoản NISA, đáo hạn 2027" },

  // ===== Settings View =====
  "settings.profile": { en: "Profile", ja: "プロフィール", vi: "Hồ sơ" },
  "settings.displayName": { en: "Display Name", ja: "表示名", vi: "Tên hiển thị" },
  "settings.email": { en: "Email", ja: "メールアドレス", vi: "Email" },
  "settings.emailVerification": { en: "Changing your email requires verification via the new address.", ja: "メールアドレスの変更には新しいアドレスでの確認が必要です。", vi: "Thay đổi email yêu cầu xác minh qua địa chỉ mới." },
  "settings.saveProfile": { en: "Save Profile", ja: "保存", vi: "Lưu hồ sơ" },
  "settings.changePassword": { en: "Change Password", ja: "パスワード変更", vi: "Đổi mật khẩu" },
  "settings.currentPassword": { en: "Current Password", ja: "現在のパスワード", vi: "Mật khẩu hiện tại" },
  "settings.newPassword": { en: "New Password", ja: "新しいパスワード", vi: "Mật khẩu mới" },
  "settings.confirmNewPassword": { en: "Confirm New Password", ja: "新しいパスワードの確認", vi: "Xác nhận mật khẩu mới" },
  "settings.changePasswordBtn": { en: "Change Password", ja: "パスワードを変更", vi: "Đổi mật khẩu" },
  "settings.budgetLimits": { en: "Monthly Budget Limits", ja: "月間予算上限", vi: "Giới hạn ngân sách hàng tháng" },
  "settings.saveBudget": { en: "Save Budget Limits", ja: "予算を保存", vi: "Lưu ngân sách" },
  "settings.exchangeRate": { en: "Exchange Rate", ja: "為替レート", vi: "Tỷ giá" },
  "settings.baseCurrency": { en: "Base currency:", ja: "基準通貨：", vi: "Tiền tệ cơ sở:" },
  "settings.displayCurrency": { en: "Display currency:", ja: "表示通貨：", vi: "Tiền tệ hiển thị:" },
  "settings.toggleInHeader": { en: "(toggle in the header)", ja: "（ヘッダーで切替）", vi: "(chuyển đổi ở đầu trang)" },
  "settings.rateFetched": { en: "Rate fetched:", ja: "レート取得日：", vi: "Tỷ giá lấy ngày:" },
  "settings.signedInAs": { en: "Signed in as", ja: "ログイン中：", vi: "Đã đăng nhập với" },
  "settings.signOut": { en: "Sign Out", ja: "ログアウト", vi: "Đăng xuất" },
  "settings.passwordPlaceholder": { en: "Min 10 chars, upper+lower+number+special", ja: "10文字以上、大小英字+数字+記号", vi: "Tối thiểu 10 ký tự, chữ hoa+thường+số+ký tự đặc biệt" },
  "settings.yourName": { en: "Your name", ja: "あなたの名前", vi: "Tên của bạn" },

  // ===== Login Page =====
  "login.signIn": { en: "Sign In", ja: "ログイン", vi: "Đăng nhập" },
  "login.createAccount": { en: "Create Account", ja: "アカウント作成", vi: "Tạo tài khoản" },
  "login.email": { en: "Email", ja: "メールアドレス", vi: "Email" },
  "login.password": { en: "Password", ja: "パスワード", vi: "Mật khẩu" },
  "login.displayName": { en: "Display Name", ja: "表示名", vi: "Tên hiển thị" },
  "login.confirmPassword": { en: "Confirm Password", ja: "パスワードの確認", vi: "Xác nhận mật khẩu" },
  "login.resendVerification": { en: "Resend Verification Email", ja: "確認メールを再送", vi: "Gửi lại email xác minh" },
  "login.yourName": { en: "Your Name", ja: "あなたの名前", vi: "Tên của bạn" },
  "login.invalidCredentials": { en: "Invalid email or password.", ja: "メールアドレスまたはパスワードが正しくありません。", vi: "Email hoặc mật khẩu không đúng." },
  "login.verifyEmail": { en: "Please verify your email before signing in.", ja: "ログイン前にメールアドレスを確認してください。", vi: "Vui lòng xác minh email trước khi đăng nhập." },
  "login.accountLocked": { en: "Too many failed attempts. Please try again in 15 minutes.", ja: "ログイン失敗が多すぎます。15分後にお試しください。", vi: "Quá nhiều lần thất bại. Vui lòng thử lại sau 15 phút." },
  "login.passwordsNoMatch": { en: "Passwords do not match.", ja: "パスワードが一致しません。", vi: "Mật khẩu không khớp." },
  "login.checkEmail": { en: "Please check your email to verify your account.", ja: "メールを確認してアカウントを認証してください。", vi: "Vui lòng kiểm tra email để xác minh tài khoản." },
  "login.verificationSent": { en: "Verification email sent. Please check your inbox.", ja: "確認メールを送信しました。受信トレイを確認してください。", vi: "Email xác minh đã được gửi. Vui lòng kiểm tra hộp thư." },
  "login.resendFailed": { en: "Failed to resend verification email.", ja: "確認メールの再送に失敗しました。", vi: "Gửi lại email xác minh thất bại." },

  // ===== Password Strength =====
  "pw.tenChars": { en: "10+ chars", ja: "10文字以上", vi: "10+ ký tự" },
  "pw.tenCharsFull": { en: "10+ characters", ja: "10文字以上", vi: "10+ ký tự" },
  "pw.lowercase": { en: "Lowercase", ja: "小文字", vi: "Chữ thường" },
  "pw.uppercase": { en: "Uppercase", ja: "大文字", vi: "Chữ hoa" },
  "pw.number": { en: "Number", ja: "数字", vi: "Số" },
  "pw.special": { en: "Special char", ja: "記号", vi: "Ký tự đặc biệt" },
  "pw.weak": { en: "Weak", ja: "弱い", vi: "Yếu" },
  "pw.fair": { en: "Fair", ja: "まあまあ", vi: "Tạm" },
  "pw.good": { en: "Good", ja: "良い", vi: "Tốt" },
  "pw.strong": { en: "Strong", ja: "強い", vi: "Mạnh" },

  // ===== Toast Messages =====
  "toast.profileUpdated": { en: "Profile updated.", ja: "プロフィールを更新しました。", vi: "Đã cập nhật hồ sơ." },
  "toast.profileFailed": { en: "Failed to update profile.", ja: "プロフィールの更新に失敗しました。", vi: "Cập nhật hồ sơ thất bại." },
  "toast.passwordChanged": { en: "Password changed successfully.", ja: "パスワードを変更しました。", vi: "Đổi mật khẩu thành công." },
  "toast.passwordFailed": { en: "Failed to change password.", ja: "パスワードの変更に失敗しました。", vi: "Đổi mật khẩu thất bại." },
  "toast.budgetSaved": { en: "Budget limits saved.", ja: "予算上限を保存しました。", vi: "Đã lưu giới hạn ngân sách." },
  "toast.passwordsNoMatch": { en: "New passwords do not match.", ja: "新しいパスワードが一致しません。", vi: "Mật khẩu mới không khớp." },

  // ===== Category Labels (Expense) =====
  "category.food": { en: "Food", ja: "食費", vi: "Ăn uống" },
  "category.transport": { en: "Transport", ja: "交通費", vi: "Đi lại" },
  "category.housing": { en: "Housing", ja: "住居費", vi: "Nhà ở" },
  "category.utilities": { en: "Utilities", ja: "光熱費", vi: "Tiện ích" },
  "category.entertainment": { en: "Entertainment", ja: "娯楽", vi: "Giải trí" },
  "category.shopping": { en: "Shopping", ja: "買い物", vi: "Mua sắm" },
  "category.health": { en: "Health", ja: "医療", vi: "Sức khỏe" },
  "category.education": { en: "Education", ja: "教育", vi: "Giáo dục" },
  "category.savings": { en: "Savings", ja: "貯蓄", vi: "Tiết kiệm" },
  "category.income": { en: "Income", ja: "収入", vi: "Thu nhập" },
  "category.other": { en: "Other", ja: "その他", vi: "Khác" },

  // ===== Asset Category Labels =====
  "assetCat.savings_account": { en: "Savings Account", ja: "普通預金", vi: "Tài khoản tiết kiệm" },
  "assetCat.fixed_deposit": { en: "Fixed Deposit", ja: "定期預金", vi: "Tiền gửi có kỳ hạn" },
  "assetCat.stocks": { en: "Stocks", ja: "株式", vi: "Cổ phiếu" },
  "assetCat.bonds": { en: "Bonds", ja: "債券", vi: "Trái phiếu" },
  "assetCat.mutual_funds": { en: "Mutual Funds", ja: "投資信託", vi: "Quỹ tương hỗ" },
  "assetCat.etf": { en: "ETF", ja: "ETF", vi: "ETF" },
  "assetCat.real_estate": { en: "Real Estate", ja: "不動産", vi: "Bất động sản" },
  "assetCat.cryptocurrency": { en: "Crypto", ja: "暗号資産", vi: "Tiền điện tử" },
  "assetCat.pension": { en: "Pension / iDeCo", ja: "年金 / iDeCo", vi: "Lương hưu / iDeCo" },
  "assetCat.cash": { en: "Cash on Hand", ja: "現金", vi: "Tiền mặt" },
  "assetCat.other": { en: "Other", ja: "その他", vi: "Khác" },

  // ===== Chart Tooltip =====
  "tooltip.income": { en: "Income", ja: "収入", vi: "Thu nhập" },
  "tooltip.expense": { en: "Expense", ja: "支出", vi: "Chi tiêu" },

  // ===== Month Names (Full) =====
  "month.0": { en: "January", ja: "1月", vi: "Tháng 1" },
  "month.1": { en: "February", ja: "2月", vi: "Tháng 2" },
  "month.2": { en: "March", ja: "3月", vi: "Tháng 3" },
  "month.3": { en: "April", ja: "4月", vi: "Tháng 4" },
  "month.4": { en: "May", ja: "5月", vi: "Tháng 5" },
  "month.5": { en: "June", ja: "6月", vi: "Tháng 6" },
  "month.6": { en: "July", ja: "7月", vi: "Tháng 7" },
  "month.7": { en: "August", ja: "8月", vi: "Tháng 8" },
  "month.8": { en: "September", ja: "9月", vi: "Tháng 9" },
  "month.9": { en: "October", ja: "10月", vi: "Tháng 10" },
  "month.10": { en: "November", ja: "11月", vi: "Tháng 11" },
  "month.11": { en: "December", ja: "12月", vi: "Tháng 12" },

  // ===== Month Names (Short) =====
  "monthShort.0": { en: "Jan", ja: "1月", vi: "Th1" },
  "monthShort.1": { en: "Feb", ja: "2月", vi: "Th2" },
  "monthShort.2": { en: "Mar", ja: "3月", vi: "Th3" },
  "monthShort.3": { en: "Apr", ja: "4月", vi: "Th4" },
  "monthShort.4": { en: "May", ja: "5月", vi: "Th5" },
  "monthShort.5": { en: "Jun", ja: "6月", vi: "Th6" },
  "monthShort.6": { en: "Jul", ja: "7月", vi: "Th7" },
  "monthShort.7": { en: "Aug", ja: "8月", vi: "Th8" },
  "monthShort.8": { en: "Sep", ja: "9月", vi: "Th9" },
  "monthShort.9": { en: "Oct", ja: "10月", vi: "Th10" },
  "monthShort.10": { en: "Nov", ja: "11月", vi: "Th11" },
  "monthShort.11": { en: "Dec", ja: "12月", vi: "Th12" },

  // ===== Language Names =====
  "lang.en": { en: "English", ja: "English", vi: "English" },
  "lang.ja": { en: "日本語", ja: "日本語", vi: "日本語" },
  "lang.vi": { en: "Tiếng Việt", ja: "Tiếng Việt", vi: "Tiếng Việt" },
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("app-locale") as Locale | null;
    if (saved && (saved === "en" || saved === "ja" || saved === "vi")) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("app-locale", l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[locale] || entry.en || key;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

/** Helper: get translated category label */
export function useCategoryLabel() {
  const { t } = useLanguage();
  return useCallback(
    (category: string): string => t(`category.${category}`),
    [t]
  );
}

/** Helper: get translated asset category label */
export function useAssetCategoryLabel() {
  const { t } = useLanguage();
  return useCallback(
    (category: string): string => t(`assetCat.${category}`),
    [t]
  );
}

/** Helper: get translated month name */
export function useMonthName() {
  const { t } = useLanguage();
  return useCallback(
    (monthIndex: number, short?: boolean): string => {
      const prefix = short ? "monthShort" : "month";
      return t(`${prefix}.${monthIndex}`);
    },
    [t]
  );
}
