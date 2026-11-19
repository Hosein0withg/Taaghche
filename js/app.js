const AppState = {
    user: Storage.get("user", null),
    users: Storage.get("users", []),
    favorites: [],
    library: [],
    settings: Storage.get("settings", { theme: "light", fontSize: "medium" }),

    initUserData: function () {
        if (this.user && this.user.phone) {
            this.favorites = Storage.get(`favorites_${this.user.phone}`, []);
            this.library = Storage.get(`library_${this.user.phone}`, []);
        } else {
            this.favorites = [];
            this.library = [];
        }
    },

    updateSettings: function (partialSettings) {
        this.settings = { ...this.settings, ...partialSettings };
        Storage.set("settings", this.settings);
    },

    toggleFavorite: function (bookId) {
        if (!this.user) return;
        const index = this.favorites.indexOf(bookId);
        if (index === -1) {
            this.favorites.push(bookId);
        } else {
            this.favorites.splice(index, 1);
        }
        Storage.set(`favorites_${this.user.phone}`, this.favorites);
    },

    addToLibrary: function (bookId) {
        if (!this.user) return false;
        if (!this.library.includes(bookId)) {
            this.library.push(bookId);
            Storage.set(`library_${this.user.phone}`, this.library);
            return true;
        }
        return false;
    },

    login: function (name, phone) {
        const exists = this.users.some(
            (u) => u.phone === phone && u.name === name,
        );
        if (!exists) {
            this.users.push({ name, phone });
            Storage.set("users", this.users);
        }
        this.user = { name, phone };
        Storage.set("user", this.user);
        this.initUserData();
    },

    logout: function () {
        this.user = null;
        Storage.set("user", null);
        this.favorites = [];
        this.library = [];
    },
};

AppState.initUserData();

const FiltersState = {
    query: "",
    category: "",
    isFree: false,
    sort: "",
    preset: "",
};

