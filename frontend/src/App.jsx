import { useEffect, useState } from "react";
import "./App.css";

function App() {
	const [sections, setSections] = useState([]);
	const [products, setProducts] = useState([]);
	const [name, setName] = useState("");
	const [sectionName, setSectionName] = useState("");
	const [section, setSection] = useState(""); // section_id
	const [reloadSections, setReloadSections] = useState(false);
	const [error, setError] = useState(null);
	const [isAddingSection, setIsAddingSection] = useState(false);
	const [isUpdatingProductVisible, setIsUpdatingProductVisible] = useState(false);
	const [updatedName, setUpdatedName] = useState("");
	const [selectedProductId, setSelectedProductId] = useState(null);

	// Hämta sektioner
	useEffect(() => {
		fetch("/api/sections")
			.then((res) => res.json())
			.then((data) => setSections(Array.isArray(data) ? data : []))
			.catch((err) => setError(err.message));
	}, [reloadSections]);

	const removeProduct = async (id) => {
		try {
			const res = await fetch("/api/products", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id }),
			});

			if (!res.ok) throw new Error("Kunde inte ta bort produkt");

			getProducts(); // uppdatera listan efter borttagning
		} catch (err) {
			setError(err.message);
		}
	};

	const updateProduct = async () => {
		try {
			const res = await fetch("/api/products", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: selectedProductId, name: updatedName }),
			});

			if (!res.ok) throw new Error("Kunde inte uppdatera produkt");
			setIsUpdatingProductVisible(false);
			setUpdatedName("");
			setSelectedProductId(null);
			getProducts(); // uppdatera listan efter uppdatering
		} catch (err) {
			setError(err.message);
		}
	};

	// Hämta produkter
	const getProducts = () => {
		fetch("/api/products")
			.then((res) => res.json())
			.then((data) => setProducts(Array.isArray(data) ? data : []))
			.catch((err) => setError(err.message));
	};

	useEffect(() => {
		getProducts();
	}, []);

	// Lägg till produkt
	const handleCreate = async () => {
		if (!name || !section) {
			setError("Vänligen fyll i produkt och avdelning.");
			return;
		}

		try {
			const res = await fetch("/api/products", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, section }),
			});

			if (!res.ok) throw new Error("Kunde inte lägga till produkt");

			setName("");
			setSection("");
			setError(null);
			getProducts(); // uppdatera listan
		} catch (err) {
			setError(err.message);
		}
	};

	const handleAddSection = async () => {
		if (!sectionName) {
			setError("Fyll i avdelning");
			return;
		}

		try {
			console.log("Adding section:", sectionName);
			const res = await fetch("/api/sections", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: sectionName }),
			});

			if (!res.ok) throw new Error("Kunde inte lägga till avdelning");

			setIsAddingSection(false);
			setSectionName("");
			setError(null);
			setReloadSections((prev) => !prev); // uppdatera sektioner
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className="container">
			<div className="formcard-container">
				<h1 className="heading">Lägg till i lista</h1>
				{error && <p style={{ color: "red" }}>Fel: {error}</p>}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleCreate();
					}}>
					<div className="input-group">
						<label>
							Produkt:
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Produkt"
								className="text-input-form"
							/>
						</label>
						<label>
							Avdelning:
							<select
								value={section}
								onChange={(e) => setSection(e.target.value ? Number(e.target.value) : "")}
								className="text-input-form">
								<option value="">Välj avdelning</option>
								{sections.map((sec) => (
									<option key={sec.id} value={sec.id}>
										{sec.name}
									</option>
								))}
							</select>
						</label>
					</div>
					<div className="btn-div">
						<button type="submit" className="submit-btn">
							Lägg till
						</button>
					</div>
				</form>
				<button className="add-btn" onClick={() => setIsAddingSection(true)}>
					Lägg till avdelning
				</button>
				{isAddingSection && (
					<div className="container-div" onClick={() => setIsAddingSection(false)}>
						<div className="holder-div" onClick={(e) => e.stopPropagation()}>
							<h1 className="heading">Lägg till avdelning</h1>
							<div className="input-group-section" onClick={(e) => e.stopPropagation()}>
								<input
									value={sectionName}
									onChange={(e) => setSectionName(e.target.value)}
									placeholder="Avdelning"
									type="text"
									className="text-input-form"
									onClick={(e) => e.stopPropagation()}
								/>
								<button type="button" className="addbtn" onClick={() => handleAddSection()}>
									Lägg till
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
			<div className="card">
				<h1 className="heading">Att handla</h1>
				<ul className="section-list">
					{products.length === 0 ? (
						<li>Inga produkter tillagda</li>
					) : (
						products.map((item) => (
							<li key={item.id} className="list-item">
								{item.name} – {item.section}
								<button className="btn-remove" onClick={() => removeProduct(item.id)}>
									Ta bort
								</button>
								<button
									onClick={() => {
										setSelectedProductId(item.id);
										setUpdatedName(item.name);
										setIsUpdatingProductVisible(true);
									}}
									className="btn-remove">
									Uppdatera
								</button>
							</li>
						))
					)}
				</ul>
				{isUpdatingProductVisible && (
					<div className="container-div" onClick={() => setIsUpdatingProductVisible(false)}>
						<div className="holder-div" onClick={(e) => e.stopPropagation()}>
							<h1 className="heading">Uppdatera produkt</h1>
							<div className="input-group-section" onClick={(e) => e.stopPropagation()}>
								<input
									value={updatedName}
									onChange={(e) => setUpdatedName(e.target.value)}
									placeholder="Ny produktnamn"
									type="text"
									className="text-input-form"
									onClick={(e) => e.stopPropagation()}
								/>
								<button type="button" className="addbtn" onClick={updateProduct}>
									Uppdatera
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default App;
