const AppState = {
    user: Storage.get("user", null),
    users: Storage.get("users", []),
    favorites: [],
    library: [],
    settings: Storage.get("settings", { theme: "light", fontSize: "medium" }),

    initUserData: function() {
        if (this.user && this.user.phone) {
            this.favorites = Storage.get(`favorites_${this.user.phone}`, []);
            this.library = Storage.get(`library_${this.user.phone}`, []);
        } else {
            this.favorites = [];
            this.library = [];
        }
    },

    toggleFavorite: function(bookId) {
        if (!this.user) return;
        const index = this.favorites.indexOf(bookId);
        if (index === -1) {
            this.favorites.push(bookId);
        } else {
            this.favorites.splice(index, 1);
        }
        Storage.set(`favorites_${this.user.phone}`, this.favorites);
    },

    addToLibrary: function(bookId) {
        if (!this.user) return false;
        if (!this.library.includes(bookId)) {
            this.library.push(bookId);
            Storage.set(`library_${this.user.phone}`, this.library);
            return true;
        }
        return false;
    },

    login: function(name, phone) {
        const exists = this.users.some(u => u.phone === phone && u.name === name);
        if (!exists) {
            this.users.push({ name, phone });
            Storage.set("users", this.users);
        }
            this.user = { name, phone };
        Storage.set("user", this.user);
        this.initUserData();
    },

    logout: function() {
        this.user = null;
        Storage.set("user", null);
        this.favorites = [];
        this.library = [];
    }
};

AppState.initUserData();

const FiltersState = {
    query: "",
    category: "",
    isFree: false,
    sort: "",
    preset: ""
};