document.addEventListener("DOMContentLoaded", () => {
    const homeLogo = document.getElementById("home-logo");
    const bannerSection = document.getElementById("banner-section");
    const homeRowsContainer = document.getElementById("home-rows-container");
    const searchView = document.getElementById("search-view");
    const bookDetailsView = document.getElementById("book-details-view");
    const libraryView = document.getElementById("library-view");
    const readerView = document.getElementById("reader-view");
    const searchResultsContainer = "search-results-container";

    const readerModeBadge = document.getElementById("reader-mode-badge");
    const readerBookTitle = document.getElementById("reader-book-title");
    const readerContentBox = document.getElementById("reader-content-box");
    const readerTextBody = document.getElementById("reader-text-body");
    const readerThemeBtn = document.getElementById("reader-theme-btn");
    const readerExitBtn = document.getElementById("reader-exit-btn");
    const readerFontBtns = document.querySelectorAll("[data-font-size]");

    const libraryLink = document.getElementById("library-link");
    const authHeaderArea = document.getElementById("auth-header-area");

    const authModal = document.getElementById("auth-modal");
    const authForm = document.getElementById("auth-form");
    const authNameInput = document.getElementById("auth-name");
    const authPhoneInput = document.getElementById("auth-phone");
    const authNameError = document.getElementById("auth-name-error");
    const authPhoneError = document.getElementById("auth-phone-error");
    const authLoginHint = document.getElementById("auth-login-hint");
    const closeAuthBtn = document.getElementById("close-auth-btn");

    const categoriesBtn = document.getElementById("categories-btn");
    const categoriesDropdown = document.getElementById("categories-dropdown");
    const searchInput = document.getElementById("search-input");
    const categorySelect = document.getElementById("filter-category");
    const freeCheckbox = document.getElementById("filter-free");
    const sortSelect = document.getElementById("sort-select");
    const clearFiltersBtn = document.getElementById("clear-filters");
    const resultsCountText = document.getElementById("results-count");
    const noResultsMessage = document.getElementById("no-results-message");
    const backToListBtn = document.getElementById("back-to-list-btn");

    const categories = [...new Set(BOOKS_DATA.map((book) => book.category))];
    let currentView = "home";
    let currentDetailBookId = null;
    let activeReaderState = null;
    let lastModalTrigger = null;

    function applyReaderSettingsUI() {
        const fontSize = AppState.settings.fontSize || "medium";
        const theme = AppState.settings.theme || "light";

        readerContentBox.classList.remove(
            "font-small",
            "font-medium",
            "font-large",
        );
        readerContentBox.classList.add(`font-${fontSize}`);

        readerFontBtns.forEach((btn) => {
            const isSelected = btn.dataset.fontSize === fontSize;
            btn.classList.toggle("active", isSelected);
            btn.setAttribute("aria-pressed", String(isSelected));
        });

        const isDark = theme === "dark";
        readerContentBox.classList.toggle("theme-dark", isDark);
        readerThemeBtn.textContent = isDark ? "تم روشن" : "تم تیره";
    }

    function normalizeDigits(str) {
        const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
        const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
        return str.replace(/[۰-۹٠-٩]/g, (ch) => {
            const pIndex = persianDigits.indexOf(ch);
            if (pIndex !== -1) return String(pIndex);
            const aIndex = arabicDigits.indexOf(ch);
            if (aIndex !== -1) return String(aIndex);
            return ch;
        });
    }

    function syncUserUIState() {
        document.querySelectorAll(".card-fav-btn").forEach((btn) => {
            const id = btn.dataset.bookId;
            const isFav = AppState.favorites.includes(id);
            btn.classList.toggle("active", isFav);
            btn.textContent = isFav ? "♥" : "♡";
        });

        const detailFavBtn = document.getElementById("btn-fav");
        if (detailFavBtn && currentDetailBookId) {
            const isFav = AppState.favorites.includes(currentDetailBookId);
            detailFavBtn.textContent = isFav
                ? "حذف از علاقه‌مندی"
                : "افزودن به علاقه‌مندی";
            detailFavBtn.classList.toggle("active", isFav);
        }

        const detailBuyBtn = document.getElementById("btn-buy");
        if (detailBuyBtn && currentDetailBookId) {
            const detailBook = BOOKS_DATA.find(
                (b) => b.id === currentDetailBookId,
            );
            if (detailBook) {
                if (AppState.library.includes(detailBook.id)) {
                    detailBuyBtn.textContent = "موجود در کتابخانه";
                    detailBuyBtn.classList.add("in-library");
                } else {
                    detailBuyBtn.textContent =
                        detailBook.price === 0
                            ? "دریافت رایگان"
                            : `خرید (${detailBook.price} تومان)`;
                    detailBuyBtn.classList.remove("in-library");
                }
            }
        }

        if (currentView === "library") {
            renderLibraryPage();
        }
    }

    function updateHeaderAuthUI() {
        authHeaderArea.innerHTML = "";

        if (AppState.user) {
            const nameBadge = document.createElement("span");
            nameBadge.className = "user-badge";
            nameBadge.textContent = AppState.user.name;

            const logoutBtn = document.createElement("button");
            logoutBtn.type = "button";
            logoutBtn.className = "btn-logout";
            logoutBtn.textContent = "خروج";
            logoutBtn.addEventListener("click", () => {
                AppState.logout();
                updateHeaderAuthUI();
                syncUserUIState();
            });

            authHeaderArea.append(nameBadge, logoutBtn);
        } else {
            const loginBtn = document.createElement("button");
            loginBtn.type = "button";
            loginBtn.className = "btn-primary";
            loginBtn.textContent = "ورود / ثبت‌نام";
            loginBtn.addEventListener("click", () =>
                openAuthModal(false, loginBtn),
            );

            authHeaderArea.appendChild(loginBtn);
        }
    }

    function openAuthModal(showHint = false, triggerEl = null) {
        lastModalTrigger = triggerEl || document.activeElement;
        authNameError.textContent = "";
        authPhoneError.textContent = "";
        authNameInput.value = "";
        authPhoneInput.value = "";
        authLoginHint.style.display = showHint ? "block" : "none";
        authModal.style.display = "flex";
        authNameInput.focus();
    }

    function closeAuthModal() {
        authModal.style.display = "none";
        if (lastModalTrigger && typeof lastModalTrigger.focus === "function") {
            lastModalTrigger.focus();
        }
    }

    function handleToggleFavorite(bookId, triggerEl = null) {
        if (!AppState.user) {
            openAuthModal(true, triggerEl);
            return;
        }
        AppState.toggleFavorite(bookId);
        syncUserUIState();
    }

    function getCardOptions() {
        return {
            favorites: AppState.favorites,
            onToggleFavorite: handleToggleFavorite,
        };
    }

    function switchView(view) {
        currentView = view;
        bannerSection.style.display = "none";
        homeRowsContainer.style.display = "none";
        searchView.style.display = "none";
        bookDetailsView.style.display = "none";
        libraryView.style.display = "none";
        readerView.style.display = "none";

        if (view === "home") {
            bannerSection.style.display = "block";
            homeRowsContainer.style.display = "block";
        } else if (view === "search") {
            searchView.style.display = "block";
        } else if (view === "details") {
            bookDetailsView.style.display = "block";
        } else if (view === "library") {
            libraryView.style.display = "block";
        } else if (view === "reader") {
            readerView.style.display = "flex";
        }
    }

    function openBookReaderPage(bookId, mode = "sample", source = "details") {
        const book = BOOKS_DATA.find((b) => b.id === bookId);
        if (!book) {
            renderBookDetailsPage(bookId);
            return;
        }

        const isFullMode = mode === "full";
        const content = isFullMode ? book.fullText : book.sampleText;

        if (!isFullMode && (!content || !content.trim())) {
            renderBookDetailsPage(bookId);
            return;
        }

        activeReaderState = { bookId: book.id, mode, source };
        switchView("reader");
        applyReaderSettingsUI();

        readerModeBadge.textContent = isFullMode
            ? "مطالعه کتاب"
            : "نمونه مطالعه";
        readerBookTitle.textContent = `${book.title} — ${book.author}`;
        readerTextBody.textContent =
            content && content.trim()
                ? content
                : "متن کاملی برای این کتاب ثبت نشده است.";

        window.history.pushState(
            {},
            "",
            `index.html?reader=${encodeURIComponent(book.id)}&mode=${mode}`,
        );
        readerExitBtn.focus();
    }

    function exitBookReaderPage() {
        if (!activeReaderState) {
            renderHomePage();
            return;
        }

        const { bookId, source } = activeReaderState;
        activeReaderState = null;

        if (source === "library") {
            window.history.pushState({}, "", "index.html?view=library");
            renderLibraryPage();
        } else {
            window.history.pushState(
                {},
                "",
                `index.html?bookId=${encodeURIComponent(bookId)}`,
            );
            renderBookDetailsPage(bookId);
            const sampleBtn = document.getElementById("btn-sample");
            if (sampleBtn && !sampleBtn.disabled) {
                sampleBtn.focus();
            }
        }
    }

    function openCategoryList(categoryName) {
        FiltersState.query = "";
        FiltersState.category = categoryName;
        FiltersState.isFree = false;
        FiltersState.sort = "";
        FiltersState.preset = "";

        searchInput.value = "";
        categorySelect.value = categoryName;
        freeCheckbox.checked = false;
        sortSelect.value = "";

        categoriesDropdown.style.display = "none";
        categoriesBtn.setAttribute("aria-expanded", "false");

        const nextUrl = categoryName
            ? `index.html?category=${encodeURIComponent(categoryName)}`
            : "index.html?list=all";
        window.history.pushState({}, "", nextUrl);

        applyFiltersAndRender();
    }

    function initializeCategoriesUI() {
        categories.forEach((cat) => {
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });

        categoriesDropdown.innerHTML = "";
        const allItem = document.createElement("button");
        allItem.type = "button";
        allItem.className = "dropdown-item";
        allItem.textContent = "همه کتاب‌ها";
        allItem.addEventListener("click", () => openCategoryList(""));
        categoriesDropdown.appendChild(allItem);

        categories.forEach((cat) => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "dropdown-item";
            item.textContent = cat;
            item.addEventListener("click", () => openCategoryList(cat));
            categoriesDropdown.appendChild(item);
        });
    }

    function applyFiltersAndRender() {
        let results = [...BOOKS_DATA];

        if (FiltersState.preset === "suggested" && !FiltersState.sort) {
            results.sort((a, b) => b.rating - a.rating);
        } else if (FiltersState.preset === "new") {
            results = results.filter(
                (b) => b.category === "تاریخ" || b.category === "رمان",
            );
        }

        if (FiltersState.query.trim()) {
            const q = FiltersState.query.trim().toLowerCase();
            results = results.filter(
                (b) =>
                    b.title.toLowerCase().includes(q) ||
                    b.author.toLowerCase().includes(q),
            );
        }

        if (FiltersState.category) {
            results = results.filter(
                (b) => b.category === FiltersState.category,
            );
        }

        if (FiltersState.isFree) {
            results = results.filter((b) => b.price === 0);
        }

        if (FiltersState.sort === "price-asc") {
            results.sort((a, b) => a.price - b.price);
        } else if (FiltersState.sort === "price-desc") {
            results.sort((a, b) => b.price - a.price);
        } else if (FiltersState.sort === "rating-desc") {
            results.sort((a, b) => b.rating - a.rating);
        }

        switchView("search");
        const resultsContainerEl = document.getElementById(
            searchResultsContainer,
        );

        if (results.length > 0) {
            resultsContainerEl.style.display = "grid";
            noResultsMessage.style.display = "none";
            UI.renderBooksList(
                results,
                searchResultsContainer,
                getCardOptions(),
            );
        } else {
            resultsContainerEl.style.display = "none";
            noResultsMessage.style.display = "block";
        }

        resultsCountText.textContent = `تعداد نتایج: ${results.length} کتاب`;
    }

    function resetFilters() {
        FiltersState.query = "";
        FiltersState.category = "";
        FiltersState.isFree = false;
        FiltersState.sort = "";
        FiltersState.preset = "";

        searchInput.value = "";
        categorySelect.value = "";
        freeCheckbox.checked = false;
        sortSelect.value = "";

        window.history.pushState({}, "", "index.html?list=all");
        applyFiltersAndRender();
    }

    function renderHomePage() {
        switchView("home");
        homeRowsContainer.innerHTML = "";
        const cardOptions = getCardOptions();

        const suggestedBooks = [...BOOKS_DATA]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 6);
        UI.renderBookRow(
            "پیشنهادهای طاقچه",
            suggestedBooks,
            "home-rows-container",
            "suggested",
            cardOptions,
        );

        const freeBooks = BOOKS_DATA.filter((b) => b.price === 0);
        UI.renderBookRow(
            "کتاب‌های رایگان",
            freeBooks,
            "home-rows-container",
            "free",
            cardOptions,
        );

        const historyBooks = BOOKS_DATA.filter(
            (b) => b.category === "تاریخ" || b.category === "رمان",
        ).slice(0, 6);
        UI.renderBookRow(
            "تازه‌های رمان و تاریخ",
            historyBooks,
            "home-rows-container",
            "new",
            cardOptions,
        );
    }

    function renderLibraryPage() {
        switchView("library");
        const libraryBooks = AppState.user
            ? AppState.library
                  .map((id) => BOOKS_DATA.find((b) => b.id === id))
                  .filter(Boolean)
            : [];

        const favoriteBooks = AppState.user
            ? AppState.favorites
                  .map((id) => BOOKS_DATA.find((b) => b.id === id))
                  .filter(Boolean)
            : [];

        UI.renderLibraryView(libraryBooks, favoriteBooks, {
            favorites: AppState.favorites,
            onToggleFavorite: handleToggleFavorite,
            onOpenBook: (book) =>
                openBookReaderPage(book.id, "full", "library"),
            onBrowseBooks: resetFilters,
        });
    }

    function renderBookDetailsPage(bookId) {
        switchView("details");
        currentDetailBookId = bookId;
        const book = BOOKS_DATA.find((b) => b.id === bookId);

        if (!book) {
            UI.showBookNotFound();
            return;
        }

        UI.renderBookDetails(book);

        const relatedBooks = BOOKS_DATA.filter(
            (b) => b.category === book.category && b.id !== book.id,
        ).slice(0, 3);

        if (relatedBooks.length > 0) {
            UI.renderBookRow(
                "کتاب‌های مرتبط",
                relatedBooks,
                "related-books-container",
                "all",
                getCardOptions(),
            );
            const relatedSeeAll = document.querySelector(
                "#related-books-container .see-all-link",
            );
            if (relatedSeeAll) {
                relatedSeeAll.href = `index.html?category=${encodeURIComponent(book.category)}`;
            }
        }

        const favBtn = document.getElementById("btn-fav");
        const buyBtn = document.getElementById("btn-buy");
        const sampleBtn = document.getElementById("btn-sample");

        const updateFavBtnUI = () => {
            if (AppState.favorites.includes(book.id)) {
                favBtn.textContent = "حذف از علاقه‌مندی";
                favBtn.classList.add("active");
            } else {
                favBtn.textContent = "افزودن به علاقه‌مندی";
                favBtn.classList.remove("active");
            }
        };

        const updateBuyBtnUI = () => {
            if (AppState.library.includes(book.id)) {
                buyBtn.textContent = "موجود در کتابخانه";
                buyBtn.classList.add("in-library");
            } else {
                buyBtn.textContent =
                    book.price === 0
                        ? "دریافت رایگان"
                        : `خرید (${book.price} تومان)`;
                buyBtn.classList.remove("in-library");
            }
        };

        updateFavBtnUI();
        updateBuyBtnUI();

        favBtn.addEventListener("click", () => {
            handleToggleFavorite(book.id, favBtn);
        });

        buyBtn.addEventListener("click", () => {
            if (!AppState.user) {
                openAuthModal(true, buyBtn);
                return;
            }

            if (AppState.library.includes(book.id)) {
                alert("این کتاب قبلاً به کتابخانه شما اضافه شده است.");
                return;
            }

            if (book.price === 0) {
                AppState.addToLibrary(book.id);
                updateBuyBtnUI();
                alert("کتاب رایگان با موفقیت دریافت و به کتابخانه اضافه شد.");
            } else {
                const confirmed = confirm(
                    `آیا از خرید کتاب «${book.title}» به مبلغ ${book.price} تومان اطمینان دارید؟`,
                );
                if (confirmed) {
                    AppState.addToLibrary(book.id);
                    updateBuyBtnUI();
                    alert(
                        "خرید با موفقیت انجام شد و کتاب به کتابخانه شما اضافه گردید.",
                    );
                }
            }
        });

        if (!sampleBtn.disabled) {
            sampleBtn.addEventListener("click", () => {
                openBookReaderPage(book.id, "sample", "details");
            });
        }
    }

    readerFontBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            AppState.updateSettings({ fontSize: btn.dataset.fontSize });
            applyReaderSettingsUI();
        });
    });

    readerThemeBtn.addEventListener("click", () => {
        const nextTheme = AppState.settings.theme === "dark" ? "light" : "dark";
        AppState.updateSettings({ theme: nextTheme });
        applyReaderSettingsUI();
    });

    readerExitBtn.addEventListener("click", exitBookReaderPage);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (authModal.style.display !== "none") {
                closeAuthModal();
            } else if (categoriesDropdown.style.display !== "none") {
                categoriesDropdown.style.display = "none";
                categoriesBtn.setAttribute("aria-expanded", "false");
                categoriesBtn.focus();
            } else if (currentView === "reader") {
                exitBookReaderPage();
            }
        }
    });

    authForm.addEventListener("submit", (e) => {
        e.preventDefault();
        authNameError.textContent = "";
        authPhoneError.textContent = "";

        const displayName = authNameInput.value.trim();
        const rawPhone = authPhoneInput.value.trim();
        const normalizedPhone = normalizeDigits(rawPhone);

        let hasError = false;

        if (!displayName) {
            authNameError.textContent = "لطفاً نام نمایشی خود را وارد کنید.";
            hasError = true;
        }

        if (!/^09\d{9}$/.test(normalizedPhone)) {
            authPhoneError.textContent =
                "شماره موبایل باید دقیقاً ۱۱ رقم باشد و با ۰۹ شروع شود.";
            hasError = true;
        }

        if (hasError) return;

        const duplicateNameUser = AppState.users.find(
            (u) =>
                u.name.toLowerCase() === displayName.toLowerCase() &&
                u.phone !== normalizedPhone,
        );
        if (duplicateNameUser) {
            authNameError.textContent =
                "این نام نمایشی قبلاً توسط کاربر دیگری ثبت شده است.";
            hasError = true;
        }

        const duplicatePhoneUser = AppState.users.find(
            (u) =>
                u.phone === normalizedPhone &&
                u.name.toLowerCase() !== displayName.toLowerCase(),
        );
        if (duplicatePhoneUser) {
            authPhoneError.textContent =
                "این شماره موبایل قبلاً با نام دیگری ثبت شده است.";
            hasError = true;
        }

        if (hasError) return;

        AppState.login(displayName, normalizedPhone);
        updateHeaderAuthUI();
        syncUserUIState();
        closeAuthModal();
    });

    closeAuthBtn.addEventListener("click", closeAuthModal);
    authModal.addEventListener("click", (e) => {
        if (e.target === authModal) {
            closeAuthModal();
        }
    });

    libraryLink.addEventListener("click", (e) => {
        e.preventDefault();
        window.history.pushState({}, "", "index.html?view=library");
        renderLibraryPage();
    });

    const goHome = () => {
        FiltersState.query = "";
        FiltersState.category = "";
        FiltersState.isFree = false;
        FiltersState.sort = "";
        FiltersState.preset = "";
        currentDetailBookId = null;
        activeReaderState = null;

        searchInput.value = "";
        categorySelect.value = "";
        freeCheckbox.checked = false;
        sortSelect.value = "";
        categoriesDropdown.style.display = "none";
        categoriesBtn.setAttribute("aria-expanded", "false");

        if (window.location.search) {
            window.history.pushState({}, "", "index.html");
        }

        renderHomePage();
    };

    homeLogo.addEventListener("click", goHome);
    homeLogo.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goHome();
        }
    });

    categoriesBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isHidden = categoriesDropdown.style.display === "none";
        categoriesDropdown.style.display = isHidden ? "flex" : "none";
        categoriesBtn.setAttribute("aria-expanded", String(isHidden));
    });

    document.addEventListener("click", (e) => {
        if (
            !categoriesDropdown.contains(e.target) &&
            e.target !== categoriesBtn
        ) {
            categoriesDropdown.style.display = "none";
            categoriesBtn.setAttribute("aria-expanded", "false");
        }
    });

    searchInput.addEventListener("input", (e) => {
        FiltersState.query = e.target.value;
        applyFiltersAndRender();
    });

    categorySelect.addEventListener("change", (e) => {
        FiltersState.category = e.target.value;
        applyFiltersAndRender();
    });

    freeCheckbox.addEventListener("change", (e) => {
        FiltersState.isFree = e.target.checked;
        applyFiltersAndRender();
    });

    sortSelect.addEventListener("change", (e) => {
        FiltersState.sort = e.target.value;
        applyFiltersAndRender();
    });

    clearFiltersBtn.addEventListener("click", resetFilters);
    backToListBtn.addEventListener("click", resetFilters);

    initializeCategoriesUI();
    updateHeaderAuthUI();
    applyReaderSettingsUI();

    const urlParams = new URLSearchParams(window.location.search);
    const readerBookId = urlParams.get("reader");
    const readerMode = urlParams.get("mode") || "sample";
    const viewQuery = urlParams.get("view");
    const bookId = urlParams.get("bookId");
    const categoryQuery = urlParams.get("category");
    const listQuery = urlParams.get("list");

    if (readerBookId) {
        openBookReaderPage(
            readerBookId,
            readerMode,
            readerMode === "full" ? "library" : "details",
        );
    } else if (viewQuery === "library") {
        renderLibraryPage();
    } else if (bookId) {
        renderBookDetailsPage(bookId);
    } else if (categoryQuery) {
        FiltersState.category = categoryQuery;
        categorySelect.value = categoryQuery;
        applyFiltersAndRender();
    } else if (listQuery) {
        if (listQuery === "free") {
            FiltersState.isFree = true;
            freeCheckbox.checked = true;
        } else if (listQuery === "new") {
            FiltersState.preset = "new";
        } else if (listQuery === "suggested") {
            FiltersState.preset = "suggested";
            FiltersState.sort = "rating-desc";
            sortSelect.value = "rating-desc";
        }
        applyFiltersAndRender();
    } else {
        renderHomePage();
    }
});
