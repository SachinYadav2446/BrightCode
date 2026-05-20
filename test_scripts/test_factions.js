async function test() {
  try {
    const res = await fetch('http://localhost:5051/factions');
    const data = await res.json();
    console.log("Factions:", data);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
