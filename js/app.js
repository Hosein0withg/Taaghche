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

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get("bookId");
    const listQuery = urlParams.get("list");

    if (bookId) {
        console.log("Showing book details for:", bookId);
    } else if (listQuery) {
        console.log("Showing full list for:", listQuery);
    } else {
        const containerId = "home-rows-container";
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = "";

        const suggestedBooks = [...BOOKS_DATA].sort((a, b) => b.rating - a.rating).slice(0, 6);
        UI.renderBookRow("پیشنهادهای طاقچه", suggestedBooks, containerId, "suggested");

        const freeBooks = BOOKS_DATA.filter(b => b.price === 0);
        UI.renderBookRow("کتاب‌های رایگان", freeBooks, containerId, "free");

        const novelBooks = BOOKS_DATA.filter(b => b.category === "رمان").slice(0, 6);
        UI.renderBookRow("تازه‌های رمان", novelBooks, containerId, "new");
    }
});
