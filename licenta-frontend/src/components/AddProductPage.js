import React, { useState } from "react";
import "./AddProductPage.css";

const AddProductPage = () => {
    const [category, setCategory] = useState("Telefon");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [file, setFile] = useState(null);
    const [extraFields, setExtraFields] = useState({});

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        setExtraFields({});
    };

    const handleFieldChange = (field, value) => {
        setExtraFields((prev) => ({ ...prev, [field]: value }));
    };

    const getCategoryFields = () => {
        switch (category) {
            case "Telefon":
            case "Tabletă":
                return (
                    <>
                        <input
                            type="text"
                            placeholder="Memorie (ex: 128GB)"
                            onChange={(e) => handleFieldChange("memorie", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Cartelă SIM (ex: Nano SIM)"
                            onChange={(e) => handleFieldChange("sim", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Sistem de operare (ex: Android)"
                            onChange={(e) => handleFieldChange("os", e.target.value)}
                        />
                    </>
                );
            case "Laptop":
                return (
                    <>
                        <input
                            type="text"
                            placeholder="Procesor (ex: Intel i7)"
                            onChange={(e) => handleFieldChange("procesor", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Placă video (ex: NVIDIA RTX 3060)"
                            onChange={(e) => handleFieldChange("gpu", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Memorie RAM (ex: 16GB)"
                            onChange={(e) => handleFieldChange("ram", e.target.value)}
                        />
                    </>
                );
            default:
                return null;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("stock", stock);

        // Convertim categoria din string in enum-ul asteptat de backend (uppercase)
        let formattedCategory = category.toUpperCase();
        if (formattedCategory === "TABLETĂ") formattedCategory = "TABLETA";

        formData.append("categorie", formattedCategory);
        formData.append("details", JSON.stringify(extraFields));
        if (file) formData.append("image", file);

        fetch("http://localhost:8080/products/add", {
            method: "POST",
            body: formData,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Eroare la adăugare");
                return res.text();
            })
            .then((data) => alert(data))
            .catch((err) => alert("❌ " + err.message));
    };

    return (
        <div className="add-product-container">
            <h2>🛠️ Adaugă produs nou</h2>
            <form onSubmit={handleSubmit} className="add-product-form">
                <input
                    type="text"
                    placeholder="Nume produs"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Descriere suplimentară"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Preț (RON)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Stoc"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                />
                <select value={category} onChange={handleCategoryChange}>
                    <option value="Telefon">📱 Telefon</option>
                    <option value="Tabletă">📿 Tabletă</option>
                    <option value="Laptop">💻 Laptop</option>
                </select>
                {getCategoryFields()}
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <button type="submit" className="submit-button">
                    Adaugă
                </button>
            </form>
        </div>
    );
};

export default AddProductPage;
