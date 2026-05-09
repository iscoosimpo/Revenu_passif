async function checkAllProducts() {
  const url = "https://xcahyjgldytyvtpguinj.supabase.co/rest/v1/products?select=*";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYWh5amdsZHl0eXZ0cGd1aW5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjg3NDcsImV4cCI6MjA5Mzg0NDc0N30.KWv5h_F-3UWfUpqUy7ahz0NrwpAmzDO_g5vz9G4swmg";
  
  try {
    const res = await fetch(url, {
      headers: { "apikey": key, "Authorization": `Bearer ${key}` }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
checkAllProducts();
