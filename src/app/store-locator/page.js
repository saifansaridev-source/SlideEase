import { getDb } from "@/lib/mongodb";

export const metadata = {
  title: "Store Locator | SlideEase Footwear",
  description: "Find SlideEase partner stores near you across India.",
};

export default async function StoreLocatorPage() {
  let stores = [];
  try {
    const db = await getDb();
    stores = await db.collection("stores").find({ active: true }).sort({ city: 1 }).toArray();
    stores = stores.map((s) => ({ ...s, _id: s._id.toString() }));
  } catch {}

  const cities = [...new Set(stores.map((s) => s.city))].sort();

  return (
    <div style={{ backgroundColor: "var(--bg-light)", minHeight: "90vh", paddingBottom: "5rem" }}>
      <section
        style={{
          background: "linear-gradient(135deg, var(--primary-color), #2d4a40)",
          padding: "3.5rem 1.5rem",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--accent-color)", display: "block", marginBottom: "0.4rem" }}>
          Find Us Near You
        </span>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.4rem", margin: "0 0 0.5rem" }}>
          Store Locator
        </h1>
        <p style={{ color: "rgba(255,255,255,0.8)", maxWidth: "540px", margin: "0 auto" }}>
          Visit a SlideEase partner boutique to try on your favourite handcrafted footwear in person.
        </p>
      </section>

      <div className="container" style={{ maxWidth: "1100px", margin: "3rem auto", padding: "0 1.5rem" }}>
        {stores.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", fontSize: "1.1rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏬</div>
            <p>No partner stores found. Check back soon as we expand across India.</p>
          </div>
        ) : (
          <>
            {cities.map((city) => (
              <div key={city} style={{ marginBottom: "3rem" }}>
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", color: "var(--primary-color)", borderBottom: "2px solid var(--accent-color)", paddingBottom: "0.5rem", marginBottom: "1.5rem" }}>
                  {city}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                  {stores.filter((s) => s.city === city).map((store) => (
                    <div key={store._id} className="checkout-card" style={{ padding: "1.5rem" }}>
                      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "var(--primary-color)", margin: "0 0 0.5rem" }}>
                        {store.name}
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.88rem", color: "var(--text-muted)" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <span>📍</span>
                          <span>{store.address}, {store.city}{store.state ? `, ${store.state}` : ""}</span>
                        </div>
                        {store.phone && (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <span>📞</span>
                            <a href={`tel:${store.phone}`} style={{ color: "var(--accent-dark)", fontWeight: 600 }}>{store.phone}</a>
                          </div>
                        )}
                        {store.hours && (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <span>🕐</span>
                            <span>{store.hours}</span>
                          </div>
                        )}
                      </div>
                      {store.lat && store.lng && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline"
                          style={{ marginTop: "1rem", display: "inline-block", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                        >
                          Get Directions →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
