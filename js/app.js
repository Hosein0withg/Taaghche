const AppState = {
    favorites: Storage.get("favorites", []),
    library: Storage.get("library", []), // Purchased or downloaded free books
    settings: Storage.get("settings", { theme: "light", fontSize: "medium" }),
    user: Storage.get("user", null),

    toggleFavorite: function(bookId) {
        const index = this.favorites.indexOf(bookId);
        if (index === -1) {
            this.favorites.push(bookId)
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
    },

    updateSettings: function(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        Storage.set("settings", this.settings);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    UI.renderBooksList(BOOKS_DATA, "books-container");
});
