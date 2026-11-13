const AppState = {
    favorites: Storage.get("favorites", []),
    library: Storage.get("library", []),
    settings: Storage.get("settings", { theme: "light", fontSize: "medium" }),
    user: Storage.get("user", null),

    toggleFavorite: function(bookId) {
        const index = this.favorites.indexOf(bookId);
        if (index === -1) {
            this.favorites.push(bookId);
        } else {
            this.favorites.splice(index, 1);
        }
        Storage.set("favorites", this.favorites);
    },

    addToLibrary: function(bookId) {
        if (!this.library.includes(bookId)) {
            this.library.push(bookId);
            Storage.set("library", this.library);
        }
    }
};

const FiltersState = {
    query: "",
    category: "",
    isFree: false,
    sort: ""
};

document.addEventListener("DOMContentLoaded", () => {
    const homeRowsContainer = document.getElementById("home-rows-container");
    const bannerSection = document.querySelector(".banner-section");
    const searchView = document.getElementById("search-view");
    const searchResultsContainer = "search-results-container";

    const searchInput = document.getElementById("search-input");
    const categorySelect = document.getElementById("filter-category");
    const freeCheckbox = document.getElementById("filter-free");
    const sortSelect = document.getElementById("sort-select");
    const clearFiltersBtn = document.getElementById("clear-filters");
    const resultsCountText = document.getElementById("results-count");
    const noResultsMessage = document.getElementById("no-results-message");
    const backToListBtn = document.getElementById("back-to-list-btn");
    const categoriesLink = document.getElementById("categories-link");

    function switchView(view) {
        if (view === "home") {
            homeRowsContainer.style.display = "block";
            bannerSection.style.display = "block";
            searchView.style.display = "none";
        } else if (view === "search") {
            homeRowsContainer.style.display = "none";
            bannerSection.style.display = "none";
            searchView.style.display = "block";
        }
    }

    function applyFiltersAndRender() {
        let results = [...BOOKS_DATA];

        if (FiltersState.query) {
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
            UI.renderBooksList(results, searchResultsContainer);
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

        searchInput.value = "";
        categorySelect.value = "";
        freeCheckbox.checked = false;
        sortSelect.value = "";

        applyFiltersAndRender();
    }

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

    categoriesLink.addEventListener("click", (e) => {
        e.preventDefault();
        resetFilters();
    });

    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get("bookId");
    const listQuery = urlParams.get("list");

    if (bookId) {
        console.log("Showing book details for:", bookId);
    } else if (listQuery) {
        switchView("search");
        if (listQuery === "free") {
            FiltersState.isFree = true;
            freeCheckbox.checked = true;
        } else if (listQuery === "new") {
            FiltersState.category = "رمان";
            categorySelect.value = "رمان";
        }
        applyFiltersAndRender();
    } else {
        switchView("home");
        homeRowsContainer.innerHTML = "";
        const suggestedBooks = [...BOOKS_DATA].sort((a, b) => b.rating - a.rating).slice(0, 6);
        UI.renderBookRow("پیشنهادهای طاقچه", suggestedBooks, "home-rows-container", "suggested");

        const freeBooks = BOOKS_DATA.filter(b => b.price === 0);
        UI.renderBookRow("کتاب‌های رایگان", freeBooks, "home-rows-container", "free");

        const historyBooks = BOOKS_DATA.filter(b => b.category === "تاریخ" || b.category === "رمان").slice(0, 6);
        UI.renderBookRow("تازه‌های رمان و تاریخ", historyBooks, "home-rows-container", "new");
    }
});