document.addEventListener("DOMContentLoaded", () => {
    const homeLogo = document.getElementById("home-logo");
    const bannerSection = document.getElementById("banner-section");
    const homeRowsContainer = document.getElementById("home-rows-container");
    const searchView = document.getElementById("search-view");
    const bookDetailsView = document.getElementById("book-details-view");
    const libraryView = document.getElementById("library-view");
    const searchResultsContainer = "search-results-container";

    const libraryLink = document.getElementById("library-link");
    const authHeaderArea = document.getElementById("auth-header-area");

    const sampleModal = document.getElementById("sample-modal");
    const sampleModalTitle = document.getElementById("sample-modal-title");
    const sampleModalBody = document.getElementById("sample-modal-body");
    const closeSampleBtn = document.getElementById("close-sample-btn");

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

    const categories = [...new Set(BOOKS_DATA.map(book => book.category))];
    let currentView = "home";
    let currentDetailBookId = null;

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
        document.querySelectorAll(".card-fav-btn").forEach(btn => {
            const id = btn.dataset.bookId;
            const isFav = AppState.favorites.includes(id);
            btn.classList.toggle("active", isFav);
            btn.textContent = isFav ? "♥" : "♡";
        });

        const detailFavBtn = document.getElementById("btn-fav");
        if (detailFavBtn && currentDetailBookId) {
            const isFav = AppState.favorites.includes(currentDetailBookId);
            detailFavBtn.textContent = isFav ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی";
            detailFavBtn.classList.toggle("active", isFav);
        }

        const detailBuyBtn = document.getElementById("btn-buy");
        if (detailBuyBtn && currentDetailBookId) {
            const detailBook = BOOKS_DATA.find(b => b.id === currentDetailBookId);
            if (detailBook) {
                if (AppState.library.includes(detailBook.id)) {
                    detailBuyBtn.textContent = "موجود در کتابخانه";
                    detailBuyBtn.classList.add("in-library");
                } else {
                    detailBuyBtn.textContent = detailBook.price === 0 ? "دریافت رایگان" : `خرید (${detailBook.price} تومان)`;
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
            loginBtn.addEventListener("click", () => openAuthModal(false));

            authHeaderArea.appendChild(loginBtn);
        }
    }

    function openAuthModal(showHint = false) {
        authNameError.textContent = "";
        authPhoneError.textContent = "";
        authNameInput.value = "";
        authPhoneInput.value = "";
        authLoginHint.style.display = showHint ? "block" : "none";
        authModal.style.display = "flex";
    }

    function closeAuthModal() {
        authModal.style.display = "none";
    }

    function handleToggleFavorite(bookId) {
        if (!AppState.user) {
            openAuthModal(true);
            return;
        }
        AppState.toggleFavorite(bookId);
        syncUserUIState();
    }

    function getCardOptions() {
        return {
            favorites: AppState.favorites,
            onToggleFavorite: handleToggleFavorite
        };
    }

    function switchView(view) {
        currentView = view;
        bannerSection.style.display = "none";
        homeRowsContainer.style.display = "none";
        searchView.style.display = "none";
        bookDetailsView.style.display = "none";
        libraryView.style.display = "none";

        if (view === "home") {
            bannerSection.style.display = "block";
            homeRowsContainer.style.display = "block";
        } else if (view === "search") {
            searchView.style.display = "block";
        } else if (view === "details") {
            bookDetailsView.style.display = "block";
        } else if (view === "library") {
            libraryView.style.display = "block";
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

        const nextUrl = categoryName
            ? `index.html?category=${encodeURIComponent(categoryName)}`
            : "index.html?list=all";
        window.history.pushState({}, "", nextUrl);

        applyFiltersAndRender();
    }

    function initializeCategoriesUI() {
        categories.forEach(cat => {
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

        categories.forEach(cat => {
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
            results = results.filter(b => b.category === "تاریخ" || b.category === "رمان");
        }

        if (FiltersState.query.trim()) {
            const q = FiltersState.query.trim().toLowerCase();
            results = results.filter(b =>
                b.title.toLowerCase().includes(q) ||
                b.author.toLowerCase().includes(q)
            );
        }

        if (FiltersState.category) {
            results = results.filter(b => b.category === FiltersState.category);
        }

        if (FiltersState.isFree) {
            results = results.filter(b => b.price === 0);
        }

        if (FiltersState.sort === "price-asc") {
            results.sort((a, b) => a.price - b.price);
        } else if (FiltersState.sort === "price-desc") {
            results.sort((a, b) => b.price - a.price);
        } else if (FiltersState.sort === "rating-desc") {
            results.sort((a, b) => b.rating - a.rating);
        }

        switchView("search");
        const resultsContainerEl = document.getElementById(searchResultsContainer);

        if (results.length > 0) {
            resultsContainerEl.style.display = "grid";
            noResultsMessage.style.display = "none";
            UI.renderBooksList(results, searchResultsContainer, getCardOptions());
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

        const suggestedBooks = [...BOOKS_DATA].sort((a, b) => b.rating - a.rating).slice(0, 6);
        UI.renderBookRow("پیشنهادهای طاقچه", suggestedBooks, "home-rows-container", "suggested", cardOptions);

        const freeBooks = BOOKS_DATA.filter(b => b.price === 0);
        UI.renderBookRow("کتاب‌های رایگان", freeBooks, "home-rows-container", "free", cardOptions);

        const historyBooks = BOOKS_DATA.filter(b => b.category === "تاریخ" || b.category === "رمان").slice(0, 6);
        UI.renderBookRow("تازه‌های رمان و تاریخ", historyBooks, "home-rows-container", "new", cardOptions);
    }

    function openBookReaderModal(book, isFullBook = false) {
        sampleModalTitle.textContent = isFullBook ? `مطالعه کتاب: ${book.title}` : `نمونه کتاب: ${book.title}`;
        sampleModalBody.textContent = book.sampleText || "متنی برای این کتاب ثبت نشده است.";
        sampleModal.style.display = "flex";
    }

    function closeSampleModal() {
        sampleModal.style.display = "none";
    }

    function renderLibraryPage() {
        switchView("library");
        const libraryBooks = AppState.user
            ? AppState.library.map(id => BOOKS_DATA.find(b => b.id === id)).filter(Boolean)
            : [];

        const favoriteBooks = AppState.user
            ? AppState.favorites.map(id => BOOKS_DATA.find(b => b.id === id)).filter(Boolean)
            : [];

        UI.renderLibraryView(libraryBooks, favoriteBooks, {
            favorites: AppState.favorites,
            onToggleFavorite: handleToggleFavorite,
            onOpenBook: (book) => openBookReaderModal(book, true),
            onBrowseBooks: resetFilters
        });
    }

    function renderBookDetailsPage(bookId) {
        switchView("details");
        currentDetailBookId = bookId;
        const book = BOOKS_DATA.find(b => b.id === bookId);

        if (!book) {
            UI.showBookNotFound();
            return;
        }

        UI.renderBookDetails(book);

        const relatedBooks = BOOKS_DATA
            .filter(b => b.category === book.category && b.id !== book.id)
            .slice(0, 3);

        if (relatedBooks.length > 0) {
            UI.renderBookRow("کتاب‌های مرتبط", relatedBooks, "related-books-container", "all", getCardOptions());
            const relatedSeeAll = document.querySelector("#related-books-container .see-all-link");
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
                buyBtn.textContent = book.price === 0 ? "دریافت رایگان" : `خرید (${book.price} تومان)`;
                buyBtn.classList.remove("in-library");
            }
        };

        updateFavBtnUI();
        updateBuyBtnUI();

        favBtn.addEventListener("click", () => {
            handleToggleFavorite(book.id);
        });

        buyBtn.addEventListener("click", () => {
            if (!AppState.user) {
                openAuthModal(true);
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
                const confirmed = confirm(`آیا از خرید کتاب «${book.title}» به مبلغ ${book.price} تومان اطمینان دارید؟`);
                if (confirmed) {
                    AppState.addToLibrary(book.id);
                    updateBuyBtnUI();
                    alert("خرید با موفقیت انجام شد و کتاب به کتابخانه شما اضافه گردید.");
                }
            }
        });

        sampleBtn.addEventListener("click", () => {
            openBookReaderModal(book, false);
        });
    }

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
            authPhoneError.textContent = "شماره موبایل باید دقیقاً ۱۱ رقم باشد و با ۰۹ شروع شود.";
            hasError = true;
        }

        if (hasError) return;

        const duplicateNameUser = AppState.users.find(
            u => u.name.toLowerCase() === displayName.toLowerCase() && u.phone !== normalizedPhone
        );
        if (duplicateNameUser) {
            authNameError.textContent = "این نام نمایشی قبلاً توسط کاربر دیگری ثبت شده است.";
            hasError = true;
        }

        const duplicatePhoneUser = AppState.users.find(
            u => u.phone === normalizedPhone && u.name.toLowerCase() !== displayName.toLowerCase()
        );
        if (duplicatePhoneUser) {
            authPhoneError.textContent = "این شماره موبایل قبلاً با نام دیگری ثبت شده است.";
            hasError = true;
        }

        if (hasError) return;

        AppState.login(displayName, normalizedPhone);
        updateHeaderAuthUI();
        syncUserUIState();
        closeAuthModal();
    });

    closeSampleBtn.addEventListener("click", closeSampleModal);
    sampleModal.addEventListener("click", (e) => {
        if (e.target === sampleModal) {
            closeSampleModal();
        }
    });

    libraryLink.addEventListener("click", (e) => {
        e.preventDefault();
        window.history.pushState({}, "", "index.html?view=library");
        renderLibraryPage();
    });

    homeLogo.addEventListener("click", () => {
        FiltersState.query = "";
        FiltersState.category = "";
        FiltersState.isFree = false;
        FiltersState.sort = "";
        FiltersState.preset = "";
        currentDetailBookId = null;

        searchInput.value = "";
        categorySelect.value = "";
        freeCheckbox.checked = false;
        sortSelect.value = "";
        categoriesDropdown.style.display = "none";

        if (window.location.search) {
            window.history.pushState({}, "", "index.html");
        }

        renderHomePage();
    });

    categoriesBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isHidden = categoriesDropdown.style.display === "none";
        categoriesDropdown.style.display = isHidden ? "flex" : "none";
    });

    document.addEventListener("click", (e) => {
        if (!categoriesDropdown.contains(e.target) && e.target !== categoriesBtn) {
            categoriesDropdown.style.display = "none";
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

    const urlParams = new URLSearchParams(window.location.search);
    const viewQuery = urlParams.get("view");
    const bookId = urlParams.get("bookId");
    const categoryQuery = urlParams.get("category");
    const listQuery = urlParams.get("list");

    if (viewQuery === "library") {
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
