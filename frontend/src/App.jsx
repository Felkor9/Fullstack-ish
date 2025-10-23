import { useEffect, useState } from "react";
import "./App.css";

function App() {
	const [sections, setSections] = useState([]);
	const [products, setProducts] = useState([]);
	const [name, setName] = useState("");
	const [section, setSection] = useState(""); // section_id
	const [error, setError] = useState(null);

	// Hämta sektioner
	useEffect(() => {
		fetch("/api/sections")
			.then((res) => res.json())
			.then((data) => setSections(Array.isArray(data) ? data : []))
			.catch((err) => setError(err.message));
	}, []);

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

					<button type="submit" className="submit-btn">
						Lägg till
					</button>
				</form>
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
							</li>
						))
					)}
				</ul>
			</div>
		</div>
	);
}

export default App;
